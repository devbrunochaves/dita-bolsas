-- ============================================================
--  MIGRAÇÃO PRODUÇÃO — Dita Bolsas v2.0
--  Execute no Supabase SQL Editor
-- ============================================================

-- Campos de controle de produção na tabela pedidos
ALTER TABLE public.pedidos
  ADD COLUMN IF NOT EXISTS status_producao        TEXT         DEFAULT 'PENDENTE',
  ADD COLUMN IF NOT EXISTS producao_iniciada_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS producao_finalizada_at TIMESTAMPTZ;

-- Todos os pedidos existentes começam como PENDENTE na produção
UPDATE public.pedidos
SET status_producao = CASE
  WHEN status = 'ENTREGUE'  THEN 'ENTREGUE'
  WHEN status = 'CANCELADO' THEN 'PENDENTE'
  ELSE 'PENDENTE'
END
WHERE status_producao IS NULL OR status_producao = '';

-- Index para performance
CREATE INDEX IF NOT EXISTS idx_pedidos_status_producao ON public.pedidos(status_producao);

-- Verificação
SELECT
  status_producao,
  COUNT(*) AS total
FROM public.pedidos
GROUP BY status_producao
ORDER BY status_producao;
