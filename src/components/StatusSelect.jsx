import { useState } from 'react'
import { updatePedidoStatus } from '../utils/storage'

export const STATUS_CONFIG = {
  PENDENTE:      { label: 'PENDENTE',    color: '#92400E', bg: '#FEF3C7', border: '#FCD34D', dot: '#F59E0B' },
  'EM PRODUÇÃO': { label: 'EM PRODUÇÃO', color: '#166534', bg: '#DCFCE7', border: '#86EFAC', dot: '#22C55E' },
  ATRASADO:      { label: 'ATRASADO',    color: '#991B1B', bg: '#FEE2E2', border: '#FCA5A5', dot: '#EF4444' },
  ENTREGUE:      { label: 'ENTREGUE',    color: '#374151', bg: '#F3F4F6', border: '#D1D5DB', dot: '#9CA3AF' },
}

export const STATUS_LIST = ['PENDENTE', 'EM PRODUÇÃO', 'ATRASADO', 'ENTREGUE']

// ── Badge somente leitura ────────────────────────────────────
export function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDENTE
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700,
      color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`,
      whiteSpace: 'nowrap', letterSpacing: 0.3,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  )
}

// ── Select editável — sem SVG background (fix do bug xadrez) ─
export function StatusSelect({ pedidoId, current, onChange }) {
  const [saving, setSaving] = useState(false)
  const cfg = STATUS_CONFIG[current] || STATUS_CONFIG.PENDENTE

  async function handleChange(e) {
    const novoStatus = e.target.value
    setSaving(true)
    try {
      await updatePedidoStatus(pedidoId, novoStatus)
      onChange(pedidoId, novoStatus)
    } finally {
      setSaving(false)
    }
  }

  return (
    <select
      value={current}
      onChange={handleChange}
      disabled={saving}
      style={{
        fontSize: 11,
        fontWeight: 700,
        padding: '5px 10px',
        borderRadius: 100,
        border: `1.5px solid ${cfg.border}`,
        color: cfg.color,
        background: cfg.bg,          /* cor sólida — sem SVG, sem xadrez */
        cursor: saving ? 'wait' : 'pointer',
        outline: 'none',
        opacity: saving ? 0.6 : 1,
        transition: 'opacity 0.2s',
        /* usa a seta nativa do browser, sem override de backgroundImage */
      }}
    >
      {STATUS_LIST.map(s => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  )
}
