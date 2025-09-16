import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView , SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../stores/useAuthStore';

export default function HomeScreen() {
  const { team, logout } = useAuthStore();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 10,
    },
    button: {
      alignItems: 'center',
      backgroundColor: '#DDDDDD',
      padding: 10,
    },
    countContainer: {
      alignItems: 'center',
      padding: 10,
    },
  });
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
    <View className="flex-1 sunset-gradient">
      <ScrollView className="flex-1 px-6">
        {/* Team Info Card */}
        <View className="sunset-card p-8 mt-12">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-3xl font-bold text-dark">{team.name}</Text>
            <View
              className="w-12 h-12 rounded-2xl"
              style={{ backgroundColor: team.color }}
            />
          </View>
          
          <View className="space-y-3">
            <View className="flex-row items-center">
              <View className="w-10 h-10 sunset-gradient rounded-xl items-center justify-center mr-3">
                <Ionicons name="people-outline" size={24} color="white" />
              </View>
              <Text className="text-sunset-600 text-lg font-semibold">Members:</Text>
            </View>
            <Text className="text-2xl font-bold text-dark ml-13">{team.members}</Text>
          </View>
          <View className="h-1 sunset-gradient rounded-full mt-6"></View>
        </View>

        {/* Quick Reference Card */}
        <View className="sunset-card p-8 mt-6">
          <Text className="text-2xl font-bold text-dark mb-6">Quick Reference</Text>
          
          <TouchableOpacity
            onPress={handlePhoneCall}
            className="flex-row items-center justify-between bg-sunset-100 rounded-2xl p-6"
          >
            <View className="flex-row items-center">
              <View className="w-12 h-12 sunset-gradient rounded-xl items-center justify-center mr-4">
                <Ionicons name="call-outline" size={24} color="white" />
              </View>
              <View>
                <Text className="text-sunset-600 text-base font-semibold">Leon's Phone</Text>
                <Text className="text-xl font-bold text-dark">
                  1-800-867-5309
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#f2760a" />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View className="sunset-card p-8 mt-6">
          <Text className="text-2xl font-bold text-dark mb-6">Quick Actions</Text>
          
          <View className="space-y-4">
            <TouchableOpacity className="flex-row items-center justify-between bg-sky-100 rounded-2xl p-6">
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-sky-500 rounded-xl items-center justify-center mr-4">
                  <Ionicons name="camera-outline" size={24} color="white" />
                </View>
                <Text className="text-xl font-bold text-dark">
                  Upload GPX File
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#0ea5e9" />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center justify-between bg-lavender-100 rounded-2xl p-6">
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-lavender-500 rounded-xl items-center justify-center mr-4">
                  <Ionicons name="qr-code-outline" size={24} color="white" />
                </View>
                <Text className="text-xl font-bold text-dark">
                  Scan Challenge QR
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#a855f7" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          className="sunset-button-secondary mt-8 mb-20"
          style={styles.button}
        >
          <Text className="text-white text-center font-bold text-xl">
            Logout
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}