import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAuthStore = create(
  persist(
    set => ({
      isAuthenticated: false,
      token: null,
      user: null,

      login: (token, user) =>
        set({
          isAuthenticated: true,
          token,
          user,
        }),

      logout: () =>
        set({
          isAuthenticated: false,
          token: null,
          user: null,
        }),
    }),
    {
      name: 'auth-storage', // unique name for the storage
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
