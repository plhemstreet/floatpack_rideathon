import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import ScoreboardScreen from '../screens/ScoreboardScreen';
import ChallengesScreen from '../screens/ChallengesScreen';
import AdminScreen from '../screens/AdminScreen';
import LoginScreen from '../screens/LoginScreen';
import { useAuthStore } from '../stores/useAuthStore';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <NavigationContainer>
        <LoginScreen />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'home';

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Scoreboard') {
              iconName = focused ? 'trophy' : 'trophy-outline';
            } else if (route.name === 'Challenges') {
              iconName = focused ? 'flag' : 'flag-outline';
            } else if (route.name === 'Admin') {
              iconName = focused ? 'settings' : 'settings-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#4ECDC4',
          tabBarInactiveTintColor: 'gray',
          headerStyle: {
            backgroundColor: '#4ECDC4',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Scoreboard" component={ScoreboardScreen} />
        <Tab.Screen name="Challenges" component={ChallengesScreen} />
        <Tab.Screen name="Admin" component={AdminScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}