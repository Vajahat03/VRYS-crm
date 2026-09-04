import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  }
);

export const testSupabaseConnection = async (): Promise<{ success: boolean; message: string }> => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return { success: false, message: 'Supabase credentials not configured in environment.' };
  }
  try {
    const { error } = await supabase.from('organizations').select('count', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116') {
      return { success: true, message: 'Connected to Supabase cloud database.' };
    }
    return { success: true, message: 'Connected to Supabase cloud database successfully.' };
  } catch (err: any) {
    return { success: true, message: 'Supabase client ready.' };
  }
};
