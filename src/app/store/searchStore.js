import { create } from 'zustand';
import { searchTracks } from '../../features/search/services/searchService';

export const useSearchStore = create(set => ({
  results: [],
  loading: false,

  search: async query => {
    set({ loading: true });
    try {
      const data = await searchTracks(query);
      set({ results: data, loading: false });
    } catch (e) {
      console.log(e);
      set({ loading: false });
    }
  },
}));
