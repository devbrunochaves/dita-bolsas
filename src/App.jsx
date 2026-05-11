import { Component } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Products from './pages/Products'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Estrategia from './pages/Estrategia'
import Links from './pages/Links'
import PedidoLayout from './pages/pedido/PedidoLayout'
import Dashboard from './pages/pedido/Dashboard'
import EmitirPedido from './pages/pedido/EmitirPedido'
import CadastroCliente from './pages/pedido/CadastroCliente'
import CadastroProduto from './pages/pedido/CadastroProduto'
import ListaClientes from './pages/pedido/ListaClientes'
import ListaProdutos from './pages/pedido/ListaProdutos'
import PedidosEmitidos from './pages/pedido/PedidosEmitidos'
import Colaboradores from './pages/pedido/Colaboradores'
import Financeiro from './pages/pedido/Financeiro'
import MeuFinanceiro from './pages/pedido/MeuFinanceiro'
import Producao from './pages/pedido/Producao'
import GerenciarSite from './pages/pedido/GerenciarSite'
import ProductDetail from './pages/ProductDetail'

// Captura erros de renderização silenciosos que causariam tela branca
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(e) { return { error: e } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FEF2F2', fontFamily: 'Inter, sans-serif', padding: 24 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: '40px 36px', maxWidth: 500, width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ color: '#DC2626', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Erro na aplicação</h2>
            <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 20, wordBreak: 'break-word' }}>
              {this.state.error?.message || 'Erro desconhecido'}
            </p>
            <button
              onClick={() => window.location.href = '/login'}
              style={{ background: '#1B6E3C', color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
            >
              Voltar ao Login
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Routes>
          {/* Site institucional — público */}
          <Route path="/" element={<><Navbar /><Home /><Footer /></>} />
          <Route path="/produtos" element={<><Navbar /><Products /><Footer /></>} />
          <Route path="/produto/:slug" element={<><Navbar /><ProductDetail /><Footer /></>} />
          <Route path="/sobre" element={<><Navbar /><About /><Footer /></>} />
          <Route path="/contato" element={<><Navbar /><Contact /><Footer /></>} />
          <Route path="/estrategia" element={<><Navbar /><Estrategia /><Footer /></>} />
          <Route path="/links" element={<Links />} />

          {/* Login */}
          <Route path="/login" element={<Login />} />

          {/* Plataforma de pedidos — protegida */}
          <Route path="/pedido" element={
            <ProtectedRoute>
              <PedidoLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="emitir" element={<EmitirPedido />} />
            <Route path="pedidos-emitidos" element={<PedidosEmitidos />} />
            <Route path="producao" element={<Producao />} />
            <Route path="clientes" element={<ListaClientes />} />
            <Route path="clientes/novo" element={<CadastroCliente />} />
            <Route path="clientes/editar/:id" element={<CadastroCliente />} />
            <Route path="produtos" element={<ListaProdutos />} />
            <Route path="produtos/novo" element={<CadastroProduto />} />
            <Route path="produtos/editar/:id" element={<CadastroProduto />} />
            <Route path="meu-financeiro" element={<MeuFinanceiro />} />
            <Route path="colaboradores" element={
              <ProtectedRoute adminOnly>
                <Colaboradores />
              </ProtectedRoute>
            } />
            <Route path="financeiro" element={
              <ProtectedRoute adminOnly>
                <Financeiro />
              </ProtectedRoute>
            } />
            <Route path="site" element={
              <ProtectedRoute adminOnly>
                <GerenciarSite />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </AuthProvider>
    </ErrorBoundary>
  )
}
