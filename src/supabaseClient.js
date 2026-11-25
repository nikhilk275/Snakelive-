import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://wyrbtkoehtdqvklgxwoo.supabase.co";

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_zoApe_UGajfK_esf8QpHDQ_v09VJKY1";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
