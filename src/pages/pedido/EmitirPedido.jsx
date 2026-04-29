import { useState, useEffect, useRef } from 'react'
import { getClientes, getProdutos, savePedido } from '../../utils/storage'
import { gerarPedidoPDF } from '../../utils/pdf'

// ── Modal de sucesso ─────────────────────────────────────────
function ModalSucesso({ pedido, onFechar }) {
  const fmtBRL = v => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  async function handleCompartilhar() {
    const itensTexto = (pedido.itens || [])
      .map(i => `• ${i.quantidade}x ${i.nome}${i.observacoes ? ` (${i.observacoes})` : ''} — R$ ${fmtBRL(i.vrTotal)}`)
      .join('\n')

    const texto = [
      `🛍️ *DITA BOLSAS — Orçamento/Pedido*`,
      ``,
      `👤 Cliente: ${pedido.cliente?.nome || '—'}`,
      `📅 Data: ${new Date().toLocaleDateString('pt-BR')}`,
      ``,
      `📦 *Produtos:*`,
      itensTexto,
      ``,
      pedido.desconto > 0 ? `🏷️ Desconto: - R$ ${fmtBRL(pedido.desconto)}\n` : '',
      `💰 *Valor Total: R$ ${fmtBRL(pedido.valorFinal)}*`,
      ``,
      pedido.observacoes ? `📝 Obs: ${pedido.observacoes}` : '',
      ``,
      `_Dita Bolsas — Personalizados com qualidade ✨_`,
    ].filter(l => l !== '').join('\n')

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Orçamento Dita Bolsas', text: texto })
      } catch (err) {
        if (err.name !== 'AbortError') {
          // fallback WhatsApp
          window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank')
        }
      }
    } else {
      // fallback para navegadores sem suporte
      window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank')
    }
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onFechar() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px',
        backdropFilter: 'blur(4px)',
      }}
    >
      <style>{`
        @keyframes scaleIn {
          0%   { transform: scale(0.6); opacity: 0; }
          70%  { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes checkDraw {
          0%   { stroke-dashoffset: 100; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes circleDraw {
          0%   { stroke-dashoffset: 300; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes fadeUp {
          0%   { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .modal-sucesso-box {
          animation: scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        .sucesso-circle {
          stroke-dasharray: 300;
          stroke-dashoffset: 300;
          animation: circleDraw 0.6s ease forwards 0.1s;
        }
        .sucesso-check {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: checkDraw 0.4s ease forwards 0.55s;
        }
        .sucesso-texto {
          opacity: 0;
          animation: fadeUp 0.4s ease forwards 0.7s;
        }
        .sucesso-btn {
          opacity: 0;
          animation: fadeUp 0.4s ease forwards 0.85s;
        }
      `}</style>

      <div
        className="modal-sucesso-box"
        style={{
          background: 'white',
          borderRadius: 20,
          width: '100%',
          maxWidth: 400,
          padding: '40px 32px 32px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0,
          textAlign: 'center',
        }}
      >
        {/* Checkmark animado */}
        <svg width="100" height="100" viewBox="0 0 100 100" style={{ marginBottom: 20 }}>
          <circle
            className="sucesso-circle"
            cx="50" cy="50" r="46"
            fill="none"
            stroke="#1B6E3C"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <polyline
            className="sucesso-check"
            points="28,52 44,66 72,36"
            fill="none"
            stroke="#1B6E3C"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Título */}
        <div className="sucesso-texto">
          <div style={{ fontSize: 22, fontWeight: 900, color: '#1B6E3C', letterSpacing: 0.5, marginBottom: 6 }}>
            PEDIDO EMITIDO
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#1F2937', letterSpacing: 0.5, marginBottom: 12 }}>
            COM SUCESSO!
          </div>
          <div style={{ fontSize: 14, color: '#6B7280', marginBottom: 28, lineHeight: 1.5 }}>
            O PDF foi gerado e salvo.<br />
            Compartilhe o orçamento com o cliente agora.
          </div>
        </div>

        {/* Botão compartilhar */}
        <div className="sucesso-btn" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={handleCompartilhar}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #1B6E3C 0%, #25a05a 100%)',
              color: 'white',
              border: 'none',
              padding: '15px',
              borderRadius: 12,
              fontWeight: 800,
              fontSize: 15,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              boxShadow: '0 4px 14px rgba(27,110,60,0.35)',
              letterSpacing: 0.3,
            }}
          >
            <span style={{ fontSize: 20 }}>📤</span>
            Enviar para o Cliente
          </button>

          <button
            onClick={onFechar}
            style={{
              width: '100%',
              background: 'transparent',
              color: '#9CA3AF',
              border: '1.5px solid #E5E7EB',
              padding: '12px',
              borderRadius: 12,
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Modal de adicionar / editar produto ─────────────────────
function ModalProduto({ produtos, onAdicionar, onClose, itemInicial }) {
  const modoEdicao = !!itemInicial

  const [produtoSelecionado, setProdutoSelecionado] = useState(
    itemInicial ? (produtos.find(p => p.codigo === itemInicial.codigo) || null) : null
  )
  const [quantidade, setQuantidade] = useState(itemInicial?.quantidade || '')
  const [observacoes, setObservacoes] = useState(itemInicial?.observacoes || '')

  const fmtBRL = v => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })

  function handleSelect(e) {
    const codigo = e.target.value
    const prod = produtos.find(p => p.codigo === codigo) || null
    setProdutoSelecionado(prod)
    if (!modoEdicao) { setQuantidade(''); setObservacoes('') }
  }

  function handleAdicionar() {
    if (!produtoSelecionado) return
    const qty = Number(quantidade)
    if (!qty || qty < 1) { alert('Informe uma quantidade válida.'); return }

    onAdicionar({
      codigo:      produtoSelecionado.codigo,
      nome:        produtoSelecionado.nome,
      quantidade:  String(qty),
      vrUnitario:  String(produtoSelecionado.valor),
      vrTotal:     String((qty * produtoSelecionado.valor).toFixed(2)),
      observacoes: observacoes.trim(),
    })
  }

  function handleOverlay(e) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      onClick={handleOverlay}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px',
      }}
    >
      <div style={{
        background: 'white', borderRadius: 16, width: '100%', maxWidth: 500,
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        {/* Cabeçalho */}
        <div style={{
          padding: '20px 24px 16px', borderBottom: '1px solid #F3F4F6',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1F2937' }}>
            {modoEdicao ? '✏️ Editar Produto' : '📦 Adicionar Produto'}
          </h3>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8, border: '1px solid #E5E7EB',
            background: '#F9FAFB', color: '#6B7280', cursor: 'pointer', fontSize: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
          }}>×</button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Select de produto */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Código / Produto
            </label>
            <select
              value={produtoSelecionado?.codigo || ''}
              onChange={handleSelect}
              style={{
                width: '100%', border: '1.5px solid #D1D5DB', borderRadius: 8,
                padding: '10px 12px', fontSize: 14, outline: 'none', background: 'white',
                color: produtoSelecionado ? '#1F2937' : '#9CA3AF',
              }}
            >
              <option value="">— Selecione um produto —</option>
              {produtos.map(p => (
                <option key={p.codigo} value={p.codigo}>
                  {p.codigo} — {p.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Info do produto selecionado */}
          {produtoSelecionado && (
            <div style={{
              background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 10,
              padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1F2937' }}>{produtoSelecionado.nome}</div>
                <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>Código: {produtoSelecionado.codigo}</div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#1B6E3C', whiteSpace: 'nowrap' }}>
                R$ {fmtBRL(produtoSelecionado.valor)}
              </div>
            </div>
          )}

          {/* Quantidade */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Quantidade
            </label>
            <input
              type="number"
              min="1"
              value={quantidade}
              onChange={e => setQuantidade(e.target.value)}
              placeholder="0"
              style={{
                width: '100%', border: '1.5px solid #D1D5DB', borderRadius: 8,
                padding: '10px 12px', fontSize: 14, outline: 'none', textAlign: 'center',
                boxSizing: 'border-box',
              }}
            />
            {produtoSelecionado && quantidade && Number(quantidade) > 0 && (
              <div style={{ fontSize: 12, color: '#6B7280', marginTop: 6, textAlign: 'right' }}>
                Subtotal: <strong style={{ color: '#1B6E3C' }}>
                  R$ {fmtBRL(Number(quantidade) * produtoSelecionado.valor)}
                </strong>
              </div>
            )}
          </div>

          {/* Observações do produto */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Observações <span style={{ fontWeight: 400, textTransform: 'none', color: '#9CA3AF' }}>(personagem, cor, detalhes...)</span>
            </label>
            <textarea
              value={observacoes}
              onChange={e => setObservacoes(e.target.value)}
              placeholder="Ex: Personagem: Stitch, Cor: Azul marinho"
              rows={3}
              style={{
                width: '100%', border: '1.5px solid #D1D5DB', borderRadius: 8,
                padding: '10px 12px', fontSize: 13, outline: 'none', resize: 'vertical',
                fontFamily: 'inherit', lineHeight: 1.5, boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Botão confirmar */}
          <button
            onClick={handleAdicionar}
            disabled={!produtoSelecionado || !quantidade}
            style={{
              background: produtoSelecionado && quantidade ? '#1B6E3C' : '#D1D5DB',
              color: 'white', border: 'none', padding: '13px', borderRadius: 10,
              fontWeight: 800, fontSize: 15, cursor: produtoSelecionado && quantidade ? 'pointer' : 'not-allowed',
              transition: 'background 0.2s',
            }}
          >
            {modoEdicao ? '💾 Salvar Alterações' : '＋ Adicionar ao Pedido'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Componente principal ─────────────────────────────────────
export default function EmitirPedido() {
  const [clientes, setClientes]                     = useState([])
  const [produtos, setProdutos]                     = useState([])
  const [clienteBusca, setClienteBusca]             = useState('')
  const [clienteSelecionado, setClienteSelecionado] = useState(null)
  const [clienteDropdown, setClienteDropdown]       = useState(false)
  const [dataPedido, setDataPedido]                 = useState(() => new Date().toISOString().split('T')[0])
  const [itens, setItens]                           = useState([])
  const [desconto, setDesconto]                     = useState('')
  const [observacoes, setObservacoes]               = useState('Orçamento válido pelo período de 30 dias')
  const [modalAberto, setModalAberto]               = useState(false)
  const [editIndex, setEditIndex]                   = useState(null)
  const [pedidoEmitido, setPedidoEmitido]           = useState(null)
  const [loading, setLoading]                       = useState(true)
  const dropdownRef = useRef(null)

  useEffect(() => {
    async function load() {
      const [c, p] = await Promise.all([getClientes(), getProdutos()])
      setClientes(c)
      setProdutos(p)
      setLoading(false)
    }
    load()
    function handleOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setClienteDropdown(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  // Fecha modal produto com ESC
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') setModalAberto(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const clientesFiltrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(clienteBusca.toLowerCase()) ||
    (c.cnpjCpf && c.cnpjCpf.includes(clienteBusca))
  ).slice(0, 8)

  function selecionarCliente(c) {
    setClienteSelecionado(c)
    setClienteBusca(c.nome)
    setClienteDropdown(false)
  }

  function handleAdicionarItem(item) {
    if (editIndex !== null) {
      setItens(prev => prev.map((it, i) => i === editIndex ? item : it))
      setEditIndex(null)
    } else {
      setItens(prev => [...prev, item])
    }
    setModalAberto(false)
  }

  function abrirEdicao(index) {
    setEditIndex(index)
    setModalAberto(true)
  }

  function removeItem(index) {
    setItens(prev => prev.filter((_, i) => i !== index))
  }

  const totalItens = itens.reduce((s, i) => s + (Number(i.quantidade) || 0), 0)
  const totalValor = itens.reduce((s, i) => s + (Number(i.vrTotal)    || 0), 0)
  const valorFinal = Math.max(0, totalValor - Number(desconto || 0))
  const fmtBRL = v => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  async function handleEmitir(e) {
    e.preventDefault()
    if (!clienteSelecionado) { alert('Selecione um cliente antes de emitir.'); return }
    if (!itens.length) { alert('Adicione pelo menos um produto.'); return }

    const pedido = {
      cliente:    clienteSelecionado,
      itens,
      desconto:   Number(desconto || 0),
      valorFinal,
      observacoes,
      data:       dataPedido,
    }

    await savePedido(pedido)
    gerarPedidoPDF(pedido)

    // Mostra modal de sucesso
    setPedidoEmitido(pedido)

    // Limpa o formulário (mantém a data para facilitar emissão retroativa em sequência)
    setClienteBusca('')
    setClienteSelecionado(null)
    setItens([])
    setDesconto('')
    setObservacoes('Orçamento válido pelo período de 30 dias')
  }

  function handleLimpar() {
    if (!window.confirm('Limpar todos os dados do pedido?')) return
    setClienteBusca(''); setClienteSelecionado(null)
    setItens([]); setDesconto('')
    setObservacoes('Orçamento válido pelo período de 30 dias')
    setDataPedido(new Date().toISOString().split('T')[0])
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 36, height: 36, border: '4px solid #E5E7EB', borderTopColor: '#1B6E3C', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <span style={{ color: '#6B7280', fontSize: 14 }}>Carregando clientes e produtos...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>

      {/* Modal de sucesso */}
      {pedidoEmitido && (
        <ModalSucesso
          pedido={pedidoEmitido}
          onFechar={() => setPedidoEmitido(null)}
        />
      )}

      {/* Modal de produto */}
      {modalAberto && (
        <ModalProduto
          produtos={produtos}
          onAdicionar={handleAdicionarItem}
          onClose={() => { setModalAberto(false); setEditIndex(null) }}
          itemInicial={editIndex !== null ? itens[editIndex] : null}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#1F2937' }}>Emitir Pedido / Orçamento</h1>
          <p style={{ color: '#6B7280', fontSize: 13, marginTop: 2 }}>Preencha os dados e clique em "Emitir Pedido" para gerar o PDF.</p>
        </div>
        <button onClick={handleLimpar} className="ped-btn-secondary" type="button">🗑️ Limpar</button>
      </div>

      <form onSubmit={handleEmitir}>

        {/* ===== DATA DO PEDIDO ===== */}
        <div className="ped-card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 220 }}>
              <div style={{ fontSize: 22 }}>📅</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1B6E3C' }}>Data do Pedido</div>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 1 }}>
                  Preenchida automaticamente com hoje. Altere para lançamentos retroativos.
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="date"
                value={dataPedido}
                onChange={e => setDataPedido(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                style={{
                  border: dataPedido !== new Date().toISOString().split('T')[0]
                    ? '1.5px solid #F59E0B'
                    : '1.5px solid #D1D5DB',
                  borderRadius: 8,
                  padding: '10px 14px',
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#1F2937',
                  outline: 'none',
                  background: dataPedido !== new Date().toISOString().split('T')[0] ? '#FFFBEB' : 'white',
                  cursor: 'pointer',
                }}
              />
              {dataPedido !== new Date().toISOString().split('T')[0] && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, padding: '6px 12px' }}>
                  <span style={{ fontSize: 14 }}>⚠️</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#92400E' }}>Lançamento retroativo</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===== CLIENTE ===== */}
        <div className="ped-card" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1B6E3C', marginBottom: 16 }}>👥 Dados do Cliente</h2>
          <div style={{ position: 'relative', marginBottom: 16 }} ref={dropdownRef}>
            <div className="ped-form-group">
              <label>Buscar cliente por nome ou CNPJ/CPF</label>
              <input
                value={clienteBusca}
                onChange={e => { setClienteBusca(e.target.value); setClienteDropdown(true); if (!e.target.value) setClienteSelecionado(null) }}
                onFocus={() => setClienteDropdown(true)}
                placeholder="Digite o nome ou CNPJ/CPF..."
                style={{ border: '1.5px solid #D1D5DB', borderRadius: 6, padding: '10px 14px', fontSize: 14, width: '100%', outline: 'none' }}
              />
            </div>
            {clienteDropdown && clienteBusca && clientesFiltrados.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1.5px solid #D1D5DB', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 100, maxHeight: 220, overflowY: 'auto' }}>
                {clientesFiltrados.map(c => (
                  <div key={c.id} onClick={() => selecionarCliente(c)}
                    style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #F3F4F6' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F0FDF4'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#1F2937' }}>{c.nome}</div>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>{c.cidade} / {c.estado} · {c.cnpjCpf || 'Sem CNPJ/CPF'}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {clienteSelecionado ? (
            <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 10, padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px 24px', fontSize: 13 }}>
              {[
                ['Nome', clienteSelecionado.nome],
                ['CNPJ/CPF', clienteSelecionado.cnpjCpf || '-'],
                ['Endereço', clienteSelecionado.endereco || '-'],
                ['Bairro', clienteSelecionado.bairro || '-'],
                ['Cidade / UF', `${clienteSelecionado.cidade || '-'} / ${clienteSelecionado.estado || '-'}`],
                ['Telefone', clienteSelecionado.telefone || '-'],
                ['WhatsApp', clienteSelecionado.whatsapp || '-'],
                ['Contato', clienteSelecionado.contato || '-'],
                ['Email', clienteSelecionado.email || '-'],
                ['Pagamento', clienteSelecionado.pgt || '-'],
              ].map(([label, value]) => (
                <div key={label}><span style={{ color: '#6B7280', fontWeight: 600 }}>{label}: </span><span style={{ color: '#1F2937', fontWeight: 500 }}>{value}</span></div>
              ))}
              <button type="button" onClick={() => { setClienteSelecionado(null); setClienteBusca('') }}
                style={{ color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, textAlign: 'left' }}>
                ✕ Trocar cliente
              </button>
            </div>
          ) : (
            <div style={{ background: '#F9FAFB', border: '1px dashed #D1D5DB', borderRadius: 10, padding: '20px', textAlign: 'center', fontSize: 14, color: '#9CA3AF' }}>
              Nenhum cliente selecionado. Busque acima ou{' '}
              <a href="/pedido/clientes/novo" target="_blank" style={{ color: '#1B6E3C', fontWeight: 600 }}>cadastre um novo</a>.
            </div>
          )}
        </div>

        {/* ===== PRODUTOS ===== */}
        <div className="ped-card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1B6E3C' }}>📦 Produtos</h2>
            <button
              type="button"
              onClick={() => setModalAberto(true)}
              style={{
                background: '#1B6E3C', color: 'white', border: 'none',
                padding: '9px 20px', borderRadius: 9, fontWeight: 700, fontSize: 13,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: '0 2px 8px rgba(27,110,60,0.25)',
              }}
            >
              ＋ Adicionar Produto
            </button>
          </div>

          {itens.length === 0 ? (
            <div style={{
              background: '#F9FAFB', border: '1px dashed #D1D5DB', borderRadius: 12,
              padding: '36px', textAlign: 'center', color: '#9CA3AF',
            }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📦</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Nenhum produto adicionado.</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Clique em "Adicionar Produto" para começar.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <style>{`
                .item-grid {
                  display: grid;
                  grid-template-columns: 56px 1fr 70px 110px 110px 76px;
                  gap: 8px;
                  align-items: center;
                  background: #F8FAFC;
                  border-radius: 10px;
                  padding: 10px 6px;
                  border: 1px solid #E5E7EB;
                }
                .item-grid-header {
                  display: grid;
                  grid-template-columns: 56px 1fr 70px 110px 110px 76px;
                  gap: 8px;
                  padding: 0 6px 4px;
                }
                @media (max-width: 768px) {
                  .item-grid { grid-template-columns: 52px 1fr 76px !important; }
                  .item-grid-header { grid-template-columns: 52px 1fr 76px !important; }
                  .item-col-qtd, .item-col-unit, .item-col-total,
                  .item-col-header-qtd, .item-col-header-unit, .item-col-header-total {
                    display: none !important;
                  }
                }
              `}</style>

              {/* Cabeçalho da lista */}
              <div className="item-grid-header">
                <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 }}>Cód.</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 }}>Produto</div>
                <div className="item-col-header-qtd" style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 }}>Qtd.</div>
                <div className="item-col-header-unit" style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 }}>Vr. Unit.</div>
                <div className="item-col-header-total" style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 }}>Vr. Total</div>
                <div />
              </div>

              {itens.map((item, i) => (
                <div key={i} className="item-grid">
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7280' }}>{item.codigo}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1F2937' }}>{item.nome}</div>
                    {item.observacoes && (
                      <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2, fontStyle: 'italic' }}>
                        {item.observacoes}
                      </div>
                    )}
                  </div>
                  <div className="item-col-qtd" style={{ fontSize: 13, fontWeight: 700, color: '#1F2937', textAlign: 'center' }}>{item.quantidade}</div>
                  <div className="item-col-unit" style={{ fontSize: 13, color: '#6B7280', textAlign: 'right' }}>R$ {fmtBRL(item.vrUnitario)}</div>
                  <div className="item-col-total" style={{ fontSize: 13, fontWeight: 700, color: '#1B6E3C', textAlign: 'right' }}>R$ {fmtBRL(item.vrTotal)}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button type="button" onClick={() => abrirEdicao(i)} title="Editar item" style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #BFDBFE', background: '#EFF6FF', color: '#2563EB', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✏️</button>
                    <button type="button" onClick={() => removeItem(i)} title="Remover item" style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #FECACA', background: '#FEF2F2', color: '#DC2626', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===== TOTAIS ===== */}
        <div className="ped-card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, alignItems: 'end' }}>
            <div className="ped-form-group">
              <label>Desconto (R$)</label>
              <input
                type="number" step="0.01" min="0"
                value={desconto} onChange={e => setDesconto(e.target.value)}
                placeholder="0,00"
                style={{ border: '1.5px solid #D1D5DB', borderRadius: 6, padding: '10px 14px', fontSize: 14, outline: 'none', width: '100%' }}
              />
            </div>
            <div className="ped-form-group">
              <label>Observações gerais do pedido</label>
              <input
                value={observacoes} onChange={e => setObservacoes(e.target.value)}
                style={{ border: '1.5px solid #D1D5DB', borderRadius: 6, padding: '10px 14px', fontSize: 14, outline: 'none', width: '100%' }}
              />
            </div>
            <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 10, padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14, color: '#374151' }}>
                <span>Total Qtd:</span><strong>{totalItens}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14, color: '#374151' }}>
                <span>Total Produtos:</span><strong>R$ {fmtBRL(totalValor)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14, color: '#DC2626' }}>
                <span>Desconto:</span><strong>- R$ {fmtBRL(desconto)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid #86EFAC', fontSize: 16, color: '#1B6E3C', fontWeight: 800 }}>
                <span>Valor Final:</span><span>R$ {fmtBRL(valorFinal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTÃO EMITIR */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button type="button" onClick={handleLimpar} className="ped-btn-secondary">Cancelar</button>
          <button type="submit" style={{
            background: '#1B6E3C', color: 'white', border: 'none', padding: '14px 36px', borderRadius: 10,
            fontWeight: 800, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
            boxShadow: '0 4px 14px rgba(27,110,60,0.35)', letterSpacing: 0.5,
          }}>
            📥 EMITIR PEDIDO (PDF)
          </button>
        </div>
      </form>
    </div>
  )
}
