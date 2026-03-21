import { create } from 'zustand';
import { Alert } from 'react-native';
// Adjust this import path if needed based on your folder structure!
import { getAdFreeStreamUrl } from '../../features/home/services/trackPlayer'; 

const usePlayerStore = create((set, get) => ({
  audioUrl: null,
  currentPlayingTitle: '',
  currentArtist: '',
  currentArtwork: null,
  playerLoading: false,

  // ─── NEW: Queue State ───
  queue: [],
  currentIndex: -1,

  setLoading: (isLoading) => set({ playerLoading: isLoading }),

  // Plays a single track (useful for Search results)
  playTrack: (url, title, artist, artwork) => set({ 
    audioUrl: url, 
    currentPlayingTitle: title, 
    currentArtist: artist,
    currentArtwork: artwork,
    playerLoading: false,
    queue: [], // Clear queue if playing a single ad-hoc track
    currentIndex: -1
  }),

  // ─── NEW: Queue Controllers ───
  playQueue: async (tracks, startIndex = 0) => {
    set({ queue: tracks, currentIndex: startIndex, playerLoading: true });
    get().loadTrackAtIndex(startIndex);
  },

  loadTrackAtIndex: async (index) => {
    const { queue } = get();
    if (index < 0 || index >= queue.length) return;

    set({ currentIndex: index, playerLoading: true });
    const trackObj = queue[index];

    // Standardize track data (Playlist items are wrapped in {item: ...}, albums/artists are direct)
    const track = trackObj.item || trackObj;
    const title = track?.name;
    const artist = track?.artists?.[0]?.name || '';
    const artwork = track?.album?.images?.[0]?.url;

    try {
      const url = await getAdFreeStreamUrl(title, artist);
      if (url) {
        set({
          audioUrl: url,
          currentPlayingTitle: title,
          currentArtist: artist,
          currentArtwork: artwork,
          playerLoading: false
        });
      } else {
        Alert.alert("Error", "Could not find an audio stream.");
        get().playNext(); // Skip to next if stream fails
      }
    } catch (error) {
      console.error("Queue Play Error", error);
      get().playNext();
    }
  },

  playNext: () => {
    const { queue, currentIndex } = get();
    if (queue.length > 0 && currentIndex < queue.length - 1) {
      get().loadTrackAtIndex(currentIndex + 1);
    } else {
      get().stopTrack(); // End of playlist
    }
  },

  playPrevious: () => {
    const { queue, currentIndex } = get();
    if (queue.length > 0 && currentIndex > 0) {
      get().loadTrackAtIndex(currentIndex - 1);
    }
  },

  stopTrack: () => set({ 
    audioUrl: null, 
    currentPlayingTitle: '', 
    currentArtist: '',
    currentArtwork: null,
    playerLoading: false,
    queue: [],
    currentIndex: -1
  }),
}));

export default usePlayerStore;