// Script to create user_preferences table in Supabase
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createUserPreferencesTable() {
  console.log('🚀 Creating user_preferences table...');
  
  const sql = `
    CREATE TABLE IF NOT EXISTS user_preferences (
      user_id UUID PRIMARY KEY,
      categories TEXT[] DEFAULT '{}',
      whale_threshold INT DEFAULT 10000,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      // Try direct SQL execution if exec_sql function doesn't exist
      console.log('⚠️ exec_sql function not available, trying alternative...');
      
      // We'll need to use the REST API or create the table manually
      console.log('📋 Please run this SQL in Supabase dashboard:');
      console.log(sql);
      console.log('\n🔗 Go to: https://supabase.com/dashboard/project/utbkvjgatqiibfkcpugc/sql');
      console.log('📝 Paste the SQL above and run it');
      
      return;
    }
    
    console.log('✅ user_preferences table created successfully!');
  } catch (error) {
    console.error('❌ Error creating table:', error.message);
    console.log('\n📋 Please run this SQL manually in Supabase dashboard:');
    console.log(sql);
  }
}

createUserPreferencesTable();