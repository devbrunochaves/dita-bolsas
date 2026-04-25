import { useEffect, useState, useCallback } from 'react'
import { getPedidos } from '../../utils/storage'
import { StatusSelect, StatusBadge, STATUS_CONFIG, STATUS_LIST } from '../../components/StatusSelect'
import { gerarPedidoPDF } from '../../utils/pdf'

// ── Modal de detalhes do pedido ──────────────────────────────
function PedidoModal({ pedido, onClose, onStatusChange }) {
  if (!pedido) return null

  const fmtBRL = v => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const totalQtd   = pedido.itens?.reduce((s, i) => s + (Number(i.quantidade) || 0), 0) || 0
  const totalValor = pedido.itens?.reduce((s, i) => s + (Number(i.vrTotal)    || 0), 0) || 0

  const cliente = pedido.cliente || {}

  function handleDownload() {
    gerarPedidoPDF({ ...pedido, data: pedido.dataCriacao })
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      onClick={handleOverlayClick}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px',
      }}
    >
      <div style={{
        background: 'white', borderRadius: 18, width: '100%', maxWidth: 760,
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
        display: 'flex', flexDirection: 'column',
      }}>

        {/* ── Cabeçalho do modal ── */}
        <div style={{
          padding: '20px 28px 16px', borderBottom: '1px solid #F3F4F6',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          position: 'sticky', top: 0, background: 'white', zIndex: 1,
          borderRadius: '18px 18px 0 0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: '#1B6E3C' }}>#{pedido.numero || '-'}</span>
            <StatusBadge status={pedido.status || 'PENDENTE'} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={handleDownload}
              style={{
                background: '#1B6E3C', color: 'white', border: 'none',
                padding: '9px 20px', borderRadius: 9, fontWeight: 700, fontSize: 13,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
                boxShadow: '0 2px 8px rgba(27,110,60,0.3)',
              }}
            >
              📥 Baixar PDF
            </button>
            <button
              onClick={onClose}
              style={{
                width: 36, height: 36, borderRadius: 9, border: '1px solid #E5E7EB',
                background: '#F9FAFB', color: '#6B7280', cursor: 'pointer',
                fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700,
              }}
            >
              ×
            </button>
          </div>
        </div>

        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* ── Dados do cliente ── */}
          <section>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: '#1B6E3C', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              👥 Dados do Cliente
            </h3>
            <div style={{
              background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: 12,
              padding: '16px 20px',
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: '12px 24px', fontSize: 13,
            }}>
              {[
                ['Nome',        cliente.nome      || '—'],
                ['CNPJ/CPF',    cliente.cnpjCpf   || '—'],
                ['Endereço',    cliente.endereco  || '—'],
                ['Bairro',      cliente.bairro    || '—'],
                ['Cidade / UF', `${cliente.cidade || '—'} / ${cliente.estado || '—'}`],
                ['Telefone',    cliente.telefone  || '—'],
                ['WhatsApp',    cliente.whatsapp  || '—'],
                ['Contato',     cliente.contato   || '—'],
                ['Email',       cliente.email     || '—'],
                ['Pagamento',   cliente.pgt       || '—'],
              ].map(([label, value]) => (
                <div key={label}>
                  <div style={{ color: '#9CA3AF', fontWeight: 600, fontSize: 11, marginBottom: 3 }}>{label}</div>
                  <div style={{ color: '#1F2937', fontWeight: 500 }}>{value}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Itens do pedido ── */}
          <section>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: '#1B6E3C', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              📦 Itens do Pedido
            </h3>
            <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#F8FAFC' }}>
                    {['Cód.', 'Produto', 'Qtd.', 'Vr. Unitário', 'Vr. Total'].map((h, i) => (
                      <th key={h} style={{
                        padding: '10px 14px', fontWeight: 700, fontSize: 11,
                        color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5,
                        textAlign: i >= 2 ? 'right' : 'left',
                        borderBottom: '1px solid #E5E7EB',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(pedido.itens || []).map((item, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '10px 14px', color: '#6B7280', fontWeight: 600 }}>{item.codigo || '—'}</td>
                      <td style={{ padding: '10px 14px', color: '#1F2937' }}>{item.nome || '—'}</td>
                      <td style={{ padding: '10px 14px', color: '#1F2937', fontWeight: 600, textAlign: 'right' }}>{item.quantidade || 0}</td>
                      <td style={{ padding: '10px 14px', color: '#1F2937', textAlign: 'right' }}>R$ {fmtBRL(item.vrUnitario)}</td>
                      <td style={{ padding: '10px 14px', color: '#1F2937', fontWeight: 700, textAlign: 'right' }}>R$ {fmtBRL(item.vrTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── Totais ── */}
          <section>
            <div style={{
              background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 12,
              padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#374151' }}>
                <span>Total de itens</span>
                <strong>{totalQtd} unid.</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#374151' }}>
                <span>Subtotal</span>
                <strong>R$ {fmtBRL(totalValor)}</strong>
              </div>
              {Number(pedido.desconto) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#DC2626' }}>
                  <span>Desconto</span>
                  <strong>− R$ {fmtBRL(pedido.desconto)}</strong>
                </div>
              )}
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                paddingTop: 10, borderTop: '1px solid #86EFAC',
                fontSize: 17, fontWeight: 900, color: '#1B6E3C',
              }}>
                <span>Valor Final</span>
                <span>R$ {fmtBRL(pedido.valorFinal)}</span>
              </div>
            </div>
          </section>

          {/* ── Observações ── */}
          {pedido.observacoes && (
            <section>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: '#1B6E3C', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                📝 Observações
              </h3>
              <div style={{
                background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: 12,
                padding: '14px 18px', fontSize: 13, color: '#374151', lineHeight: 1.6,
              }}>
                {pedido.observacoes}
              </div>
            </section>
          )}

          {/* ── Meta ── */}
          <section style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontSize: 12, color: '#9CA3AF', paddingTop: 4, borderTop: '1px solid #F3F4F6',
            flexWrap: 'wrap', gap: 10,
          }}>
            <span>
              Emitido por: <strong style={{ color: '#6B7280' }}>{pedido.emitidoPor || '— a configurar'}</strong>
            </span>
            <span>
              Data: <strong style={{ color: '#6B7280' }}>
                {pedido.dataCriacao ? new Date(pedido.dataCriacao).toLocaleDateString('pt-BR') : '—'}
              </strong>
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>Alterar status:</span>
              <StatusSelect
                pedidoId={pedido.id}
                current={pedido.status || 'PENDENTE'}
                onChange={onStatusChange}
              />
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}

// ── Página principal ─────────────────────────────────────────
export default function PedidosEmitidos() {
  const [pedidos, setPedidos]           = useState([])
  const [loading, setLoading]           = useState(true)
  const [filtroStatus, setFiltroStatus] = useState('TODOS')
  const [busca, setBusca]               = useState('')
  const [pedidoModal, setPedidoModal]   = useState(null)

  useEffect(() => {
    getPedidos().then(data => { setPedidos(data); setLoading(false) })
  }, [])

  // Fecha modal com ESC
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') setPedidoModal(null) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const handleStatusChange = useCallback((id, novoStatus) => {
    setPedidos(prev => prev.map(p => p.id === id ? { ...p, status: novoStatus } : p))
    // Atualiza também o modal caso esteja aberto nesse pedido
    setPedidoModal(prev => prev?.id === id ? { ...prev, status: novoStatus } : prev)
  }, [])

  // Contagens para os botões de filtro
  const contagem = STATUS_LIST.reduce((acc, s) => {
    acc[s] = pedidos.filter(p => (p.status || 'PENDENTE') === s).length
    return acc
  }, {})

  // Pedidos filtrados
  const filtrados = pedidos.filter(p => {
    const statusAtual = p.status || 'PENDENTE'
    const passaStatus = filtroStatus === 'TODOS' || statusAtual === filtroStatus
    const passaBusca  = !busca ||
      p.cliente?.nome?.toLowerCase().includes(busca.toLowerCase()) ||
      String(p.numero).includes(busca)
    return passaStatus && passaBusca
  })

  const fmtBRL = v => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })

  return (
    <div>
      {/* Modal */}
      {pedidoModal && (
        <PedidoModal
          pedido={pedidoModal}
          onClose={() => setPedidoModal(null)}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Cabeçalho */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#1F2937' }}>Pedidos Emitidos</h1>
        <p style={{ color: '#6B7280', fontSize: 13, marginTop: 2 }}>
          {pedidos.length} pedido(s) no total — clique em qualquer linha para ver os detalhes
        </p>
      </div>

      {/* Filtros de status */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <button
          onClick={() => setFiltroStatus('TODOS')}
          style={{
            padding: '7px 16px', borderRadius: 100, border: '1.5px solid',
            borderColor: filtroStatus === 'TODOS' ? '#1B6E3C' : '#E5E7EB',
            background: filtroStatus === 'TODOS' ? '#1B6E3C' : 'white',
            color: filtroStatus === 'TODOS' ? 'white' : '#6B7280',
            fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
          }}
        >
          Todos ({pedidos.length})
        </button>

        {STATUS_LIST.map(s => {
          const cfg   = STATUS_CONFIG[s]
          const ativo = filtroStatus === s
          return (
            <button
              key={s}
              onClick={() => setFiltroStatus(s)}
              style={{
                padding: '7px 16px', borderRadius: 100, fontSize: 13, fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.15s', border: '1.5px solid',
                borderColor: ativo ? cfg.dot : cfg.border,
                background: ativo ? cfg.dot : cfg.bg,
                color: ativo ? 'white' : cfg.color,
              }}
            >
              {cfg.label} ({contagem[s]})
            </button>
          )
        })}
      </div>

      {/* Busca */}
      <div style={{ marginBottom: 20 }}>
        <input
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar por nome do cliente ou número do pedido..."
          style={{
            border: '1.5px solid #D1D5DB', borderRadius: 8, padding: '9px 14px',
            fontSize: 14, outline: 'none', width: '100%', maxWidth: 420,
          }}
        />
      </div>

      {/* Tabela */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, flexDirection: 'column', gap: 16 }}>
          <div style={{ width: 32, height: 32, border: '3px solid #E5E7EB', borderTopColor: '#1B6E3C', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      ) : filtrados.length === 0 ? (
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E5E7EB', padding: '48px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
            {busca || filtroStatus !== 'TODOS' ? 'Nenhum pedido encontrado' : 'Nenhum pedido emitido ainda'}
          </h3>
          <p style={{ color: '#9CA3AF', fontSize: 14 }}>
            {busca
              ? `Sem resultados para "${busca}"`
              : filtroStatus !== 'TODOS'
              ? `Nenhum pedido com status "${filtroStatus}"`
              : 'Emita seu primeiro pedido pelo menu lateral.'}
          </p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'auto', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <table className="ped-table" style={{ minWidth: 820 }}>
            <thead>
              <tr>
                <th style={{ width: 54 }}>#</th>
                <th>Cliente</th>
                <th style={{ width: 70, textAlign: 'center' }}>Itens</th>
                <th style={{ width: 130, textAlign: 'right' }}>Valor Total</th>
                <th style={{ width: 170 }}>Status</th>
                <th style={{ width: 140 }}>Emitido por</th>
                <th style={{ width: 100 }}>Data</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(p => (
                <tr
                  key={p.id}
                  onClick={() => setPedidoModal(p)}
                  style={{ cursor: 'pointer', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F0FDF4'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                >
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
                    R$ {fmtBRL(p.valorFinal)}
                  </td>
                  {/* stopPropagation no status para não abrir o modal ao trocar */}
                  <td onClick={e => e.stopPropagation()}>
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

          {/* Rodapé com totalizador */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid #F3F4F6', display: 'flex', justifyContent: 'flex-end', gap: 32, fontSize: 13 }}>
            <span style={{ color: '#6B7280' }}>
              Exibindo <strong style={{ color: '#1F2937' }}>{filtrados.length}</strong> pedido(s)
            </span>
            <span style={{ color: '#6B7280' }}>
              Total: <strong style={{ color: '#1B6E3C' }}>
                R$ {fmtBRL(filtrados.reduce((s, p) => s + Number(p.valorFinal || 0), 0))}
              </strong>
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
