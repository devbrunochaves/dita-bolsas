-- ============================================================
--  Limpar contas de teste (execute no SQL Editor do Supabase)
-- ============================================================
--
--  Remove completamente os usuários de teste dos dois lugares:
--    1. public.profiles  (dados do sistema)
--    2. auth.users       (conta de autenticação)
--
--  ATENÇÃO: Não remove a conta admin (ditabolsas@yahoo.com.br)
--
--  Como rodar: Supabase → SQL Editor → cole este conteúdo → Run
-- ============================================================

-- Passo 1: Remove dos profiles (se existir)
DELETE FROM public.profiles
WHERE email IN (
  'brunochavesuk@icloud.com',
  'brunochaves2102@gmail.com'
);

-- Passo 2: Remove do auth.users (apaga a conta de autenticação)
-- O SQL Editor do Supabase tem permissão para acessar o schema auth
DELETE FROM auth.users
WHERE email IN (
  'brunochavesuk@icloud.com',
  'brunochaves2102@gmail.com'
);

-- Confirma o que foi removido (deve retornar 0 linhas)
SELECT email FROM auth.users
WHERE email IN (
  'brunochavesuk@icloud.com',
  'brunochaves2102@gmail.com'
);
