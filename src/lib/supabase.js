import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('⚠️  Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não configuradas no .env')
}

// Fetch com timeout global de 25 s — evita que o banco adormecido trave a UI para sempre
function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 25000)
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timer))
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession:    true,   // mantém sessão no localStorage
    autoRefreshToken:  true,   // renova o JWT automaticamente antes de expirar
    detectSessionInUrl: true,
    storageKey: 'dita-bolsas-auth',
  },
  global: {
    fetch: fetchWithTimeout,
  },
})
