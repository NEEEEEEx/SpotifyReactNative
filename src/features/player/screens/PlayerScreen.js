import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Theme ────────────────────────────────────────────────────────────────────
const C = {
  green: '#1DB954',
  bg: '#121212',
  surface2: '#282828',
  surface3: '#3E3E3E',
  text: '#FFFFFF',
  muted: '#B3B3B3',
  subtle: '#535353',
};

// ─── Track Data ───────────────────────────────────────────────────────────────
const TRACKS = [
  {
    id: 1,
    title: 'As It Was',
    artist: 'Harry Styles',
    duration: 167,
    colors: ['#5038a0', '#1a5040'],
    accentColors: ['#7358ff', '#c400ff'],
  },
  {
    id: 2,
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    duration: 200,
    colors: ['#e91429', '#5038a0'],
    accentColors: ['#e91429', '#ff6437'],
  },
];

const formatTime = secs => {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

// ─── Sub-Components ───────────────────────────────────────────────────────────

const ProgressBar = ({ progress, duration, onSeek }) => {
  const barWidth = useRef(0);
  const fillPct = `${Math.min(1, progress) * 100}%`;

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={styles.progressArea}
      onLayout={e => (barWidth.current = e.nativeEvent.layout.width)}
      onPress={e => {
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

const CtrlBtn = ({ name, size = 28, color = C.text, onPress, style }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={style}>
    <MaterialIcons name={name} size={size} color={color} />
  </TouchableOpacity>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export const PlayerScreen = ({ onClose }) => {
  const [trackIdx, setTrackIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [liked, setLiked] = useState(false);
  const [shuffled, setShuffled] = useState(false);
  const [repeatMode, setRepeat] = useState(0); // 0=off, 1=all, 2=one
  const [elapsed, setElapsed] = useState(45);

  const track = TRACKS[trackIdx];
  const progress = elapsed / track.duration;

  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      setElapsed(e => (e >= track.duration ? 0 : e + 1));
    }, 1000);
    return () => clearInterval(id);
  }, [isPlaying, trackIdx]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[track.colors[0], '#121212']}
        style={StyleSheet.absoluteFill}
      />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onClose}>
          <MaterialIcons name="keyboard-arrow-down" size={35} color={C.text} />
        </TouchableOpacity>
        <View style={styles.topCenter}>
          <Text style={styles.topLabel}>PLAYING FROM PLAYLIST</Text>
          <Text style={styles.topSub}>Daily Mix 1</Text>
        </View>
        <TouchableOpacity>
          <MaterialIcons name="more-vert" size={28} color={C.text} />
        </TouchableOpacity>
      </View>

      {/* Album Art */}
      <View style={styles.artWrap}>
        <LinearGradient colors={track.accentColors} style={styles.albumArt}>
          <MaterialIcons
            name="music-note"
            size={100}
            color="rgba(255,255,255,0.2)"
          />
        </LinearGradient>
      </View>

      {/* Track Info */}
      <View style={styles.infoRow}>
        <View style={styles.infoText}>
          <Text style={styles.trackTitle}>{track.title}</Text>
          <Text style={styles.trackArtist}>{track.artist}</Text>
        </View>
        <TouchableOpacity onPress={() => setLiked(!liked)}>
          <MaterialIcons
            name={liked ? 'favorite' : 'favorite-border'}
            size={30}
            color={liked ? C.green : C.text}
          />
        </TouchableOpacity>
      </View>

      {/* Progress */}
      <ProgressBar
        progress={progress}
        duration={track.duration}
        onSeek={setElapsed}
      />
      <View style={styles.timeRow}>
        <Text style={styles.timeText}>{formatTime(elapsed)}</Text>
        <Text style={styles.timeText}>
          -{formatTime(track.duration - elapsed)}
        </Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <CtrlBtn
          name="shuffle"
          size={24}
          color={shuffled ? C.green : C.muted}
          onPress={() => setShuffled(!shuffled)}
        />
        <CtrlBtn
          name="skip-previous"
          size={45}
          onPress={() => setTrackIdx(0)}
        />

        <TouchableOpacity
          style={styles.playBtn}
          onPress={() => setIsPlaying(!isPlaying)}
        >
          <MaterialIcons
            name={isPlaying ? 'pause' : 'play-arrow'}
            size={40}
            color="#000"
          />
        </TouchableOpacity>

        <CtrlBtn name="skip-next" size={45} onPress={() => setTrackIdx(1)} />
        <CtrlBtn
          name={repeatMode === 2 ? 'repeat-one' : 'repeat'}
          size={24}
          color={repeatMode > 0 ? C.green : C.muted}
          onPress={() => setRepeat((repeatMode + 1) % 3)}
        />
      </View>

      {/* Footer Actions */}
      <View style={styles.bottomActions}>
        <MaterialIcons name="devices" size={24} color={C.muted} />
        <MaterialIcons name="playlist-play" size={28} color={C.muted} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  topCenter: { alignItems: 'center' },
  topLabel: {
    color: C.text,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  topSub: { color: C.text, fontSize: 12, fontWeight: '700' },
  artWrap: { alignItems: 'center', marginVertical: 40 },
  albumArt: {
    width: SCREEN_W - 60,
    height: SCREEN_W - 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  infoText: { flex: 1 },
  trackTitle: { color: C.text, fontSize: 24, fontWeight: '800' },
  trackArtist: { color: C.muted, fontSize: 18, fontWeight: '500' },
  progressArea: { paddingHorizontal: 30, height: 20, justifyContent: 'center' },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
  },
  progressFill: { height: '100%', backgroundColor: '#FFF', borderRadius: 2 },
  progressKnob: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFF',
    top: -4,
    marginLeft: -6,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
  },
  timeText: { color: C.muted, fontSize: 12 },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    marginTop: 20,
  },
  playBtn: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    marginTop: 40,
  },
});
