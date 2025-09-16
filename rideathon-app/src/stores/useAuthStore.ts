import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Team, AuthState } from '../types';
import { dbHelpers } from '../lib/supabase';

interface AuthStore extends AuthState {
  isLoading: boolean;
  error: string | null;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  team: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  initializeAuth: async () => {
    try {
      const storedTeam = await AsyncStorage.getItem('team');
      if (storedTeam) {
        const team = JSON.parse(storedTeam);
        set({ team, isAuthenticated: true });
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
    }
  },

  login: async (teamName: string, secretCode: string) => {
    set({ isLoading: true, error: null });
    try {
      const team = await dbHelpers.getTeamByCredentials(teamName, secretCode);
      
      if (team) {
        await AsyncStorage.setItem('team', JSON.stringify(team));
        set({ team, isAuthenticated: true, isLoading: false });
        return true;
      } else {
        set({ error: 'Invalid team name or secret code', isLoading: false });
        return false;
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('team');
    set({ team: null, isAuthenticated: false });
  },
}));