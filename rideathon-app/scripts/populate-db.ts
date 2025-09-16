import { supabase } from '../src/lib/supabase';
import { defaultConfig } from '../src/config/defaultConfig';

async function populateDatabase() {
  console.log('Starting database population...');

  try {
    // 1. Clear existing data (in correct order due to foreign key constraints)
    console.log('Clearing existing data...');
    
    await supabase.from('gpx_cleanups').delete().neq('id', 0);
    await supabase.from('gpx_uploads').delete().neq('id', 0);
    await supabase.from('scorecards').delete().neq('id', 0);
    await supabase.from('modifiers').delete().neq('id', 0);
    await supabase.from('offsets').delete().neq('id', 0);
    await supabase.from('challenges').delete().neq('id', 0);
    await supabase.from('teams').delete().neq('id', 0);

    console.log('Existing data cleared.');

    // 2. Insert teams or get existing ones
    console.log('Inserting teams...');
    const { data: existingTeams, error: teamsSelectError } = await supabase.from('teams').select('*');
    
    let teams;
    if (teamsSelectError && teamsSelectError.message.includes('schema cache')) {
      console.log('Tables not found. Please ensure the database schema is set up first.');
      console.log('You may need to apply the migrations manually in the Supabase dashboard.');
      process.exit(1);
    }
    
    if (existingTeams && existingTeams.length > 0) {
      console.log(`Found ${existingTeams.length} existing teams.`);
      teams = existingTeams;
    } else {
      const { data: insertedTeams, error: teamsError } = await supabase
        .from('teams')
        .insert(defaultConfig.teams)
        .select();

      if (teamsError) {
        throw new Error(`Error inserting teams: ${teamsError.message}`);
      }

      teams = insertedTeams;
      console.log(`Inserted ${teams.length} teams.`);
    }

    // 3. Insert challenges (without team_id initially)
    console.log('Inserting challenges...');
    const challengeData = defaultConfig.challenges.map(challenge => ({
      name: challenge.name,
      description: challenge.description,
      pause_distance: challenge.pause_distance,
      latitude: challenge.latitude,
      longitude: challenge.longitude,
      status: 'available' as const
    }));

    const { data: challenges, error: challengesError } = await supabase
      .from('challenges')
      .insert(challengeData)
      .select();

    if (challengesError) {
      throw new Error(`Error inserting challenges: ${challengesError.message}`);
    }

    console.log(`Inserted ${challenges.length} challenges.`);

    // 4. Insert modifiers for each challenge
    console.log('Inserting modifiers...');
    const modifiersToInsert = [];

    for (let i = 0; i < challenges.length; i++) {
      const challenge = challenges[i];
      const configChallenge = defaultConfig.challenges[i];

      // Use the first team as the system team for system-generated modifiers
      const systemTeamId = teams[0].id;

      // Insert regular modifiers
      if (configChallenge.modifiers) {
        for (const modifier of configChallenge.modifiers) {
          modifiersToInsert.push({
            multiplier: modifier.multiplier,
            creator_id: modifier.creator_id || systemTeamId, // Use system team if null
            receiver_id: modifier.receiver_id,
            challenge_id: challenge.id,
            start: modifier.start,
            end: modifier.end
          });
        }
      }

      // Insert challenge attempt modifier
      if (configChallenge.challenge_attempt_modifier) {
        const attemptModifier = configChallenge.challenge_attempt_modifier;
        modifiersToInsert.push({
          multiplier: attemptModifier.multiplier,
          creator_id: attemptModifier.creator_id || systemTeamId, // Use system team if null
          receiver_id: attemptModifier.receiver_id,
          challenge_id: challenge.id,
          start: attemptModifier.start,
          end: attemptModifier.end
        });
      }
    }

    if (modifiersToInsert.length > 0) {
      const { error: modifiersError } = await supabase
        .from('modifiers')
        .insert(modifiersToInsert);

      if (modifiersError) {
        throw new Error(`Error inserting modifiers: ${modifiersError.message}`);
      }

      console.log(`Inserted ${modifiersToInsert.length} modifiers.`);
    }

    // 5. Insert offsets for each challenge
    console.log('Inserting offsets...');
    const offsetsToInsert = [];

    for (let i = 0; i < challenges.length; i++) {
      const challenge = challenges[i];
      const configChallenge = defaultConfig.challenges[i];

      if (configChallenge.offsets) {
        for (const offset of configChallenge.offsets) {
          offsetsToInsert.push({
            distance: offset.distance,
            creator_id: offset.creator_id,
            receiver_id: offset.receiver_id,
            challenge_id: challenge.id
          });
        }
      }
    }

    if (offsetsToInsert.length > 0) {
      const { error: offsetsError } = await supabase
        .from('offsets')
        .insert(offsetsToInsert);

      if (offsetsError) {
        throw new Error(`Error inserting offsets: ${offsetsError.message}`);
      }

      console.log(`Inserted ${offsetsToInsert.length} offsets.`);
    }

    // 6. Create initial scorecards for teams
    console.log('Creating scorecards...');
    const scorecardsToInsert = teams.map(team => ({
      team_id: team.id,
      challenges_completed: 0,
      distance_traveled: 0.0,
      distance_earned: 0.0
    }));

    const { error: scorecardsError } = await supabase
      .from('scorecards')
      .insert(scorecardsToInsert);

    if (scorecardsError) {
      throw new Error(`Error inserting scorecards: ${scorecardsError.message}`);
    }

    console.log(`Created ${scorecardsToInsert.length} scorecards.`);

    console.log('✅ Database population completed successfully!');
    
    // Display summary
    console.log('\n📊 Summary:');
    console.log(`- Teams: ${teams.length}`);
    console.log(`- Challenges: ${challenges.length}`);
    console.log(`- Modifiers: ${modifiersToInsert.length}`);
    console.log(`- Offsets: ${offsetsToInsert.length}`);
    console.log(`- Scorecards: ${scorecardsToInsert.length}`);

  } catch (error) {
    console.error('❌ Error populating database:', error);
    process.exit(1);
  }
}

// Run the population script
populateDatabase();
