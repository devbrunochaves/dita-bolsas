-- ============================================================
--  MIGRAÇÃO CLIENTES v2 — Dita Bolsas
--  Adiciona rastreamento de quem cadastrou cada cliente
--  Execute no Supabase SQL Editor
-- ============================================================

-- 1. Adiciona colunas de controle na tabela clientes
ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS user_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS cadastrado_por TEXT;

-- 2. Índice para performance ao filtrar por vendedor
CREATE INDEX IF NOT EXISTS idx_clientes_user_id ON public.clientes(user_id);

-- 3. Os clientes existentes ficam sem user_id (visíveis para todos)
--    Isso é intencional: clientes antigos continuam acessíveis para não quebrar a operação

-- 4. Verificação
SELECT
  cadastrado_por,
  COUNT(*) AS total
FROM public.clientes
GROUP BY cadastrado_por
ORDER BY total DESC;
