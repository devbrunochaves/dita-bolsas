import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMenuOpen(false), [location])

  const links = [
    { to: '/',        label: 'Início'     },
    { to: '/produtos',label: 'Produtos'   },
    { to: '/sobre',   label: 'Sobre Nós'  },
    { to: '/contato', label: 'Contato'    },
  ]

  const active = (to) => location.pathname === to

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(12px)',
      boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.1)' : '0 1px 0 rgba(0,0,0,0.06)',
      transition: 'all 0.3s',
    }}>
      <div className="site-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: '"Playfair Display", serif', fontStyle: 'italic', fontWeight: 700, fontSize: 28, color: '#D41B2C', lineHeight: 1 }}>
            Dita
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#555', letterSpacing: 2, textTransform: 'uppercase', marginTop: 4 }}>
            Bolsas
          </span>
        </Link>

        {/* Desktop nav */}
        <nav style={{ display: 'flex', gap: 4, alignItems: 'center' }} className="desktop-nav">
          {links.map(l => (
            <Link key={l.to} to={l.to} style={{
              padding: '8px 16px',
              borderRadius: 8,
              fontSize: 15,
              fontWeight: active(l.to) ? 700 : 500,
              color: active(l.to) ? '#D41B2C' : '#374151',
              background: active(l.to) ? '#F5E6E7' : 'transparent',
              transition: 'all 0.2s',
            }}>
              {l.label}
            </Link>
          ))}
          <a
            href="https://wa.me/5527999374339"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              marginLeft: 12,
              background: '#25D366',
              color: 'white',
              padding: '9px 20px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: '0 2px 8px rgba(37,211,102,0.3)',
              transition: 'all 0.2s',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp
          </a>
        </nav>

        {/* Hamburger mobile */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="mobile-menu-btn"
          style={{
            display: 'none', border: 'none', background: 'transparent',
            padding: 8, cursor: 'pointer', color: '#374151',
          }}
          aria-label="Menu"
        >
          {menuOpen ? (
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          ) : (
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          borderTop: '1px solid #E5E7EB',
          background: 'white',
          padding: '12px 24px 20px',
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          {links.map(l => (
            <Link key={l.to} to={l.to} style={{
              padding: '12px 16px',
              borderRadius: 8,
              fontSize: 16,
              fontWeight: active(l.to) ? 700 : 500,
              color: active(l.to) ? '#D41B2C' : '#374151',
              background: active(l.to) ? '#F5E6E7' : 'transparent',
            }}>
              {l.label}
            </Link>
          ))}
          <a href="https://wa.me/5527999374339" target="_blank" rel="noopener noreferrer"
            style={{
              marginTop: 8, padding: '12px 16px', borderRadius: 8,
              background: '#25D366', color: 'white', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
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
