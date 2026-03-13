import React, { useState } from 'react';
import { SafeAreaView, View, Text, Button, Image, Linking, StyleSheet, Alert } from 'react-native';
import { authorize } from 'react-native-app-auth';
import axios from 'axios';
import { Client_ID } from '@env';

const CLIENT_ID = Client_ID;

const spotifyAuthConfig = {
  clientId: CLIENT_ID,
  redirectUrl: 'my-spotify-app://callback',
  // 1. ADDED 'user-modify-playback-state' so we have permission to play music
  scopes: ['user-read-private', 'user-read-email', 'user-modify-playback-state'],
  serviceConfiguration: {
    authorizationEndpoint: 'https://accounts.spotify.com/authorize',
    tokenEndpoint: 'https://accounts.spotify.com/api/token',
  },
};

const Sample = () => {
  const [profile, setProfile] = useState(null);
  // 2. ADDED token state to store the access token for later use
  const [token, setToken] = useState(null);

  const authenticate = async () => {
    try {
      const result = await authorize(spotifyAuthConfig);
      
      if (result.accessToken) {
        setToken(result.accessToken); // Save the token
        fetchProfile(result.accessToken);
      }
    } catch (error) {
      console.log('Authentication Error:', error);
    }
  };

  const fetchProfile = async (accessToken) => {
    try {
      const response = await axios.get("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setProfile(response.data);
    } catch (error) {
      console.log('Fetch Profile Error:', error.response?.data || error.message);
    }
  };

  // 3. ADDED function to play the specific track
  const playSong = async () => {
    try {
      await axios.put(
        'https://api.spotify.com/v1/me/player/play',
        {
          uris: ['spotify:track:0HAciULA3lNbyp0kCBrJnC'] // The track you requested
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      console.log('Playing song!');
    } catch (error) {
      console.log('Play Song Error:', error.response?.data || error.message);
      
      // If the user doesn't have an active Spotify session open, the API throws a 404
      if (error.response?.status === 404) {
        Alert.alert(
          "No Active Device", 
          "Please open the Spotify app on your phone or computer first so the API has a device to play on."
        );
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Display your Spotify profile data</Text>
      
      {!profile ? (
        <Button title="Log in with Spotify" onPress={authenticate} />
      ) : (
        <View style={styles.profileSection}>
          <Text style={styles.header}>Logged in as {profile.display_name}</Text>
          
          {profile.images && profile.images.length > 0 ? (
            <Image source={{ uri: profile.images[0].url }} style={styles.avatar} />
          ) : (
            <Text>(no profile image)</Text>
          )}
          
          <View style={styles.infoList}>
            <Text style={styles.infoText}>User ID: {profile.id}</Text>
            <Text style={styles.infoText}>Email: {profile.email}</Text>
            <Text 
              style={styles.link} 
              onPress={() => Linking.openURL(profile.external_urls.spotify)}>
              Open Spotify Profile
            </Text>
          </View>

          {/* 4. ADDED Button to play the song */}
          <View style={styles.buttonSpacer}>
            <Button title="Play Song" color="#1DB954" onPress={playSong} />
          </View>

        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  profileSection: {
    alignItems: 'center',
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  avatar: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 20,
  },
  infoList: {
    alignItems: 'flex-start',
    width: '100%',
    paddingHorizontal: 20,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 10,
  },
  link: {
    fontSize: 16,
    color: '#1DB954',
    textDecorationLine: 'underline',
    marginTop: 10,
  },
  buttonSpacer: {
    marginTop: 30,
    width: '80%',
  }
});

export default Sample;