import { createClient } from '@supabase/supabase-js';

// REEMPLAZA ESTOS VALORES CON LOS DE TU PROJECT SETTINGS > API
const supabaseUrl = 'https://yeugvqkrmazjggmhxbtf.supabase.co/rest/v1/';
const supabaseKey = 'sb_publishable_AwR-rFWjBlO5pmhiAhS6Og_aDVWQGWL';

export const supabase = createClient(supabaseUrl, supabaseKey);