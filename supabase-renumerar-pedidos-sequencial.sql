-- =============================================================
--  supabase-renumerar-pedidos-sequencial.sql
--
--  Renumera TODOS os pedidos existentes em sequência fechada,
--  sem nenhum buraco: 1, 2, 3, 4, 5... (na ordem em que foram
--  criados). Depois disso o próximo pedido emitido continua
--  exatamente de onde parou (ex: se hoje existem 21 pedidos, o
--  próximo será o #22).
--
--  Rode este script uma única vez no SQL Editor do Supabase,
--  DEPOIS de já ter rodado o supabase-fix-numeracao-pedidos.sql.
-- =============================================================

-- 1) Remove a constraint temporariamente — senão o UPDATE abaixo
--    pode falhar no meio do caminho ao tentar colocar dois pedidos
--    com o mesmo número por uma fração de segundo.
ALTER TABLE pedidos DROP CONSTRAINT IF EXISTS pedidos_numero_unique;

-- 2) Renumera todos os pedidos, do mais antigo (#1) ao mais novo,
--    sem pular nenhum número.
UPDATE pedidos p
SET numero = sub.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS rn
  FROM pedidos
) sub
WHERE p.id = sub.id;

-- 3) Recoloca a constraint — garante que nunca mais haverá dois
--    pedidos com o mesmo número.
ALTER TABLE pedidos ADD CONSTRAINT pedidos_numero_unique UNIQUE (numero);

-- 4) Ajusta a sequence para continuar exatamente depois do último
--    número usado (ex: 21 pedidos → próximo pedido = #22).
SELECT setval('pedidos_numero_seq', (SELECT COALESCE(MAX(numero), 0) FROM pedidos) + 1, false);
