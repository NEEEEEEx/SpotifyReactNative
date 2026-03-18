import React, { useState } from 'react';
import { SafeAreaView, View, Text, Button, FlatList, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { loginToSpotify } from '../services/spotifyAuth';
import { getRecentlyPlayed } from '../services/getRecentlyPlayed';
import { getYoutubeId } from '../services/trackPlayer';
import YoutubePlayer from "react-native-youtube-iframe";

const Sample = () => {
  const [token, setToken] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [playing, setPlaying] = useState(false);
  const [videoId, setVideoId] = useState(null);

  const handleLogin = async () => {
    try {
      const accessToken = await loginToSpotify();
      if (accessToken) {
        setToken(accessToken);
        const recentTracks = await getRecentlyPlayed(accessToken);
        setTracks(recentTracks);
      }
    } catch (error) {
      console.log('Login Error:', error);
    }
  };

  const playTrack = async (trackName, artistName) => {
    setPlaying(false); // Stop current song
    const id = await getYoutubeId(trackName, artistName);
    
    if (id) {
      setVideoId(id);
      setPlaying(true);
    } else {
      Alert.alert("Error", "Could not find a stream for this song.");
    }
  };

  const renderTrackItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.trackItem} 
      onPress={() => playTrack(item.name, item.artist)}
    >
      <Image source={{ uri: item.artwork }} style={styles.albumArt} />
      <View>
        <Text style={styles.trackName}>{item.name}</Text>
        <Text style={styles.artistName}>{item.artist}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {!token ? (
        <View style={styles.center}>
          <Text style={styles.title}>Spotify Vanilla</Text>
          <Button title="Login with Spotify" color="#1DB954" onPress={handleLogin} />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <FlatList
            data={tracks}
            keyExtractor={(item, index) => item.id + index.toString()}
            renderItem={renderTrackItem}
            ListHeaderComponent={
              <View style={styles.headerContainer}>
                <Text style={styles.header}>Recently Played</Text>
                <Button title="Stop Playback" color="#ff4444" onPress={() => setPlaying(false)} />
              </View>
            }
          />
        </View>
      )}

      {/* THE HIDDEN PLAYER BRIDGE */}
      <View style={styles.hiddenContainer}>
        <YoutubePlayer
          height={1}
          width={1}
          play={playing}
          videoId={videoId}
          onChangeState={(state) => {
            if (state === "ended") setPlaying(false);
          }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, color: 'white', fontWeight: 'bold', marginBottom: 20 },
  headerContainer: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  header: { fontSize: 22, color: 'white', fontWeight: 'bold' },
  trackItem: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 10, alignItems: 'center' },
  albumArt: { width: 50, height: 50, marginRight: 15, borderRadius: 4 },
  trackName: { color: 'white', fontSize: 16, fontWeight: '600' },
  artistName: { color: '#b3b3b3', fontSize: 14 },
  hiddenContainer: { position: 'absolute', bottom: 0, opacity: 0 }
});

export default Sample;