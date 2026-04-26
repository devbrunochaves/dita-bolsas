import { Outlet, NavLink, Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { seedDadosIniciais } from '../../utils/storage'

const NAV = [
  { to: '/pedido',                    label: 'Dashboard',         icon: '📊', exact: true },
  { to: '/pedido/emitir',             label: 'Emitir Pedido',     icon: '📋' },
  { to: '/pedido/pedidos-emitidos',   label: 'Pedidos Emitidos',  icon: '📑' },
  { to: '/pedido/clientes',           label: 'Clientes',          icon: '👥' },
  { to: '/pedido/produtos',           label: 'Produtos',          icon: '📦' },
]

export default function PedidoLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileOpen, setMobileOpen]   = useState(false)
  const location = useLocation()

  useEffect(() => { seedDadosIniciais() }, [])

  // Fecha menu mobile ao navegar
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif', background: '#F3F4F6' }}>
      <style>{`
        /* ── Sidebar responsiva ── */
        .ped-aside {
          width: 240px;
          background: #1B6E3C;
          display: flex;
          flex-direction: column;
          transition: width 0.25s;
          flex-shrink: 0;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-x: hidden;
          z-index: 200;
        }
        .ped-aside.collapsed { width: 64px; }

        /* Overlay mobile */
        .ped-mobile-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 300;
        }

        /* Drawer mobile */
        .ped-mobile-drawer {
          display: none;
          position: fixed;
          top: 0; left: 0; bottom: 0;
          width: 260px;
          background: #1B6E3C;
          flex-direction: column;
          z-index: 400;
          box-shadow: 4px 0 24px rgba(0,0,0,0.2);
          transform: translateX(-100%);
          transition: transform 0.25s ease;
        }
        .ped-mobile-drawer.open { transform: translateX(0); }

        /* Botão hamburguer — só aparece no mobile */
        .ped-hamburger { display: none; }

        @media (max-width: 768px) {
          .ped-aside         { display: none !important; }
          .ped-hamburger     { display: flex !important; }
          .ped-mobile-overlay{ display: block; }
          .ped-mobile-drawer { display: flex; }
        }
      `}</style>

      {/* ===== OVERLAY MOBILE ===== */}
      {mobileOpen && (
        <div
          className="ped-mobile-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ===== DRAWER MOBILE ===== */}
      <div className={`ped-mobile-drawer${mobileOpen ? ' open' : ''}`}>
        {/* Logo + fechar */}
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontFamily: '"Playfair Display", serif', fontStyle: 'italic', fontWeight: 700, fontSize: 22, color: 'white' }}>Dita</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: 2, textTransform: 'uppercase' }}>Bolsas</span>
          </div>
          <button onClick={() => setMobileOpen(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        <div style={{ padding: '4px 16px 8px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>Menu</div>

        <nav style={{ flex: 1, padding: '4px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV.map(item => {
            const isActive = item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to)
            return (
              <NavLink key={item.to} to={item.to} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '13px 16px', borderRadius: 10,
                color: isActive ? '#1B6E3C' : 'rgba(255,255,255,0.85)',
                background: isActive ? 'white' : 'transparent',
                fontWeight: isActive ? 700 : 500, fontSize: 15,
                textDecoration: 'none', transition: 'all 0.2s',
              }}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        <div style={{ padding: '16px 8px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ padding: '8px 12px', fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
            CNPJ: 19.943.654/0001-87<br />Serra/ES
          </div>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, color: 'rgba(255,255,255,0.7)', fontSize: 13, textDecoration: 'none' }}>
            <span>🌐</span> Ver Site
          </Link>
        </div>
      </div>

      {/* ===== SIDEBAR DESKTOP ===== */}
      <aside className={`ped-aside${sidebarOpen ? '' : ' collapsed'}`}>
        {/* Logo */}
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 10, justifyContent: sidebarOpen ? 'flex-start' : 'center' }}>
          {sidebarOpen ? (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontFamily: '"Playfair Display", serif', fontStyle: 'italic', fontWeight: 700, fontSize: 22, color: 'white' }}>Dita</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: 2, textTransform: 'uppercase' }}>Bolsas</span>
            </div>
          ) : (
            <span style={{ fontFamily: '"Playfair Display", serif', fontStyle: 'italic', fontWeight: 700, fontSize: 20, color: 'white' }}>D</span>
          )}
        </div>

        {/* Toggle desktop */}
        <button
          onClick={() => setSidebarOpen(o => !o)}
          style={{ margin: '12px auto', width: 32, height: 32, borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title={sidebarOpen ? 'Recolher menu' : 'Expandir menu'}
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>

        {sidebarOpen && (
          <div style={{ padding: '4px 16px 8px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: 'rgba(255,255,255,0.4)' }}>
            Menu
          </div>
        )}

        <nav style={{ flex: 1, padding: '4px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV.map(item => {
            const isActive = item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to)
            return (
              <NavLink key={item.to} to={item.to} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: sidebarOpen ? '11px 16px' : '11px',
                borderRadius: 10,
                color: isActive ? '#1B6E3C' : 'rgba(255,255,255,0.8)',
                background: isActive ? 'white' : 'transparent',
                fontWeight: isActive ? 700 : 500, fontSize: 14,
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                transition: 'all 0.2s', textDecoration: 'none',
              }} title={!sidebarOpen ? item.label : undefined}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                {sidebarOpen && item.label}
              </NavLink>
            )
          })}
        </nav>

        <div style={{ padding: '16px 8px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sidebarOpen && (
            <div style={{ padding: '8px 12px', fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
              CNPJ: 19.943.654/0001-87<br />Serra/ES
            </div>
          )}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, color: 'rgba(255,255,255,0.7)', fontSize: 13, textDecoration: 'none', justifyContent: sidebarOpen ? 'flex-start' : 'center' }}>
            <span>🌐</span>
            {sidebarOpen && 'Ver Site'}
          </Link>
        </div>
      </aside>

      {/* ===== CONTEÚDO ===== */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar */}
        <header style={{ background: 'white', borderBottom: '1px solid #E5E7EB', padding: '0 16px 0 16px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Hamburguer — só aparece no mobile via CSS */}
            <button
              className="ped-hamburger"
              onClick={() => setMobileOpen(true)}
              style={{
                display: 'none', /* sobrescrito pelo CSS mobile */
                width: 40, height: 40, borderRadius: 10,
                border: '1px solid #E5E7EB', background: 'white',
                cursor: 'pointer', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column', gap: 5, padding: 0, flexShrink: 0,
              }}
              aria-label="Abrir menu"
            >
              <span style={{ display: 'block', width: 18, height: 2, background: '#374151', borderRadius: 2 }} />
              <span style={{ display: 'block', width: 18, height: 2, background: '#374151', borderRadius: 2 }} />
              <span style={{ display: 'block', width: 18, height: 2, background: '#374151', borderRadius: 2 }} />
            </button>

            <h1 style={{ fontSize: 16, fontWeight: 700, color: '#1F2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {NAV.find(n => n.exact ? location.pathname === n.to : location.pathname.startsWith(n.to))?.label || 'Pedidos'}
            </h1>
          </div>

          <NavLink to="/pedido/emitir" style={{ background: '#1B6E3C', color: 'white', padding: '8px 14px', borderRadius: 8, fontWeight: 600, fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', flexShrink: 0 }}>
            + Novo Pedido
          </NavLink>
        </header>

        {/* Página atual */}
        <main style={{ flex: 1, padding: '20px 16px', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
