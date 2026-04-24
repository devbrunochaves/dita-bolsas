import { useEffect, useState, useCallback } from 'react'
import { getPedidos } from '../../utils/storage'
import { StatusSelect, StatusBadge, STATUS_CONFIG, STATUS_LIST } from '../../components/StatusSelect'

export default function PedidosEmitidos() {
  const [pedidos, setPedidos]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [filtroStatus, setFiltroStatus] = useState('TODOS')
  const [busca, setBusca]             = useState('')

  useEffect(() => {
    getPedidos().then(data => { setPedidos(data); setLoading(false) })
  }, [])

  const handleStatusChange = useCallback((id, novoStatus) => {
    setPedidos(prev => prev.map(p => p.id === id ? { ...p, status: novoStatus } : p))
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
      {/* Cabeçalho */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#1F2937' }}>Pedidos Emitidos</h1>
        <p style={{ color: '#6B7280', fontSize: 13, marginTop: 2 }}>
          {pedidos.length} pedido(s) no total
        </p>
      </div>

      {/* Filtros de status */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {/* Botão TODOS */}
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

        {/* Botões por status */}
        {STATUS_LIST.map(s => {
          const cfg    = STATUS_CONFIG[s]
          const ativo  = filtroStatus === s
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
            {busca ? `Sem resultados para "${busca}"` : filtroStatus !== 'TODOS' ? `Nenhum pedido com status "${filtroStatus}"` : 'Emita seu primeiro pedido pelo menu lateral.'}
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
                <tr key={p.id}>
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
                  <td>
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
