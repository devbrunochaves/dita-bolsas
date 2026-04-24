import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getProdutos, deleteProduto } from '../../utils/storage'

export default function ListaProdutos() {
  const [produtos, setProdutos] = useState([])
  const [busca, setBusca]       = useState('')
  const [loading, setLoading]   = useState(true)
  const navigate = useNavigate()

  async function refresh() {
    setLoading(true)
    const data = await getProdutos()
    setProdutos(data)
    setLoading(false)
  }

  useEffect(() => { refresh() }, [])

  const filtrados = produtos.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) || p.codigo.includes(busca)
  )

  async function handleDelete(id, nome) {
    if (!window.confirm(`Excluir o produto "${nome}"?`)) return
    await deleteProduto(id)
    refresh()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#1F2937' }}>Produtos</h1>
          <p style={{ color: '#6B7280', fontSize: 13, marginTop: 2 }}>{produtos.length} produto(s) cadastrado(s)</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por código ou nome..."
            style={{ border: '1.5px solid #D1D5DB', borderRadius: 8, padding: '9px 14px', fontSize: 14, outline: 'none', width: 240 }} />
          <Link to="/pedido/produtos/novo" className="ped-btn-primary">➕ Novo Produto</Link>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, flexDirection: 'column', gap: 16 }}>
          <div style={{ width: 32, height: 32, border: '3px solid #E5E7EB', borderTopColor: '#1B6E3C', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      ) : filtrados.length === 0 ? (
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E5E7EB', padding: '48px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#374151', marginBottom: 8 }}>
            {busca ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
          </h3>
          <p style={{ color: '#9CA3AF', fontSize: 14, marginBottom: 20 }}>
            {busca ? `Nenhum resultado para "${busca}"` : 'Cadastre produtos para agilizar seus pedidos.'}
          </p>
          {!busca && <Link to="/pedido/produtos/novo" className="ped-btn-primary">Cadastrar Primeiro Produto</Link>}
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <table className="ped-table">
            <thead>
              <tr>
                <th style={{ width: 100 }}>Código</th>
                <th>Nome do Produto</th>
                <th style={{ width: 160, textAlign: 'right' }}>Valor Unitário</th>
                <th style={{ width: 130, textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(p => (
                <tr key={p.id}>
                  <td>
                    <span style={{ fontWeight: 800, color: '#1B6E3C', fontSize: 14, background: '#E8F5ED', padding: '3px 10px', borderRadius: 100 }}>
                      {p.codigo}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500, color: '#1F2937' }}>{p.nome}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#1F2937', fontSize: 15 }}>
                    R$ {Number(p.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button onClick={() => navigate(`/pedido/produtos/editar/${p.id}`)}
                        style={{ background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                        Editar
                      </button>
                      <button onClick={() => handleDelete(p.id, p.nome)}
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
      <div style={{ marginTop: 16, background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#1E40AF' }}>
        💡 Ao digitar o <strong>código</strong> de um produto em "Emitir Pedido", o nome e valor são preenchidos automaticamente do banco de dados.
      </div>
    </div>
  )
}
