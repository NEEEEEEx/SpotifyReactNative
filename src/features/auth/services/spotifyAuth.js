// spotifyService.js
import { authorize } from 'react-native-app-auth';
import { Client_ID } from '@env';

const CLIENT_ID = Client_ID;

const spotifyAuthConfig = {
  clientId: CLIENT_ID,
  redirectUrl: 'my-spotify-app://callback',
  scopes: [
    'user-read-private',
    'user-read-email',
    'user-modify-playback-state',
    'user-library-read',
    'user-follow-read',
    'playlist-read-private',
    'playlist-read-collaborative',
    'user-read-recently-played',
  ],
  serviceConfiguration: {
    authorizationEndpoint: 'https://accounts.spotify.com/authorize',
    tokenEndpoint: 'https://accounts.spotify.com/api/token',
  },
};

export const loginToSpotify = async () => {
  const result = await authorize(spotifyAuthConfig);
  return result.accessToken;
};
