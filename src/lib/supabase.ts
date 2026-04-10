import { createClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// サーバーサイド用
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// クライアントサイド用
export const createSupabaseBrowserClient = () => createBrowserClient(supabaseUrl, supabaseAnonKey);
