-- ============================================================
--  supabase-seed-produtos.sql — Setup completo + produtos exemplo
--  Execute TUDO de uma vez no Supabase SQL Editor
--  Se já rodou o supabase-site.sql antes, pode rodar assim mesmo
--  (os CREATE usam IF NOT EXISTS e os policies usam IF NOT EXISTS)
-- ============================================================

-- ── 1. Storage bucket (ignora se já existir) ─────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-imagens', 'site-imagens', true)
ON CONFLICT (id) DO NOTHING;

-- ── 2. Tabela de banners ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.banners (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo      TEXT,
  imagem_desk TEXT,
  imagem_mob  TEXT,
  link        TEXT,
  ordem       INTEGER     DEFAULT 0,
  ativo       BOOLEAN     DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='banners' AND policyname='banners: leitura pública'
  ) THEN
    CREATE POLICY "banners: leitura pública" ON public.banners FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='banners' AND policyname='banners: escrita autenticada'
  ) THEN
    CREATE POLICY "banners: escrita autenticada" ON public.banners FOR ALL
      USING (auth.role() = 'authenticated')
      WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;

-- ── 3. Tabela de produtos do site ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.site_produtos (
  id               UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  nome             TEXT    NOT NULL,
  categoria        TEXT    DEFAULT 'Geral',
  descricao        TEXT,
  imagem_principal TEXT,
  imagens          TEXT[]  DEFAULT '{}',
  faixas_preco     JSONB   DEFAULT '[]'::jsonb,
  caracteristicas  TEXT[]  DEFAULT '{}',
  ativo            BOOLEAN DEFAULT true,
  destaque         BOOLEAN DEFAULT false,
  ordem            INTEGER DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.site_produtos ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='site_produtos' AND policyname='site_produtos: leitura pública'
  ) THEN
    CREATE POLICY "site_produtos: leitura pública" ON public.site_produtos FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='site_produtos' AND policyname='site_produtos: escrita autenticada'
  ) THEN
    CREATE POLICY "site_produtos: escrita autenticada" ON public.site_produtos FOR ALL
      USING (auth.role() = 'authenticated')
      WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;

-- ── 4. Tabela de configurações do site ───────────────────────
CREATE TABLE IF NOT EXISTS public.site_config (
  chave TEXT PRIMARY KEY,
  valor TEXT
);

ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='site_config' AND policyname='site_config: leitura pública'
  ) THEN
    CREATE POLICY "site_config: leitura pública" ON public.site_config FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='site_config' AND policyname='site_config: escrita autenticada'
  ) THEN
    CREATE POLICY "site_config: escrita autenticada" ON public.site_config FOR ALL
      USING (auth.role() = 'authenticated')
      WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;

INSERT INTO public.site_config (chave, valor) VALUES
  ('whatsapp',        '5527999374339'),
  ('hero_titulo',     'Bolsas & Acessórios'),
  ('hero_subtitulo',  'Personalizados para festas, escolas e presentes especiais'),
  ('instagram',       '@ditabolsas')
ON CONFLICT (chave) DO NOTHING;

-- ── 5. Políticas de storage (ignora se já existirem) ─────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='objects' AND policyname='site-imagens: leitura pública'
  ) THEN
    CREATE POLICY "site-imagens: leitura pública"
      ON storage.objects FOR SELECT USING (bucket_id = 'site-imagens');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='objects' AND policyname='site-imagens: upload autenticado'
  ) THEN
    CREATE POLICY "site-imagens: upload autenticado"
      ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = 'site-imagens' AND auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='objects' AND policyname='site-imagens: delete autenticado'
  ) THEN
    CREATE POLICY "site-imagens: delete autenticado"
      ON storage.objects FOR DELETE
      USING (bucket_id = 'site-imagens' AND auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='objects' AND policyname='site-imagens: update autenticado'
  ) THEN
    CREATE POLICY "site-imagens: update autenticado"
      ON storage.objects FOR UPDATE
      USING (bucket_id = 'site-imagens' AND auth.role() = 'authenticated');
  END IF;
END $$;

-- ── 6. Produtos de exemplo ────────────────────────────────────
INSERT INTO public.site_produtos
  (nome, categoria, descricao, faixas_preco, ativo, destaque, ordem)
VALUES
(
  'Bolsa Escolar Personalizada',
  'Bolsas',
  'Bolsa escolar resistente com zíper duplo, alças reforçadas e frente personalizável com silk-screen ou bordado. Ideal para escolas, cursinhos e uniformes corporativos. Disponível em diversas cores.',
  '[{"qtd":"10 a 19 unidades","preco":45.90},{"qtd":"20 a 29 unidades","preco":41.50},{"qtd":"30 a 39 unidades","preco":38.00},{"qtd":"40 a 49 unidades","preco":35.50},{"qtd":"50 a 99 unidades","preco":32.00},{"qtd":"100+ unidades","preco":28.90}]'::jsonb,
  true, true, 1
),
(
  'Sacola Ecobag Premium',
  'Sacolas',
  'Ecobag em TNT reforçado ou algodão com impressão colorida. Resistente, lavável e ecologicamente responsável. Ótima para eventos, feiras, supermercados e brindes empresariais.',
  '[{"qtd":"10 a 19 unidades","preco":18.50},{"qtd":"20 a 29 unidades","preco":16.00},{"qtd":"30 a 39 unidades","preco":14.50},{"qtd":"40 a 49 unidades","preco":13.00},{"qtd":"50 a 99 unidades","preco":11.50},{"qtd":"100+ unidades","preco":9.90}]'::jsonb,
  true, false, 2
),
(
  'Mochila Executiva',
  'Mochilas',
  'Mochila executiva com compartimento para notebook ate 15 polegadas, bolsos organizadores e personalizacao por bordado ou silk-screen. Material resistente a agua. Ideal para empresas e eventos corporativos.',
  '[{"qtd":"10 a 19 unidades","preco":89.90},{"qtd":"20 a 29 unidades","preco":82.00},{"qtd":"30 a 39 unidades","preco":76.00},{"qtd":"40 a 49 unidades","preco":71.00},{"qtd":"50 a 99 unidades","preco":65.00},{"qtd":"100+ unidades","preco":58.50}]'::jsonb,
  true, true, 3
),
(
  'Caneca de Porcelana Sublimada',
  'Canecas',
  'Caneca de porcelana branca 325ml com sublimacao em alta resolucao. Suporta lava-loucas (lado externo). Ideal para brindes corporativos, presentes e eventos. Impressao em 360 graus disponivel.',
  '[{"qtd":"10 a 19 unidades","preco":22.50},{"qtd":"20 a 29 unidades","preco":19.90},{"qtd":"30 a 39 unidades","preco":17.50},{"qtd":"40 a 49 unidades","preco":16.00},{"qtd":"50 a 99 unidades","preco":14.50},{"qtd":"100+ unidades","preco":12.90}]'::jsonb,
  true, true, 4
),
(
  'Caneca Esmaltada',
  'Canecas',
  'Caneca esmaltada 300ml com arte personalizada por silk-screen. Resistente e duravel, com aparencia rustica e charmosa. Muito usada em festas, eventos e campanhas de marketing.',
  '[{"qtd":"10 a 19 unidades","preco":19.90},{"qtd":"20 a 29 unidades","preco":17.50},{"qtd":"30 a 39 unidades","preco":15.50},{"qtd":"40 a 49 unidades","preco":14.00},{"qtd":"50 a 99 unidades","preco":12.50},{"qtd":"100+ unidades","preco":11.00}]'::jsonb,
  true, false, 5
),
(
  'Bone Aba Curva Bordado',
  'Bonés',
  'Bone aba curva com fechamento snapback e bordado digitalizado em alta definicao. Estrutura 6 gomos, ajuste em couro sintetico. Ideal para uniformes, times esportivos e brindes.',
  '[{"qtd":"10 a 19 unidades","preco":38.00},{"qtd":"20 a 29 unidades","preco":34.00},{"qtd":"30 a 39 unidades","preco":31.00},{"qtd":"40 a 49 unidades","preco":28.50},{"qtd":"50 a 99 unidades","preco":25.90},{"qtd":"100+ unidades","preco":22.50}]'::jsonb,
  true, false, 6
),
(
  'Camiseta Dry Fit Personalizada',
  'Camisas',
  'Camiseta em tecido dry fit 100% poliester com sublimacao total ou parcial. Leve, respiravel e de secagem rapida. Perfeita para eventos esportivos, academias, times e uniformes.',
  '[{"qtd":"10 a 19 unidades","preco":35.00},{"qtd":"20 a 29 unidades","preco":31.00},{"qtd":"30 a 39 unidades","preco":28.50},{"qtd":"40 a 49 unidades","preco":26.00},{"qtd":"50 a 99 unidades","preco":23.90},{"qtd":"100+ unidades","preco":21.00}]'::jsonb,
  true, true, 7
),
(
  'Camiseta Algodao com Estampa',
  'Camisas',
  'Camiseta malha PV ou 100% algodao penteado com estampa silk-screen de ate 4 cores. Acabamento de qualidade, cores vibrantes e duradouras. Ideal para eventos, promocoes e uniformes casuais.',
  '[{"qtd":"10 a 19 unidades","preco":28.00},{"qtd":"20 a 29 unidades","preco":25.00},{"qtd":"30 a 39 unidades","preco":22.50},{"qtd":"40 a 49 unidades","preco":20.50},{"qtd":"50 a 99 unidades","preco":18.90},{"qtd":"100+ unidades","preco":16.50}]'::jsonb,
  true, false, 8
),
(
  'Chaveiro Acrilico Personalizado',
  'Chaveiros',
  'Chaveiro em acrilico cristal com impressao digital em alta resolucao. Acabamento polido, argola e corrente incluidas. Otimo para brindes, lembrancas de eventos e campanhas promocionais.',
  '[{"qtd":"10 a 19 unidades","preco":8.90},{"qtd":"20 a 29 unidades","preco":7.50},{"qtd":"30 a 39 unidades","preco":6.50},{"qtd":"40 a 49 unidades","preco":5.90},{"qtd":"50 a 99 unidades","preco":5.20},{"qtd":"100+ unidades","preco":4.50}]'::jsonb,
  true, false, 9
),
(
  'Squeeze Personalizado 500ml',
  'Squeezes',
  'Squeeze plastico resistente 500ml com tampa rosqueada e bico flip-top. Personalizacao por silk-screen de 1 a 4 cores. Ideal para academias, eventos esportivos e brindes corporativos.',
  '[{"qtd":"10 a 19 unidades","preco":18.90},{"qtd":"20 a 29 unidades","preco":16.50},{"qtd":"30 a 39 unidades","preco":14.90},{"qtd":"40 a 49 unidades","preco":13.50},{"qtd":"50 a 99 unidades","preco":12.00},{"qtd":"100+ unidades","preco":10.50}]'::jsonb,
  true, false, 10
),
(
  'Almofada Sublimada 40x40',
  'Almofadas',
  'Almofada 40x40cm com capa em oxford 100% poliester e sublimacao em alta resolucao em toda a frente. Enchimento fibra siliconada incluso. Ideal para presentes, decoracao e brindes.',
  '[{"qtd":"10 a 19 unidades","preco":32.00},{"qtd":"20 a 29 unidades","preco":28.50},{"qtd":"30 a 39 unidades","preco":25.90},{"qtd":"40 a 49 unidades","preco":23.50},{"qtd":"50 a 99 unidades","preco":21.00},{"qtd":"100+ unidades","preco":18.90}]'::jsonb,
  true, false, 11
),
(
  'Necessaire Personalizada',
  'Necessaire',
  'Necessaire em neoprene ou courino com ziper de qualidade e personalizacao por silk-screen ou bordado. Disponivel em varios tamanhos. Ideal para brindes, kits e lembrancas de evento.',
  '[{"qtd":"10 a 19 unidades","preco":24.90},{"qtd":"20 a 29 unidades","preco":21.50},{"qtd":"30 a 39 unidades","preco":19.00},{"qtd":"40 a 49 unidades","preco":17.50},{"qtd":"50 a 99 unidades","preco":15.90},{"qtd":"100+ unidades","preco":14.00}]'::jsonb,
  true, true, 12
);
