import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import authService from '../services/authService';

const LoginScreen = () => {
  const handleLogin = async () => {
    try {
      const url = await authService.getAuthUrl(); // Generates PKCE & URL
      await Linking.openURL(url); // Opens browser
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Spotify Vanilla</Text>
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>LOGIN WITH SPOTIFY</Text>
      </TouchableOpacity>
    </View>
  );
};


export default LoginScreen;