import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { seedDadosIniciais } from '../../utils/storage'

export default function PedidoLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location   = useLocation()
  const navigate   = useNavigate()
  const { profile, isAdmin, signOut } = useAuth()

  // Nav dinâmico: colaboradores só para admin
  const NAV = [
    { to: '/pedido',                    label: 'Dashboard',         icon: '📊', exact: true },
    { to: '/pedido/emitir',             label: 'Emitir Pedido',     icon: '📋' },
    { to: '/pedido/pedidos-emitidos',   label: 'Pedidos Emitidos',  icon: '📑' },
    { to: '/pedido/clientes',           label: 'Clientes',          icon: '👥' },
    { to: '/pedido/produtos',           label: 'Produtos',          icon: '📦' },
    ...(isAdmin ? [{ to: '/pedido/colaboradores', label: 'Colaboradores', icon: '🔑' }] : []),
  ]

  useEffect(() => { if (isAdmin) seedDadosIniciais().catch(() => {}) }, [isAdmin])

  // Fecha menu mobile ao navegar
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  async function handleLogout() {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif', background: '#F3F4F6' }}>
      <style>{`
        .ped-aside {
          width: 240px; background: #1B6E3C;
          display: flex; flex-direction: column; flex-shrink: 0;
          position: sticky; top: 0; height: 100vh; overflow-x: hidden; z-index: 200;
        }
        .ped-mobile-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 300; }
        .ped-mobile-drawer  { display: none; position: fixed; top: 0; left: 0; bottom: 0; width: 260px; background: #1B6E3C; flex-direction: column; z-index: 400; box-shadow: 4px 0 24px rgba(0,0,0,0.2); transform: translateX(-100%); transition: transform 0.25s ease; }
        .ped-mobile-drawer.open { transform: translateX(0); }
        .ped-hamburger { display: none !important; }
        @media (max-width: 768px) {
          .ped-aside          { display: none !important; }
          .ped-hamburger      { display: flex !important; }
          .ped-mobile-overlay { display: block; }
          .ped-mobile-drawer  { display: flex; }
        }
      `}</style>

      {/* Overlay mobile */}
      {mobileOpen && <div className="ped-mobile-overlay" onClick={() => setMobileOpen(false)} />}

      {/* Drawer mobile */}
      <div className={`ped-mobile-drawer${mobileOpen ? ' open' : ''}`}>
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontFamily: '"Playfair Display", serif', fontStyle: 'italic', fontWeight: 700, fontSize: 22, color: 'white' }}>Dita</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: 2, textTransform: 'uppercase' }}>Bolsas</span>
          </div>
          <button onClick={() => setMobileOpen(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>

        {/* Info usuário mobile */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'white', fontWeight: 700, flexShrink: 0 }}>
            {(profile?.nome || '?')[0].toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.nome || 'Usuário'}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{profile?.tipo || ''}</div>
          </div>
        </div>

        <div style={{ padding: '4px 16px 8px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>Menu</div>
        <nav style={{ flex: 1, padding: '4px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV.map(item => {
            const isActive = item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to)
            return (
              <NavLink key={item.to} to={item.to} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderRadius: 10, color: isActive ? '#1B6E3C' : 'rgba(255,255,255,0.85)', background: isActive ? 'white' : 'transparent', fontWeight: isActive ? 700 : 500, fontSize: 15, textDecoration: 'none', transition: 'all 0.2s' }}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, color: 'rgba(255,255,255,0.7)', fontSize: 13, textDecoration: 'none' }}>
            <span>🌐</span> Ver Site
          </Link>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, color: '#FCA5A5', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
            <span>🚪</span> Sair
          </button>
        </div>
      </div>

      {/* Sidebar Desktop */}
      <aside className="ped-aside">
        {/* Logo */}
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontFamily: '"Playfair Display", serif', fontStyle: 'italic', fontWeight: 700, fontSize: 22, color: 'white' }}>Dita</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: 2, textTransform: 'uppercase' }}>Bolsas</span>
        </div>

        {/* Label Menu */}
        <div style={{ padding: '12px 16px 6px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: 'rgba(255,255,255,0.4)' }}>Menu</div>

        <nav style={{ flex: 1, padding: '4px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV.map(item => {
            const isActive = item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to)
            return (
              <NavLink key={item.to} to={item.to} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', borderRadius: 10, color: isActive ? '#1B6E3C' : 'rgba(255,255,255,0.8)', background: isActive ? 'white' : 'transparent', fontWeight: isActive ? 700 : 500, fontSize: 14, transition: 'all 0.2s', textDecoration: 'none' }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        {/* Rodapé desktop — usuário + links */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'white', fontWeight: 700, flexShrink: 0 }}>
              {(profile?.nome || '?')[0].toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.nome || 'Usuário'}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{profile?.tipo}</div>
            </div>
          </div>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, color: 'rgba(255,255,255,0.7)', fontSize: 13, textDecoration: 'none' }}>
            <span>🌐</span> Ver Site
          </Link>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, color: '#FCA5A5', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
            <span>🚪</span> Sair
          </button>
        </div>
      </aside>

      {/* Conteúdo */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{ background: 'white', borderBottom: '1px solid #E5E7EB', padding: '0 16px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="ped-hamburger" onClick={() => setMobileOpen(true)} style={{ display: 'none', width: 40, height: 40, borderRadius: 10, border: '1px solid #E5E7EB', background: 'white', cursor: 'pointer', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 5, padding: 0, flexShrink: 0 }} aria-label="Menu">
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

        <main style={{ flex: 1, padding: '20px 16px', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
