import { createClient } from '@supabase/supabase-js';
import { 
  SUPABASE_URL, 
  SUPABASE_ANON_KEY, 
  SUPABASE_SERVICE_ROLE_KEY 
} from '../constants/Config';

// Create Supabase client with service role key for server-side operations
export const supabase = createClient(
  SUPABASE_URL!,
  SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Client-side Supabase client (for user authentication)
export const supabaseClient = createClient(
  SUPABASE_URL!,
  SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  }
);