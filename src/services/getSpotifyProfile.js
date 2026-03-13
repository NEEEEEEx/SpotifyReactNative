import axios from 'axios';


export const getSpotifyProfile = async (accessToken) => {
  const response = await axios.get("https://api.spotify.com/v1/me", {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return response.data;
};