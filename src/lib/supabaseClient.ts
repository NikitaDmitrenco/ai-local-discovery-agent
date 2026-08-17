import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kyxccjxsqjiwxlvdqoyn.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5eGNjanhzcWppd3hsdmRxb3luIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5MjIwNDgsImV4cCI6MjEwMjQ5ODA0OH0.-Gwj83pAINQEJgco_VO9H4xM1eHR-Xz1h97nSWLC7RY';

const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5eGNjanhzcWppd3hsdmRxb3luIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjkyMjA0OCwiZXhwIjoyMTAyNDk4MDQ4fQ.EjSGzE2heMCTM62QqHDISFOtUlS-i0wqYr7s0D557VQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function getSupabaseAdminClient() {
  return createClient(supabaseUrl, supabaseServiceKey);
}
