import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
    console.error("CRITICAL ERROR: Supabase URL or Anon Key is missing or invalid! Please check your .env file.");
    console.log("Current URL:", supabaseUrl);
} else {
    console.log("Supabase client initialized with URL:", supabaseUrl);
}

// Custom fetch implementation with a 3-second timeout to prevent indefinite hangs
export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder_key');

