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
      const success = await dbHelpers.populateDefaultData(defaultConfig.teams, defaultConfig.challenges);
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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>
              Float Pack
            </Text>
            <Text style={styles.subtitle}>
              Ride-a-thon
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Team Name</Text>
              <TextInput
                style={styles.input}
                value={teamName}
                onChangeText={setTeamName}
                placeholder="Enter your team name"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Secret Code</Text>
              <TextInput
                style={styles.input}
                value={secretCode}
                onChangeText={setSecretCode}
                placeholder="Enter your secret code"
                secureTextEntry
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>
                  Login
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.setupButton}
              onPress={handleSetupDatabase}
            >
              <Text style={styles.setupButtonText}>
                Setup Database
              </Text>
            </TouchableOpacity>
          </View>

          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#4ECDC4',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    color: '#374151',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#374151',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4ECDC4',
    borderRadius: 8,
    paddingVertical: 16,
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
  },
  setupButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    paddingVertical: 16,
    marginTop: 10,
  },
  setupButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 16,
  },
});