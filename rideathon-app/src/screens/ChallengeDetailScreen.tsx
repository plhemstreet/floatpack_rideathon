import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { dbHelpers } from '../lib/supabase';
import { Challenge, ChallengeStatus } from '../types';
import { useAuthStore } from '../stores/useAuthStore';

export default function ChallengeDetailScreen({ route, navigation }: any) {
  const { team } = useAuthStore();
  const { challenge } = route.params;
  const [isProcessing, setIsProcessing] = useState(false);
  const [hashInputVisible, setHashInputVisible] = useState(false);
  const [enteredHash, setEnteredHash] = useState('');
  const [hashValidated, setHashValidated] = useState(false);

  const isChallengeDisabled = (status: ChallengeStatus) => {
    return status === ChallengeStatus.COMPLETED || status === ChallengeStatus.FORFEITED;
  };

  const handleChallengeSelect = () => {
    // If challenge is completed or forfeited, show details directly
    if (isChallengeDisabled(challenge.status)) {
      setHashValidated(true);
      return;
    }
    
    // For available/active challenges, require hash input
    setHashInputVisible(true);
  };

  const validateHash = async () => {
    if (!enteredHash.trim()) {
      Alert.alert('Error', 'Please enter a hash');
      return;
    }

    try {
      setIsProcessing(true);
      
      // Check if the entered hash matches the challenge's hash
      const challengeFromHash = await dbHelpers.getChallengeByUuid(enteredHash.trim());
      
      if (challengeFromHash && challengeFromHash.id === challenge.id) {
        setHashInputVisible(false);
        setEnteredHash('');
        setHashValidated(true);
      } else {
        Alert.alert('Invalid Hash', 'The entered hash does not match this challenge');
        setEnteredHash('');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to validate hash');
    } finally {
      setIsProcessing(false);
    }
  };

  const startChallenge = async () => {
    if (!team) return;

    try {
      setIsProcessing(true);
      
      // Update challenge status to active
      await dbHelpers.updateChallengeStatus(challenge.id, ChallengeStatus.ACTIVE, team.id);
      
      // Create a modifier if pause_distance is true
      if (challenge.pause_distance) {
        await dbHelpers.createModifier({
          multiplier: 0,
          creator_id: team.id,
          receiver_id: team.id,
          challenge_id: challenge.id,
          start: new Date().toISOString(),
          created_at: new Date().toISOString(),
        });
      }
      
      Alert.alert('Success', `Started challenge: ${challenge.name}`);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to start challenge');
    } finally {
      setIsProcessing(false);
    }
  };

  const completeChallenge = async () => {
    try {
      setIsProcessing(true);
      
      // Update challenge status to completed
      await dbHelpers.updateChallengeStatus(challenge.id, ChallengeStatus.COMPLETED);
      
      Alert.alert('Success', `Completed challenge: ${challenge.name}`);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to complete challenge');
    } finally {
      setIsProcessing(false);
    }
  };

  const forfeitChallenge = async () => {
    if (!team) return;

    Alert.alert(
      'Forfeit Challenge',
      'Are you sure you want to forfeit this challenge? You will receive a -5 mile penalty.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Forfeit',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsProcessing(true);
              
              // Update challenge status to forfeited
              await dbHelpers.updateChallengeStatus(challenge.id, ChallengeStatus.FORFEITED);
              
              // Create penalty offset
              await dbHelpers.createOffset({
                distance: -5,
                creator_id: team.id,
                receiver_id: team.id,
                challenge_id: challenge.id,
                created_at: new Date().toISOString(),
              });
              
              Alert.alert('Challenge Forfeited', 'A -5 mile penalty has been applied');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to forfeit challenge');
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: ChallengeStatus) => {
    switch (status) {
      case ChallengeStatus.AVAILABLE:
        return 'status-available';
      case ChallengeStatus.ACTIVE:
        return 'status-active';
      case ChallengeStatus.COMPLETED:
        return 'status-completed';
      case ChallengeStatus.FORFEITED:
        return 'status-forfeited';
      default:
        return 'status-available';
    }
  };

  const isDisabled = isChallengeDisabled(challenge.status);
  const canViewDetails = isDisabled || hashValidated;

  return (
    <View className="flex-1 sunset-gradient">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-6 pt-12 pb-6">
          <View className="sunset-card p-6">
            <View className="flex-row items-center justify-between mb-6">
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                className="w-10 h-10 bg-white rounded-xl items-center justify-center"
              >
                <Ionicons name="arrow-back" size={20} color="#f2760a" />
              </TouchableOpacity>
              <View className={`px-4 py-2 rounded-2xl ${getStatusColor(challenge.status)}`}>
                <Text className="text-sm font-bold capitalize">
                  {challenge.status}
                </Text>
              </View>
            </View>
            
            <Text className="text-4xl font-bold text-white mb-3">
              {challenge.name}
            </Text>
            <Text className="text-white/80 text-xl leading-7">
              {challenge.description}
            </Text>
            <View className="h-1 bg-white/30 rounded-full mt-4"></View>
          </View>
        </View>

        {/* Challenge Details */}
        {canViewDetails ? (
          <View className="px-6 pb-8">
            {challenge.pause_distance && (
              <View className="sunset-card p-6 mb-6">
                <View className="flex-row items-center mb-3">
                  <View className="w-10 h-10 bg-warning/20 rounded-xl items-center justify-center mr-3">
                    <Ionicons name="pause-circle-outline" size={24} color="#f59e0b" />
                  </View>
                  <Text className="text-warning text-xl font-bold">
                    Distance Paused
                  </Text>
                </View>
                <Text className="text-warning text-lg leading-6">
                  Distance tracking will be paused during this challenge
                </Text>
              </View>
            )}

            {challenge.start && (
              <View className="sunset-card p-6 mb-6">
                <View className="flex-row items-center mb-3">
                  <View className="w-10 h-10 bg-sky-100 rounded-xl items-center justify-center mr-3">
                    <Ionicons name="time-outline" size={24} color="#0ea5e9" />
                  </View>
                  <Text className="text-sky-700 text-xl font-bold">
                    Started
                  </Text>
                </View>
                <Text className="text-sky-700 text-lg">
                  {format(new Date(challenge.start), 'MMM dd, yyyy HH:mm')}
                </Text>
              </View>
            )}

            {/* Action buttons based on status */}
            <View className="mt-8">
              {challenge.status === ChallengeStatus.AVAILABLE && (
                <TouchableOpacity
                  onPress={startChallenge}
                  disabled={isProcessing}
                  className="sunset-button mb-4"
                >
                  <Text className="text-white text-center font-bold text-xl">
                    {isProcessing ? 'Starting...' : 'Start Challenge'}
                  </Text>
                </TouchableOpacity>
              )}

              {challenge.status === ChallengeStatus.ACTIVE && (
                <>
                  <TouchableOpacity
                    onPress={completeChallenge}
                    disabled={isProcessing}
                    className="sunset-button-secondary mb-4"
                  >
                    <Text className="text-white text-center font-bold text-xl">
                      {isProcessing ? 'Completing...' : 'Complete Challenge'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={forfeitChallenge}
                    disabled={isProcessing}
                    className="sunset-button-accent"
                  >
                    <Text className="text-white text-center font-bold text-xl">
                      {isProcessing ? 'Forfeiting...' : 'Forfeit Challenge'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {(challenge.status === ChallengeStatus.COMPLETED || challenge.status === ChallengeStatus.FORFEITED) && (
                <View className="sunset-card p-6">
                  <Text className="text-sunset-600 text-center text-lg font-semibold">
                    This challenge has been {challenge.status.toLowerCase()}
                  </Text>
                </View>
              )}
            </View>
          </View>
        ) : (
          <View className="px-6 pb-8">
            <View className="sunset-card-elevated p-8 items-center">
              <View className="w-20 h-20 sunset-gradient rounded-full items-center justify-center mb-6">
                <Ionicons name="lock-closed-outline" size={40} color="white" />
              </View>
              <Text className="text-sunset-600 mt-4 text-center text-xl font-bold mb-2">
                Enter the challenge hash to view details
              </Text>
              <TouchableOpacity
                onPress={handleChallengeSelect}
                className="mt-6 sunset-button px-8"
              >
                <Text className="text-white font-bold text-lg">
                  Enter Hash
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Hash Input Modal */}
      <Modal
        visible={hashInputVisible}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setHashInputVisible(false);
          setEnteredHash('');
        }}
      >
        <View className="flex-1 justify-center bg-black/50">
          <View className="sunset-card-elevated p-8 mx-6">
            <Text className="text-2xl font-bold text-dark mb-3">
              Enter Challenge Hash
            </Text>
            <Text className="text-sunset-600 mb-6 text-lg">
              Please enter the hash for: {challenge.name}
            </Text>
            
            <TextInput
              value={enteredHash}
              onChangeText={setEnteredHash}
              placeholder="Enter hash..."
              className="border-2 border-sunset-200 rounded-2xl px-6 py-4 mb-6 text-lg font-medium"
              autoCapitalize="none"
              autoCorrect={false}
            />
            
            <View className="flex-row space-x-4">
              <TouchableOpacity
                onPress={() => {
                  setHashInputVisible(false);
                  setEnteredHash('');
                }}
                className="flex-1 bg-sunset-200 rounded-2xl py-4"
              >
                <Text className="text-sunset-700 text-center font-bold text-lg">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={validateHash}
                disabled={isProcessing}
                className="flex-1 sunset-button"
              >
                <Text className="text-white text-center font-bold text-lg">
                  {isProcessing ? 'Validating...' : 'Validate'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
