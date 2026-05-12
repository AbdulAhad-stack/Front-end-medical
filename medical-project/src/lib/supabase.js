// src/lib/supabase.js
// This is ONLY for reading public data if needed later (e.g. real-time subscriptions).
// All auth (signup/login) goes through your Flask backend, NOT directly to Supabase.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
