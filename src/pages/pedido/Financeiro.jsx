import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  getFinanceiro,
  getProfiles,
  updateStatusFinanceiro,
  updateDataVencimento,
  marcarComissaoPaga,
  marcarTodasComissoesPagas,
  getHistoricoFinanceiro,
} from '../../utils/storage'

// ── Helpers ──────────────────────────────────────────────────

const fmtBRL = v =>
  Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const fmtPct = v =>
  Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 1 }) + '%'

function fmtDate(str) {
  if (!str) return '—'
  return new Date(str + 'T12:00:00').toLocaleDateString('pt-BR')
}

function hoje() { return new Date().toISOString().split('T')[0] }

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

/** Resolve se um pedido está atrasado (pendente + vencimento expirado) */
function resolveStatus(p) {
  if (p.statusFinanceiro !== 'pendente') return p.statusFinanceiro
  if (p.dataVencimento && p.dataVencimento < hoje()) return 'atrasado'
  return 'pendente'
}

// ── Config de status financeiro ──────────────────────────────
const STATUS_CFG = {
  pendente:  { label: 'Pendente',  bg: '#FFFBEB', color: '#92400E', border: '#FDE68A', dot: '#F59E0B' },
  pago:      { label: 'Pago',      bg: '#F0FDF4', color: '#166534', border: '#86EFAC', dot: '#22C55E' },
  atrasado:  { label: 'Atrasado',  bg: '#FEF2F2', color: '#DC2626', border: '#FECACA', dot: '#EF4444' },
  cancelado: { label: 'Cancelado', bg: '#F3F4F6', color: '#6B7280', border: '#D1D5DB', dot: '#9CA3AF' },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.pendente
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700,
      color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  )
}

// ── Card de resumo ───────────────────────────────────────────
function CardResumo({ icon, label, valor, sub, color = '#1B6E3C', bg = '#F0FDF4', border = '#86EFAC' }) {
  return (
    <div style={{
      background: 'white', borderRadius: 14, border: `1px solid ${border}`,
      padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
          {icon}
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color }}>
        {valor}
      </div>
      {sub && <div style={{ fontSize: 11, color: '#9CA3AF' }}>{sub}</div>}
    </div>
  )
}

// ── Modal financeiro do pedido ───────────────────────────────
function ModalFinanceiro({ pedido, onClose, onAtualizado }) {
  const [historico, setHistorico]     = useState([])
  const [loadHist, setLoadHist]       = useState(true)
  const [novaData, setNovaData]       = useState(pedido.dataVencimento || '')
  const [editVenc, setEditVenc]       = useState(false)
  const [salvando, setSalvando]       = useState(false)

  const statusAtual = resolveStatus(pedido)

  useEffect(() => {
    getHistoricoFinanceiro(pedido.id)
      .then(data => { setHistorico(data); setLoadHist(false) })
      .catch(() => setLoadHist(false))
  }, [pedido.id])

  async function handleMarcarPago() {
    if (!window.confirm('Marcar este pedido como PAGO?')) return
    setSalvando(true)
    try {
      await updateStatusFinanceiro(pedido.id, 'pago')
      onAtualizado()
      onClose()
    } finally { setSalvando(false) }
  }

  async function handleCancelar() {
    if (!window.confirm('Cancelar o financeiro deste pedido?')) return
    setSalvando(true)
    try {
      await updateStatusFinanceiro(pedido.id, 'cancelado')
      onAtualizado()
      onClose()
    } finally { setSalvando(false) }
  }

  async function handleSalvarVenc() {
    if (!novaData) return
    setSalvando(true)
    try {
      await updateDataVencimento(pedido.id, novaData)
      setEditVenc(false)
      onAtualizado()
      // Atualiza histórico local
      const h = await getHistoricoFinanceiro(pedido.id)
      setHistorico(h)
    } finally { setSalvando(false) }
  }

  async function handleMarcarComissao() {
    if (!window.confirm('Marcar comissão deste pedido como paga?')) return
    setSalvando(true)
    try {
      await marcarComissaoPaga(pedido.id)
      onAtualizado()
      const h = await getHistoricoFinanceiro(pedido.id)
      setHistorico(h)
    } finally { setSalvando(false) }
  }

  const totalItens = pedido.itens?.reduce((s, i) => s + Number(i.vrTotal || 0), 0) || 0

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div style={{
        background: 'white', borderRadius: 18, width: '100%', maxWidth: 640,
        maxHeight: '92vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px', borderBottom: '1px solid #F3F4F6',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
              💰
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: '#1F2937' }}>
                Pedido #{String(pedido.numero).padStart(4, '0')}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                <StatusBadge status={statusAtual} />
                {pedido.comissaoPaga && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#1D4ED8', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 100, padding: '2px 8px' }}>
                    ✓ Comissão paga
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid #E5E7EB', background: '#F9FAFB', color: '#6B7280', cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>

        {/* Body (scroll) */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Grid de info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {/* Cliente */}
            <div style={{ background: '#F9FAFB', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Cliente</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#1F2937' }}>{pedido.cliente?.nome || '—'}</div>
              {pedido.cliente?.cidade && (
                <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{pedido.cliente.cidade} / {pedido.cliente.estado}</div>
              )}
              {pedido.cliente?.cnpjCpf && (
                <div style={{ fontSize: 12, color: '#6B7280' }}>{pedido.cliente.cnpjCpf}</div>
              )}
            </div>

            {/* Vendedor */}
            <div style={{ background: '#F9FAFB', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Vendedor</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#1F2937' }}>{pedido.emitidoPor || '—'}</div>
              {pedido.comissaoPercentual > 0 ? (
                <>
                  <div style={{ fontSize: 12, color: '#92400E', marginTop: 4 }}>
                    Comissão: <strong>{fmtPct(pedido.comissaoPercentual)}</strong>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1D4ED8', marginTop: 2 }}>
                    {fmtBRL(pedido.valorComissao)}
                    {pedido.comissaoPaga && <span style={{ fontSize: 11, color: '#22C55E', marginLeft: 6 }}>✓ Paga</span>}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>Sem comissão</div>
              )}
            </div>
          </div>

          {/* Valores */}
          <div style={{ background: '#F9FAFB', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Resumo Financeiro</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                ['Subtotal produtos', fmtBRL(totalItens), '#374151'],
                ['Desconto', `- ${fmtBRL(pedido.desconto)}`, '#DC2626'],
                ['Valor Final', fmtBRL(pedido.valorFinal), '#1B6E3C'],
              ].map(([label, val, color]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: '#6B7280' }}>{label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color }}>{val}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: '#6B7280' }}>Data de criação</span>
                <span style={{ fontSize: 13, color: '#374151' }}>
                  {new Date(pedido.dataCriacao).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </div>

          {/* Itens do pedido */}
          {pedido.itens?.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                Itens do Pedido ({pedido.itens.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {pedido.itens.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F9FAFB', borderRadius: 8, padding: '10px 14px', gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#6B7280' }}>{item.codigo} </span>
                      <span style={{ fontSize: 13, color: '#1F2937' }}>{item.nome}</span>
                      {item.observacoes && <div style={{ fontSize: 11, color: '#9CA3AF', fontStyle: 'italic' }}>{item.observacoes}</div>}
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 12, color: '#6B7280' }}>x{item.quantidade}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1B6E3C' }}>
                        {fmtBRL(item.vrTotal)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Datas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {/* Vencimento */}
            <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#92400E', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Vencimento</div>
              {editVenc ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input
                    type="date"
                    value={novaData}
                    onChange={e => setNovaData(e.target.value)}
                    style={{ border: '1.5px solid #FDE68A', borderRadius: 8, padding: '8px 10px', fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' }}
                  />
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={handleSalvarVenc} disabled={salvando || !novaData} style={{ flex: 1, background: '#1B6E3C', color: 'white', border: 'none', borderRadius: 7, padding: '7px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                      {salvando ? '...' : 'Salvar'}
                    </button>
                    <button onClick={() => { setEditVenc(false); setNovaData(pedido.dataVencimento || '') }} style={{ flex: 1, background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: 7, padding: '7px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#92400E' }}>
                    {fmtDate(pedido.dataVencimento)}
                  </div>
                  {statusAtual !== 'pago' && statusAtual !== 'cancelado' && (
                    <button onClick={() => setEditVenc(true)} style={{ marginTop: 8, fontSize: 11, color: '#92400E', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 700, textDecoration: 'underline' }}>
                      ✏️ Editar vencimento
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Pagamento */}
            <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Pagamento</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#166534' }}>
                {fmtDate(pedido.dataPagamento)}
              </div>
              {statusAtual === 'pago' && pedido.dataPagamento && (
                <div style={{ fontSize: 11, color: '#22C55E', marginTop: 4 }}>✓ Recebido</div>
              )}
            </div>
          </div>

          {/* Comissão — botão marcar paga */}
          {pedido.comissaoPercentual > 0 && !pedido.comissaoPaga && statusAtual !== 'cancelado' && (
            <button
              onClick={handleMarcarComissao}
              disabled={salvando}
              style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', borderRadius: 10, padding: '11px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
            >
              💸 Marcar comissão como paga ({fmtBRL(pedido.valorComissao)})
            </button>
          )}

          {/* Histórico financeiro */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
              Histórico Financeiro
            </div>
            {loadHist ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
                <div style={{ width: 24, height: 24, border: '3px solid #E5E7EB', borderTopColor: '#1B6E3C', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              </div>
            ) : historico.length === 0 ? (
              <div style={{ color: '#9CA3AF', fontSize: 13, fontStyle: 'italic', textAlign: 'center', padding: '16px 0' }}>
                Nenhum registro ainda.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {historico.map((h, i) => (
                  <div key={h.id} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < historico.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1B6E3C', flexShrink: 0, marginTop: 4 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: '#1F2937', fontWeight: 500 }}>{h.acao}</div>
                      <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
                        {h.user_nome && <><strong>{h.user_nome}</strong> · </>}
                        {new Date(h.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer com ações */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #F3F4F6', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {statusAtual !== 'pago' && statusAtual !== 'cancelado' && (
            <button
              onClick={handleMarcarPago}
              disabled={salvando}
              style={{ flex: 1, minWidth: 120, background: '#1B6E3C', color: 'white', border: 'none', borderRadius: 10, padding: '11px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              ✅ Marcar como Pago
            </button>
          )}
          {statusAtual !== 'cancelado' && (
            <button
              onClick={handleCancelar}
              disabled={salvando}
              style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: 10, padding: '11px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
            >
              🚫 Cancelar
            </button>
          )}
          {statusAtual === 'cancelado' && (
            <button
              onClick={async () => {
                setSalvando(true)
                await updateStatusFinanceiro(pedido.id, 'pendente')
                onAtualizado(); onClose()
              }}
              disabled={salvando}
              style={{ background: '#F3F4F6', color: '#374151', border: '1px solid #D1D5DB', borderRadius: 10, padding: '11px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
            >
              ↩️ Reativar
            </button>
          )}
          <button onClick={onClose} style={{ background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: 10, padding: '11px 16px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Aba Comissões ─────────────────────────────────────────────
function TabComissoes({ pedidos, onAtualizado }) {
  const [marcando, setMarcando] = useState(new Set())

  // Agrupa por vendedor
  const porVendedor = useMemo(() => {
    const mapa = {}
    pedidos
      .filter(p => p.comissaoPercentual > 0 && resolveStatus(p) !== 'cancelado')
      .forEach(p => {
        const nome = p.emitidoPor || 'Sem vendedor'
        if (!mapa[nome]) mapa[nome] = { nome, pedidos: [] }
        mapa[nome].pedidos.push(p)
      })
    return Object.values(mapa).sort((a, b) => a.nome.localeCompare(b.nome))
  }, [pedidos])

  async function handleMarcarTodas(nomeVendedor) {
    if (!window.confirm(`Marcar TODAS as comissões pendentes de ${nomeVendedor} como pagas?`)) return
    setMarcando(prev => new Set([...prev, nomeVendedor]))
    try {
      await marcarTodasComissoesPagas(nomeVendedor)
      onAtualizado()
    } finally {
      setMarcando(prev => { const s = new Set(prev); s.delete(nomeVendedor); return s })
    }
  }

  async function handleMarcarUma(pedidoId, nomeVendedor) {
    setMarcando(prev => new Set([...prev, pedidoId]))
    try {
      await marcarComissaoPaga(pedidoId)
      onAtualizado()
    } finally {
      setMarcando(prev => { const s = new Set(prev); s.delete(pedidoId); return s })
    }
  }

  if (porVendedor.length === 0) {
    return (
      <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E5E7EB', padding: '48px', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>💰</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#374151' }}>Nenhuma comissão no período</div>
        <div style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>Os pedidos deste período não geraram comissões.</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {porVendedor.map(({ nome, pedidos: peds }) => {
        const totalVendido   = peds.reduce((s, p) => s + p.valorFinal, 0)
        const comissaoTotal  = peds.reduce((s, p) => s + p.valorComissao, 0)
        const comissaoPaga   = peds.filter(p => p.comissaoPaga).reduce((s, p) => s + p.valorComissao, 0)
        const comissaoPend   = comissaoTotal - comissaoPaga
        const pendentes      = peds.filter(p => !p.comissaoPaga)
        const isMarcando     = marcando.has(nome)

        return (
          <div key={nome} style={{ background: 'white', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            {/* Cabeçalho do vendedor */}
            <div style={{ background: '#F9FAFB', padding: '16px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#1D4ED8' }}>
                  {nome[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#1F2937' }}>{nome}</div>
                  <div style={{ fontSize: 12, color: '#6B7280', marginTop: 1 }}>{peds.length} pedido(s) no período</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                {[
                  ['Total Vendido',     fmtBRL(totalVendido),  '#1F2937'],
                  ['Comissão Gerada',   fmtBRL(comissaoTotal), '#1D4ED8'],
                  ['Comissão Paga',     fmtBRL(comissaoPaga),  '#16A34A'],
                  ['Comissão Pendente', fmtBRL(comissaoPend),  '#DC2626'],
                ].map(([label, val, color]) => (
                  <div key={label} style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color }}>{val}</div>
                  </div>
                ))}
              </div>

              {pendentes.length > 0 && (
                <button
                  onClick={() => handleMarcarTodas(nome)}
                  disabled={isMarcando}
                  style={{ background: '#1D4ED8', color: 'white', border: 'none', borderRadius: 8, padding: '8px 14px', fontWeight: 700, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  {isMarcando ? '...' : `✓ Marcar todas como pagas (${pendentes.length})`}
                </button>
              )}
            </div>

            {/* Tabela de pedidos do vendedor */}
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
              <thead>
                <tr style={{ background: '#FAFAFA' }}>
                  {['Pedido', 'Cliente', 'Valor', '%', 'Comissão', 'Status Fin.', 'Comissão'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid #F3F4F6' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {peds.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #F9FAFB' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 700, color: '#1B6E3C' }}>#{String(p.numero).padStart(4, '0')}</td>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: '#1F2937' }}>{p.cliente?.nome || '—'}</td>
                    <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 600, color: '#374151' }}>{fmtBRL(p.valorFinal)}</td>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: '#92400E' }}>{fmtPct(p.comissaoPercentual)}</td>
                    <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 700, color: '#1D4ED8' }}>{fmtBRL(p.valorComissao)}</td>
                    <td style={{ padding: '10px 14px' }}><StatusBadge status={resolveStatus(p)} /></td>
                    <td style={{ padding: '10px 14px' }}>
                      {p.comissaoPaga ? (
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#16A34A', background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 100, padding: '3px 10px' }}>✓ Paga</span>
                      ) : (
                        <button
                          onClick={() => handleMarcarUma(p.id, nome)}
                          disabled={marcando.has(p.id)}
                          style={{ fontSize: 11, fontWeight: 700, color: '#1D4ED8', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 100, padding: '3px 10px', cursor: 'pointer' }}
                        >
                          {marcando.has(p.id) ? '...' : 'Marcar paga'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      })}
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────
export default function Financeiro() {
  const [pedidos, setPedidos]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [modalPedido, setModalPedido] = useState(null)

  // Filtros de período
  const [periodo, setPeriodo]         = useState('mes_atual')
  const [customInicio, setCustomInicio] = useState('')
  const [customFim, setCustomFim]     = useState('')

  // Filtros adicionais
  const [filtroVendedor, setFiltroVendedor] = useState('todos')
  const [filtroCliente, setFiltroCliente]   = useState('')
  const [filtroStatus, setFiltroStatus]     = useState('todos')

  // Tab
  const [tab, setTab] = useState('pedidos')

  // Vendedores únicos para o select
  const vendedores = useMemo(() => {
    const nomes = [...new Set(pedidos.map(p => p.emitidoPor).filter(Boolean))]
    return nomes.sort()
  }, [pedidos])

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const range = periodo === 'personalizado'
        ? { inicio: customInicio || null, fim: customFim || null }
        : periodoRange(periodo)

      const data = await getFinanceiro({
        inicio: range.inicio,
        fim:    range.fim,
        vendedor:       filtroVendedor !== 'todos' ? filtroVendedor : null,
        clienteNome:    filtroCliente  || null,
        statusFinanceiro: filtroStatus !== 'todos' ? filtroStatus : null,
      })
      setPedidos(data)
    } finally {
      setLoading(false)
    }
  }, [periodo, customInicio, customFim, filtroVendedor, filtroCliente, filtroStatus])

  useEffect(() => { carregar() }, [carregar])

  // ── Pedidos com status resolvido ─────────────────────────────
  const pedidosComStatus = useMemo(() =>
    pedidos.map(p => ({ ...p, _statusResolvido: resolveStatus(p) })),
  [pedidos])

  // Filtragem extra para "atrasado" (computado client-side, não vem do DB)
  const pedidosFiltrados = useMemo(() => {
    if (filtroStatus === 'atrasado')
      return pedidosComStatus.filter(p => p._statusResolvido === 'atrasado')
    return pedidosComStatus
  }, [pedidosComStatus, filtroStatus])

  // ── Cálculos dos cards ────────────────────────────────────────
  const cards = useMemo(() => {
    const todos       = pedidosComStatus
    const faturamento = todos.filter(p => p._statusResolvido !== 'cancelado').reduce((s, p) => s + p.valorFinal, 0)
    const recebido    = todos.filter(p => p._statusResolvido === 'pago').reduce((s, p) => s + p.valorFinal, 0)
    const pendente    = todos.filter(p => p._statusResolvido === 'pendente').reduce((s, p) => s + p.valorFinal, 0)
    const atrasado    = todos.filter(p => p._statusResolvido === 'atrasado').reduce((s, p) => s + p.valorFinal, 0)
    const comissoes   = todos
      .filter(p => !p.comissaoPaga && p._statusResolvido !== 'cancelado')
      .reduce((s, p) => s + p.valorComissao, 0)
    return { faturamento, recebido, pendente, atrasado, comissoes }
  }, [pedidosComStatus])

  const PERIODOS = [
    { key: 'hoje',          label: 'Hoje' },
    { key: 'mes_atual',     label: 'Mês Atual' },
    { key: 'mes_anterior',  label: 'Mês Anterior' },
    { key: 'personalizado', label: 'Personalizado' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      {modalPedido && (
        <ModalFinanceiro
          pedido={modalPedido}
          onClose={() => setModalPedido(null)}
          onAtualizado={() => { carregar(); setModalPedido(null) }}
        />
      )}

      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#1F2937' }}>Financeiro</h1>
          <p style={{ color: '#6B7280', fontSize: 13, marginTop: 2 }}>
            {loading ? 'Carregando...' : `${pedidosFiltrados.length} pedido(s) no período`}
          </p>
        </div>

        {/* Filtros de período */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 12, color: '#92400E', fontWeight: 600 }}>De</label>
            <input type="date" value={customInicio} onChange={e => setCustomInicio(e.target.value)}
              style={{ border: '1.5px solid #FDE68A', borderRadius: 8, padding: '7px 10px', fontSize: 13, outline: 'none', background: 'white' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 12, color: '#92400E', fontWeight: 600 }}>Até</label>
            <input type="date" value={customFim} onChange={e => setCustomFim(e.target.value)}
              style={{ border: '1.5px solid #FDE68A', borderRadius: 8, padding: '7px 10px', fontSize: 13, outline: 'none', background: 'white' }} />
          </div>
        </div>
      )}

      {/* Cards de resumo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        <CardResumo icon="💰" label="Faturamento Total"  valor={fmtBRL(cards.faturamento)} sub="Pedidos não cancelados"  color="#1F2937"  bg="#F9FAFB"  border="#E5E7EB" />
        <CardResumo icon="✅" label="Total Recebido"     valor={fmtBRL(cards.recebido)}    sub="Pedidos marcados como pagos" color="#166534" bg="#F0FDF4"  border="#86EFAC" />
        <CardResumo icon="⏳" label="Total Pendente"     valor={fmtBRL(cards.pendente)}    sub="Dentro do prazo"          color="#92400E"  bg="#FFFBEB"  border="#FDE68A" />
        <CardResumo icon="⚠️" label="Total em Atraso"   valor={fmtBRL(cards.atrasado)}    sub="Vencimento expirado"      color="#DC2626"  bg="#FEF2F2"  border="#FECACA" />
        <CardResumo icon="🤝" label="Comissões a Pagar" valor={fmtBRL(cards.comissoes)}   sub="Comissões não quitadas"   color="#1D4ED8"  bg="#EFF6FF"  border="#BFDBFE" />
        <div style={{ background: 'white', borderRadius: 14, border: '1px dashed #D1D5DB', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📈</div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 }}>Lucro Estimado</span>
          </div>
          <div style={{ fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' }}>Em breve — cadastre seus custos operacionais para ver o lucro estimado.</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#F3F4F6', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {[{ key: 'pedidos', label: '📑 Pedidos' }, { key: 'comissoes', label: '🤝 Comissões' }].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: tab === key ? 'white' : 'transparent',
              color: tab === key ? '#1F2937' : '#6B7280',
              fontWeight: tab === key ? 700 : 500,
              fontSize: 13,
              boxShadow: tab === key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Filtros adicionais */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Vendedor */}
        <select
          value={filtroVendedor}
          onChange={e => setFiltroVendedor(e.target.value)}
          style={{ border: '1.5px solid #D1D5DB', borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none', background: 'white', color: filtroVendedor !== 'todos' ? '#1F2937' : '#9CA3AF' }}
        >
          <option value="todos">Todos os vendedores</option>
          {vendedores.map(v => <option key={v} value={v}>{v}</option>)}
        </select>

        {/* Cliente */}
        <input
          value={filtroCliente}
          onChange={e => setFiltroCliente(e.target.value)}
          placeholder="Buscar cliente..."
          style={{ border: '1.5px solid #D1D5DB', borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none', minWidth: 180 }}
        />

        {/* Status */}
        <select
          value={filtroStatus}
          onChange={e => setFiltroStatus(e.target.value)}
          style={{ border: '1.5px solid #D1D5DB', borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none', background: 'white', color: filtroStatus !== 'todos' ? '#1F2937' : '#9CA3AF' }}
        >
          <option value="todos">Todos os status</option>
          <option value="pendente">Pendente</option>
          <option value="pago">Pago</option>
          <option value="atrasado">Atrasado</option>
          <option value="cancelado">Cancelado</option>
        </select>

        {/* Limpar filtros */}
        {(filtroVendedor !== 'todos' || filtroCliente || filtroStatus !== 'todos') && (
          <button
            onClick={() => { setFiltroVendedor('todos'); setFiltroCliente(''); setFiltroStatus('todos') }}
            style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: 8, padding: '8px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            ✕ Limpar filtros
          </button>
        )}
      </div>

      {/* Conteúdo das abas */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, gap: 16 }}>
          <div style={{ width: 36, height: 36, border: '4px solid #E5E7EB', borderTopColor: '#1B6E3C', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ color: '#6B7280', fontSize: 14 }}>Carregando dados financeiros...</span>
        </div>
      ) : tab === 'comissoes' ? (
        <TabComissoes pedidos={pedidosFiltrados} onAtualizado={carregar} />
      ) : (
        /* ── Tabela de pedidos ── */
        pedidosFiltrados.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E5E7EB', padding: '48px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📑</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#374151' }}>Nenhum pedido encontrado</div>
            <div style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>Tente ajustar os filtros ou o período selecionado.</div>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'auto', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '2px solid #E5E7EB' }}>
                  {['Nº', 'Cliente', 'Vendedor', 'Valor Total', 'Comissão', 'Status Fin.', 'Vencimento', 'Pagamento', 'Ações'].map(h => (
                    <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pedidosFiltrados.map(p => {
                  const st = p._statusResolvido
                  return (
                    <tr
                      key={p.id}
                      style={{ borderBottom: '1px solid #F3F4F6', cursor: 'pointer', transition: 'background 0.15s' }}
                      onClick={() => setModalPedido(p)}
                      onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                      <td style={{ padding: '12px 14px', fontWeight: 800, color: '#1B6E3C', fontSize: 13 }}>
                        #{String(p.numero).padStart(4, '0')}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1F2937' }}>{p.cliente?.nome || '—'}</div>
                        {p.cliente?.cidade && <div style={{ fontSize: 11, color: '#9CA3AF' }}>{p.cliente.cidade}</div>}
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 13, color: '#374151' }}>{p.emitidoPor || '—'}</td>
                      <td style={{ padding: '12px 14px', fontSize: 14, fontWeight: 700, color: '#1F2937', whiteSpace: 'nowrap' }}>
                        {fmtBRL(p.valorFinal)}
                      </td>
                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                        {p.valorComissao > 0 ? (
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#1D4ED8' }}>{fmtBRL(p.valorComissao)}</div>
                            <div style={{ fontSize: 11, color: '#9CA3AF' }}>{fmtPct(p.comissaoPercentual)}</div>
                          </div>
                        ) : (
                          <span style={{ color: '#D1D5DB' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <StatusBadge status={st} />
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 13, whiteSpace: 'nowrap', color: st === 'atrasado' ? '#DC2626' : '#374151', fontWeight: st === 'atrasado' ? 700 : 400 }}>
                        {fmtDate(p.dataVencimento)}
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 13, color: '#374151', whiteSpace: 'nowrap' }}>
                        {fmtDate(p.dataPagamento)}
                      </td>
                      <td style={{ padding: '12px 14px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            onClick={() => setModalPedido(p)}
                            style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #E5E7EB', background: '#F9FAFB', color: '#374151', cursor: 'pointer', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}
                          >
                            🔍 Detalhes
                          </button>
                          {st !== 'pago' && st !== 'cancelado' && (
                            <button
                              onClick={async () => {
                                await updateStatusFinanceiro(p.id, 'pago')
                                carregar()
                              }}
                              style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #86EFAC', background: '#F0FDF4', color: '#166534', cursor: 'pointer', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}
                            >
                              ✅ Pago
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  )
}
