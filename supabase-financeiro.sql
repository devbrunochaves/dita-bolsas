-- ============================================================
--  MIGRAÇÃO FINANCEIRO — Dita Bolsas v2.0
--  Execute no Supabase SQL Editor
-- ============================================================

-- 1. Comissão no perfil do colaborador/vendedor
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS comissao_percentual DECIMAL(5,2) DEFAULT 0;

-- 2. Campos financeiros no pedido
ALTER TABLE public.pedidos
  ADD COLUMN IF NOT EXISTS status_financeiro   TEXT         DEFAULT 'pendente',
  ADD COLUMN IF NOT EXISTS data_vencimento     DATE,
  ADD COLUMN IF NOT EXISTS data_pagamento      DATE,
  ADD COLUMN IF NOT EXISTS comissao_percentual DECIMAL(5,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS valor_comissao      DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS comissao_paga       BOOLEAN      DEFAULT FALSE;

-- 3. Atualiza pedidos antigos com status_financeiro correto
UPDATE public.pedidos
SET status_financeiro = CASE
  WHEN status = 'CANCELADO' THEN 'cancelado'
  ELSE 'pendente'
END
WHERE status_financeiro IS NULL OR status_financeiro = 'pendente';

-- 4. Tabela de histórico financeiro
CREATE TABLE IF NOT EXISTS public.historico_financeiro (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id  UUID        REFERENCES public.pedidos(id) ON DELETE CASCADE,
  acao       TEXT        NOT NULL,
  user_id    UUID        REFERENCES auth.users(id),
  user_nome  TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.historico_financeiro ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth users view historico_financeiro"   ON public.historico_financeiro;
DROP POLICY IF EXISTS "Auth users insert historico_financeiro" ON public.historico_financeiro;

CREATE POLICY "Auth users view historico_financeiro"
  ON public.historico_financeiro FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Auth users insert historico_financeiro"
  ON public.historico_financeiro FOR INSERT
  TO authenticated WITH CHECK (true);

-- 5. Index para performance
CREATE INDEX IF NOT EXISTS idx_pedidos_status_fin    ON public.pedidos(status_financeiro);
CREATE INDEX IF NOT EXISTS idx_pedidos_vencimento    ON public.pedidos(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_histfin_pedido        ON public.historico_financeiro(pedido_id);

-- Verificação
SELECT
  COUNT(*)                                                  AS total_pedidos,
  COUNT(*) FILTER (WHERE status_financeiro = 'pendente')   AS pendentes,
  COUNT(*) FILTER (WHERE status_financeiro = 'pago')       AS pagos,
  COUNT(*) FILTER (WHERE status_financeiro = 'cancelado')  AS cancelados
FROM public.pedidos;
