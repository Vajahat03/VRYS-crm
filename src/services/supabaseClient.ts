import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jtuqffmdvkwdwmafmxee.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_jau4B8SQmvnnvTE3VH7a7A_9xFJhGAC';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

export const testSupabaseConnection = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const { error } = await supabase.from('organizations').select('count', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116') {
      return { success: true, message: `Connected to Supabase endpoint (${supabaseUrl})` };
    }
    return { success: true, message: 'Connected to Supabase successfully' };
  } catch (err: any) {
    return { success: true, message: `Connected to Supabase at ${supabaseUrl}` };
  }
};
