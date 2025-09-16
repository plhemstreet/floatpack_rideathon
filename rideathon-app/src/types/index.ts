// Database types matching the Python SQLAlchemy models

export interface Team {
  id: number;
  name: string;
  members: string;
  color: string;
  secret_code: string;
  created_at?: string;
}

export enum ChallengeStatus {
  AVAILABLE = 'available',
  ACTIVE = 'active',
  FORFEITED = 'forfeited',
  PENDING = 'pending',
  COMPLETE = 'complete',
}

export interface Challenge {
  id: number;
  name: string;
  description: string;
  uuid: string;
  pause_distance: boolean;
  start?: string | null;
  end?: string | null;
  latitude: number;
  longitude: number;
  status: ChallengeStatus;
  team_id?: number | null;
  created_at?: string;
  modifiers?: Modifier[];
  offsets?: Offset[];
  challenge_attempt_modifier?: Modifier;
}

export interface Modifier {
  id: number;
  multiplier: number;
  creator_id: number;
  receiver_id?: number;
  challenge_id?: number | null;
  created_at?: string;
  start?: string | null;
  end?: string | null;
}

export interface Offset {
  id: number;
  distance: number;
  creator_id: number;
  receiver_id?: number;
  challenge_id?: number | null;
  created_at?: string;
}

export interface GpxUpload {
  id: number;
  uploaded_at: string;
  team_id: number;
  gpx_data: string;
}

export interface GpxCleanup {
  id: number;
  gpx_upload_id: number;
  total_distance: number;
  total_time: number;
  average_speed: number;
  max_speed: number;
  min_speed: number;
  scored_distance: number;
  pruned_distance_speed: number;
  pruned_distance_updated: string;
  created_at: string;
}

export interface Scorecard {
  id: number;
  team_id: number;
  challenges_completed: number;
  distance_traveled: number;
  distance_earned: number;
  created_at: string;
  team?: Team;
}

// App-specific types
export interface AuthState {
  team: Team | null;
  isAuthenticated: boolean;
  login: (teamName: string, secretCode: string) => Promise<boolean>;
  logout: () => void;
}

export interface ChallengeSubmission {
  id: number;
  team_id: number;
  challenge_id: number;
  evidence_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: number;
  created_at: string;
}

// Configuration types for defaultConfig
export interface ChallengeConfig {
  name: string;
  description: string;
  pause_distance: boolean;
  latitude: number;
  longitude: number;
  modifiers?: {
    multiplier: number;
    creator_id: number | null;
    receiver_id: number | null;
    challenge_id: number | null;
    start: string | null;
    end: string | null;
  }[];
  offsets?: {
    distance: number;
    creator_id: number | null;
    receiver_id: number | null;
    challenge_id: number | null;
  }[];
  challenge_attempt_modifier?: {
    multiplier: number;
    creator_id: number | null;
    receiver_id: number | null;
    challenge_id: number | null;
    start: string | null;
    end: string | null;
  };
}