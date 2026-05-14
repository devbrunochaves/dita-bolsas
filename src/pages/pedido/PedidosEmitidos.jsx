import { useEffect, useState, useCallback, useMemo } from 'react'
import { getPedidos, deletePedido, getPedidoHistorico, updatePedido, getProdutos } from '../../utils/storage'
import { useAuth } from '../../contexts/AuthContext'
import { StatusSelect, StatusBadge, STATUS_CONFIG, STATUS_LIST } from '../../components/StatusSelect'
import { gerarPedidoPDF } from '../../utils/pdf'

// ── Painel de histórico ──────────────────────────────────────
function HistoricoPanel({ pedidoId, onClose }) {
  const [itens,   setItens]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPedidoHistorico(pedidoId)
      .then(data => { setItens(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [pedidoId])

  function iconeAcao(acao) {
    if (acao.includes('criado'))  return '🆕'
    if (acao.includes('Status'))  return '🔄'
    if (acao.includes('Entregue')) return '✅'
    if (acao.includes('Cancelado')) return '❌'
    return '📌'
  }

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px',
    }}>
      <div style={{
        background: 'white', borderRadius: 18, width: '100%', maxWidth: 520,
        maxHeight: '80vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px 14px', borderBottom: '1px solid #F3F4F6',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#1F2937', margin: 0 }}>📋 Histórico do Pedido</h3>
            <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>Todas as atualizações realizadas</p>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8, border: '1px solid #E5E7EB',
            background: '#F9FAFB', color: '#6B7280', cursor: 'pointer', fontSize: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
          }}>×</button>
        </div>

        {/* Timeline */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, gap: 12 }}>
              <div style={{ width: 24, height: 24, border: '3px solid #E5E7EB', borderTopColor: '#DC2626', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
              <span style={{ color: '#9CA3AF', fontSize: 13 }}>Carregando...</span>
            </div>
          ) : itens.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
              <p style={{ color: '#9CA3AF', fontSize: 14 }}>Nenhum histórico registrado ainda.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {itens.map((item, idx) => (
                <div key={item.id} style={{ display: 'flex', gap: 14, position: 'relative' }}>
                  {/* Linha vertical da timeline */}
                  {idx < itens.length - 1 && (
                    <div style={{
                      position: 'absolute', left: 19, top: 38, bottom: 0,
                      width: 2, background: '#F3F4F6',
                    }} />
                  )}
                  {/* Ícone */}
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%', background: '#FEF2F2',
                    border: '2px solid #FECACA', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 16, flexShrink: 0, zIndex: 1,
                  }}>
                    {iconeAcao(item.acao)}
                  </div>
                  {/* Conteúdo */}
                  <div style={{ paddingBottom: 20, flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1F2937' }}>{item.acao}</div>
                    <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                      por <strong>{item.user_nome}</strong>
                    </div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 3 }}>
                      {new Date(item.created_at).toLocaleString('pt-BR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Modal de confirmação de exclusão ─────────────────────────
function ModalExcluirPedido({ pedido, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false)

  async function handleConfirmar() {
    setLoading(true)
    await onConfirm()
    setLoading(false)
  }

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px',
    }}>
      <div style={{
        background: 'white', borderRadius: 18, width: '100%', maxWidth: 420,
        boxShadow: '0 24px 80px rgba(0,0,0,0.3)', padding: '28px 28px 24px',
        display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'center',
      }}>
        <div style={{ fontSize: 44 }}>🗑️</div>
        <div>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: '#1F2937', marginBottom: 6 }}>Excluir Pedido #{pedido.numero}?</h3>
          <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.5 }}>
            Esta ação é <strong>permanente</strong> e não pode ser desfeita.<br />
            O histórico do pedido também será removido.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '12px', borderRadius: 10, border: '1.5px solid #E5E7EB',
            background: 'white', color: '#374151', fontWeight: 700, fontSize: 14, cursor: 'pointer',
          }}>
            Cancelar
          </button>
          <button onClick={handleConfirmar} disabled={loading} style={{
            flex: 1, padding: '12px', borderRadius: 10, border: 'none',
            background: loading ? '#9CA3AF' : '#DC2626', color: 'white',
            fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer',
          }}>
            {loading ? 'Excluindo...' : 'Sim, excluir'}
          </button>
        </div>
      </div>
    </div>
  )
}

const FORMAS_PGT = [
  { value: 'pix',    label: 'Pix',               icon: '⚡' },
  { value: 'boleto', label: 'Boleto Bancário',    icon: '🏦' },
  { value: 'link',   label: 'Link de Pagamento',  icon: '🔗' },
]

const fmtBRLmodal = v => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// ── Modal de detalhes / edição inline do pedido ───────────────
function PedidoModal({ pedido, isAdmin, onClose, onStatusChange, onDelete, onUpdate }) {
  const [verHistorico,  setVerHistorico]  = useState(false)
  const [confirmarExcl, setConfirmarExcl] = useState(false)
  const [editMode,      setEditMode]      = useState(false)
  const [salvando,      setSalvando]      = useState(false)

  // estado de edição
  const [editItens,          setEditItens]          = useState([])
  const [editFormaPagamento, setEditFormaPagamento] = useState('')
  const [editParcelas,       setEditParcelas]       = useState('1')
  const [editDesconto,       setEditDesconto]       = useState('')
  const [editObservacoes,    setEditObservacoes]    = useState('')
  const [produtos,           setProdutos]           = useState([])
  const [prodLoad,           setProdLoad]           = useState(false)
  // linha de adicionar produto
  const [addCodigo, setAddCodigo] = useState('')
  const [addQtd,    setAddQtd]    = useState('')
  const [addObs,    setAddObs]    = useState('')

  if (!pedido) return null

  const cliente    = pedido.cliente || {}
  const totalQtd   = pedido.itens?.reduce((s, i) => s + (Number(i.quantidade) || 0), 0) || 0
  const totalValor = pedido.itens?.reduce((s, i) => s + (Number(i.vrTotal)    || 0), 0) || 0

  // totais calculados em tempo real durante edição
  const editSubtotal   = editItens.reduce((s, i) => s + Number(i.vrTotal || 0), 0)
  const editValorFinal = Math.max(0, editSubtotal - Number(editDesconto || 0))

  function entrarEdicao() {
    setEditItens(pedido.itens ? pedido.itens.map(i => ({ ...i })) : [])
    setEditFormaPagamento(pedido.formaPagamento || '')
    setEditParcelas(String(pedido.parcelasBoleto || 1))
    setEditDesconto(String(pedido.desconto || ''))
    setEditObservacoes(pedido.observacoes || '')
    setAddCodigo(''); setAddQtd(''); setAddObs('')
    if (!produtos.length) {
      setProdLoad(true)
      getProdutos().then(p => { setProdutos(p); setProdLoad(false) })
    }
    setEditMode(true)
  }

  function cancelarEdicao() { setEditMode(false) }

  function handleChangeQty(idx, qty) {
    setEditItens(prev => prev.map((item, i) => i !== idx ? item : {
      ...item,
      quantidade: qty,
      vrTotal: String((Number(qty || 0) * Number(item.vrUnitario || 0)).toFixed(2)),
    }))
  }

  function handleRemoveItem(idx) {
    setEditItens(prev => prev.filter((_, i) => i !== idx))
  }

  function handleAddItem() {
    const prod = produtos.find(p => p.codigo === addCodigo)
    if (!prod || !addQtd || Number(addQtd) < 1) return
    const qty = Number(addQtd)
    setEditItens(prev => [...prev, {
      codigo:      prod.codigo,
      nome:        prod.nome,
      quantidade:  String(qty),
      vrUnitario:  String(prod.valor),
      vrTotal:     String((qty * prod.valor).toFixed(2)),
      observacoes: addObs.trim(),
    }])
    setAddCodigo(''); setAddQtd(''); setAddObs('')
  }

  async function handleSalvar() {
    if (!editItens.length) { alert('Adicione pelo menos um produto.'); return }
    setSalvando(true)
    const campos = {
      itens:          editItens,
      valorFinal:     editValorFinal,
      desconto:       Number(editDesconto || 0),
      observacoes:    editObservacoes,
      formaPagamento: editFormaPagamento || null,
      parcelasBoleto: editFormaPagamento === 'boleto' ? Number(editParcelas || 1) : null,
    }
    try {
      await updatePedido(pedido.id, campos)
      onUpdate(pedido.id, campos)
      setEditMode(false)
    } catch (err) {
      console.error('[PedidoModal] Erro ao salvar:', err)
      alert(`Erro ao salvar pedido: ${err.message || 'Tente novamente.'}`)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <>
      {verHistorico  && <HistoricoPanel pedidoId={pedido.id} onClose={() => setVerHistorico(false)} />}
      {confirmarExcl && (
        <ModalExcluirPedido
          pedido={pedido}
          onClose={() => setConfirmarExcl(false)}
          onConfirm={async () => { await onDelete(pedido.id); setConfirmarExcl(false); onClose() }}
        />
      )}

      <div
        onClick={e => { if (!editMode && e.target === e.currentTarget) onClose() }}
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
          outline: editMode ? '2px solid #F59E0B' : 'none',
          transition: 'outline 0.2s',
        }}>

          {/* ── Cabeçalho ── */}
          <div style={{
            padding: '16px 20px 14px', borderBottom: `1px solid ${editMode ? '#FDE68A' : '#F3F4F6'}`,
            position: 'sticky', top: 0, zIndex: 1,
            background: editMode ? '#FFFBEB' : 'white',
            borderRadius: '18px 18px 0 0',
            display: 'grid', gridTemplateColumns: '1fr auto',
            gap: '8px 12px', alignItems: 'center',
            transition: 'background 0.2s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22, fontWeight: 900, color: '#1B6E3C' }}>#{pedido.numero || '-'}</span>
              <StatusBadge status={pedido.status || 'PENDENTE'} />
              {editMode && <span style={{ fontSize: 12, fontWeight: 700, color: '#92400E', background: '#FDE68A', padding: '2px 10px', borderRadius: 100 }}>✏️ Modo edição</span>}
            </div>
            <button onClick={editMode ? cancelarEdicao : onClose} style={{
              width: 36, height: 36, borderRadius: 9,
              border: `1px solid ${editMode ? '#FDE68A' : '#E5E7EB'}`,
              background: editMode ? '#FEF3C7' : '#F9FAFB',
              color: editMode ? '#92400E' : '#6B7280',
              cursor: 'pointer', fontSize: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0,
            }}>×</button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', gridColumn: '1 / -1' }}>
              {!editMode ? (
                <>
                  <button onClick={() => setVerHistorico(true)} style={{ background: '#DC2626', color: 'white', border: 'none', padding: '9px 18px', borderRadius: 9, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 2px 8px rgba(220,38,38,0.3)' }}>📋 Histórico</button>
                  <button onClick={() => gerarPedidoPDF({ ...pedido, data: pedido.dataCriacao })} style={{ background: '#1B6E3C', color: 'white', border: 'none', padding: '9px 18px', borderRadius: 9, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 2px 8px rgba(27,110,60,0.3)' }}>📥 Baixar PDF</button>
                  <button onClick={entrarEdicao} style={{ background: '#F59E0B', color: 'white', border: 'none', padding: '9px 18px', borderRadius: 9, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 2px 8px rgba(245,158,11,0.3)' }}>✏️ Editar</button>
                  {isAdmin && <button onClick={() => setConfirmarExcl(true)} title="Excluir" style={{ width: 36, height: 36, borderRadius: 9, border: '1px solid #FECACA', background: '#FEF2F2', color: '#DC2626', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🗑️</button>}
                </>
              ) : (
                <>
                  <button onClick={cancelarEdicao} style={{ background: 'white', color: '#374151', border: '1.5px solid #D1D5DB', padding: '9px 20px', borderRadius: 9, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>✕ Cancelar</button>
                  <button onClick={handleSalvar} disabled={salvando} style={{ background: salvando ? '#9CA3AF' : '#1B6E3C', color: 'white', border: 'none', padding: '9px 24px', borderRadius: 9, fontWeight: 800, fontSize: 13, cursor: salvando ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: salvando ? 'none' : '0 2px 8px rgba(27,110,60,0.3)' }}>
                    {salvando ? <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Salvando...</> : '💾 Salvar Alterações'}
                  </button>
                </>
              )}
            </div>
          </div>

          <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* ── Dados do cliente (sempre leitura) ── */}
            <section>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: '#1B6E3C', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.8 }}>👥 Dados do Cliente</h3>
              <div style={{ background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: 12, padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '12px 24px', fontSize: 13 }}>
                {[['Nome', cliente.nome || '—'], ['CNPJ/CPF', cliente.cnpjCpf || '—'], ['Endereço', cliente.endereco || '—'], ['Bairro', cliente.bairro || '—'], ['Cidade / UF', `${cliente.cidade || '—'} / ${cliente.estado || '—'}`], ['Telefone', cliente.telefone || '—'], ['WhatsApp', cliente.whatsapp || '—'], ['Contato', cliente.contato || '—'], ['Email', cliente.email || '—'], ['Pagamento', cliente.pgt || '—']].map(([label, value]) => (
                  <div key={label}>
                    <div style={{ color: '#9CA3AF', fontWeight: 600, fontSize: 11, marginBottom: 3 }}>{label}</div>
                    <div style={{ color: '#1F2937', fontWeight: 500 }}>{value}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Itens do pedido ── */}
            <section>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: '#1B6E3C', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.8 }}>📦 Itens do Pedido</h3>

              {!editMode ? (
                /* leitura */
                <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC' }}>
                        {['Cód.', 'Produto', 'Qtd.', 'Vr. Unitário', 'Vr. Total'].map((h, i) => (
                          <th key={h} style={{ padding: '10px 14px', fontWeight: 700, fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: i >= 2 ? 'right' : 'left', borderBottom: '1px solid #E5E7EB' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(pedido.itens || []).map((item, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                          <td style={{ padding: '10px 14px', color: '#6B7280', fontWeight: 600 }}>{item.codigo || '—'}</td>
                          <td style={{ padding: '10px 14px', color: '#1F2937' }}>
                            {item.nome || '—'}
                            {item.observacoes && <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2, fontStyle: 'italic' }}>{item.observacoes}</div>}
                          </td>
                          <td style={{ padding: '10px 14px', color: '#1F2937', fontWeight: 600, textAlign: 'right' }}>{item.quantidade || 0}</td>
                          <td style={{ padding: '10px 14px', color: '#1F2937', textAlign: 'right' }}>R$ {fmtBRLmodal(item.vrUnitario)}</td>
                          <td style={{ padding: '10px 14px', color: '#1F2937', fontWeight: 700, textAlign: 'right' }}>R$ {fmtBRLmodal(item.vrTotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* edição */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {editItens.map((item, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr auto 110px auto', gap: 8, alignItems: 'center', background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: 10, padding: '10px 12px' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1F2937' }}>{item.nome}</div>
                        <div style={{ fontSize: 11, color: '#9CA3AF' }}>{item.codigo}{item.observacoes ? ` · ${item.observacoes}` : ''}</div>
                      </div>
                      <div style={{ fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>R$ {fmtBRLmodal(item.vrUnitario)}/un</div>
                      <input
                        type="number" min="1" value={item.quantidade}
                        onChange={e => handleChangeQty(idx, e.target.value)}
                        style={{ border: '1.5px solid #D1D5DB', borderRadius: 7, padding: '6px 10px', fontSize: 14, fontWeight: 700, textAlign: 'center', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                      />
                      <button onClick={() => handleRemoveItem(idx)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #FECACA', background: '#FEF2F2', color: '#DC2626', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>×</button>
                    </div>
                  ))}

                  {/* linha adicionar produto */}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 4, padding: '12px 14px', background: '#F0FDF4', border: '1.5px dashed #86EFAC', borderRadius: 10 }}>
                    {prodLoad ? (
                      <span style={{ fontSize: 13, color: '#6B7280' }}>Carregando produtos...</span>
                    ) : (
                      <>
                        <select value={addCodigo} onChange={e => setAddCodigo(e.target.value)} style={{ flex: 2, minWidth: 180, border: '1.5px solid #D1D5DB', borderRadius: 8, padding: '8px 10px', fontSize: 13, outline: 'none', background: 'white' }}>
                          <option value="">— Selecione um produto —</option>
                          {produtos.map(p => <option key={p.codigo} value={p.codigo}>{p.codigo} — {p.nome}</option>)}
                        </select>
                        <input type="number" min="1" value={addQtd} onChange={e => setAddQtd(e.target.value)} placeholder="Qtd." style={{ width: 70, border: '1.5px solid #D1D5DB', borderRadius: 8, padding: '8px 10px', fontSize: 13, outline: 'none', textAlign: 'center' }} />
                        <input value={addObs} onChange={e => setAddObs(e.target.value)} placeholder="Obs. (opcional)" style={{ flex: 1, minWidth: 120, border: '1.5px solid #D1D5DB', borderRadius: 8, padding: '8px 10px', fontSize: 13, outline: 'none' }} />
                        <button onClick={handleAddItem} disabled={!addCodigo || !addQtd} style={{ background: addCodigo && addQtd ? '#1B6E3C' : '#D1D5DB', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: addCodigo && addQtd ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap' }}>＋ Adicionar</button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </section>

            {/* ── Totais ── */}
            <section>
              <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 12, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {editMode ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#374151' }}>
                      <span>Subtotal</span><strong>R$ {fmtBRLmodal(editSubtotal)}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#DC2626' }}>
                      <span style={{ flexShrink: 0 }}>Desconto (R$)</span>
                      <input type="number" step="0.01" min="0" value={editDesconto} onChange={e => setEditDesconto(e.target.value)} placeholder="0,00" style={{ width: 110, border: '1.5px solid #FCA5A5', borderRadius: 7, padding: '5px 10px', fontSize: 13, outline: 'none', textAlign: 'right', background: '#FEF2F2' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid #86EFAC', fontSize: 17, fontWeight: 900, color: '#1B6E3C' }}>
                      <span>Valor Final</span><span>R$ {fmtBRLmodal(editValorFinal)}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#374151' }}><span>Total de itens</span><strong>{totalQtd} unid.</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#374151' }}><span>Subtotal</span><strong>R$ {fmtBRLmodal(totalValor)}</strong></div>
                    {Number(pedido.desconto) > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#DC2626' }}><span>Desconto</span><strong>− R$ {fmtBRLmodal(pedido.desconto)}</strong></div>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid #86EFAC', fontSize: 17, fontWeight: 900, color: '#1B6E3C' }}><span>Valor Final</span><span>R$ {fmtBRLmodal(pedido.valorFinal)}</span></div>
                  </>
                )}
              </div>
            </section>

            {/* ── Forma de pagamento ── */}
            <section>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: '#1B6E3C', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 }}>💳 Forma de Pagamento</h3>
              {!editMode ? (
                pedido.formaPagamento ? (
                  <div style={{ background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: 12, padding: '14px 18px', fontSize: 14, color: '#374151', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 18 }}>{{ pix: '⚡', boleto: '🏦', link: '🔗' }[pedido.formaPagamento] || '💳'}</span>
                    <span style={{ fontWeight: 600 }}>{{ pix: 'Pix', boleto: 'Boleto Bancário', link: 'Link de Pagamento' }[pedido.formaPagamento] || pedido.formaPagamento}</span>
                    {pedido.formaPagamento === 'boleto' && pedido.parcelasBoleto > 1 && <span style={{ color: '#6B7280', fontSize: 13 }}>— {pedido.parcelasBoleto}x de R$ {fmtBRLmodal(pedido.valorFinal / pedido.parcelasBoleto)}</span>}
                  </div>
                ) : <div style={{ fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' }}>Não informada</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {FORMAS_PGT.map(op => (
                    <div key={op.value} onClick={() => setEditFormaPagamento(op.value)} style={{ display: 'flex', alignItems: 'center', gap: 12, border: `1.5px solid ${editFormaPagamento === op.value ? '#1B6E3C' : '#E5E7EB'}`, borderRadius: 10, padding: '11px 14px', cursor: 'pointer', background: editFormaPagamento === op.value ? '#F0FDF4' : 'white', transition: 'all 0.15s' }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, border: `2px solid ${editFormaPagamento === op.value ? '#1B6E3C' : '#D1D5DB'}`, background: editFormaPagamento === op.value ? '#1B6E3C' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {editFormaPagamento === op.value && <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'white' }} />}
                      </div>
                      <span style={{ fontSize: 15 }}>{op.icon}</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: editFormaPagamento === op.value ? '#1B6E3C' : '#374151' }}>{op.label}</span>
                    </div>
                  ))}
                  {editFormaPagamento === 'pix' && (
                    <div style={{ background: '#F0FDF4', border: '1.5px solid #86EFAC', borderRadius: 10, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#1B6E3C', marginBottom: 2 }}>⚡ Dados para pagamento via Pix</div>
                      <div style={{ fontSize: 13, color: '#374151' }}><strong>Chave Pix:</strong> 19.943.654/0001-87</div>
                      <div style={{ fontSize: 13, color: '#374151' }}><strong>Banco:</strong> Sicoob</div>
                      <div style={{ fontSize: 13, color: '#374151' }}><strong>Favorecido:</strong> Maria do Socorro Gomes dos Santos</div>
                    </div>
                  )}
                  {editFormaPagamento === 'link' && (
                    <div style={{ background: '#EFF6FF', border: '1.5px solid #BFDBFE', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 18 }}>ℹ️</span>
                      <span style={{ fontSize: 13, color: '#1E40AF', fontWeight: 500 }}>O link será enviado pelo setor financeiro para o WhatsApp do cliente.</span>
                    </div>
                  )}
                  {editFormaPagamento === 'boleto' && (
                    <div style={{ background: '#FFFBEB', border: '1.5px solid #FDE68A', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#92400E' }}>Dividido em:</span>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {[1,2,3,4,5,6].map(n => (
                          <button key={n} type="button" onClick={() => setEditParcelas(String(n))} style={{ width: 40, height: 34, borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', border: '1.5px solid', borderColor: editParcelas === String(n) ? '#1B6E3C' : '#D1D5DB', background: editParcelas === String(n) ? '#1B6E3C' : 'white', color: editParcelas === String(n) ? 'white' : '#374151' }}>{n}x</button>
                        ))}
                      </div>
                      {Number(editParcelas) > 1 && editValorFinal > 0 && <span style={{ fontSize: 13, color: '#92400E', fontWeight: 600 }}>= R$ {fmtBRLmodal(editValorFinal / Number(editParcelas))} / parcela</span>}
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* ── Observações ── */}
            <section>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: '#1B6E3C', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>📝 Observações</h3>
              {!editMode ? (
                pedido.observacoes
                  ? <div style={{ background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: 12, padding: '14px 18px', fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{pedido.observacoes}</div>
                  : <div style={{ fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' }}>Sem observações</div>
              ) : (
                <textarea value={editObservacoes} onChange={e => setEditObservacoes(e.target.value)} placeholder="Ex: Entregar até sexta-feira, embalar separado..." rows={4} style={{ border: '1.5px solid #D1D5DB', borderRadius: 10, padding: '10px 14px', fontSize: 14, outline: 'none', width: '100%', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5, boxSizing: 'border-box' }} />
              )}
            </section>

            {/* ── Meta (só em modo leitura) ── */}
            {!editMode && (
              <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#9CA3AF', paddingTop: 4, borderTop: '1px solid #F3F4F6', flexWrap: 'wrap', gap: 10 }}>
                <span>Emitido por: <strong style={{ color: '#6B7280' }}>{pedido.emitidoPor || '—'}</strong></span>
                <span>Data: <strong style={{ color: '#6B7280' }}>{pedido.dataCriacao ? new Date(pedido.dataCriacao).toLocaleDateString('pt-BR') : '—'}</strong></span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>Alterar status:</span>
                  <StatusSelect pedidoId={pedido.id} current={pedido.status || 'PENDENTE'} onChange={onStatusChange} />
                </div>
              </section>
            )}

          </div>
        </div>
      </div>
    </>
  )
}

// Função pura sem dependências — fora do componente para estabilidade de referência
const fmtBRL = v => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })

// ── Página principal ─────────────────────────────────────────
export default function PedidosEmitidos() {
  const [pedidos, setPedidos]           = useState([])
  const [loading, setLoading]           = useState(true)
  const [filtroStatus, setFiltroStatus] = useState('TODOS')
  const [busca, setBusca]               = useState('')
  const [pedidoModal, setPedidoModal]   = useState(null)

  const { isAdmin } = useAuth()

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
    setPedidoModal(prev => prev?.id === id ? { ...prev, status: novoStatus } : prev)
  }, [])

  async function handleDelete(id) {
    await deletePedido(id)
    setPedidos(prev => prev.filter(p => p.id !== id))
  }

  const handleUpdate = useCallback((id, campos) => {
    setPedidos(prev => prev.map(p => p.id === id ? { ...p, ...campos } : p))
    setPedidoModal(prev => prev?.id === id ? { ...prev, ...campos } : prev)
  }, [])

  // Contagens memoizadas — só recalcula quando `pedidos` muda
  const contagem = useMemo(() =>
    STATUS_LIST.reduce((acc, s) => {
      acc[s] = pedidos.filter(p => (p.status || 'PENDENTE') === s).length
      return acc
    }, {}),
  [pedidos])

  // Filtro memoizado — só recalcula quando pedidos, filtroStatus ou busca mudam
  const { filtrados, totalFiltrado } = useMemo(() => {
    const buscaLower = busca.toLowerCase()
    const lista = pedidos.filter(p => {
      const statusAtual = p.status || 'PENDENTE'
      const passaStatus = filtroStatus === 'TODOS' || statusAtual === filtroStatus
      const passaBusca  = !busca ||
        p.cliente?.nome?.toLowerCase().includes(buscaLower) ||
        String(p.numero).includes(busca)
      return passaStatus && passaBusca
    })
    const total = lista.reduce((s, p) => s + Number(p.valorFinal || 0), 0)
    return { filtrados: lista, totalFiltrado: total }
  }, [pedidos, filtroStatus, busca])

  return (
    <div>
      {/* Modal de detalhes */}
      {pedidoModal && (
        <PedidoModal
          pedido={pedidoModal}
          isAdmin={isAdmin}
          onClose={() => setPedidoModal(null)}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
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
            fontWeight: 600, fontSize: 13, cursor: 'pointer',
          }}
        >
          Todos ({pedidos.length})
        </button>

        {STATUS_LIST.map(s => {
          const cfg   = STATUS_CONFIG[s]
          const ativo = filtroStatus === s
          return (
            <button key={s} onClick={() => setFiltroStatus(s)} style={{
              padding: '7px 16px', borderRadius: 100, fontSize: 13, fontWeight: 700,
              cursor: 'pointer', border: '1.5px solid',
              borderColor: ativo ? cfg.dot : cfg.border,
              background:  ativo ? cfg.dot : cfg.bg,
              color:       ativo ? 'white' : cfg.color,
            }}>
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
                  <td onClick={e => e.stopPropagation()}>
                    <StatusSelect
                      pedidoId={p.id}
                      current={p.status || 'PENDENTE'}
                      onChange={handleStatusChange}
                    />
                  </td>
                  <td style={{ fontSize: 13, color: '#6B7280' }}>
                    {p.emitidoPor || <span style={{ color: '#D1D5DB', fontStyle: 'italic' }}>—</span>}
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
                R$ {fmtBRL(totalFiltrado)}
              </strong>
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
