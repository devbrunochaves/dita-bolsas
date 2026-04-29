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

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Site institucional — público */}
        <Route path="/" element={<><Navbar /><Home /><Footer /></>} />
        <Route path="/produtos" element={<><Navbar /><Products /><Footer /></>} />
        <Route path="/sobre" element={<><Navbar /><About /><Footer /></>} />
        <Route path="/contato" element={<><Navbar /><Contact /><Footer /></>} />

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
        </Route>
      </Routes>
    </AuthProvider>
  )
}
