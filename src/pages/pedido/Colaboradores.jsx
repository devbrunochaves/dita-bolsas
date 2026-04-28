import { useEffect, useState } from 'react'
import { getProfiles, updateProfile, criarColaborador } from '../../utils/storage'
import { useAuth } from '../../contexts/AuthContext'

const TIPO_CONFIG = {
  admin:    { label: 'Admin',    bg: '#DCFCE7', color: '#166534', border: '#86EFAC' },
  vendedor: { label: 'Vendedor', bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
}

const inputStyle = {
  width: '100%', border: '1.5px solid #D1D5DB', borderRadius: 8,
  padding: '10px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box',
}
const labelStyle = {
  fontSize: 12, fontWeight: 700, color: '#374151', display: 'block',
  marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5,
}

// ── Modal criar colaborador ──────────────────────────────────
function ModalCriar({ onClose, onCriado }) {
  const [nome, setNome]               = useState('')
  const [email, setEmail]             = useState('')
  const [senha, setSenha]             = useState('')
  const [tipo, setTipo]               = useState('vendedor')
  const [comissao, setComissao]       = useState('')
  const [loading, setLoading]         = useState(false)
  const [erro, setErro]               = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!nome || !email || !senha) return
    setErro(''); setLoading(true)
    try {
      await criarColaborador({
        email, password: senha, nome, tipo,
        comissaoPercentual: Number(comissao || 0),
      })
      onCriado()
      onClose()
    } catch (err) {
      setErro(err.message || 'Erro ao criar colaborador.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px',
    }}>
      <div style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1F2937' }}>👤 Novo Colaborador</h3>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E5E7EB', background: '#F9FAFB', color: '#6B7280', cursor: 'pointer', fontSize: 18 }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { label: 'Nome completo', value: nome, set: setNome, type: 'text', placeholder: 'Maria Silva' },
            { label: 'Email',         value: email, set: setEmail, type: 'email', placeholder: 'maria@email.com' },
            { label: 'Senha inicial', value: senha, set: setSenha, type: 'password', placeholder: '••••••••' },
          ].map(({ label, value, set, type, placeholder }) => (
            <div key={label}>
              <label style={labelStyle}>{label}</label>
              <input type={type} value={value} onChange={e => set(e.target.value)}
                placeholder={placeholder} required style={inputStyle} />
            </div>
          ))}

          {/* Tipo de acesso */}
          <div>
            <label style={labelStyle}>Tipo de acesso</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {['vendedor', 'admin'].map(t => (
                <button key={t} type="button" onClick={() => setTipo(t)} style={{
                  flex: 1, padding: '10px', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  border: `1.5px solid ${tipo === t ? TIPO_CONFIG[t].border : '#E5E7EB'}`,
                  background: tipo === t ? TIPO_CONFIG[t].bg : 'white',
                  color: tipo === t ? TIPO_CONFIG[t].color : '#6B7280',
                }}>
                  {TIPO_CONFIG[t].label}
                </button>
              ))}
            </div>
          </div>

          {/* Comissão */}
          <div>
            <label style={labelStyle}>Percentual de Comissão (%)</label>
            <div style={{ position: 'relative' }}>
              <input
                type="number" min="0" max="100" step="0.1"
                value={comissao}
                onChange={e => setComissao(e.target.value)}
                placeholder="0"
                style={{ ...inputStyle, paddingRight: 36 }}
              />
              <span style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                fontSize: 14, fontWeight: 700, color: '#9CA3AF',
              }}>%</span>
            </div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>
              Deixe 0 se não recebe comissão. Ex: 8, 10, 12.5
            </div>
          </div>

          {erro && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#DC2626' }}>
              ⚠️ {erro}
            </div>
          )}

          <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#92400E' }}>
            ℹ️ O colaborador poderá fazer login imediatamente com a senha definida acima.
          </div>

          <button type="submit" disabled={loading} style={{
            background: loading ? '#9CA3AF' : '#1B6E3C', color: 'white', border: 'none',
            padding: '12px', borderRadius: 10, fontWeight: 800, fontSize: 14,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}>
            {loading ? 'Criando...' : 'Criar Colaborador'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Modal editar colaborador ─────────────────────────────────
function ModalEditar({ colaborador, onClose, onSalvo }) {
  const [nome, setNome]         = useState(colaborador.nome || '')
  const [tipo, setTipo]         = useState(colaborador.tipo || 'vendedor')
  const [comissao, setComissao] = useState(String(colaborador.comissao_percentual ?? ''))
  const [loading, setLoading]   = useState(false)
  const { profile: meProfile }  = useAuth()

  async function handleSalvar() {
    setLoading(true)
    try {
      await updateProfile(colaborador.id, {
        nome,
        tipo,
        comissao_percentual: Number(comissao || 0),
      })
      onSalvo()
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const ehEuMesmo = meProfile?.id === colaborador.id

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px',
    }}>
      <div style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1F2937' }}>✏️ Editar Colaborador</h3>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E5E7EB', background: '#F9FAFB', color: '#6B7280', cursor: 'pointer', fontSize: 18 }}>×</button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Nome */}
          <div>
            <label style={labelStyle}>Nome</label>
            <input value={nome} onChange={e => setNome(e.target.value)} style={inputStyle} />
          </div>

          {/* Tipo */}
          <div>
            <label style={labelStyle}>Tipo de acesso</label>
            {ehEuMesmo ? (
              <div style={{ fontSize: 12, color: '#9CA3AF', fontStyle: 'italic' }}>
                Você não pode alterar o próprio tipo.
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 10 }}>
                {['vendedor', 'admin'].map(t => (
                  <button key={t} type="button" onClick={() => setTipo(t)} style={{
                    flex: 1, padding: '10px', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer',
                    border: `1.5px solid ${tipo === t ? TIPO_CONFIG[t].border : '#E5E7EB'}`,
                    background: tipo === t ? TIPO_CONFIG[t].bg : 'white',
                    color: tipo === t ? TIPO_CONFIG[t].color : '#6B7280',
                  }}>
                    {TIPO_CONFIG[t].label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Comissão */}
          <div>
            <label style={labelStyle}>Percentual de Comissão (%)</label>
            <div style={{ position: 'relative' }}>
              <input
                type="number" min="0" max="100" step="0.1"
                value={comissao}
                onChange={e => setComissao(e.target.value)}
                placeholder="0"
                style={{ ...inputStyle, paddingRight: 36 }}
              />
              <span style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                fontSize: 14, fontWeight: 700, color: '#9CA3AF',
              }}>%</span>
            </div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>
              ⚠️ Alterar aqui não afeta pedidos já emitidos — apenas os novos.
            </div>
          </div>

          <button onClick={handleSalvar} disabled={loading} style={{
            background: loading ? '#9CA3AF' : '#1B6E3C', color: 'white', border: 'none',
            padding: '12px', borderRadius: 10, fontWeight: 800, fontSize: 14,
            cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4,
          }}>
            {loading ? 'Salvando...' : '💾 Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Toggle ativo/inativo ─────────────────────────────────────
function ToggleAtivo({ ativo, disabled, loading, onToggle }) {
  const isOn = ativo !== false
  return (
    <button
      onClick={onToggle}
      disabled={disabled || loading}
      title={disabled ? 'Você não pode desativar sua própria conta' : isOn ? 'Clique para desativar' : 'Clique para reativar'}
      style={{
        position: 'relative', width: 54, height: 28, borderRadius: 14, border: 'none',
        background: disabled ? '#D1D5DB' : loading ? '#9CA3AF' : isOn ? '#16A34A' : '#DC2626',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        transition: 'background 0.25s', padding: 0, flexShrink: 0, outline: 'none',
      }}
    >
      <span style={{
        position: 'absolute', top: '50%', transform: 'translateY(-50%)',
        fontSize: 11, fontWeight: 800, color: 'white',
        left: isOn ? 8 : undefined, right: isOn ? undefined : 8, lineHeight: 1, userSelect: 'none',
      }}>
        {isOn ? '✓' : '✕'}
      </span>
      <span style={{
        position: 'absolute', top: 3, left: isOn ? 'calc(100% - 25px)' : 3,
        width: 22, height: 22, borderRadius: '50%', background: 'white',
        boxShadow: '0 1px 4px rgba(0,0,0,0.25)', transition: 'left 0.25s',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {loading && (
          <span style={{
            width: 10, height: 10, border: '2px solid #D1D5DB',
            borderTopColor: '#6B7280', borderRadius: '50%', display: 'block',
            animation: 'spin 0.6s linear infinite',
          }} />
        )}
      </span>
    </button>
  )
}

// ── Página principal ─────────────────────────────────────────
export default function Colaboradores() {
  const [profiles, setProfiles]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [modalCriar, setModalCriar] = useState(false)
  const [editando, setEditando]     = useState(null)
  const [toggling, setToggling]     = useState(new Set())
  const { profile: meProfile }      = useAuth()

  async function carregar() {
    setLoading(true)
    try { setProfiles(await getProfiles()) }
    finally { setLoading(false) }
  }

  async function handleToggleAtivo(p) {
    const novoAtivo = p.ativo === false ? true : false
    setProfiles(prev => prev.map(x => x.id === p.id ? { ...x, ativo: novoAtivo } : x))
    setToggling(prev => new Set([...prev, p.id]))
    try {
      await updateProfile(p.id, { ativo: novoAtivo })
    } catch {
      setProfiles(prev => prev.map(x => x.id === p.id ? { ...x, ativo: p.ativo } : x))
    } finally {
      setToggling(prev => { const s = new Set(prev); s.delete(p.id); return s })
    }
  }

  useEffect(() => { carregar() }, [])

  return (
    <div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      {modalCriar && <ModalCriar onClose={() => setModalCriar(false)} onCriado={carregar} />}
      {editando && <ModalEditar colaborador={editando} onClose={() => setEditando(null)} onSalvo={carregar} />}

      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#1F2937' }}>Colaboradores</h1>
          <p style={{ color: '#6B7280', fontSize: 13, marginTop: 2 }}>{profiles.length} usuário(s) cadastrado(s)</p>
        </div>
        <button
          onClick={() => setModalCriar(true)}
          style={{ background: '#1B6E3C', color: 'white', border: 'none', padding: '9px 20px', borderRadius: 9, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 2px 8px rgba(27,110,60,0.25)' }}
        >
          ＋ Novo Colaborador
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, flexDirection: 'column', gap: 16 }}>
          <div style={{ width: 32, height: 32, border: '3px solid #E5E7EB', borderTopColor: '#1B6E3C', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'auto', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                {['Nome', 'Email', 'Tipo', 'Comissão', 'Desde', 'Ações'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {profiles.map(p => {
                const cfg    = TIPO_CONFIG[p.tipo] || TIPO_CONFIG.vendedor
                const ehEu   = meProfile?.id === p.id
                const isAtivo = p.ativo !== false
                const comissao = Number(p.comissao_percentual || 0)
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid #F3F4F6', opacity: isAtivo ? 1 : 0.55 }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ fontWeight: 600, color: isAtivo ? '#1F2937' : '#6B7280', fontSize: 14 }}>
                          {p.nome || '—'}
                        </div>
                        {ehEu && <span style={{ fontSize: 11, color: '#9CA3AF', fontStyle: 'italic' }}>(você)</span>}
                        {!isAtivo && <span style={{ fontSize: 10, fontWeight: 700, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 6, padding: '2px 6px' }}>INATIVO</span>}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#6B7280' }}>{p.email || '—'}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color }} />
                        {cfg.label}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {comissao > 0 ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 100, fontSize: 12, fontWeight: 700, color: '#92400E', background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                          💰 {comissao.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}%
                        </span>
                      ) : (
                        <span style={{ fontSize: 13, color: '#D1D5DB' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 12, color: '#9CA3AF' }}>
                      {p.created_at ? new Date(p.created_at).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <button
                          onClick={() => setEditando(p)}
                          style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#F9FAFB', color: '#374151', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                        >
                          ✏️ Editar
                        </button>
                        <ToggleAtivo
                          ativo={p.ativo}
                          disabled={ehEu}
                          loading={toggling.has(p.id)}
                          onToggle={() => handleToggleAtivo(p)}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
