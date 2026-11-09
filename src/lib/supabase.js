import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// La anon key es pública por diseño: la seguridad real la dan las políticas RLS de la base.
export const supabase = url && key ? createClient(url, key) : null;
