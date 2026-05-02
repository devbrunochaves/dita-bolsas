import { useState } from 'react'

/* ── DADOS ─────────────────────────────────────────────── */

const TABS = [
  { id: 'perfil',    label: '🎯 Perfil'      },
  { id: 'pilares',   label: '🏛️ Pilares'     },
  { id: 'calendario',label: '📅 Calendário'  },
  { id: 'feed',      label: '🖼️ Feed'        },
  { id: 'formatos',  label: '🎬 Formatos'    },
  { id: 'copies',    label: '✍️ Copies'      },
  { id: 'metricas',  label: '📊 Métricas'    },
]

const PILARES = [
  {
    emoji: '🛍️', title: 'Produto em Destaque', pct: '35%',
    pctStyle: { background: '#FEE2E2', color: '#DC2626' },
    iconBg: '#FEE2E2',
    desc: 'Fotos e vídeos dos produtos com foco em detalhes, variações de cor, personalização e uso real no dia a dia.',
    examples: ['📌 "Bolsa térmica da semana"', '📌 Close no bordado / DTF aplicado', '📌 Antes & depois da personalização', '📌 Comparativo de tamanhos e cores'],
  },
  {
    emoji: '🎓', title: 'Educação & Autoridade', pct: '25%',
    pctStyle: { background: '#DBEAFE', color: '#1D4ED8' },
    iconBg: '#DBEAFE',
    desc: 'Conteúdo que ensina e posiciona a Dita como referência no mercado de personalizados no Brasil.',
    examples: ['📌 Diferença entre sublimação e DTF', '📌 Como fazer um brinde que engaja', '📌 Tipos de tecido para bolsas', '📌 Guia: como pedir personalizado'],
  },
  {
    emoji: '🏭', title: 'Bastidores & Humanização', pct: '20%',
    pctStyle: { background: '#EDE9FE', color: '#7C3AED' },
    iconBg: '#EDE9FE',
    desc: 'Mostrar a família, a fábrica, o processo artesanal e o dia a dia. Gera conexão emocional forte.',
    examples: ['📌 Time em ação (costura, prensa)', '📌 Pedidos chegando para embalar', '📌 "Você não imagina o que vai sair daqui"', '📌 História da família Dita'],
  },
  {
    emoji: '💬', title: 'Prova Social', pct: '15%',
    pctStyle: { background: '#FEF3C7', color: '#B45309' },
    iconBg: '#FEF3C7',
    desc: 'Clientes mostrando os produtos, reviews, prints de conversas e avaliações. O melhor vendedor do mundo.',
    examples: ['📌 Repost de clientes felizes', '📌 "Meu pedido chegou!" 📦', '📌 Prints de mensagem no WhatsApp', '📌 Vídeo depoimento de cliente'],
  },
  {
    emoji: '🎯', title: 'Conversão & Oferta', pct: '5%',
    pctStyle: { background: '#DCFCE7', color: '#16A34A' },
    iconBg: '#DCFCE7',
    desc: 'Posts com CTA claro de venda, promoções, kits especiais e datas comemorativas. Usar com moderação.',
    examples: ['📌 "Dia das Mães: monte seu kit"', '📌 Kit corporativo da semana', '📌 Oferta relâmpago', '📌 Frete grátis em pedidos acima de X'],
  },
]

const WEEK = [
  { day: 'SEG', content: 'Produto da Semana',       type: 'Produto',     typeBg: '#FEE2E2', typeColor: '#DC2626' },
  { day: 'TER', content: 'Reel Bastidor / Processo', type: 'Bastidor',    typeBg: '#EDE9FE', typeColor: '#7C3AED' },
  { day: 'QUA', content: 'Dica Educativa',           type: 'Educativo',   typeBg: '#DBEAFE', typeColor: '#1D4ED8' },
  { day: 'QUI', content: 'Depoimento / Repost',      type: 'Prova Social',typeBg: '#DCFCE7', typeColor: '#16A34A' },
  { day: 'SEX', content: 'Reel Produto em Uso',      type: 'Produto',     typeBg: '#FEE2E2', typeColor: '#DC2626' },
  { day: 'SÁB', content: 'Carrossel Antes & Depois', type: 'Social',      typeBg: '#FEF3C7', typeColor: '#B45309' },
  { day: 'DOM', content: 'Descanso ou repost leve',  type: 'Off',         typeBg: '#F3F4F6', typeColor: '#6B7280' },
]

const QUARTERS = [
  { q: 'Q1 · Jan – Mar', title: '🎓 Volta às Aulas',      items: ['Mochilas infantis personalizadas', 'Kits escolares com bordado', 'Parceria com escolas e creches', 'Estojo + mochila + sacochila'] },
  { q: 'Q2 · Abr – Jun', title: '💐 Dia das Mães',        items: ['Kits presente: bolsa + caneca', 'Sublimação com foto personalizada', 'Campanha "Presenteie com carinho"', 'Caixas de presente montadas'] },
  { q: 'Q3 · Jul – Set', title: '👨 Dia dos Pais',        items: ['Brindes empresa: canecas, bolsas', 'Kits executivos personalizados', 'Planejamento kits de fim de ano', 'Uniformes e camisetas'] },
  { q: 'Q4 · Out – Dez', title: '🎄 Alta Temporada',      items: ['Black Friday: desconto em kits', 'Natal Corporativo (antecipado)', 'Confraternizações e eventos', 'Kits fim de ano para empresas'] },
]

const FEED_SEQUENCE = [
  'product','edu','behind',
  'depo','product','social',
  'behind','product','edu',
  'social','behind','depo',
  'product','edu','product',
  'depo','social','behind',
]
const FEED_COLORS = {
  product: 'linear-gradient(135deg,#E63946,#F57C3B)',
  edu:     'linear-gradient(135deg,#4361EE,#7B8EF0)',
  behind:  'linear-gradient(135deg,#7C3AED,#C084FC)',
  social:  'linear-gradient(135deg,#F59E0B,#FBBF24)',
  depo:    'linear-gradient(135deg,#059669,#34D399)',
}
const FEED_LABELS = { product:'🛍️', edu:'📚', behind:'🏭', social:'🎯', depo:'⭐' }
const FEED_LEGEND = [
  { label:'Produto',     bg:'linear-gradient(135deg,#E63946,#F57C3B)' },
  { label:'Educativo',   bg:'linear-gradient(135deg,#4361EE,#7B8EF0)' },
  { label:'Bastidor',    bg:'linear-gradient(135deg,#7C3AED,#C084FC)' },
  { label:'Social/Oferta',bg:'linear-gradient(135deg,#F59E0B,#FBBF24)' },
  { label:'Depoimento',  bg:'linear-gradient(135deg,#059669,#34D399)' },
]

const FORMATS = [
  { icon:'🎬', title:'Reels — prioridade máxima',  pct:100, color:'#E63946', desc:'Vídeos de 15–45s. Processo de produção, revelação de produto, antes & depois. O algoritmo prioriza Reels acima de qualquer outro formato.' },
  { icon:'🖼️', title:'Carrossel — maior engajamento', pct:85, color:'#4361EE', desc:'3–8 slides. Ótimo para tutoriais, antes & depois, portfólio de cores e variações de produto.' },
  { icon:'📸', title:'Foto única — produto',        pct:70, color:'#7C3AED', desc:'Foto profissional com fundo limpo. Ideal para mostrar novos produtos, detalhes de personalização e lançamentos.' },
  { icon:'📱', title:'Stories — diários',           pct:90, color:'#059669', desc:'Bastidores, enquetes, caixinha de perguntas, contagem regressiva, links diretos para WhatsApp.' },
  { icon:'🔴', title:'Live — mensal',               pct:50, color:'#F59E0B', desc:'1× por mês: tire suas dúvidas, apresentação de produtos novos, bastidor ao vivo, sorteio.' },
  { icon:'🤝', title:'Collab com clientes',         pct:75, color:'#E63946', desc:'Postar junto com clientes usando o recurso de colaboração do Instagram — dobra o alcance organicamente.' },
]

const REELS = [
  { num:'Reel 1', title:'⚡ "Do tecido ao produto"',      items:['Mostra do corte à costura', 'Música animada, corte rápido', 'Termina com produto pronto', '"Fizemos isso em 2 dias!"'] },
  { num:'Reel 2', title:'🎨 "Personalização em tempo real"', items:['Prensa aplicando sublimação', 'DTF sendo colocado na bolsa', 'Revelação antes & depois', '"Você pediu, a gente fez!"'] },
  { num:'Reel 3', title:'📦 "Pedido sendo embalado"',      items:['Unboxing invertido', 'Capricho na embalagem', '"Hoje vai sair pra [cidade]"', 'Humaniza e gera expectativa'] },
  { num:'Reel 4', title:'🌟 "Antes & depois do produto"',  items:['Produto sem personalização', 'Corte para produto com arte', 'Música de revelação', '"Qual você prefere? 👇"'] },
]

const COPIES = [
  {
    label: '🛍️ Post de Produto — Bolsa Térmica',
    text: `Sua marca merece ser vista por todo lugar que seu cliente vai. 🎨

Nossa bolsa térmica personalizada com DTF vai com ele pro almoço, pra academia, pro trabalho — e leva o nome da sua empresa junto.

✅ Sublimação ou DTF de alta qualidade
✅ Mantém a temperatura por até 5h
✅ A partir de 1 unidade
✅ Enviamos para todo o Brasil 🚚

👉 Mande uma mensagem e receba seu orçamento hoje mesmo.

#ditabolsas #bolsatermica #brindesCorporativos #personalizados #sublimacao #DTF`,
  },
  {
    label: '🏭 Post Bastidor — Processo de Produção',
    text: `Tem coisa mais satisfatória do que ver uma peça saindo do zero? 🤌

Aqui não tem mágica — tem dedicação, máquina boa e mais de 20 anos de prática.

É assim que cada bolsa é feita na Dita: do corte do tecido até o bordado final, tudo com o cuidado de quem trata o seu pedido como se fosse o nosso.

Você confia, a gente entrega. 📦

Qual produto você quer ver sendo feito? Comenta aqui 👇

#bastidores #fabricacaopropria #personalizados #ditabolsas #feitoamao`,
  },
  {
    label: '⭐ Post Depoimento / Prova Social',
    text: `Esse é o nosso combustível! ⛽❤️

Quando um cliente manda esse tipo de mensagem, a gente sabe que fez certo.

[INSIRA PRINT OU FOTO DO CLIENTE COM O PRODUTO]

Obrigada, [NOME]! Esse carinho chega até a gente.

Se você também quer um produto que surpreenda, fala com a gente. Já atendemos mais de 10.000 clientes — e cada pedido é tratado como o primeiro. 🤝

#clientesatisfeito #ditabolsas #personalizados #brindescorporativos`,
  },
  {
    label: '📚 Post Educativo — Carrossel "Sublimação vs DTF"',
    text: `Sublimação ou DTF? Qual é melhor pra sua bolsa? 🤔

Muita gente chega aqui na Dita com essa dúvida — e faz todo sentido!

Arrasta pra ver a diferença completa ➡️

[Slide 1] Sublimação: cores vibrantes, integradas ao tecido, fundo branco
[Slide 2] DTF: qualquer cor de fundo, qualquer superfície, sem limitação
[Slide 3] Quando usar cada um?
[Slide 4] Exemplos reais da nossa produção

Salvou essa dica? Manda pra quem tá planejando um brinde! 🔖

#sublimacao #DTF #personalizados #dicas #ditabolsas`,
  },
  {
    label: '🎄 Post Sazonal — Natal Corporativo',
    text: `Chegou a hora de planejar os kits de Natal da empresa! 🎄

Aqui na Dita a gente monta tudo: bolsa térmica, caneca, squeeze, chaveiro — tudo com a logo da sua empresa, tudo caprichado.

📅 Pedidos com antecedência garantem melhor prazo e preço.
📦 Enviamos para qualquer estado do Brasil.
🏆 Mais de 20 anos fazendo brindes que as pessoas guardam.

Manda uma mensagem e receba seu orçamento completo. 👇

#natalcorporativo #brindesdeNatal #kitpersonalizado #ditabolsas`,
  },
]

const METRICS = [
  { num:'4–5×', label:'Posts por semana no feed',   tip:'Consistência é o fator #1 para crescimento orgânico no Instagram' },
  { num:'3–5%', label:'Taxa de engajamento alvo',    tip:'Contas de nicho B2B + B2C bem geridas ficam entre 3–8%' },
  { num:'2×',   label:'Reels por semana',            tip:'Reels têm 3× mais alcance que posts estáticos no algoritmo atual' },
  { num:'7/7',  label:'Stories por dia',             tip:'Stories diários mantêm o perfil ativo nos feeds dos seguidores' },
]

const PHASES = [
  { num:'Mês 1–2 · Base', title:'🏗️ Reconstrução',    items:['Otimizar bio e destaques', 'Definir identidade visual', 'Montar banco de fotos', 'Começar ritmo de 4 posts/sem'] },
  { num:'Mês 3–4 · Alcance', title:'🚀 Crescimento',   items:['Focar em Reels 2×/semana', 'Collab com clientes', 'Hashtags segmentadas', 'Lives mensais'] },
  { num:'Mês 5–6 · Conversão', title:'💰 Vendas',      items:['Instagram Shopping ativado', 'Tráfego pago (R$10–30/dia)', 'Campanhas sazonais', 'Funil Stories → Link → WhatsApp'] },
]

const HASHTAGS = [
  { title:'🎯 Nicho', color:'#DC2626', tags:['#brindescorporativos','#brindesPersonalizados','#bolsasPersonalizadas','#personalizados','#kitsPersonalizados'] },
  { title:'🔵 Técnica', color:'#1D4ED8', tags:['#sublimacao','#DTF','#impressao','#camisetaDTF','#bordado'] },
  { title:'📍 Local', color:'#7C3AED', tags:['#SerraES','#EspiritoSanto','#VitoriaES','#ditabolsas'] },
  { title:'🎁 Produto', color:'#16A34A', tags:['#bolsatermica','#mochila','#canecaPersonalizada','#bone','#ecobag'] },
]

const FUNNEL = [
  { label:'🎬 Reel / Post', sub:'Atrai seguidores novos (topo do funil)', bg:'#E63946', clip:'polygon(0 0,100% 0,95% 100%,5% 100%)' },
  { label:'📱 Stories diários', sub:'Aproxima e cria desejo de comprar', bg:'#7C3AED', clip:'polygon(5% 0,95% 0,90% 100%,10% 100%)' },
  { label:'👆 Link na Bio / CTA', sub:'Direciona para o site ou catálogo', bg:'#1D4ED8', clip:'polygon(10% 0,90% 0,85% 100%,15% 100%)' },
  { label:'💬 WhatsApp', sub:'Converte a conversa em orçamento', bg:'#059669', clip:'polygon(15% 0,85% 0,80% 100%,20% 100%)' },
  { label:'🎉 Venda Fechada', sub:'Cliente satisfeito → depoimento → ciclo recomeça', bg:'#B45309', clip:'polygon(20% 0,80% 0,70% 100%,30% 100%)' },
]

/* ── HELPERS ────────────────────────────────────────────── */

const C = '#D41B2C'  // cor primária da Dita

const card = {
  background: 'white',
  border: '1px solid #E5E7EB',
  borderRadius: 16,
  padding: 24,
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
}

const tip = {
  background: '#FFFBEB',
  border: '1px solid #FDE68A',
  borderLeft: '4px solid #F59E0B',
  borderRadius: 12,
  padding: '14px 18px',
  fontSize: 14,
  lineHeight: 1.7,
  marginBottom: 24,
}

const sectionLabel = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 1.5,
  textTransform: 'uppercase',
  color: C,
  marginBottom: 8,
}

const sectionTitle = {
  fontSize: 'clamp(1.4rem,3vw,1.8rem)',
  fontWeight: 800,
  marginBottom: 8,
  color: '#1F2937',
}

const sectionSub = {
  color: '#6B7280',
  marginBottom: 36,
  fontSize: 15,
}

/* ── COMPONENT ──────────────────────────────────────────── */

export default function Estrategia() {
  const [active, setActive] = useState('perfil')

  return (
    <main style={{ paddingTop: 68 }}>

      {/* HERO */}
      <section style={{ background: `linear-gradient(135deg, ${C} 0%, #9B1C1C 100%)`, padding: '64px 0 80px', textAlign: 'center' }}>
        <div className="site-container">
          <div className="section-tag" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', marginBottom: 16 }}>
            Social Media Strategy
          </div>
          <h1 className="section-title" style={{ color: 'white', marginBottom: 12 }}>📱 Estratégia de Instagram</h1>
          <p className="section-subtitle" style={{ color: 'rgba(255,255,255,0.82)', margin: '0 auto' }}>
            Plano completo para transformar o perfil da Dita em uma máquina de vendas — do perfil ao calendário editorial
          </p>
        </div>
      </section>

      {/* TABS */}
      <div style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', position: 'sticky', top: 68, zIndex: 90 }}>
        <div className="site-container" style={{ overflowX: 'auto', display: 'flex', scrollbarWidth: 'none' }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              style={{
                flexShrink: 0,
                padding: '16px 20px',
                fontSize: 13,
                fontWeight: 600,
                color: active === t.id ? C : '#6B7280',
                borderBottom: `3px solid ${active === t.id ? C : 'transparent'}`,
                background: 'none',
                border: 'none',
                borderBottom: `3px solid ${active === t.id ? C : 'transparent'}`,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* PANELS */}
      <div style={{ padding: '56px 0' }}>
        <div className="site-container">

          {/* ── PERFIL ─────────────────────────────────── */}
          {active === 'perfil' && (
            <div>
              <p style={sectionLabel}>01 — Otimização do Perfil</p>
              <h2 style={sectionTitle}>A primeira impressão que vende</h2>
              <p style={sectionSub}>Antes de qualquer conteúdo, o perfil precisa comunicar claramente quem é a Dita, o que ela faz e por que o visitante deve seguir e comprar.</p>

              {/* Username */}
              <div style={{ ...card, marginBottom: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>👤 Username & Nome de Exibição</h3>
                <div style={{ background: '#FFF5F5', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 16px', marginBottom: 10, fontSize: 14, lineHeight: 1.7 }}>
                  <span style={{ background: '#FEE2E2', color: '#DC2626', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4 }}>ATUAL</span><br />
                  <strong>@ditabolsas</strong> — Nome: Dita Bolsas e Personalizados
                </div>
                <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: '12px 16px', fontSize: 14, lineHeight: 1.7 }}>
                  <span style={{ background: '#DCFCE7', color: '#16A34A', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4 }}>NOVO</span><br />
                  <strong>@ditabolsas</strong> — Nome de exibição: <strong>Dita | Bolsas & Personalizados 🎨</strong><br />
                  <small style={{ color: '#6B7280' }}>Manter o @, adicionar emoji no nome de exibição para aparecer em buscas.</small>
                </div>
              </div>

              {/* Bio */}
              <div style={{ ...card, marginBottom: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>📝 Biografia (150 caracteres)</h3>
                <div style={{ background: '#FFF5F5', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 16px', marginBottom: 10, fontSize: 14, lineHeight: 1.7, color: '#6B7280' }}>
                  <span style={{ background: '#FEE2E2', color: '#DC2626', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4 }}>PROBLEMA</span><br />
                  Bio genérica ou vazia — sem proposta clara, sem CTA, sem diferencial visível para quem chega pela primeira vez.
                </div>
                <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: '12px 16px', fontSize: 14, lineHeight: 1.85 }}>
                  <span style={{ background: '#DCFCE7', color: '#16A34A', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4 }}>NOVO</span><br />
                  🎨 <strong>Bolsas & personalizados desde 2002</strong><br />
                  📦 Sublimação · DTF · Bordado · Silk<br />
                  📍 Serra/ES · 🚚 Todo o Brasil<br />
                  👇 Monte o seu pedido:
                </div>
              </div>

              {/* Link */}
              <div style={{ ...card, marginBottom: 32 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>🔗 Link na Bio — Estratégia</h3>
                <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: '14px 18px', fontSize: 14, lineHeight: 2 }}>
                  <span style={{ background: '#DCFCE7', color: '#16A34A', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4 }}>RECOMENDADO</span><br />
                  Usar <strong>Linktree</strong> ou <strong>Beacons.ai</strong> com os seguintes links:<br />
                  1. 💬 <strong>WhatsApp</strong> — orçamento direto<br />
                  2. 🌐 <strong>Site Dita</strong> — ditabolsas.com.br<br />
                  3. 📦 <strong>Catálogo completo</strong> — ditabolsas.com.br/produtos<br />
                  4. 🎁 <strong>Montar meu brinde</strong> — formulário de orçamento
                </div>
              </div>

              {/* Highlights */}
              <p style={sectionLabel}>Destaques (Highlights) — Estrutura recomendada</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 14, marginBottom: 24 }}>
                {[
                  { e:'🎨', t:'Produtos',      d:'Catálogo visual por categoria' },
                  { e:'✅', t:'Feito pra você', d:'Antes & depois, processo' },
                  { e:'⭐', t:'Avaliações',     d:'Prints de clientes' },
                  { e:'🏭', t:'Bastidores',     d:'Produção, equipe, máquinas' },
                  { e:'🎓', t:'Como funciona',  d:'Do pedido ao envio' },
                  { e:'💼', t:'Corporativo',    d:'Brindes & kits empresa' },
                ].map(h => (
                  <div key={h.t} style={{ ...card, textAlign: 'center', padding: 18 }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{h.e}</div>
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{h.t}</div>
                    <div style={{ fontSize: 11, color: '#6B7280', lineHeight: 1.4 }}>{h.d}</div>
                  </div>
                ))}
              </div>

              <div style={tip}>
                <strong style={{ color: '#B45309' }}>💡 Dica:</strong> Os Highlights são a primeira coisa que um visitante novo vê após a bio. Crie capas personalizadas com a identidade visual da Dita (cor vermelha + ícone branco) para cada destaque.
              </div>
            </div>
          )}

          {/* ── PILARES ────────────────────────────────── */}
          {active === 'pilares' && (
            <div>
              <p style={sectionLabel}>02 — Pilares de Conteúdo</p>
              <h2 style={sectionTitle}>A base de tudo que vai ser postado</h2>
              <p style={sectionSub}>Cada post deve se encaixar em um dos 5 pilares. Isso garante variedade, propósito e consistência — nunca mais "o que postar hoje?"</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 20, marginBottom: 28 }}>
                {PILARES.map(p => (
                  <div key={p.title} style={{ ...card, transition: 'transform 0.2s' }}>
                    <div style={{ width: 48, height: 48, background: p.iconBg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 14 }}>{p.emoji}</div>
                    <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{p.title}</h4>
                    <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6, marginBottom: 12 }}>{p.desc}</p>
                    <span style={{ ...p.pctStyle, fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 999 }}>{p.pct} do conteúdo</span>
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #F3F4F6', fontSize: 12, color: '#6B7280', lineHeight: 1.9 }}>
                      {p.examples.map(e => <div key={e}>{e}</div>)}
                    </div>
                  </div>
                ))}
              </div>

              <div style={tip}>
                <strong style={{ color: '#B45309' }}>💡 Regra de ouro — proporção 4:1:</strong> Para cada 1 post de venda direta, publique 4 posts de valor (produto bonito, educação, bastidor ou prova social). O algoritmo do Instagram pune quem só vende — e o público foge de perfis que parecem panfleto.
              </div>
            </div>
          )}

          {/* ── CALENDÁRIO ─────────────────────────────── */}
          {active === 'calendario' && (
            <div>
              <p style={sectionLabel}>03 — Calendário Editorial</p>
              <h2 style={sectionTitle}>Ritmo semanal e datas estratégicas</h2>
              <p style={sectionSub}>Consistência é o fator número 1 para crescimento orgânico. É melhor 4 posts ótimos por semana do que 10 mediocres.</p>

              <div style={tip}>
                <strong style={{ color: '#B45309' }}>Meta semanal:</strong> 4–5 posts no feed · 7 Stories por dia · 2 Reels por semana · 1 Live por mês
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 8, marginBottom: 40 }}>
                {WEEK.map(d => (
                  <div key={d.day} style={{ ...card, padding: '14px 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{d.day}</div>
                    <div style={{ fontSize: 11, fontWeight: 500, lineHeight: 1.4, marginBottom: 8 }}>{d.content}</div>
                    <span style={{ background: d.typeBg, color: d.typeColor, fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 999 }}>{d.type}</span>
                  </div>
                ))}
              </div>

              <p style={sectionLabel}>Datas Comemorativas Estratégicas</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 20 }}>
                {QUARTERS.map(q => (
                  <div key={q.q} style={card}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{q.q}</div>
                    <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>{q.title}</h4>
                    <ul style={{ fontSize: 13, color: '#6B7280', lineHeight: 2, paddingLeft: 16 }}>
                      {q.items.map(i => <li key={i}>{i}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── FEED ───────────────────────────────────── */}
          {active === 'feed' && (
            <div>
              <p style={sectionLabel}>04 — Organização Visual do Feed</p>
              <h2 style={sectionTitle}>O feed como vitrine — grid estratégico</h2>
              <p style={sectionSub}>Quem visita o perfil pela primeira vez decide em 3 segundos se vai seguir ou não. O grid precisa ser coeso, bonito e mostrar variedade.</p>

              <div style={tip}>
                <strong style={{ color: '#B45309' }}>Conceito visual:</strong> Fundo claro ou branco nos produtos, tom quente (vermelho/laranja da Dita), e alternância intencional entre tipos de conteúdo. Nunca duas fotos "do mesmo tipo" lado a lado.
              </div>

              <p style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>Modelo de grid — sequência recomendada (leitura da esquerda para direita)</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9,1fr)', gap: 3, borderRadius: 8, overflow: 'hidden', maxWidth: 560, marginBottom: 20 }}>
                {FEED_SEQUENCE.map((type, i) => (
                  <div key={i} style={{ aspectRatio: '1', background: FEED_COLORS[type], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                    {FEED_LABELS[type]}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 28 }}>
                {FEED_LEGEND.map(l => (
                  <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6B7280' }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: l.bg }} />
                    {l.label}
                  </div>
                ))}
              </div>

              <div style={tip}>
                <strong style={{ color: '#B45309' }}>📸 Guia de foto de produto:</strong> Fundo branco ou claro com sombra suave · Luz natural pela manhã · Produto dobrado + aberto em dois ângulos · Detalhe do bordado/DTF em close · Produto em uso quando possível.
              </div>
              <div style={tip}>
                <strong style={{ color: '#B45309' }}>🎨 Paleta para artes e stories:</strong> Vermelho primário <strong>#D41B2C</strong> · Branco como fundo · Laranja como cor de apoio · Nunca misturar mais de 3 cores em uma arte.
              </div>
            </div>
          )}

          {/* ── FORMATOS ───────────────────────────────── */}
          {active === 'formatos' && (
            <div>
              <p style={sectionLabel}>05 — Formatos de Conteúdo</p>
              <h2 style={sectionTitle}>Cada formato tem um papel diferente</h2>
              <p style={sectionSub}>Misturar formatos é essencial. Reels trazem alcance, carrosséis geram engajamento, Stories criam relacionamento.</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 20, marginBottom: 36 }}>
                {FORMATS.map(f => (
                  <div key={f.title} style={card}>
                    <div style={{ fontSize: 24, marginBottom: 10 }}>{f.icon}</div>
                    <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{f.title}</h4>
                    <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>{f.desc}</p>
                    <div style={{ height: 4, background: '#F3F4F6', borderRadius: 2, marginTop: 14 }}>
                      <div style={{ height: '100%', width: `${f.pct}%`, background: f.color, borderRadius: 2 }} />
                    </div>
                  </div>
                ))}
              </div>

              <p style={sectionLabel}>Roteiros de Reels para gravar agora</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 20 }}>
                {REELS.map(r => (
                  <div key={r.num} style={card}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{r.num}</div>
                    <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>{r.title}</h4>
                    <ul style={{ fontSize: 13, color: '#6B7280', lineHeight: 2, paddingLeft: 16 }}>
                      {r.items.map(i => <li key={i}>{i}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── COPIES ─────────────────────────────────── */}
          {active === 'copies' && (
            <div>
              <p style={sectionLabel}>06 — Modelos de Legenda (Copies)</p>
              <h2 style={sectionTitle}>Copies prontos para publicar</h2>
              <p style={sectionSub}>Use esses textos como base — adapte com os produtos reais, nome do cliente, cidade e detalhes específicos de cada pedido.</p>

              {COPIES.map(c => (
                <div key={c.label} style={{ ...card, marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>{c.label}</div>
                  <pre style={{ fontSize: 14, lineHeight: 1.85, color: '#374151', background: '#F9FAFB', padding: 16, borderRadius: 10, whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>
                    {c.text}
                  </pre>
                </div>
              ))}
            </div>
          )}

          {/* ── MÉTRICAS ───────────────────────────────── */}
          {active === 'metricas' && (
            <div>
              <p style={sectionLabel}>07 — KPIs, Métricas e Fases de Crescimento</p>
              <h2 style={sectionTitle}>O que medir e quando esperar resultados</h2>
              <p style={sectionSub}>Instagram é um trabalho de médio prazo. Com consistência, os resultados aparecem a partir do 2º mês — e escalam a partir do 4º.</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 20, marginBottom: 40 }}>
                {METRICS.map(m => (
                  <div key={m.label} style={card}>
                    <div style={{ fontSize: 36, fontWeight: 800, color: C, lineHeight: 1, marginBottom: 6 }}>{m.num}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>{m.label}</div>
                    <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5, paddingTop: 10, borderTop: '1px solid #F3F4F6' }}>{m.tip}</div>
                  </div>
                ))}
              </div>

              {/* Funil */}
              <p style={sectionLabel}>O Funil de Vendas no Instagram</p>
              <div style={{ maxWidth: 500, margin: '0 auto 40px', display: 'flex', flexDirection: 'column' }}>
                {FUNNEL.map((f, i) => (
                  <div key={f.label} style={{ background: f.bg, clipPath: f.clip, padding: '18px 24px', textAlign: 'center', color: 'white', marginTop: i > 0 ? -1 : 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{f.label}</div>
                    <div style={{ fontSize: 11, opacity: 0.85, marginTop: 3 }}>{f.sub}</div>
                  </div>
                ))}
              </div>

              {/* Fases */}
              <p style={sectionLabel}>Fases de Crescimento</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 20, marginBottom: 32 }}>
                {PHASES.map(ph => (
                  <div key={ph.num} style={card}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{ph.num}</div>
                    <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>{ph.title}</h4>
                    <ul style={{ fontSize: 13, color: '#6B7280', lineHeight: 2, paddingLeft: 16 }}>
                      {ph.items.map(i => <li key={i}>{i}</li>)}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Hashtags */}
              <p style={sectionLabel}>Estratégia de Hashtags</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 20, marginBottom: 28 }}>
                {HASHTAGS.map(h => (
                  <div key={h.title} style={card}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: h.color, marginBottom: 12 }}>{h.title}</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {h.tags.map(tag => (
                        <span key={tag} style={{ background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: 999, padding: '3px 10px', fontSize: 12, color: '#6B7280' }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div style={tip}>
                <strong style={{ color: '#B45309' }}>💡 Mix de hashtags ideal:</strong> Use 5–8 hashtags por post. Misture 2–3 de nicho + 1–2 técnicas + 1–2 locais + 1 de produto. Hashtags super saturadas têm menos retorno do que hashtags médias com audiência engajada.
              </div>
            </div>
          )}

        </div>
      </div>

      {/* CTA FINAL */}
      <div className="site-container" style={{ paddingBottom: 80 }}>
        <div style={{ background: `linear-gradient(135deg, ${C} 0%, #9B1C1C 100%)`, borderRadius: 24, padding: '48px 40px', textAlign: 'center', color: 'white' }}>
          <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 10 }}>Pronto para começar? 🚀</h3>
          <p style={{ opacity: 0.85, marginBottom: 24 }}>Fale com a gente e receba um orçamento dos seus próximos produtos personalizados.</p>
          <a
            href={`https://wa.me/5527997341557?text=${encodeURIComponent('Olá! Vim pelo site da Dita e gostaria de mais informações.')}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', color: C, fontWeight: 700, padding: '14px 28px', borderRadius: 999, fontSize: 15, textDecoration: 'none' }}
          >
            💬 Falar no WhatsApp
          </a>
        </div>
      </div>

    </main>
  )
}
