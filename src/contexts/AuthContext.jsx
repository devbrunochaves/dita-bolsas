import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

async function fetchProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) {
      console.warn('[Auth] fetchProfile erro:', error.message, '| code:', error.code)
      return null
    }
    return data || null
  } catch (e) {
    console.warn('[Auth] fetchProfile exception:', e)
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Cache do profile buscado durante signIn() para evitar double-fetch:
  // signIn() já consulta o profile → guarda aqui → SIGN_IN event consome e limpa.
  const pendingProfile = useRef(null)

  useEffect(() => {
    let mounted = true

    // Safety timeout de 10 s (reduzido de 30 s)
    const safetyTimeout = setTimeout(() => {
      if (mounted) setLoading(false)
    }, 10000)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        const u = session?.user ?? null

        if (!u) {
          clearTimeout(safetyTimeout)
          if (mounted) { setUser(null); setProfile(null); setLoading(false) }
          return
        }

        // ── INITIAL_SESSION: restauração ao reabrir a aba ─────────────
        // Timeout de 5s para não travar em cold start.
        if (event === 'INITIAL_SESSION') {
          clearTimeout(safetyTimeout)
          const p = await Promise.race([
            fetchProfile(u.id),
            new Promise(resolve => setTimeout(() => resolve(null), 5000)),
          ])
          if (!mounted) return
          setUser(u); setProfile(p); setLoading(false)
          return
        }

        // ── SIGN_IN: aproveita o profile já buscado em signIn() ───────
        // Isso elimina um round-trip extra ao banco logo após o login.
        if (event === 'SIGN_IN') {
          clearTimeout(safetyTimeout)
          const cached = pendingProfile.current
          pendingProfile.current = null
          // Se temos o cache (fluxo normal via signIn()), usa direto.
          // Caso contrário (OAuth, magic link, etc.) busca com timeout.
          const p = (cached?.userId === u.id)
            ? cached.profile
            : await Promise.race([
                fetchProfile(u.id),
                new Promise(resolve => setTimeout(() => resolve(null), 5000)),
              ])
          if (!mounted) return
          setUser(u); setProfile(p); setLoading(false)
          return
        }

        // ── TOKEN_REFRESHED / outros eventos ──────────────────────────
        const p = await Promise.race([
          fetchProfile(u.id),
          new Promise(resolve => setTimeout(() => resolve(null), 5000)),
        ])
        if (!mounted) return
        clearTimeout(safetyTimeout)
        setUser(u); setProfile(p); setLoading(false)
      }
    )

    return () => {
      mounted = false
      clearTimeout(safetyTimeout)
      subscription.unsubscribe()
    }
  }, [])

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)

    // Busca o profile completo UMA vez aqui e guarda no cache.
    // O handler SIGN_IN vai consumir esse cache em vez de fazer outro round-trip.
    const p = await fetchProfile(data.user.id)

    if (p?.ativo === false) {
      await supabase.auth.signOut()
      throw new Error('Sua conta foi desativada. Entre em contato com o administrador.')
    }

    // Salva no ref para o onAuthStateChange SIGN_IN aproveitar
    pendingProfile.current = { userId: data.user.id, profile: p }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  const isAdmin = profile?.tipo === 'admin'

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  return ctx
}
