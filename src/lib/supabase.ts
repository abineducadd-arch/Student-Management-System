import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Keys from localStorage or environment variables
const storedUrl = localStorage.getItem('aurelia_supabase_url') || import.meta.env.VITE_SUPABASE_URL || '';
const storedKey = localStorage.getItem('aurelia_supabase_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export let supabase: SupabaseClient | null = null;

if (storedUrl && storedKey) {
  try {
    supabase = createClient(storedUrl, storedKey);
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    supabase = null;
  }
}

export const isSupabaseConfigured = (): boolean => {
  return !!supabase && !!storedUrl && !!storedKey;
};

export const updateSupabaseCredentials = (url: string, key: string): boolean => {
  if (!url || !key) {
    localStorage.removeItem('aurelia_supabase_url');
    localStorage.removeItem('aurelia_supabase_key');
    supabase = null;
    return true;
  }
  try {
    const client = createClient(url, key);
    localStorage.setItem('aurelia_supabase_url', url);
    localStorage.setItem('aurelia_supabase_key', key);
    supabase = client;
    return true;
  } catch (err) {
    console.error('Invalid Supabase configuration:', err);
    return false;
  }
};

