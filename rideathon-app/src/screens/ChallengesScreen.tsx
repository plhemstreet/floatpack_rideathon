import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { supabase, dbHelpers } from '../lib/supabase';
import { Challenge, ChallengeStatus } from '../types';
import { useAuthStore } from '../stores/useAuthStore';

export default function ChallengesScreen() {
  const { team } = useAuthStore();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const fetchChallenges = async (isRefresh = false) => {
    if (!team) return;
    
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const data = await dbHelpers.getChallenges();
      setChallenges(data || []);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchChallenges();

    // Set up real-time subscription
    const subscription = supabase
      .channel('challenges')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'challenges',
          filter: `team_id=eq.${team?.id}`,
        },
        () => {
          fetchChallenges();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [team]);

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
    if (status === 'granted') {
      setScannerVisible(true);
    } else {
      Alert.alert('Permission Denied', 'Camera permission is required to scan QR codes');
    }
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setScannerVisible(false);

    try {
      // Parse QR code data - expecting a UUID
      const challenge = await dbHelpers.getChallengeByUuid(data);
      
      if (challenge) {
        setSelectedChallenge(challenge);
      } else {
        Alert.alert('Invalid QR Code', 'This QR code does not match any challenge');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process QR code');
    } finally {
      setIsProcessing(false);
    }
  };

  const startChallenge = async (challenge: Challenge) => {
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
      fetchChallenges();
      setSelectedChallenge(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to start challenge');
    } finally {
      setIsProcessing(false);
    }
  };

  const completeChallenge = async (challenge: Challenge) => {
    try {
      setIsProcessing(true);
      
      // Update challenge status to completed
      await dbHelpers.updateChallengeStatus(challenge.id, ChallengeStatus.COMPLETED);
      
      Alert.alert('Success', `Completed challenge: ${challenge.name}`);
      fetchChallenges();
    } catch (error) {
      Alert.alert('Error', 'Failed to complete challenge');
    } finally {
      setIsProcessing(false);
    }
  };

  const forfeitChallenge = async (challenge: Challenge) => {
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
              fetchChallenges();
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
        return 'bg-gray-100 text-gray-800';
      case ChallengeStatus.ACTIVE:
        return 'bg-blue-100 text-blue-800';
      case ChallengeStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case ChallengeStatus.FORFEITED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4ECDC4" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-light">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchChallenges(true)}
            colors={['#4ECDC4']}
          />
        }
      >
        {/* QR Scanner Button */}
        <View className="px-4 pt-4">
          <TouchableOpacity
            onPress={requestCameraPermission}
            className="bg-primary rounded-lg py-4 flex-row items-center justify-center"
          >
            <Ionicons name="qr-code" size={24} color="white" />
            <Text className="text-white font-bold text-base ml-2">
              Scan Challenge QR Code
            </Text>
          </TouchableOpacity>
        </View>
        {/* Challenge Map */}
        <View className="px-4 py-4">
          <TouchableOpacity onPress={() => setShowMap(!showMap)}>
            <Text className="text-xl font-bold text-dark mb-3">
              Challenge Map {showMap ? '▼' : '▶'}
            </Text>
          </TouchableOpacity>
          {showMap && (
            <Image 
              source={require('../../assets/sf_map.png')} 
              style={{ width: '100%', height: 200 }} 
              resizeMode="contain"
            />
          )}
        </View>
        {/* Challenges List */}   
        <View className="px-4 py-4">
          <Text className="text-xl font-bold text-dark mb-3">Your Challenges</Text>
          
          {challenges.length === 0 ? (
            <View className="bg-white rounded-2xl p-8 items-center">
              <Ionicons name="flag-outline" size={48} color="#9CA3AF" />
              <Text className="text-gray-500 mt-4 text-center">
                No challenges available
              </Text>
            </View>
          ) : (
            challenges.map((challenge) => (
              <View key={challenge.id} className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
                <View className="flex-row justify-between items-start mb-2">
                  <Text className="text-lg font-bold text-dark flex-1">
                    {challenge.name}
                  </Text>
                  <View className={`px-2 py-1 rounded-full ${getStatusColor(challenge.status)}`}>
                    <Text className="text-xs font-medium capitalize">
                      {challenge.status}
                    </Text>
                  </View>
                </View>

                <Text className="text-gray-600 mb-3">{challenge.description}</Text>

                {challenge.pause_distance && (
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="pause-circle-outline" size={16} color="#F59E0B" />
                    <Text className="text-xs text-amber-600 ml-1">
                      Distance paused during challenge
                    </Text>
                  </View>
                )}

                {challenge.start && (
                  <Text className="text-xs text-gray-500 mb-2">
                    Started: {format(new Date(challenge.start), 'MMM dd, HH:mm')}
                  </Text>
                )}

                {/* Action Buttons */}
                <View className="flex-row space-x-2 mt-2">
                  {challenge.status === ChallengeStatus.AVAILABLE && (
                    <TouchableOpacity
                      onPress={() => startChallenge(challenge)}
                      disabled={isProcessing}
                      className="flex-1 bg-primary rounded-lg py-2"
                    >
                      <Text className="text-white text-center font-medium">
                        Start
                      </Text>
                    </TouchableOpacity>
                  )}

                  {challenge.status === ChallengeStatus.ACTIVE && (
                    <>
                      <TouchableOpacity
                        onPress={() => completeChallenge(challenge)}
                        disabled={isProcessing}
                        className="flex-1 bg-green-500 rounded-lg py-2"
                      >
                        <Text className="text-white text-center font-medium">
                          Complete
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => forfeitChallenge(challenge)}
                        disabled={isProcessing}
                        className="flex-1 bg-red-500 rounded-lg py-2"
                      >
                        <Text className="text-white text-center font-medium">
                          Forfeit
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* QR Scanner Modal */}
      <Modal
        visible={scannerVisible}
        animationType="slide"
        onRequestClose={() => setScannerVisible(false)}
      >
        <View className="flex-1 bg-black">
          <SafeAreaView className="flex-1">
            <CameraView
              className="flex-1"
              onBarcodeScanned={handleBarCodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ['qr'],
              }}
            />
            <TouchableOpacity
              onPress={() => setScannerVisible(false)}
              className="absolute top-12 right-4 bg-white/20 rounded-full p-3"
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            <View className="absolute bottom-8 left-0 right-0 items-center">
              <Text className="text-white text-lg font-medium">
                Point camera at QR code
              </Text>
            </View>
          </SafeAreaView>
        </View>
      </Modal>

      {/* Challenge Detail Modal */}
      {selectedChallenge && (
        <Modal
          visible={true}
          animationType="slide"
          transparent
          onRequestClose={() => setSelectedChallenge(null)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-3xl p-6">
              <Text className="text-2xl font-bold text-dark mb-3">
                {selectedChallenge.name}
              </Text>
              <Text className="text-gray-600 mb-4">
                {selectedChallenge.description}
              </Text>
              
              {selectedChallenge.pause_distance && (
                <View className="bg-amber-50 rounded-lg p-3 mb-4">
                  <Text className="text-amber-800">
                    ⚠️ Distance tracking will be paused during this challenge
                  </Text>
                </View>
              )}

              <View className="flex-row space-x-3">
                <TouchableOpacity
                  onPress={() => setSelectedChallenge(null)}
                  className="flex-1 bg-gray-200 rounded-lg py-3"
                >
                  <Text className="text-center font-medium">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    startChallenge(selectedChallenge);
                    setSelectedChallenge(null);
                  }}
                  disabled={isProcessing}
                  className="flex-1 bg-primary rounded-lg py-3"
                >
                  <Text className="text-white text-center font-medium">
                    Start Challenge
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}