import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { supabase, dbHelpers } from '../lib/supabase';
import { Challenge, ChallengeStatus } from '../types';
import { useAuthStore } from '../stores/useAuthStore';

interface ChallengesScreenProps {
  navigation: any;
}

export default function ChallengesScreen({ navigation }: ChallengesScreenProps) {
  const { team } = useAuthStore();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const handleChallengeSelect = (challenge: Challenge) => {
    navigation.navigate('ChallengeDetail', { challenge });
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

  const isChallengeDisabled = (status: ChallengeStatus) => {
    return status === ChallengeStatus.COMPLETED || status === ChallengeStatus.FORFEITED;
  };

  if (isLoading) {
    return (
      <View className="flex-1 sunset-gradient justify-center items-center">
        <View className="sunset-card p-8 items-center">
          <ActivityIndicator size="large" color="white" />
          <Text className="text-white font-medium mt-4 text-lg">Loading challenges...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 sunset-gradient">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchChallenges(true)}
            colors={['white']}
          />
        }
      >
        {/* Header */}
        <View className="px-6 pt-12 pb-6">
          <View className="sunset-card p-6">
            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 bg-white rounded-2xl items-center justify-center mr-4">
                <Ionicons name="flag" size={24} color="#f2760a" />
              </View>
              <View className="flex-1">
                <Text className="text-3xl font-bold text-white">Challenges</Text>
                <Text className="text-white/80 text-base font-medium">Tap a challenge to view details and activate</Text>
              </View>
            </View>
            <View className="h-1 bg-white/30 rounded-full"></View>
          </View>
        </View>
        {/* Challenges List */}   
        <View className="px-6 pb-20">
          
          {challenges.length === 0 ? (
            <View className="sunset-card-elevated p-10 items-center">
              <View className="w-20 h-20 bg-white rounded-full items-center justify-center mb-6">
                <Ionicons name="flag-outline" size={40} color="#f2760a" />
              </View>
              <Text className="text-sunset-600 text-xl font-bold text-center mb-2">
                No challenges available
              </Text>
              <Text className="text-sunset-400 text-base text-center">
                Check back later for new challenges
              </Text>
            </View>
          ) : (
            challenges.map((challenge) => {
              const isDisabled = isChallengeDisabled(challenge.status);
              return (
                <TouchableOpacity
                  key={challenge.id}
                  onPress={() => handleChallengeSelect(challenge)}
                  className={`sunset-card p-6 mb-6 ${
                    isDisabled 
                      ? 'opacity-60' 
                      : ''
                  }`}
                >
                  {/* Card Header */}
                  <View className="flex-row justify-between items-start mb-4">
                    <View className="flex-1 mr-4">
                      <Text className={`text-2xl font-bold ${
                        isDisabled ? 'text-sunset-300' : 'text-dark'
                      }`}>
                        {challenge.name}
                      </Text>
                    </View>
                    <View className={`px-4 py-2 rounded-2xl ${getStatusColor(challenge.status)}`}>
                      <Text className="text-sm font-bold capitalize">
                        {challenge.status}
                      </Text>
                    </View>
                  </View>

                  {/* Description */}
                  <Text className={`text-lg leading-6 mb-6 ${
                    isDisabled ? 'text-sunset-300' : 'text-sunset-700'
                  }`}>
                    {challenge.description}
                  </Text>

                  {/* Challenge Features */}
                  <View className="space-y-3 mb-6">
                    {challenge.pause_distance && (
                      <View className="flex-row items-center">
                        <View className={`w-8 h-8 rounded-xl flex items-center justify-center mr-3 ${
                          isDisabled ? 'bg-sunset-200' : 'bg-warning/20'
                        }`}>
                          <Ionicons 
                            name="pause-circle-outline" 
                            size={18} 
                            color={isDisabled ? "#fbd7a5" : "#f59e0b"} 
                          />
                        </View>
                        <Text className={`text-base font-semibold ${
                          isDisabled ? 'text-sunset-300' : 'text-warning'
                        }`}>
                          Distance tracking paused
                        </Text>
                      </View>
                    )}

                    {challenge.start && (
                      <View className="flex-row items-center">
                        <View className={`w-8 h-8 rounded-xl flex items-center justify-center mr-3 ${
                          isDisabled ? 'bg-sunset-200' : 'bg-sky-100'
                        }`}>
                          <Ionicons 
                            name="time-outline" 
                            size={18} 
                            color={isDisabled ? "#fbd7a5" : "#0ea5e9"} 
                          />
                        </View>
                        <Text className={`text-base font-semibold ${
                          isDisabled ? 'text-sunset-300' : 'text-sky-700'
                        }`}>
                          Started: {format(new Date(challenge.start), 'MMM dd, HH:mm')}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Card Footer */}
                  <View className="flex-row items-center justify-between pt-4 border-t border-sunset-200">
                    <View className="flex-row items-center">
                      <Ionicons 
                        name="flag-outline" 
                        size={20} 
                        color={isDisabled ? "#fbd7a5" : "#f2760a"} 
                      />
                      <Text className={`text-base font-semibold ml-3 ${
                        isDisabled ? 'text-sunset-300' : 'text-sunset-600'
                      }`}>
                        Challenge
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Text className={`text-base font-semibold mr-2 ${
                        isDisabled ? 'text-sunset-300' : 'text-sunset-500'
                      }`}>
                        Tap to view
                      </Text>
                      <Ionicons 
                        name="chevron-forward" 
                        size={20} 
                        color={isDisabled ? "#fbd7a5" : "#f2760a"} 
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}