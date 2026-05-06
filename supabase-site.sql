-- ============================================================
--  supabase-site.sql — Backoffice do site Dita Bolsas
--  Execute no Supabase SQL Editor (uma vez)
-- ============================================================

-- ── 1. Storage bucket público para imagens do site ──────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-imagens', 'site-imagens', true)
ON CONFLICT (id) DO NOTHING;

-- Política: leitura pública
CREATE POLICY "site-imagens: leitura pública"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'site-imagens');

-- Política: upload/delete somente para usuários autenticados
CREATE POLICY "site-imagens: upload autenticado"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'site-imagens' AND auth.role() = 'authenticated');

CREATE POLICY "site-imagens: delete autenticado"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'site-imagens' AND auth.role() = 'authenticated');

CREATE POLICY "site-imagens: update autenticado"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'site-imagens' AND auth.role() = 'authenticated');

-- ── 2. Tabela de banners ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.banners (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo        TEXT,
  imagem_desk   TEXT,        -- URL da imagem desktop (1440×520)
  imagem_mob    TEXT,        -- URL da imagem mobile  (430×320)
  link          TEXT,        -- Link opcional ao clicar
  ordem         INTEGER     DEFAULT 0,
  ativo         BOOLEAN     DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Índice para ordenação
CREATE INDEX IF NOT EXISTS idx_banners_ordem ON public.banners (ordem, ativo);

-- RLS
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "banners: leitura pública"
  ON public.banners FOR SELECT USING (true);

CREATE POLICY "banners: escrita autenticada"
  ON public.banners FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ── 3. Tabela de produtos do site (catálogo) ─────────────────
CREATE TABLE IF NOT EXISTS public.site_produtos (
  id               UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  nome             TEXT    NOT NULL,
  categoria        TEXT    DEFAULT 'Geral',
  descricao        TEXT,
  imagem_principal TEXT,                    -- URL imagem capa
  imagens          TEXT[]  DEFAULT '{}',    -- URLs imagens extras
  faixas_preco     JSONB   DEFAULT '[]',    -- [{qty, preco}]
  caracteristicas  TEXT[]  DEFAULT '{}',    -- lista de bullet points
  ativo            BOOLEAN DEFAULT true,
  destaque         BOOLEAN DEFAULT false,   -- aparece em "Queridinhos"
  ordem            INTEGER DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_site_produtos_cat    ON public.site_produtos (categoria, ativo);
CREATE INDEX IF NOT EXISTS idx_site_produtos_dest   ON public.site_produtos (destaque, ativo);

ALTER TABLE public.site_produtos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_produtos: leitura pública"
  ON public.site_produtos FOR SELECT USING (true);

CREATE POLICY "site_produtos: escrita autenticada"
  ON public.site_produtos FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ── 4. Tabela de configurações do site ───────────────────────
CREATE TABLE IF NOT EXISTS public.site_config (
  chave  TEXT PRIMARY KEY,
  valor  TEXT
);

ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_config: leitura pública"
  ON public.site_config FOR SELECT USING (true);

CREATE POLICY "site_config: escrita autenticada"
  ON public.site_config FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Valores padrão
INSERT INTO public.site_config (chave, valor) VALUES
  ('whatsapp',        '5527999374339'),
  ('hero_titulo',     'Bolsas & Acessórios'),
  ('hero_subtitulo',  'Personalizados para festas, escolas e presentes especiais'),
  ('instagram',       '@ditabolsas')
ON CONFLICT (chave) DO NOTHING;
