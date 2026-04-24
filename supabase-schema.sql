-- ============================================================
--  DITA BOLSAS — Schema Supabase (PostgreSQL)
--  Cole este SQL no Supabase > SQL Editor > New Query > Run
-- ============================================================

-- Extensão para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
--  TABELA: clientes
-- ============================================================
CREATE TABLE IF NOT EXISTS clientes (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome       TEXT NOT NULL,
  cnpj_cpf   TEXT,
  endereco   TEXT,
  telefone   TEXT,
  bairro     TEXT,
  cidade     TEXT,
  estado     TEXT DEFAULT 'ES',
  whatsapp   TEXT,
  contato    TEXT,
  email      TEXT,
  pgt        TEXT DEFAULT 'BOLETO',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
--  TABELA: produtos
-- ============================================================
CREATE TABLE IF NOT EXISTS produtos (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  codigo     TEXT NOT NULL UNIQUE,
  nome       TEXT NOT NULL,
  valor      NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
--  TABELA: pedidos
-- ============================================================
CREATE TABLE IF NOT EXISTS pedidos (
  id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  numero           INTEGER,
  cliente_id       UUID REFERENCES clientes(id) ON DELETE SET NULL,
  cliente_snapshot JSONB,          -- snapshot dos dados do cliente na hora do pedido
  itens            JSONB NOT NULL DEFAULT '[]',
  desconto         NUMERIC(10,2) DEFAULT 0,
  valor_final      NUMERIC(10,2),
  observacoes      TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
--  ROW LEVEL SECURITY — libera acesso público (anon key)
--  Para restringir com login no futuro, ajuste estas policies.
-- ============================================================
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso publico clientes" ON clientes FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Acesso publico produtos"  ON produtos  FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Acesso publico pedidos"   ON pedidos   FOR ALL TO anon USING (true) WITH CHECK (true);

-- ============================================================
--  DADOS INICIAIS — produtos do catálogo
-- ============================================================
INSERT INTO produtos (codigo, nome, valor) VALUES
  ('1005', 'Estojo Duplo - PERSONAGENS/LONA',  16.70),
  ('1006', 'Estojo Mônica - LISO',              5.99),
  ('1051', 'ESTOJO QUADRADO NEON/TRANSPARENTE', 9.99),
  ('1045', 'ESTOJO QUADRADO G COLORIDO',        8.99),
  ('1015', 'Porta Lápis Fino - METALASÊ',       5.49),
  ('1050', 'ESTOJO FINO TRANSP/NEON',           5.49),
  ('1046', 'ESTOJO DUPLO TRANSPARENTE/NEON',    19.99),
  ('1043', 'Porta Lápis Fino de Verniz',        4.99)
ON CONFLICT (codigo) DO NOTHING;
