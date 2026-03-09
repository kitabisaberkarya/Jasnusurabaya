
import { createClient } from '@supabase/supabase-js';

// Project Baru: eqvnppulhzwlsyrhnvcb
const supabaseUrl = 'https://eqvnppulhzwlsyrhnvcb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxdm5wcHVsaHp3bHN5cmhudmNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDY0MzIsImV4cCI6MjA4ODYyMjQzMn0.obMK3hhEPFs2wNHF1p9aIhuLjdxV-BdKYPw5u8WTC20';

export const supabase = createClient(supabaseUrl, supabaseKey);
