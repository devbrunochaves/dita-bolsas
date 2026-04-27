-- ============================================================
--  Função para excluir colaborador (execute no SQL Editor do Supabase)
-- ============================================================
--
--  Esta função usa SECURITY DEFINER para bypassar o RLS e verificar
--  manualmente se quem chama é admin antes de deletar.
--
--  Como rodar: Supabase → SQL Editor → cole este conteúdo → Run
-- ============================================================

CREATE OR REPLACE FUNCTION excluir_colaborador(profile_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verifica se quem está chamando é admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND tipo = 'admin'
  ) THEN
    RAISE EXCEPTION 'Apenas administradores podem excluir colaboradores';
  END IF;

  -- Impede que o admin exclua a própria conta
  IF profile_id = auth.uid() THEN
    RAISE EXCEPTION 'Você não pode excluir sua própria conta';
  END IF;

  -- Remove o profile (revoga acesso ao sistema)
  DELETE FROM public.profiles WHERE id = profile_id;
END;
$$;

-- Permite que usuários autenticados chamem a função
GRANT EXECUTE ON FUNCTION excluir_colaborador(UUID) TO authenticated;
