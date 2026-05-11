import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, profile, loading } = useAuth()

  // Aguarda verificação de sessão
  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: '#F3F4F6', flexDirection: 'column', gap: 16,
        fontFamily: 'Inter, sans-serif',
      }}>
        <div style={{
          width: 44, height: 44, border: '4px solid #E5E7EB',
          borderTopColor: '#1B6E3C', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <span style={{ color: '#6B7280', fontSize: 14 }}>Verificando sessão...</span>
      </div>
    )
  }

  // Não logado → login
  if (!user) return <Navigate to="/login" replace />

  // Conta desativada → login
  // Após a correção do AuthContext, o profile já chegou antes do loading=false.
  // Se ainda for null (timeout de 5s esgotou), deixa passar — mas loga aviso.
  if (profile === null) {
    console.warn('[Auth] Profile não carregou a tempo — acesso liberado sem verificação de ativo')
  }
  if (profile?.ativo === false) return <Navigate to="/login" replace />

  // Rota exclusiva de admin:
  // Se profile ainda é null (timeout), bloqueia rotas adminOnly por segurança.
  if (adminOnly && profile?.tipo !== 'admin') {
    return <Navigate to="/pedido" replace />
  }

  return children
}
