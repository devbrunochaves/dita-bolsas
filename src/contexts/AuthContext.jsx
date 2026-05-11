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
      console.warn('[Auth] fetchProfile erro:', error.message)
      return null
    }
    return data || null
  } catch (e) {
    console.warn('[Auth] fetchProfile exception:', e)
    return null
  }
}

// Busca profile com limite de tempo — nunca trava mais de `ms` ms
function fetchProfileComTimeout(userId, ms = 5000) {
  return Promise.race([
    fetchProfile(userId),
    new Promise(resolve => setTimeout(() => resolve(null), ms)),
  ])
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Safety net: se por algum motivo nenhum evento auth disparar em 10s,
    // libera a UI para não travar o spinner para sempre.
    const safetyTimeout = setTimeout(() => {
      if (mounted) setLoading(false)
    }, 10000)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        const u = session?.user ?? null

        // ── Sem sessão → garante estado limpo e libera a UI ──────────
        if (!u) {
          clearTimeout(safetyTimeout)
          if (mounted) { setUser(null); setProfile(null); setLoading(false) }
          return
        }

        // ── Com sessão: busca profile antes de liberar a UI ───────────
        // Timeout de 5 s garante que cold start do banco não trava o login.
        // user + profile + loading são atualizados juntos para evitar
        // estado intermediário que causava tela branca.
        clearTimeout(safetyTimeout)
        const p = await fetchProfileComTimeout(u.id, 5000)
        if (!mounted) return
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

    // Verifica conta desativada — consulta mínima e direta
    const { data: p } = await supabase
      .from('profiles')
      .select('ativo')
      .eq('id', data.user.id)
      .maybeSingle()

    if (p?.ativo === false) {
      await supabase.auth.signOut()
      throw new Error('Sua conta foi desativada. Entre em contato com o administrador.')
    }
    // A navegação acontece via useEffect no Login quando o onAuthStateChange
    // disparar e definir user + profile + loading = false
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
