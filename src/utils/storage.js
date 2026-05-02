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

// helper: registra no histórico do pedido (fire-and-forget)
async function logHistorico(pedidoId, acao, userId, userName) {
  try {
    await supabase.from('pedido_historico').insert({
      pedido_id: pedidoId,
      user_id:   userId  || null,
      user_nome: userName || 'Sistema',
      acao,
    })
  } catch { /* histórico não é crítico */ }
}

// helper: registra no histórico financeiro (fire-and-forget)
async function logHistoricoFin(pedidoId, acao, userId, userName) {
  try {
    await supabase.from('historico_financeiro').insert({
      pedido_id: pedidoId,
      user_id:   userId   || null,
      user_nome: userName || 'Sistema',
      acao,
    })
  } catch { /* silencia */ }
}

// helper: pega usuário logado + profile
async function getUserAndProfile() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { user: null, profile: null }
    const { data: profile } = await supabase
      .from('profiles')
      .select('nome, tipo, comissao_percentual')
      .eq('id', user.id)
      .single()
    return { user, profile }
  } catch {
    return { user: null, profile: null }
  }
}

// ============================================================
//  CLIENTES
// ============================================================

export async function getClientes() {
  const { user, profile } = await getUserAndProfile()
  const isAdmin = profile?.tipo === 'admin'

  let query = supabase.from('clientes').select('*').order('nome')

  // Vendedor só vê os clientes que ele cadastrou
  // (clientes sem user_id = antigos, visíveis para todos)
  if (!isAdmin && user) {
    query = query.or(`user_id.eq.${user.id},user_id.is.null`)
  }

  const { data, error } = await query
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
    // Edição: não altera quem cadastrou
    const { data, error } = await supabase
      .from('clientes').update(row).eq('id', cliente.id).select().single()
    check(error, 'saveCliente/update')
    return mapCliente(data)
  } else {
    // Novo cliente: registra quem cadastrou
    const { user, profile } = await getUserAndProfile()
    row.user_id        = user?.id   || null
    row.cadastrado_por = profile?.nome || user?.email || null

    const { data, error } = await supabase
      .from('clientes').insert(row).select().single()
    check(error, 'saveCliente/insert')
    return mapCliente(data)
  }
}

export async function deleteCliente(id) {
  const { error } = await supabase.from('clientes').delete().eq('id', id)
  check(error, 'deleteCliente')
}

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

function mapCliente(r) {
  if (!r) return null
  return {
    id:            r.id,
    nome:          r.nome,
    cnpjCpf:       formatCnpjCpf(r.cnpj_cpf),
    endereco:      r.endereco      || '',
    telefone:      r.telefone      || '',
    bairro:        r.bairro        || '',
    cidade:        r.cidade        || '',
    estado:        r.estado        || 'ES',
    whatsapp:      r.whatsapp      || '',
    contato:       r.contato       || '',
    email:         r.email         || '',
    pgt:           r.pgt           || 'BOLETO',
    cadastradoPor: r.cadastrado_por || null,
    userId:        r.user_id        || null,
  }
}

// ============================================================
//  PRODUTOS
// ============================================================

export async function getProdutos() {
  const { data, error } = await supabase
    .from('produtos').select('*').order('codigo')
  check(error, 'getProdutos')
  return (data || []).map(mapProduto)
}

export async function getProdutoById(id) {
  const { data, error } = await supabase
    .from('produtos').select('*').eq('id', id).single()
  check(error, 'getProdutoById')
  return mapProduto(data)
}

export async function getProdutoByCodigo(codigo) {
  const { data, error } = await supabase
    .from('produtos').select('*').eq('codigo', codigo).maybeSingle()
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
      .from('produtos').update(row).eq('id', produto.id).select().single()
    check(error, 'saveProduto/update')
    return mapProduto(data)
  } else {
    const { data, error } = await supabase
      .from('produtos').insert(row).select().single()
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
  const { user, profile } = await getUserAndProfile()

  const nomeEmitente      = profile?.nome || user?.email || pedido.emitidoPor || null
  const comissaoPercent   = Number(profile?.comissao_percentual || 0)
  const valorFinal        = Number(pedido.valorFinal || 0)
  const valorComissao     = parseFloat(((valorFinal * comissaoPercent) / 100).toFixed(2))

  // Busca próximo número
  const { count } = await supabase
    .from('pedidos')
    .select('*', { count: 'exact', head: true })

  // Data do pedido — pode ser retroativa (enviada pelo formulário) ou agora
  const dataPedido = pedido.data
    ? new Date(pedido.data + 'T12:00:00').toISOString()
    : new Date().toISOString()

  const row = {
    numero:              (count || 0) + 1,
    cliente_id:          pedido.cliente?.id || null,
    cliente_snapshot:    pedido.cliente || null,
    itens:               pedido.itens || [],
    desconto:            Number(pedido.desconto || 0),
    valor_final:         valorFinal,
    observacoes:         pedido.observacoes || '',
    status:              'PENDENTE',
    emitido_por:         nomeEmitente,
    user_id:             user?.id || null,
    created_at:          dataPedido,
    // Financeiro
    status_financeiro:   'pendente',
    comissao_percentual: comissaoPercent,
    valor_comissao:      valorComissao,
    comissao_paga:       false,
    // Produção
    status_producao:     'PENDENTE',
  }

  const { data, error } = await supabase
    .from('pedidos').insert(row).select().single()
  check(error, 'savePedido')

  // Histórico operacional
  logHistorico(data.id, 'Pedido criado', user?.id, nomeEmitente)

  // Histórico financeiro
  logHistoricoFin(data.id, 'Pedido criado — aguardando vencimento', user?.id, nomeEmitente)
  if (comissaoPercent > 0) {
    logHistoricoFin(
      data.id,
      `Comissão gerada: ${comissaoPercent}% = R$ ${valorComissao.toFixed(2).replace('.', ',')}`,
      user?.id,
      nomeEmitente
    )
  }

  return mapPedido(data)
}

export async function deletePedido(id) {
  const { error } = await supabase.from('pedidos').delete().eq('id', id)
  check(error, 'deletePedido')
}

export async function updatePedidoStatus(id, status) {
  const { error } = await supabase
    .from('pedidos').update({ status }).eq('id', id)
  check(error, 'updatePedidoStatus')

  const STATUS_LABEL = { PENDENTE: 'Pendente', ENTREGUE: 'Entregue', CANCELADO: 'Cancelado' }
  try {
    const { user, profile } = await getUserAndProfile()
    logHistorico(id, `Status alterado para ${STATUS_LABEL[status] || status}`, user?.id, profile?.nome)
  } catch {
    logHistorico(id, `Status alterado para ${STATUS_LABEL[status] || status}`)
  }
}

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
    id:                  r.id,
    numero:              r.numero,
    cliente:             r.cliente_snapshot,
    itens:               r.itens || [],
    desconto:            Number(r.desconto || 0),
    valorFinal:          Number(r.valor_final || 0),
    observacoes:         r.observacoes || '',
    dataCriacao:         r.created_at,
    status:              r.status || 'PENDENTE',
    emitidoPor:          r.emitido_por || null,
    userId:              r.user_id || null,
    // Financeiro
    statusFinanceiro:    r.status_financeiro  || 'pendente',
    dataVencimento:      r.data_vencimento    || null,
    dataPagamento:       r.data_pagamento     || null,
    comissaoPercentual:  Number(r.comissao_percentual || 0),
    valorComissao:       Number(r.valor_comissao || 0),
    comissaoPaga:        r.comissao_paga      || false,
    // Produção
    statusProducao:       r.status_producao        || 'PENDENTE',
    producaoIniciadaAt:   r.producao_iniciada_at   || null,
    producaoFinalizadaAt: r.producao_finalizada_at || null,
  }
}

// ============================================================
//  FINANCEIRO
// ============================================================

/**
 * Busca pedidos com filtros financeiros.
 * inicio/fim são strings 'YYYY-MM-DD' aplicadas em created_at.
 */
export async function getFinanceiro({ inicio, fim, vendedor, clienteNome, statusFinanceiro } = {}) {
  let query = supabase
    .from('pedidos')
    .select('*')
    .order('created_at', { ascending: false })

  if (inicio) query = query.gte('created_at', inicio + 'T00:00:00.000Z')
  if (fim)    query = query.lte('created_at', fim    + 'T23:59:59.999Z')
  if (vendedor && vendedor !== 'todos')
    query = query.ilike('emitido_por', `%${vendedor}%`)
  if (statusFinanceiro && statusFinanceiro !== 'todos')
    query = query.eq('status_financeiro', statusFinanceiro)

  const { data, error } = await query
  check(error, 'getFinanceiro')

  let pedidos = (data || []).map(mapPedido)

  // Filtro de cliente por nome (em cliente_snapshot)
  if (clienteNome && clienteNome.trim()) {
    const lower = clienteNome.toLowerCase()
    pedidos = pedidos.filter(p =>
      p.cliente?.nome?.toLowerCase().includes(lower)
    )
  }

  return pedidos
}

/**
 * Atualiza status financeiro de um pedido.
 * Se status = 'pago' e não informou dataPagamento, usa hoje.
 */
export async function updateStatusFinanceiro(id, statusFinanceiro, dataPagamento = null) {
  const hoje = new Date().toISOString().split('T')[0]
  const updates = { status_financeiro: statusFinanceiro }

  if (statusFinanceiro === 'pago') {
    updates.data_pagamento = dataPagamento || hoje
  } else if (statusFinanceiro === 'pendente' || statusFinanceiro === 'cancelado') {
    updates.data_pagamento = null
  }

  const { error } = await supabase.from('pedidos').update(updates).eq('id', id)
  check(error, 'updateStatusFinanceiro')

  const { user, profile } = await getUserAndProfile()
  const label = { pendente: 'Pendente', pago: 'Pago', atrasado: 'Atrasado', cancelado: 'Cancelado' }
  logHistoricoFin(
    id,
    `Status financeiro alterado para ${label[statusFinanceiro] || statusFinanceiro}`,
    user?.id,
    profile?.nome
  )
}

/** Define/atualiza a data de vencimento */
export async function updateDataVencimento(id, dataVencimento) {
  const { error } = await supabase
    .from('pedidos')
    .update({ data_vencimento: dataVencimento })
    .eq('id', id)
  check(error, 'updateDataVencimento')

  const { user, profile } = await getUserAndProfile()
  const fmt = dataVencimento
    ? new Date(dataVencimento + 'T12:00:00').toLocaleDateString('pt-BR')
    : 'removido'
  logHistoricoFin(id, `Vencimento definido: ${fmt}`, user?.id, profile?.nome)
}

/** Marca comissão de um pedido específico como paga */
export async function marcarComissaoPaga(pedidoId) {
  const { error } = await supabase
    .from('pedidos')
    .update({ comissao_paga: true })
    .eq('id', pedidoId)
  check(error, 'marcarComissaoPaga')

  const { user, profile } = await getUserAndProfile()
  logHistoricoFin(pedidoId, 'Comissão marcada como paga', user?.id, profile?.nome)
}

/** Marca comissão de TODOS os pedidos pendentes de um vendedor como pagas */
export async function marcarTodasComissoesPagas(nomeVendedor) {
  const { error } = await supabase
    .from('pedidos')
    .update({ comissao_paga: true })
    .eq('emitido_por', nomeVendedor)
    .eq('comissao_paga', false)
    .neq('status_financeiro', 'cancelado')
  check(error, 'marcarTodasComissoesPagas')

  const { user, profile } = await getUserAndProfile()
  // Log em cada pedido afetado seria custoso; registra no pedido 0 como ação geral
  // (silencia — não temos um pedido único aqui)
  console.log(`[storage] Comissões de ${nomeVendedor} marcadas como pagas por ${profile?.nome}`)
}

/** Histórico financeiro de um pedido */
export async function getHistoricoFinanceiro(pedidoId) {
  const { data, error } = await supabase
    .from('historico_financeiro')
    .select('*')
    .eq('pedido_id', pedidoId)
    .order('created_at', { ascending: true })
  check(error, 'getHistoricoFinanceiro')
  return data || []
}

// ============================================================
//  PROFILES / COLABORADORES
// ============================================================

export async function getProfiles() {
  const { data, error } = await supabase
    .from('profiles').select('*').order('nome')
  check(error, 'getProfiles')
  return data || []
}

export async function updateProfile(id, updates) {
  const { error } = await supabase
    .from('profiles').update(updates).eq('id', id)
  check(error, 'updateProfile')
}

export async function criarColaborador({ email, password, nome, tipo, comissaoPercentual = 0 }) {
  const { data: existing } = await supabase
    .from('profiles').select('id, ativo').eq('email', email).maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('profiles')
      .update({ nome, tipo, ativo: true, comissao_percentual: Number(comissaoPercentual) })
      .eq('id', existing.id)
    if (error) throw new Error(error.message)
    return { reativado: true, user: { id: existing.id } }
  }

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

  // Atualiza comissão após criar (trigger cria o profile automaticamente)
  if (data?.user?.id) {
    setTimeout(async () => {
      await supabase
        .from('profiles')
        .update({ comissao_percentual: Number(comissaoPercentual) })
        .eq('id', data.user.id)
    }, 2000)
  }

  return data
}

export async function deleteColaborador(id) {
  const { error } = await supabase.rpc('excluir_colaborador', { profile_id: id })
  check(error, 'deleteColaborador')
}

// ============================================================
//  PRODUÇÃO — Kanban
// ============================================================

/** Busca todos os pedidos para o kanban de produção */
export async function getPedidosProducao() {
  const { data, error } = await supabase
    .from('pedidos')
    .select('*')
    .not('status', 'eq', 'CANCELADO')
    .order('created_at', { ascending: false })
  check(error, 'getPedidosProducao')
  return (data || []).map(mapPedido)
}

/**
 * Move um pedido para um novo status de produção.
 * Registra timestamps automaticamente.
 */
export async function updateStatusProducao(id, novoStatus, pedidoAtual = null) {
  const agora = new Date().toISOString()
  const updates = { status_producao: novoStatus }

  if (novoStatus === 'PENDENTE') {
    // Volta ao início — limpa timestamps
    updates.producao_iniciada_at   = null
    updates.producao_finalizada_at = null
  } else if (novoStatus === 'EM_PRODUCAO') {
    // Registra início apenas se ainda não foi marcado
    if (!pedidoAtual?.producaoIniciadaAt) {
      updates.producao_iniciada_at = agora
    }
    // Se estava em FINALIZADO e voltou, limpa finalização
    updates.producao_finalizada_at = null
  } else if (novoStatus === 'FINALIZADO') {
    // Garante que tem início registrado
    if (!pedidoAtual?.producaoIniciadaAt) {
      updates.producao_iniciada_at = agora
    }
    updates.producao_finalizada_at = agora
  } else if (novoStatus === 'ENTREGUE') {
    // Se não passou por FINALIZADO, registra finalização agora
    if (!pedidoAtual?.producaoFinalizadaAt) {
      updates.producao_finalizada_at = agora
    }
    // Garante início registrado
    if (!pedidoAtual?.producaoIniciadaAt) {
      updates.producao_iniciada_at = agora
    }
    // Sincroniza status operacional
    updates.status = 'ENTREGUE'
  }

  const { error } = await supabase.from('pedidos').update(updates).eq('id', id)
  check(error, 'updateStatusProducao')

  // Histórico operacional
  const { user, profile } = await getUserAndProfile()
  const LABEL = {
    PENDENTE:    'Produção: voltou para Pendente',
    EM_PRODUCAO: 'Produção: entrou em Produção',
    FINALIZADO:  'Produção: Finalizado',
    ENTREGUE:    'Produção: Entregue ao cliente',
  }
  logHistorico(id, LABEL[novoStatus] || `Produção: ${novoStatus}`, user?.id, profile?.nome)
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
