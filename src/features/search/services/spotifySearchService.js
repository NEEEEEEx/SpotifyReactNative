// features/search/services/spotifySearchService.js

// Using standard Spotify API base URL
const BASE_URL = 'https://api.spotify.com/v1';

export const searchTracks = async (token, query, limit = 15) => {
  if (!query) return [];

  try {
    const response = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(query)}&type=track`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("DEBUG: Search Error Body:", errorBody);
      throw new Error(`Search failed with status: ${response.status}`);
    }

    const data = await response.json();
    return data.tracks?.items || [];
  } catch (error) {
    console.error('Error fetching search results:', error);
    return [];
  }
};