import { create } from 'zustand';
import { persist } from 'zustand/middleware';






interface SeenAssignmentsState {
  seenSessionIds: number[];
  markSeen: (ids: number[]) => void;
}

export const useSeenAssignmentsStore = create<SeenAssignmentsState>()(
  persist(
    (set, get) => ({
      seenSessionIds: [],
      markSeen: (ids) => {
        if (ids.length === 0) return;
        set({ seenSessionIds: Array.from(new Set([...get().seenSessionIds, ...ids])) });
      },
    }),
    { name: 'training-platform-seen-assignments' },
  ),
);
