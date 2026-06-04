import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Серверный клиент Supabase на service_role ключе.
// ВАЖНО: используется ТОЛЬКО внутри API-роутов / серверных компонентов.
// Ключ никогда не уходит в браузер.
// Клиент создаётся лениво, чтобы сборка не падала, если переменные ещё не заданы.
let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Не заданы NEXT_PUBLIC_SUPABASE_URL или SUPABASE_SERVICE_ROLE_KEY"
    );
  }
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
