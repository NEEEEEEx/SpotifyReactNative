import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView, View, Text, Button, FlatList, TouchableOpacity, 
  Image, StyleSheet, Alert, ActivityIndicator, Linking 
} from 'react-native';
import { WebView } from 'react-native-webview';

// Consolidated Imports
import { loginToSpotify } from '../services/spotifyAuth';
import { getSpotifyProfile } from '../services/getSpotifyProfile';
import { getRecentlyPlayed } from '../services/getRecentlyPlayed';
import { triggerSpotifyPlayback, getAdFreeStreamUrl } from '../services/trackPlayer';

const Sample = () => {
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAuthenticate = async () => {
    try {
      setLoading(true);
      const accessToken = await loginToSpotify();
      
      if (accessToken) {
        setToken(accessToken); 
        
        // Fetch Profile
        const profileData = await getSpotifyProfile(accessToken);
        setProfile(profileData);

        // Fetch Recently Played Tracks
        const recentTracks = await getRecentlyPlayed(accessToken);
        setTracks(recentTracks || []);
      }
    } catch (error) {
      console.log('Authentication Error:', error);
      Alert.alert("Auth Error", "Failed to sign in to Spotify");
    } finally {
      setLoading(false);
    }
  };

  const handlePlayTrack = async (item) => {
    setLoading(true);
    setAudioUrl(null); 
    
    // Logic from your "Stashed changes" version
    const url = await getAdFreeStreamUrl(item.name, item.artist);
    
    setLoading(false);
    if (url) {
      setAudioUrl(url);
    } else {
      Alert.alert("Error", "Could not find an audio stream.");
    }
  };

  const renderTrackItem = ({ item }) => (
    <TouchableOpacity style={styles.trackItem} onPress={() => handlePlayTrack(item)}>
      <Image source={{ uri: item.artwork }} style={styles.albumArt} />
      <View style={{ flex: 1 }}>
        <Text style={styles.trackName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.artistName}>{item.artist}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {!profile ? (
        <View style={styles.center}>
          <Text style={styles.title}>Spotify Profile & Player</Text>
          <Button title="Log in with Spotify" color="#1DB954" onPress={handleAuthenticate} />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {/* Profile Header Section */}
          <View style={styles.profileHeader}>
             {profile.images?.[0] && (
               <Image source={{ uri: profile.images[0].url }} style={styles.miniAvatar} />
             )}
             <View>
               <Text style={styles.header}>Hi, {profile.display_name}</Text>
               <Text style={styles.infoText} onPress={() => Linking.openURL(profile.external_urls.spotify)}>
                 View Full Profile
               </Text>
             </View>
          </View>

          {loading && <ActivityIndicator size="large" color="#1DB954" style={{ marginVertical: 20 }} />}
          
          <FlatList
            data={tracks}
            keyExtractor={(item, index) => (item.id || index).toString()}
            renderItem={renderTrackItem}
            ListHeaderComponent={
              <View style={styles.headerContainer}>
                <Text style={styles.subTitle}>Recently Played</Text>
                {audioUrl && <Button title="Stop" color="#ff4444" onPress={() => setAudioUrl(null)} />}
              </View>
            }
          />
        </View>
      )}

      {/* HIDDEN AUDIO PLAYER */}
      {audioUrl && (
        <View style={{ height: 0, width: 0, opacity: 0 }}>
          <WebView
            source={{ 
              html: `
                <html>
                  <body>
                    <audio id="player" autoplay playsinline>
                      <source src="${audioUrl}" type="audio/mpeg">
                    </audio>
                    <script>
                      var audio = document.getElementById('player');
                      audio.play(); 
                      audio.addEventListener('ended', () => { window.ReactNativeWebView.postMessage('ended'); });
                    </script>
                  </body>
                </html>
              ` 
            }}
            androidLayerType="software" // This bypasses GPU initialization issues on the A34
            style={{ flex: 1, opacity: 0.99 }}
            originWhitelist={['*']}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled={true}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, color: 'white', fontWeight: 'bold', marginBottom: 20 },
  profileHeader: { 
    flexDirection: 'row', 
    padding: 20, 
    alignItems: 'center', 
    borderBottomWidth: 1, 
    borderBottomColor: '#333' 
  },
  miniAvatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  headerContainer: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  header: { fontSize: 18, color: 'white', fontWeight: 'bold' },
  subTitle: { fontSize: 20, color: 'white', fontWeight: 'bold' },
  infoText: { color: '#1DB954', fontSize: 14, marginTop: 4 },
  trackItem: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 10, alignItems: 'center' },
  albumArt: { width: 50, height: 50, marginRight: 15, borderRadius: 4 },
  trackName: { color: 'white', fontSize: 16, fontWeight: '600' },
  artistName: { color: '#b3b3b3', fontSize: 14 }
});

export default Sample;