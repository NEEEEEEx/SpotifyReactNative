import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  StatusBar,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { WebView } from 'react-native-webview';

// ─── Hooks & Services ─────────────────────────────────────────────────────────
import { useAuthStore } from '../../../app/store/authStore';
import { getAdFreeStreamUrl } from '../../home/services/trackPlayer';
import { searchTracks } from '../services/spotifySearchService';

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

// ─── Static Data ──────────────────────────────────────────────────────────────
const BROWSE_CATEGORIES = [
  { id: 1, label: 'Podcasts', colors: ['#8D67AB', '#450af5'], icon: 'mic' },
  { id: 2, label: 'Live Events', colors: ['#148A08', '#1DB954'], icon: 'event' },
  { id: 3, label: 'Made For You', colors: ['#1e3264', '#4b917d'], icon: 'favorite' },
  { id: 4, label: 'New Releases', colors: ['#e8115b', '#c4efd9'], icon: 'new-releases' },
  { id: 5, label: 'Hip-Hop', colors: ['#BA5D07', '#E8115B'], icon: 'reorder' },
  { id: 6, label: 'Pop', colors: ['#7D4B9E', '#C400FF'], icon: 'star' },
  { id: 7, label: 'R&B', colors: ['#1e3264', '#e8115b'], icon: 'music-note' },
  { id: 8, label: 'K-Pop', colors: ['#E61E32', '#FF6437'], icon: 'flash-on' },
];

const RECENT_SEARCHES = [
  { id: 1, label: 'The Weeknd', sub: 'Artist', colors: ['#5038a0', '#af2896'], icon: 'person' },
  { id: 2, label: 'Blinding Lights', sub: 'Song', colors: ['#e91429', '#ff6437'], icon: 'music-note' },
];

// ─── Sub-Components ───────────────────────────────────────────────────────────

const CategoryCard = ({ item }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const onPress = () =>
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.94, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 140, useNativeDriver: true }),
    ]).start();

  return (
    <Animated.View style={[styles.cardWrap, { transform: [{ scale }] }]}>
      <TouchableOpacity onPress={onPress} activeOpacity={1}>
        <LinearGradient colors={item.colors} style={styles.categoryCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Text style={styles.categoryLabel}>{item.label}</Text>
          <View style={styles.cardDecor}>
            <MaterialIcons name={item.icon || 'music-note'} size={60} color="rgba(255,255,255,0.15)" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const RecentItem = ({ item, onRemove }) => (
  <View style={styles.recentRow}>
    <LinearGradient colors={item.colors} style={styles.recentThumb} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <MaterialIcons name={item.icon} size={24} color={C.text} />
    </LinearGradient>
    <View style={styles.recentInfo}>
      <Text style={styles.recentLabel}>{item.label}</Text>
      <Text style={styles.recentSub}>{item.sub}</Text>
    </View>
    <TouchableOpacity onPress={() => onRemove(item.id)}>
      <MaterialIcons name="close" size={20} color={C.muted} />
    </TouchableOpacity>
  </View>
);

const SearchBar = ({ value, onChange, onFocus, onBlur }) => (
  <View style={styles.searchBox}>
    <MaterialIcons name="search" size={22} color="#000" />
    <TextInput
      style={styles.searchInput}
      placeholder="What do you want to listen to?"
      placeholderTextColor={C.subtle}
      value={value}
      onChangeText={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      returnKeyType="search"
      selectionColor={C.green}
    />
    {value.length > 0 && (
      <TouchableOpacity onPress={() => onChange('')}>
        <MaterialIcons name="close" size={20} color={C.subtle} />
      </TouchableOpacity>
    )}
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export const SearchScreen = () => {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [recents, setRecents] = useState(RECENT_SEARCHES);
  
  // Search State
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Audio Player State
  const [audioUrl, setAudioUrl] = useState(null);
  const [playerLoading, setPlayerLoading] = useState(false);
  const [currentPlayingTitle, setCurrentPlayingTitle] = useState('');

  const token = useAuthStore(state => state.token);

  // Debounced Search Effect using the new service
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length > 0 && token) {
        setIsSearching(true);
        try {
          const tracks = await searchTracks(token, query);
          setSearchResults(tracks);
        } catch (error) {
          console.error("Search Screen Error:", error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500); 

    return () => clearTimeout(delayDebounceFn);
  }, [query, token]);

  const removeRecent = id => setRecents(r => r.filter(x => x.id !== id));

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

  const renderTrackResult = (track) => {
    const artistName = track.artists?.[0]?.name;
    const imageUrl = track.album?.images?.[0]?.url;

    return (
      <TouchableOpacity 
        key={track.id} 
        style={styles.trackResultItem}
        onPress={() => handlePlayTrack(track.name, artistName)}
      >
        <Image 
          source={{ uri: imageUrl || 'https://via.placeholder.com/50' }} 
          style={styles.trackResultArt} 
        />
        <View style={styles.trackResultInfo}>
          <Text style={styles.trackResultName} numberOfLines={1}>{track.name}</Text>
          <Text style={styles.trackResultArtist} numberOfLines={1}>{artistName}</Text>
        </View>
        <MaterialIcons name="play-arrow" size={24} color={C.muted} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
        <SearchBar
          value={query}
          onChange={setQuery}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Dynamic State 1: Active Search Results */}
        {query.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Results</Text>
            {isSearching ? (
              <ActivityIndicator size="large" color={C.green} style={{ marginTop: 40 }} />
            ) : searchResults.length > 0 ? (
              searchResults.map(renderTrackResult)
            ) : (
              <Text style={styles.emptyText}>No results found for "{query}"</Text>
            )}
          </View>
        ) : 
        
        /* Dynamic State 2: Recent Searches (When Focused & Empty) */
        focused && query.length === 0 && recents.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent searches</Text>
              <TouchableOpacity onPress={() => setRecents([])}>
                <Text style={styles.clearAll}>Clear all</Text>
              </TouchableOpacity>
            </View>
            {recents.map(item => (
              <RecentItem key={item.id} item={item} onRemove={removeRecent} />
            ))}
          </View>
        ) : 
        
        /* Dynamic State 3: Browse All Grid (Default State) */
        (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Browse all</Text>
            <View style={styles.grid}>
              {BROWSE_CATEGORIES.map(item => (
                <CategoryCard key={item.id} item={item} />
              ))}
            </View>
          </View>
        )}
      </ScrollView>

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

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  title: { color: C.text, fontSize: 24, fontWeight: '700', marginBottom: 12 },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.text,
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 48,
    gap: 8,
  },
  searchInput: { flex: 1, color: '#000', fontSize: 14, fontWeight: '600' },

  scrollContent: { paddingBottom: 140 },
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: { color: C.text, fontSize: 16, fontWeight: '700', marginBottom: 14 },
  clearAll: { color: C.muted, fontSize: 12, fontWeight: '600' },
  emptyText: { color: C.muted, fontSize: 14, fontStyle: 'italic', marginTop: 10 },

  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  recentThumb: {
    width: 48,
    height: 48,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentInfo: { flex: 1 },
  recentLabel: { color: C.text, fontSize: 14, fontWeight: '600' },
  recentSub: { color: C.muted, fontSize: 12 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cardWrap: { width: '48.5%' },
  categoryCard: {
    height: 100,
    borderRadius: 8,
    padding: 12,
    overflow: 'hidden',
    justifyContent: 'flex-start',
  },
  categoryLabel: { color: C.text, fontSize: 16, fontWeight: '800', zIndex: 1 },
  cardDecor: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    transform: [{ rotate: '25deg' }],
  },

  trackResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.surface,
  },
  trackResultArt: { width: 50, height: 50, borderRadius: 4, marginRight: 15 },
  trackResultInfo: { flex: 1 },
  trackResultName: { color: C.text, fontSize: 16, fontWeight: '500', marginBottom: 4 },
  trackResultArtist: { color: C.muted, fontSize: 14 },

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
  stopButton: { padding: 8, justifyContent: 'center', alignItems: 'center' },
});