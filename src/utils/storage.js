// ============================================================
//  storage.js — CRUD via Supabase (PostgreSQL)
//  Todas as funções são async e retornam os dados direto.
// ============================================================

import { supabase } from '../lib/supabase'

// helper: lança erro visível no console
function check(error, context) {
  if (error) {
    console.error(`[storage] Erro em ${context}:`, error.message)
    throw new Error(error.message)
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
  return data || []
}

export async function getClienteById(id) {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', id)
    .single()
  check(error, 'getClienteById')
  return data
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

// snake_case → camelCase
function mapCliente(r) {
  if (!r) return null
  return {
    id:       r.id,
    nome:     r.nome,
    cnpjCpf:  r.cnpj_cpf  || '',
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
    emitido_por:      pedido.emitidoPor || null,
  }

  const { data, error } = await supabase
    .from('pedidos')
    .insert(row)
    .select()
    .single()
  check(error, 'savePedido')
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
//  SEED — só popula se banco estiver vazio
// ============================================================

export async function seedDadosIniciais() {
  const { count } = await supabase
    .from('produtos')
    .select('*', { count: 'exact', head: true })

  if (count === 0) {
    const produtos = [
      { codigo: '1005', nome: 'Estojo Duplo - PERSONAGENS/LONA',      valor: 16.70 },
      { codigo: '1006', nome: 'Estojo Mônica - LISO',                  valor: 5.99  },
      { codigo: '1051', nome: 'ESTOJO QUADRADO NEON/TRANSPARENTE',     valor: 9.99  },
      { codigo: '1045', nome: 'ESTOJO QUADRADO G COLORIDO',            valor: 8.99  },
      { codigo: '1015', nome: 'Porta Lápis Fino - METALASÊ',           valor: 5.49  },
      { codigo: '1050', nome: 'ESTOJO FINO TRANSP/NEON',               valor: 5.49  },
      { codigo: '1046', nome: 'ESTOJO DUPLO TRANSPARENTE/NEON',        valor: 19.99 },
      { codigo: '1043', nome: 'Porta Lápis Fino de Verniz',            valor: 4.99  },
    ]
    await supabase.from('produtos').insert(produtos)
  }
}
