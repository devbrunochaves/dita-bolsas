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

    // 1. Lê a sessão atual do localStorage (confiável no F5 e recargas)
    //    getSession() não faz chamada de rede para leitura — usa storage local
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return
      const u = session?.user ?? null
      if (u) {
        const p = await fetchProfile(u.id)
        if (mounted) { setUser(u); setProfile(p) }
      }
      if (mounted) setLoading(false)
    })

    // 2. Escuta mudanças subsequentes (login, logout, token refresh)
    //    INITIAL_SESSION é ignorado — já tratado pelo getSession() acima
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
      subscription.unsubscribe()
    }
  }, [])

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
    // SIGNED_IN dispara onAuthStateChange → atualiza user + profile
  }

  async function signOut() {
    await supabase.auth.signOut()
    // SIGNED_OUT dispara onAuthStateChange → limpa user + profile
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
