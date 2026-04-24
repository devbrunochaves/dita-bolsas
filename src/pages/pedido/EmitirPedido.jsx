import { useState, useEffect, useRef } from 'react'
import { getClientes, getProdutos, getProdutoByCodigo, savePedido } from '../../utils/storage'
import { gerarPedidoPDF } from '../../utils/pdf'

const EMPTY_ITEM = { codigo: '', nome: '', quantidade: '', vrUnitario: '', vrTotal: '' }

export default function EmitirPedido() {
  const [clientes, setClientes]             = useState([])
  const [produtos, setProdutos]             = useState([])
  const [clienteBusca, setClienteBusca]     = useState('')
  const [clienteSelecionado, setClienteSelecionado] = useState(null)
  const [clienteDropdown, setClienteDropdown] = useState(false)
  const [itens, setItens]                   = useState([{ ...EMPTY_ITEM }])
  const [desconto, setDesconto]             = useState('')
  const [observacoes, setObservacoes]       = useState('Orçamento válido pelo período de 30 dias')
  const [success, setSuccess]               = useState(false)
  const [loading, setLoading]               = useState(true)
  const dropdownRef = useRef(null)

  useEffect(() => {
    async function load() {
      const [c, p] = await Promise.all([getClientes(), getProdutos()])
      setClientes(c)
      setProdutos(p)
      setLoading(false)
    }
    load()
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  function handleOutside(e) {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setClienteDropdown(false)
  }

  // Autocomplete de cliente
  const clientesFiltrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(clienteBusca.toLowerCase()) ||
    (c.cnpjCpf && c.cnpjCpf.includes(clienteBusca))
  ).slice(0, 8)

  function selecionarCliente(c) {
    setClienteSelecionado(c)
    setClienteBusca(c.nome)
    setClienteDropdown(false)
  }

  // Quando muda código — busca produto no banco
  async function handleCodigoChange(index, codigo) {
    let prod = null
    if (codigo.trim()) {
      prod = await getProdutoByCodigo(codigo.trim())
    }
    setItens(prev => {
      const updated = [...prev]
      const qty = Number(updated[index].quantidade) || 0
      const valor = prod ? Number(prod.valor) : 0
      updated[index] = {
        ...updated[index],
        codigo,
        nome:        prod?.nome || '',
        vrUnitario:  prod ? String(prod.valor) : '',
        vrTotal:     prod && qty ? String((qty * valor).toFixed(2)) : '',
      }
      return updated
    })
  }

  function handleItemChange(index, field, value) {
    setItens(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      if (field === 'quantidade' || field === 'vrUnitario') {
        const qty   = field === 'quantidade' ? Number(value) : Number(updated[index].quantidade)
        const price = field === 'vrUnitario' ? Number(value) : Number(updated[index].vrUnitario)
        if (!isNaN(qty) && !isNaN(price)) updated[index].vrTotal = String((qty * price).toFixed(2))
      }
      return updated
    })
  }

  function addItem() { setItens(prev => [...prev, { ...EMPTY_ITEM }]) }
  function removeItem(index) { setItens(prev => prev.filter((_, i) => i !== index)) }

  const totalItens  = itens.reduce((s, i) => s + (Number(i.quantidade) || 0), 0)
  const totalValor  = itens.reduce((s, i) => s + (Number(i.vrTotal)    || 0), 0)
  const valorFinal  = Math.max(0, totalValor - Number(desconto || 0))
  const fmtBRL = v  => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  async function handleEmitir(e) {
    e.preventDefault()
    if (!clienteSelecionado) { alert('Selecione um cliente antes de emitir.'); return }
    const itensFilled = itens.filter(i => (i.codigo || i.nome) && i.quantidade)
    if (!itensFilled.length) { alert('Adicione pelo menos um produto com quantidade.'); return }

    const pedido = {
      cliente:     clienteSelecionado,
      itens:       itensFilled,
      desconto:    Number(desconto || 0),
      valorFinal,
      observacoes,
      data:        new Date().toISOString(),
    }

    await savePedido(pedido)
    gerarPedidoPDF(pedido)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 4000)
  }

  function handleLimpar() {
    if (!window.confirm('Limpar todos os dados do pedido?')) return
    setClienteBusca(''); setClienteSelecionado(null)
    setItens([{ ...EMPTY_ITEM }]); setDesconto('')
    setObservacoes('Orçamento válido pelo período de 30 dias')
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#1F2937' }}>Emitir Pedido / Orçamento</h1>
          <p style={{ color: '#6B7280', fontSize: 13, marginTop: 2 }}>Preencha os dados e clique em "Emitir Pedido" para gerar o PDF.</p>
        </div>
        <button onClick={handleLimpar} className="ped-btn-secondary" type="button">🗑️ Limpar</button>
      </div>

      {success && (
        <div style={{ background: '#DCFCE7', border: '1px solid #86EFAC', borderRadius: 10, padding: '14px 18px', marginBottom: 20, color: '#166534', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}>
          ✅ Pedido salvo no banco de dados e PDF gerado com sucesso!
        </div>
      )}

      <form onSubmit={handleEmitir}>
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
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1B6E3C', marginBottom: 16 }}>📦 Produtos</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 90px 130px 120px 36px', gap: 8, marginBottom: 8, padding: '0 4px' }}>
            {['Código', 'Nome do Produto', 'Qtd', 'Vr. Unitário (R$)', 'Vr. Total', ''].map(h => (
              <div key={h} style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {itens.map((item, index) => (
              <div key={index} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 90px 130px 120px 36px', gap: 8, alignItems: 'center' }}>
                <input value={item.codigo} onChange={e => handleCodigoChange(index, e.target.value)}
                  placeholder="Cód." list={`prod-list-${index}`}
                  style={{ border: '1.5px solid #D1D5DB', borderRadius: 6, padding: '8px 10px', fontSize: 13, outline: 'none', width: '100%' }} />
                <datalist id={`prod-list-${index}`}>
                  {produtos.map(p => <option key={p.id} value={p.codigo}>{p.nome}</option>)}
                </datalist>
                <input value={item.nome} onChange={e => handleItemChange(index, 'nome', e.target.value)}
                  placeholder="Nome do produto"
                  style={{ border: '1.5px solid #D1D5DB', borderRadius: 6, padding: '8px 10px', fontSize: 13, outline: 'none', width: '100%' }} />
                <input type="number" min="1" value={item.quantidade} onChange={e => handleItemChange(index, 'quantidade', e.target.value)}
                  placeholder="0"
                  style={{ border: '1.5px solid #D1D5DB', borderRadius: 6, padding: '8px 10px', fontSize: 13, outline: 'none', width: '100%', textAlign: 'center' }} />
                <input type="number" step="0.01" min="0" value={item.vrUnitario} onChange={e => handleItemChange(index, 'vrUnitario', e.target.value)}
                  placeholder="0,00"
                  style={{ border: '1.5px solid #D1D5DB', borderRadius: 6, padding: '8px 10px', fontSize: 13, outline: 'none', width: '100%', textAlign: 'right' }} />
                <div style={{ background: '#F3F4F6', borderRadius: 6, padding: '8px 10px', fontSize: 13, fontWeight: 600, color: '#1F2937', textAlign: 'right', border: '1px solid #E5E7EB' }}>
                  R$ {fmtBRL(item.vrTotal)}
                </div>
                <button type="button" onClick={() => removeItem(index)}
                  style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid #FECACA', background: '#FEF2F2', color: '#DC2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                  ×
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addItem} className="ped-btn-secondary" style={{ marginTop: 12 }}>+ Adicionar linha</button>
        </div>

        {/* ===== TOTAIS ===== */}
        <div className="ped-card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, alignItems: 'end' }}>
            <div className="ped-form-group">
              <label>Desconto (R$)</label>
              <input type="number" step="0.01" min="0" value={desconto} onChange={e => setDesconto(e.target.value)} placeholder="0,00"
                style={{ border: '1.5px solid #D1D5DB', borderRadius: 6, padding: '10px 14px', fontSize: 14, outline: 'none', width: '100%' }} />
            </div>
            <div className="ped-form-group">
              <label>Observações</label>
              <input value={observacoes} onChange={e => setObservacoes(e.target.value)}
                style={{ border: '1.5px solid #D1D5DB', borderRadius: 6, padding: '10px 14px', fontSize: 14, outline: 'none', width: '100%' }} />
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

        {/* BOTÃO */}
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
