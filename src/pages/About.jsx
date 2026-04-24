import { Link } from 'react-router-dom'

const TIMELINE = [
  { year: '2002', title: 'Fundação', desc: 'A Dita Bolsas nasce em Serra/ES com foco em bolsas escolares personalizadas para papelarias da região.' },
  { year: '2008', title: 'Expansão do Portfólio', desc: 'Passamos a oferecer estojos, porta-lápis e outros produtos escolares, ampliando nossa linha.' },
  { year: '2015', title: 'Produtos Personalizados', desc: 'Iniciamos a linha de personalizados: canecas, camisas, bonés e chaveiros sob demanda.' },
  { year: '2020', title: 'Mais de 8.000 Clientes', desc: 'Superamos a marca de 8.000 clientes atendidos, consolidando nossa presença em todo o ES.' },
  { year: '2025', title: 'Mais de 10.000 Clientes', desc: 'Hoje com mais de 10.000 clientes satisfeitos, lançamos nosso site e plataforma de pedidos.' },
]

export default function About() {
  return (
    <main style={{ paddingTop: 68 }}>

      {/* Header */}
      <section style={{ background: 'linear-gradient(135deg, #1F2937 0%, #7F1D1D 100%)', padding: '64px 0 80px', textAlign: 'center' }}>
        <div className="site-container">
          <div className="section-tag" style={{ background: 'rgba(212,27,44,0.3)', color: '#FCA5A5' }}>Nossa História</div>
          <h1 className="section-title" style={{ color: 'white', marginBottom: 16 }}>Sobre a Dita Bolsas</h1>
          <p className="section-subtitle" style={{ color: 'rgba(255,255,255,0.75)', margin: '0 auto' }}>
            Uma empresa familiar com mais de 25 anos de dedicação à personalização de qualidade em Serra/ES.
          </p>
        </div>
      </section>

      {/* Nossa história */}
      <section style={{ padding: '96px 0', background: 'white' }}>
        <div className="site-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 64, alignItems: 'center' }}>
            <div>
              <div className="section-tag">Quem somos</div>
              <h2 className="section-title" style={{ marginBottom: 20 }}>Tradição familiar desde 2002</h2>
              <p className="section-subtitle" style={{ marginBottom: 20 }}>
                A Dita Bolsas é uma empresa familiar localizada no bairro São Lourenço, em Serra/ES. Fundada em 2002, há mais de 25 anos somos referência em produtos personalizados de qualidade para papelarias, empresas e consumidores finais.
              </p>
              <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.7, marginBottom: 20 }}>
                Nossa empresa está dividida em duas grandes áreas: a linha de <strong>bolsas personalizadas</strong>, que é a nossa marca registrada desde o início, e a linha de <strong>personalizados</strong> — canecas, bonés, camisas, chaveiros e porta-retratos — que desenvolvemos para atender a crescente demanda do mercado.
              </p>
              <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.7 }}>
                Com mais de <strong>10.000 clientes atendidos</strong>, nosso compromisso é sempre oferecer o melhor produto, no prazo combinado, com o atendimento que nossos clientes merecem.
              </p>
            </div>
            <div>
              <div style={{ background: 'linear-gradient(135deg, #F5E6E7 0%, #FECDD3 100%)', borderRadius: 24, padding: 48, textAlign: 'center' }}>
                <div style={{ fontSize: 80, marginBottom: 20 }}>👨‍👩‍👦</div>
                <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: 24, fontWeight: 700, color: '#1F2937', marginBottom: 12 }}>Empresa Familiar</h3>
                <p style={{ color: '#6B7280', fontSize: 15, lineHeight: 1.6 }}>
                  Somos uma empresa de família — cada produto que sai daqui carrega o cuidado e a dedicação de quem trabalha com amor pelo que faz.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 32 }}>
                  {[['25+', 'Anos'], ['10k+', 'Clientes'], ['6', 'Categorias'], ['100%', 'Dedicação']].map(([v, l]) => (
                    <div key={l} style={{ background: 'white', borderRadius: 12, padding: '16px 8px' }}>
                      <div style={{ fontFamily: '"Playfair Display", serif', fontSize: 24, fontWeight: 700, color: '#D41B2C' }}>{v}</div>
                      <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section style={{ padding: '96px 0', background: '#F9FAFB' }}>
        <div className="site-container">
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div className="section-tag">Nossa Trajetória</div>
            <h2 className="section-title">Uma história de crescimento</h2>
          </div>
          <div style={{ maxWidth: 700, margin: '0 auto', position: 'relative' }}>
            {/* Linha vertical */}
            <div style={{ position: 'absolute', left: 30, top: 0, bottom: 0, width: 2, background: '#E5E7EB' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
              {TIMELINE.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 28 }}>
                  <div style={{ flexShrink: 0, width: 60, height: 60, borderRadius: '50%', background: '#D41B2C', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 4px white, 0 0 0 6px #FECDD3' }}>
                    <span style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>{item.year}</span>
                  </div>
                  <div style={{ background: 'white', borderRadius: 16, padding: '20px 24px', flex: 1, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginTop: 8 }}>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1F2937', marginBottom: 8 }}>{item.title}</h3>
                    <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section style={{ padding: '96px 0', background: 'white' }}>
        <div className="site-container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="section-tag">Nossos Valores</div>
            <h2 className="section-title">O que nos guia</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
            {[
              ['🏆', 'Qualidade', 'Cada produto passa por controle de qualidade rigoroso antes de chegar ao cliente.'],
              ['🤝', 'Confiança', 'Construímos relacionamentos duradouros baseados em honestidade e transparência.'],
              ['⏱️', 'Pontualidade', 'Entregamos no prazo combinado, porque sabemos o quanto isso importa para você.'],
              ['💡', 'Inovação', 'Sempre buscamos novas técnicas e produtos para oferecer mais opções aos nossos clientes.'],
            ].map(([emoji, title, desc]) => (
              <div key={title} style={{ background: '#F9FAFB', borderRadius: 16, padding: '32px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: 44, marginBottom: 16 }}>{emoji}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1F2937', marginBottom: 10 }}>{title}</h3>
                <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '64px 0', background: '#D41B2C', textAlign: 'center' }}>
        <div className="site-container">
          <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: 'white', marginBottom: 12 }}>
            Faça parte da nossa história
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: 28, fontSize: 16 }}>
            Venha conhecer de perto o nosso trabalho. Estamos em Serra/ES esperando por você.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/contato" style={{ display: 'inline-block', background: 'white', color: '#D41B2C', padding: '14px 32px', borderRadius: 12, fontWeight: 700, fontSize: 16 }}>
              Fale Conosco
            </Link>
            <a href="https://wa.me/5527999374339" target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-block', background: 'transparent', color: 'white', border: '2px solid rgba(255,255,255,0.4)', padding: '12px 32px', borderRadius: 12, fontWeight: 700, fontSize: 16 }}>
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
