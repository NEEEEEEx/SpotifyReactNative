import React, { useState, useRef } from 'react';
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
  bg: '#121212',
  surface: '#181818',
  surface2: '#282828',
  surface3: '#3E3E3E',
  text: '#FFFFFF',
  muted: '#B3B3B3',
  subtle: '#535353',
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const FILTERS = ['Playlists', 'Albums', 'Artists', 'Podcasts'];

const LIBRARY_ITEMS = [
  {
    id: 1,
    type: 'playlist',
    label: 'Liked Songs',
    sub: 'Playlist • 284 songs',
    colors: ['#450af5', '#c4efd9'],
    icon: 'favorite',
    pinned: true,
  },
  {
    id: 2,
    type: 'playlist',
    label: 'Daily Mix 1',
    sub: 'Playlist • Spotify',
    colors: ['#1e3264', '#4b917d'],
    icon: 'looks-one',
    pinned: false,
  },
  {
    id: 3,
    type: 'album',
    label: 'After Hours',
    sub: 'Album • The Weeknd',
    colors: ['#e91429', '#5038a0'],
    icon: 'album',
    pinned: false,
  },
  {
    id: 4,
    type: 'artist',
    label: 'Drake',
    sub: 'Artist',
    colors: ['#BA5D07', '#E8115B'],
    icon: 'person',
    circular: true,
    pinned: false,
  },
  {
    id: 5,
    type: 'playlist',
    label: 'Chill Vibes',
    sub: 'Playlist • Spotify',
    colors: ['#006450', '#1e3264'],
    icon: 'queue-music',
    pinned: false,
  },
  {
    id: 6,
    type: 'podcast',
    label: 'The Daily',
    sub: 'Podcast • NYT',
    colors: ['#8D67AB', '#450af5'],
    icon: 'mic',
    pinned: false,
  },
];

// ─── Components ───────────────────────────────────────────────────────────────

const LibraryItem = ({ item, isGrid }) => {
  if (isGrid) {
    return (
      <TouchableOpacity style={styles.gridItem} activeOpacity={0.8}>
        <LinearGradient
          colors={item.colors}
          style={[styles.gridThumb, item.circular && styles.gridThumbCircular]}
        >
          <MaterialIcons
            name={item.icon}
            size={30}
            color="rgba(255,255,255,0.6)"
          />
        </LinearGradient>
        <Text style={styles.gridLabel} numberOfLines={1}>
          {item.label}
        </Text>
        <Text style={styles.gridSub} numberOfLines={1}>
          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.itemRow} activeOpacity={0.7}>
      <LinearGradient
        colors={item.colors}
        style={[styles.thumb, item.circular && styles.thumbCircular]}
      >
        <MaterialIcons name={item.icon} size={24} color={C.text} />
      </LinearGradient>
      <View style={styles.itemInfo}>
        <View style={styles.itemLabelRow}>
          {item.pinned && (
            <MaterialIcons
              name="push-pin"
              size={14}
              color={C.green}
              style={{ marginRight: 4, transform: [{ rotate: '45deg' }] }}
            />
          )}
          <Text style={styles.itemLabel} numberOfLines={1}>
            {item.label}
          </Text>
        </View>
        <Text style={styles.itemSub}>{item.sub}</Text>
      </View>
    </TouchableOpacity>
  );
};

// ─── Main Screen ───────────────────────────────────────────────────────────────
export const LibraryScreen = () => {
  const [activeFilter, setActiveFilter] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerShadow = scrollY.interpolate({
    inputRange: [0, 20],
    outputRange: [0, 0.8],
    extrapolate: 'clamp',
  });

  const filteredItems = activeFilter
    ? LIBRARY_ITEMS.filter(
        i =>
          i.type === activeFilter.toLowerCase().slice(0, -1) ||
          (activeFilter === 'Playlists' && i.type === 'playlist'),
      )
    : LIBRARY_ITEMS;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />

      {/* Persistent Header */}
      <Animated.View
        style={[
          styles.header,
          {
            backgroundColor: C.bg,
            elevation: headerShadow,
            shadowOpacity: headerShadow,
          },
        ]}
      >
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>JD</Text>
            </View>
            <Text style={styles.headerTitle}>Your Library</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerBtn}>
              <MaterialIcons name="search" size={28} color={C.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerBtn}>
              <MaterialIcons name="add" size={30} color={C.text} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              onPress={() => setActiveFilter(activeFilter === f ? null : f)}
              style={[styles.chip, activeFilter === f && styles.chipActive]}
            >
              <Text
                style={[
                  styles.chipText,
                  activeFilter === f && styles.chipTextActive,
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      <ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.sortRow}>
          <TouchableOpacity style={styles.sortBtn}>
            <MaterialIcons name="swap-vert" size={20} color={C.text} />
            <Text style={styles.sortLabel}>Recents</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
          >
            <MaterialIcons
              name={viewMode === 'list' ? 'grid-view' : 'list'}
              size={20}
              color={C.text}
            />
          </TouchableOpacity>
        </View>

        {viewMode === 'list' ? (
          filteredItems.map(item => (
            <LibraryItem key={item.id} item={item} isGrid={false} />
          ))
        ) : (
          <View style={styles.gridContainer}>
            {filteredItems.map(item => (
              <LibraryItem key={item.id} item={item} isGrid={true} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    paddingBottom: 8,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#af2896',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  headerTitle: { color: C.text, fontSize: 22, fontWeight: '700' },
  headerActions: { flexDirection: 'row', gap: 10 },
  headerBtn: { padding: 4 },

  chips: { paddingHorizontal: 16, gap: 8, paddingBottom: 8 },
  chip: {
    backgroundColor: C.surface2,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipActive: { backgroundColor: C.green },
  chipText: { color: C.text, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: '#000' },

  sortRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sortLabel: { color: C.text, fontSize: 13, fontWeight: '600' },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbCircular: { borderRadius: 32 },
  itemInfo: { flex: 1 },
  itemLabelRow: { flexDirection: 'row', alignItems: 'center' },
  itemLabel: { color: C.text, fontSize: 16, fontWeight: '600' },
  itemSub: { color: C.muted, fontSize: 13, marginTop: 4 },

  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 16,
  },
  gridItem: { width: '47.4%', marginBottom: 16 },
  gridThumb: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  gridThumbCircular: { borderRadius: 100 },
  gridLabel: { color: C.text, fontSize: 14, fontWeight: '600' },
  gridSub: { color: C.muted, fontSize: 12, marginTop: 2 },
});
