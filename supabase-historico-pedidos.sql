-- ============================================================
--  Histórico de pedidos + permissão de exclusão para admin
--  Execute no SQL Editor do Supabase
-- ============================================================

-- 1. Tabela de histórico
CREATE TABLE IF NOT EXISTS public.pedido_historico (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id  UUID        NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
  user_id    UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  user_nome  TEXT        NOT NULL DEFAULT 'Sistema',
  acao       TEXT        NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.pedido_historico ENABLE ROW LEVEL SECURITY;

-- Admin vê todo o histórico
CREATE POLICY "admin_ve_historico" ON public.pedido_historico
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND tipo = 'admin')
  );

-- Vendedor vê apenas histórico dos próprios pedidos
CREATE POLICY "vendedor_ve_proprio_historico" ON public.pedido_historico
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pedidos
      WHERE pedidos.id = pedido_historico.pedido_id
        AND pedidos.user_id = auth.uid()
    )
  );

-- Qualquer autenticado pode inserir registros de histórico
CREATE POLICY "auth_insere_historico" ON public.pedido_historico
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- 2. Permissão de exclusão de pedidos para admin
CREATE POLICY "admin_deleta_pedidos" ON public.pedidos
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND tipo = 'admin')
  );
