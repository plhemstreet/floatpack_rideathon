import { supabase, dbHelpers } from '../src/lib/supabase';

async function testDatabase() {
  console.log('Testing database connection and data...');

  try {
    // Test basic connection
    console.log('1. Testing basic connection...');
    const { data: testData, error: testError } = await supabase.from('teams').select('count');
    
    if (testError) {
      console.error('❌ Database connection failed:', testError.message);
      return;
    }
    
    console.log('✅ Database connection successful');

    // Test fetching challenges
    console.log('2. Testing challenge fetching...');
    const challenges = await dbHelpers.getChallenges();
    console.log(`✅ Found ${challenges.length} challenges`);

    if (challenges.length > 0) {
      const challenge = challenges[0];
      console.log('📋 Sample challenge data:');
      console.log(`   Name: ${challenge.name}`);
      console.log(`   Status: ${challenge.status}`);
      console.log(`   Modifiers: ${challenge.modifiers?.length || 0}`);
      console.log(`   Offsets: ${challenge.offsets?.length || 0}`);
      console.log(`   Attempt Modifier: ${challenge.challenge_attempt_modifier ? 'Yes' : 'No'}`);
      
      if (challenge.challenge_attempt_modifier) {
        console.log(`   Attempt Multiplier: ${challenge.challenge_attempt_modifier.multiplier}x`);
      }
    }

    // Test fetching teams
    console.log('3. Testing team fetching...');
    const teams = await dbHelpers.getTeams();
    console.log(`✅ Found ${teams.length} teams`);

    console.log('\n🎉 Database test completed successfully!');

  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

testDatabase();
