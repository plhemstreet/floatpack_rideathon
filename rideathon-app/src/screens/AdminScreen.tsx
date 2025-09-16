import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { dbHelpers } from '../lib/supabase';
import { defaultConfig } from '../config/defaultConfig';

interface DatabaseStatus {
  teams: number;
  challenges: number;
  modifiers: number;
  offsets: number;
}

export default function AdminScreen() {
  const [status, setStatus] = useState<DatabaseStatus>({
    teams: 0,
    challenges: 0,
    modifiers: 0,
    offsets: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [yamlContent, setYamlContent] = useState('');

  const fetchDatabaseStatus = async () => {
    try {
      const teams = await dbHelpers.getTeams();
      const challenges = await dbHelpers.getChallenges();
      
      setStatus({
        teams: teams?.length || 0,
        challenges: challenges?.length || 0,
        modifiers: 0, // Would need to add these to dbHelpers
        offsets: 0,   // Would need to add these to dbHelpers
      });
    } catch (error) {
      console.error('Error fetching database status:', error);
    }
  };

  useEffect(() => {
    fetchDatabaseStatus();
  }, []);

  const handleClearDatabase = () => {
    Alert.alert(
      'Clear Database',
      'Are you sure you want to clear all data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              const result = await dbHelpers.clearDatabase();
              Alert.alert('Success', result.message);
              fetchDatabaseStatus();
            } catch (error: any) {
              Alert.alert('Error', error.message);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handlePopulateFromDefault = async () => {
    setIsLoading(true);
    try {
      const result = await dbHelpers.populateFromConfig(defaultConfig);
      Alert.alert('Success', result.message);
      fetchDatabaseStatus();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePopulateFromYaml = async () => {
    if (!yamlContent.trim()) {
      Alert.alert('Error', 'Please enter YAML content');
      return;
    }

    setIsLoading(true);
    try {
      // Parse YAML content (you'd need to install and use a YAML parser like js-yaml)
      const config = JSON.parse(yamlContent); // For now, expecting JSON
      const result = await dbHelpers.populateFromConfig(config);
      Alert.alert('Success', result.message);
      setYamlContent('');
      fetchDatabaseStatus();
    } catch (error: any) {
      Alert.alert('Error', 'Invalid YAML/JSON format');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'text/plain'],
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        // Read file content
        const response = await fetch(result.uri);
        const text = await response.text();
        setYamlContent(text);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to read file');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-light">
      <ScrollView className="flex-1 px-4">
        {/* Database Management */}
        <View className="bg-white rounded-2xl p-6 mt-4 shadow-sm">
          <Text className="text-xl font-bold text-dark mb-4">
            Database Management
          </Text>

          <View className="space-y-3">
            <TouchableOpacity
              onPress={handleClearDatabase}
              disabled={isLoading}
              className="bg-red-500 rounded-lg py-3 px-4 flex-row items-center justify-center"
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="trash-outline" size={20} color="white" />
                  <Text className="text-white font-medium ml-2">
                    Clear Database
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handlePopulateFromDefault}
              disabled={isLoading}
              className="bg-primary rounded-lg py-3 px-4 flex-row items-center justify-center"
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="document-outline" size={20} color="white" />
                  <Text className="text-white font-medium ml-2">
                    Populate from Default Config
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Database Status */}
        <View className="bg-white rounded-2xl p-6 mt-4 shadow-sm">
          <Text className="text-xl font-bold text-dark mb-4">
            Database Status
          </Text>

          <View className="flex-row flex-wrap">
            <View className="w-1/2 p-2">
              <View className="bg-primary/10 rounded-lg p-4">
                <Text className="text-3xl font-bold text-primary">
                  {status.teams}
                </Text>
                <Text className="text-gray-600 mt-1">Teams</Text>
              </View>
            </View>

            <View className="w-1/2 p-2">
              <View className="bg-accent/10 rounded-lg p-4">
                <Text className="text-3xl font-bold text-accent">
                  {status.challenges}
                </Text>
                <Text className="text-gray-600 mt-1">Challenges</Text>
              </View>
            </View>

            <View className="w-1/2 p-2">
              <View className="bg-secondary/10 rounded-lg p-4">
                <Text className="text-3xl font-bold text-secondary">
                  {status.modifiers}
                </Text>
                <Text className="text-gray-600 mt-1">Modifiers</Text>
              </View>
            </View>

            <View className="w-1/2 p-2">
              <View className="bg-yellow-100 rounded-lg p-4">
                <Text className="text-3xl font-bold text-yellow-600">
                  {status.offsets}
                </Text>
                <Text className="text-gray-600 mt-1">Offsets</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Upload Configuration */}
        <View className="bg-white rounded-2xl p-6 mt-4 mb-8 shadow-sm">
          <Text className="text-xl font-bold text-dark mb-4">
            Upload Configuration
          </Text>

          <Text className="text-gray-600 mb-2">
            Paste JSON configuration:
          </Text>
          
          <TextInput
            className="border border-gray-300 rounded-lg p-3 min-h-[120px] mb-3"
            multiline
            placeholder='{"teams": [...], "challenges": [...]}'
            value={yamlContent}
            onChangeText={setYamlContent}
            textAlignVertical="top"
          />

          <View className="flex-row space-x-2">
            <TouchableOpacity
              onPress={handleFileUpload}
              className="flex-1 bg-gray-200 rounded-lg py-3"
            >
              <Text className="text-center font-medium">
                Pick File
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handlePopulateFromYaml}
              disabled={isLoading || !yamlContent}
              className={`flex-1 rounded-lg py-3 ${
                yamlContent ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <Text className={`text-center font-medium ${
                yamlContent ? 'text-white' : 'text-gray-500'
              }`}>
                Upload Config
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}