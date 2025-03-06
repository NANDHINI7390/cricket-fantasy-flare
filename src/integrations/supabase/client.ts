
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Using environment variables is ideal, but since we have direct access to these values:
const SUPABASE_URL = "https://yefrdovbporfjdhfojyx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllZnJkb3ZicG9yZmpkaGZvanl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUyNjU2OTgsImV4cCI6MjA1MDg0MTY5OH0.F08ETpra6hqV7486oYbhUQ68WfluufgkHncJWS89gf4";

// Create a single instance of the Supabase client
export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce' // Use PKCE flow for better security
    }
  }
);

// Helper function to check current session
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error getting session:', error);
      return null;
    }
    return data?.session?.user || null;
  } catch (err) {
    console.error('Unexpected error in getCurrentUser:', err);
    return null;
  }
};
