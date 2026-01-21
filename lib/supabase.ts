import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qbccaabthdlojfrilrwt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFiY2NhYWJ0aGRsb2pmcmlscnd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MTI4MjYsImV4cCI6MjA4NDQ4ODgyNn0.rkF6GuE1hsfPujV6KWjaF7nUXVmpGMFxNDJ9zF7Z-Gw';

export const supabase = createClient(supabaseUrl, supabaseKey);