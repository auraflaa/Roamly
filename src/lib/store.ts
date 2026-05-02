import { create } from 'zustand';

interface ThemeStore {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: 'dark',
  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined') {
        localStorage.setItem('roamly-theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
      }
      return { theme: newTheme };
    }),
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('roamly-theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
    }
    set({ theme });
  },
}));

interface ExploreFilters {
  vibes: string[];
  mode: string | null;
  minRating: number;
  searchQuery: string;
}

interface ExploreStore {
  filters: ExploreFilters;
  setVibeFilter: (vibes: string[]) => void;
  setModeFilter: (mode: string | null) => void;
  setMinRating: (rating: number) => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
}

const defaultFilters: ExploreFilters = {
  vibes: [],
  mode: null,
  minRating: 0,
  searchQuery: '',
};

export const useExploreStore = create<ExploreStore>((set) => ({
  filters: defaultFilters,
  setVibeFilter: (vibes) => set((state) => ({ filters: { ...state.filters, vibes } })),
  setModeFilter: (mode) => set((state) => ({ filters: { ...state.filters, mode } })),
  setMinRating: (rating) => set((state) => ({ filters: { ...state.filters, minRating: rating } })),
  setSearchQuery: (query) => set((state) => ({ filters: { ...state.filters, searchQuery: query } })),
  resetFilters: () => set({ filters: defaultFilters }),
}));
