-- =============================================================
--  supabase-forma-pagamento.sql
--
--  Adiciona colunas de forma de pagamento na tabela pedidos.
-- =============================================================

ALTER TABLE pedidos
  ADD COLUMN IF NOT EXISTS forma_pagamento  TEXT    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS parcelas_boleto  INTEGER DEFAULT NULL;
