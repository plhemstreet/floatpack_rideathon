import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../stores/useAuthStore';
import { dbHelpers } from '../lib/supabase';
import { defaultConfig } from '../config/defaultConfig';

export default function LoginScreen() {
  const [teamName, setTeamName] = useState('');
  const [secretCode, setSecretCode] = useState('');
  const { login, isLoading, error } = useAuthStore();

  const handleLogin = async () => {
    if (!teamName || !secretCode) {
      Alert.alert('Error', 'Please enter both team name and secret code');
      return;
    }

    const success = await login(teamName, secretCode);
    if (!success && error) {
      Alert.alert('Login Failed', error);
    }
  };

  const handleSetupDatabase = async () => {
    try {
      console.log('Setting up database with default config...');
      const success = await dbHelpers.populateDefaultData(defaultConfig.teams as any, defaultConfig.challenges as any);
      if (success) {
        Alert.alert('Success', 'Database setup complete! You can now login with:\n\nTeam Alpha: alpha2024\nTeam Beta: beta2024\nTeam Gamma: gamma2024');
      } else {
        Alert.alert('Error', 'Database setup failed. Check console for errors.');
      }
    } catch (error: any) {
      console.error('Database setup error:', error);
      Alert.alert('Error', 'Database setup failed: ' + error.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 sunset-gradient">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 justify-center px-8">
          <View className="sunset-card-elevated p-10">
            <View className="mb-10">
              <Text className="text-5xl font-bold text-center sunset-text-primary mb-3">
                Float Pack
              </Text>
              <Text className="text-3xl font-bold text-center text-dark">
                Ride-a-thon
              </Text>
              <View className="h-2 sunset-gradient rounded-full mt-4"></View>
            </View>

            <View className="space-y-6">
              <View>
                <Text className="text-dark text-lg font-semibold mb-3">Team Name</Text>
                <TextInput
                  className="border-2 border-sunset-200 rounded-2xl px-6 py-4 text-lg font-medium"
                  value={teamName}
                  onChangeText={setTeamName}
                  placeholder="Enter your team name"
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>

              <View>
                <Text className="text-dark text-lg font-semibold mb-3">Secret Code</Text>
                <TextInput
                  className="border-2 border-sunset-200 rounded-2xl px-6 py-4 text-lg font-medium"
                  value={secretCode}
                  onChangeText={setSecretCode}
                  placeholder="Enter your secret code"
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>

              <TouchableOpacity
                className={`sunset-button ${isLoading ? 'opacity-50' : ''}`}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" size="large" />
                ) : (
                  <Text className="text-white text-center font-bold text-xl">
                    Login
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                className="sunset-button-secondary"
                onPress={handleSetupDatabase}
              >
                <Text className="text-white text-center font-bold text-xl">
                  Setup Database
                </Text>
              </TouchableOpacity>
            </View>

            {error && (
              <Text className="text-error text-center mt-6 text-lg font-semibold">{error}</Text>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Keep minimal styles for any remaining custom styling
});