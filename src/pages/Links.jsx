const WHATSAPP_NUMBER = '552795263073'
const WHATSAPP_MSG    = 'Olá! Vim pelo Instagram da Dita e gostaria de pedir um orçamento. Pode me ajudar?'

const LINKS = [
  {
    id: 'whatsapp',
    emoji: '💬',
    label: 'Pedir orçamento',
    sub: 'Resposta rápida no WhatsApp',
    href: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MSG)}`,
    primary: true,
  },
  {
    id: 'site',
    emoji: '🌐',
    label: 'Conheça o nosso site',
    sub: 'ditabolsas.com.br',
    href: 'https://ditabolsas.com.br',
    primary: false,
  },
  {
    id: 'catalogo',
    emoji: '📦',
    label: 'Ver catálogo completo',
    sub: 'Bolsas, canecas, bonés e muito mais',
    href: 'https://ditabolsas.com.br/produtos',
    primary: false,
  },
]

const RED   = '#D41B2C'
const DARK  = '#1F2937'

export default function Links() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #636363 0%, #343434 60%, #343434 100%)',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '48px 20px 64px',
      fontFamily: '"Inter", system-ui, sans-serif',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* AVATAR / LOGO */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 88,
            height: 88,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${RED} 0%, #9B1C1C 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 24px rgba(212,27,44,0.30)',
            fontSize: 36,
            fontWeight: 800,
            color: 'white',
            letterSpacing: -1,
          }}>
            D
          </div>

          <h1 style={{
            fontSize: 22,
            fontWeight: 800,
            color: DARK,
            margin: '0 0 4px',
            letterSpacing: -0.3,
          }}>
            Dita Bolsas & Personalizados
          </h1>

          <p style={{
            fontSize: 14,
            color: '#6B7280',
            margin: '0 0 6px',
          }}>
            @ditabolsas
          </p>

          <p style={{
            fontSize: 13,
            color: '#9CA3AF',
            lineHeight: 1.5,
          }}>
            🎨 Sublimação · DTF · Bordado · Silk<br />
            📍 Serra/ES · 🚚 Todo o Brasil desde 2002
          </p>
        </div>

        {/* LINKS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {LINKS.map(link => (
            <a
              key={link.id}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '18px 20px',
                borderRadius: 16,
                textDecoration: 'none',
                transition: 'transform 0.15s, box-shadow 0.15s',
                background: link.primary
                  ? `linear-gradient(135deg, ${RED} 0%, #9B1C1C 100%)`
                  : 'white',
                border: link.primary ? 'none' : '1.5px solid #E5E7EB',
                boxShadow: link.primary
                  ? '0 8px 24px rgba(212,27,44,0.25)'
                  : '0 2px 8px rgba(0,0,0,0.05)',
                color: link.primary ? 'white' : DARK,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = link.primary
                  ? '0 12px 32px rgba(212,27,44,0.35)'
                  : '0 6px 20px rgba(0,0,0,0.10)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = link.primary
                  ? '0 8px 24px rgba(212,27,44,0.25)'
                  : '0 2px 8px rgba(0,0,0,0.05)'
              }}
            >
              {/* Emoji */}
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: link.primary ? 'rgba(255,255,255,0.18)' : '#FFF5F5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                flexShrink: 0,
              }}>
                {link.emoji}
              </div>

              {/* Text */}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>
                  {link.label}
                </div>
                <div style={{
                  fontSize: 12,
                  opacity: link.primary ? 0.8 : undefined,
                  color: link.primary ? 'inherit' : '#6B7280',
                }}>
                  {link.sub}
                </div>
              </div>

              {/* Arrow */}
              <div style={{
                fontSize: 16,
                opacity: link.primary ? 0.8 : 0.35,
                flexShrink: 0,
              }}>
                →
              </div>
            </a>
          ))}
        </div>

        {/* FOOTER */}
        <p style={{
          textAlign: 'center',
          fontSize: 12,
          color: '#D1D5DB',
          marginTop: 40,
        }}>
          © {new Date().getFullYear()} Dita Bolsas e Personalizados · Serra/ES
        </p>

      </div>
    </div>
  )
}
