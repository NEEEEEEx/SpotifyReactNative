import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { loginToSpotify } from '../services/spotifyAuth';
import { useAuthStore } from '../../../app/store/authStore';
import { getSpotifyProfile } from '../services/getSpotifyProfile';

const { width: W } = Dimensions.get('window');

// ─── Theme ────────────────────────────────────────────────────────────────────
const C = {
  green: '#1DB954',
  greenDark: '#158a3e',
  greenGlow: 'rgba(29,185,84,0.18)',
  bg: '#0a0a0a',
  surface: '#181818',
  text: '#FFFFFF',
  muted: '#B3B3B3',
  subtle: '#3a3a3a',
  error: '#ff6437',
};

// ─── Animated waveform bars ───────────────────────────────────────────────────
const WaveBar = ({ delay, height }) => {
  const anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: 600 + delay,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0.3,
          duration: 600 + delay,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.waveBar,
        {
          height,
          transform: [{ scaleY: anim }],
          opacity: anim.interpolate({
            inputRange: [0.3, 1],
            outputRange: [0.3, 0.85],
          }),
        },
      ]}
    />
  );
};

const WaveVisual = () => {
  const bars = [18, 32, 48, 38, 56, 28, 44, 36, 52, 24, 40, 30, 50, 22, 42];
  return (
    <View style={styles.waveContainer}>
      {bars.map((h, i) => (
        <WaveBar key={i} height={h} delay={i * 80} />
      ))}
    </View>
  );
};

// ─── Pulsing glow ring behind logo ───────────────────────────────────────────
const GlowRing = () => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.22,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 1800,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.15,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.6,
            duration: 1800,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={[styles.glowRing, { transform: [{ scale }], opacity }]}
    />
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export const LoginScreen = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  // ── exact same store hook as original ─────────────────────────────────────
  const login = useAuthStore(state => state.login);

  // Entrance animations
  const topAnim = useRef(new Animated.Value(0)).current;
  const bottomAnim = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.stagger(180, [
      Animated.spring(topAnim, {
        toValue: 1,
        friction: 7,
        tension: 45,
        useNativeDriver: true,
      }),
      Animated.spring(bottomAnim, {
        toValue: 1,
        friction: 7,
        tension: 45,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // ── exact same handler as original ────────────────────────────────────────
  const handleSpotifyLogin = async () => {
    Animated.sequence([
      Animated.timing(btnScale, {
        toValue: 0.93,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(btnScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    setIsLoading(true);
    setError(null);
    try {
      const token = await loginToSpotify();
      if (token) {
        console.log('Success! Token received:', token);
        const profileData = await getSpotifyProfile(token);
        login(token, profileData);
      }
    } catch (err) {
      setError('Failed to connect to Spotify');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* Full-screen dark gradient */}
      <LinearGradient
        colors={['#0d2018', '#0a0a0a', '#0a0a0a']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
      />

      {/* ── Top: logo + waveform + headline ──────────────────────────────── */}
      <Animated.View
        style={[
          styles.top,
          {
            opacity: topAnim,
            transform: [
              {
                translateY: topAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-32, 0],
                }),
              },
            ],
          },
        ]}
      >
        {/* Pulsing icon */}
        <View style={styles.iconWrap}>
          <GlowRing />
          <View style={styles.iconCircle}>
            <Ionicons name="logo-spotify" size={52} color={C.green} />
          </View>
        </View>

        {/* Animated waveform */}
        <WaveVisual />

        <Text style={styles.headline}>
          Millions of songs.{'\n'}
          <Text style={styles.headlineAccent}>Free on Spotify.</Text>
        </Text>
        <Text style={styles.subtext}>
          Sign in to your account and pick up{'\n'}right where you left off.
        </Text>
      </Animated.View>

      {/* ── Bottom: cta + legal ──────────────────────────────────────────── */}
      <Animated.View
        style={[
          styles.bottom,
          {
            opacity: bottomAnim,
            transform: [
              {
                translateY: bottomAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [40, 0],
                }),
              },
            ],
          },
        ]}
      >
        {/* Error box */}
        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="warning-outline" size={15} color={C.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Primary login button */}
        <Animated.View style={{ transform: [{ scale: btnScale }] }}>
          <TouchableOpacity
            onPress={handleSpotifyLogin}
            disabled={isLoading}
            activeOpacity={1}
            style={styles.btnOuter}
          >
            <LinearGradient
              colors={isLoading ? [C.subtle, C.subtle] : [C.green, C.greenDark]}
              style={styles.btnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <View style={styles.btnContent}>
                  <Ionicons name="logo-spotify" size={22} color="#fff" />
                  <Text style={styles.btnText}>Sign in with Spotify</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.divider} />
        </View>

        {/* Sign up outline */}
        <TouchableOpacity style={styles.signupBtn} activeOpacity={0.75}>
          <Text style={styles.signupText}>Sign up for free</Text>
        </TouchableOpacity>

        {/* Legal */}
        <Text style={styles.legal}>
          By continuing you agree to Spotify's{' '}
          <Text style={styles.legalLink}>Terms of Use</Text> and{' '}
          <Text style={styles.legalLink}>Privacy Policy</Text>.
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
    justifyContent: 'space-between',
  },

  // Top
  top: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 24,
    gap: 20,
  },

  // Icon
  iconWrap: {
    width: 110,
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: C.greenGlow,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: C.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(29,185,84,0.25)',
  },

  // Waveform
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 60,
  },
  waveBar: {
    width: 4,
    borderRadius: 3,
    backgroundColor: C.green,
  },

  // Text
  headline: {
    color: C.text,
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.8,
    lineHeight: 42,
  },
  headlineAccent: {
    color: C.green,
  },
  subtext: {
    color: C.muted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Bottom
  bottom: {
    paddingHorizontal: 28,
    paddingBottom: 32,
  },

  // Error
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,100,55,0.1)',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,100,55,0.25)',
  },
  errorText: {
    color: C.error,
    fontSize: 13,
    fontWeight: '600',
  },

  // Primary button
  btnOuter: {
    borderRadius: 50,
    overflow: 'hidden',
    shadowColor: C.green,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: 20,
  },
  btnGradient: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: C.subtle,
  },
  dividerText: {
    color: C.muted,
    fontSize: 13,
    fontWeight: '600',
  },

  // Sign up
  signupBtn: {
    height: 54,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: C.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  signupText: {
    color: C.text,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Legal
  legal: {
    color: C.subtle,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 17,
  },
  legalLink: {
    color: C.muted,
    textDecorationLine: 'underline',
  },
});
