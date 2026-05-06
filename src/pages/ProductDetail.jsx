import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getSiteProdutos, slugify } from '../utils/storage'

// Ordena faixas: mais barata (maior qty) primeiro
function ordenarFaixas(faixas) {
  if (!faixas?.length) return []
  return [...faixas].sort((a, b) => Number(a.preco) - Number(b.preco))
}

// ── Galeria de imagens ─────────────────────────────────────────
function Galeria({ imagem_principal, imagens = [], emoji = '🛍️' }) {
  const todas = [
    ...(imagem_principal ? [imagem_principal] : []),
    ...(imagens || []).filter(Boolean),
  ]
  const [ativa, setAtiva] = useState(0)

  if (todas.length === 0) {
    return (
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1, aspectRatio: '1', borderRadius: 16, background: 'linear-gradient(135deg,#F5E6E7,#FECDD3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 120 }}>
          {emoji}
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 12 }}>
      {/* Miniaturas verticais */}
      {todas.length > 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 72, flexShrink: 0 }}>
          {todas.map((src, i) => (
            <button
              key={i}
              onClick={() => setAtiva(i)}
              style={{
                width: 72, height: 72, borderRadius: 10, overflow: 'hidden', padding: 0, cursor: 'pointer',
                border: ativa === i ? '2.5px solid #D41B2C' : '2px solid #E5E7EB',
                background: 'white', flexShrink: 0, transition: 'border-color .2s',
              }}
            >
              <img src={src} alt={`Foto ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      )}

      {/* Imagem principal */}
      <div style={{ flex: 1, borderRadius: 16, overflow: 'hidden', background: '#F9FAFB', aspectRatio: '1', maxHeight: 500 }}>
        <img
          src={todas[ativa]}
          alt="Produto"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'opacity .25s' }}
        />
      </div>
    </div>
  )
}

// ── Card mini para produtos relacionados ───────────────────────
function CardRelacionado({ produto }) {
  const navigate = useNavigate()
  const preco = produto.faixas_preco?.length
    ? Math.min(...produto.faixas_preco.map(f => Number(f.preco)).filter(v => !isNaN(v) && v > 0))
    : null

  return (
    <div
      onClick={() => { navigate(`/produto/${slugify(produto.nome)}`); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
      style={{ background: 'white', borderRadius: 14, overflow: 'hidden', cursor: 'pointer', boxShadow: '0 2px 12px rgba(0,0,0,.06)', transition: 'transform .25s, box-shadow .25s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(0,0,0,.12)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,.06)' }}
    >
      <div style={{ height: 160, background: 'linear-gradient(135deg,#F5E6E7,#FECDD3)', position: 'relative' }}>
        {produto.imagem_principal
          ? <img src={produto.imagem_principal} alt={produto.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56 }}>🛍️</div>
        }
        <div style={{ position: 'absolute', bottom: 8, right: 8, background: '#D41B2C', color: 'white', fontSize: 9, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', padding: '2px 8px', borderRadius: 100 }}>
          {produto.categoria}
        </div>
      </div>
      <div style={{ padding: '12px 14px 14px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1F2937', marginBottom: 4, lineHeight: 1.3 }}>{produto.nome}</div>
        {preco != null
          ? <div style={{ fontSize: 15, fontWeight: 800, color: '#D41B2C' }}>R$ {Number(preco).toFixed(2).replace('.', ',')}</div>
          : <div style={{ fontSize: 13, color: '#9CA3AF' }}>Consulte o preço</div>
        }
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4, color: '#D41B2C', fontSize: 12, fontWeight: 600 }}>
          <span>👁</span> Espiar
        </div>
      </div>
    </div>
  )
}

// ── Página de detalhe ──────────────────────────────────────────
export default function ProductDetail() {
  const { slug } = useParams()
  const navigate  = useNavigate()

  const [produto,       setProduto]       = useState(null)
  const [relacionados,  setRelacionados]  = useState([])
  const [loading,       setLoading]       = useState(true)
  const [faixaSel,      setFaixaSel]      = useState(null)
  const [notFound,      setNotFound]      = useState(false)

  useEffect(() => {
    setLoading(true)
    setNotFound(false)

    getSiteProdutos({ somenteAtivos: true })
      .then(rows => {
        const p = rows?.find(r => slugify(r.nome) === slug)
        if (!p) { setNotFound(true); setLoading(false); return }

        const faixas = ordenarFaixas(p.faixas_preco)
        setProduto({ ...p, _faixasOrdenadas: faixas })
        setFaixaSel(faixas[0] || null) // mais barata por padrão

        // Relacionados: mesma categoria primeiro, depois outros, máx 4
        const mesmaCat = rows.filter(r => r.id !== p.id && r.categoria === p.categoria).sort(() => Math.random() - 0.5)
        const outros   = rows.filter(r => r.id !== p.id && r.categoria !== p.categoria).sort(() => Math.random() - 0.5)
        setRelacionados([...mesmaCat, ...outros].slice(0, 4))
        setLoading(false)
      })
      .catch(() => { setNotFound(true); setLoading(false) })
  }, [slug])

  // Loading
  if (loading) return (
    <main style={{ paddingTop: 68, minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 36, height: 36, border: '3px solid #E5E7EB', borderTopColor: '#D41B2C', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>
        <span style={{ color: '#6B7280', fontSize: 16 }}>Carregando produto...</span>
      </div>
    </main>
  )

  // Não encontrado
  if (notFound) return (
    <main style={{ paddingTop: 68, minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: '80px 24px' }}>
      <div style={{ fontSize: 72 }}>😕</div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1F2937' }}>Produto não encontrado</h1>
      <p style={{ color: '#6B7280' }}>O produto que você procura não existe ou foi removido.</p>
      <Link to="/produtos" style={{ background: '#D41B2C', color: 'white', padding: '12px 28px', borderRadius: 10, fontWeight: 700, textDecoration: 'none' }}>Ver catálogo</Link>
    </main>
  )

  const faixas = produto._faixasOrdenadas || []
  const todas  = [
    ...(produto.imagem_principal ? [produto.imagem_principal] : []),
    ...(produto.imagens || []).filter(Boolean),
  ]

  return (
    <main style={{ paddingTop: 68, background: '#F9FAFB' }}>
      <style>{`
        @keyframes spin { to { transform:rotate(360deg) } }
        @media (max-width: 768px) {
          .det-grid { grid-template-columns: 1fr !important; }
          .det-gallery { max-width: 100% !important; }
        }
      `}</style>

      {/* Breadcrumb */}
      <div style={{ background: 'white', borderBottom: '1px solid #F3F4F6' }}>
        <div className="site-container" style={{ padding: '12px 24px', display: 'flex', gap: 6, alignItems: 'center', fontSize: 13, color: '#9CA3AF', flexWrap: 'wrap' }}>
          <Link to="/"        style={{ color: '#6B7280', textDecoration: 'none' }}>Início</Link>
          <span>›</span>
          <Link to="/produtos" style={{ color: '#6B7280', textDecoration: 'none' }}>Catálogo</Link>
          <span>›</span>
          <Link to={`/produtos?categoria=${encodeURIComponent(produto.categoria)}`} style={{ color: '#6B7280', textDecoration: 'none' }}>{produto.categoria}</Link>
          <span>›</span>
          <span style={{ color: '#1F2937', fontWeight: 600 }}>{produto.nome}</span>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="site-container" style={{ padding: '40px 24px' }}>
        <div className="det-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>

          {/* ── Galeria ── */}
          <div className="det-gallery">
            <Galeria
              imagem_principal={produto.imagem_principal}
              imagens={produto.imagens}
              emoji="🛍️"
            />
          </div>

          {/* ── Informações ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Categoria badge */}
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: '#D41B2C', background: '#FFF1F2', padding: '4px 12px', borderRadius: 100 }}>
                {produto.categoria}
              </span>
              {produto.destaque && (
                <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, background: '#FEF3C7', color: '#92400E', padding: '4px 10px', borderRadius: 100 }}>⭐ Destaque</span>
              )}
            </div>

            {/* Nome */}
            <h1 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 800, color: '#1F2937', lineHeight: 1.2, margin: 0 }}>
              {produto.nome}
            </h1>

            {/* Preço selecionado */}
            {faixaSel && (
              <div>
                <div style={{ fontSize: 36, fontWeight: 900, color: '#D41B2C', lineHeight: 1 }}>
                  R$ {Number(faixaSel.preco).toFixed(2).replace('.', ',')}
                </div>
                <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>
                  por unidade • <strong>{faixaSel.qtd}</strong>
                </div>
              </div>
            )}

            {/* Seletor de faixas */}
            {faixas.length > 0 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#9CA3AF', marginBottom: 10 }}>
                  Valores: <span style={{ color: '#1F2937' }}>{faixaSel?.qtd} (valor unitário)</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {faixas.map((f, i) => {
                    const sel = faixaSel?.qtd === f.qtd
                    return (
                      <button
                        key={i}
                        onClick={() => setFaixaSel(f)}
                        style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '12px 16px', borderRadius: 10, cursor: 'pointer',
                          border: sel ? '2px solid #D41B2C' : '1.5px solid #E5E7EB',
                          background: sel ? '#FFF1F2' : 'white',
                          transition: 'all .15s', textAlign: 'left',
                        }}
                        onMouseEnter={e => { if (!sel) e.currentTarget.style.borderColor = '#D41B2C' }}
                        onMouseLeave={e => { if (!sel) e.currentTarget.style.borderColor = '#E5E7EB' }}
                      >
                        <span style={{ fontSize: 14, color: sel ? '#D41B2C' : '#374151', fontWeight: sel ? 700 : 500 }}>
                          {f.qtd}
                        </span>
                        <span style={{ fontSize: 15, fontWeight: 800, color: sel ? '#D41B2C' : '#1F2937' }}>
                          R$ {Number(f.preco).toFixed(2).replace('.', ',')}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Garantias */}
            <div style={{ background: '#F9FAFB', borderRadius: 12, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>🔒</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1F2937' }}>Compra protegida</div>
                  <div style={{ fontSize: 12, color: '#6B7280' }}>Seus dados cuidados durante toda a compra.</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>💬</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1F2937' }}>Finalize pelo WhatsApp</div>
                  <div style={{ fontSize: 12, color: '#6B7280' }}>Entre em contato com uma vendedora para finalizar.</div>
                </div>
              </div>
            </div>

            {/* CTA WhatsApp */}
            <a
              href={`https://wa.me/5527999374339?text=${encodeURIComponent(`Olá! Tenho interesse no produto: ${produto.nome}${faixaSel ? ` (${faixaSel.qtd} - R$ ${Number(faixaSel.preco).toFixed(2)})` : ''}`)}`}
              target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '16px', borderRadius: 14, background: '#25D366', color: 'white', fontWeight: 800, fontSize: 16, textDecoration: 'none', boxShadow: '0 4px 20px rgba(37,211,102,.4)', transition: 'transform .2s, box-shadow .2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(37,211,102,.5)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(37,211,102,.4)' }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Pedir Orçamento no WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Descrição completa */}
      {produto.descricao && (
        <div style={{ background: 'white', borderTop: '1px solid #F3F4F6', padding: '48px 0' }}>
          <div className="site-container" style={{ padding: '0 24px' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1F2937', marginBottom: 20 }}>Sobre o produto</h2>
            <div style={{ maxWidth: 780 }}>
              {produto.descricao.split('\n').map((linha, i) => (
                linha.trim()
                  ? <p key={i} style={{ fontSize: 15, color: '#4B5563', lineHeight: 1.8, marginBottom: 12 }}>{linha}</p>
                  : <br key={i} />
              ))}
            </div>

            {/* Características */}
            {produto.caracteristicas?.length > 0 && (
              <div style={{ marginTop: 28 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1F2937', marginBottom: 14 }}>Características</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {produto.caracteristicas.map((c, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <span style={{ color: '#D41B2C', fontWeight: 800, flexShrink: 0, marginTop: 1 }}>✓</span>
                      <span style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.6 }}>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Produtos relacionados */}
      {relacionados.length > 0 && (
        <div style={{ padding: '56px 0 80px', background: '#F9FAFB' }}>
          <div className="site-container" style={{ padding: '0 24px' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1F2937', marginBottom: 28 }}>Produtos relacionados</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
              {relacionados.map(p => (
                <CardRelacionado key={p.id} produto={p} />
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
