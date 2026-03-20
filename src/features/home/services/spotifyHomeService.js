// features/home/services/spotifyHomeService.js

const BASE_URL = 'https://api.spotify.com/v1';

export const fetchUserPlaylists = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}/me/playlists?limit=10`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error fetching playlists:', error);
    return [];
  }
};

export const fetchRecentlyPlayed = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}/me/player/recently-played?limit=10`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error fetching recently played:', error);
    return [];
  }
};