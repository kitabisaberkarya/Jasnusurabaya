const { supabase } = require('./lib/supabase');
const { initializeApp } = require('firebase/app');

async function test() {
  let res = await supabase.from('users').select('*').limit(1);
  console.log("Users:", res);
  
  res = await supabase.from('attendance_sessions').select('*');
  console.log("Sessions:", res);
  
  res = await supabase.from('site_config').select('*').single();
  console.log("Config:", res);
}
test().catch(console.error);
