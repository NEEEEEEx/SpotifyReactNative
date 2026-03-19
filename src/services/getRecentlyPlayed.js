import axios from 'axios';

export const getRecentlyPlayed = async (accessToken) => {
  try {
    const response = await axios.get("https://api.spotify.com/v1/me/player/recently-played", {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { limit: 10 } 
    });
    
    // Clean up the data so it's easy to use in our app
    return response.data.items.map(item => ({
      id: item.track.id,
      name: item.track.name,
      artist: item.track.artists[0].name,
      artwork: item.track.album.images[0]?.url
    }));
  } catch (error) {
    console.error("Error fetching recently played:", error);
    return [];
  }
};