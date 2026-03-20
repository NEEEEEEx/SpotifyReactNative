import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../../features/home/screens/HomeScreen';
import { SearchScreen } from '../../features/search/screens/SearchScreen';
import { LibraryScreen } from '../../features/library/screens/LibraryScreen';
import { PlayerScreen } from '../../features/player/screens/PlayerScreen';

// Uncomment once you add an icon library:
// import Icon from 'react-native-vector-icons/Feather';

const Tab = createBottomTabNavigator();

export const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#4F46E5',
      tabBarInactiveTintColor: '#9CA3AF',
      tabBarStyle: {
        borderTopColor: '#F3F4F6',
        paddingBottom: 4,
        height: 58,
        marginBottom: 50,
      },
      // tabBarIcon: ({ color, size, route }) => {
      //   const icons = { Home: 'home', Search: 'search', Library: 'book' };
      //   return <Icon name={icons[route.name]} size={size} color={color} />;
      // },
    }}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Search" component={SearchScreen} />
    <Tab.Screen name="Library" component={LibraryScreen} />
    <Tab.Screen name="Player" component={PlayerScreen} />
  </Tab.Navigator>
);
