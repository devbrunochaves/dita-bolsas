import { useState } from 'react'

export default function Contact() {
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', mensagem: '' })
  const [sent, setSent] = useState(false)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = e => {
    e.preventDefault()
    const msg = `Olá! Meu nome é ${form.nome}.\n\nEmail: ${form.email}\nTelefone: ${form.telefone}\n\nMensagem: ${form.mensagem}`
    window.open(`https://wa.me/5527999374339?text=${encodeURIComponent(msg)}`, '_blank')
    setSent(true)
    setTimeout(() => setSent(false), 4000)
  }

  return (
    <main style={{ paddingTop: 68 }}>

      {/* Header */}
      <section style={{ background: 'linear-gradient(135deg, #1F2937 0%, #7F1D1D 100%)', padding: '64px 0 80px', textAlign: 'center' }}>
        <div className="site-container">
          <div className="section-tag" style={{ background: 'rgba(212,27,44,0.3)', color: '#FCA5A5' }}>Fale Conosco</div>
          <h1 className="section-title" style={{ color: 'white', marginBottom: 16 }}>Entre em Contato</h1>
          <p className="section-subtitle" style={{ color: 'rgba(255,255,255,0.75)', margin: '0 auto' }}>
            Estamos prontos para atender você. Solicite seu orçamento sem compromisso.
          </p>
        </div>
      </section>

      {/* Grid contato */}
      <section style={{ padding: '80px 0', background: '#F9FAFB' }}>
        <div className="site-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48 }}>

            {/* Formulário */}
            <div style={{ background: 'white', borderRadius: 20, padding: '40px 36px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
              <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 24, fontWeight: 700, color: '#1F2937', marginBottom: 8 }}>
                Envie uma mensagem
              </h2>
              <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 28 }}>
                Preencha o formulário e entraremos em contato pelo WhatsApp.
              </p>

              {sent && (
                <div style={{ background: '#DCFCE7', border: '1px solid #86EFAC', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#166534', fontSize: 14, fontWeight: 600 }}>
                  ✅ Mensagem enviada! Aguarde nosso retorno.
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="ped-form-group" style={{ marginBottom: 16 }}>
                  <label style={{ color: '#374151' }}>Nome completo *</label>
                  <input name="nome" value={form.nome} onChange={handleChange} required placeholder="Seu nome" style={{ border: '1.5px solid #E5E7EB', borderRadius: 8, padding: '10px 14px', fontSize: 15, outline: 'none', width: '100%' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div className="ped-form-group">
                    <label style={{ color: '#374151' }}>Email</label>
                    <input name="email" value={form.email} onChange={handleChange} type="email" placeholder="seu@email.com" style={{ border: '1.5px solid #E5E7EB', borderRadius: 8, padding: '10px 14px', fontSize: 14, outline: 'none', width: '100%' }} />
                  </div>
                  <div className="ped-form-group">
                    <label style={{ color: '#374151' }}>Telefone</label>
                    <input name="telefone" value={form.telefone} onChange={handleChange} placeholder="(27) 9xxxx-xxxx" style={{ border: '1.5px solid #E5E7EB', borderRadius: 8, padding: '10px 14px', fontSize: 14, outline: 'none', width: '100%' }} />
                  </div>
                </div>
                <div className="ped-form-group" style={{ marginBottom: 24 }}>
                  <label style={{ color: '#374151' }}>Mensagem *</label>
                  <textarea
                    name="mensagem"
                    value={form.mensagem}
                    onChange={handleChange}
                    required
                    rows={4}
                    placeholder="Descreva o produto desejado, quantidade, prazo..."
                    style={{ border: '1.5px solid #E5E7EB', borderRadius: 8, padding: '10px 14px', fontSize: 14, outline: 'none', width: '100%', resize: 'vertical' }}
                  />
                </div>
                <button type="submit" style={{
                  width: '100%', padding: '14px', borderRadius: 10, border: 'none',
                  background: '#D41B2C', color: 'white', fontWeight: 700, fontSize: 16, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'background 0.2s',
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Enviar pelo WhatsApp
                </button>
              </form>
            </div>

            {/* Informações de contato */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {[
                {
                  icon: '📍',
                  title: 'Endereço',
                  content: 'Av. Doutor Naly da Encarnação Miranda, 117\nSão Lourenço - Serra/ES',
                },
                {
                  icon: '📞',
                  title: 'Telefone / WhatsApp',
                  content: '(27) 99937-4339\nFalar com: Dedé',
                  link: 'https://wa.me/5527999374339',
                  linkLabel: 'Chamar no WhatsApp →',
                },
                {
                  icon: '✉️',
                  title: 'E-mail',
                  content: 'ditabolsas@yahoo.com',
                  link: 'mailto:ditabolsas@yahoo.com',
                  linkLabel: 'Enviar e-mail →',
                },
                {
                  icon: '📸',
                  title: 'Instagram',
                  content: '@ditabolsas',
                  link: 'https://instagram.com/ditabolsas',
                  linkLabel: 'Ver perfil →',
                },
              ].map((item) => (
                <div key={item.title} style={{ background: 'white', borderRadius: 16, padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: '#F5E6E7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1F2937', marginBottom: 4 }}>{item.title}</h3>
                    <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6, whiteSpace: 'pre-line', marginBottom: item.link ? 8 : 0 }}>{item.content}</p>
                    {item.link && (
                      <a href={item.link} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 14, color: '#D41B2C', fontWeight: 600 }}>
                        {item.linkLabel}
                      </a>
                    )}
                  </div>
                </div>
              ))}

              {/* Horário */}
              <div style={{ background: 'linear-gradient(135deg, #F5E6E7, #FECDD3)', borderRadius: 16, padding: '24px' }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1F2937', marginBottom: 12 }}>🕐 Horário de Atendimento</h3>
                <div style={{ fontSize: 14, color: '#374151', lineHeight: 2 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Segunda a Sexta</span><strong>08:00 – 18:00</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Sábado</span><strong>08:00 – 12:00</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9CA3AF' }}>
                    <span>Domingo</span><span>Fechado</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
