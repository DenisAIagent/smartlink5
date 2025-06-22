import { create } from 'zustand';

export const useAdsDataStore = create((set) => ({
  selectedAccountId: null,
  setSelectedAccountId: (id) => set({ selectedAccountId: id }),
})); 