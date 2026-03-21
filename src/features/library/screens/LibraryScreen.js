import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  StatusBar,
  Image,
  ActivityIndicator,
  Modal,
  FlatList,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';

// ─── Hooks & Services ─────────────────────────────────────────────────────────
import { useAuthStore } from '../../../app/store/authStore';
import usePlayerStore from '../../../app/store/playerStore'; // <-- ADDED GLOBAL STORE

import { fetchUserLibrary, fetchAlbumTracks, fetchArtistTopTracks } from '../services/spotifyLibraryService';
import { fetchPlaylistTracks } from '../../home/services/spotifyHomeService';
import { getAdFreeStreamUrl } from '../../home/services/trackPlayer';

// ─── Theme ────────────────────────────────────────────────────────────────────
const C = {
  green: '#1DB954',
  bg: '#121212',
  surface: '#181818',
  surface2: '#282828',
  surface3: '#3E3E3E',
  text: '#FFFFFF',
  muted: '#B3B3B3',
  subtle: '#535353',
};

const FILTERS = ['Playlists', 'Albums', 'Artists'];

// ─── Sub-Components ───────────────────────────────────────────────────────────

const LibraryItem = ({ item, isGrid, onPress }) => {
  // Fallback gradient colors based on type if no image is available
  const fallbackColors = item.type === 'artist' ? ['#BA5D07', '#E8115B'] : 
                         item.type === 'album' ? ['#e91429', '#5038a0'] : ['#450af5', '#c4efd9'];
  const iconName = item.type === 'artist' ? 'person' : item.type === 'album' ? 'album' : 'queue-music';

  if (isGrid) {
    return (
      <TouchableOpacity style={styles.gridItem} activeOpacity={0.8} onPress={onPress}>
        <View style={[styles.gridThumb, item.circular && styles.gridThumbCircular, { overflow: 'hidden' }]}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={{ width: '100%', height: '100%' }} />
          ) : (
            <LinearGradient colors={fallbackColors} style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
              <MaterialIcons name={iconName} size={30} color="rgba(255,255,255,0.6)" />
            </LinearGradient>
          )}
        </View>
        <Text style={styles.gridLabel} numberOfLines={1}>{item.label}</Text>
        <Text style={styles.gridSub} numberOfLines={1}>{item.sub}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.itemRow} activeOpacity={0.7} onPress={onPress}>
      <View style={[styles.thumb, item.circular && styles.thumbCircular, { overflow: 'hidden' }]}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={{ width: '100%', height: '100%' }} />
        ) : (
          <LinearGradient colors={fallbackColors} style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
            <MaterialIcons name={iconName} size={24} color={C.text} />
          </LinearGradient>
        )}
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemLabel} numberOfLines={1}>{item.label}</Text>
        <Text style={styles.itemSub}>{item.sub}</Text>
      </View>
    </TouchableOpacity>
  );
};

// ─── Main Screen ───────────────────────────────────────────────────────────────
export const LibraryScreen = () => {
  // Library State
  const [libraryData, setLibraryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  
  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalTracks, setModalTracks] = useState([]);
  const [isLoadingModal, setIsLoadingModal] = useState(false);

  // Global Stores
  const token = useAuthStore(state => state.token);
  const user = useAuthStore(state => state.user);
  
  // Global Player Actions (Removed local state)
  const { setLoading, playTrack, stopTrack } = usePlayerStore();
  
  const scrollY = useRef(new Animated.Value(0)).current;

  // 1. Fetch Library Data
  useEffect(() => {
    const loadData = async () => {
      if (!token || !user?.id) return;
      setIsLoading(true);
      const data = await fetchUserLibrary(token, user.id);
      setLibraryData(data);
      setIsLoading(false);
    };
    loadData();
  }, [token, user?.id]);

  // 2. Open Modal & Fetch Tracks
  const handleOpenItem = async (item) => {
    setSelectedItem(item);
    setModalVisible(true);
    setIsLoadingModal(true);
    setModalTracks([]);

    try {
      let tracks = [];
      if (item.type === 'playlist') {
        tracks = await fetchPlaylistTracks(token, item.id);
      } else if (item.type === 'album') {
        tracks = await fetchAlbumTracks(token, item.id);
      } else if (item.type === 'artist') {
        tracks = await fetchArtistTopTracks(token, item.id);
      }
      setModalTracks(tracks);
    } catch (error) {
      console.error("Error loading item contents:", error);
    } finally {
      setIsLoadingModal(false);
    }
  };

  // 3. Play Track Logic (Using Global Store)
  const handlePlayTrack = async (trackName, artistName,image) => {
    if (!trackName) return;
    
    setLoading(true); // Trigger global loading state
    
    try {
      const url = await getAdFreeStreamUrl(trackName, artistName || '');
      if (url) {
        playTrack(url, trackName,artistName,image); // Set global URL and title
      } else {
        Alert.alert("Error", "Could not find an audio stream.");
        stopTrack(); // Reset global player
      }
    } catch (error) {
      Alert.alert("Error", "Failed to play the track.");
      stopTrack(); // Reset global player
    }
  };

  const headerShadow = scrollY.interpolate({
    inputRange: [0, 20],
    outputRange: [0, 0.8],
    extrapolate: 'clamp',
  });

  const filteredItems = activeFilter
    ? libraryData.filter(i => i.type === activeFilter.toLowerCase().slice(0, -1) || (activeFilter === 'Playlists' && i.type === 'playlist'))
    : libraryData;

  // Render Track inside Modal
  const renderModalTrack = ({ item }) => {
    // Playlist tracks wrap the track object in `item.track`, Albums/Artists return tracks directly
    const track = selectedItem?.type === 'playlist' ? item.item : item;
    
    if (!track) return null;

    return (
      <TouchableOpacity 
        style={styles.modalTrackItem} 
        onPress={() => handlePlayTrack(track.name, track.artists?.[0]?.name,track.album?.images?.[0]?.url)}
      > 

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

      {/* Persistent Header */}
      <Animated.View style={[styles.header, { backgroundColor: C.bg, elevation: headerShadow }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                 {user?.display_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
            <Text style={styles.headerTitle}>Your Library</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              onPress={() => setActiveFilter(activeFilter === f ? null : f)}
              style={[styles.chip, activeFilter === f && styles.chipActive]}
            >
              <Text style={[styles.chipText, activeFilter === f && styles.chipTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      <ScrollView
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={styles.sortRow}>
          <TouchableOpacity style={styles.sortBtn}>
            <MaterialIcons name="swap-vert" size={20} color={C.text} />
            <Text style={styles.sortLabel}>Recents</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}>
            <MaterialIcons name={viewMode === 'list' ? 'grid-view' : 'list'} size={20} color={C.text} />
          </TouchableOpacity>
        </View>

        {isLoading ? (
           <ActivityIndicator size="large" color={C.green} style={{ marginTop: 50 }} />
        ) : viewMode === 'list' ? (
          filteredItems.map(item => <LibraryItem key={`${item.type}-${item.id}`} item={item} isGrid={false} onPress={() => handleOpenItem(item)} />)
        ) : (
          <View style={styles.gridContainer}>
            {filteredItems.map(item => <LibraryItem key={`${item.type}-${item.id}`} item={item} isGrid={true} onPress={() => handleOpenItem(item)} />)}
          </View>
        )}
      </ScrollView>

      {/* Details Modal */}
      <Modal animationType="slide" transparent={false} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalBackButton}>
              <MaterialIcons name="arrow-back" size={28} color={C.text} />
            </TouchableOpacity>
          </View>

          {selectedItem && (
            <FlatList
              data={modalTracks}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderModalTrack}
              contentContainerStyle={{ paddingBottom: 100 }}
              ListHeaderComponent={
                <View style={styles.modalHeroSection}>
                  <Image 
                    source={{ uri: selectedItem.imageUrl || 'https://via.placeholder.com/250' }} 
                    style={[styles.modalCoverArt, selectedItem.circular && { borderRadius: 125 }]} 
                  />
                  <Text style={styles.modalPlaylistTitle}>{selectedItem.label}</Text>
                  
                  <View style={styles.modalActionRow}>
                    <View style={{ flexDirection: 'row', gap: 20, alignItems: 'center' }}>
                      <MaterialIcons name="favorite-border" size={24} color={C.text} />
                      <MaterialIcons name="more-vert" size={24} color={C.text} />
                    </View>
                    <View style={{ flexDirection: 'row', gap: 15, alignItems: 'center' }}>
                      <MaterialIcons name="shuffle" size={28} color={C.green} />
                      <TouchableOpacity 
                        style={styles.modalPlayBtn}
                        onPress={() => {
                          if (modalTracks.length > 0) {
                            const firstTrack = selectedItem.type === 'playlist' ? modalTracks[0].item : modalTracks[0];
                            handlePlayTrack(firstTrack.name, firstTrack.artists?.[0]?.name,firstTrack.album?.images?.[0]?.url);
                          }
                        }}
                      >
                        <MaterialIcons name="play-arrow" size={32} color="#000" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  {isLoadingModal && <ActivityIndicator size="large" color={C.green} style={{ marginTop: 20 }} />}
                </View>
              }
            />
          )}
        </SafeAreaView>
      </Modal>

      {/* Floating Player and WebView have been completely removed from here! */}
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { paddingBottom: 8, zIndex: 10 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginVertical: 12 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarPlaceholder: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#af2896', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  headerTitle: { color: C.text, fontSize: 22, fontWeight: '700' },
  chips: { paddingHorizontal: 16, gap: 8, paddingBottom: 8 },
  chip: { backgroundColor: C.surface2, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: 'transparent' },
  chipActive: { backgroundColor: C.green },
  chipText: { color: C.text, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: '#000' },
  sortRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sortLabel: { color: C.text, fontSize: 13, fontWeight: '600' },

  itemRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, gap: 12 },
  thumb: { width: 64, height: 64, borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  thumbCircular: { borderRadius: 32 },
  itemInfo: { flex: 1 },
  itemLabel: { color: C.text, fontSize: 16, fontWeight: '600' },
  itemSub: { color: C.muted, fontSize: 13, marginTop: 4 },

  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 16 },
  gridItem: { width: '47.4%', marginBottom: 16 },
  gridThumb: { width: '100%', aspectRatio: 1, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  gridThumbCircular: { borderRadius: 100 },
  gridLabel: { color: C.text, fontSize: 14, fontWeight: '600' },
  gridSub: { color: C.muted, fontSize: 12, marginTop: 2 },

  modalContainer: { flex: 1, backgroundColor: C.bg },
  modalHeader: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10 },
  modalBackButton: { width: 40, height: 40, justifyContent: 'center' },
  modalHeroSection: { paddingHorizontal: 16, paddingBottom: 20 },
  modalCoverArt: { width: 250, height: 250, alignSelf: 'center', marginTop: 20, marginBottom: 20, borderRadius: 4 },
  modalPlaylistTitle: { color: C.text, fontSize: 28, fontWeight: 'bold', marginBottom: 15 },
  modalActionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalPlayBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: C.green, justifyContent: 'center', alignItems: 'center' },
  
  modalTrackItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16 },
  modalTrackName: { color: C.text, fontSize: 16, fontWeight: '500', marginBottom: 4 },
  modalTrackArtist: { color: C.muted, fontSize: 14 },
});