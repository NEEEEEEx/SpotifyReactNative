import { useState } from 'react';
import { useAuthStore } from '../../../app/store/authStore';

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const login = useAuthStore(s => s.login);

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate API call for guest session
      await new Promise(r => setTimeout(r, 800));

      const guestToken = 'guest-jwt-token';
      const guestUser = {
        id: 'guest_001',
        email: 'guest@example.com',
        isGuest: true,
      };

      login(guestToken, guestUser);
    } catch (err) {
      setError('Guest access failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      // Replace with your real auth service call:
      // const { token, user } = await authService.login(email, password);

      // --- Mock response ---
      await new Promise(r => setTimeout(r, 800));
      const token = 'mock-jwt-token';
      const user = { id: '1', email };
      // ---------------------

      login(token, user);
    } catch (err) {
      setError(err?.message ?? 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return { handleLogin, handleGuestLogin, isLoading, error };
};
