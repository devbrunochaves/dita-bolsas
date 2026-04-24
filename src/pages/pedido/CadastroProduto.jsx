import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { saveProduto, getProdutoById } from '../../utils/storage'

const INITIAL = { codigo: '', nome: '', valor: '' }

export default function CadastroProduto() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const [form, setForm]     = useState(INITIAL)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const isEdit = Boolean(id)

  useEffect(() => {
    if (id) {
      getProdutoById(id).then(p => { if (p) setForm(p) })
    }
  }, [id])

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.codigo.trim()) { alert('Código é obrigatório'); return }
    if (!form.nome.trim())   { alert('Nome é obrigatório');   return }
    if (!form.valor || isNaN(Number(form.valor))) { alert('Informe um valor válido'); return }
    setSaving(true)
    try {
      await saveProduto({ ...form, valor: Number(form.valor) })
      setSaved(true)
      setTimeout(() => navigate('/pedido/produtos'), 1500)
    } catch (err) {
      alert('Erro ao salvar: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <button onClick={() => navigate('/pedido/produtos')}
          style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
          ← Voltar
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#1F2937' }}>{isEdit ? '✏️ Editar Produto' : '📦 Novo Produto'}</h1>
        <p style={{ color: '#6B7280', fontSize: 13, marginTop: 2 }}>{isEdit ? 'Atualize os dados do produto.' : 'Cadastre um novo produto no sistema.'}</p>
      </div>

      {saved && (
        <div style={{ background: '#DCFCE7', border: '1px solid #86EFAC', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#166534', fontWeight: 600 }}>
          ✅ Produto {isEdit ? 'atualizado' : 'cadastrado'} com sucesso no banco de dados! Redirecionando...
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="ped-card">
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#1B6E3C', marginBottom: 20 }}>Dados do Produto</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="ped-form-group">
              <label>Código *</label>
              <input name="codigo" value={form.codigo} onChange={handleChange} placeholder="Ex: 1005" required
                style={{ border: '1.5px solid #D1D5DB', borderRadius: 6, padding: '10px 14px', fontSize: 14, outline: 'none', maxWidth: 200 }} />
              <span style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>Código único para identificar o produto nos pedidos.</span>
            </div>
            <div className="ped-form-group">
              <label>Nome do Produto *</label>
              <input name="nome" value={form.nome} onChange={handleChange} placeholder="Ex: Estojo Duplo - PERSONAGENS/LONA" required
                style={{ border: '1.5px solid #D1D5DB', borderRadius: 6, padding: '10px 14px', fontSize: 14, outline: 'none' }} />
            </div>
            <div className="ped-form-group">
              <label>Valor Unitário (R$) *</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#6B7280', fontWeight: 600 }}>R$</span>
                <input name="valor" type="number" step="0.01" min="0" value={form.valor} onChange={handleChange} placeholder="0,00" required
                  style={{ border: '1.5px solid #D1D5DB', borderRadius: 6, padding: '10px 14px', fontSize: 14, outline: 'none', maxWidth: 160 }} />
              </div>
            </div>
          </div>
        </div>

        {(form.codigo || form.nome || form.valor) && (
          <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 10, padding: '16px 20px', marginTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Preview no Pedido</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14 }}>
              <div>
                <span style={{ fontWeight: 700, color: '#1B6E3C', marginRight: 12 }}>{form.codigo || '----'}</span>
                <span style={{ color: '#374151' }}>{form.nome || 'Nome do produto'}</span>
              </div>
              <span style={{ fontWeight: 700, color: '#1F2937' }}>
                R$ {Number(form.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
          <button type="button" onClick={() => navigate('/pedido/produtos')} className="ped-btn-secondary">Cancelar</button>
          <button type="submit" disabled={saving} className="ped-btn-primary" style={{ padding: '12px 32px', fontSize: 15, opacity: saving ? 0.7 : 1 }}>
            {saving ? '⏳ Salvando...' : isEdit ? '💾 Salvar Alterações' : '✅ Cadastrar Produto'}
          </button>
        </div>
      </form>
    </div>
  )
}
