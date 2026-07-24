import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/relocationsApi";
import { toast } from "../store/useToastStore";

const KEYS = {
  list: (q, filter) => ["relocations", { q, filter }],
  detail: (id) => ["relocations", id],
  escalations: ["escalations"],
  analytics: ["analytics", "summary"],
  cities: ["meta", "cities"],
  opsUsers: ["meta", "ops-users"],
};

export function useRelocations(q, filter) {
  return useQuery({
    queryKey: KEYS.list(q, filter),
    queryFn: () => api.fetchRelocations({ q, filter }),
    placeholderData: (prev) => prev,
  });
}

export function useRelocation(id) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => api.fetchRelocation(id),
    enabled: Boolean(id),
  });
}

export function useEscalations() {
  return useQuery({
    queryKey: KEYS.escalations,
    queryFn: api.fetchEscalations,
    refetchInterval: 60000,
  });
}

export function useAnalyticsSummary() {
  return useQuery({ queryKey: KEYS.analytics, queryFn: api.fetchAnalyticsSummary });
}

export function useCities() {
  return useQuery({ queryKey: KEYS.cities, queryFn: api.fetchCities, staleTime: Infinity });
}

export function useOpsUsers() {
  return useQuery({ queryKey: KEYS.opsUsers, queryFn: api.fetchOpsUsers, staleTime: Infinity });
}

function useInvalidateAll() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["relocations"] });
    qc.invalidateQueries({ queryKey: KEYS.escalations });
    qc.invalidateQueries({ queryKey: KEYS.analytics });
  };
}

export function useCreateRelocation() {
  const invalidateAll = useInvalidateAll();
  return useMutation({
    mutationFn: (payload) => api.createRelocation(payload),
    onSuccess: (data) => {
      invalidateAll();
      toast.success(`${data.customerName} added — ${data.id}`);
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useUpdateRelocation() {
  const invalidateAll = useInvalidateAll();
  return useMutation({
    mutationFn: ({ id, patch }) => api.updateRelocation(id, patch),
    onSuccess: invalidateAll,
    onError: (err) => toast.error(err.message),
  });
}

export function useDeleteRelocation() {
  const invalidateAll = useInvalidateAll();
  return useMutation({
    mutationFn: (id) => api.deleteRelocation(id),
    onSuccess: () => {
      invalidateAll();
      toast.success("Relocation deleted");
    },
    onError: (err) => toast.error(err.message),
  });
}

// Optimistic: checklist edits should feel instant even before the network
// round trip completes, and roll back cleanly if it fails.
export function useUpdateChecklistItem(relocationId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemKey, status, note, updatedBy }) =>
      api.updateChecklistItem(relocationId, itemKey, { status, note, updatedBy }),
    onMutate: async ({ itemKey, status, note }) => {
      await qc.cancelQueries({ queryKey: KEYS.detail(relocationId) });
      const previous = qc.getQueryData(KEYS.detail(relocationId));
      if (previous) {
        qc.setQueryData(KEYS.detail(relocationId), {
          ...previous,
          checklist: previous.checklist.map((i) =>
            i.key === itemKey ? { ...i, status, note: note ?? i.note, updatedAt: new Date().toISOString() } : i
          ),
        });
      }
      return { previous };
    },
    onError: (err, _vars, context) => {
      if (context?.previous) qc.setQueryData(KEYS.detail(relocationId), context.previous);
      toast.error(err.message);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: KEYS.detail(relocationId) });
      qc.invalidateQueries({ queryKey: ["relocations"] });
      qc.invalidateQueries({ queryKey: KEYS.escalations });
      qc.invalidateQueries({ queryKey: KEYS.analytics });
    },
  });
}

export function useApplySuggestions(relocationId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ suggestions, updatedBy }) => api.applySuggestions(relocationId, suggestions, updatedBy),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.detail(relocationId) });
      qc.invalidateQueries({ queryKey: ["relocations"] });
      qc.invalidateQueries({ queryKey: KEYS.escalations });
      qc.invalidateQueries({ queryKey: KEYS.analytics });
      toast.success("Checklist updated");
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useAcknowledgeEscalation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.acknowledgeEscalation(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.escalations }),
    onError: (err) => toast.error(err.message),
  });
}
