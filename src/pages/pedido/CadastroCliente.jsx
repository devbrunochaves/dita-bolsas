import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { saveCliente, getClienteById } from '../../utils/storage'

const ESTADOS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']
const PGTS    = ['BOLETO', 'PIX', 'CARTÃO CRÉDITO', 'CARTÃO DÉBITO', 'DINHEIRO', 'CHEQUE', 'TRANSFERÊNCIA', 'A PRAZO']
const INITIAL = { nome: '', cnpjCpf: '', endereco: '', telefone: '', bairro: '', cidade: '', estado: 'ES', whatsapp: '', contato: '', email: '', pgt: 'BOLETO' }

// ── Definido FORA do componente para evitar remontagem a cada keystroke ──
function Field({ label, name, type = 'text', placeholder, options, value, onChange }) {
  return (
    <div className="ped-form-group">
      <label>{label}</label>
      {options ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          style={{ border: '1.5px solid #D1D5DB', borderRadius: 6, padding: '10px 14px', fontSize: 14, outline: 'none', background: 'white' }}
        >
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{ border: '1.5px solid #D1D5DB', borderRadius: 6, padding: '10px 14px', fontSize: 14, outline: 'none' }}
        />
      )}
    </div>
  )
}

export default function CadastroCliente() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const [form, setForm]     = useState(INITIAL)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const isEdit = Boolean(id)

  useEffect(() => {
    if (id) {
      getClienteById(id).then(c => { if (c) setForm(c) })
    }
  }, [id])

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await saveCliente({ ...form })
      setSaved(true)
      setTimeout(() => navigate('/pedido/clientes'), 1500)
    } catch (err) {
      alert('Erro ao salvar: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <button
          onClick={() => navigate('/pedido/clientes')}
          style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}
        >
          ← Voltar
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#1F2937' }}>
          {isEdit ? '✏️ Editar Cliente' : '➕ Novo Cliente'}
        </h1>
        <p style={{ color: '#6B7280', fontSize: 13, marginTop: 2 }}>
          {isEdit ? 'Atualize os dados do cliente.' : 'Preencha os dados do novo cliente.'}
        </p>
      </div>

      {saved && (
        <div style={{ background: '#DCFCE7', border: '1px solid #86EFAC', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#166534', fontWeight: 600 }}>
          ✅ Cliente {isEdit ? 'atualizado' : 'cadastrado'} com sucesso no banco de dados! Redirecionando...
        </div>
      )}

      <form onSubmit={handleSubmit}>

        {/* Informações Gerais */}
        <div className="ped-card">
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#1B6E3C', marginBottom: 20 }}>Informações Gerais</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ gridColumn: 'span 2' }}>
              <Field label="Nome / Razão Social *" name="nome" placeholder="Nome completo ou razão social" value={form.nome} onChange={handleChange} />
            </div>
            <Field label="CNPJ ou CPF"            name="cnpjCpf"  placeholder="XX.XXX.XXX/XXXX-XX"   value={form.cnpjCpf}  onChange={handleChange} />
            <Field label="Contato (responsável)"   name="contato"  placeholder="Nome do responsável"   value={form.contato}  onChange={handleChange} />
            <Field label="Email"                   name="email"    placeholder="email@empresa.com"      value={form.email}    onChange={handleChange} type="email" />
            <Field label="Pagamento padrão"        name="pgt"      options={PGTS}                       value={form.pgt}      onChange={handleChange} />
          </div>
        </div>

        {/* Endereço */}
        <div className="ped-card" style={{ marginTop: 16 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#1B6E3C', marginBottom: 20 }}>Endereço</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ gridColumn: 'span 2' }}>
              <Field label="Endereço" name="endereco" placeholder="Rua, número, complemento" value={form.endereco} onChange={handleChange} />
            </div>
            <Field label="Bairro"  name="bairro"  placeholder="Bairro"  value={form.bairro}  onChange={handleChange} />
            <Field label="Cidade"  name="cidade"  placeholder="Cidade"  value={form.cidade}  onChange={handleChange} />
            <Field label="Estado"  name="estado"  options={ESTADOS}     value={form.estado}  onChange={handleChange} />
          </div>
        </div>

        {/* Telefones */}
        <div className="ped-card" style={{ marginTop: 16 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#1B6E3C', marginBottom: 20 }}>Telefones</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Telefone"  name="telefone"  placeholder="(27) 3xxx-xxxx"   value={form.telefone}  onChange={handleChange} />
            <Field label="WhatsApp"  name="whatsapp"  placeholder="(27) 9xxxx-xxxx"  value={form.whatsapp}  onChange={handleChange} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
          <button type="button" onClick={() => navigate('/pedido/clientes')} className="ped-btn-secondary">
            Cancelar
          </button>
          <button type="submit" disabled={saving} className="ped-btn-primary" style={{ padding: '12px 32px', fontSize: 15, opacity: saving ? 0.7 : 1 }}>
            {saving ? '⏳ Salvando...' : isEdit ? '💾 Salvar Alterações' : '✅ Cadastrar Cliente'}
          </button>
        </div>

      </form>
    </div>
  )
}
