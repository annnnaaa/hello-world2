import { create } from 'zustand';

export type QuickAddType =
  | 'braindump'
  | 'task'
  | 'event'
  | 'note'
  | 'idea'
  | null;

interface QuickAddState {
  quickAddType: QuickAddType;
  setQuickAddType: (type: QuickAddType) => void;
  close: () => void;
}

export const useQuickAddStore = create<QuickAddState>()((set) => ({
  quickAddType: null,
  setQuickAddType: (quickAddType) => set({ quickAddType }),
  close: () => set({ quickAddType: null }),
}));
