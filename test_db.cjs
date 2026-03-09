const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://eqvnppulhzwlsyrhnvcb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxdm5wcHVsaHp3bHN5cmhudmNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDY0MzIsImV4cCI6MjA4ODYyMjQzMn0.obMK3hhEPFs2wNHF1p9aIhuLjdxV-BdKYPw5u8WTC20';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('users').select('*').ilike('role', '%admin%');
  console.log("Admins:", data);
  if (error) console.error("Error:", error);
}
test();
