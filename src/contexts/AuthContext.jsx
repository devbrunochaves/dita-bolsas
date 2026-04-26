import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const resolvedRef = useRef(false) // garante que setLoading(false) roda só uma vez

  function done(u, p) {
    if (resolvedRef.current) return
    resolvedRef.current = true
    setUser(u)
    setProfile(p)
    setLoading(false)
  }

  useEffect(() => {
    // Timeout de segurança: libera o loading após 6s no pior caso
    const timeout = setTimeout(() => {
      if (!resolvedRef.current) {
        console.warn('[Auth] Timeout — liberando loading sem sessão')
        done(null, null)
      }
    }, 6000)

    // onAuthStateChange é a fonte principal no Supabase v2
    // Dispara INITIAL_SESSION imediatamente se houver sessão salva
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const u = session?.user ?? null

        if (!u) {
          done(null, null)
          return
        }

        // Busca profile
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', u.id)
            .single()

          const p = (!error && data) ? data : null
          done(u, p)

          // Atualiza sem travar se já resolveu
          if (resolvedRef.current) {
            setUser(u)
            setProfile(p)
          }
        } catch {
          done(u, null)
        }
      }
    )

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
    // onAuthStateChange vai atualizar user + profile automaticamente
  }

  async function signOut() {
    resolvedRef.current = false
    setLoading(true)
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setLoading(false)
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
