import { useState } from 'react'
import { Link } from 'react-router-dom'

const CATEGORIES = [
  { id: 'todos', label: 'Todos' },
  { id: 'bolsas', label: 'Bolsas' },
  { id: 'personalizados', label: 'Personalizados' },
  { id: 'escritorio', label: 'Escritório' },
  { id: 'vestuario', label: 'Vestuário' },
]

const PRODUCTS = [
  // Bolsas
  { id: 1, cat: 'bolsas', emoji: '👜', name: 'Bolsa Escolar Personalizada', desc: 'Bolsa em lona ou nylon com bordado ou silk-screen da sua arte.', tag: 'BOLSAS' },
  { id: 2, cat: 'bolsas', emoji: '🎒', name: 'Mochila Executiva', desc: 'Mochila em nylon ou lona premium para eventos e brindes corporativos.', tag: 'BOLSAS' },
  { id: 3, cat: 'bolsas', emoji: '🛍️', name: 'Sacola Ecobag', desc: 'Ecobag em algodão cru ou colorido, ótima para eventos e promoções.', tag: 'BOLSAS' },
  { id: 4, cat: 'bolsas', emoji: '💼', name: 'Pasta Personalizada', desc: 'Pasta em couro sintético ou lona com bordado ou silk da logomarca.', tag: 'BOLSAS' },

  // Personalizados
  { id: 5, cat: 'personalizados', emoji: '☕', name: 'Caneca Sublimação', desc: 'Caneca cerâmica ou de polímero com foto ou arte em alta resolução.', tag: 'CANECAS' },
  { id: 6, cat: 'personalizados', emoji: '🔑', name: 'Chaveiro Personalizado', desc: 'Chaveiro em acrílico, metal, borracha ou MDF com arte personalizada.', tag: 'CHAVEIROS' },
  { id: 7, cat: 'personalizados', emoji: '🖼️', name: 'Porta-Retrato', desc: 'Porta-retratos em MDF ou acrílico sublimado, ideal para presentes.', tag: 'PORTA-RETRATOS' },
  { id: 8, cat: 'personalizados', emoji: '🎭', name: 'Almofada Sublimada', desc: 'Almofada em poliéster com sublimação colorida da sua arte ou foto.', tag: 'PERSONALIZADOS' },

  // Escritório
  { id: 9,  cat: 'escritorio', emoji: '✏️', name: 'Porta Lápis/Caneta', desc: 'Porta lápis em MDF, acrílico ou verniz com personalização.', tag: 'ESCRITÓRIO' },
  { id: 10, cat: 'escritorio', emoji: '📚', name: 'Estojo Escolar', desc: 'Estojos duplos, simples ou quadrados em várias cores e modelos.', tag: 'ESCRITÓRIO' },
  { id: 11, cat: 'escritorio', emoji: '📋', name: 'Bloco de Anotações', desc: 'Bloco A5 ou A4 com capa personalizada para brindes e eventos.', tag: 'ESCRITÓRIO' },

  // Vestuário
  { id: 14, cat: 'vestuario', emoji: '🧢', name: 'Boné Personalizado', desc: 'Bonés em brim ou nylon com bordado ou silk-screen na frente e lateral.', tag: 'BONÉS' },
]

export default function Products() {
  const [active, setActive] = useState('todos')

  const filtered = active === 'todos' ? PRODUCTS : PRODUCTS.filter(p => p.cat === active)

  return (
    <main style={{ paddingTop: 68 }}>

      {/* Header */}
      <section style={{ background: 'linear-gradient(135deg, #1F2937 0%, #7F1D1D 100%)', padding: '64px 0 48px', textAlign: 'center' }}>
        <div className="site-container">
          <div className="section-tag" style={{ background: 'rgba(212,27,44,0.3)', color: '#FCA5A5' }}>Catálogo</div>
          <h1 className="section-title" style={{ color: 'white', marginBottom: 16 }}>Nossos Produtos</h1>
          <p className="section-subtitle" style={{ color: 'rgba(255,255,255,0.75)', margin: '0 auto' }}>
            Explore nosso catálogo completo de produtos personalizados para empresas e pessoas físicas.
          </p>
        </div>
      </section>

      {/* Filtros */}
      <section style={{ background: 'white', borderBottom: '1px solid #E5E7EB', position: 'sticky', top: 68, zIndex: 50 }}>
        <div className="site-container" style={{ display: 'flex', gap: 8, padding: '16px 24px', overflowX: 'auto' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActive(cat.id)}
              style={{
                padding: '8px 20px',
                borderRadius: 100,
                border: active === cat.id ? 'none' : '1.5px solid #E5E7EB',
                background: active === cat.id ? '#D41B2C' : 'white',
                color: active === cat.id ? 'white' : '#6B7280',
                fontWeight: active === cat.id ? 700 : 500,
                fontSize: 14,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}>
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Grade de produtos */}
      <section style={{ padding: '56px 0', background: '#F9FAFB' }}>
        <div className="site-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
            {filtered.map(product => (
              <div
                key={product.id}
                style={{
                  background: 'white',
                  borderRadius: 16,
                  overflow: 'hidden',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(0,0,0,0.12)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)' }}
              >
                <div style={{ height: 140, background: 'linear-gradient(135deg, #F5E6E7 0%, #FECDD3 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, position: 'relative' }}>
                  {product.emoji}
                  <div style={{ position: 'absolute', top: 12, right: 12, background: '#D41B2C', color: 'white', fontSize: 10, fontWeight: 700, letterSpacing: 1, padding: '3px 8px', borderRadius: 100 }}>
                    {product.tag}
                  </div>
                </div>
                <div style={{ padding: '20px 20px 24px' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1F2937', marginBottom: 8 }}>{product.name}</h3>
                  <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6, marginBottom: 16 }}>{product.desc}</p>
                  <a
                    href={`https://wa.me/5527999374339?text=Olá! Tenho interesse no produto: ${encodeURIComponent(product.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#D41B2C', fontWeight: 600, fontSize: 14 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Pedir orçamento
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '64px 0', background: '#D41B2C', textAlign: 'center' }}>
        <div className="site-container">
          <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: 'white', marginBottom: 12 }}>
            Não encontrou o que procura?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: 28, fontSize: 16 }}>
            Fale conosco! Produzimos produtos personalizados sob encomenda.
          </p>
          <a href="https://wa.me/5527999374339" target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-block', background: 'white', color: '#D41B2C', padding: '14px 32px', borderRadius: 12, fontWeight: 700, fontSize: 16 }}>
            💬 Falar no WhatsApp
          </a>
        </div>
      </section>
    </main>
  )
}
