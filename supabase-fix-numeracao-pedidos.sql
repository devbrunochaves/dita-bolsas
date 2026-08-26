-- =============================================================
--  supabase-fix-numeracao-pedidos.sql
--
--  Problema: get_next_pedido_numero() calculava MAX(numero)+1 a
--  cada chamada. Se dois pedidos fossem salvos quase ao mesmo
--  tempo, ambos podiam ler o mesmo MAX antes de qualquer INSERT
--  ser commitado, e os dois recebiam o mesmo número (ex: dois
--  pedidos #1).
--
--  Solução: usar uma SEQUENCE nativa do Postgres. nextval() é
--  atômico — o próprio banco garante que cada chamada concorrente
--  recebe um valor diferente, sem depender de tempo (relógio) nem
--  de reler a tabela toda. Reforçamos ainda com uma constraint
--  UNIQUE em pedidos.numero como rede de segurança final: mesmo
--  que algum caminho futuro tente gravar um número repetido, o
--  banco recusa o INSERT/UPDATE.
--
--  Rode este script uma única vez no SQL Editor do Supabase.
-- =============================================================

-- 1) Corrige duplicidades já existentes.
--    Mantém o número original no pedido mais antigo de cada grupo
--    duplicado; os demais recebem um número novo, no final da fila,
--    na ordem em que foram criados.
DO $$
DECLARE
  proximo_numero integer;
BEGIN
  SELECT COALESCE(MAX(numero), 0) + 1 INTO proximo_numero FROM pedidos;

  UPDATE pedidos p
  SET numero = proximo_numero + sub.rn - 1
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY numero ORDER BY created_at ASC) AS rn_in_group,
           ROW_NUMBER() OVER (ORDER BY created_at ASC) AS rn
    FROM pedidos
    WHERE numero IN (
      SELECT numero FROM pedidos GROUP BY numero HAVING COUNT(*) > 1
    )
  ) sub
  WHERE p.id = sub.id
    AND sub.rn_in_group > 1;   -- só renumera as cópias extras, não a primeira ocorrência
END $$;

-- 2) Cria a sequence e a sincroniza com o maior número já em uso.
CREATE SEQUENCE IF NOT EXISTS pedidos_numero_seq;
SELECT setval('pedidos_numero_seq', COALESCE((SELECT MAX(numero) FROM pedidos), 0) + 1, false);

-- 3) Garante, dali pra frente, que nunca mais haverá dois pedidos
--    com o mesmo número.
ALTER TABLE pedidos ADD CONSTRAINT pedidos_numero_unique UNIQUE (numero);

-- 4) Reescreve a função para usar a sequence (atômica) em vez de
--    MAX(numero) + 1.
CREATE OR REPLACE FUNCTION get_next_pedido_numero()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN nextval('pedidos_numero_seq');
END;
$$;

REVOKE ALL ON FUNCTION get_next_pedido_numero() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_next_pedido_numero() TO authenticated;
