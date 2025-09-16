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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../stores/useAuthStore';

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

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 justify-center px-8">
          <View className="mb-8">
            <Text className="text-4xl font-bold text-center text-primary mb-2">
              Float Pack
            </Text>
            <Text className="text-2xl font-semibold text-center text-gray-700">
              Ride-a-thon
            </Text>
          </View>

          <View className="space-y-4">
            <View>
              <Text className="text-gray-700 mb-2 font-medium">Team Name</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                value={teamName}
                onChangeText={setTeamName}
                placeholder="Enter your team name"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            <View>
              <Text className="text-gray-700 mb-2 font-medium">Secret Code</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                value={secretCode}
                onChangeText={setSecretCode}
                placeholder="Enter your secret code"
                secureTextEntry
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity
              className={`bg-primary rounded-lg py-4 mt-4 ${
                isLoading ? 'opacity-50' : ''
              }`}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-center font-bold text-lg">
                  Login
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {error && (
            <Text className="text-red-500 text-center mt-4">{error}</Text>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}