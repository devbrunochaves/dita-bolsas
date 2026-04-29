import { useState, useEffect, useMemo } from 'react'
import { getFinanceiro } from '../../utils/storage'
import { useAuth } from '../../contexts/AuthContext'

// ── Helpers ──────────────────────────────────────────────────

const fmtBRL = v =>
  Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function fmtDate(str) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('pt-BR')
}

function hoje() { return new Date().toISOString().split('T')[0] }

function resolveStatus(p) {
  if (p.statusFinanceiro !== 'pendente') return p.statusFinanceiro
  if (p.dataVencimento && p.dataVencimento < hoje()) return 'atrasado'
  return 'pendente'
}

const STATUS_CFG = {
  pendente:  { label: 'Pendente',  bg: '#FFFBEB', color: '#92400E', border: '#FDE68A', dot: '#F59E0B' },
  pago:      { label: 'Pago',      bg: '#F0FDF4', color: '#166534', border: '#86EFAC', dot: '#22C55E' },
  atrasado:  { label: 'Atrasado',  bg: '#FEF2F2', color: '#DC2626', border: '#FECACA', dot: '#EF4444' },
  cancelado: { label: 'Cancelado', bg: '#F3F4F6', color: '#6B7280', border: '#D1D5DB', dot: '#9CA3AF' },
}

const STATUS_OP = {
  PENDENTE:  { label: 'Pendente',  color: '#92400E', bg: '#FFFBEB', border: '#FDE68A' },
  ENTREGUE:  { label: 'Entregue',  color: '#166534', bg: '#F0FDF4', border: '#86EFAC' },
  CANCELADO: { label: 'Cancelado', color: '#6B7280', bg: '#F3F4F6', border: '#D1D5DB' },
}

function StatusBadge({ status, tipo = 'fin' }) {
  const cfg = tipo === 'op'
    ? (STATUS_OP[status] || STATUS_OP.PENDENTE)
    : (STATUS_CFG[status] || STATUS_CFG.pendente)
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700,
      color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`,
      whiteSpace: 'nowrap',
    }}>
      {tipo === 'fin' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />}
      {cfg.label}
    </span>
  )
}

// ── Card de resumo ───────────────────────────────────────────
function Card({ icon, label, valor, sub, color, bg, border }) {
  return (
    <div style={{
      background: 'white', borderRadius: 16, border: `1px solid ${border}`,
      padding: '22px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
          {icon}
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, lineHeight: 1.3 }}>
          {label}
        </span>
      </div>
      <div style={{ fontSize: 26, fontWeight: 900, color, letterSpacing: -0.5 }}>{valor}</div>
      {sub && <div style={{ fontSize: 12, color: '#9CA3AF' }}>{sub}</div>}
    </div>
  )
}

// ── Página ───────────────────────────────────────────────────
export default function MeuFinanceiro() {
  const { profile } = useAuth()
  const [pedidos, setPedidos]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [periodo, setPeriodo]   = useState('mes_atual')
  const [customInicio, setCustomInicio] = useState('')
  const [customFim, setCustomFim]       = useState('')

  const nomeVendedor = profile?.nome || ''

  function periodoRange(tipo) {
    const now = new Date()
    if (tipo === 'hoje') {
      const d = hoje()
      return { inicio: d, fim: d }
    }
    if (tipo === 'mes_atual') {
      const inicio = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
      const fim    = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
      return { inicio, fim }
    }
    if (tipo === 'mes_anterior') {
      const inicio = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0]
      const fim    = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0]
      return { inicio, fim }
    }
    return { inicio: null, fim: null }
  }

  useEffect(() => {
    if (!nomeVendedor) return
    setLoading(true)
    const range = periodo === 'personalizado'
      ? { inicio: customInicio || null, fim: customFim || null }
      : periodoRange(periodo)

    getFinanceiro({ inicio: range.inicio, fim: range.fim, vendedor: nomeVendedor })
      .then(data => { setPedidos(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [nomeVendedor, periodo, customInicio, customFim])

  // ── Cálculos ─────────────────────────────────────────────────
  const { faturamento, comissoesReceber, totalPedidos, qtdPagos } = useMemo(() => {
    const ativos = pedidos.filter(p => resolveStatus(p) !== 'cancelado')
    return {
      faturamento:       ativos.reduce((s, p) => s + p.valorFinal, 0),
      comissoesReceber:  ativos.filter(p => !p.comissaoPaga).reduce((s, p) => s + p.valorComissao, 0),
      totalPedidos:      ativos.length,
      qtdPagos:          ativos.filter(p => resolveStatus(p) === 'pago').length,
    }
  }, [pedidos])

  const PERIODOS = [
    { key: 'hoje',          label: 'Hoje' },
    { key: 'mes_atual',     label: 'Mês Atual' },
    { key: 'mes_anterior',  label: 'Mês Anterior' },
    { key: 'personalizado', label: 'Personalizado' },
  ]

  const temComissao = pedidos.some(p => p.comissaoPercentual > 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#1F2937' }}>
            Meu Financeiro
          </h1>
          <p style={{ color: '#6B7280', fontSize: 13, marginTop: 2 }}>
            {loading ? 'Carregando...' : `${totalPedidos} pedido(s) no período · ${qtdPagos} pago(s)`}
          </p>
        </div>

        {/* Filtro de período */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {PERIODOS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriodo(key)}
              style={{
                padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                border: `1.5px solid ${periodo === key ? '#1B6E3C' : '#E5E7EB'}`,
                background: periodo === key ? '#1B6E3C' : 'white',
                color: periodo === key ? 'white' : '#374151',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Datas personalizadas */}
      {periodo === 'personalizado' && (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 12, padding: '14px 18px' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#92400E' }}>Período:</span>
          {[['De', customInicio, setCustomInicio], ['Até', customFim, setCustomFim]].map(([lbl, val, set]) => (
            <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontSize: 12, color: '#92400E', fontWeight: 600 }}>{lbl}</label>
              <input type="date" value={val} onChange={e => set(e.target.value)}
                style={{ border: '1.5px solid #FDE68A', borderRadius: 8, padding: '7px 10px', fontSize: 13, outline: 'none', background: 'white' }} />
            </div>
          ))}
        </div>
      )}

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <Card
          icon="💰"
          label="Faturamento Total"
          valor={fmtBRL(faturamento)}
          sub={`${totalPedidos} pedido(s) no período`}
          color="#1F2937"
          bg="#F9FAFB"
          border="#E5E7EB"
        />
        {temComissao ? (
          <Card
            icon="🤝"
            label="Comissões a Receber"
            valor={fmtBRL(comissoesReceber)}
            sub="Comissões ainda não pagas"
            color="#1D4ED8"
            bg="#EFF6FF"
            border="#BFDBFE"
          />
        ) : (
          <div style={{ background: 'white', borderRadius: 16, border: '1px dashed #D1D5DB', padding: '22px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🤝</div>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 }}>Comissões</span>
            </div>
            <div style={{ fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' }}>Comissão não configurada. Fale com o administrador.</div>
          </div>
        )}
      </div>

      {/* Tabela de pedidos */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, gap: 16 }}>
          <div style={{ width: 36, height: 36, border: '4px solid #E5E7EB', borderTopColor: '#1B6E3C', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ color: '#6B7280', fontSize: 14 }}>Carregando seus pedidos...</span>
        </div>
      ) : pedidos.length === 0 ? (
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E5E7EB', padding: '56px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Nenhum pedido neste período</h3>
          <p style={{ color: '#9CA3AF', fontSize: 14 }}>Tente selecionar outro período ou emita um novo pedido.</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1F2937' }}>
              Meus Pedidos
            </h2>
            <span style={{ fontSize: 13, color: '#6B7280' }}>
              Total: <strong style={{ color: '#1B6E3C' }}>{fmtBRL(faturamento)}</strong>
            </span>
          </div>

          <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'auto', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '2px solid #E5E7EB' }}>
                  {['Nº', 'Cliente', 'Data', 'Valor Total', ...(temComissao ? ['Comissão'] : []), 'Pedido', 'Pagamento'].map(h => (
                    <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pedidos.map(p => {
                  const stFin = resolveStatus(p)
                  return (
                    <tr
                      key={p.id}
                      style={{ borderBottom: '1px solid #F3F4F6', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                      <td style={{ padding: '13px 16px', fontWeight: 800, color: '#1B6E3C', fontSize: 14 }}>
                        #{String(p.numero).padStart(4, '0')}
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: '#1F2937' }}>{p.cliente?.nome || '—'}</div>
                        {p.cliente?.cidade && (
                          <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>{p.cliente.cidade}</div>
                        )}
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: 13, color: '#6B7280', whiteSpace: 'nowrap' }}>
                        {fmtDate(p.dataCriacao)}
                      </td>
                      <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#1F2937' }}>{fmtBRL(p.valorFinal)}</div>
                        {p.desconto > 0 && (
                          <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>
                            Desconto: {fmtBRL(p.desconto)}
                          </div>
                        )}
                      </td>
                      {temComissao && (
                        <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
                          {p.valorComissao > 0 ? (
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: '#1D4ED8' }}>
                                {fmtBRL(p.valorComissao)}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
                                <span style={{ fontSize: 11, color: '#9CA3AF' }}>{p.comissaoPercentual}%</span>
                                {p.comissaoPaga ? (
                                  <span style={{ fontSize: 10, fontWeight: 700, color: '#16A34A', background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 100, padding: '1px 7px' }}>✓ Paga</span>
                                ) : (
                                  <span style={{ fontSize: 10, fontWeight: 700, color: '#92400E', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 100, padding: '1px 7px' }}>Pendente</span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: '#D1D5DB', fontSize: 13 }}>—</span>
                          )}
                        </td>
                      )}
                      <td style={{ padding: '13px 16px' }}>
                        <StatusBadge status={p.status} tipo="op" />
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        <StatusBadge status={stFin} tipo="fin" />
                      </td>
                    </tr>
                  )
                })}
              </tbody>

              {/* Totalizador */}
              <tfoot>
                <tr style={{ background: '#F9FAFB', borderTop: '2px solid #E5E7EB' }}>
                  <td colSpan={3} style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Total ({pedidos.length} pedidos)
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 15, fontWeight: 900, color: '#1B6E3C' }}>{fmtBRL(faturamento)}</span>
                  </td>
                  {temComissao && (
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: '#1D4ED8' }}>{fmtBRL(comissoesReceber)}</span>
                      <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 1 }}>a receber</div>
                    </td>
                  )}
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
