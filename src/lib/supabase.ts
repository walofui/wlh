import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Using demo mode.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: { 'X-Client-Info': 'farsdos-games' }
    }
  }
);

let isInitialized = false;

export const initializeSupabase = async (retries = 3): Promise<boolean> => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not found. Using demo mode.');
    return false;
  }

  if (isInitialized) return true;

  for (let i = 0; i < retries; i++) {
    try {
      // Use a simple health check instead of querying a specific table
      const { error } = await supabase.from('games').select('count').limit(1);
      
      if (!error) {
        isInitialized = true;
        console.log('Supabase connection established successfully');
        return true;
      }

      if (error.code === 'PGRST116') {
        // This is an expected error when the table doesn't exist yet
        isInitialized = true;
        console.log('Supabase connection established (table not found, but connection works)');
        return true;
      }

      console.warn(`Initialization attempt ${i + 1} failed:`, error);
      
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (err: any) {
      // Handle network errors specifically
      if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        console.warn(`Network error on attempt ${i + 1}: CORS or connectivity issue. This is likely due to CORS configuration.`);
        console.warn('To fix this, add your application URL to the allowed origins in your Supabase project settings under API > CORS.');
      } else {
        console.warn(`Initialization attempt ${i + 1} failed:`, err);
      }
      
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  console.warn('Failed to connect to Supabase after all retries. Using demo mode.');
  return false;
};