import { create } from 'zustand';

export type QuickAddType = 'braindump' | 'task' | 'event' | 'note' | 'idea';

interface QuickAddState {
  quickAddType: QuickAddType | null;
  prefillContent: string;
}

interface QuickAddActions {
  openQuickAdd: (type: QuickAddType, content?: string) => void;
  closeQuickAdd: () => void;
}

export type QuickAddStore = QuickAddState & QuickAddActions;

export const useQuickAddStore = create<QuickAddStore>()((set) => ({
  quickAddType: null,
  prefillContent: '',

  openQuickAdd: (type, content = '') =>
    set({
      quickAddType: type,
      prefillContent: content,
    }),
  closeQuickAdd: () =>
    set({
      quickAddType: null,
      prefillContent: '',
    }),
}));
