import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getClientes, deleteCliente } from '../../utils/storage'

export default function ListaClientes() {
  const [clientes, setClientes] = useState([])
  const [busca, setBusca]       = useState('')
  const [loading, setLoading]   = useState(true)
  const navigate = useNavigate()

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
          <table className="ped-table" style={{ minWidth: 700 }}>
            <thead>
              <tr>
                <th>Nome / Razão Social</th>
                <th>CNPJ/CPF</th>
                <th>Cidade / UF</th>
                <th>Contato</th>
                <th>WhatsApp</th>
                <th>PGT</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#1F2937', fontSize: 14 }}>{c.nome}</div>
                    {c.bairro && <div style={{ fontSize: 11, color: '#9CA3AF' }}>{c.bairro}</div>}
                  </td>
                  <td style={{ fontSize: 13 }}>{c.cnpjCpf || <span style={{ color: '#D1D5DB' }}>—</span>}</td>
                  <td style={{ fontSize: 13 }}>{c.cidade ? `${c.cidade} / ${c.estado}` : <span style={{ color: '#D1D5DB' }}>—</span>}</td>
                  <td style={{ fontSize: 13 }}>{c.contato || <span style={{ color: '#D1D5DB' }}>—</span>}</td>
                  <td style={{ fontSize: 13 }}>
                    {c.whatsapp
                      ? <a href={`https://wa.me/55${c.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ color: '#1B6E3C', fontWeight: 600 }}>{c.whatsapp}</a>
                      : <span style={{ color: '#D1D5DB' }}>—</span>}
                  </td>
                  <td>{c.pgt && <span className="ped-badge ped-badge-green">{c.pgt}</span>}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
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
