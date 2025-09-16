import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../stores/useAuthStore';

export default function HomeScreen() {
  const { team, logout } = useAuthStore();

  const handlePhoneCall = () => {
    const phoneNumber = '18008675309';
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout, style: 'destructive' },
      ],
      { cancelable: true }
    );
  };

  if (!team) return null;

  return (
    <SafeAreaView className="flex-1 bg-light">
      <ScrollView className="flex-1 px-4">
        {/* Team Info Card */}
        <View className="bg-white rounded-2xl p-6 mt-4 shadow-sm">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-2xl font-bold text-dark">{team.name}</Text>
            <View
              className="w-8 h-8 rounded-full"
              style={{ backgroundColor: team.color }}
            />
          </View>
          
          <View className="space-y-2">
            <View className="flex-row items-center">
              <Ionicons name="people-outline" size={20} color="#6B7280" />
              <Text className="ml-2 text-gray-600">Members:</Text>
            </View>
            <Text className="text-base text-dark ml-7">{team.members}</Text>
          </View>
        </View>

        {/* Quick Reference Card */}
        <View className="bg-white rounded-2xl p-6 mt-4 shadow-sm">
          <Text className="text-xl font-bold text-dark mb-4">Quick Reference</Text>
          
          <TouchableOpacity
            onPress={handlePhoneCall}
            className="flex-row items-center justify-between bg-primary/10 rounded-lg p-4"
          >
            <View className="flex-row items-center">
              <Ionicons name="call-outline" size={24} color="#4ECDC4" />
              <View className="ml-3">
                <Text className="text-sm text-gray-600">Leon's Phone</Text>
                <Text className="text-base font-semibold text-dark">
                  1-800-867-5309
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#4ECDC4" />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View className="bg-white rounded-2xl p-6 mt-4 shadow-sm">
          <Text className="text-xl font-bold text-dark mb-4">Quick Actions</Text>
          
          <View className="space-y-3">
            <TouchableOpacity className="flex-row items-center justify-between bg-accent/10 rounded-lg p-4">
              <View className="flex-row items-center">
                <Ionicons name="camera-outline" size={24} color="#45B7D1" />
                <Text className="ml-3 text-base font-medium text-dark">
                  Upload GPX File
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#45B7D1" />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center justify-between bg-secondary/10 rounded-lg p-4">
              <View className="flex-row items-center">
                <Ionicons name="qr-code-outline" size={24} color="#FF6B6B" />
                <Text className="ml-3 text-base font-medium text-dark">
                  Scan Challenge QR
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#FF6B6B" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-red-500 rounded-lg py-4 mt-6 mb-8"
        >
          <Text className="text-white text-center font-bold text-base">
            Logout
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}