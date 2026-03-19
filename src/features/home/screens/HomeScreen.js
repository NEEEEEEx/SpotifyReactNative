import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const HomeScreen = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Home</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  text: { fontSize: 22, fontWeight: '600', color: '#333' },
});
