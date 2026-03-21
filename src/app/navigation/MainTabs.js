import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';

import { HomeScreen } from '../../features/home/screens/HomeScreen';
import { SearchScreen } from '../../features/search/screens/SearchScreen';
import { LibraryScreen } from '../../features/library/screens/LibraryScreen';
import { COLORS } from '../../shared/theme/color.js';

const Tab = createBottomTabNavigator();

export const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: COLORS.spotifyGreen,
      tabBarInactiveTintColor: COLORS.textSubdued,
      // We do NOT use position: 'absolute' here.
      // This ensures the screen content stops exactly at the top of the bar.
      tabBarStyle: styles.tabBar,
      tabBarLabelStyle: styles.tabBarLabel,
      tabBarIcon: ({ color }) => {
        let iconName;
        if (route.name === 'Home') iconName = 'home';
        else if (route.name === 'Search') iconName = 'search';
        else if (route.name === 'Library') iconName = 'library-music';
        else if (route.name === 'Player') iconName = 'play-circle-filled';

        return <MaterialIcons name={iconName} size={28} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Search" component={SearchScreen} />
    <Tab.Screen name="Library" component={LibraryScreen} />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.bgBase,
    borderTopWidth: 0,

    // This is what you wanted: The bar is pushed up from the bottom
    // But because position isn't absolute, the SCREEN stops here too.
    marginBottom: 40,

    // Give it height so it looks like the Spotify bar
    height: 60,
    paddingBottom: 0,
    elevation: 0,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 5,
  },
});
