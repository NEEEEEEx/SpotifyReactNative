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
export const fetchPlaylistTracks = async (token, playlistId) => {
  console.log("DEBUG: Starting fetch for Playlist ID:", playlistId);

  try {
    // NOTE: Ensure this URL is correct. 
    // Official Spotify API is usually: https://api.spotify.com/v1/playlists/${playlistId}
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/items`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log("DEBUG: Response Status:", response.status, response.statusText);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("DEBUG: Response Error Body:", errorBody);
      throw new Error(`Failed to fetch playlist tracks: ${response.status}`);
    }

    const data = await response.json();
    console.log("DEBUG: Full Data Received:", data);

    // Verify the path to the items
    const tracks = data?.items || [];
    console.log(`DEBUG: Successfully parsed ${tracks.length} tracks.`);
    
    return tracks;
  } catch (error) {
    console.error("ERROR in fetchPlaylistTracks:", error.message);
    return []; 
  }
};
