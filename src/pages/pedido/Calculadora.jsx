// ============================================================
//  Calculadora Shopee — MEI (CNPJ)
//  Calcula o preço de venda ideal baseado nas taxas da Shopee 2026
// ============================================================

import { useState, useMemo } from 'react'

// ── Taxas Shopee 2026 (MEI / CNPJ) ──────────────────────────
//  Fonte: Shopee Brasil — tabela vigente 2026
const COMISSAO_BASE   = 0.14   // 14% — sem Frete Grátis
const COMISSAO_FRETE  = 0.20   // 20% — com Programa Frete Grátis (14% + 6%)
const TAXA_FIXA_MEI   = 4.00   // R$ 4,00 por item (CNPJ / MEI)

const fmtBRL = v =>
  Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const fmtPct = v =>
  `${Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}%`

// ── Componente linha do breakdown ────────────────────────────
function Linha({ label, valor, sub, destaque, negativo, verde }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: destaque ? '12px 16px' : '10px 16px',
      background: destaque ? (verde ? '#F0FDF4' : '#FEF9EC') : 'transparent',
      borderRadius: destaque ? 10 : 0,
      borderTop: !destaque ? '1px solid #F3F4F6' : 'none',
      margin: destaque ? '4px 0' : 0,
    }}>
      <div>
        <div style={{ fontSize: 13, color: destaque ? (verde ? '#1B6E3C' : '#92400E') : '#374151', fontWeight: destaque ? 700 : 500 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>{sub}</div>}
      </div>
      <span style={{ fontSize: destaque ? 17 : 14, fontWeight: destaque ? 900 : 600, color: verde ? '#1B6E3C' : negativo ? '#DC2626' : '#1F2937' }}>
        {valor}
      </span>
    </div>
  )
}

// ── Página principal ─────────────────────────────────────────
export default function Calculadora() {
  const [custo,       setCusto]       = useState('')
  const [margem,      setMargem]      = useState('30')
  const [freteGratis, setFreteGratis] = useState(false)

  // ── Cálculo central ──────────────────────────────────────
  const calc = useMemo(() => {
    const custoNum  = parseFloat(String(custo).replace(',', '.'))  || 0
    const margemNum = parseFloat(String(margem).replace(',', '.')) || 0

    if (custoNum <= 0) return null

    const comissao = freteGratis ? COMISSAO_FRETE : COMISSAO_BASE

    // Preço onde o lucro líquido = margemNum % do preço de venda
    // Preço = (custo + taxa_fixa) / (1 - comissão - margem_%)
    const divisor = 1 - comissao - margemNum / 100
    if (divisor <= 0) return { erro: 'A margem desejada é muito alta para essa comissão. Reduza a margem.' }

    const preco          = (custoNum + TAXA_FIXA_MEI) / divisor
    const valorComissao  = preco * comissao
    const lucroLiquido   = preco - custoNum - TAXA_FIXA_MEI - valorComissao
    const taxaTotal      = valorComissao + TAXA_FIXA_MEI
    const margemReal     = (lucroLiquido / preco) * 100

    return {
      preco,
      valorComissao,
      taxaFixa:   TAXA_FIXA_MEI,
      taxaTotal,
      lucroLiquido,
      margemReal,
      comissaoPct: comissao * 100,
    }
  }, [custo, margem, freteGratis])

  const temResultado = calc && !calc.erro && calc.preco > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 560 }}>
      <style>{`
        .calc-input {
          border: 1.5px solid #D1D5DB; border-radius: 10px;
          padding: 11px 14px; font-size: 15px; outline: none;
          width: 100%; box-sizing: border-box; font-family: inherit;
          transition: border-color 0.15s;
        }
        .calc-input:focus { border-color: #1B6E3C; box-shadow: 0 0 0 3px rgba(27,110,60,0.1); }
        .toggle-track {
          width: 44px; height: 24px; border-radius: 100px; cursor: pointer;
          transition: background 0.2s; flex-shrink: 0; position: relative;
          border: none; outline: none; padding: 0;
        }
        .toggle-thumb {
          position: absolute; top: 3px; width: 18px; height: 18px;
          border-radius: 50%; background: white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
          transition: left 0.2s;
        }
      `}</style>

      {/* Cabeçalho */}
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#1F2937', marginBottom: 4 }}>
          Calculadora Shopee
        </h1>
        <p style={{ color: '#6B7280', fontSize: 13 }}>
          Descubra o preço ideal para vender na Shopee como MEI — taxas 2026 aplicadas automaticamente.
        </p>
      </div>

      {/* Card de inputs */}
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E5E7EB', padding: '24px', display: 'flex', flexDirection: 'column', gap: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>

        {/* Custo do produto */}
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
            💰 Custo do produto (R$)
          </label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#9CA3AF', fontWeight: 600 }}>R$</span>
            <input
              type="number" min="0" step="0.01"
              className="calc-input"
              value={custo}
              onChange={e => setCusto(e.target.value)}
              placeholder="0,00"
              style={{ paddingLeft: 40 }}
            />
          </div>
          <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>
            Quanto você paga pelo produto (custo de aquisição ou fabricação).
          </p>
        </div>

        {/* Margem de lucro */}
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
            📈 Margem de lucro desejada (%)
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="number" min="1" max="70" step="1"
              className="calc-input"
              value={margem}
              onChange={e => setMargem(e.target.value)}
              placeholder="30"
              style={{ paddingRight: 40 }}
            />
            <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#9CA3AF', fontWeight: 600 }}>%</span>
          </div>
          <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>
            Margem sobre o preço de venda. Para produto de R$ 50, 30% = R$ 15 de lucro.
          </p>
        </div>

        {/* Toggle Frete Grátis */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: freteGratis ? '#F0FDF4' : '#F9FAFB', border: `1.5px solid ${freteGratis ? '#86EFAC' : '#E5E7EB'}`, borderRadius: 12, padding: '14px 16px', transition: 'all 0.2s' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1F2937' }}>🚚 Programa Frete Grátis</div>
            <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>
              {freteGratis
                ? 'Ativado — comissão de 20% (14% + 6% do programa)'
                : 'Desativado — comissão padrão de 14%'}
            </div>
          </div>
          <button
            type="button"
            className="toggle-track"
            onClick={() => setFreteGratis(v => !v)}
            style={{ background: freteGratis ? '#1B6E3C' : '#D1D5DB' }}
            aria-pressed={freteGratis}
          >
            <div className="toggle-thumb" style={{ left: freteGratis ? 23 : 3 }} />
          </button>
        </div>

        {/* Linha de taxas fixas (informativo) */}
        <div style={{ background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: 10, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>
            📋 Taxas aplicadas (MEI / CNPJ — 2026)
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: '#6B7280' }}>Comissão Shopee</span>
            <strong style={{ color: '#1F2937' }}>{freteGratis ? '20%' : '14%'}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: '#6B7280' }}>Taxa fixa por item (CNPJ)</span>
            <strong style={{ color: '#1F2937' }}>R$ 4,00</strong>
          </div>
        </div>
      </div>

      {/* Resultado */}
      {!custo || parseFloat(String(custo).replace(',', '.')) <= 0 ? (
        <div style={{ background: 'white', borderRadius: 16, border: '1px dashed #D1D5DB', padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🧮</div>
          <p style={{ fontSize: 14, color: '#9CA3AF' }}>Preencha o custo do produto para ver o resultado.</p>
        </div>
      ) : calc?.erro ? (
        <div style={{ background: '#FEF2F2', borderRadius: 16, border: '1px solid #FECACA', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22 }}>⚠️</span>
          <p style={{ fontSize: 13, color: '#DC2626', fontWeight: 500 }}>{calc.erro}</p>
        </div>
      ) : temResultado ? (
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #86EFAC', boxShadow: '0 4px 20px rgba(27,110,60,0.08)', overflow: 'hidden' }}>

          {/* Preço de venda — destaque */}
          <div style={{ background: 'linear-gradient(135deg, #1B6E3C 0%, #22913F 100%)', padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>
              💲 Preço de venda ideal
            </div>
            <div style={{ fontSize: 42, fontWeight: 900, color: 'white', letterSpacing: -1 }}>
              {fmtBRL(calc.preco)}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 6 }}>
              Com {fmtPct(calc.margemReal)} de margem líquida
            </div>
          </div>

          {/* Breakdown */}
          <div style={{ padding: '8px 0' }}>
            <div style={{ padding: '8px 16px 4px', fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Composição do preço
            </div>

            <Linha label="Custo do produto"    valor={fmtBRL(parseFloat(String(custo).replace(',', '.')))} />
            <Linha
              label="Comissão Shopee"
              sub={`${fmtPct(calc.comissaoPct)} do preço de venda`}
              valor={`− ${fmtBRL(calc.valorComissao)}`}
              negativo
            />
            <Linha
              label="Taxa fixa por item"
              sub="CNPJ / MEI"
              valor={`− ${fmtBRL(calc.taxaFixa)}`}
              negativo
            />

            <div style={{ margin: '4px 8px', borderTop: '2px solid #E5E7EB' }} />

            <Linha
              label="Total de taxas Shopee"
              sub={`Comissão + taxa fixa`}
              valor={`− ${fmtBRL(calc.taxaTotal)}`}
              destaque
              negativo
            />
            <Linha
              label="💚 Seu lucro líquido"
              sub={`${fmtPct(calc.margemReal)} de margem`}
              valor={fmtBRL(calc.lucroLiquido)}
              destaque
              verde
            />
          </div>

          {/* Dica */}
          <div style={{ margin: '0 16px 16px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
            <p style={{ fontSize: 12, color: '#92400E', lineHeight: 1.5, margin: 0 }}>
              <strong>Dica:</strong> Este preço já cobre o custo, as taxas da Shopee e garante a margem desejada.
              Arredonde para um valor comercial (ex.: R$ {Math.ceil(calc.preco)},00 ou R$ {(Math.floor(calc.preco / 5) * 5 + 4.99).toFixed(2).replace('.', ',')}).
            </p>
          </div>
        </div>
      ) : null}
    </div>
  )
}
