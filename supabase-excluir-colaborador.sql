-- ============================================================
--  Soft delete de colaboradores (execute no SQL Editor do Supabase)
-- ============================================================
--
--  O que este script faz:
--    1. Adiciona coluna `ativo` à tabela profiles (padrão: true)
--    2. Cria (ou recria) a função excluir_colaborador que faz
--       soft delete (ativo = false) em vez de DELETE real
--
--  Como rodar: Supabase → SQL Editor → cole este conteúdo → Run
-- ============================================================

-- 1. Adiciona coluna ativo (se ainda não existir)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true NOT NULL;

-- Garante que todos os profiles existentes estão ativos
UPDATE public.profiles SET ativo = true WHERE ativo IS NULL;

-- 2. Cria/atualiza a função de desativação de colaborador
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
    RAISE EXCEPTION 'Apenas administradores podem desativar colaboradores';
  END IF;

  -- Impede que o admin desative a própria conta
  IF profile_id = auth.uid() THEN
    RAISE EXCEPTION 'Você não pode desativar sua própria conta';
  END IF;

  -- Soft delete: desativa em vez de deletar fisicamente
  -- Isso preserva o usuário no auth.users e evita "User already registered"
  -- ao recriar o colaborador depois
  UPDATE public.profiles SET ativo = false WHERE id = profile_id;
END;
$$;

-- Permite que usuários autenticados chamem a função
GRANT EXECUTE ON FUNCTION excluir_colaborador(UUID) TO authenticated;
