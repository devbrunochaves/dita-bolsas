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
  } catch (error) {
    console.warn('[Auth] fetchProfile exception:', error)
    return null
  }
}

function fetchProfileComTimeout(userId, ms = 15000) {
  return Promise.race([
    fetchProfile(userId),
    new Promise(resolve => setTimeout(() => resolve(null), ms)),
  ])
}

async function fetchProfileComRetry(userId) {
  const profile = await fetchProfileComTimeout(userId, 12000)
  if (profile) return profile
  await new Promise(resolve => setTimeout(resolve, 3000))
  return fetchProfileComTimeout(userId, 15000)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    let hydrationId = 0

    // Restaura a sessão e consulta o perfil fora do callback de autenticação.
    // Isso evita o bloqueio que podia ocorrer quando já havia uma sessão salva.
    async function hydrateSession(session) {
      const currentHydration = ++hydrationId
      const currentUser = session?.user ?? null

      if (!currentUser) {
        if (mounted && currentHydration === hydrationId) {
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
        return
      }

      if (mounted) {
        setUser(currentUser)
        setLoading(true)
      }

      const currentProfile = await fetchProfileComRetry(currentUser.id)
      if (!mounted || currentHydration !== hydrationId) return
      setProfile(currentProfile)
      setLoading(false)
    }

    const safetyTimeout = setTimeout(() => {
      if (mounted) setLoading(false)
    }, 30000)

    // Não depende apenas do INITIAL_SESSION: recupera explicitamente a sessão.
    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (error) console.warn('[Auth] getSession erro:', error.message)
        return hydrateSession(data?.session ?? null)
      })
      .catch(error => {
        console.warn('[Auth] getSession exception:', error)
        return hydrateSession(null)
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted || event === 'INITIAL_SESSION') return

        // Agenda para fora do callback e evita reentrância no cliente Supabase.
        setTimeout(() => {
          if (mounted) hydrateSession(session)
        }, 0)
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

    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('ativo')
      .eq('id', data.user.id)
      .maybeSingle()

    if (currentProfile?.ativo === false) {
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
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  return context
}
