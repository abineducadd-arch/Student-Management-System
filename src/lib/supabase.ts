import { createClient, SupabaseClient } from '@supabase/supabase-js';

const formatSupabaseUrl = (input: string): string => {
  const trimmed = input.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://${trimmed}.supabase.co`;
};

// Keys from localStorage or environment variables
const rawUrl = localStorage.getItem('aurelia_supabase_url') || import.meta.env.VITE_SUPABASE_URL || '';
const storedUrl = formatSupabaseUrl(rawUrl);
const storedKey = (localStorage.getItem('aurelia_supabase_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export let supabase: SupabaseClient | null = null;

if (storedUrl && storedKey) {
  try {
    supabase = createClient(storedUrl, storedKey);
  } catch (err) {
    console.warn('[AURELIA] Failed to initialize Supabase client:', err);
    supabase = null;
  }
} else {
  console.warn(
    '[AURELIA] Supabase credentials not found. Environment variables VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY are unset. ' +
    'The application is operating in persistent local fallback mode. To connect to Supabase in production, define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your Vercel Project Settings, or connect via the in-app Settings modal.'
  );
}

export const isSupabaseConfigured = (): boolean => {
  return !!supabase && !!storedUrl && !!storedKey;
};

export const updateSupabaseCredentials = (url: string, key: string): boolean => {
  const formattedUrl = formatSupabaseUrl(url);
  const trimmedKey = key.trim();

  if (!formattedUrl || !trimmedKey) {
    localStorage.removeItem('aurelia_supabase_url');
    localStorage.removeItem('aurelia_supabase_key');
    supabase = null;
    return true;
  }
  try {
    const client = createClient(formattedUrl, trimmedKey);
    localStorage.setItem('aurelia_supabase_url', formattedUrl);
    localStorage.setItem('aurelia_supabase_key', trimmedKey);
    supabase = client;
    return true;
  } catch (err) {
    console.error('Invalid Supabase configuration:', err);
    return false;
  }
};
