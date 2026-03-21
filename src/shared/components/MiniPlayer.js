import React, { useState } from 'react';
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

  // CRITICAL FIX: Do not unmount the whole component if the full-screen player is open!
  if (!audioUrl && !playerLoading && !isPlayerOpen) return null;

  return (
    <>
      {/* 1. The Floating Mini Player Bar - ONLY SHOW WHEN MODAL IS CLOSED */}
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

          <TouchableOpacity 
            style={styles.stopButton} 
            onPress={(e) => {
              e.stopPropagation(); 
              stopTrack();
            }}
          >
            <MaterialIcons name="stop" size={26} color="#FFF" />
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
        <PlayerScreen onClose={() => setIsPlayerOpen(false)} />
      </Modal>

      {/* 3. The Hidden Audio Engine */}
      {audioUrl && (
        <View style={{ height: 0, width: 0, opacity: 0 }} pointerEvents="none">
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
                      audio.addEventListener('error', () => { window.ReactNativeWebView.postMessage('error'); });
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
              if (event.nativeEvent.data === 'ended' || event.nativeEvent.data === 'error') {
                stopTrack();
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