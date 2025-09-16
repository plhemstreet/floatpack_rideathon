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
      const data = await dbHelpers.getScorecards();
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
      <View className="flex-1 sunset-gradient justify-center items-center">
        <View className="sunset-card p-8 items-center">
          <ActivityIndicator size="large" color="white" />
          <Text className="text-white font-medium mt-4 text-lg">Loading scoreboard...</Text>
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
            onRefresh={() => fetchScorecards(true)}
            colors={['white']}
          />
        }
      >
        {/* Last Updated */}
        {lastUpdated && (
          <View className="bg-white/20 px-6 py-4">
            <Text className="text-center text-white font-semibold">
              Last Updated: {format(lastUpdated, 'MMM dd, yyyy HH:mm:ss')}
            </Text>
          </View>
        )}

        {/* Leaderboard */}
        <View className="px-6 py-6">
          <View className="sunset-card p-6 mb-6">
            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 bg-white rounded-2xl items-center justify-center mr-4">
                <Ionicons name="trophy" size={24} color="#f2760a" />
              </View>
              <Text className="text-3xl font-bold text-white">Leaderboard</Text>
            </View>
            <View className="h-1 bg-white/30 rounded-full"></View>
          </View>
          
          {sortedScorecards.length === 0 ? (
            <View className="sunset-card-elevated p-10 items-center">
              <View className="w-20 h-20 sunset-gradient rounded-full items-center justify-center mb-6">
                <Ionicons name="trophy-outline" size={40} color="white" />
              </View>
              <Text className="text-sunset-600 text-xl font-bold text-center">
                No scorecard data available yet
              </Text>
            </View>
          ) : (
            sortedScorecards.map((scorecard, index) => (
              <View
                key={scorecard.id}
                className={`sunset-card p-6 mb-4 ${
                  index === 0 ? 'border-4 border-warning' : ''
                }`}
              >
                {/* Rank and Team Name */}
                <View className="flex-row items-center justify-between mb-6">
                  <View className="flex-row items-center">
                    <View
                      className={`w-14 h-14 rounded-2xl items-center justify-center ${
                        index === 0
                          ? 'bg-warning'
                          : index === 1
                          ? 'bg-sky-500'
                          : index === 2
                          ? 'bg-lavender-500'
                          : 'bg-white/20'
                      }`}
                    >
                      <Text
                        className={`font-bold text-2xl ${
                          index < 3 ? 'text-white' : 'text-white'
                        }`}
                      >
                        {index + 1}
                      </Text>
                    </View>
                    <Text className="ml-4 text-2xl font-bold text-white">
                      {scorecard.team?.name || `Team ${scorecard.team_id}`}
                    </Text>
                  </View>
                  {scorecard.team?.color && (
                    <View
                      className="w-8 h-8 rounded-xl"
                      style={{ backgroundColor: scorecard.team.color }}
                    />
                  )}
                </View>

                {/* Stats */}
                <View className="flex-row justify-between">
                  <View className="flex-1 items-center">
                    <View className="flex-row items-center mb-2">
                      <View className="w-8 h-8 bg-sunset-100 rounded-xl items-center justify-center mr-2">
                        <Ionicons name="flag" size={18} color="#f2760a" />
                      </View>
                      <Text className="text-sunset-600 font-semibold">
                        Challenges
                      </Text>
                    </View>
                    <Text className="text-2xl font-bold text-primary">
                      {scorecard.challenges_completed}
                    </Text>
                  </View>

                  <View className="flex-1 items-center border-l-2 border-r-2 border-sunset-200">
                    <View className="flex-row items-center mb-2">
                      <View className="w-8 h-8 bg-sky-100 rounded-xl items-center justify-center mr-2">
                        <Ionicons name="bicycle" size={18} color="#0ea5e9" />
                      </View>
                      <Text className="text-sky-600 font-semibold">
                        Traveled
                      </Text>
                    </View>
                    <Text className="text-2xl font-bold text-sky-600">
                      {scorecard.distance_traveled.toFixed(1)} mi
                    </Text>
                  </View>

                  <View className="flex-1 items-center">
                    <View className="flex-row items-center mb-2">
                      <View className="w-8 h-8 bg-lavender-100 rounded-xl items-center justify-center mr-2">
                        <Ionicons name="star" size={18} color="#a855f7" />
                      </View>
                      <Text className="text-lavender-600 font-semibold">
                        Earned
                      </Text>
                    </View>
                    <Text className="text-2xl font-bold text-lavender-600">
                      {scorecard.distance_earned.toFixed(1)} mi
                    </Text>
                  </View>
                </View>

                {/* Last Updated */}
                {scorecard.created_at && (
                  <Text className="text-sunset-500 text-center mt-4 font-medium">
                    Updated: {format(new Date(scorecard.created_at), 'MMM dd, HH:mm')}
                  </Text>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}