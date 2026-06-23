import { createClient, SupabaseClient } from '@supabase/supabase-js'

export const supabaseUrl: string = import.meta.env.VITE_kl7_supabase_url
const supabaseKey: string = import.meta.env.VITE_kl7_supabase_anon_key

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey)
export default supabase