# Float Pack Ride-a-thon App

A modern React Native app built with Expo for managing team-based ride challenges and scorekeeping.

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Backend**: Supabase (PostgreSQL + Real-time subscriptions)
- **State Management**: Zustand
- **Navigation**: React Navigation

## Features

### 🏠 Home Screen
- Team login with secret code authentication
- Display team information and members
- Quick reference contact info
- Quick actions for GPX uploads and QR scanning

### 🏆 Real-time Scoreboard
- Live updates via Supabase subscriptions
- Team rankings by challenges completed and distance earned
- Visual indicators for top 3 teams
- Pull-to-refresh functionality

### 🎯 Challenges
- QR code scanner for challenge activation
- Challenge status tracking (Available, Active, Completed, Forfeited)
- Automatic modifier creation for distance-pausing challenges
- Forfeit penalties (-5 miles)

### ⚙️ Admin Panel
- Database management (clear/populate)
- Upload configuration from JSON
- Real-time database statistics
- Default configuration loader

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the migration script in your Supabase SQL editor:
   ```sql
   -- Copy contents from supabase/migrations/001_initial_schema.sql
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Add your Supabase credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your-project-url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

### 3. Run the App

```bash
# Start the development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web
npm run web
```

## Project Structure

```
rideathon-app/
├── src/
│   ├── config/           # App configuration
│   ├── lib/              # Supabase client and helpers
│   ├── navigation/       # React Navigation setup
│   ├── screens/          # App screens
│   ├── stores/           # Zustand stores
│   └── types/            # TypeScript type definitions
├── supabase/
│   └── migrations/       # Database migration files
├── App.tsx               # Main app component
├── babel.config.js       # Babel configuration
├── tailwind.config.js    # Tailwind/NativeWind config
└── package.json
```

## Database Schema

### Teams
- `id`: Primary key
- `name`: Unique team name
- `members`: Team member names (comma-separated)
- `color`: Team color for UI
- `secret_code`: Authentication code

### Challenges
- `id`: Primary key
- `name`: Challenge name
- `description`: Challenge details
- `uuid`: Unique identifier for QR codes
- `pause_distance`: Whether to pause distance tracking
- `status`: Current status (available/active/completed/forfeited)
- `team_id`: Associated team

### Modifiers
- `multiplier`: Distance multiplier value
- `creator_id`: Team that created the modifier
- `receiver_id`: Team that receives the modifier
- `challenge_id`: Associated challenge

### Offsets
- `distance`: Distance offset value
- `creator_id`: Team that created the offset
- `receiver_id`: Team that receives the offset
- `challenge_id`: Associated challenge

### Scorecards
- `team_id`: Associated team
- `challenges_completed`: Number of completed challenges
- `distance_traveled`: Total distance traveled
- `distance_earned`: Total distance earned (after modifiers/offsets)

## Building for Production

### Using EAS Build

1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```

2. Configure your project:
   ```bash
   eas build:configure
   ```

3. Build for iOS:
   ```bash
   npm run build:ios
   ```

4. Build for Android:
   ```bash
   npm run build:android
   ```

## Key Improvements from Python/Streamlit Version

1. **Native Mobile Experience**: Optimized for iOS and Android devices
2. **Real-time Updates**: Live scoreboard updates via Supabase subscriptions
3. **QR Code Scanning**: Native camera integration for challenge activation
4. **Offline Capability**: Local state management with AsyncStorage
5. **Modern UI**: Beautiful, responsive design with NativeWind
6. **Type Safety**: Full TypeScript implementation
7. **Push Notifications Ready**: Expo notifications support built-in

## Environment Variables

- `EXPO_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `EXPO_PUBLIC_APP_NAME`: App display name
- `EXPO_PUBLIC_SUPPORT_PHONE`: Support contact number

## License

MIT