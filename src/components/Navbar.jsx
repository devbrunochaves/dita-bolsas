import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

// Categorias do catálogo Dita Bolsas
const CATEGORIAS = [
  ['Bolsas', 'Mochilas', 'Malinhas', 'Sacolas', 'Necessaire'],
  ['Camisas', 'Uniformes', 'Bonés', 'Aventais', 'Bordados'],
  ['Canecas', 'Copos', 'Squeezes', 'Garrafinhas', 'Chinelos'],
  ['Chaveiros', 'Porta-Retratos', 'Almofadas', 'Estojos', 'Papelaria'],
  ['Brindes Corporativos', 'Volta às Aulas', 'Linha Praia', 'Jogos', 'Outros'],
]

export default function Navbar() {
  const [scrolled,      setScrolled]  = useState(false)
  const [menuOpen,      setMenuOpen]  = useState(false)
  const [catalogoOpen,  setCatOpen]   = useState(false)
  const [mobileExpand,  setMobExpand] = useState(false)
  const location  = useLocation()
  const navigate  = useNavigate()
  const timerRef  = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false); setCatOpen(false) }, [location])

  function openCat()  { clearTimeout(timerRef.current); setCatOpen(true)  }
  function closeCat() { timerRef.current = setTimeout(() => setCatOpen(false), 120) }

  const active = (to) =>
    to === '/produtos'
      ? location.pathname.startsWith('/produtos')
      : location.pathname === to

  const simpleLinks = [
    { to: '/',       label: 'Início'   },
    { to: '/sobre',  label: 'Sobre Nós'},
    { to: '/contato',label: 'Contato'  },
  ]

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(12px)',
      boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.1)' : '0 1px 0 rgba(0,0,0,0.06)',
      transition: 'all 0.3s',
    }}>
      <div className="site-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: '"Playfair Display", serif', fontStyle: 'italic', fontWeight: 700, fontSize: 28, color: '#D41B2C', lineHeight: 1 }}>Dita</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#555', letterSpacing: 2, textTransform: 'uppercase', marginTop: 4 }}>Bolsas</span>
        </Link>

        {/* Desktop nav */}
        <nav style={{ display: 'flex', gap: 4, alignItems: 'center' }} className="desktop-nav">

          {/* Início */}
          <Link to="/" style={{
            padding: '8px 16px', borderRadius: 8, fontSize: 15,
            fontWeight: active('/') ? 700 : 500,
            color: active('/') ? '#D41B2C' : '#374151',
            background: active('/') ? '#F5E6E7' : 'transparent',
            transition: 'all 0.2s', textDecoration: 'none',
          }}>Início</Link>

          {/* Catálogo com dropdown */}
          <div
            style={{ position: 'relative' }}
            onMouseEnter={openCat}
            onMouseLeave={closeCat}
          >
            <button onClick={() => navigate('/produtos')} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '8px 16px', borderRadius: 8, fontSize: 15, border: 'none', cursor: 'pointer',
              fontWeight: active('/produtos') ? 700 : 500,
              color: active('/produtos') ? '#D41B2C' : '#374151',
              background: active('/produtos') ? '#F5E6E7' : 'transparent',
              transition: 'all 0.2s',
            }}>
              Catálogo
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                style={{ transition: 'transform 0.2s', transform: catalogoOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>

            {/* Mega dropdown */}
            {catalogoOpen && (
              <div
                onMouseEnter={openCat}
                onMouseLeave={closeCat}
                style={{
                  position: 'absolute', top: '100%', left: '50%',
                  transform: 'translateX(-50%)',
                  marginTop: 8,
                  background: 'white',
                  borderRadius: 16,
                  boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
                  border: '1px solid #F3F4F6',
                  padding: '24px 28px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 140px)',
                  gap: '0 8px',
                  zIndex: 200,
                  animation: 'catFadeIn 0.18s ease',
                }}
              >
                <style>{`@keyframes catFadeIn { from { opacity:0; transform: translateX(-50%) translateY(-6px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }`}</style>
                {CATEGORIAS.map((col, ci) => (
                  <div key={ci} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {col.map(cat => (
                      <Link
                        key={cat}
                        to={`/produtos?categoria=${encodeURIComponent(cat)}`}
                        style={{
                          fontSize: 13.5, fontWeight: 500, color: '#374151',
                          padding: '7px 10px', borderRadius: 8,
                          textDecoration: 'none', whiteSpace: 'nowrap',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#F5E6E7'; e.currentTarget.style.color = '#D41B2C' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#374151' }}
                      >
                        {cat}
                      </Link>
                    ))}
                  </div>
                ))}

                {/* Rodapé do dropdown */}
                <div style={{ gridColumn: '1 / -1', marginTop: 16, paddingTop: 16, borderTop: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: '#9CA3AF' }}>Ver todos os produtos</span>
                  <Link to="/produtos" style={{ fontSize: 13, fontWeight: 700, color: '#D41B2C', textDecoration: 'none' }}>
                    Catálogo completo →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Sobre / Contato */}
          {simpleLinks.slice(1).map(l => (
            <Link key={l.to} to={l.to} style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 15,
              fontWeight: active(l.to) ? 700 : 500,
              color: active(l.to) ? '#D41B2C' : '#374151',
              background: active(l.to) ? '#F5E6E7' : 'transparent',
              transition: 'all 0.2s', textDecoration: 'none',
            }}>{l.label}</Link>
          ))}

          {/* WhatsApp */}
          <a href="https://wa.me/5527999374339" target="_blank" rel="noopener noreferrer" style={{
            marginLeft: 12, background: '#25D366', color: 'white',
            padding: '9px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 6,
            boxShadow: '0 2px 8px rgba(37,211,102,0.3)', transition: 'all 0.2s',
            textDecoration: 'none',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp
          </a>
        </nav>

        {/* Hamburger mobile */}
        <button onClick={() => setMenuOpen(o => !o)} className="mobile-menu-btn"
          style={{ display: 'none', border: 'none', background: 'transparent', padding: 8, cursor: 'pointer', color: '#374151' }}
          aria-label="Menu">
          {menuOpen
            ? <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            : <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
          }
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ borderTop: '1px solid #E5E7EB', background: 'white', padding: '12px 24px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Link to="/" style={{ padding: '12px 16px', borderRadius: 8, fontSize: 16, fontWeight: active('/') ? 700 : 500, color: active('/') ? '#D41B2C' : '#374151', background: active('/') ? '#F5E6E7' : 'transparent', textDecoration: 'none' }}>Início</Link>

          {/* Catálogo mobile com expansão */}
          <div>
            <button onClick={() => setMobExpand(v => !v)} style={{
              width: '100%', textAlign: 'left', padding: '12px 16px', borderRadius: 8, fontSize: 16,
              fontWeight: active('/produtos') ? 700 : 500,
              color: active('/produtos') ? '#D41B2C' : '#374151',
              background: active('/produtos') ? '#F5E6E7' : 'transparent',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              Catálogo
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                style={{ transition: 'transform 0.2s', transform: mobileExpand ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>
            {mobileExpand && (
              <div style={{ paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4 }}>
                <Link to="/produtos" style={{ padding: '9px 12px', borderRadius: 8, fontSize: 14, fontWeight: 700, color: '#D41B2C', textDecoration: 'none' }}>
                  Ver todos →
                </Link>
                {CATEGORIAS.flat().map(cat => (
                  <Link key={cat} to={`/produtos?categoria=${encodeURIComponent(cat)}`}
                    style={{ padding: '9px 12px', borderRadius: 8, fontSize: 14, color: '#4B5563', textDecoration: 'none' }}>
                    {cat}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link to="/sobre" style={{ padding: '12px 16px', borderRadius: 8, fontSize: 16, color: '#374151', textDecoration: 'none' }}>Sobre Nós</Link>
          <Link to="/contato" style={{ padding: '12px 16px', borderRadius: 8, fontSize: 16, color: '#374151', textDecoration: 'none' }}>Contato</Link>
          <a href="https://wa.me/5527999374339" target="_blank" rel="noopener noreferrer"
            style={{ marginTop: 8, padding: '12px 16px', borderRadius: 8, background: '#25D366', color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            WhatsApp
          </a>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
  )
}
