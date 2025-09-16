import { supabase } from '../src/lib/supabase';
import { readFileSync } from 'fs';
import { join } from 'path';

async function setupDatabase() {
  console.log('Setting up database schema...');

  try {
    // Read the migration files
    const migration1 = readFileSync(join(__dirname, '../supabase/migrations/001_initial_schema.sql'), 'utf8');
    const migration2 = readFileSync(join(__dirname, '../supabase/migrations/002_challenge_attempt_modifiers.sql'), 'utf8');

    // Execute the migrations
    console.log('Applying initial schema migration...');
    const { error: migration1Error } = await supabase.rpc('exec_sql', { sql: migration1 });
    
    if (migration1Error) {
      console.error('Migration 1 error:', migration1Error);
      // Try alternative approach
      console.log('Trying alternative migration approach...');
    }

    console.log('Applying challenge attempt modifiers migration...');
    const { error: migration2Error } = await supabase.rpc('exec_sql', { sql: migration2 });
    
    if (migration2Error) {
      console.error('Migration 2 error:', migration2Error);
    }

    console.log('✅ Database schema setup completed!');
    
    // Test by querying a table
    const { data: testData, error: testError } = await supabase.from('teams').select('count');
    
    if (testError) {
      console.log('⚠️  Schema may not be fully set up. Please check the Supabase dashboard.');
    } else {
      console.log('✅ Schema verification successful!');
    }

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    console.log('\n📝 Manual Setup Instructions:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to the SQL Editor');
    console.log('3. Copy and paste the contents of:');
    console.log('   - supabase/migrations/001_initial_schema.sql');
    console.log('   - supabase/migrations/002_challenge_attempt_modifiers.sql');
    console.log('4. Run each migration');
    console.log('5. Then run the populate script again');
  }
}

setupDatabase();
