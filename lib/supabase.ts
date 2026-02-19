
import { createClient } from '@supabase/supabase-js';

// Project Baru: cxtpfqggqgbezvuwqezf
const supabaseUrl = 'https://cxtpfqggqgbezvuwqezf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4dHBmcWdncWdiZXp2dXdxZXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NTIzNzEsImV4cCI6MjA4NzAyODM3MX0.jyxcgRSuxDhGIuDrb6SQAUigfS1_Qa_wn0BqD3f6-1I';

export const supabase = createClient(supabaseUrl, supabaseKey);
