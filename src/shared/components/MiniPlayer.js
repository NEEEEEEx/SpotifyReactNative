import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Modal 
} from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { WebView } from 'react-native-webview';

// ─── Global Store & Screens ───────────────────────────────────────────────────
import usePlayerStore from '../../app/store/playerStore';
import { PlayerScreen } from '../../features/player/screens/PlayerScreen';

// ─── Theme ────────────────────────────────────────────────────────────────────
const C = { 
  green: '#1DB954', 
  text: '#FFFFFF',
  bg: '#121212'
};

export const MiniPlayer = () => {
  const { 
    audioUrl, 
    currentPlayingTitle, 
    currentArtist, 
    playerLoading, 
    stopTrack 
  } = usePlayerStore();
  
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  // ─── NEW: Real-time Audio State ──────────────────────────────────────────────
  const webViewRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // ─── NEW: WebView Controllers ────────────────────────────────────────────────
  const togglePlayPause = () => {
    if (!webViewRef.current) return;
    const script = isPlaying 
      ? "document.getElementById('player').pause(); true;" 
      : "document.getElementById('player').play(); true;";
    webViewRef.current.injectJavaScript(script);
  };

  const seekTo = (timeInSeconds) => {
    if (!webViewRef.current) return;
    const script = `document.getElementById('player').currentTime = ${timeInSeconds}; true;`;
    webViewRef.current.injectJavaScript(script);
    setCurrentTime(timeInSeconds); // Optimistic UI update
  };

  if (!audioUrl && !playerLoading && !isPlayerOpen) return null;

  return (
    <>
      {/* 1. The Floating Mini Player Bar */}
      {!isPlayerOpen && (audioUrl || playerLoading) && (
        <TouchableOpacity 
          style={styles.floatingPlayer} 
          activeOpacity={0.95} 
          onPress={() => setIsPlayerOpen(true)}
        >
          <View style={styles.infoContainer}>
            {playerLoading && (
              <ActivityIndicator size="small" color={C.green} style={{ marginRight: 12 }} />
            )}
            <View style={styles.textContainer}>
              <Text style={styles.nowPlayingText} numberOfLines={1}>
                {playerLoading ? 'Loading stream...' : currentPlayingTitle}
              </Text>
              {!playerLoading && currentArtist ? (
                 <Text style={styles.artistText} numberOfLines={1}>
                   {currentArtist}
                 </Text>
              ) : null}
            </View>
          </View>

          {/* Replaced Stop with Play/Pause for the Mini Player, but kept the stop layout style */}
          <TouchableOpacity 
            style={styles.stopButton} 
            onPress={(e) => {
              e.stopPropagation(); 
              togglePlayPause();
            }}
          >
            <MaterialIcons name={isPlaying ? "pause" : "play-arrow"} size={26} color="#FFF" />
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      {/* 2. The Full-Screen Player Modal */}
      <Modal
        animationType="slide"
        visible={isPlayerOpen}
        onRequestClose={() => setIsPlayerOpen(false)}
        presentationStyle="fullScreen"
      >
        <PlayerScreen 
          onClose={() => setIsPlayerOpen(false)} 
          // ─── NEW: Pass real state and controllers to UI ───
          currentTime={currentTime}
          duration={duration}
          isPlaying={isPlaying}
          onTogglePlay={togglePlayPause}
          onSeek={seekTo}
        />
      </Modal>

      {/* 3. The Hidden Audio Engine */}
      {audioUrl && (
        <View style={{ height: 0, width: 0, opacity: 0 }} pointerEvents="none">
          <WebView
            ref={webViewRef} // Attach ref for injectJavaScript
            source={{ 
              html: `
                <html>
                  <body>
                    <audio id="player" autoplay playsinline>
                      <source src="${audioUrl}" type="audio/mpeg">
                    </audio>
                    <script>
                      var audio = document.getElementById('player');
                      
                      const sendToRN = (type, data = {}) => {
                        window.ReactNativeWebView.postMessage(JSON.stringify({ type, ...data }));
                      };

                      audio.play(); 
                      
                      // ─── NEW: Added comprehensive event listeners ───
                      audio.addEventListener('timeupdate', () => {
                        sendToRN('progress', { currentTime: audio.currentTime, duration: audio.duration });
                      });
                      audio.addEventListener('play', () => sendToRN('play'));
                      audio.addEventListener('pause', () => sendToRN('pause'));
                      audio.addEventListener('ended', () => sendToRN('ended'));
                      audio.addEventListener('error', (e) => sendToRN('error', { message: e.message || 'Unknown Error' }));
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
              // ─── NEW: Parse JSON messages and update React Native state ───
              try {
                const data = JSON.parse(event.nativeEvent.data);
                
                switch(data.type) {
                  case 'progress':
                    setCurrentTime(data.currentTime || 0);
                    // duration is NaN until audio metadata loads, handle gracefully
                    setDuration(isNaN(data.duration) ? 0 : data.duration); 
                    break;
                  case 'play':
                    setIsPlaying(true);
                    break;
                  case 'pause':
                    setIsPlaying(false);
                    break;
                  case 'ended':
                  case 'error':
                    setIsPlaying(false);
                    stopTrack();
                    break;
                }
              } catch (e) {
                console.log("Failed to parse WebView message", event.nativeEvent.data);
              }
            }}
          />
        </View>
      )}
    </>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  floatingPlayer: {
    position: 'absolute',
    bottom: 120, 
    left: 8,
    right: 8,
    backgroundColor: '#3E2723', 
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 9999, 
  },
  infoContainer: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  textContainer: { flex: 1, justifyContent: 'center' },
  nowPlayingText: { color: C.text, fontSize: 14, fontWeight: '700', marginBottom: 2 },
  artistText: { color: '#B3B3B3', fontSize: 12, fontWeight: '500' }, 
  stopButton: { padding: 8, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
});