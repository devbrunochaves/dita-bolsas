import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getSiteProdutos } from '../utils/storage'

// Faixas de preço fallback por categoria
const PRODUTOS_FALLBACK = [
  { id: 'f1', nome: 'Bolsa Escolar Personalizada', _emoji: '👜', descricao: 'Bolsa escolar com zíper duplo e frente personalizável com silk-screen ou bordado.', categoria: 'Bolsas' },
  { id: 'f2', nome: 'Sacola Ecobag',               _emoji: '🛍️', descricao: 'Ecobag em TNT ou algodão com impressão colorida. Resistente e lavável.', categoria: 'Sacolas' },
  { id: 'f3', nome: 'Mochila Executiva',            _emoji: '🎒', descricao: 'Mochila executiva com compartimento para notebook e personalização por bordado.', categoria: 'Mochilas' },
  { id: 'f4', nome: 'Caneca de Porcelana',          _emoji: '☕', descricao: 'Caneca 325ml com sublimação em alta resolução. Ideal para brindes corporativos.', categoria: 'Canecas' },
  { id: 'f5', nome: 'Boné Bordado',                 _emoji: '🧢', descricao: 'Boné aba curva com bordado digitalizado em alta definição.', categoria: 'Bonés' },
  { id: 'f6', nome: 'Camiseta Dry Fit',             _emoji: '👕', descricao: 'Camiseta dry fit com sublimação total ou parcial. Perfeita para eventos e uniformes.', categoria: 'Camisas' },
  { id: 'f7', nome: 'Chaveiro Acrílico',            _emoji: '🔑', descricao: 'Chaveiro em acrílico cristal com impressão digital em alta resolução.', categoria: 'Chaveiros' },
  { id: 'f8', nome: 'Almofada Sublimada',           _emoji: '🛋️', descricao: 'Almofada 40x40cm com sublimação em alta resolução em toda a frente.', categoria: 'Almofadas' },
]

function menorPreco(faixas) {
  if (!faixas?.length) return null
  const precos = faixas.map(f => Number(f.preco)).filter(p => !isNaN(p) && p > 0)
  return precos.length ? Math.min(...precos) : null
}

// ── Modal rápido de produto ───────────────────────────────────
function ModalEspiar({ produto, onClose }) {
  useEffect(() => {
    const esc = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', esc)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', esc); document.body.style.overflow = '' }
  }, [onClose])

  const preco = produto?.preco_exibicao

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'white', borderRadius: 20, width: '100%', maxWidth: 520,
        overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        animation: 'slideUp .22s ease',
      }}>
        <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }`}</style>

        {/* Imagem */}
        <div style={{ position: 'relative', height: 240, background: 'linear-gradient(135deg, #F5E6E7, #FECDD3)', flexShrink: 0 }}>
          {produto.imagem_principal
            ? <img src={produto.imagem_principal} alt={produto.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80 }}>{produto._emoji || '🛍️'}</div>
          }
          <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,.4)', border: 'none', color: 'white', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          {produto.categoria && (
            <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(212,27,44,.85)', backdropFilter: 'blur(6px)', color: 'white', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', padding: '4px 10px', borderRadius: 100 }}>
              {produto.categoria}
            </div>
          )}
        </div>

        {/* Conteúdo */}
        <div style={{ padding: '24px 28px 28px', overflowY: 'auto' }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1F2937', marginBottom: 8 }}>{produto.nome}</h2>

          {preco != null && (
            <div style={{ marginBottom: 12 }}>
              <span style={{ fontSize: 26, fontWeight: 800, color: '#D41B2C' }}>R$ {Number(preco).toFixed(2).replace('.', ',')}</span>
              <span style={{ fontSize: 13, color: '#9CA3AF', marginLeft: 8 }}>a partir de (50–99 un.)</span>
            </div>
          )}

          {produto.descricao && <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.7, marginBottom: 16 }}>{produto.descricao}</p>}

          {/* Tabela de faixas */}
          {produto.faixas_preco?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#9CA3AF', marginBottom: 8 }}>Tabela de preços</div>
              {produto.faixas_preco.map((f, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 14px', borderRadius: 10, marginBottom: 4,
                  background: i === produto.faixas_preco.length - 1 ? '#FFF1F2' : '#F9FAFB',
                  border: i === produto.faixas_preco.length - 1 ? '1.5px solid #FECDD3' : '1px solid #F3F4F6',
                }}>
                  <span style={{ fontSize: 13, color: '#374151' }}>{f.qtd}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: i === produto.faixas_preco.length - 1 ? '#D41B2C' : '#1F2937' }}>
                    R$ {Number(f.preco).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Características */}
          {produto.caracteristicas?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#9CA3AF', marginBottom: 8 }}>Características</div>
              {produto.caracteristicas.map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                  <span style={{ color: '#D41B2C', flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: 13, color: '#4B5563' }}>{c}</span>
                </div>
              ))}
            </div>
          )}

          <a
            href={`https://wa.me/5527999374339?text=${encodeURIComponent(`Olá! Tenho interesse no produto: ${produto.nome}`)}`}
            target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: 14, borderRadius: 12, background: '#25D366', color: 'white', fontWeight: 700, fontSize: 15, textDecoration: 'none', boxShadow: '0 4px 14px rgba(37,211,102,.35)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Pedir Orçamento no WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}

// ── Card de produto ────────────────────────────────────────────
function ProdutoCard({ produto, onEspiar }) {
  const preco = produto.preco_exibicao

  return (
    <div
      style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,.07)', transition: 'transform .3s, box-shadow .3s', display: 'flex', flexDirection: 'column' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 14px 32px rgba(0,0,0,.12)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,.07)' }}
    >
      {/* Imagem */}
      <div style={{ height: 180, background: 'linear-gradient(135deg, #F5E6E7, #FECDD3)', position: 'relative', flexShrink: 0 }}>
        {produto.imagem_principal
          ? <img src={produto.imagem_principal} alt={produto.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 68 }}>{produto._emoji || '🛍️'}</div>
        }
        <div style={{ position: 'absolute', top: 10, right: 10, background: '#D41B2C', color: 'white', fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', padding: '3px 10px', borderRadius: 100 }}>
          {produto.categoria}
        </div>
        {produto.destaque && (
          <div style={{ position: 'absolute', top: 10, left: 10, background: '#F59E0B', color: 'white', fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 100 }}>⭐ Destaque</div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '16px 18px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1F2937', marginBottom: 6, lineHeight: 1.3 }}>{produto.nome}</h3>
        {produto.descricao && (
          <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6, flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', marginBottom: 12 }}>
            {produto.descricao}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 10, borderTop: '1px solid #F3F4F6' }}>
          <div>
            {preco != null
              ? <>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#D41B2C' }}>R$ {Number(preco).toFixed(2).replace('.', ',')}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF' }}>a partir de (50+ un.)</div>
                </>
              : <span style={{ fontSize: 13, color: '#9CA3AF' }}>Consulte o preço</span>
            }
          </div>
          <button
            onClick={() => onEspiar(produto)}
            style={{ background: '#1F2937', color: 'white', border: 'none', borderRadius: 10, padding: '9px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'background .2s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#D41B2C'}
            onMouseLeave={e => e.currentTarget.style.background = '#1F2937'}
          >
            👁 Espiar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Página principal ───────────────────────────────────────────
export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const categoriaUrl = searchParams.get('categoria') || 'Todos'

  const [produtos,    setProdutos]    = useState(null)      // null = carregando
  const [categorias,  setCategorias]  = useState(['Todos'])
  const [ativa,       setAtiva]       = useState(categoriaUrl)
  const [espiarProd,  setEspiarProd]  = useState(null)

  // Sincroniza aba ativa com URL
  useEffect(() => {
    setAtiva(categoriaUrl)
  }, [categoriaUrl])

  useEffect(() => {
    let cancelled = false

    getSiteProdutos({ somenteAtivos: true })
      .then(rows => {
        if (cancelled) return
        if (rows && rows.length) {
          const comPreco = rows.map(p => ({ ...p, preco_exibicao: menorPreco(p.faixas_preco) }))
          setProdutos(comPreco)
          // Monta lista de categorias únicas na ordem que aparecem
          const cats = ['Todos', ...new Set(rows.map(p => p.categoria).filter(Boolean))]
          setCategorias(cats)
        } else {
          // Banco vazio → usa fallback
          setProdutos(PRODUTOS_FALLBACK)
          const cats = ['Todos', ...new Set(PRODUTOS_FALLBACK.map(p => p.categoria))]
          setCategorias(cats)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProdutos(PRODUTOS_FALLBACK)
          const cats = ['Todos', ...new Set(PRODUTOS_FALLBACK.map(p => p.categoria))]
          setCategorias(cats)
        }
      })

    return () => { cancelled = true }
  }, [])

  function selecionarCategoria(cat) {
    setAtiva(cat)
    if (cat === 'Todos') {
      setSearchParams({})
    } else {
      setSearchParams({ categoria: cat })
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const filtrados = !produtos
    ? []
    : ativa === 'Todos'
      ? produtos
      : produtos.filter(p => p.categoria === ativa)

  return (
    <main style={{ paddingTop: 68 }}>

      {/* Header */}
      <section style={{ background: 'linear-gradient(135deg, #1F2937 0%, #7F1D1D 100%)', padding: '64px 0 48px', textAlign: 'center' }}>
        <div className="site-container">
          <div className="section-tag" style={{ background: 'rgba(212,27,44,0.3)', color: '#FCA5A5' }}>Catálogo</div>
          <h1 className="section-title" style={{ color: 'white', marginBottom: 16 }}>
            {ativa === 'Todos' ? 'Nossos Produtos' : ativa}
          </h1>
          <p className="section-subtitle" style={{ color: 'rgba(255,255,255,0.75)', margin: '0 auto' }}>
            {ativa === 'Todos'
              ? 'Explore nosso catálogo completo de produtos personalizados.'
              : `Todos os produtos da categoria ${ativa}.`
            }
          </p>
          {produtos && (
            <div style={{ marginTop: 16, color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
              {filtrados.length} produto{filtrados.length !== 1 ? 's' : ''} encontrado{filtrados.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </section>

      {/* Filtros de categoria */}
      <section style={{ background: 'white', borderBottom: '1px solid #E5E7EB', position: 'sticky', top: 68, zIndex: 50 }}>
        <div className="site-container" style={{ padding: '0 24px' }}>
          <div style={{ display: 'flex', gap: 8, padding: '14px 0', overflowX: 'auto', scrollbarWidth: 'none' }}>
            <style>{`.cat-scroll::-webkit-scrollbar { display: none }`}</style>
            {categorias.map(cat => (
              <button
                key={cat}
                onClick={() => selecionarCategoria(cat)}
                style={{
                  padding: '8px 18px', borderRadius: 100, whiteSpace: 'nowrap',
                  border: ativa === cat ? 'none' : '1.5px solid #E5E7EB',
                  background: ativa === cat ? '#D41B2C' : 'white',
                  color: ativa === cat ? 'white' : '#6B7280',
                  fontWeight: ativa === cat ? 700 : 500,
                  fontSize: 14, cursor: 'pointer', transition: 'all .2s',
                  flexShrink: 0,
                }}
              >{cat}</button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section style={{ padding: '48px 0 80px', background: '#F9FAFB', minHeight: 400 }}>
        <div className="site-container">
          {/* Carregando */}
          {!produtos && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
              {[...Array(8)].map((_, i) => (
                <div key={i} style={{ background: 'white', borderRadius: 16, overflow: 'hidden', height: 320 }}>
                  <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
                  <div style={{ height: 180, background: '#F3F4F6', animation: 'pulse 1.5s ease infinite' }} />
                  <div style={{ padding: 18 }}>
                    <div style={{ height: 16, background: '#F3F4F6', borderRadius: 8, marginBottom: 10, width: '60%', animation: 'pulse 1.5s ease infinite' }} />
                    <div style={{ height: 12, background: '#F3F4F6', borderRadius: 8, animation: 'pulse 1.5s ease infinite' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sem resultados */}
          {produtos && filtrados.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 24px' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1F2937', marginBottom: 8 }}>Nenhum produto nesta categoria</h3>
              <p style={{ color: '#6B7280', marginBottom: 24 }}>Tente outra categoria ou veja todos os produtos.</p>
              <button onClick={() => selecionarCategoria('Todos')} style={{ background: '#D41B2C', color: 'white', border: 'none', padding: '12px 28px', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                Ver todos os produtos
              </button>
            </div>
          )}

          {/* Cards */}
          {produtos && filtrados.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
              {filtrados.map(p => (
                <ProdutoCard key={p.id} produto={p} onEspiar={setEspiarProd} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '64px 0', background: '#D41B2C', textAlign: 'center' }}>
        <div className="site-container">
          <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: 'white', marginBottom: 12 }}>
            Não encontrou o que procura?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: 28, fontSize: 16 }}>
            Fale conosco! Produzimos produtos personalizados sob encomenda.
          </p>
          <a href="https://wa.me/5527999374339" target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', color: '#D41B2C', padding: '14px 32px', borderRadius: 12, fontWeight: 700, fontSize: 16, textDecoration: 'none' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Falar no WhatsApp
          </a>
        </div>
      </section>

      {/* Modal Espiar */}
      {espiarProd && <ModalEspiar produto={espiarProd} onClose={() => setEspiarProd(null)} />}
    </main>
  )
}
