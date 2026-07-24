import { ALL_TEMPLATE_ITEMS } from "./checklistTemplate";

// Offline/no-backend fallback. Mirrors the shape the real API returns so
// every component works unmodified regardless of data source. Used
// automatically by src/api/relocationsApi.js when the backend can't be
// reached — never used silently instead of a reachable backend.
const KEY = "quickmove_relocations_v1";

function readAll() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

function freshChecklist() {
  const now = new Date().toISOString();
  return ALL_TEMPLATE_ITEMS.map((t) => ({
    key: t.key,
    group: t.group,
    label: t.label,
    status: "not_started",
    note: "",
    updatedAt: now,
    updatedBy: null,
    daysSinceUpdate: 0,
  }));
}

function makeId(list) {
  const d = new Date();
  const prefix = `QM-${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}`;
  const countThisMonth = list.filter((r) => r.id.startsWith(prefix)).length;
  return `${prefix}-${String(countThisMonth + 1).padStart(4, "0")}`;
}

function withDerived(r) {
  const items = r.checklist;
  const done = items.filter((i) => i.status === "done").length;
  const pct = items.length ? Math.round((done / items.length) * 100) : 0;
  const blockedCount = items.filter((i) => i.status === "blocked").length;
  const stalledCount = items.filter(
    (i) => i.status !== "done" && i.status !== "blocked" && (Date.now() - new Date(i.updatedAt).getTime()) / 86400000 > 3
  ).length;
  return { ...r, pct, blockedCount, stalledCount };
}

export const localStore = {
  list() {
    return readAll().map(withDerived);
  },

  get(id) {
    const found = readAll().find((r) => r.id === id);
    return found ? withDerived(found) : null;
  },

  create(payload) {
    const list = readAll();

    if (payload.originCity.toLowerCase() === payload.destCity.toLowerCase()) {
      throw new Error("Origin and destination city cannot be the same");
    }
    const moveDate = new Date(payload.moveDate);
    if (Number.isNaN(moveDate.getTime())) throw new Error("Move date is invalid");
    if (moveDate.getTime() < Date.now() - 86400000) throw new Error("Move date can't be in the past");

    const duplicate = list.find(
      (r) =>
        r.customerName.toLowerCase() === payload.customerName.trim().toLowerCase() &&
        new Date(r.moveDate).toDateString() === moveDate.toDateString() &&
        r.status !== "cancelled"
    );
    if (duplicate) throw new Error(`${payload.customerName} already has a relocation (${duplicate.id}) on this date.`);

    const record = {
      id: makeId(list),
      customerName: payload.customerName.trim(),
      customerPhone: payload.customerPhone || null,
      origin: payload.originCity,
      dest: payload.destCity,
      moveDate: moveDate.toISOString(),
      owner: payload.opsOwner,
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      checklist: freshChecklist(),
    };
    writeAll([record, ...list]);
    return withDerived(record);
  },

  update(id, patch) {
    const list = readAll();
    const idx = list.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error("Relocation not found");
    list[idx] = { ...list[idx], ...patch, updatedAt: new Date().toISOString() };
    writeAll(list);
    return withDerived(list[idx]);
  },

  remove(id) {
    const list = readAll();
    writeAll(list.filter((r) => r.id !== id));
  },

  updateChecklistItem(id, itemKey, { status, note, updatedBy }) {
    const list = readAll();
    const idx = list.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error("Relocation not found");
    const checklist = list[idx].checklist.map((item) =>
      item.key === itemKey
        ? { ...item, status, note: note ?? item.note, updatedBy: updatedBy ?? item.updatedBy, updatedAt: new Date().toISOString() }
        : item
    );
    list[idx] = { ...list[idx], checklist, updatedAt: new Date().toISOString() };
    writeAll(list);
    return withDerived(list[idx]);
  },

  applySuggestions(id, suggestions, updatedBy) {
    const list = readAll();
    const idx = list.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error("Relocation not found");
    const now = new Date().toISOString();
    const checklist = list[idx].checklist.map((item) => {
      const match = suggestions.find((s) => s.key === item.key);
      return match ? { ...item, status: match.status, note: match.note ?? item.note, updatedBy, updatedAt: now } : item;
    });
    list[idx] = { ...list[idx], checklist, updatedAt: now };
    writeAll(list);
    return withDerived(list[idx]);
  },

  escalations() {
    const rows = [];
    for (const r of this.list()) {
      for (const item of r.checklist) {
        if (item.status === "blocked") {
          rows.push({ id: `${r.id}:${item.key}:blocked`, relocationId: r.id, customerName: r.customerName, type: "blocked", itemLabel: item.label, group: item.group, openedAt: item.updatedAt });
        } else if (item.status !== "done" && (Date.now() - new Date(item.updatedAt).getTime()) / 86400000 > 3) {
          rows.push({ id: `${r.id}:${item.key}:stalled`, relocationId: r.id, customerName: r.customerName, type: "stalled", itemLabel: item.label, group: item.group, openedAt: item.updatedAt });
        }
      }
    }
    return rows;
  },

  summary() {
    const list = this.list();
    let active = 0, completed = 0, blocked = 0, stalled = 0;
    for (const r of list) {
      if (r.status === "completed" || r.pct === 100) completed += 1;
      else if (r.status === "active") active += 1;
      if (r.blockedCount > 0) blocked += 1;
      if (r.stalledCount > 0) stalled += 1;
    }
    return { total: list.length, active, completed, blocked, stalled, avgCycleTimeDays: null, byDestCity: {} };
  },
};
