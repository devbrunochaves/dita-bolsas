import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getClientes, getProdutos, getPedidos, updatePedidoStatus } from '../../utils/storage'

// ── Configuração de cada status ──────────────────────────────
const STATUS_CONFIG = {
  PENDENTE:      { label: 'PENDENTE',      color: '#B45309', bg: '#FEF3C7', border: '#FDE68A', dot: '#F59E0B' },
  'EM PRODUÇÃO': { label: 'EM PRODUÇÃO',   color: '#166534', bg: '#DCFCE7', border: '#86EFAC', dot: '#22C55E' },
  ATRASADO:      { label: 'ATRASADO',      color: '#991B1B', bg: '#FEE2E2', border: '#FECACA', dot: '#EF4444' },
  ENTREGUE:      { label: 'ENTREGUE',      color: '#374151', bg: '#F3F4F6', border: '#D1D5DB', dot: '#9CA3AF' },
}

const STATUS_LIST = ['PENDENTE', 'EM PRODUÇÃO', 'ATRASADO', 'ENTREGUE']

// ── Badge de status ──────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDENTE
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700,
      color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`,
      whiteSpace: 'nowrap', letterSpacing: 0.3,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  )
}

// ── Select inline de status ──────────────────────────────────
function StatusSelect({ pedidoId, current, onChange }) {
  const [saving, setSaving] = useState(false)
  const cfg = STATUS_CONFIG[current] || STATUS_CONFIG.PENDENTE

  async function handleChange(e) {
    const novoStatus = e.target.value
    setSaving(true)
    try {
      await updatePedidoStatus(pedidoId, novoStatus)
      onChange(pedidoId, novoStatus)
    } finally {
      setSaving(false)
    }
  }

  return (
    <select
      value={current}
      onChange={handleChange}
      disabled={saving}
      style={{
        fontSize: 11, fontWeight: 700, padding: '4px 8px', borderRadius: 100,
        border: `1px solid ${cfg.border}`, color: cfg.color, background: cfg.bg,
        cursor: 'pointer', outline: 'none', appearance: 'none',
        paddingRight: 20, opacity: saving ? 0.6 : 1,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='${encodeURIComponent(cfg.color)}' d='M0 0l5 6 5-6z'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center',
      }}
    >
      {STATUS_LIST.map(s => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  )
}

// ── Card de estatística ──────────────────────────────────────
function StatCard({ icon, label, value, color, to }) {
  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'white', borderRadius: 14, padding: '24px',
        display: 'flex', alignItems: 'center', gap: 18,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB',
        transition: 'all 0.2s', cursor: 'pointer',
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

// ── Card de status ───────────────────────────────────────────
function StatusCard({ status, count }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <div style={{
      background: 'white', borderRadius: 14, padding: '20px 24px',
      border: `1px solid ${cfg.border}`,
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      display: 'flex', alignItems: 'center', gap: 16,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12, background: cfg.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{ width: 18, height: 18, borderRadius: '50%', background: cfg.dot, display: 'block' }} />
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 800, color: cfg.color, lineHeight: 1 }}>{count}</div>
        <div style={{ fontSize: 12, fontWeight: 700, color: cfg.color, marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.5 }}>{cfg.label}</div>
      </div>
    </div>
  )
}

// ── Componente principal ─────────────────────────────────────
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

  // Atualiza status localmente sem recarregar tudo
  const handleStatusChange = useCallback((id, novoStatus) => {
    setPedidos(prev => prev.map(p => p.id === id ? { ...p, status: novoStatus } : p))
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
      ⚠️ Erro ao conectar com o banco de dados: <strong>{error}</strong>
    </div>
  )

  // Contagens por status
  const contagemStatus = STATUS_LIST.reduce((acc, s) => {
    acc[s] = pedidos.filter(p => (p.status || 'PENDENTE') === s).length
    return acc
  }, {})

  return (
    <div>
      {/* Boas-vindas */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1F2937', marginBottom: 4 }}>
          Bem-vindo ao sistema de pedidos 👋
        </h1>
        <p style={{ color: '#6B7280', fontSize: 15 }}>
          Gerencie seus clientes, produtos e emita orçamentos em PDF com facilidade.
        </p>
      </div>

      {/* Cards de totais gerais */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard icon="👥" label="Clientes cadastrados" value={clientes.length} color="#1B6E3C" to="/pedido/clientes" />
        <StatCard icon="📦" label="Produtos cadastrados" value={produtos.length} color="#2563EB" to="/pedido/produtos" />
        <StatCard icon="📋" label="Pedidos emitidos"     value={pedidos.length}  color="#D97706" to="/pedido" />
      </div>

      {/* Ações rápidas */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#374151', marginBottom: 14 }}>Ações Rápidas</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
          {[
            { to: '/pedido/emitir',        icon: '📋', label: 'Emitir Pedido',  color: '#1B6E3C', bg: '#E8F5ED' },
            { to: '/pedido/clientes/novo', icon: '➕', label: 'Novo Cliente',   color: '#2563EB', bg: '#EFF6FF' },
            { to: '/pedido/produtos/novo', icon: '📦', label: 'Novo Produto',   color: '#D97706', bg: '#FFFBEB' },
            { to: '/pedido/clientes',      icon: '👥', label: 'Ver Clientes',   color: '#7C3AED', bg: '#F5F3FF' },
          ].map(action => (
            <Link key={action.to} to={action.to} style={{
              background: 'white', border: '1px solid #E5E7EB', borderRadius: 12, padding: '18px 16px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
              textDecoration: 'none', textAlign: 'center', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = action.bg; e.currentTarget.style.borderColor = action.color + '40' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#E5E7EB' }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: action.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{action.icon}</div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Cards de status dos pedidos */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#374151', marginBottom: 14 }}>Status dos Pedidos</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
          {STATUS_LIST.map(s => (
            <StatusCard key={s} status={s} count={contagemStatus[s]} />
          ))}
        </div>
      </div>

      {/* Tabela de pedidos emitidos */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#374151' }}>Pedidos Emitidos</h2>
          <Link to="/pedido/emitir" className="ped-btn-primary" style={{ fontSize: 13, padding: '8px 16px' }}>
            + Novo Pedido
          </Link>
        </div>

        {pedidos.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E5E7EB', padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Nenhum pedido ainda</h3>
            <p style={{ color: '#9CA3AF', fontSize: 14, marginBottom: 20 }}>Emita seu primeiro orçamento agora mesmo!</p>
            <Link to="/pedido/emitir" className="ped-btn-primary">Emitir Primeiro Pedido</Link>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'auto', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <table className="ped-table" style={{ minWidth: 800 }}>
              <thead>
                <tr>
                  <th style={{ width: 54 }}>#</th>
                  <th>Cliente</th>
                  <th style={{ width: 70, textAlign: 'center' }}>Itens</th>
                  <th style={{ width: 120, textAlign: 'right' }}>Valor Total</th>
                  <th style={{ width: 160 }}>Status</th>
                  <th style={{ width: 140 }}>Emitido por</th>
                  <th style={{ width: 100 }}>Data</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 800, color: '#1B6E3C', fontSize: 14 }}>#{p.numero || '-'}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#1F2937', fontSize: 14 }}>{p.cliente?.nome || '-'}</div>
                      {p.cliente?.cidade && (
                        <div style={{ fontSize: 11, color: '#9CA3AF' }}>{p.cliente.cidade} / {p.cliente.estado}</div>
                      )}
                    </td>
                    <td style={{ textAlign: 'center', color: '#6B7280', fontSize: 13 }}>
                      {p.itens?.length || 0}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#1F2937', fontSize: 14 }}>
                      R$ {Number(p.valorFinal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <StatusSelect
                        pedidoId={p.id}
                        current={p.status || 'PENDENTE'}
                        onChange={handleStatusChange}
                      />
                    </td>
                    <td style={{ fontSize: 13, color: '#6B7280' }}>
                      {p.emitidoPor || (
                        <span style={{ color: '#D1D5DB', fontStyle: 'italic' }}>— a configurar</span>
                      )}
                    </td>
                    <td style={{ fontSize: 12, color: '#9CA3AF', whiteSpace: 'nowrap' }}>
                      {p.dataCriacao ? new Date(p.dataCriacao).toLocaleDateString('pt-BR') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
