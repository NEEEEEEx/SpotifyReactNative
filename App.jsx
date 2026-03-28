import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { RootNavigator } from './src/app/navigation/RootNavigator';
import { enableScreens } from 'react-native-screens';
import { COLORS } from './src/shared/theme/color';

// 1. IMPORT THE GLOBAL PLAYER
import { MiniPlayer } from './src/shared/components/MiniPlayer';

enableScreens();

// Define a custom theme using your COLORS
const SpotifyTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: COLORS.bgBase, // This kills the white background
    card: COLORS.bgBase, // Changes header/nav background
    text: COLORS.textMain, // Default text color
    border: 'transparent', // Removes thin lines between screens
  },
};

const App = () => (
  <NavigationContainer theme={SpotifyTheme}>
    <RootNavigator />
    
    {/* 2. MOUNT THE GLOBAL PLAYER */}
    <MiniPlayer />
  </NavigationContainer>
);

export default App;