import { useMutation } from "@tanstack/react-query";
import * as api from "../api/relocationsApi";

export function useParseUpdate(relocationId) {
  return useMutation({
    mutationFn: (text) => api.parseUpdate(relocationId, text),
  });
}

export function useDraftMessage(relocationId) {
  return useMutation({
    mutationFn: () => api.draftMessage(relocationId),
  });
}
