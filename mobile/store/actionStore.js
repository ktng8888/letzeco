import { create } from 'zustand';

const useActionStore = create((set) => ({
  // Currently in-progress action (if any)
  currentAction: null,

  setCurrentAction: (action) => set({ currentAction: action }),
  clearCurrentAction: () => set({ currentAction: null }),
}));

export default useActionStore;