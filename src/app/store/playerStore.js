import { create } from 'zustand';
import TrackPlayer, { Event, Capability } from 'react-native-track-player';

const usePlayerStore = create((set, get) => ({
  currentTrack: null,
  isPlaying: false,

  // 1. ADDED: Initialize the player with a playlist
  initPlayer: async tracks => {
    try {
      await TrackPlayer.setupPlayer();
      await TrackPlayer.updateOptions({
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
          Capability.Stop,
        ],
      });
      await TrackPlayer.add(tracks);
    } catch (e) {
      console.log('Player already initialized or error:', e);
    }
  },

  // 2. ADDED: Play a specific track by ID
  playTrack: async trackId => {
    const tracks = await TrackPlayer.getQueue();
    const trackIndex = tracks.findIndex(t => t.id === trackId);
    if (trackIndex !== -1) {
      await TrackPlayer.skip(trackIndex);
      await TrackPlayer.play();
    }
  },

  setupListeners: () => {
    TrackPlayer.addEventListener(Event.PlaybackState, event => {
      // Note: check your RNTP version; state might be 'playing' or State.Playing
      const isPlaying = event.state === 'playing' || event.state === 3;
      set({ isPlaying });
    });

    TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, event => {
      set({ currentTrack: event.track });
    });
  },

  seekTo: async value => {
    await TrackPlayer.seekTo(value);
  },

  resetPlayer: async () => {
    await TrackPlayer.reset();
    set({ currentTrack: null, isPlaying: false });
  },
}));

export default usePlayerStore;
