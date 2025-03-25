
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Supabase project details
const SUPABASE_URL = "https://yefrdovbporfjdhfojyx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllZnJkb3ZicG9yZmpkaGZvanl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MjExMjIsImV4cCI6MjA1NTI5NzEyMn0.iZhk6w6EtWe-RGIjxfi4817IB_8jir-lYFko6oIKt_k";

// Create a single instance of the Supabase client
export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
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
