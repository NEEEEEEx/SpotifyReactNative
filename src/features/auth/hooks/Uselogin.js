import { useState } from 'react';
import { useAuthStore } from '../../../app/store/authStore';
import { loginToSpotify } from './spotifyService'; // Ensure this path is correct

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const login = useAuthStore(s => s.login);

  const handleSpotifyLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Call the Spotify Auth Service
      const token = await loginToSpotify();

      // 2. Define a user object (usually you'd fetch user details from /me after getting the token)
      const user = { 
        id: 'spotify_user', 
        type: 'spotify' 
      };

      // 3. Update your global store
      login(token, user);
    } catch (err) {
      // Handle "User cancelled" or network errors
      setError(err?.message || 'Spotify login failed.');
      console.error('Spotify Auth Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
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

  return { 
    handleSpotifyLogin, // Replaced handleLogin with Spotify logic
    handleGuestLogin, 
    isLoading, 
    error 
  };
};