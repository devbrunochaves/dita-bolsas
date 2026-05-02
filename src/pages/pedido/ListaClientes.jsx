import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getClientes, deleteCliente } from '../../utils/storage'
import { useAuth } from '../../contexts/AuthContext'

// ── Linha de detalhe no modal ────────────────────────────────
function DetalheItem({ label, value, href }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </span>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer"
          style={{ fontSize: 14, color: '#1B6E3C', fontWeight: 600, textDecoration: 'none' }}>
          {value}
        </a>
      ) : (
        <span style={{ fontSize: 14, color: '#1F2937', fontWeight: 500 }}>{value}</span>
      )}
    </div>
  )
}

// ── Seção do modal ───────────────────────────────────────────
function Secao({ titulo, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#1B6E3C', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, paddingBottom: 6, borderBottom: '1px solid #F3F4F6' }}>
        {titulo}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {children}
      </div>
    </div>
  )
}

// ── Modal de detalhes do cliente ─────────────────────────────
function ClienteModal({ cliente, onClose, onEditar }) {
  if (!cliente) return null

  const enderecoCompleto = [cliente.endereco, cliente.bairro, cliente.cidade && `${cliente.cidade}/${cliente.estado}`]
    .filter(Boolean).join(', ')

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px',
      }}
    >
      <div style={{
        background: 'white', borderRadius: 18, width: '100%', maxWidth: 560,
        boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
        display: 'flex', flexDirection: 'column', maxHeight: '90vh',
      }}>

        {/* Cabeçalho */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid #F3F4F6',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'linear-gradient(135deg, #1B6E3C, #2d9d5c)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, color: 'white', fontWeight: 700, flexShrink: 0,
              }}>
                {(cliente.nome || '?')[0].toUpperCase()}
              </div>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: '#1F2937', lineHeight: 1.2 }}>
                  {cliente.nome}
                </h2>
                {cliente.cidade && (
                  <span style={{ fontSize: 12, color: '#9CA3AF' }}>
                    {cliente.cidade} / {cliente.estado}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button
              onClick={onEditar}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 8,
                background: '#EFF6FF', color: '#2563EB',
                border: '1px solid #BFDBFE',
                fontWeight: 700, fontSize: 13, cursor: 'pointer',
              }}
            >
              ✏️ Editar
            </button>
            <button
              onClick={onClose}
              style={{
                width: 34, height: 34, borderRadius: 8,
                border: '1px solid #E5E7EB', background: '#F9FAFB',
                color: '#6B7280', cursor: 'pointer', fontSize: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Corpo com scroll */}
        <div style={{ padding: '20px 24px', overflowY: 'auto' }}>

          <Secao titulo="Informações Gerais">
            <div style={{ gridColumn: 'span 2' }}>
              <DetalheItem label="Nome / Razão Social" value={cliente.nome} />
            </div>
            <DetalheItem label="CNPJ / CPF"          value={cliente.cnpjCpf} />
            <DetalheItem label="Contato (responsável)" value={cliente.contato} />
            <DetalheItem label="Email"                value={cliente.email}
              href={cliente.email ? `mailto:${cliente.email}` : null} />
            <DetalheItem label="Pagamento padrão"     value={cliente.pgt} />
          </Secao>

          <Secao titulo="Endereço">
            {enderecoCompleto ? (
              <div style={{ gridColumn: 'span 2' }}>
                <DetalheItem label="Endereço completo" value={enderecoCompleto} />
              </div>
            ) : (
              <div style={{ gridColumn: 'span 2', color: '#9CA3AF', fontSize: 13, fontStyle: 'italic' }}>
                Endereço não informado
              </div>
            )}
          </Secao>

          <Secao titulo="Telefones">
            <DetalheItem label="Telefone" value={cliente.telefone} />
            <DetalheItem
              label="WhatsApp"
              value={cliente.whatsapp}
              href={cliente.whatsapp ? `https://wa.me/55${cliente.whatsapp.replace(/\D/g, '')}` : null}
            />
          </Secao>

        </div>
      </div>
    </div>
  )
}

// ── Página principal ─────────────────────────────────────────
export default function ListaClientes() {
  const [clientes, setClientes]       = useState([])
  const [busca, setBusca]             = useState('')
  const [loading, setLoading]         = useState(true)
  const [clienteSelecionado, setClienteSelecionado] = useState(null)
  const navigate = useNavigate()
  const { isAdmin } = useAuth()

  async function refresh() {
    setLoading(true)
    const data = await getClientes()
    setClientes(data)
    setLoading(false)
  }

  useEffect(() => { refresh() }, [])

  const filtrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (c.cidade && c.cidade.toLowerCase().includes(busca.toLowerCase())) ||
    (c.cnpjCpf && c.cnpjCpf.includes(busca))
  )

  async function handleDelete(id, nome) {
    if (!window.confirm(`Excluir o cliente "${nome}"?`)) return
    await deleteCliente(id)
    refresh()
  }

  return (
    <div>
      {clienteSelecionado && (
        <ClienteModal
          cliente={clienteSelecionado}
          onClose={() => setClienteSelecionado(null)}
          onEditar={() => navigate(`/pedido/clientes/editar/${clienteSelecionado.id}`)}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#1F2937' }}>Clientes</h1>
          <p style={{ color: '#6B7280', fontSize: 13, marginTop: 2 }}>{clientes.length} cliente(s) cadastrado(s)</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por nome, cidade..."
            style={{ border: '1.5px solid #D1D5DB', borderRadius: 8, padding: '9px 14px', fontSize: 14, outline: 'none', width: 240 }} />
          <Link to="/pedido/clientes/novo" className="ped-btn-primary">➕ Novo Cliente</Link>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, flexDirection: 'column', gap: 16 }}>
          <div style={{ width: 32, height: 32, border: '3px solid #E5E7EB', borderTopColor: '#1B6E3C', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      ) : filtrados.length === 0 ? (
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E5E7EB', padding: '48px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#374151', marginBottom: 8 }}>
            {busca ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
          </h3>
          <p style={{ color: '#9CA3AF', fontSize: 14, marginBottom: 20 }}>
            {busca ? `Nenhum resultado para "${busca}"` : 'Comece cadastrando seu primeiro cliente.'}
          </p>
          {!busca && <Link to="/pedido/clientes/novo" className="ped-btn-primary">Cadastrar Primeiro Cliente</Link>}
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'auto', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <table className="ped-table" style={{ minWidth: isAdmin ? 820 : 700 }}>
            <thead>
              <tr>
                <th>Nome / Razão Social</th>
                <th>CNPJ/CPF</th>
                <th>Cidade / UF</th>
                <th>Contato</th>
                <th>WhatsApp</th>
                {isAdmin && <th>Cadastrado por</th>}
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(c => (
                <tr
                  key={c.id}
                  onClick={() => setClienteSelecionado(c)}
                  style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                  <td>
                    <div style={{ fontWeight: 700, color: '#1B6E3C', fontSize: 14, textDecoration: 'underline', textDecorationColor: 'transparent', transition: 'text-decoration-color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.textDecorationColor = '#1B6E3C'}
                      onMouseLeave={e => e.currentTarget.style.textDecorationColor = 'transparent'}
                    >
                      {c.nome}
                    </div>
                    {c.bairro && <div style={{ fontSize: 11, color: '#9CA3AF' }}>{c.bairro}</div>}
                  </td>
                  <td style={{ fontSize: 13 }}>{c.cnpjCpf || <span style={{ color: '#D1D5DB' }}>—</span>}</td>
                  <td style={{ fontSize: 13 }}>{c.cidade ? `${c.cidade} / ${c.estado}` : <span style={{ color: '#D1D5DB' }}>—</span>}</td>
                  <td style={{ fontSize: 13 }}>{c.contato || <span style={{ color: '#D1D5DB' }}>—</span>}</td>
                  <td style={{ fontSize: 13 }}>
                    {c.whatsapp
                      ? <a href={`https://wa.me/55${c.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{ color: '#1B6E3C', fontWeight: 600 }}>{c.whatsapp}</a>
                      : <span style={{ color: '#D1D5DB' }}>—</span>}
                  </td>
                  {isAdmin && (
                    <td style={{ fontSize: 13 }}>
                      {c.cadastradoPor ? (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          background: '#F0FDF4', border: '1px solid #86EFAC',
                          color: '#166534', borderRadius: 100,
                          padding: '3px 10px', fontSize: 11, fontWeight: 700,
                        }}>
                          👤 {c.cadastradoPor}
                        </span>
                      ) : (
                        <span style={{ color: '#D1D5DB', fontSize: 12, fontStyle: 'italic' }}>antigo</span>
                      )}
                    </td>
                  )}
                  <td>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
                      <button onClick={() => navigate(`/pedido/clientes/editar/${c.id}`)}
                        style={{ background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                        Editar
                      </button>
                      <button onClick={() => handleDelete(c.id, c.nome)}
                        style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
