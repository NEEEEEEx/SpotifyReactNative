import { create } from 'zustand';

const usePlayerStore = create((set) => ({
  audioUrl: null,
  currentPlayingTitle: '',
  currentArtist: '',       // <-- NEW
  currentArtwork: null,    // <-- NEW
  playerLoading: false,

  setLoading: (isLoading) => set({ playerLoading: isLoading }),

  // Updated to accept artist and artwork
  playTrack: (url, title, artist, artwork) => set({ 
    audioUrl: url, 
    currentPlayingTitle: title, 
    currentArtist: artist,
    currentArtwork: artwork,
    playerLoading: false 
  }),

  stopTrack: () => set({ 
    audioUrl: null, 
    currentPlayingTitle: '', 
    currentArtist: '',
    currentArtwork: null,
    playerLoading: false 
  }),
}));

export default usePlayerStore;