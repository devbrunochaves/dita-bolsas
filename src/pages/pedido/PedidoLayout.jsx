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
  const location = useLocation()

  useEffect(() => {
    seedDadosIniciais()
  }, [])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif', background: '#F3F4F6' }}>

      {/* ===== SIDEBAR ===== */}
      <aside style={{
        width: sidebarOpen ? 240 : 64,
        background: '#1B6E3C',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowX: 'hidden',
      }}>
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

        {/* Toggle */}
        <button
          onClick={() => setSidebarOpen(o => !o)}
          style={{ margin: '12px auto', width: 32, height: 32, borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
          title={sidebarOpen ? 'Recolher menu' : 'Expandir menu'}
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>

        {/* Label seção */}
        {sidebarOpen && (
          <div style={{ padding: '4px 16px 8px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: 'rgba(255,255,255,0.4)' }}>
            Menu
          </div>
        )}

        {/* Navegação */}
        <nav style={{ flex: 1, padding: '4px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV.map(item => {
            const isActive = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to)

            return (
              <NavLink
                key={item.to}
                to={item.to}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: sidebarOpen ? '11px 16px' : '11px',
                  borderRadius: 10,
                  color: isActive ? '#1B6E3C' : 'rgba(255,255,255,0.8)',
                  background: isActive ? 'white' : 'transparent',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: 14,
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  transition: 'all 0.2s',
                  textDecoration: 'none',
                }}
                title={!sidebarOpen ? item.label : undefined}
              >
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                {sidebarOpen && item.label}
              </NavLink>
            )
          })}
        </nav>

        {/* Rodapé sidebar */}
        <div style={{ padding: '16px 8px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sidebarOpen && (
            <div style={{ padding: '8px 12px', fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
              CNPJ: 19.943.654/0001-87<br />
              Serra/ES
            </div>
          )}
          <Link to="/" style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10,
            color: 'rgba(255,255,255,0.7)', fontSize: 13, textDecoration: 'none', transition: 'all 0.2s',
            justifyContent: sidebarOpen ? 'flex-start' : 'center',
          }}>
            <span>🌐</span>
            {sidebarOpen && 'Ver Site'}
          </Link>
        </div>
      </aside>

      {/* ===== CONTEÚDO ===== */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar */}
        <header style={{ background: 'white', borderBottom: '1px solid #E5E7EB', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 700, color: '#1F2937' }}>
              {NAV.find(n => n.exact ? location.pathname === n.to : location.pathname.startsWith(n.to))?.label || 'Pedidos'}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <NavLink to="/pedido/emitir" style={{ background: '#1B6E3C', color: 'white', padding: '8px 16px', borderRadius: 8, fontWeight: 600, fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
              + Novo Pedido
            </NavLink>
          </div>
        </header>

        {/* Página atual */}
        <main style={{ flex: 1, padding: '28px 28px', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
