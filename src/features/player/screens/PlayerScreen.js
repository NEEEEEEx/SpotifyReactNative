import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';

// ─── Global Store ─────────────────────────────────────────────────────────────
import usePlayerStore from '../../../app/store/playerStore';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Theme ────────────────────────────────────────────────────────────────────
const C = {
  green: '#1DB954',
  bg: '#121212',
  surface2: '#282828',
  text: '#FFFFFF',
  muted: '#B3B3B3',
};

// ─── Sub-Components ───────────────────────────────────────────────────────────
const ProgressBar = ({ progress, duration, onSeek, disabled }) => {
  const barWidth = useRef(0);
  // Ensure progress stays between 0 and 1, handle NaN
  const safeProgress = isNaN(progress) ? 0 : Math.max(0, Math.min(1, progress));
  const fillPct = `${safeProgress * 100}%`;

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={[styles.progressArea, disabled && { opacity: 0.5 }]}
      onLayout={e => (barWidth.current = e.nativeEvent.layout.width)}
      onPress={e => {
        if (disabled || barWidth.current === 0) return;
        const x = e.nativeEvent.locationX;
        onSeek((x / barWidth.current) * duration);
      }}
    >
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: fillPct }]} />
        <View style={[styles.progressKnob, { left: fillPct }]} />
      </View>
    </TouchableOpacity>
  );
};

const CtrlBtn = ({ name, size = 28, color = C.text, onPress, disabled }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7} disabled={disabled} style={disabled && { opacity: 0.3 }}>
    <MaterialIcons name={name} size={size} color={color} />
  </TouchableOpacity>
);

// Improved formatter to handle empty states gracefully
const formatTime = secs => {
  if (!secs || isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export const PlayerScreen = ({ 
  onClose, 
  currentTime = 0, 
  duration = 0, 
  isPlaying = false, 
  onTogglePlay, 
  onSeek 
}) => {
  const { 
    audioUrl, 
    currentPlayingTitle, 
    currentArtist, 
    currentArtwork, 
    playerLoading,
    playNext,      // <-- EXTRACTED NEXT CONTROL
    playPrevious   // <-- EXTRACTED PREVIOUS CONTROL
  } = usePlayerStore();

  const [liked, setLiked] = React.useState(false);
  const [shuffled, setShuffled] = React.useState(false);
  const [repeatMode, setRepeat] = React.useState(0); 
  
  const isStopped = !audioUrl && !playerLoading;
  
  // Calculate progress based on real duration
  const safeDuration = duration > 0 ? duration : 1; 
  const progress = isStopped ? 0 : (currentTime / safeDuration);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient colors={['#5038a0', '#121212']} style={StyleSheet.absoluteFill} />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onClose}>
          <MaterialIcons name="keyboard-arrow-down" size={35} color={C.text} />
        </TouchableOpacity>
        <View style={styles.topCenter}>
          <Text style={styles.topLabel}>{isStopped ? 'PLAYER' : 'NOW PLAYING'}</Text>
        </View>
        <TouchableOpacity>
          <MaterialIcons name="more-vert" size={28} color={C.text} />
        </TouchableOpacity>
      </View>

      {/* Album Art */}
      <View style={styles.artWrap}>
        {currentArtwork && !isStopped ? (
          <Image source={{ uri: currentArtwork }} style={styles.albumArt} />
        ) : (
          <LinearGradient colors={['#7358ff', '#c400ff']} style={[styles.albumArt, isStopped && { opacity: 0.5 }]}>
            <MaterialIcons name={isStopped ? "music-off" : "music-note"} size={100} color="rgba(255,255,255,0.2)" />
          </LinearGradient>
        )}
      </View>

      {/* Track Info */}
      <View style={styles.infoRow}>
        <View style={styles.infoText}>
          <Text style={styles.trackTitle} numberOfLines={1}>
            {isStopped ? 'No song being played' : (currentPlayingTitle || 'Unknown Track')}
          </Text>
          <Text style={styles.trackArtist} numberOfLines={1}>
            {isStopped ? 'Browse your library to play music' : (currentArtist || 'Unknown Artist')}
          </Text>
        </View>
        <TouchableOpacity onPress={() => setLiked(!liked)} disabled={isStopped}>
          <MaterialIcons
            name={liked && !isStopped ? 'favorite' : 'favorite-border'}
            size={30}
            color={liked && !isStopped ? C.green : (isStopped ? C.surface2 : C.text)}
          />
        </TouchableOpacity>
      </View>

      {/* Progress */}
      <ProgressBar 
        progress={progress} 
        duration={duration} 
        onSeek={onSeek} 
        disabled={isStopped || duration === 0} 
      />
      <View style={styles.timeRow}>
        <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
        <Text style={styles.timeText}>-{formatTime(duration - currentTime)}</Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <CtrlBtn name="shuffle" size={24} color={shuffled ? C.green : C.muted} onPress={() => setShuffled(!shuffled)} disabled={isStopped} />
        
        {/* Previous Track Button */}
        <CtrlBtn name="skip-previous" size={45} onPress={playPrevious} disabled={isStopped} />

        {/* Play/Pause Button */}
        <TouchableOpacity 
          style={[styles.playBtn, isStopped && { opacity: 0.5 }]} 
          onPress={isStopped ? null : onTogglePlay}
          activeOpacity={isStopped ? 1 : 0.7}
        >
          <MaterialIcons name={isPlaying && !isStopped ? "pause" : "play-arrow"} size={40} color="#000" />
        </TouchableOpacity>

        {/* Next Track Button */}
        <CtrlBtn name="skip-next" size={45} onPress={playNext} disabled={isStopped} />
        
        <CtrlBtn name={repeatMode === 2 ? 'repeat-one' : 'repeat'} size={24} color={repeatMode > 0 ? C.green : C.muted} onPress={() => setRepeat((repeatMode + 1) % 3)} disabled={isStopped} />
      </View>

      {/* Footer Actions */}
      <View style={styles.bottomActions}>
        <MaterialIcons name="devices" size={24} color={isStopped ? C.surface2 : C.muted} />
        <MaterialIcons name="playlist-play" size={28} color={isStopped ? C.surface2 : C.muted} />
      </View>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingTop: 10 },
  topCenter: { alignItems: 'center' },
  topLabel: { color: C.text, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  artWrap: { alignItems: 'center', marginVertical: 40 },
  albumArt: { width: SCREEN_W - 60, height: SCREEN_W - 60, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 30, marginBottom: 20 },
  infoText: { flex: 1, paddingRight: 15 },
  trackTitle: { color: C.text, fontSize: 24, fontWeight: '800' },
  trackArtist: { color: C.muted, fontSize: 16, fontWeight: '500' },
  progressArea: { paddingHorizontal: 30, height: 20, justifyContent: 'center' },
  progressTrack: { height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2 },
  progressFill: { height: '100%', backgroundColor: '#FFF', borderRadius: 2 },
  progressKnob: { position: 'absolute', width: 12, height: 12, borderRadius: 6, backgroundColor: '#FFF', top: -4, marginLeft: -6 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 30 },
  timeText: { color: C.muted, fontSize: 12 },
  controls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 30, marginTop: 20 },
  playBtn: { width: 75, height: 75, borderRadius: 37.5, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  bottomActions: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 30, marginTop: 40 },
});