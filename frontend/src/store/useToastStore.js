import { create } from "zustand";

let counter = 0;

export const useToastStore = create((set, get) => ({
  toasts: [],

  push: (message, variant = "info", duration = 4000) => {
    const id = ++counter;
    set((s) => ({ toasts: [...s.toasts, { id, message, variant }] }));
    if (duration) {
      setTimeout(() => get().dismiss(id), duration);
    }
    return id;
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (msg) => useToastStore.getState().push(msg, "success"),
  error: (msg) => useToastStore.getState().push(msg, "error", 6000),
  info: (msg) => useToastStore.getState().push(msg, "info"),
};
