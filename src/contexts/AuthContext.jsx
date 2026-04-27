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

  useEffect(() => {
    let mounted = true

    // Safety timeout: garante que o loading some em até 8s no pior caso
    const safetyTimeout = setTimeout(() => {
      if (mounted) setLoading(false)
    }, 8000)

    // onAuthStateChange é a fonte de verdade — inclui INITIAL_SESSION
    // que no Supabase v2 dispara imediatamente com a sessão do localStorage
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        const u = session?.user ?? null

        if (!u) {
          clearTimeout(safetyTimeout)
          if (mounted) { setUser(null); setProfile(null); setLoading(false) }
          return
        }

        const p = await fetchProfile(u.id)
        if (!mounted) return
        clearTimeout(safetyTimeout)
        setUser(u)
        setProfile(p)
        setLoading(false)
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

    // Verifica imediatamente se a conta está desativada
    const { data: p } = await supabase
      .from('profiles')
      .select('ativo')
      .eq('id', data.user.id)
      .maybeSingle()

    if (p?.ativo === false) {
      await supabase.auth.signOut()
      throw new Error('Sua conta foi desativada. Entre em contato com o administrador.')
    }
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
