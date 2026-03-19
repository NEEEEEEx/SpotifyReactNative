import { create } from 'zustand';

export const useAuthStore = create(set => ({
  isAuthenticated: false,
  token: null,
  user: null,

  login: (token, user) => set({ isAuthenticated: true, token, user }),

  logout: () => set({ isAuthenticated: false, token: null, user: null }),
}));
