-- =============================================================
--  supabase-pedido-numero-global.sql
--
--  Corrige a numeração global de pedidos:
--  O RLS impedia que vendedores vissem pedidos de outros usuários,
--  fazendo com que o MAX(numero) retornasse null e todos começassem
--  do #1. Esta função roda com SECURITY DEFINER (ignora RLS)
--  e retorna sempre o próximo número global correto.
-- =============================================================

CREATE OR REPLACE FUNCTION get_next_pedido_numero()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_num integer;
BEGIN
  SELECT COALESCE(MAX(numero), 0) + 1 INTO next_num FROM pedidos;
  RETURN next_num;
END;
$$;

-- Garante que apenas usuários autenticados possam chamar a função
REVOKE ALL ON FUNCTION get_next_pedido_numero() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_next_pedido_numero() TO authenticated;
