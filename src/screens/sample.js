// Sample.js
import React, { useState } from 'react';
import { SafeAreaView, View, Text, Button, Image, Linking, StyleSheet, Alert } from 'react-native';
import { loginToSpotify, getSpotifyProfile } from '../services/spotifyAuth';
import { getSpotifyProfile } from '../services/getSpotifyProfile';
import {triggerSpotifyPlayback} from '../services/trackPlayer';


const Sample = () => {
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(null);

  const handleAuthenticate = async () => {
    try {
      // 1. Get the token from the service
      const accessToken = await loginToSpotify();
      
      if (accessToken) {
        setToken(accessToken); 
        
        // 2. Fetch the profile using the new token
        const profileData = await getSpotifyProfile(accessToken);
        setProfile(profileData);
      }
    } catch (error) {
      console.log('Authentication Error:', error);
    }
  };

  const playSong = async () => {
    try {
      await triggerSpotifyPlayback(token);
      console.log('Playing song!');
    } catch (error) {
      console.log('Play Song Error:', error.response?.data || error.message);
      
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
        <Button title="Log in with Spotify" onPress={handleAuthenticate} />
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