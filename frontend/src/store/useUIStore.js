import { create } from "zustand";

export const useUIStore = create((set) => ({
  searchQuery: "",
  activeFilter: "all",
  isAddModalOpen: false,
  confirmDialog: null, // { title, message, confirmLabel, onConfirm }
  isOffline: false,

  setSearchQuery: (q) => set({ searchQuery: q }),
  setActiveFilter: (f) => set((s) => ({ activeFilter: s.activeFilter === f ? "all" : f })),
  openAddModal: () => set({ isAddModalOpen: true }),
  closeAddModal: () => set({ isAddModalOpen: false }),
  openConfirmDialog: (config) => set({ confirmDialog: config }),
  closeConfirmDialog: () => set({ confirmDialog: null }),
  setOffline: (v) => set({ isOffline: v }),
}));
