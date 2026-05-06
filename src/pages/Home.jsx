import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState, useCallback } from 'react'
import { getBanners, getSiteProdutos, slugify } from '../utils/storage'

// ---- Contador animado ----
function Counter({ target, suffix = '', prefix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const duration = 2000
        const steps = 60
        const step = target / steps
        let current = 0
        const timer = setInterval(() => {
          current += step
          if (current >= target) { setCount(target); clearInterval(timer) }
          else setCount(Math.floor(current))
        }, duration / steps)
      }
    }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [target])

  return <span ref={ref}>{prefix}{count.toLocaleString('pt-BR')}{suffix}</span>
}

// ---- Modal "Espiar" produto ----
function ModalEspiar({ produto, onClose }) {
  const preco = produto?.preco_exibicao

  useEffect(() => {
    const esc = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [onClose])

  if (!produto) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        animation: 'fadeInOverlay 0.2s ease',
      }}
    >
      <style>{`
        @keyframes fadeInOverlay { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUpModal  { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
      `}</style>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white', borderRadius: 20, width: '100%', maxWidth: 520,
          overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
          animation: 'slideUpModal 0.22s ease',
          maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Imagem */}
        <div style={{ position: 'relative', height: 240, background: 'linear-gradient(135deg, #F5E6E7, #FECDD3)', flexShrink: 0 }}>
          {produto.imagem_principal
            ? <img src={produto.imagem_principal} alt={produto.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80 }}>{produto._emoji || '🛍️'}</div>
          }
          <button onClick={onClose} style={{
            position: 'absolute', top: 12, right: 12,
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(0,0,0,0.4)', border: 'none',
            color: 'white', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
          {produto.categoria && (
            <div style={{
              position: 'absolute', bottom: 12, left: 12,
              background: 'rgba(212,27,44,0.85)', backdropFilter: 'blur(6px)',
              color: 'white', fontSize: 11, fontWeight: 700, letterSpacing: 1,
              textTransform: 'uppercase', padding: '4px 10px', borderRadius: 100,
            }}>{produto.categoria}</div>
          )}
        </div>

        {/* Conteúdo */}
        <div style={{ padding: '24px 28px 28px', overflowY: 'auto' }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1F2937', marginBottom: 8 }}>{produto.nome}</h2>

          {preco != null && (
            <div style={{ marginBottom: 12 }}>
              <span style={{ fontSize: 26, fontWeight: 800, color: '#D41B2C' }}>
                R$ {Number(preco).toFixed(2).replace('.', ',')}
              </span>
              <span style={{ fontSize: 13, color: '#9CA3AF', marginLeft: 8 }}>a partir de (50–99 un.)</span>
            </div>
          )}

          {produto.descricao && (
            <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.7, marginBottom: 16 }}>{produto.descricao}</p>
          )}

          {/* Faixas de preço */}
          {produto.faixas_preco?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#9CA3AF', marginBottom: 8 }}>Tabela de preços</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {produto.faixas_preco.map((f, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 14px', borderRadius: 10,
                    background: i === 0 ? '#FFF1F2' : '#F9FAFB',
                    border: i === 0 ? '1.5px solid #FECDD3' : '1px solid #F3F4F6',
                  }}>
                    <span style={{ fontSize: 13, color: '#374151' }}>{f.qtd || f.quantidade || f.qty || `Faixa ${i+1}`}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: i === 0 ? '#D41B2C' : '#1F2937' }}>
                      R$ {Number(f.preco).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Características */}
          {produto.caracteristicas?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#9CA3AF', marginBottom: 8 }}>Características</div>
              {produto.caracteristicas.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                  <span style={{ color: '#D41B2C', flexShrink: 0, marginTop: 2 }}>✓</span>
                  <span style={{ fontSize: 13, color: '#4B5563' }}>{c}</span>
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <a
            href={`https://wa.me/5527999374339?text=${encodeURIComponent(`Olá! Tenho interesse no produto: ${produto.nome}`)}`}
            target="_blank" rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', padding: '14px', borderRadius: 12,
              background: '#25D366', color: 'white', fontWeight: 700, fontSize: 15,
              textDecoration: 'none', boxShadow: '0 4px 14px rgba(37,211,102,0.35)',
            }}
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

// ---- Card de produto (dinâmico ou estático) ----
const PRODUTOS_FALLBACK = [
  { id: 'f1', nome: 'Bolsas Personalizadas', _emoji: '👜', descricao: 'Bolsas escolares, executivas e ecobags com sua logomarca ou arte personalizada.', categoria: 'Bolsas' },
  { id: 'f2', nome: 'Canecas',               _emoji: '☕', descricao: 'Canecas cerâmicas e de polímero com sublimação de alta qualidade e cores vibrantes.', categoria: 'Canecas' },
  { id: 'f3', nome: 'Bonés',                 _emoji: '🧢', descricao: 'Bonés bordados ou estampados para uniformes, brindes corporativos e eventos.', categoria: 'Bonés' },
  { id: 'f4', nome: 'Camisas',               _emoji: '👕', descricao: 'Camisas estampadas ou bordadas para equipes, eventos e uniformes profissionais.', categoria: 'Camisas' },
  { id: 'f5', nome: 'Chaveiros',             _emoji: '🔑', descricao: 'Chaveiros em acrílico, metal e emborrachado com sua arte ou foto personalizada.', categoria: 'Chaveiros' },
  { id: 'f6', nome: 'Porta-Retratos',        _emoji: '🖼️', descricao: 'Porta-retratos e miniaturas personalizadas, ótimas para presentes e lembranças.', categoria: 'Porta-Retratos' },
]

function ProductCard({ produto, onEspiar }) {
  const navigate = useNavigate()
  const preco = produto?.preco_exibicao

  return (
    <div
      onClick={() => navigate(`/produto/${slugify(produto.nome)}`)}
      style={{
        background: 'white', borderRadius: 16, overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
        transition: 'transform 0.3s, box-shadow 0.3s',
        cursor: 'pointer', display: 'flex', flexDirection: 'column',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 14px 32px rgba(0,0,0,0.12)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.07)' }}
    >
      {/* Imagem / emoji */}
      <div style={{ height: 180, background: 'linear-gradient(135deg, #F5E6E7 0%, #FECDD3 100%)', position: 'relative', flexShrink: 0 }}>
        {produto.imagem_principal
          ? <img src={produto.imagem_principal} alt={produto.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 70 }}>{produto._emoji || '🛍️'}</div>
        }
        {produto.destaque && (
          <div style={{ position: 'absolute', top: 10, left: 10, background: '#D41B2C', color: 'white', fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', padding: '3px 10px', borderRadius: 100 }}>
            Destaque
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '16px 18px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {produto.categoria && (
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#9CA3AF', marginBottom: 6 }}>{produto.categoria}</span>
        )}
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1F2937', marginBottom: 6, lineHeight: 1.3 }}>{produto.nome}</h3>
        {produto.descricao && (
          <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6, marginBottom: 12, flex: 1,
            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {produto.descricao}
          </p>
        )}

        {/* Preço + botão */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 10, borderTop: '1px solid #F3F4F6' }}>
          <div>
            {preco != null
              ? <>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#D41B2C' }}>
                    R$ {Number(preco).toFixed(2).replace('.', ',')}
                  </div>
                  <div style={{ fontSize: 11, color: '#9CA3AF' }}>a partir de (50+ un.)</div>
                </>
              : <span style={{ fontSize: 13, color: '#9CA3AF' }}>Consulte o preço</span>
            }
          </div>
          <button
            onClick={() => navigate(`/produto/${slugify(produto.nome)}`)}
            style={{
              background: '#1F2937', color: 'white',
              border: 'none', borderRadius: 10,
              padding: '9px 16px', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', transition: 'background 0.2s',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#D41B2C'}
            onMouseLeave={e => e.currentTarget.style.background = '#1F2937'}
          >
            Ver Produto →
          </button>
        </div>
      </div>
    </div>
  )
}

// ---- Carrossel do Hero (lado direito, fade automático) ----
const HERO_SLIDES = [
  { id: 1, emoji: '👜', label: 'Bolsas Personalizadas',  sub: 'Escolares, executivas e ecobags',   bg: 'linear-gradient(145deg, #1a0a2e 0%, #3d1a6e 100%)' },
  { id: 2, emoji: '☕', label: 'Canecas Sublimadas',      sub: 'Alta qualidade, cores vibrantes',    bg: 'linear-gradient(145deg, #0a1a12 0%, #1B6E3C 100%)' },
  { id: 3, emoji: '🧢', label: 'Bonés Personalizados',   sub: 'Bordado e silk-screen profissional', bg: 'linear-gradient(145deg, #0a1428 0%, #1a3a6e 100%)' },
  { id: 4, emoji: '🔑', label: 'Chaveiros & Brindes',    sub: 'Acrílico, metal e emborrachado',     bg: 'linear-gradient(145deg, #280a0a 0%, #7F1D1D 100%)' },
  { id: 5, emoji: '🖼️', label: 'Porta-Retratos',         sub: 'Presentes e lembranças únicas',      bg: 'linear-gradient(145deg, #1a1208 0%, #6e4a1a 100%)' },
]

function HeroCarousel({ dbSlides }) {
  // Usa banners do banco se disponíveis, caso contrário usa slides padrão
  const slides = (dbSlides && dbSlides.length > 0) ? dbSlides : HERO_SLIDES
  const isDb   = dbSlides && dbSlides.length > 0

  const [cur, setCur]   = useState(0)
  const [prev, setPrev] = useState(null)

  // Reinicia índice se a fonte de slides mudar
  useEffect(() => { setCur(0); setPrev(null) }, [isDb])

  useEffect(() => {
    const t = setInterval(() => {
      setPrev(cur)
      setCur(c => (c + 1) % slides.length)
      setTimeout(() => setPrev(null), 600)
    }, 4000)
    return () => clearInterval(t)
  }, [cur, slides.length])

  function goTo(i) {
    if (i === cur) return
    setPrev(cur); setCur(i)
    setTimeout(() => setPrev(null), 600)
  }

  const slide = slides[cur]

  function renderSlideInner(s, anim) {
    if (isDb) {
      // Banner do banco: mostra imagem de fundo
      return (
        <div key={s.id || anim} style={{
          position: 'absolute', inset: 0, borderRadius: 20, overflow: 'hidden',
          animation: anim,
          boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
        }}>
          <img
            src={s.imagem_desk || s.imagem_mob}
            alt={s.titulo || 'Banner'}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          {/* Overlay escuro sutil no rodapé */}
          {s.titulo && (
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)',
              padding: '48px 24px 24px', borderRadius: '0 0 20px 20px',
            }}>
              <div style={{ fontSize: 'clamp(15px, 2vw, 19px)', fontWeight: 800, color: 'white', lineHeight: 1.3 }}>
                {s.titulo}
              </div>
            </div>
          )}
        </div>
      )
    }
    // Slides padrão (emoji + gradiente)
    return (
      <div key={s.id || anim} style={{
        position: 'absolute', inset: 0, borderRadius: 20, overflow: 'hidden',
        background: s.bg,
        animation: anim,
        boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 40%, rgba(212,27,44,0.25) 0%, transparent 65%)' }} />
        <div style={{ position: 'absolute', inset: 0, borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)' }} />
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 'clamp(72px, 10vw, 110px)',
          filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.4))',
        }}>
          {s.emoji}
        </div>
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
          padding: '48px 24px 24px', borderRadius: '0 0 20px 20px',
        }}>
          <div style={{ fontSize: 'clamp(15px, 2vw, 19px)', fontWeight: 800, color: 'white', lineHeight: 1.3 }}>{s.label}</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>{s.sub}</div>
        </div>
        <div style={{
          position: 'absolute', top: 16, right: 16,
          background: 'rgba(212,27,44,0.85)', backdropFilter: 'blur(8px)',
          color: 'white', fontSize: 10, fontWeight: 800,
          letterSpacing: 1.5, textTransform: 'uppercase',
          padding: '4px 12px', borderRadius: 100,
        }}>Dita Bolsas</div>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', maxHeight: 420 }}>
      <style>{`
        @keyframes heroFadeIn  { from { opacity: 0; transform: scale(1.04); } to { opacity: 1; transform: scale(1); } }
        @keyframes heroFadeOut { from { opacity: 1; } to { opacity: 0; } }
      `}</style>

      {/* Slide atual */}
      {renderSlideInner(slide, 'heroFadeIn 0.6s ease forwards')}

      {/* Slide anterior a sair */}
      {prev !== null && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 20, overflow: 'hidden',
          ...(isDb ? {} : { background: slides[prev].bg }),
          animation: 'heroFadeOut 0.5s ease forwards',
          zIndex: -1,
        }}>
          {isDb && slides[prev] && (
            <img
              src={slides[prev].imagem_desk || slides[prev].imagem_mob}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          )}
        </div>
      )}

      {/* Dots */}
      <div style={{
        position: 'absolute', bottom: -28, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', gap: 6,
      }}>
        {slides.map((_, i) => (
          <button key={i} onClick={() => goTo(i)} style={{
            width: i === cur ? 24 : 7, height: 7, borderRadius: 4, padding: 0, border: 'none',
            background: i === cur ? '#D41B2C' : 'rgba(255,255,255,0.3)',
            cursor: 'pointer', transition: 'all 0.3s',
          }} />
        ))}
      </div>
    </div>
  )
}

// ---- Carrossel de galeria (clean, arrasto + autoplay) ----
const SLIDES = [
  { id: 1, label: 'Bolsas Personalizadas', sub: 'Escolares, executivas e ecobags',  color: '#1a1a2e' },
  { id: 2, label: 'Canecas',               sub: 'Sublimação de alta qualidade',     color: '#16213e' },
  { id: 3, label: 'Bonés e Uniformes',     sub: 'Bordado e estampa profissional',   color: '#0f3460' },
  { id: 4, label: 'Camisas',               sub: 'Para equipes e eventos',           color: '#1b1b2f' },
  { id: 5, label: 'Chaveiros',             sub: 'Acrílico, metal e emborrachado',   color: '#162447' },
  { id: 6, label: 'Porta-Retratos',        sub: 'Presentes e lembranças únicas',    color: '#1f1b24' },
]

function Carousel() {
  const total = SLIDES.length
  const [index, setIndex]     = useState(0)
  const [animate, setAnimate] = useState(true)
  const [spv, setSpv]         = useState(3)   // slides per view
  const [paused, setPaused]   = useState(false)

  // drag
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const drag = useRef({ active: false, startX: 0, lastX: 0 })

  // ── Responsive ─────────────────────────────────────────────
  useEffect(() => {
    function upd() {
      if      (window.innerWidth < 640)  setSpv(1)
      else if (window.innerWidth < 1024) setSpv(2)
      else                               setSpv(3)
    }
    upd()
    window.addEventListener('resize', upd)
    return () => window.removeEventListener('resize', upd)
  }, [])

  useEffect(() => { setIndex(0); setAnimate(false) }, [spv])

  // ── Infinite clones ────────────────────────────────────────
  const cloned   = [...SLIDES.slice(-spv), ...SLIDES, ...SLIDES.slice(0, spv)]
  const slideW   = 100 / spv
  const pos      = index + spv
  const baseX    = -(pos * slideW)

  function handleTransitionEnd() {
    if (index >= total) { setAnimate(false); setIndex(0) }
    else if (index < 0) { setAnimate(false); setIndex(total - 1) }
  }

  useEffect(() => {
    if (!animate) {
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)))
      return () => cancelAnimationFrame(id)
    }
  }, [animate])

  const next = useCallback(() => { setAnimate(true); setIndex(i => i + 1) }, [])
  const prev = useCallback(() => { setAnimate(true); setIndex(i => i - 1) }, [])

  // ── Autoplay ───────────────────────────────────────────────
  useEffect(() => {
    if (paused || isDragging) return
    const t = setInterval(next, 3500)
    return () => clearInterval(t)
  }, [paused, isDragging, next])

  // ── Drag logic ─────────────────────────────────────────────
  function startDrag(clientX) {
    drag.current = { active: true, startX: clientX, lastX: clientX }
    setIsDragging(true)
    setAnimate(false)
  }
  function moveDrag(clientX) {
    if (!drag.current.active) return
    drag.current.lastX = clientX
    setDragOffset(clientX - drag.current.startX)
  }
  function endDrag() {
    if (!drag.current.active) return
    const delta = drag.current.lastX - drag.current.startX
    drag.current.active = false
    setIsDragging(false)
    setDragOffset(0)
    setAnimate(true)
    if      (delta < -60) next()
    else if (delta >  60) prev()
  }

  // Mouse
  function onMouseDown(e) { startDrag(e.clientX) }
  useEffect(() => {
    function onMM(e) { moveDrag(e.clientX) }
    function onMU()  { endDrag() }
    window.addEventListener('mousemove', onMM)
    window.addEventListener('mouseup',  onMU)
    return () => { window.removeEventListener('mousemove', onMM); window.removeEventListener('mouseup', onMU) }
  })

  // Touch
  const onTouchStart = e => startDrag(e.touches[0].clientX)
  const onTouchMove  = e => moveDrag(e.touches[0].clientX)
  const onTouchEnd   = () => endDrag()

  const dotActive = ((index % total) + total) % total
  const trackTransform = isDragging
    ? `translateX(calc(${baseX}% + ${dragOffset}px))`
    : `translateX(${baseX}%)`

  return (
    <div
      style={{ position: 'relative', userSelect: 'none' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => { setPaused(false); endDrag() }}
    >
      {/* Viewport */}
      <div style={{ overflow: 'hidden', borderRadius: 18 }}>
        {/* Track */}
        <div
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onTransitionEnd={handleTransitionEnd}
          style={{
            display: 'flex',
            transform: trackTransform,
            transition: animate && !isDragging ? 'transform 0.55s cubic-bezier(0.25,0.1,0.25,1)' : 'none',
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
        >
          {cloned.map((slide, i) => (
            <div key={i} style={{ minWidth: `${slideW}%`, padding: '0 8px', boxSizing: 'border-box' }}>
              <div style={{
                position: 'relative', height: 400,
                borderRadius: 14, overflow: 'hidden',
                background: slide.color,
                boxShadow: '0 8px 32px rgba(0,0,0,0.20)',
              }}>
                {/* Subtle glow overlay — placeholder until real photos */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: `radial-gradient(ellipse at 30% 35%, rgba(212,27,44,0.22) 0%, transparent 60%),
                                radial-gradient(ellipse at 75% 70%, rgba(255,255,255,0.05) 0%, transparent 55%)`,
                }} />

                {/* "Em breve" pill */}
                <div style={{
                  position: 'absolute', top: 18, left: 18,
                  background: 'rgba(212,27,44,0.85)',
                  backdropFilter: 'blur(6px)',
                  color: 'white', fontSize: 10, fontWeight: 800,
                  letterSpacing: 1.5, textTransform: 'uppercase',
                  padding: '5px 12px', borderRadius: 100,
                }}>
                  Em breve
                </div>

                {/* Bottom label */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.78) 0%, transparent 100%)',
                  padding: '48px 22px 22px',
                }}>
                  <div style={{ fontSize: 17, fontWeight: 800, color: 'white', lineHeight: 1.3 }}>
                    {slide.label}
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 5 }}>
                    {slide.sub}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Arrows — frosted glass, inside the track */}
      {[{ dir: 'left', fn: prev, sym: '‹' }, { dir: 'right', fn: next, sym: '›' }].map(({ dir, fn, sym }) => (
        <button
          key={dir}
          onClick={fn}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,27,44,0.85)'; e.currentTarget.style.opacity = '1' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.opacity = '0.75' }}
          style={{
            position: 'absolute', top: '48%', transform: 'translateY(-50%)',
            [dir === 'left' ? 'left' : 'right']: 14,
            zIndex: 10, width: 40, height: 40, borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white', fontSize: 26, fontWeight: 300,
            cursor: 'pointer', opacity: 0.75,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s, opacity 0.2s',
          }}
        >
          {sym}
        </button>
      ))}

      {/* Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 20 }}>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => { setAnimate(true); setIndex(i) }}
            style={{
              width: i === dotActive ? 28 : 8, height: 8, borderRadius: 4,
              background: i === dotActive ? '#D41B2C' : '#D1D5DB',
              border: 'none', cursor: 'pointer', padding: 0,
              transition: 'width 0.3s, background 0.3s',
            }}
          />
        ))}
      </div>
    </div>
  )
}

// helper: pega o menor preço das faixas (= mais barato por unidade = 50-99+)
function menorPreco(faixas) {
  if (!faixas || !faixas.length) return null
  const precos = faixas.map(f => Number(f.preco)).filter(p => !isNaN(p))
  return precos.length ? Math.min(...precos) : null
}

export default function Home() {
  const [dbBanners,  setDbBanners]  = useState([])
  // Inicia já com o fallback embaralhado — sem skeleton, sem espera
  const [produtos,   setProdutos]   = useState(
    () => [...PRODUTOS_FALLBACK].sort(() => Math.random() - 0.5)
  )
  const [espiarProd, setEspiarProd] = useState(null)

  useEffect(() => {
    getBanners(true)
      .then(rows => { if (rows && rows.length) setDbBanners(rows) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    let cancelled = false
    // Tenta buscar do banco em background — substitui o fallback se encontrar
    getSiteProdutos({ somenteAtivos: true })
      .then(rows => {
        if (cancelled || !rows?.length) return
        const shuffled = [...rows].sort(() => Math.random() - 0.5)
        setProdutos(shuffled.map(p => ({ ...p, preco_exibicao: menorPreco(p.faixas_preco) })))
      })
      .catch(() => {}) // silencioso — mantém o fallback

    return () => { cancelled = true }
  }, [])

  // Mostra sempre exatamente 8 cards na home
  const listaCards = produtos.slice(0, 8)

  return (
    <main style={{ paddingTop: 68 }}>

      {/* ======= HERO ======= */}
      <section style={{
        minHeight: '90vh',
        background: 'linear-gradient(135deg, #1F2937 0%, #111827 60%, #7F1D1D 100%)',
        display: 'flex', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Glows de fundo */}
        <div style={{ position: 'absolute', top: -100, right: -100, width: 500, height: 500, borderRadius: '50%', background: 'rgba(212,27,44,0.15)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 350, height: 350, borderRadius: '50%', background: 'rgba(212,27,44,0.08)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <style>{`
          @media (max-width: 768px) {
            .hero-grid { grid-template-columns: 1fr !important; }
            .hero-carousel-wrap { display: none !important; }
          }
        `}</style>

        <div className="site-container" style={{ position: 'relative', zIndex: 1, padding: '80px 24px', width: '100%' }}>
          <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }}>

            {/* ── Coluna esquerda: texto ── */}
            <div>
              <div style={{ display: 'inline-block', background: 'rgba(212,27,44,0.2)', color: '#FCA5A5', fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', padding: '6px 16px', borderRadius: 100, marginBottom: 24 }}>
                Desde 2002 &middot; Serra/ES
              </div>
              <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(36px, 4.5vw, 62px)', fontWeight: 700, color: 'white', lineHeight: 1.1, marginBottom: 24 }}>
                Personalização com{' '}
                <span style={{ color: '#D41B2C' }}>tradição</span>{' '}
                e qualidade
              </h1>
              <p style={{ fontSize: 17, color: '#9CA3AF', lineHeight: 1.75, marginBottom: 40, maxWidth: 480 }}>
                Bolsas, canecas, bonés, camisas, chaveiros e muito mais. Há mais de 25 anos atendendo empresas e clientes em todo o Brasil.
              </p>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <a href="https://wa.me/5527999374339?text=Ol%C3%A1! Gostaria de fazer um or%C3%A7amento." target="_blank" rel="noopener noreferrer" className="site-btn-primary">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Pedir Orçamento
                </a>
                <Link to="/produtos" className="site-btn-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.08)' }}>
                  Ver Catálogo
                </Link>
              </div>
            </div>

            {/* ── Coluna direita: carrossel ── */}
            <div className="hero-carousel-wrap" style={{ paddingBottom: 36 }}>
              <HeroCarousel dbSlides={dbBanners} />
            </div>

          </div>
        </div>
      </section>

      {/* ======= ESTATÍSTICAS ======= */}
      <section style={{ background: '#D41B2C', padding: '48px 0' }}>
        <div className="site-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 32, textAlign: 'center' }}>
          {[
            { value: 25,    suffix: '+', label: 'Anos de Tradição' },
            { value: 10000, suffix: '+', label: 'Clientes Atendidos' },
            { value: 6,     suffix: '',  label: 'Categorias de Produtos' },
            { value: 100,   suffix: '%', label: 'Satisfação Garantida' },
          ].map(({ value, suffix, label }) => (
            <div key={label}>
              <div style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700, color: 'white' }}>
                <Counter target={value} suffix={suffix} />
              </div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: 500, marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ======= PRODUTOS EM DESTAQUE ======= */}
      <section style={{ padding: '96px 0', background: '#F9FAFB' }}>
        <div className="site-container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="section-tag">Nossos Produtos</div>
            <h2 className="section-title" style={{ marginBottom: 16 }}>Tudo que você precisa personalizado</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              Da bolsa ao chaveiro, produzimos com cuidado e qualidade cada item que leva a sua marca.
            </p>
          </div>

          {/* Grid de cards — sempre visível, sem skeleton */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {listaCards.map(p => (
              <ProductCard key={p.id} produto={p} onEspiar={setEspiarProd} />
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <Link to="/produtos" className="site-btn-primary">Ver Catálogo Completo</Link>
          </div>
        </div>
      </section>

      {/* Modal Espiar */}
      {espiarProd && <ModalEspiar produto={espiarProd} onClose={() => setEspiarProd(null)} />}

      {/* ======= GALERIA (CARROSSEL CLEAN) ======= */}
      <section style={{ padding: '96px 0', background: 'white' }}>
        <div className="site-container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="section-tag">Galeria</div>
            <h2 className="section-title" style={{ marginBottom: 16 }}>Criatividade em cada detalhe</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              Arraste ou use as setas para explorar nossos trabalhos personalizados.
            </p>
          </div>
          <Carousel />
        </div>
      </section>

      {/* ======= POR QUE ESCOLHER ======= */}
      <section style={{ padding: '96px 0', background: '#F9FAFB' }}>
        <div className="site-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 48, alignItems: 'center' }}>
            <div>
              <div className="section-tag">Por que a Dita?</div>
              <h2 className="section-title" style={{ marginBottom: 20 }}>Qualidade que fala por si</h2>
              <p className="section-subtitle" style={{ marginBottom: 32 }}>
                Com mais de 25 anos no mercado, a Dita Bolsas construiu uma reputação sólida baseada em qualidade, prazo e atendimento personalizado.
              </p>
              {[
                ['✅', 'Atendimento personalizado', 'Cada cliente recebe atenção exclusiva e orçamento sob medida.'],
                ['🚀', 'Entrega no prazo', 'Comprometimento com prazos é fundamental para o nosso negócio.'],
                ['💎', 'Material de qualidade', 'Utilizamos apenas matérias-primas selecionadas para garantir durabilidade.'],
                ['💰', 'Preço justo', 'Mais de 25 anos nos permitem oferecer os melhores preços do mercado.'],
              ].map(([icon, title, desc]) => (
                <div key={title} style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F5E6E7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                    {icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#1F2937', marginBottom: 2 }}>{title}</div>
                    <div style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.5 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: 'linear-gradient(135deg, #F5E6E7 0%, #FECDD3 100%)', borderRadius: 24, padding: '56px 40px', textAlign: 'center' }}>
              <div style={{ fontSize: 80, marginBottom: 24 }}>🎁</div>
              <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: 26, fontWeight: 700, color: '#1F2937', marginBottom: 12 }}>
                Faça um orçamento gratuito
              </h3>
              <p style={{ color: '#6B7280', fontSize: 15, marginBottom: 28, lineHeight: 1.6 }}>
                Entre em contato agora mesmo pelo WhatsApp e receba uma proposta personalizada sem compromisso.
              </p>
              <a href="https://wa.me/5527999374339?text=Ol%C3%A1! Gostaria de fazer um or%C3%A7amento." target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-block', background: '#25D366', color: 'white', padding: '14px 32px', borderRadius: 12, fontWeight: 700, fontSize: 16, boxShadow: '0 4px 14px rgba(37,211,102,0.4)' }}>
                💬 Falar no WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ======= CTA FINAL ======= */}
      <section style={{ padding: '80px 0', background: 'linear-gradient(135deg, #1F2937 0%, #7F1D1D 100%)', textAlign: 'center' }}>
        <div className="site-container">
          <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, color: 'white', marginBottom: 16 }}>
            Pronto para personalizar?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 17, marginBottom: 36, maxWidth: 500, margin: '0 auto 36px' }}>
            Atendemos empresas de todos os tamanhos. Solicite seu orçamento hoje mesmo.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="https://wa.me/5527999374339" target="_blank" rel="noopener noreferrer" className="site-btn-primary">
              Solicitar Orçamento
            </a>
            <Link to="/contato" className="site-btn-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)', background: 'transparent' }}>
              Ver Contatos
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
