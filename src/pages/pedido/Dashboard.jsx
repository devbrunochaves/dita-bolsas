import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getClientes, getProdutos, getPedidos } from '../../utils/storage'

function StatCard({ icon, label, value, color, to }) {
  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'white', borderRadius: 14, padding: '24px', display: 'flex', alignItems: 'center', gap: 18,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB', transition: 'all 0.2s', cursor: 'pointer',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(0)' }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
          {icon}
        </div>
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#1F2937', lineHeight: 1 }}>{value}</div>
          <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4, fontWeight: 500 }}>{label}</div>
        </div>
      </div>
    </Link>
  )
}

export default function Dashboard() {
  const [clientes, setClientes] = useState([])
  const [produtos, setProdutos] = useState([])
  const [pedidos, setPedidos]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const [c, p, ped] = await Promise.all([getClientes(), getProdutos(), getPedidos()])
        setClientes(c)
        setProdutos(p)
        setPedidos(ped)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 40, height: 40, border: '4px solid #E5E7EB', borderTopColor: '#1B6E3C', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <span style={{ color: '#6B7280', fontSize: 14 }}>Carregando dados...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  if (error) return (
    <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: 24, color: '#DC2626' }}>
      ⚠️ Erro ao conectar com o banco de dados: <strong>{error}</strong><br/>
      <small>Verifique se as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão corretas no .env</small>
    </div>
  )

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1F2937', marginBottom: 4 }}>Bem-vindo ao sistema de pedidos 👋</h1>
        <p style={{ color: '#6B7280', fontSize: 15 }}>Gerencie seus clientes, produtos e emita orçamentos em PDF com facilidade.</p>
      </div>

      {/* Estatísticas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard icon="👥" label="Clientes cadastrados" value={clientes.length} color="#1B6E3C" to="/pedido/clientes" />
        <StatCard icon="📦" label="Produtos cadastrados" value={produtos.length} color="#2563EB" to="/pedido/produtos" />
        <StatCard icon="📋" label="Pedidos emitidos"     value={pedidos.length}  color="#D97706" to="/pedido" />
      </div>

      {/* Ações rápidas */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#374151', marginBottom: 16 }}>Ações Rápidas</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {[
            { to: '/pedido/emitir',        icon: '📋', label: 'Emitir Pedido',  color: '#1B6E3C', bg: '#E8F5ED' },
            { to: '/pedido/clientes/novo', icon: '➕', label: 'Novo Cliente',   color: '#2563EB', bg: '#EFF6FF' },
            { to: '/pedido/produtos/novo', icon: '📦', label: 'Novo Produto',   color: '#D97706', bg: '#FFFBEB' },
            { to: '/pedido/clientes',      icon: '👥', label: 'Ver Clientes',   color: '#7C3AED', bg: '#F5F3FF' },
          ].map(action => (
            <Link key={action.to} to={action.to} style={{
              background: 'white', border: '1px solid #E5E7EB', borderRadius: 12, padding: '20px 16px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
              textDecoration: 'none', color: '#1F2937', textAlign: 'center', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = action.bg; e.currentTarget.style.borderColor = action.color + '40' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#E5E7EB' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: action.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{action.icon}</div>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Últimos pedidos */}
      {pedidos.length > 0 ? (
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#374151', marginBottom: 16 }}>Últimos Pedidos</h2>
          <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
            <table className="ped-table">
              <thead>
                <tr>
                  <th>#</th><th>Cliente</th><th>Itens</th><th>Valor Total</th><th>Data</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.slice(0, 10).map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 700, color: '#1B6E3C' }}>#{p.numero || '-'}</td>
                    <td>{p.cliente?.nome || '-'}</td>
                    <td>{p.itens?.length || 0} item(ns)</td>
                    <td style={{ fontWeight: 600 }}>R$ {Number(p.valorFinal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td style={{ color: '#6B7280' }}>{p.dataCriacao ? new Date(p.dataCriacao).toLocaleDateString('pt-BR') : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E5E7EB', padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Nenhum pedido ainda</h3>
          <p style={{ color: '#9CA3AF', fontSize: 14, marginBottom: 20 }}>Emita seu primeiro orçamento agora mesmo!</p>
          <Link to="/pedido/emitir" className="ped-btn-primary">Emitir Primeiro Pedido</Link>
        </div>
      )}
    </div>
  )
}
