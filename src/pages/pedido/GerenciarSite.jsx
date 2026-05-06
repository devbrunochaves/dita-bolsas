import { useState, useEffect, useRef } from 'react'
import {
  getBanners, saveBanner, deleteBanner, toggleBanner, reordenarBanners,
  uploadImagem, deleteImagem,
  getSiteProdutos, saveSiteProduto, deleteSiteProduto,
  getSiteConfig, setSiteConfig,
} from '../../utils/storage'

// ── helpers ──────────────────────────────────────────────────
const fmtData = ts => ts ? new Date(ts).toLocaleDateString('pt-BR') : '—'

function Spinner() {
  return (
    <div style={{ display: 'inline-block', width: 16, height: 16, border: '2.5px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
  )
}

// ── Upload de imagem com preview ─────────────────────────────
function UploadImagem({ label, valor, onChange, pasta, dimensao }) {
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const inputRef = useRef()

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setErro('Somente imagens são aceitas.'); return }
    if (file.size > 5 * 1024 * 1024) { setErro('Arquivo muito grande (máx. 5 MB).'); return }
    setErro('')
    setCarregando(true)
    try {
      const url = await uploadImagem(pasta, file)
      onChange(url)
    } catch (err) {
      setErro(err.message)
    } finally {
      setCarregando(false)
    }
  }

  async function handleRemover() {
    if (!window.confirm('Remover esta imagem?')) return
    await deleteImagem(valor)
    onChange(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: .5 }}>
        {label} <span style={{ fontWeight: 400, color: '#9CA3AF', textTransform: 'none' }}>({dimensao})</span>
      </label>

      {valor ? (
        <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1px solid #E5E7EB' }}>
          <img src={valor} alt="" style={{ width: '100%', maxHeight: 160, objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 6 }}>
            <button
              type="button"
              onClick={() => inputRef.current.click()}
              style={{ background: 'rgba(0,0,0,.55)', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}
            >
              Trocar
            </button>
            <button
              type="button"
              onClick={handleRemover}
              style={{ background: 'rgba(220,38,38,.8)', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}
            >
              ✕
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current.click()}
          style={{
            border: '2px dashed #D1D5DB', borderRadius: 10, padding: '28px 16px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            cursor: 'pointer', background: '#F9FAFB', transition: 'border-color .2s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#1B6E3C'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#D1D5DB'}
        >
          {carregando ? <Spinner /> : (
            <>
              <div style={{ fontSize: 28, color: '#9CA3AF' }}>📷</div>
              <div style={{ fontSize: 13, color: '#6B7280', textAlign: 'center' }}>
                Clique para selecionar<br />
                <span style={{ fontSize: 11, color: '#9CA3AF' }}>PNG, JPG, WebP — máx. 5 MB</span>
              </div>
            </>
          )}
        </div>
      )}

      {carregando && !valor && (
        <div style={{ fontSize: 12, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 12, height: 12, border: '2px solid #E5E7EB', borderTopColor: '#1B6E3C', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
          Enviando imagem...
        </div>
      )}
      {erro && <div style={{ fontSize: 12, color: '#DC2626' }}>{erro}</div>}
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
    </div>
  )
}

// ── Modal de criação/edição de banner ─────────────────────────
function ModalBanner({ banner, onSalvar, onFechar }) {
  const isEdit = !!banner?.id
  const [form, setForm] = useState({
    titulo:      banner?.titulo      || '',
    imagem_desk: banner?.imagem_desk || '',
    imagem_mob:  banner?.imagem_mob  || '',
    link:        banner?.link        || '',
    ativo:       banner?.ativo       ?? true,
  })
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  async function handleSalvar() {
    if (!form.imagem_desk) { setErro('A imagem desktop é obrigatória.'); return }
    setSalvando(true)
    setErro('')
    try {
      await onSalvar({ ...banner, ...form })
      onFechar()
    } catch (err) {
      setErro(err.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div
      onClick={e => e.target === e.currentTarget && onFechar()}
      style={{ position: 'fixed', inset: 0, zIndex: 1200, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div style={{ background: 'white', borderRadius: 18, width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,.25)' }}>
        <div style={{ padding: '20px 28px 16px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1F2937' }}>
            {isEdit ? '✏️ Editar Banner' : '➕ Novo Banner'}
          </h3>
          <button onClick={onFechar} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E5E7EB', background: '#F9FAFB', color: '#6B7280', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>×</button>
        </div>

        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Imagem Desktop */}
          <UploadImagem
            label="Imagem Desktop"
            pasta="banners/desktop"
            dimensao="1440 × 520 px"
            valor={form.imagem_desk}
            onChange={url => setForm(f => ({ ...f, imagem_desk: url || '' }))}
          />

          {/* Imagem Mobile */}
          <UploadImagem
            label="Imagem Mobile"
            pasta="banners/mobile"
            dimensao="430 × 320 px"
            valor={form.imagem_mob}
            onChange={url => setForm(f => ({ ...f, imagem_mob: url || '' }))}
          />

          {/* Título (opcional) */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: .5 }}>
              Título <span style={{ fontWeight: 400, color: '#9CA3AF', textTransform: 'none' }}>(opcional, para controle interno)</span>
            </label>
            <input
              value={form.titulo}
              onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
              placeholder="Ex: Banner Volta às Aulas 2025"
              style={{ border: '1.5px solid #D1D5DB', borderRadius: 8, padding: '10px 14px', fontSize: 14, width: '100%', outline: 'none' }}
            />
          </div>

          {/* Link (opcional) */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: .5 }}>
              Link ao clicar <span style={{ fontWeight: 400, color: '#9CA3AF', textTransform: 'none' }}>(opcional)</span>
            </label>
            <input
              value={form.link}
              onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
              placeholder="https://wa.me/5527999374339"
              style={{ border: '1.5px solid #D1D5DB', borderRadius: 8, padding: '10px 14px', fontSize: 14, width: '100%', outline: 'none' }}
            />
          </div>

          {/* Ativo */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={form.ativo}
              onChange={e => setForm(f => ({ ...f, ativo: e.target.checked }))}
              style={{ width: 18, height: 18, accentColor: '#1B6E3C', cursor: 'pointer' }}
            />
            <span style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>Banner ativo (aparece no site)</span>
          </label>

          {erro && (
            <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 8, padding: '10px 14px', color: '#991B1B', fontSize: 13 }}>
              {erro}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={onFechar} style={{ padding: '11px 24px', borderRadius: 10, border: '1.5px solid #E5E7EB', background: 'white', color: '#374151', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
              Cancelar
            </button>
            <button
              onClick={handleSalvar}
              disabled={salvando}
              style={{ padding: '11px 28px', borderRadius: 10, border: 'none', background: salvando ? '#6B7280' : '#1B6E3C', color: 'white', fontWeight: 700, fontSize: 14, cursor: salvando ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
            >
              {salvando ? <><Spinner /> Salvando...</> : (isEdit ? '💾 Salvar' : '✅ Adicionar')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Aba Banners ───────────────────────────────────────────────
function AbaBanners() {
  const [banners, setBanners]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [modalAberto, setModal]     = useState(false)
  const [bannerEdit, setBannerEdit] = useState(null)
  const [excluindo, setExcluindo]   = useState(null)
  const [movendo, setMovendo]       = useState(null)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setLoading(true)
    const data = await getBanners()
    setBanners(data)
    setLoading(false)
  }

  async function handleSalvar(banner) {
    await saveBanner(banner)
    await carregar()
  }

  async function handleToggle(banner) {
    await toggleBanner(banner.id, !banner.ativo)
    setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, ativo: !b.ativo } : b))
  }

  async function handleExcluir(banner) {
    if (!window.confirm(`Excluir o banner "${banner.titulo || '#' + (banners.indexOf(banner) + 1)}"? As imagens também serão removidas.`)) return
    setExcluindo(banner.id)
    try {
      await deleteImagem(banner.imagem_desk)
      await deleteImagem(banner.imagem_mob)
      await deleteBanner(banner.id)
      setBanners(prev => prev.filter(b => b.id !== banner.id))
    } finally {
      setExcluindo(null)
    }
  }

  async function mover(idx, dir) {
    const novo = [...banners]
    const alvo = idx + dir
    if (alvo < 0 || alvo >= novo.length) return
    ;[novo[idx], novo[alvo]] = [novo[alvo], novo[idx]]
    setBanners(novo)
    setMovendo(true)
    await reordenarBanners(novo.map(b => b.id))
    setMovendo(false)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, gap: 12 }}>
      <div style={{ width: 28, height: 28, border: '3px solid #E5E7EB', borderTopColor: '#1B6E3C', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
      <span style={{ color: '#6B7280', fontSize: 14 }}>Carregando banners...</span>
    </div>
  )

  return (
    <div>
      {/* Cabeçalho + botão */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1F2937' }}>Banners do site</h3>
          <p style={{ fontSize: 13, color: '#6B7280', marginTop: 3 }}>
            Os banners aparecem no carrossel da página inicial, na ordem abaixo.
          </p>
          <div style={{ marginTop: 8, display: 'flex', gap: 16 }}>
            <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: '#92400E' }}>
              🖥 Desktop: <strong>1440 × 520 px</strong>
            </div>
            <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: '#0C4A6E' }}>
              📱 Mobile: <strong>430 × 320 px</strong>
            </div>
          </div>
        </div>
        <button
          onClick={() => { setBannerEdit(null); setModal(true) }}
          style={{ background: '#1B6E3C', color: 'white', border: 'none', padding: '11px 22px', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 2px 8px rgba(27,110,60,.25)' }}
        >
          ➕ Novo Banner
        </button>
      </div>

      {/* Lista vazia */}
      {banners.length === 0 ? (
        <div style={{ background: '#F9FAFB', border: '2px dashed #D1D5DB', borderRadius: 14, padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🖼️</div>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Nenhum banner cadastrado</p>
          <p style={{ fontSize: 13, color: '#9CA3AF' }}>Clique em "Novo Banner" para adicionar o primeiro.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {banners.map((b, idx) => (
            <div
              key={b.id}
              style={{
                background: 'white', border: '1px solid #E5E7EB', borderRadius: 14,
                padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 16,
                opacity: excluindo === b.id ? .5 : 1, transition: 'opacity .2s',
              }}
            >
              {/* Preview da imagem */}
              <div style={{ width: 120, height: 68, borderRadius: 8, overflow: 'hidden', background: '#F3F4F6', flexShrink: 0 }}>
                {b.imagem_desk
                  ? <img src={b.imagem_desk} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#9CA3AF' }}>🖼️</div>
                }
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1F2937', marginBottom: 3 }}>
                  {b.titulo || `Banner ${idx + 1}`}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100,
                    background: b.ativo ? '#DCFCE7' : '#F3F4F6',
                    color: b.ativo ? '#166534' : '#6B7280',
                  }}>
                    {b.ativo ? '● Ativo' : '○ Inativo'}
                  </span>
                  {b.imagem_mob && (
                    <span style={{ fontSize: 11, color: '#6B7280', background: '#F3F4F6', padding: '3px 10px', borderRadius: 100 }}>📱 Mobile OK</span>
                  )}
                  <span style={{ fontSize: 11, color: '#9CA3AF' }}>Desde {fmtData(b.created_at)}</span>
                </div>
              </div>

              {/* Ações */}
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                {/* Reordenar */}
                <button
                  onClick={() => mover(idx, -1)} disabled={idx === 0 || movendo} title="Mover para cima"
                  style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid #E5E7EB', background: '#F9FAFB', cursor: idx === 0 ? 'not-allowed' : 'pointer', fontSize: 14, opacity: idx === 0 ? .4 : 1 }}
                >↑</button>
                <button
                  onClick={() => mover(idx, 1)} disabled={idx === banners.length - 1 || movendo} title="Mover para baixo"
                  style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid #E5E7EB', background: '#F9FAFB', cursor: idx === banners.length - 1 ? 'not-allowed' : 'pointer', fontSize: 14, opacity: idx === banners.length - 1 ? .4 : 1 }}
                >↓</button>

                {/* Ativar/desativar */}
                <button
                  onClick={() => handleToggle(b)}
                  title={b.ativo ? 'Desativar' : 'Ativar'}
                  style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid #E5E7EB', background: b.ativo ? '#DCFCE7' : '#F9FAFB', color: b.ativo ? '#166534' : '#6B7280', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                >
                  {b.ativo ? 'Desativar' : 'Ativar'}
                </button>

                {/* Editar */}
                <button
                  onClick={() => { setBannerEdit(b); setModal(true) }}
                  style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid #BFDBFE', background: '#EFF6FF', color: '#2563EB', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                >
                  ✏️ Editar
                </button>

                {/* Excluir */}
                <button
                  onClick={() => handleExcluir(b)}
                  disabled={excluindo === b.id}
                  style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid #FECACA', background: '#FEF2F2', color: '#DC2626', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalAberto && (
        <ModalBanner
          banner={bannerEdit}
          onSalvar={handleSalvar}
          onFechar={() => { setModal(false); setBannerEdit(null) }}
        />
      )}
    </div>
  )
}

// ── Aba Catálogo (placeholder — próxima sessão) ──────────────
function AbaCatalogo() {
  return (
    <div style={{ background: '#F9FAFB', border: '2px dashed #D1D5DB', borderRadius: 14, padding: '60px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 44, marginBottom: 14 }}>🛍️</div>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Catálogo de produtos do site</h3>
      <p style={{ fontSize: 13, color: '#9CA3AF', maxWidth: 400, margin: '0 auto' }}>
        Em breve: cadastre produtos com fotos, descrição e faixas de preço por quantidade. Eles aparecerão automaticamente na página de catálogo do site.
      </p>
    </div>
  )
}

// ── Aba Configurações ─────────────────────────────────────────
function AbaConfiguracoes() {
  const [config, setConfig]   = useState({})
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo]     = useState(false)

  useEffect(() => {
    getSiteConfig().then(c => { setConfig(c); setLoading(false) })
  }, [])

  async function handleSalvar() {
    setSalvando(true)
    try {
      await Promise.all(Object.entries(config).map(([k, v]) => setSiteConfig(k, v)))
      setSalvo(true)
      setTimeout(() => setSalvo(false), 2500)
    } finally {
      setSalvando(false)
    }
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF' }}>Carregando...</div>

  const campos = [
    { key: 'whatsapp',       label: 'WhatsApp (com DDI)',  placeholder: '5527999374339' },
    { key: 'hero_titulo',    label: 'Título do hero',      placeholder: 'Bolsas & Acessórios' },
    { key: 'hero_subtitulo', label: 'Subtítulo do hero',   placeholder: 'Personalizados para festas...' },
    { key: 'instagram',      label: 'Instagram',           placeholder: '@ditabolsas' },
  ]

  return (
    <div>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1F2937', marginBottom: 4 }}>Configurações gerais</h3>
      <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 24 }}>Textos e links que aparecem no site.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480 }}>
        {campos.map(({ key, label, placeholder }) => (
          <div key={key}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: .5 }}>
              {label}
            </label>
            <input
              value={config[key] || ''}
              onChange={e => setConfig(c => ({ ...c, [key]: e.target.value }))}
              placeholder={placeholder}
              style={{ border: '1.5px solid #D1D5DB', borderRadius: 8, padding: '10px 14px', fontSize: 14, width: '100%', outline: 'none' }}
            />
          </div>
        ))}
      </div>

      {salvo && (
        <div style={{ marginTop: 16, background: '#DCFCE7', border: '1px solid #86EFAC', borderRadius: 8, padding: '10px 14px', color: '#166534', fontSize: 13, fontWeight: 600 }}>
          ✅ Configurações salvas!
        </div>
      )}

      <button
        onClick={handleSalvar}
        disabled={salvando}
        style={{ marginTop: 20, background: salvando ? '#6B7280' : '#1B6E3C', color: 'white', border: 'none', padding: '12px 28px', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: salvando ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
      >
        {salvando ? <><Spinner /> Salvando...</> : '💾 Salvar configurações'}
      </button>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────
const ABAS = [
  { id: 'banners',    label: '🖼️  Banners',      comp: AbaBanners },
  { id: 'catalogo',   label: '🛍️  Catálogo',      comp: AbaCatalogo },
  { id: 'config',     label: '⚙️  Configurações', comp: AbaConfiguracoes },
]

export default function GerenciarSite() {
  const [abaAtiva, setAba] = useState('banners')
  const Comp = ABAS.find(a => a.id === abaAtiva)?.comp || AbaBanners

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      {/* Cabeçalho */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#1F2937' }}>🌐 Gerenciar Site</h1>
        <p style={{ color: '#6B7280', fontSize: 13, marginTop: 2 }}>
          Controle banners, catálogo de produtos e configurações do site ditabolsas.com.br
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#F3F4F6', borderRadius: 12, padding: 4, marginBottom: 24, width: 'fit-content' }}>
        {ABAS.map(a => (
          <button
            key={a.id}
            onClick={() => setAba(a.id)}
            style={{
              padding: '9px 20px', borderRadius: 9, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, transition: 'all .15s',
              background: abaAtiva === a.id ? 'white' : 'transparent',
              color: abaAtiva === a.id ? '#1F2937' : '#6B7280',
              boxShadow: abaAtiva === a.id ? '0 1px 4px rgba(0,0,0,.1)' : 'none',
            }}
          >
            {a.label}
          </button>
        ))}
      </div>

      {/* Conteúdo da aba */}
      <div className="ped-card">
        <Comp />
      </div>
    </div>
  )
}
