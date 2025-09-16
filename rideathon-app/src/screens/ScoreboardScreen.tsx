import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { supabase, dbHelpers } from '../lib/supabase';
import { Scorecard } from '../types';

export default function ScoreboardScreen() {
  const [scorecards, setScorecards] = useState<Scorecard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchScorecards = async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const data = await dbHelpers.getLatestScorecards();
      setScorecards(data || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching scorecards:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchScorecards();

    // Set up real-time subscription
    const subscription = supabase
      .channel('scorecards')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'scorecards' },
        () => {
          fetchScorecards();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const sortedScorecards = [...scorecards].sort((a, b) => {
    // Sort by challenges completed first, then by distance earned
    if (b.challenges_completed !== a.challenges_completed) {
      return b.challenges_completed - a.challenges_completed;
    }
    return b.distance_earned - a.distance_earned;
  });

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-light justify-center items-center">
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
            onRefresh={() => fetchScorecards(true)}
            colors={['#4ECDC4']}
          />
        }
      >
        {/* Last Updated */}
        {lastUpdated && (
          <View className="bg-primary/10 px-4 py-2">
            <Text className="text-center text-sm text-gray-600">
              Last Updated: {format(lastUpdated, 'MMM dd, yyyy HH:mm:ss')}
            </Text>
          </View>
        )}

        {/* Leaderboard */}
        <View className="px-4 py-4">
          {sortedScorecards.length === 0 ? (
            <View className="bg-white rounded-2xl p-8 items-center">
              <Ionicons name="trophy-outline" size={48} color="#9CA3AF" />
              <Text className="text-gray-500 mt-4 text-center">
                No scorecard data available yet
              </Text>
            </View>
          ) : (
            sortedScorecards.map((scorecard, index) => (
              <View
                key={scorecard.id}
                className={`bg-white rounded-2xl p-4 mb-3 shadow-sm ${
                  index === 0 ? 'border-2 border-yellow-400' : ''
                }`}
              >
                {/* Rank and Team Name */}
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center">
                    <View
                      className={`w-10 h-10 rounded-full items-center justify-center ${
                        index === 0
                          ? 'bg-yellow-400'
                          : index === 1
                          ? 'bg-gray-400'
                          : index === 2
                          ? 'bg-orange-400'
                          : 'bg-gray-200'
                      }`}
                    >
                      <Text
                        className={`font-bold ${
                          index < 3 ? 'text-white' : 'text-gray-600'
                        }`}
                      >
                        {index + 1}
                      </Text>
                    </View>
                    <Text className="ml-3 text-lg font-bold text-dark">
                      {scorecard.team?.name || `Team ${scorecard.team_id}`}
                    </Text>
                  </View>
                  {scorecard.team?.color && (
                    <View
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: scorecard.team.color }}
                    />
                  )}
                </View>

                {/* Stats */}
                <View className="flex-row justify-between">
                  <View className="flex-1 items-center">
                    <View className="flex-row items-center">
                      <Ionicons name="flag" size={16} color="#6B7280" />
                      <Text className="ml-1 text-xs text-gray-600">
                        Challenges
                      </Text>
                    </View>
                    <Text className="text-lg font-bold text-primary mt-1">
                      {scorecard.challenges_completed}
                    </Text>
                  </View>

                  <View className="flex-1 items-center border-l border-r border-gray-200">
                    <View className="flex-row items-center">
                      <Ionicons name="bicycle" size={16} color="#6B7280" />
                      <Text className="ml-1 text-xs text-gray-600">
                        Traveled
                      </Text>
                    </View>
                    <Text className="text-lg font-bold text-accent mt-1">
                      {scorecard.distance_traveled.toFixed(1)} mi
                    </Text>
                  </View>

                  <View className="flex-1 items-center">
                    <View className="flex-row items-center">
                      <Ionicons name="star" size={16} color="#6B7280" />
                      <Text className="ml-1 text-xs text-gray-600">
                        Earned
                      </Text>
                    </View>
                    <Text className="text-lg font-bold text-secondary mt-1">
                      {scorecard.distance_earned.toFixed(1)} mi
                    </Text>
                  </View>
                </View>

                {/* Last Updated */}
                {scorecard.created_at && (
                  <Text className="text-xs text-gray-500 text-center mt-3">
                    Updated: {format(new Date(scorecard.created_at), 'MMM dd, HH:mm')}
                  </Text>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}