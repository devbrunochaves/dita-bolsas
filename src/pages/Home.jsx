import { Link } from 'react-router-dom'
import { useEffect, useRef, useState, useCallback } from 'react'

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

// ---- Card de produto ----
function ProductCard({ emoji, title, desc }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      transition: 'transform 0.3s, box-shadow 0.3s',
      cursor: 'pointer',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.12)' }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)' }}>
      <div style={{ height: 160, background: 'linear-gradient(135deg, #F5E6E7 0%, #FECDD3 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }}>
        {emoji}
      </div>
      <div style={{ padding: '20px 24px 24px' }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1F2937', marginBottom: 8 }}>{title}</h3>
        <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6 }}>{desc}</p>
        <Link to="/produtos" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 14, color: '#D41B2C', fontWeight: 600, fontSize: 14 }}>
          Ver mais &rarr;
        </Link>
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

export default function Home() {
  return (
    <main style={{ paddingTop: 68 }}>

      {/* ======= HERO ======= */}
      <section style={{
        minHeight: '90vh',
        background: 'linear-gradient(135deg, #1F2937 0%, #111827 60%, #7F1D1D 100%)',
        display: 'flex', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -100, right: -100, width: 500, height: 500, borderRadius: '50%', background: 'rgba(212,27,44,0.15)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 350, height: 350, borderRadius: '50%', background: 'rgba(212,27,44,0.1)', filter: 'blur(40px)' }} />

        <div className="site-container" style={{ position: 'relative', zIndex: 1, padding: '80px 24px' }}>
          <div style={{ maxWidth: 680 }}>
            <div style={{ display: 'inline-block', background: 'rgba(212,27,44,0.2)', color: '#FCA5A5', fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', padding: '6px 16px', borderRadius: 100, marginBottom: 24 }}>
              Desde 2002 &middot; Serra/ES
            </div>
            <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(38px, 6vw, 68px)', fontWeight: 700, color: 'white', lineHeight: 1.1, marginBottom: 24 }}>
              Personalização com{' '}
              <span style={{ color: '#D41B2C' }}>tradição</span>{' '}
              e qualidade
            </h1>
            <p style={{ fontSize: 18, color: '#9CA3AF', lineHeight: 1.7, marginBottom: 40, maxWidth: 540 }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            <ProductCard emoji="👜" title="Bolsas Personalizadas" desc="Bolsas escolares, executivas e ecobags com sua logomarca ou arte personalizada." />
            <ProductCard emoji="☕" title="Canecas" desc="Canecas cerâmicas e de polímero com sublimação de alta qualidade e cores vibrantes." />
            <ProductCard emoji="🧢" title="Bonés" desc="Bonés bordados ou estampados para uniformes, brindes corporativos e eventos." />
            <ProductCard emoji="👕" title="Camisas" desc="Camisas estampadas ou bordadas para equipes, eventos e uniformes profissionais." />
            <ProductCard emoji="🔑" title="Chaveiros" desc="Chaveiros em acrílico, metal e emborrachado com sua arte ou foto personalizada." />
            <ProductCard emoji="🖼️" title="Porta-Retratos" desc="Porta-retratos e miniaturas personalizadas, ótimas para presentes e lembranças." />
          </div>
          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <Link to="/produtos" className="site-btn-primary">Ver Catálogo Completo</Link>
          </div>
        </div>
      </section>

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
