import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';

// ─── Theme ────────────────────────────────────────────────────────────────────
const C = {
  green: '#1DB954',
  greenDark: '#1aa34a',
  bg: '#121212',
  surface: '#181818',
  surface2: '#282828',
  surface3: '#3E3E3E',
  text: '#FFFFFF',
  muted: '#B3B3B3',
  subtle: '#535353',
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const QUICK_ITEMS = [
  {
    id: 1,
    label: 'Liked Songs',
    colors: ['#450af5', '#c4efd9'],
    icon: 'favorite',
  },
  {
    id: 2,
    label: 'Your Podcasts',
    colors: ['#006450', '#27856a'],
    icon: 'mic',
  },
  {
    id: 3,
    label: 'Discover Weekly',
    colors: ['#e8115b', '#ff6437'],
    icon: 'explore',
  },
  {
    id: 4,
    label: 'Top Charts',
    colors: ['#1e3264', '#4b917d'],
    icon: 'bar-chart',
  },
];

const DAILY_MIXES = [
  {
    id: 1,
    label: 'Daily Mix 1',
    sub: 'The Weeknd, Drake, Post Malone',
    colors: ['#1e3264', '#4b917d'],
    num: '1',
  },
  {
    id: 2,
    label: 'Daily Mix 2',
    sub: 'Taylor Swift, Olivia Rodrigo',
    colors: ['#4b917d', '#ff6437'],
    num: '2',
  },
  {
    id: 3,
    label: 'Daily Mix 3',
    sub: 'Billie Eilish, Lorde, Lana',
    colors: ['#7358ff', '#c400ff'],
    num: '3',
  },
  {
    id: 4,
    label: 'On Repeat',
    sub: "Songs you can't stop playing",
    colors: ['#e8115b', '#7358ff'],
    num: 'favorite',
  },
];

const RECENT = [
  {
    id: 1,
    label: 'Chill Vibes',
    sub: 'Playlist • Spotify',
    colors: ['#006450', '#1e3264'],
  },
  {
    id: 2,
    label: 'Hot Hits PH',
    sub: 'Playlist • Spotify',
    colors: ['#e61e32', '#ff6437'],
  },
  {
    id: 3,
    label: 'Late Night Drive',
    sub: 'Playlist • Spotify',
    colors: ['#4b917d', '#ff6437'],
  },
];

const ARTISTS = [
  { id: 1, name: 'The Weeknd', colors: ['#5038a0', '#af2896'] },
  { id: 2, name: 'Drake', colors: ['#e91429', '#ff6437'] },
  { id: 3, name: 'SZA', colors: ['#006450', '#1e3264'] },
];

const FILTERS = ['All', 'Music', 'Podcasts', 'Audiobooks'];

// ─── Sub-components ───────────────────────────────────────────────────────────

const FilterChip = ({ label, active, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.chip, active && styles.chipActive]}
    activeOpacity={0.7}
  >
    <Text style={[styles.chipText, active && styles.chipTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const QuickItem = ({ item }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const press = () =>
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.95,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();

  return (
    <Animated.View style={{ transform: [{ scale }], width: '48%' }}>
      <TouchableOpacity
        onPress={press}
        activeOpacity={0.85}
        style={styles.quickItem}
      >
        <LinearGradient
          colors={item.colors}
          style={styles.quickIcon}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <MaterialIcons name={item.icon} size={24} color={C.text} />
        </LinearGradient>
        <Text style={styles.quickLabel} numberOfLines={1}>
          {item.label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const AlbumCard = ({ item, size = 140, circular = false }) => {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <Animated.View
      style={{ transform: [{ scale }], marginRight: 16, width: size }}
    >
      <TouchableOpacity activeOpacity={1}>
        <LinearGradient
          colors={item.colors}
          style={[
            styles.albumArt,
            { width: size, height: size },
            circular && { borderRadius: size / 2 },
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {item.num === 'favorite' ? (
            <MaterialIcons
              name="favorite"
              size={40}
              color="rgba(255,255,255,0.8)"
            />
          ) : item.num ? (
            <Text style={styles.mixNum}>{item.num}</Text>
          ) : null}
          <View style={styles.playOverlay}>
            <View style={styles.playBtn}>
              <MaterialIcons name="play-arrow" size={24} color="#000" />
            </View>
          </View>
        </LinearGradient>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.label ?? item.name}
        </Text>
        {item.sub && (
          <Text style={styles.cardSub} numberOfLines={1}>
            {item.sub}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const MiniPlayer = () => {
  const [playing, setPlaying] = useState(true);
  return (
    <View style={styles.miniPlayer}>
      <LinearGradient
        colors={['#5038a0', '#1a5040']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      />
      <LinearGradient
        colors={['#7358ff', '#c400ff']}
        style={styles.miniArt}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <MaterialIcons name="music-note" size={24} color={C.text} />
      </LinearGradient>
      <View style={styles.miniInfo}>
        <Text style={styles.miniSong} numberOfLines={1}>
          As It Was
        </Text>
        <Text style={styles.miniArtist} numberOfLines={1}>
          Harry Styles
        </Text>
      </View>
      <View style={styles.miniControls}>
        <TouchableOpacity style={styles.miniBtn}>
          <MaterialIcons name="favorite-border" size={24} color={C.text} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setPlaying(!playing)}
          style={styles.playCircle}
        >
          <MaterialIcons
            name={playing ? 'pause' : 'play-arrow'}
            size={24}
            color="#000"
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.miniBtn}>
          <MaterialIcons name="skip-next" size={28} color={C.text} />
        </TouchableOpacity>
      </View>
      <View style={styles.miniProgress}>
        <View style={styles.miniProgressFill} />
      </View>
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export const HomeScreen = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerBg = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: ['rgba(18,18,18,0)', 'rgba(18,18,18,1)'],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      <Animated.View
        style={[styles.stickyHeader, { backgroundColor: headerBg }]}
      >
        <Text style={styles.greeting}>Good afternoon</Text>
        <View style={{ flexDirection: 'row', gap: 15 }}>
          <MaterialIcons name="notifications-none" size={26} color={C.text} />
          <MaterialIcons name="history" size={26} color={C.text} />
          <MaterialIcons name="settings" size={26} color={C.text} />
        </View>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
      >
        <View style={{ height: 70 }} />
        <ScrollView
          horizontal
          style={styles.chips}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {FILTERS.map(f => (
            <FilterChip
              key={f}
              label={f}
              active={activeFilter === f}
              onPress={() => setActiveFilter(f)}
            />
          ))}
        </ScrollView>

        <View style={styles.quickGrid}>
          {QUICK_ITEMS.map(item => (
            <QuickItem key={item.id} item={item} />
          ))}
        </View>

        <Text style={styles.sectionTitleMain}>Made for you</Text>
        <ScrollView horizontal contentContainerStyle={styles.hScrollContent}>
          {DAILY_MIXES.map(item => (
            <AlbumCard key={item.id} item={item} />
          ))}
        </ScrollView>

        <Text style={styles.sectionTitleMain}>Recently played</Text>
        <ScrollView horizontal contentContainerStyle={styles.hScrollContent}>
          {RECENT.map(item => (
            <AlbumCard key={item.id} item={item} />
          ))}
        </ScrollView>
      </Animated.ScrollView>
      <MiniPlayer />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
  },
  greeting: { color: C.text, fontSize: 22, fontWeight: '700' },
  scrollContent: { paddingBottom: 160 },
  chips: { marginBottom: 16 },
  chip: {
    backgroundColor: C.surface2,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  chipActive: { backgroundColor: C.green },
  chipText: { color: C.text, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: '#000' },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 28,
  },
  quickItem: {
    height: 56,
    backgroundColor: C.surface2,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  quickIcon: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickLabel: {
    color: C.text,
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 10,
    flex: 1,
  },
  sectionTitleMain: {
    color: C.text,
    fontSize: 20,
    fontWeight: '700',
    paddingHorizontal: 16,
    marginBottom: 15,
  },
  hScrollContent: { paddingHorizontal: 16, paddingBottom: 28 },
  albumArt: {
    borderRadius: 6,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  mixNum: { fontSize: 36, fontWeight: '900', color: 'rgba(255,255,255,0.85)' },
  playOverlay: { position: 'absolute', bottom: 8, right: 8 },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: { color: C.text, fontSize: 13, fontWeight: '600' },
  cardSub: { color: C.muted, fontSize: 11 },
  miniPlayer: {
    position: 'absolute',
    bottom: 7,
    left: 8,
    right: 8,
    height: 68,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    overflow: 'hidden',
  },
  miniArt: {
    width: 48,
    height: 48,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniInfo: { flex: 1, marginLeft: 10 },
  miniSong: { color: C.text, fontSize: 13, fontWeight: '700' },
  miniArtist: { color: 'rgba(255,255,255,0.65)', fontSize: 11 },
  miniControls: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  miniBtn: { padding: 5 },
  playCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniProgress: {
    position: 'absolute',
    bottom: 0,
    left: 8,
    right: 8,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  miniProgressFill: { width: '38%', height: '100%', backgroundColor: C.green },
});
