import axios from 'axios';

export const triggerSpotifyPlayback = async (token) => {
  await axios.put(
    'https://api.spotify.com/v1/me/player/play',
    {
      uris: ['spotify:track:0HAciULA3lNbyp0kCBrJnC']
    },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
};
