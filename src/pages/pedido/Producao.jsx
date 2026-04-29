import { useState, useEffect, useRef, useCallback } from 'react'
import { getPedidosProducao, updateStatusProducao } from '../../utils/storage'
import { useAuth } from '../../contexts/AuthContext'

// ── Configuração das colunas ─────────────────────────────────
const COLUNAS = [
  {
    key:    'PENDENTE',
    label:  'Pendente',
    emoji:  '🟡',
    cor:    '#D97706',
    bg:     '#FFFBEB',
    borda:  '#FDE68A',
    header: '#FEF3C7',
    tag:    { bg: '#FFFBEB', color: '#92400E', border: '#FDE68A' },
  },
  {
    key:    'EM_PRODUCAO',
    label:  'Em Produção',
    emoji:  '🔵',
    cor:    '#2563EB',
    bg:     '#EFF6FF',
    borda:  '#BFDBFE',
    header: '#DBEAFE',
    tag:    { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
  },
  {
    key:    'FINALIZADO',
    label:  'Finalizado',
    emoji:  '🟢',
    cor:    '#16A34A',
    bg:     '#F0FDF4',
    borda:  '#86EFAC',
    header: '#DCFCE7',
    tag:    { bg: '#F0FDF4', color: '#166534', border: '#86EFAC' },
  },
  {
    key:    'ENTREGUE',
    label:  'Entregue',
    emoji:  '⚫',
    cor:    '#374151',
    bg:     '#F9FAFB',
    borda:  '#D1D5DB',
    header: '#F3F4F6',
    tag:    { bg: '#F3F4F6', color: '#374151', border: '#D1D5DB' },
  },
]

// ── Utilitários ──────────────────────────────────────────────
function tempoDecorrido(startAt, endAt = null) {
  if (!startAt) return null
  const diff = (endAt ? new Date(endAt) : new Date()) - new Date(startAt)
  const min  = Math.floor(diff / 60000)
  const hrs  = Math.floor(min / 60)
  const days = Math.floor(hrs / 24)
  if (days > 0)  return `${days}d ${hrs % 24}h`
  if (hrs > 0)   return `${hrs}h ${min % 60}min`
  return `${min}min`
}

function fmtDataCurta(str) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function fmtBRL(v) {
  return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// ── Card do pedido ───────────────────────────────────────────
function KanbanCard({ pedido, coluna, isAdmin, dragging, onDragStart, onDragEnd, tick }) {
  const cardRef   = useRef(null)
  const isDragged = dragging === pedido.id

  const itensTruncados = pedido.itens?.slice(0, 3) || []
  const maisItens      = (pedido.itens?.length || 0) - 3

  // Coleta observações únicas dos itens
  const obs = pedido.itens
    ?.map(i => i.observacoes)
    .filter(Boolean)
    .slice(0, 2)
    .join(' · ')

  // Tempo de produção
  let tempoInfo = null
  if (coluna.key === 'EM_PRODUCAO' && pedido.producaoIniciadaAt) {
    tempoInfo = { label: 'Em produção há', valor: tempoDecorrido(pedido.producaoIniciadaAt), cor: '#2563EB' }
  } else if (coluna.key === 'FINALIZADO' && pedido.producaoIniciadaAt) {
    tempoInfo = { label: 'Produzido em', valor: tempoDecorrido(pedido.producaoIniciadaAt, pedido.producaoFinalizadaAt), cor: '#16A34A' }
  } else if (coluna.key === 'ENTREGUE' && pedido.producaoIniciadaAt) {
    tempoInfo = { label: 'Tempo total', valor: tempoDecorrido(pedido.producaoIniciadaAt, pedido.producaoFinalizadaAt), cor: '#374151' }
  }

  return (
    <div
      ref={cardRef}
      draggable={isAdmin}
      onDragStart={isAdmin ? (e) => {
        e.dataTransfer.setData('pedidoId', pedido.id)
        e.dataTransfer.effectAllowed = 'move'
        onDragStart(pedido.id)
      } : undefined}
      onDragEnd={isAdmin ? onDragEnd : undefined}
      style={{
        background:   'white',
        borderRadius: 12,
        borderLeft:   `4px solid ${coluna.cor}`,
        boxShadow:    isDragged
          ? '0 16px 40px rgba(0,0,0,0.22)'
          : '0 2px 8px rgba(0,0,0,0.07)',
        opacity:      isDragged ? 0.45 : 1,
        cursor:       isAdmin ? 'grab' : 'default',
        transform:    isDragged ? 'scale(1.02)' : 'scale(1)',
        transition:   'box-shadow 0.2s, transform 0.15s, opacity 0.15s',
        userSelect:   'none',
        position:     'relative',
      }}
    >
      {/* Header do card */}
      <div style={{
        padding: '10px 14px 8px',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8,
        borderBottom: '1px solid #F3F4F6',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 13, fontWeight: 900, color: coluna.cor,
            letterSpacing: -0.3,
          }}>
            #{String(pedido.numero).padStart(4, '0')}
          </span>
          {isAdmin && (
            <span style={{ fontSize: 14, color: '#D1D5DB', lineHeight: 1 }} title="Arraste para mover">⠿</span>
          )}
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', whiteSpace: 'nowrap' }}>
          📅 {fmtDataCurta(pedido.dataCriacao)}
        </span>
      </div>

      {/* Corpo */}
      <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>

        {/* Cliente */}
        <div style={{ fontWeight: 800, fontSize: 14, color: '#1F2937', lineHeight: 1.3 }}>
          {pedido.cliente?.nome || '—'}
        </div>

        {/* Itens */}
        {itensTruncados.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {itensTruncados.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                <span style={{
                  fontSize: 11, fontWeight: 800, color: 'white',
                  background: coluna.cor, borderRadius: 4,
                  padding: '1px 5px', flexShrink: 0,
                }}>
                  {item.quantidade}×
                </span>
                <span style={{ fontSize: 12, color: '#374151', lineHeight: 1.3 }}>
                  {item.nome}
                </span>
              </div>
            ))}
            {maisItens > 0 && (
              <span style={{ fontSize: 11, color: '#9CA3AF', fontStyle: 'italic' }}>
                + {maisItens} item(s)...
              </span>
            )}
          </div>
        )}

        {/* Observações / personagens */}
        {obs && (
          <div style={{
            background: '#FFFBEB', border: '1px solid #FDE68A',
            borderRadius: 7, padding: '5px 9px',
            fontSize: 12, color: '#92400E', lineHeight: 1.4,
          }}>
            ✏️ {obs}
          </div>
        )}

        {/* Observações gerais do pedido */}
        {pedido.observacoes && pedido.observacoes !== 'Orçamento válido pelo período de 30 dias' && (
          <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.4, fontStyle: 'italic' }}>
            {pedido.observacoes.length > 80
              ? pedido.observacoes.slice(0, 80) + '...'
              : pedido.observacoes}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '8px 14px 10px',
        borderTop: '1px solid #F3F4F6',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{
            width: 22, height: 22, borderRadius: '50%',
            background: coluna.bg, border: `1px solid ${coluna.borda}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 800, color: coluna.cor,
          }}>
            {(pedido.emitidoPor || '?')[0].toUpperCase()}
          </div>
          <span style={{ fontSize: 11, color: '#6B7280', fontWeight: 600 }}>
            {pedido.emitidoPor || '—'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Valor total */}
          <span style={{ fontSize: 12, fontWeight: 700, color: '#1B6E3C' }}>
            {fmtBRL(pedido.valorFinal)}
          </span>
        </div>
      </div>

      {/* Tempo de produção */}
      {tempoInfo && (
        <div style={{
          margin: '0 10px 10px',
          background: coluna.bg, border: `1px solid ${coluna.borda}`,
          borderRadius: 7, padding: '5px 10px',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ fontSize: 13 }}>⏱</span>
          <span style={{ fontSize: 11, color: tempoInfo.cor, fontWeight: 700 }}>
            {tempoInfo.label}: {tempoInfo.valor || '< 1min'}
          </span>
        </div>
      )}
    </div>
  )
}

// ── Coluna do kanban ─────────────────────────────────────────
function KanbanColuna({ coluna, pedidos, isAdmin, dragging, dragOver, onDragStart, onDragEnd, onDragOver, onDragLeave, onDrop, tick }) {
  const isOver = dragOver === coluna.key

  return (
    <div style={{
      display:       'flex',
      flexDirection: 'column',
      minWidth:      300,
      maxWidth:      340,
      flex:          1,
    }}>
      {/* Header da coluna */}
      <div style={{
        background:   coluna.header,
        border:       `1.5px solid ${coluna.borda}`,
        borderRadius: '12px 12px 0 0',
        padding:      '12px 16px',
        display:      'flex',
        alignItems:   'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>{coluna.emoji}</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: coluna.cor }}>
            {coluna.label}
          </span>
        </div>
        <span style={{
          fontSize: 12, fontWeight: 800,
          background: coluna.cor, color: 'white',
          borderRadius: 100, padding: '2px 9px',
          minWidth: 24, textAlign: 'center',
        }}>
          {pedidos.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); onDragOver(coluna.key) }}
        onDragLeave={onDragLeave}
        onDrop={e => {
          e.preventDefault()
          const pedidoId = e.dataTransfer.getData('pedidoId')
          onDrop(pedidoId, coluna.key)
        }}
        style={{
          flex:         1,
          minHeight:    120,
          padding:      '10px 8px',
          background:   isOver ? coluna.bg : '#F8FAFC',
          border:       `1.5px solid ${isOver ? coluna.cor : coluna.borda}`,
          borderTop:    'none',
          borderRadius: '0 0 12px 12px',
          transition:   'background 0.15s, border-color 0.15s',
          display:      'flex',
          flexDirection: 'column',
          gap:          8,
          boxShadow:    isOver ? `inset 0 0 0 2px ${coluna.cor}30` : 'none',
        }}
      >
        {pedidos.length === 0 ? (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: 8, padding: '32px 16px',
            color: '#D1D5DB', textAlign: 'center',
          }}>
            {isOver ? (
              <>
                <span style={{ fontSize: 32 }}>{coluna.emoji}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: coluna.cor }}>Solte aqui</span>
              </>
            ) : (
              <>
                <span style={{ fontSize: 28 }}>📭</span>
                <span style={{ fontSize: 12 }}>Nenhum pedido</span>
              </>
            )}
          </div>
        ) : (
          pedidos.map(p => (
            <KanbanCard
              key={p.id}
              pedido={p}
              coluna={coluna}
              isAdmin={isAdmin}
              dragging={dragging}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              tick={tick}
            />
          ))
        )}

        {/* Indicador de drop quando coluna não está vazia */}
        {isOver && pedidos.length > 0 && (
          <div style={{
            border: `2px dashed ${coluna.cor}`,
            borderRadius: 10, padding: '12px',
            textAlign: 'center', fontSize: 12,
            fontWeight: 700, color: coluna.cor,
            background: coluna.bg,
          }}>
            {coluna.emoji} Solte aqui para mover
          </div>
        )}
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────
export default function Producao() {
  const { isAdmin }       = useAuth()
  const [pedidos, setPedidos]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [dragging, setDragging]   = useState(null)     // id do card sendo arrastado
  const [dragOver, setDragOver]   = useState(null)     // key da coluna sendo hovada
  const [movendo, setMovendo]     = useState(new Set()) // ids sendo salvos
  const [busca, setBusca]         = useState('')
  const [tick, setTick]           = useState(0)        // ticker para atualizar timers

  // Atualiza timers a cada minuto
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 60000)
    return () => clearInterval(t)
  }, [])

  const carregar = useCallback(async () => {
    setLoading(true)
    try { setPedidos(await getPedidosProducao()) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  // Filtra por busca
  const pedidosFiltrados = pedidos.filter(p => {
    if (!busca.trim()) return true
    const q = busca.toLowerCase()
    return (
      String(p.numero).includes(q) ||
      p.cliente?.nome?.toLowerCase().includes(q) ||
      p.emitidoPor?.toLowerCase().includes(q) ||
      p.itens?.some(i => i.nome?.toLowerCase().includes(q))
    )
  })

  // Agrupa por status de produção
  const porColuna = {}
  COLUNAS.forEach(c => {
    porColuna[c.key] = pedidosFiltrados.filter(p => (p.statusProducao || 'PENDENTE') === c.key)
  })

  // ── Drag & Drop ──────────────────────────────────────────────
  const handleDragStart = useCallback((id) => setDragging(id), [])
  const handleDragEnd   = useCallback(() => { setDragging(null); setDragOver(null) }, [])
  const handleDragOver  = useCallback((colKey) => setDragOver(colKey), [])
  const handleDragLeave = useCallback(() => setDragOver(null), [])

  const handleDrop = useCallback(async (pedidoId, novaColuna) => {
    setDragging(null)
    setDragOver(null)
    if (!pedidoId) return

    const pedido = pedidos.find(p => p.id === pedidoId)
    if (!pedido) return
    if (pedido.statusProducao === novaColuna) return // mesma coluna

    // Confirmação ao entregar
    if (novaColuna === 'ENTREGUE') {
      if (!window.confirm(`Marcar pedido #${String(pedido.numero).padStart(4, '0')} como ENTREGUE?\n\nIsso também atualizará o status operacional do pedido.`)) return
    }

    // Optimistic update
    setPedidos(prev => prev.map(p =>
      p.id === pedidoId
        ? {
            ...p,
            statusProducao:       novaColuna,
            producaoIniciadaAt:   novaColuna === 'PENDENTE'    ? null
              : novaColuna === 'EM_PRODUCAO' && !p.producaoIniciadaAt ? new Date().toISOString()
              : p.producaoIniciadaAt,
            producaoFinalizadaAt: novaColuna === 'PENDENTE' || novaColuna === 'EM_PRODUCAO' ? null
              : novaColuna === 'FINALIZADO' ? new Date().toISOString()
              : p.producaoFinalizadaAt || new Date().toISOString(),
            status:               novaColuna === 'ENTREGUE' ? 'ENTREGUE' : p.status,
          }
        : p
    ))

    setMovendo(prev => new Set([...prev, pedidoId]))
    try {
      await updateStatusProducao(pedidoId, novaColuna, pedido)
    } catch {
      // Reverte em caso de erro
      setPedidos(prev => prev.map(p => p.id === pedidoId ? pedido : p))
      alert('Erro ao mover pedido. Tente novamente.')
    } finally {
      setMovendo(prev => { const s = new Set(prev); s.delete(pedidoId); return s })
    }
  }, [pedidos])

  // ── Totais ───────────────────────────────────────────────────
  const totalPedidos = pedidosFiltrados.length
  const totalValor   = pedidosFiltrados
    .filter(p => p.statusProducao !== 'ENTREGUE')
    .reduce((s, p) => s + p.valorFinal, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16 }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        .kanban-card-drag-source { opacity: 0.4 !important; }
      `}</style>

      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#1F2937' }}>Produção</h1>
          <p style={{ color: '#6B7280', fontSize: 13, marginTop: 2 }}>
            {loading ? 'Carregando...' : `${totalPedidos} pedido(s) em aberto`}
            {!isAdmin && (
              <span style={{ marginLeft: 8, fontSize: 11, background: '#FFFBEB', color: '#92400E', border: '1px solid #FDE68A', borderRadius: 100, padding: '2px 8px', fontWeight: 600 }}>
                👀 Somente visualização
              </span>
            )}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {/* Busca */}
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar pedido, cliente..."
            style={{
              border: '1.5px solid #D1D5DB', borderRadius: 8,
              padding: '8px 14px', fontSize: 13, outline: 'none', width: 220,
            }}
          />
          {/* Atualizar */}
          <button
            onClick={carregar}
            style={{ background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center' }}
            title="Atualizar"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Mini stats */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', flexShrink: 0 }}>
        {COLUNAS.map(col => {
          const count = porColuna[col.key]?.length || 0
          return (
            <div key={col.key} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'white', border: `1px solid ${col.borda}`,
              borderRadius: 10, padding: '8px 14px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}>
              <span style={{ fontSize: 16 }}>{col.emoji}</span>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: col.cor, lineHeight: 1 }}>{count}</div>
                <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>{col.label}</div>
              </div>
            </div>
          )
        })}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', border: '1px solid #E5E7EB', borderRadius: 10, padding: '8px 14px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <span style={{ fontSize: 16 }}>💰</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 900, color: '#1B6E3C', lineHeight: 1 }}>
              {Number(totalValor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>Em aberto</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
          <div style={{ width: 40, height: 40, border: '4px solid #E5E7EB', borderTopColor: '#1B6E3C', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ color: '#6B7280', fontSize: 14 }}>Carregando produção...</span>
        </div>
      ) : (
        <>
          {/* Instrução para admin */}
          {isAdmin && (
            <div style={{ flexShrink: 0, background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 10, padding: '10px 16px', fontSize: 12, color: '#1D4ED8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              ⠿ Arraste os cards entre as colunas para atualizar o status de produção
            </div>
          )}

          {/* Kanban Board */}
          <div style={{
            display: 'flex', gap: 14,
            overflowX: 'auto', overflowY: 'visible',
            paddingBottom: 16, flex: 1,
            alignItems: 'flex-start',
          }}>
            {COLUNAS.map(coluna => (
              <KanbanColuna
                key={coluna.key}
                coluna={coluna}
                pedidos={porColuna[coluna.key] || []}
                isAdmin={isAdmin}
                dragging={dragging}
                dragOver={dragOver}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                tick={tick}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
