import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ejgelmxicmlgzzpksbip.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqZ2VsbXhpY21sZ3p6cGtzYmlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNTYyOTIsImV4cCI6MjA1OTkzMjI5Mn0.NwFbBXC1WUWy4E75ZevoMsSPCojJG8CFnGxhkb7zzmA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
