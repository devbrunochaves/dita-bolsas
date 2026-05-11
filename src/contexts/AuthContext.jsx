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

    // Safety timeout de 8 s — garante que a UI nunca fica presa eternamente
    const safetyTimeout = setTimeout(() => {
      if (mounted) setLoading(false)
    }, 8000)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        const u = session?.user ?? null

        // Sem usuário → volta para login
        if (!u) {
          clearTimeout(safetyTimeout)
          if (mounted) { setUser(null); setProfile(null); setLoading(false) }
          return
        }

        // Todos os eventos com usuário usam o mesmo fluxo:
        // busca o profile com timeout de 5 s e só então libera a UI.
        // Isso garante que user + profile chegam juntos e evita flashes
        // de estado intermediário que causavam tela branca.
        clearTimeout(safetyTimeout)
        const p = await Promise.race([
          fetchProfile(u.id),
          new Promise(resolve => setTimeout(() => resolve(null), 5000)),
        ])
        if (!mounted) return
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

    // Verifica conta desativada imediatamente após o login
    const { data: p } = await supabase
      .from('profiles')
      .select('ativo')
      .eq('id', data.user.id)
      .maybeSingle()

    if (p?.ativo === false) {
      await supabase.auth.signOut()
      throw new Error('Sua conta foi desativada. Entre em contato com o administrador.')
    }
    // O onAuthStateChange (SIGN_IN) cuida de setUser/setProfile/setLoading
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
