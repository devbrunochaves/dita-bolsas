-- ============================================================
--  supabase-security.sql
--  Execute TUDO de uma vez no Supabase SQL Editor
--  Implementa: RLS completo + triggers de timestamp
-- ============================================================

-- ── 1. HABILITAR RLS NAS TABELAS SEM PROTEÇÃO ────────────────

ALTER TABLE public.clientes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedido_historico    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_financeiro ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles            ENABLE ROW LEVEL SECURITY;

-- ── 2. CLIENTES ───────────────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='clientes' AND policyname='clientes: leitura própria ou admin'
  ) THEN
    CREATE POLICY "clientes: leitura própria ou admin"
      ON public.clientes FOR SELECT
      USING (
        auth.uid() = user_id
        OR EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND tipo = 'admin'
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='clientes' AND policyname='clientes: inserção autenticada'
  ) THEN
    CREATE POLICY "clientes: inserção autenticada"
      ON public.clientes FOR INSERT
      WITH CHECK (auth.role() = 'authenticated');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='clientes' AND policyname='clientes: edição própria ou admin'
  ) THEN
    CREATE POLICY "clientes: edição própria ou admin"
      ON public.clientes FOR UPDATE
      USING (
        auth.uid() = user_id
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND tipo = 'admin')
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='clientes' AND policyname='clientes: exclusão própria ou admin'
  ) THEN
    CREATE POLICY "clientes: exclusão própria ou admin"
      ON public.clientes FOR DELETE
      USING (
        auth.uid() = user_id
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND tipo = 'admin')
      );
  END IF;
END $$;

-- ── 3. PEDIDOS ────────────────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='pedidos' AND policyname='pedidos: leitura própria ou admin'
  ) THEN
    CREATE POLICY "pedidos: leitura própria ou admin"
      ON public.pedidos FOR SELECT
      USING (
        auth.uid() = user_id
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND tipo = 'admin')
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='pedidos' AND policyname='pedidos: inserção autenticada'
  ) THEN
    CREATE POLICY "pedidos: inserção autenticada"
      ON public.pedidos FOR INSERT
      WITH CHECK (auth.role() = 'authenticated');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='pedidos' AND policyname='pedidos: edição própria ou admin'
  ) THEN
    CREATE POLICY "pedidos: edição própria ou admin"
      ON public.pedidos FOR UPDATE
      USING (
        auth.uid() = user_id
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND tipo = 'admin')
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='pedidos' AND policyname='pedidos: exclusão somente admin'
  ) THEN
    CREATE POLICY "pedidos: exclusão somente admin"
      ON public.pedidos FOR DELETE
      USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND tipo = 'admin')
      );
  END IF;
END $$;

-- ── 4. PEDIDO_HISTORICO ───────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='pedido_historico' AND policyname='historico_pedido: leitura via pedido'
  ) THEN
    CREATE POLICY "historico_pedido: leitura via pedido"
      ON public.pedido_historico FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.pedidos p
          WHERE p.id = pedido_id
            AND (
              p.user_id = auth.uid()
              OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND tipo = 'admin')
            )
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='pedido_historico' AND policyname='historico_pedido: inserção autenticada'
  ) THEN
    CREATE POLICY "historico_pedido: inserção autenticada"
      ON public.pedido_historico FOR INSERT
      WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;

-- ── 5. HISTORICO_FINANCEIRO ───────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='historico_financeiro' AND policyname='historico_fin: somente admin'
  ) THEN
    CREATE POLICY "historico_fin: somente admin"
      ON public.historico_financeiro FOR ALL
      USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND tipo = 'admin')
      )
      WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND tipo = 'admin')
      );
  END IF;
END $$;

-- ── 6. PRODUTOS (catálogo interno de pedidos) ─────────────────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='produtos' AND policyname='produtos: leitura autenticada'
  ) THEN
    CREATE POLICY "produtos: leitura autenticada"
      ON public.produtos FOR SELECT
      USING (auth.role() = 'authenticated');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='produtos' AND policyname='produtos: escrita somente admin'
  ) THEN
    CREATE POLICY "produtos: escrita somente admin"
      ON public.produtos FOR ALL
      USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND tipo = 'admin')
      )
      WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND tipo = 'admin')
      );
  END IF;
END $$;

-- ── 7. PROFILES ───────────────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='profiles: leitura própria ou admin'
  ) THEN
    CREATE POLICY "profiles: leitura própria ou admin"
      ON public.profiles FOR SELECT
      USING (
        id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND tipo = 'admin')
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='profiles: inserção pelo sistema'
  ) THEN
    -- Necessário para o trigger que cria o profile no signup
    CREATE POLICY "profiles: inserção pelo sistema"
      ON public.profiles FOR INSERT
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='profiles: edição própria ou admin'
  ) THEN
    CREATE POLICY "profiles: edição própria ou admin"
      ON public.profiles FOR UPDATE
      USING (
        id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND tipo = 'admin')
      );
  END IF;
END $$;

-- ── 8. TRIGGER — TIMESTAMPS DE PRODUÇÃO ──────────────────────
--  Sobrescreve qualquer valor enviado pelo frontend com NOW() do banco.
--  Garante integridade mesmo que o cliente manipule os dados.

CREATE OR REPLACE FUNCTION fn_producao_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  -- Volta ao início: limpa todos os timestamps
  IF NEW.status_producao = 'PENDENTE'
     AND OLD.status_producao IS DISTINCT FROM 'PENDENTE' THEN
    NEW.producao_iniciada_at   := NULL;
    NEW.producao_finalizada_at := NULL;
    RETURN NEW;
  END IF;

  -- Entra em produção: registra início se ainda não tem
  IF NEW.status_producao = 'EM_PRODUCAO'
     AND OLD.status_producao IS DISTINCT FROM 'EM_PRODUCAO' THEN
    IF NEW.producao_iniciada_at IS NULL THEN
      NEW.producao_iniciada_at := NOW();
    END IF;
    -- Se voltou de FINALIZADO, limpa a finalização
    NEW.producao_finalizada_at := NULL;
    RETURN NEW;
  END IF;

  -- Finalizado: registra fim e garante início
  IF NEW.status_producao = 'FINALIZADO'
     AND OLD.status_producao IS DISTINCT FROM 'FINALIZADO' THEN
    IF NEW.producao_iniciada_at IS NULL THEN
      NEW.producao_iniciada_at := NOW();
    END IF;
    NEW.producao_finalizada_at := NOW();
    RETURN NEW;
  END IF;

  -- Entregue: garante início e fim registrados
  IF NEW.status_producao = 'ENTREGUE'
     AND OLD.status_producao IS DISTINCT FROM 'ENTREGUE' THEN
    IF NEW.producao_iniciada_at IS NULL THEN
      NEW.producao_iniciada_at := NOW();
    END IF;
    IF NEW.producao_finalizada_at IS NULL THEN
      NEW.producao_finalizada_at := NOW();
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove trigger anterior se existir, recria limpo
DROP TRIGGER IF EXISTS trg_producao_timestamps ON public.pedidos;

CREATE TRIGGER trg_producao_timestamps
  BEFORE UPDATE ON public.pedidos
  FOR EACH ROW
  WHEN (OLD.status_producao IS DISTINCT FROM NEW.status_producao)
  EXECUTE FUNCTION fn_producao_timestamps();

-- ── 9. FUNÇÃO AUXILIAR — verificar se usuário é admin ────────
--  Usada internamente pelas policies (evita subquery repetida)

CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND tipo = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── FIM ───────────────────────────────────────────────────────
