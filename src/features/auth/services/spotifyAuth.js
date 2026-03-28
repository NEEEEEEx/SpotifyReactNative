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
dangerouslyAllowInsecureHttpRequests: true,
};

export const loginToSpotify = async () => {
  console.log('Initiating Spotify login...');
  const result = await authorize(spotifyAuthConfig);
  console.log(result);
  return result.accessToken;
};
