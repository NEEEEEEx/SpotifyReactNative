import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  StatusBar,
  Alert,
  Image,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { WebView } from 'react-native-webview';

// Hooks & Stores
import { useAuthStore } from '../../../app/store/authStore';

// Services
import { 
  fetchUserPlaylists, 
  fetchRecentlyPlayed, 
  fetchPlaylistTracks 
} from '../services/spotifyHomeService';
import { getAdFreeStreamUrl } from '../services/trackPlayer'; 

// ─── Theme ────────────────────────────────────────────────────────────────────
const C = {
  green: '#1DB954',
  bg: '#121212',
  surface2: '#282828',
  text: '#FFFFFF',
  muted: '#B3B3B3',
  danger: '#ff4444',
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

const filterDuplicates = (array, keyExtractor) => {
  const seen = new Set();
  return array.filter(item => {
    const key = keyExtractor(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const AlbumCard = ({ title, sub, imageUrl, onPress, colors = ['#282828', '#121212'], size = 140 }) => (
  <View style={{ marginRight: 16, width: size }}>
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <View style={[styles.albumArtContainer, { width: size, height: size }]}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.fullImage} />
        ) : (
          <LinearGradient colors={colors} style={styles.fullImage} />
        )}
        <View style={styles.playOverlay}>
          <View style={styles.playBtn}>
            <MaterialIcons name="play-arrow" size={24} color="#000" />
          </View>
        </View>
      </View>
      <Text style={styles.cardTitle} numberOfLines={1}>{title}</Text>
      <Text style={styles.cardSub} numberOfLines={1}>{sub}</Text>
    </TouchableOpacity>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export const HomeScreen = () => {
  const [playlists, setPlaylists] = useState([]);
  const [recentTracks, setRecentTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Audio Player State
  const [audioUrl, setAudioUrl] = useState(null);
  const [playerLoading, setPlayerLoading] = useState(false);
  const [currentPlayingTitle, setCurrentPlayingTitle] = useState('');

  // Modal & Playlist Details State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [isLoadingModal, setIsLoadingModal] = useState(false);

  const user = useAuthStore(state => state.user);
  const token = useAuthStore(state => state.token);
  const logout = useAuthStore(state => state.logout);

  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (user?.isGuest || !token) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        if (isMounted) setIsLoading(true);
        
        const [playlistData, recentData] = await Promise.all([
          fetchUserPlaylists(token),
          fetchRecentlyPlayed(token),
        ]);

        if (isMounted) {
          // Filter duplicates from the raw API response
          const uniquePlaylists = filterDuplicates(playlistData || [], item => item.id);
          const uniqueRecent = filterDuplicates(recentData || [], item => item.track?.id);

          // FILTER: Only keep playlists where the owner's ID matches the current user's ID
          const userOwnedPlaylists = uniquePlaylists.filter(
            playlist => playlist.owner?.id === user?.id
          );

          setPlaylists(userOwnedPlaylists);
          setRecentTracks(uniqueRecent);
        }
      } catch (err) {
        console.error("Home Data Fetch Error:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();

    return () => { isMounted = false; };
  }, [token, user?.id]); // Added user?.id to trigger re-filter if user object loads late

  const handleLogout = () => {
    Alert.alert('Logout', 'Return to login screen?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const handlePlayTrack = async (trackName, artistName) => {
    if (!trackName) return;
    
    setPlayerLoading(true);
    setAudioUrl(null); 
    setCurrentPlayingTitle(trackName);
    
    try {
      const url = await getAdFreeStreamUrl(trackName, artistName || '');
      
      if (url) {
        setAudioUrl(url);
      } else {
        Alert.alert("Error", "Could not find an audio stream.");
        setCurrentPlayingTitle('');
      }
    } catch (error) {
      console.error("Play Track Error:", error);
      Alert.alert("Error", "Failed to play the track.");
      setCurrentPlayingTitle('');
    } finally {
      setPlayerLoading(false);
    }
  };

  // Open the playlist modal and fetch its tracks using the service
  const handleOpenPlaylist = async (playlist) => {
    setSelectedPlaylist(playlist);
    setModalVisible(true);
    setIsLoadingModal(true);
    setPlaylistTracks([]);

    try {
      const items = await fetchPlaylistTracks(token, playlist.id);
      setPlaylistTracks(items);
    } catch (error) {
      console.error("Error loading playlist:", error);
      Alert.alert("Error", "Could not load playlist tracks.");
    } finally {
      setIsLoadingModal(false);
    }
  };

  const headerBg = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: ['rgba(18,18,18,0)', 'rgba(18,18,18,1)'],
    extrapolate: 'clamp',
  });

  // Render individual tracks in the Modal list
  const renderPlaylistTrack = ({ item }) => {
    const track = item.item; // Spotify wraps the track object in an 'item' wrapper
    if (!track) return null;

    return (
      <TouchableOpacity 
        style={styles.modalTrackItem} 
        onPress={() => handlePlayTrack(track.name, track.artists?.[0]?.name)}
      >
        <Image 
          source={{ uri: track.album?.images?.[0]?.url || 'https://via.placeholder.com/50' }} 
          style={styles.modalTrackArt} 
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.modalTrackName} numberOfLines={1}>{track.name}</Text>
          <Text style={styles.modalTrackArtist} numberOfLines={1}>
            {track.artists?.map(a => a.name).join(', ')}
          </Text>
        </View>
        <MaterialIcons name="more-vert" size={20} color={C.muted} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />

      <Animated.View style={[styles.stickyHeader, { backgroundColor: headerBg }]}>
        <View>
          <Text style={styles.greeting}>
            {user?.isGuest ? 'Guest Session' : `Hi, ${user?.email?.split('@')[0] || 'User'}`}
          </Text>
        </View>
        <View style={styles.headerIcons}>
          <MaterialIcons name="history" size={26} color={C.text} />
          <TouchableOpacity onPress={handleLogout}>
            <MaterialIcons name="logout" size={24} color={C.text} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollPadding}
      >
        <View style={{ height: 100 }} />

        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={C.green} />
            <Text style={{ color: C.muted, marginTop: 10 }}>Fetching your music...</Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Your Playlists</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
              {playlists.length > 0 ? (
                playlists.map(item => (
                  <AlbumCard 
                    key={item.id}
                    title={item.name}
                    sub={`By ${item.owner?.display_name || 'You'}`}
                    imageUrl={item.images?.[0]?.url}
                    onPress={() => handleOpenPlaylist(item)}
                  />
                ))
              ) : (
                <Text style={styles.emptyText}>No owned playlists found.</Text>
              )}
            </ScrollView>

            <Text style={styles.sectionTitle}>Recently Played</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
              {recentTracks.length > 0 ? (
                recentTracks.map(item => (
                  <AlbumCard 
                    key={item.track?.id}
                    title={item.track?.name || 'Unknown Track'}
                    sub={item.track?.artists?.[0]?.name || 'Unknown Artist'}
                    imageUrl={item.track?.album?.images?.[0]?.url}
                    onPress={() => handlePlayTrack(item.track?.name, item.track?.artists?.[0]?.name)}
                  />
                ))
              ) : (
                <Text style={styles.emptyText}>Nothing played recently.</Text>
              )}
            </ScrollView>
          </>
        )}
      </Animated.ScrollView>

      {/* Playlist Details Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalBackButton}>
              <MaterialIcons name="arrow-back" size={28} color={C.text} />
            </TouchableOpacity>
          </View>

          {selectedPlaylist && (
            <FlatList
              data={playlistTracks}
              keyExtractor={(item, index) => item.track?.id || index.toString()}
              renderItem={renderPlaylistTrack}
              contentContainerStyle={{ paddingBottom: 100 }}
              ListHeaderComponent={
                <View style={styles.modalHeroSection}>
                  <Image 
                    source={{ uri: selectedPlaylist.images?.[0]?.url }} 
                    style={styles.modalCoverArt} 
                  />
                  <Text style={styles.modalPlaylistTitle}>{selectedPlaylist.name}</Text>
                  
                  <View style={styles.modalActionRow}>
                    <View style={{ flexDirection: 'row', gap: 20, alignItems: 'center' }}>
                      <MaterialIcons name="favorite-border" size={24} color={C.text} />
                      <MaterialIcons name="download" size={24} color={C.text} />
                      <MaterialIcons name="more-vert" size={24} color={C.text} />
                    </View>
                    <View style={{ flexDirection: 'row', gap: 15, alignItems: 'center' }}>
                      <MaterialIcons name="shuffle" size={28} color={C.green} />
                      <TouchableOpacity 
                        style={styles.modalPlayBtn}
                        onPress={() => {
                          if (playlistTracks.length > 0) {
                            const firstTrack = playlistTracks[0].track;
                            handlePlayTrack(firstTrack.name, firstTrack.artists?.[0]?.name);
                          }
                        }}
                      >
                        <MaterialIcons name="play-arrow" size={32} color="#000" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  {isLoadingModal && (
                    <ActivityIndicator size="large" color={C.green} style={{ marginTop: 20 }} />
                  )}
                </View>
              }
            />
          )}
        </SafeAreaView>
      </Modal>

      {/* Floating Player Control */}
      {(audioUrl || playerLoading) && (
        <View style={styles.floatingPlayer}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            {playerLoading && <ActivityIndicator size="small" color={C.green} style={{ marginRight: 10 }} />}
            <Text style={styles.nowPlayingText} numberOfLines={1}>
              {playerLoading ? 'Loading stream...' : `Playing: ${currentPlayingTitle}`}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.stopButton}
            onPress={() => {
              setAudioUrl(null);
              setCurrentPlayingTitle('');
            }}
          >
            <MaterialIcons name="stop" size={24} color="#FFF" />
          </TouchableOpacity>
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
            originWhitelist={['*']}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled={true}
            onMessage={(event) => {
              if (event.nativeEvent.data === 'ended') {
                setAudioUrl(null);
                setCurrentPlayingTitle('');
              }
            }}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  stickyHeader: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
  },
  greeting: { color: C.text, fontSize: 22, fontWeight: '700' },
  headerIcons: { flexDirection: 'row', gap: 15, alignItems: 'center' },
  scrollPadding: { paddingBottom: 100 },
  loaderContainer: { height: 300, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { color: C.text, fontSize: 20, fontWeight: '700', paddingHorizontal: 16, marginVertical: 15 },
  hScroll: { paddingLeft: 16, paddingBottom: 20 },
  albumArtContainer: { borderRadius: 8, overflow: 'hidden', backgroundColor: C.surface2, marginBottom: 8 },
  fullImage: { width: '100%', height: '100%' },
  playOverlay: { position: 'absolute', bottom: 8, right: 8 },
  playBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.green, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { color: C.text, fontSize: 13, fontWeight: '600' },
  cardSub: { color: C.muted, fontSize: 11 },
  emptyText: { color: C.muted, marginLeft: 16, fontSize: 14, fontStyle: 'italic' },
  
  floatingPlayer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#3E2723', 
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 999, 
  },
  nowPlayingText: { color: C.text, fontSize: 14, fontWeight: '600', flex: 1 },
  stopButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContainer: { flex: 1, backgroundColor: C.bg },
  modalHeader: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10 },
  modalBackButton: { width: 40, height: 40, justifyContent: 'center' },
  modalHeroSection: { paddingHorizontal: 16, paddingBottom: 20 },
  modalCoverArt: { width: 250, height: 250, alignSelf: 'center', marginTop: 20, marginBottom: 20, borderRadius: 4 },
  modalPlaylistTitle: { color: C.text, fontSize: 28, fontWeight: 'bold', marginBottom: 15 },
  modalActionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalPlayBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: C.green, justifyContent: 'center', alignItems: 'center' },
  
  modalTrackItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16 },
  modalTrackArt: { width: 50, height: 50, borderRadius: 4, marginRight: 15 },
  modalTrackName: { color: C.text, fontSize: 16, fontWeight: '500', marginBottom: 4 },
  modalTrackArtist: { color: C.muted, fontSize: 14 },
});