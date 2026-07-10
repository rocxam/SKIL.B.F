const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;

if (supabaseUrl && supabaseServiceRoleKey) {
  supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false
    }
  });
} else {
  console.warn('Supabase credentials are not configured; storage uploads will be unavailable until SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
}

module.exports = supabase;
