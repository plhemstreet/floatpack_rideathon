import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import ScoreboardScreen from '../screens/ScoreboardScreen';
import ChallengesScreen from '../screens/ChallengesScreen';
import ChallengeDetailScreen from '../screens/ChallengeDetailScreen';
import AdminScreen from '../screens/AdminScreen';
import LoginScreen from '../screens/LoginScreen';
import { useAuthStore } from '../stores/useAuthStore';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function ChallengesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ChallengesList" 
        component={ChallengesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ChallengeDetail" 
        component={ChallengeDetailScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

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
          tabBarActiveTintColor: '#f2760a',
          tabBarInactiveTintColor: '#9CA3AF',
          tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopWidth: 0,
            elevation: 8,
            shadowColor: '#f2760a',
            shadowOffset: {
              width: 0,
              height: -2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            height: 80,
            paddingBottom: 20,
            paddingTop: 10,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginTop: 4,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Scoreboard" component={ScoreboardScreen} />
        <Tab.Screen name="Challenges" component={ChallengesStack} />
        <Tab.Screen name="Admin" component={AdminScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}