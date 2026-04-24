-- ============================================================
--  MIGRAÇÃO v1.1 — Dita Bolsas
--  Adiciona colunas de status e emitido_por na tabela pedidos
--  Cole no Supabase > SQL Editor > New Query > Run
-- ============================================================

ALTER TABLE pedidos
  ADD COLUMN IF NOT EXISTS status      TEXT DEFAULT 'PENDENTE',
  ADD COLUMN IF NOT EXISTS emitido_por TEXT;

-- Atualiza pedidos existentes que não têm status
UPDATE pedidos SET status = 'PENDENTE' WHERE status IS NULL;
