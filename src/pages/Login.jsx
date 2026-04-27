import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { user, signIn } = useAuth()
  const navigate         = useNavigate()

  const [email, setEmail]       = useState('')
  const [senha, setSenha]       = useState('')
  const [erro, setErro]         = useState('')
  const [loading, setLoading]   = useState(false)

  // Navega ao /pedido assim que o user for setado (cobre o delay do onAuthStateChange)
  useEffect(() => {
    if (user) navigate('/pedido', { replace: true })
  }, [user])

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      await signIn(email, senha)
      navigate('/pedido', { replace: true })
    } catch (err) {
      setErro(err.message || 'Email ou senha incorretos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #1B6E3C 0%, #134f2c 100%)',
      fontFamily: 'Inter, sans-serif', padding: 24,
    }}>
      <div style={{
        background: 'white', borderRadius: 20, padding: '48px 40px',
        width: '100%', maxWidth: 400,
        boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
            <span style={{ fontFamily: '"Playfair Display", serif', fontStyle: 'italic', fontWeight: 700, fontSize: 40, color: '#1B6E3C' }}>
              Dita
            </span>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#9CA3AF', letterSpacing: 3, textTransform: 'uppercase' }}>
              Bolsas
            </span>
          </div>
          <p style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>
            Plataforma de Pedidos
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Email */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              autoComplete="email"
              style={{
                width: '100%', border: '1.5px solid #D1D5DB', borderRadius: 10,
                padding: '12px 14px', fontSize: 14, outline: 'none',
                boxSizing: 'border-box', transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#1B6E3C'}
              onBlur={e => e.target.style.borderColor = '#D1D5DB'}
            />
          </div>

          {/* Senha */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              style={{
                width: '100%', border: '1.5px solid #D1D5DB', borderRadius: 10,
                padding: '12px 14px', fontSize: 14, outline: 'none',
                boxSizing: 'border-box', transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#1B6E3C'}
              onBlur={e => e.target.style.borderColor = '#D1D5DB'}
            />
          </div>

          {/* Erro */}
          {erro && (
            <div style={{
              background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10,
              padding: '12px 14px', fontSize: 13, color: '#DC2626', display: 'flex', alignItems: 'center', gap: 8,
            }}>
              ⚠️ {erro}
            </div>
          )}

          {/* Botão */}
          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? '#6B7280' : '#1B6E3C', color: 'white',
              border: 'none', padding: '14px', borderRadius: 10,
              fontWeight: 800, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: 4, transition: 'background 0.2s',
              boxShadow: loading ? 'none' : '0 4px 14px rgba(27,110,60,0.3)',
            }}
          >
            {loading ? 'Entrando...' : 'Entrar →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#9CA3AF', marginTop: 28 }}>
          Acesso restrito · Dita Bolsas © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
