// ============================================================
//  storage.js — CRUD via Supabase (PostgreSQL)
//  Todas as funções são async e retornam os dados direto.
// ============================================================

import { createClient } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

// helper: lança erro visível no console
function check(error, context) {
  if (error) {
    console.error(`[storage] Erro em ${context}:`, error.message)
    throw new Error(error.message)
  }
}

// helper interno: registra uma ação no histórico do pedido (fire-and-forget)
async function logHistorico(pedidoId, acao, userId, userName) {
  try {
    await supabase.from('pedido_historico').insert({
      pedido_id: pedidoId,
      user_id:   userId  || null,
      user_nome: userName || 'Sistema',
      acao,
    })
  } catch {
    // histórico não é crítico — silencia erros
  }
}

// ============================================================
//  CLIENTES
// ============================================================

export async function getClientes() {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .order('nome')
  check(error, 'getClientes')
  return (data || []).map(mapCliente)
}

export async function getClienteById(id) {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', id)
    .single()
  check(error, 'getClienteById')
  return mapCliente(data)
}

export async function saveCliente(cliente) {
  // mapeia camelCase → snake_case do banco
  const row = {
    nome:      cliente.nome,
    cnpj_cpf:  cliente.cnpjCpf  || null,
    endereco:  cliente.endereco  || null,
    telefone:  cliente.telefone  || null,
    bairro:    cliente.bairro    || null,
    cidade:    cliente.cidade    || null,
    estado:    cliente.estado    || 'ES',
    whatsapp:  cliente.whatsapp  || null,
    contato:   cliente.contato   || null,
    email:     cliente.email     || null,
    pgt:       cliente.pgt       || 'BOLETO',
  }

  if (cliente.id) {
    const { data, error } = await supabase
      .from('clientes')
      .update(row)
      .eq('id', cliente.id)
      .select()
      .single()
    check(error, 'saveCliente/update')
    return mapCliente(data)
  } else {
    const { data, error } = await supabase
      .from('clientes')
      .insert(row)
      .select()
      .single()
    check(error, 'saveCliente/insert')
    return mapCliente(data)
  }
}

export async function deleteCliente(id) {
  const { error } = await supabase.from('clientes').delete().eq('id', id)
  check(error, 'deleteCliente')
}

// Formata CPF (11 dígitos) ou CNPJ (14 dígitos)
function formatCnpjCpf(value) {
  if (!value) return ''
  const d = String(value).replace(/\D/g, '').slice(0, 14)
  if (d.length <= 11) {
    return d
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  }
  return d
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
}

// snake_case → camelCase
function mapCliente(r) {
  if (!r) return null
  return {
    id:       r.id,
    nome:     r.nome,
    cnpjCpf:  formatCnpjCpf(r.cnpj_cpf),
    endereco: r.endereco   || '',
    telefone: r.telefone   || '',
    bairro:   r.bairro     || '',
    cidade:   r.cidade     || '',
    estado:   r.estado     || 'ES',
    whatsapp: r.whatsapp   || '',
    contato:  r.contato    || '',
    email:    r.email      || '',
    pgt:      r.pgt        || 'BOLETO',
  }
}

// ============================================================
//  PRODUTOS
// ============================================================

export async function getProdutos() {
  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .order('codigo')
  check(error, 'getProdutos')
  return (data || []).map(mapProduto)
}

export async function getProdutoById(id) {
  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .eq('id', id)
    .single()
  check(error, 'getProdutoById')
  return mapProduto(data)
}

export async function getProdutoByCodigo(codigo) {
  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .eq('codigo', codigo)
    .maybeSingle()
  check(error, 'getProdutoByCodigo')
  return data ? mapProduto(data) : null
}

export async function saveProduto(produto) {
  const row = {
    codigo: produto.codigo,
    nome:   produto.nome,
    valor:  Number(produto.valor),
  }

  if (produto.id) {
    const { data, error } = await supabase
      .from('produtos')
      .update(row)
      .eq('id', produto.id)
      .select()
      .single()
    check(error, 'saveProduto/update')
    return mapProduto(data)
  } else {
    const { data, error } = await supabase
      .from('produtos')
      .insert(row)
      .select()
      .single()
    check(error, 'saveProduto/insert')
    return mapProduto(data)
  }
}

export async function deleteProduto(id) {
  const { error } = await supabase.from('produtos').delete().eq('id', id)
  check(error, 'deleteProduto')
}

function mapProduto(r) {
  if (!r) return null
  return { id: r.id, codigo: r.codigo, nome: r.nome, valor: Number(r.valor) }
}

// ============================================================
//  PEDIDOS
// ============================================================

export async function getPedidos() {
  const { data, error } = await supabase
    .from('pedidos')
    .select('*')
    .order('created_at', { ascending: false })
  check(error, 'getPedidos')
  return (data || []).map(mapPedido)
}

export async function savePedido(pedido) {
  // Usuário logado
  const { data: { user } } = await supabase.auth.getUser()

  // Nome do emitente via profile
  let nomeEmitente = pedido.emitidoPor || null
  if (user && !nomeEmitente) {
    const { data: prof } = await supabase
      .from('profiles').select('nome').eq('id', user.id).single()
    nomeEmitente = prof?.nome || user.email || null
  }

  // Busca o próximo número
  const { count } = await supabase
    .from('pedidos')
    .select('*', { count: 'exact', head: true })

  const row = {
    numero:           (count || 0) + 1,
    cliente_id:       pedido.cliente?.id || null,
    cliente_snapshot: pedido.cliente || null,
    itens:            pedido.itens || [],
    desconto:         Number(pedido.desconto || 0),
    valor_final:      Number(pedido.valorFinal || 0),
    observacoes:      pedido.observacoes || '',
    status:           'PENDENTE',
    emitido_por:      nomeEmitente,
    user_id:          user?.id || null,
  }

  const { data, error } = await supabase
    .from('pedidos')
    .insert(row)
    .select()
    .single()
  check(error, 'savePedido')

  // Registra criação no histórico
  logHistorico(data.id, 'Pedido criado', user?.id, nomeEmitente)

  return mapPedido(data)
}

export async function deletePedido(id) {
  const { error } = await supabase.from('pedidos').delete().eq('id', id)
  check(error, 'deletePedido')
}

export async function updatePedidoStatus(id, status) {
  const { error } = await supabase
    .from('pedidos')
    .update({ status })
    .eq('id', id)
  check(error, 'updatePedidoStatus')

  // Registra mudança de status no histórico
  const STATUS_LABEL = { PENDENTE: 'Pendente', ENTREGUE: 'Entregue', CANCELADO: 'Cancelado' }
  try {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: prof }     = await supabase.from('profiles').select('nome').eq('id', user?.id).single()
    logHistorico(id, `Status alterado para ${STATUS_LABEL[status] || status}`, user?.id, prof?.nome || user?.email)
  } catch {
    logHistorico(id, `Status alterado para ${STATUS_LABEL[status] || status}`)
  }
}

// ── Histórico ──────────────────────────────────────────────

export async function getPedidoHistorico(pedidoId) {
  const { data, error } = await supabase
    .from('pedido_historico')
    .select('*')
    .eq('pedido_id', pedidoId)
    .order('created_at', { ascending: true })
  check(error, 'getPedidoHistorico')
  return data || []
}

function mapPedido(r) {
  if (!r) return null
  return {
    id:          r.id,
    numero:      r.numero,
    cliente:     r.cliente_snapshot,
    itens:       r.itens || [],
    desconto:    Number(r.desconto || 0),
    valorFinal:  Number(r.valor_final || 0),
    observacoes: r.observacoes || '',
    dataCriacao: r.created_at,
    status:      r.status || 'PENDENTE',
    emitidoPor:  r.emitido_por || null,
  }
}

// ============================================================
//  PROFILES
// ============================================================

export async function getProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('nome')
  check(error, 'getProfiles')
  return data || []
}

export async function updateProfile(id, updates) {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
  check(error, 'updateProfile')
}

export async function criarColaborador({ email, password, nome, tipo }) {
  // 1. Verifica se já existe um profile com esse email (ativo ou desativado)
  //    Isso evita tentar criar um usuário que já existe no auth.users
  const { data: existing } = await supabase
    .from('profiles')
    .select('id, ativo')
    .eq('email', email)
    .maybeSingle()

  if (existing) {
    // Usuário já existe: apenas reativa e atualiza dados (sem novo signUp)
    const { error } = await supabase
      .from('profiles')
      .update({ nome, tipo, ativo: true })
      .eq('id', existing.id)
    if (error) throw new Error(error.message)
    return { reativado: true, user: { id: existing.id } }
  }

  // 2. Usuário novo: usa cliente temporário para NÃO deslogar o admin atual.
  //    persistSession: false → sessão fica só em memória, não toca o localStorage
  //    do cliente principal, portanto o onAuthStateChange do admin não dispara.
  const tempClient = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
  )

  const { data, error } = await tempClient.auth.signUp({
    email,
    password,
    options: { data: { nome, tipo } },
  })
  if (error) throw new Error(error.message)

  // O trigger handle_new_user cria o profile automaticamente com nome e tipo
  // vindos de raw_user_meta_data. Nenhuma ação adicional necessária aqui.
  return data
}

export async function deleteColaborador(id) {
  // Soft delete via função SQL com SECURITY DEFINER (apenas admin pode chamar)
  // Define ativo = false em vez de excluir — evita problemas de "already registered"
  const { error } = await supabase.rpc('excluir_colaborador', { profile_id: id })
  check(error, 'deleteColaborador')
}

// ============================================================
//  SEED — só popula se banco estiver vazio
// ============================================================

export async function seedDadosIniciais() {
  const { count } = await supabase
    .from('produtos')
    .select('*', { count: 'exact', head: true })

  if (count === 0) {
    const produtos = [
      { codigo: '1001', nome: 'Estojo Duplo Liso - VERNIZ/PERSONAGENS',  valor: 19.15 },
      { codigo: '1002', nome: 'Estojo Duplo Liso - LONA',                valor: 15.90 },
      { codigo: '1003', nome: 'Estojo Duplo - COLORIDO',                 valor: 18.29 },
      { codigo: '1004', nome: 'Estojo Duplo - METALASÊ',                 valor: 18.29 },
      { codigo: '1005', nome: 'Estojo Duplo - PERSONAGENS/LONA',         valor: 16.70 },
      { codigo: '1006', nome: 'Estojo Mônica - LISO',                    valor:  5.99 },
      { codigo: '1007', nome: 'Estojo Mônica - COLORIDO',                valor:  6.99 },
      { codigo: '1008', nome: 'Estojo Mônica - PERSONAGENS',             valor:  6.99 },
      { codigo: '1009', nome: 'Case - COLORIDO',                         valor: 12.90 },
      { codigo: '1010', nome: 'Case - PERSONAGENS',                      valor: 12.90 },
      { codigo: '1011', nome: 'Box - PERSONAGENS/LISO',                  valor: 22.90 },
      { codigo: '1012', nome: 'Box - COLORIDO ou Transparente',          valor: 23.90 },
      { codigo: '1013', nome: 'Porta Lápis Fino - LONA',                 valor:  3.79 },
      { codigo: '1014', nome: 'Porta Lápis Fino - COLORIDO',             valor:  4.95 },
      { codigo: '1015', nome: 'Porta Lápis Fino - METALASÊ',             valor:  5.49 },
      { codigo: '1016', nome: 'Porta Lápis Fino - PERSONAGENS',          valor:  5.49 },
      { codigo: '1017', nome: 'Estojo Redondo',                          valor:  5.90 },
      { codigo: '1018', nome: 'Necessaire Porta Moedas',                 valor:  8.50 },
      { codigo: '1019', nome: 'Necessaire 15x25',                        valor: 17.45 },
      { codigo: '1020', nome: 'Necessaire Envelope Térmica',             valor: 22.00 },
      { codigo: '1021', nome: 'Lancheira Mochila/Térmica',               valor: 22.90 },
      { codigo: '1022', nome: 'Porta Chuteiras',                         valor: 21.90 },
      { codigo: '1023', nome: 'Maleta Térmica Paola',                    valor: 45.00 },
      { codigo: '1024', nome: 'Ecobag Térmica',                          valor: 28.00 },
      { codigo: '1025', nome: 'Ecobag Simples',                          valor: 20.00 },
      { codigo: '1026', nome: 'Mochila Infantil Térmica',                valor: 22.90 },
      { codigo: '1027', nome: 'Mochila Infantil Simples',                valor: 17.98 },
      { codigo: '1028', nome: 'Bolsa Cenoura',                           valor: 12.00 },
      { codigo: '1029', nome: 'Bolsa Ovo de Páscoa',                     valor: 16.00 },
      { codigo: '1030', nome: 'Necessaire Redonda com Alça',             valor: 16.00 },
      { codigo: '1031', nome: 'Mala de Viagem Pequena - 40x20cm',        valor: 40.00 },
      { codigo: '1032', nome: 'Mala de Viagem Média - 48x22cm',          valor: 50.00 },
      { codigo: '1033', nome: 'Mala de Viagem Grande - 53x30cm',         valor: 60.00 },
      { codigo: '1034', nome: 'Mala de Viagem Oval',                     valor: 65.00 },
      { codigo: '1035', nome: 'Bolsa Coração Pequena',                   valor: 16.00 },
      { codigo: '1036', nome: 'Bolsa Coração Grande',                    valor: 18.00 },
      { codigo: '1037', nome: 'Caneca de Porcelana Branca',              valor: 30.00 },
      { codigo: '1038', nome: 'Mochila Sport G',                         valor: 99.00 },
      { codigo: '1039', nome: 'Mochila Adulto Luxo',                     valor: 34.97 },
      { codigo: '1041', nome: 'Mochila Infantil Simples P',              valor: 19.99 },
      { codigo: '1042', nome: 'Mochila Infantil Simples G',              valor: 25.49 },
      { codigo: '1043', nome: 'Porta Lápis Fino de Verniz',              valor:  4.99 },
      { codigo: '1044', nome: 'Estojo Quadrado Liso G',                  valor:  6.99 },
      { codigo: '1045', nome: 'Estojo Quadrado G Colorido',              valor:  8.99 },
      { codigo: '1046', nome: 'Estojo Duplo Transparente/Neon',          valor: 19.99 },
      { codigo: '1047', nome: 'Necesser Neon 15x25',                     valor: 17.00 },
      { codigo: '1048', nome: 'Box de Lona Liso',                        valor: 19.90 },
      { codigo: '1050', nome: 'Estojo Fino Transp/Neon',                 valor:  5.49 },
      { codigo: '1051', nome: 'Estojo Quadrado Neon/Transparente',       valor:  9.99 },
      { codigo: '1052', nome: 'Mochila Infantil Transp/Neon',            valor: 30.00 },
      { codigo: '1053', nome: 'Kit Maletinha com Box',                   valor: 45.00 },
      { codigo: '1054', nome: 'Maletinha + 1 Necesser Box',              valor: 35.00 },
      { codigo: '1055', nome: 'Maletinha',                               valor: 25.00 },
      { codigo: '1056', nome: 'Estojo Duplo Luxo',                       valor: 17.99 },
      { codigo: '1057', nome: 'Necesser Luxo Prada 15x25',               valor: 15.99 },
      { codigo: '1058', nome: 'Necesser Box Luxo Prada',                 valor: 11.99 },
    ]
    await supabase.from('produtos').insert(produtos)
  }
}
