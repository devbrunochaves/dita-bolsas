import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

async function fetchProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return (!error && data) ? data : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Safety timeout: garante que o loading some em até 6s, mesmo se getSession travar
    const safetyTimeout = setTimeout(() => {
      if (mounted) setLoading(false)
    }, 6000)

    // Inicializa com sessão do localStorage (pode fazer refresh de token via rede)
    async function init() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!mounted) return
        const u = session?.user ?? null
        if (u) {
          const p = await fetchProfile(u.id)
          if (mounted) { setUser(u); setProfile(p) }
        }
      } catch {
        // silencia erros — o finally garante que o loading é removido
      } finally {
        clearTimeout(safetyTimeout)
        if (mounted) setLoading(false)
      }
    }

    init()

    // Escuta mudanças subsequentes (login, logout, token refresh)
    // INITIAL_SESSION é ignorado — já tratado pelo init() acima
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'INITIAL_SESSION') return

        const u = session?.user ?? null
        if (!u) {
          if (mounted) { setUser(null); setProfile(null) }
          return
        }
        const p = await fetchProfile(u.id)
        if (mounted) { setUser(u); setProfile(p) }
      }
    )

    return () => {
      mounted = false
      clearTimeout(safetyTimeout)
      subscription.unsubscribe()
    }
  }, [])

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
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
