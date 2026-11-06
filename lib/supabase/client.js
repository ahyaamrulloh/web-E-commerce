import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Dibuat sekali, dipakai ulang di mana saja
const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export default supabase;
