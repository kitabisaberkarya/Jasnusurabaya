const { supabase } = require('./lib/supabase');

async function test() {
   const res = await supabase.from('users').select('*').or('email.eq.jasnu.nariyahsurabaya@gmail.com,nia.eq.jasnu.nariyahsurabaya@gmail.com').eq('password', 'JasnuNariyahSurabaya1926').limit(1).maybeSingle();
   console.log(res);
}
test().catch(console.error);
