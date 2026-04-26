-- ============================================================
--  Dita Bolsas — v1.2 Autenticação e Controle de Acesso
--  Execute no Supabase → SQL Editor (na ordem abaixo)
-- ============================================================

-- ============================================================
-- 1. TABELA PROFILES (vinculada ao auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nome       TEXT NOT NULL DEFAULT '',
  email      TEXT,
  tipo       TEXT NOT NULL DEFAULT 'vendedor' CHECK (tipo IN ('admin', 'vendedor')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. TRIGGER — cria profile automaticamente ao criar usuário
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, tipo)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'tipo', 'vendedor')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 3. COLUNA user_id NA TABELA PEDIDOS
-- ============================================================
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- ============================================================
-- 4. ROW LEVEL SECURITY — PROFILES
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Qualquer usuário autenticado pode ler todos os profiles
-- (necessário para verificar o tipo sem recursão)
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT TO authenticated USING (true);

-- Cada usuário pode inserir seu próprio profile
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Cada usuário pode atualizar seu próprio profile (nome)
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Admin pode atualizar qualquer profile
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
CREATE POLICY "profiles_update_admin" ON public.profiles
  FOR UPDATE TO authenticated
  USING  ((SELECT tipo FROM public.profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT tipo FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ============================================================
-- 5. ROW LEVEL SECURITY — CLIENTES
-- ============================================================
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "clientes_authenticated" ON public.clientes;
CREATE POLICY "clientes_authenticated" ON public.clientes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- 6. ROW LEVEL SECURITY — PRODUTOS
-- ============================================================
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;

-- Todos autenticados leem
DROP POLICY IF EXISTS "produtos_read" ON public.produtos;
CREATE POLICY "produtos_read" ON public.produtos
  FOR SELECT TO authenticated USING (true);

-- Só admin escreve
DROP POLICY IF EXISTS "produtos_write_admin" ON public.produtos;
CREATE POLICY "produtos_write_admin" ON public.produtos
  FOR ALL TO authenticated
  USING  ((SELECT tipo FROM public.profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT tipo FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ============================================================
-- 7. ROW LEVEL SECURITY — PEDIDOS
-- ============================================================
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

-- Admin acessa TUDO
DROP POLICY IF EXISTS "pedidos_admin" ON public.pedidos;
CREATE POLICY "pedidos_admin" ON public.pedidos
  FOR ALL TO authenticated
  USING ((SELECT tipo FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Vendedor lê apenas seus pedidos
DROP POLICY IF EXISTS "pedidos_vendedor_select" ON public.pedidos;
CREATE POLICY "pedidos_vendedor_select" ON public.pedidos
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Vendedor cria pedidos (com seu user_id)
DROP POLICY IF EXISTS "pedidos_vendedor_insert" ON public.pedidos;
CREATE POLICY "pedidos_vendedor_insert" ON public.pedidos
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Vendedor atualiza seus pedidos (ex: status)
DROP POLICY IF EXISTS "pedidos_vendedor_update" ON public.pedidos;
CREATE POLICY "pedidos_vendedor_update" ON public.pedidos
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- ============================================================
-- 8. PROMOVER PRIMEIRO ADMIN
--    Execute DEPOIS de criar o usuário no Supabase Dashboard
--    (Authentication → Users → Add User)
--    Substitua pelo seu email:
-- ============================================================
-- UPDATE public.profiles
--   SET tipo = 'admin', nome = 'Dita Bolsas Admin'
--   WHERE email = 'seuemail@gmail.com';
