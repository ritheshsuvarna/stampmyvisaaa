import { httpClient, isNetworkError, apiErrorMessage } from "./httpClient";
import { localStore } from "../lib/localStore";
import { CITIES, OPS_TEAM } from "../lib/checklistTemplate";
import { useUIStore } from "../store/useUIStore";

// Every read/write goes through the real backend first. If the backend is
// unreachable (network error — server down, no connection), we transparently
// fall back to localStorage so the app keeps working, and flag `isOffline`
// so the UI can say so. A reachable backend that returns a real error
// (validation, 409, etc.) is NOT a fallback case — that error surfaces as-is.
function markOnline() {
  if (useUIStore.getState().isOffline) useUIStore.getState().setOffline(false);
}
function markOffline() {
  if (!useUIStore.getState().isOffline) useUIStore.getState().setOffline(true);
}

async function withFallback(remoteFn, localFn) {
  try {
    const result = await remoteFn();
    markOnline();
    return result;
  } catch (err) {
    if (isNetworkError(err)) {
      markOffline();
      return localFn();
    }
    throw new Error(apiErrorMessage(err));
  }
}

export async function fetchRelocations({ q, filter } = {}) {
  return withFallback(
    async () => {
      const { data } = await httpClient.get("/relocations", { params: { q, filter } });
      return data.data;
    },
    () => {
      let results = localStore.list();
      if (q) {
        const needle = q.toLowerCase();
        results = results.filter(
          (r) =>
            r.customerName.toLowerCase().includes(needle) ||
            r.id.toLowerCase().includes(needle) ||
            r.origin.toLowerCase().includes(needle) ||
            r.dest.toLowerCase().includes(needle) ||
            r.owner.toLowerCase().includes(needle)
        );
      }
      if (filter && filter !== "all") {
        const now = Date.now();
        results = results.filter((r) => {
          switch (filter) {
            case "blocked":
              return r.blockedCount > 0;
            case "stalled":
              return r.stalledCount > 0;
            case "active":
              return r.status === "active";
            case "completed":
              return r.status === "completed" || r.pct === 100;
            case "upcoming":
              return r.status === "active" && new Date(r.moveDate).getTime() - now < 7 * 86400000 && new Date(r.moveDate).getTime() > now;
            default:
              return true;
          }
        });
      }
      return results;
    }
  );
}

export async function fetchRelocation(id) {
  return withFallback(
    async () => {
      const { data } = await httpClient.get(`/relocations/${id}`);
      return data.data;
    },
    () => {
      const r = localStore.get(id);
      if (!r) throw new Error("Relocation not found");
      return r;
    }
  );
}

export async function createRelocation(payload) {
  return withFallback(
    async () => {
      const { data } = await httpClient.post("/relocations", payload);
      return data.data;
    },
    () => localStore.create(payload)
  );
}

export async function updateRelocation(id, patch) {
  return withFallback(
    async () => {
      const { data } = await httpClient.patch(`/relocations/${id}`, patch);
      return data.data;
    },
    () => localStore.update(id, patch)
  );
}

export async function deleteRelocation(id) {
  return withFallback(
    async () => {
      await httpClient.delete(`/relocations/${id}`);
      return true;
    },
    () => {
      localStore.remove(id);
      return true;
    }
  );
}

export async function updateChecklistItem(id, itemKey, body) {
  return withFallback(
    async () => {
      const { data } = await httpClient.patch(`/relocations/${id}/checklist/${itemKey}`, body);
      return data.data;
    },
    () => localStore.updateChecklistItem(id, itemKey, body)
  );
}

export async function applySuggestions(id, suggestions, updatedBy) {
  return withFallback(
    async () => {
      const { data } = await httpClient.post(`/relocations/${id}/checklist/apply-suggestions`, { suggestions, updatedBy });
      return data.data;
    },
    () => localStore.applySuggestions(id, suggestions, updatedBy)
  );
}

export async function fetchEscalations() {
  return withFallback(
    async () => {
      const { data } = await httpClient.get("/escalations");
      return data.data;
    },
    () => localStore.escalations()
  );
}

export async function acknowledgeEscalation(id) {
  return withFallback(
    async () => {
      const { data } = await httpClient.post(`/escalations/${id}/acknowledge`, {});
      return data.data;
    },
    () => ({ id, acknowledgedBy: "ops" })
  );
}

export async function fetchAnalyticsSummary() {
  return withFallback(
    async () => {
      const { data } = await httpClient.get("/analytics/summary");
      return data.data;
    },
    () => localStore.summary()
  );
}

export async function fetchCities() {
  return withFallback(
    async () => {
      const { data } = await httpClient.get("/meta/cities");
      return data.data;
    },
    () => CITIES
  );
}

export async function fetchOpsUsers() {
  return withFallback(
    async () => {
      const { data } = await httpClient.get("/meta/ops-users");
      return data.data;
    },
    () => OPS_TEAM
  );
}

// AI calls require the backend — no meaningful offline fallback exists.
// Network/unconfigured/parse failures all surface as thrown Errors with a
// friendly message for the caller to display.
export async function parseUpdate(id, text) {
  try {
    const { data } = await httpClient.post(`/ai/relocations/${id}/parse-update`, { text });
    return data.data.suggestions;
  } catch (err) {
    if (isNetworkError(err)) throw new Error("Can't reach the server to run AI parsing right now.");
    throw new Error(apiErrorMessage(err, "Couldn't parse that update."));
  }
}

export async function draftMessage(id) {
  try {
    const { data } = await httpClient.post(`/ai/relocations/${id}/draft-message`, {});
    return data.data.message;
  } catch (err) {
    if (isNetworkError(err)) throw new Error("Can't reach the server to draft a message right now.");
    throw new Error(apiErrorMessage(err, "Couldn't draft a message right now."));
  }
}
