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
          Ver mais →
        </Link>
      </div>
    </div>
  )
}

// ---- Carrossel de galeria ----
const SLIDES = [
  { id: 1, label: 'Bolsas Personalizadas',  bg: 'linear-gradient(135deg,#F5E6E7,#FECDD3)', emoji: '👜' },
  { id: 2, label: 'Canecas',                bg: 'linear-gradient(135deg,#E0F2FE,#BAE6FD)', emoji: '☕' },
  { id: 3, label: 'Bonés e Uniformes',      bg: 'linear-gradient(135deg,#F0FDF4,#BBF7D0)', emoji: '🧢' },
  { id: 4, label: 'Camisas',                bg: 'linear-gradient(135deg,#FFF7ED,#FED7AA)', emoji: '👕' },
  { id: 5, label: 'Chaveiros',              bg: 'linear-gradient(135deg,#F5F3FF,#DDD6FE)', emoji: '🔑' },
  { id: 6, label: 'Porta-Retratos',         bg: 'linear-gradient(135deg,#FEF3C7,#FDE68A)', emoji: '🖼️' },
]

function Carousel() {
  const total = SLIDES.length
  const [index, setIndex]   = useState(0)   // logical slide index (can go –1 or total for wraparound)
  const [animate, setAnimate] = useState(true)
  const [spv, setSpv]       = useState(3)   // slides per view
  const [paused, setPaused] = useState(false)
  const trackRef = useRef(null)

  // ── Responsive slides-per-view ──────────────────────────────
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

  // Reset index when spv changes so we don't land on a clone
  useEffect(() => { setIndex(0); setAnimate(false) }, [spv])

  // ── Build cloned array: [last spv slides] + real + [first spv slides] ──
  const cloned = [
    ...SLIDES.slice(-spv),
    ...SLIDES,
    ...SLIDES.slice(0, spv),
  ]

  const slideW   = 100 / spv
  const pos      = index + spv                    // position within cloned array
  const translateX = -(pos * slideW)

  // ── After transition: jump without animation when on a clone ──
  function handleTransitionEnd() {
    if (index >= total) {
      setAnimate(false)
      setIndex(0)
    } else if (index < 0) {
      setAnimate(false)
      setIndex(total - 1)
    }
  }

  // Re-enable animation one frame after non-animated jump
  useEffect(() => {
    if (!animate) {
      const id = requestAnimationFrame(() =>
        requestAnimationFrame(() => setAnimate(true))
      )
      return () => cancelAnimationFrame(id)
    }
  }, [animate])

  const next = useCallback(() => {
    setAnimate(true)
    setIndex(i => i + 1)
  }, [])

  const prev = useCallback(() => {
    setAnimate(true)
    setIndex(i => i - 1)
  }, [])

  // ── Autoplay ────────────────────────────────────────────────
  useEffect(() => {
    if (paused) return
    const t = setInterval(next, 3000)
    return () => clearInterval(t)
  }, [paused, next])

  // ── Dot active index (always 0-5) ───────────────────────────
  const dotActive = ((index % total) + total) % total

  // ── Arrow button factory ─────────────────────────────────────
  function Arrow({ dir, onClick }) {
    return (
      <button
        onClick={onClick}
        onMouseEnter={e => { e.currentTarget.style.background = '#D41B2C'; e.currentTarget.style.color = 'white' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'white';   e.currentTarget.style.color = '#374151' }}
        style={{
          position: 'absolute', top: '45%',
          transform: 'translateY(-50%)',
          [dir === 'left' ? 'left' : 'right']: -18,
          zIndex: 10,
          width: 44, height: 44, borderRadius: '50%',
          background: 'white', border: 'none',
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          cursor: 'pointer', fontSize: 26, fontWeight: 700,
          color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.2s, color 0.2s',
        }}
      >
        {dir === 'left' ? '‹' : '›'}
      </button>
    )
  }

  return (
    <div style={{ position: 'relative', padding: '0 28px' }}>
      {/* Viewport */}
      <div
        style={{ overflow: 'hidden', borderRadius: 16 }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Track */}
        <div
          ref={trackRef}
          onTransitionEnd={handleTransitionEnd}
          style={{
            display: 'flex',
            transform: `translateX(${translateX}%)`,
            transition: animate ? 'transform 0.55s cubic-bezier(0.25,0.1,0.25,1)' : 'none',
          }}
        >
          {cloned.map((slide, i) => (
            <div
              key={i}
              style={{ minWidth: `${slideW}%`, padding: '0 10px', boxSizing: 'border-box' }}
            >
              <div style={{
                background: slide.bg,
                borderRadius: 14,
                height: 280,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 12,
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
              }}>
                <span style={{ fontSize: 72 }}>{slide.emoji}</span>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#1F2937' }}>{slide.label}</div>
                  <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>📸 Foto em breve</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Arrow dir="left"  onClick={prev} />
      <Arrow dir="right" onClick={next} />

      {/* Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => { setAnimate(true); setIndex(i) }}
            style={{
              width: i === dotActive ? 24 : 8, height: 8, borderRadius: 4,
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
        {/* Decoração de fundo */}
        <div style={{ position: 'absolute', top: -100, right: -100, width: 500, height: 500, borderRadius: '50%', background: 'rgba(212,27,44,0.15)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 350, height: 350, borderRadius: '50%', background: 'rgba(212,27,44,0.1)', filter: 'blur(40px)' }} />

        <div className="site-container" style={{ position: 'relative', zIndex: 1, padding: '80px 24px' }}>
          <div style={{ maxWidth: 680 }}>
            <div style={{ display: 'inline-block', background: 'rgba(212,27,44,0.2)', color: '#FCA5A5', fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', padding: '6px 16px', borderRadius: 100, marginBottom: 24 }}>
              Desde 2002 · Serra/ES
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
              <a href="https://wa.me/5527999374339?text=Olá! Gostaria de fazer um orçamento." target="_blank" rel="noopener noreferrer" className="site-btn-primary">
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
            { value: 25, suffix: '+', label: 'Anos de Tradição' },
            { value: 10000, suffix: '+', label: 'Clientes Atendidos' },
            { value: 6, suffix: '', label: 'Categorias de Produtos' },
            { value: 100, suffix: '%', label: 'Satisfação Garantida' },
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

      {/* ======= GALERIA DE TRABALHOS (CARROSSEL) ======= */}
      <section style={{ padding: '96px 0', background: 'white' }}>
        <div className="site-container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="section-tag">Galeria</div>
            <h2 className="section-title" style={{ marginBottom: 16 }}>Criatividade em cada detalhe</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              Confira alguns dos produtos que personalizamos com carinho para nossos clientes.
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
              <a href="https://wa.me/5527999374339?text=Olá! Gostaria de fazer um orçamento." target="_blank" rel="noopener noreferrer"
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
