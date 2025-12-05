// import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Configuration
const SUPABASE_URL = window.SUPABASE_URL || 'https://gleopbecgbchxwvsirqc.supabase.co';
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsZW9wYmVjZ2JjaHh3dnNpcnFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4MTIxNjgsImV4cCI6MjA4MDM4ODE2OH0.bLYhky0KzisAFiqtaR7vz9KRO2ZfBETDdkdD-MGQ12U';

// Initialize Supabase client (using UMD global)
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export { supabase };
