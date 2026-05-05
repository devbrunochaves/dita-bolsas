// ============================================================
//  pdf.js — Gerador de PDF fiel ao modelo ORÇAMENTO Dita Bolsas
//  Utiliza jsPDF + jspdf-autotable
// ============================================================

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Formatar valor em R$
function fmtBRL(v) {
  return 'R$ ' + Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Formatar data no padrão "Serra, DD de Mês de AAAA"
function fmtData(dataISO) {
  const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const d = dataISO ? new Date(dataISO) : new Date();
  return `Serra, ${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
}

export function gerarPedidoPDF(pedido) {
  const { cliente, itens = [], desconto = 0, observacoes = 'Orçamento válido pelo período de 30 dias', data } = pedido;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const PW = doc.internal.pageSize.getWidth();   // 210
  const PH = doc.internal.pageSize.getHeight();  // 297

  const MAR = 14; // margem lateral
  const W = PW - MAR * 2;

  // ---- CORES ----
  const RED    = [212, 27, 44];
  const BLACK  = [30, 30, 30];
  const GRAY   = [100, 100, 100];
  const LGRAY  = [200, 200, 200];
  const VLGRAY = [245, 245, 245];

  let y = 12;
  const cL = MAR + 3; // margem interna esquerda (usada no cliente, observações e rodapé)

  // =============================================
  // CABEÇALHO — Logo + dados empresa + título
  // =============================================

  // Logo: "Dita" em vermelho cursivo grande + "Bolsas" menor
  doc.setFont('helvetica', 'bolditalic');
  doc.setFontSize(28);
  doc.setTextColor(...RED);
  doc.text('Dita', MAR, y + 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...GRAY);
  doc.text('Bolsas', MAR, y + 14);

  // Dados da empresa (centro-esquerda após logo)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...BLACK);
  const empX = MAR + 26;
  doc.text('Av. Doutor Naly da Encarnação Miranda, 117 - São Lourenço - Serra/ES', empX, y + 3);
  doc.text('Contato: (27) 99937-4339 (Dedé)', empX, y + 7.5);
  doc.text('Email: ditabolsas@yahoo.com', empX, y + 12);
  doc.text('Instagram: @ditabolsas', empX, y + 16.5);
  doc.text('CNPJ: 19.943.654/0001-87', empX, y + 21);

  // Título ORÇAMENTO (direita)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...RED);
  doc.text('PEDIDO', PW - MAR, y + 8, { align: 'right' });

  y += 26;

  // Linha separadora vermelha
  doc.setDrawColor(...RED);
  doc.setLineWidth(0.6);
  doc.line(MAR, y, PW - MAR, y);
  y += 4;

  // =============================================
  // AVISO LEGAL
  // =============================================
  doc.setFillColor(248, 248, 248);
  doc.roundedRect(MAR, y, W, 9, 1, 1, 'F');
  doc.setDrawColor(...LGRAY);
  doc.setLineWidth(0.3);
  doc.roundedRect(MAR, y, W, 9, 1, 1, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...BLACK);
  doc.text(
    'NÃO É DOCUMENTO FISCAL - NÃO É VÁLIDO COMO RECIBO E COMO GARANTIA DE MERCADORIA - NÃO COMPROVA PAGAMENTO',
    PW / 2, y + 5.5,
    { align: 'center' }
  );
  y += 13;

  // =============================================
  // DADOS DO CLIENTE — grade 2 colunas × 5 linhas
  // =============================================
  const lh  = 5.5;  // espaçamento entre linhas
  const BOX = 38;   // altura do box

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...LGRAY);
  doc.setLineWidth(0.3);
  doc.roundedRect(MAR, y, W, BOX, 1, 1, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  // cL já declarado no escopo global da função (MAR + 3)
  const cR = MAR + W * 0.50; // início coluna direita

  // Largura máxima para valores (evita overflow entre colunas)
  const maxVal = W * 0.46;

  // helper: retorna a primeira linha que cabe em maxWidth mm
  function fit(text, maxWidth) {
    if (!text) return '-';
    const lines = doc.splitTextToSize(String(text), maxWidth);
    return lines[0] || '-';
  }

  const r1 = y + lh;          // linha 1
  const r2 = y + lh * 2.25;   // linha 2
  const r3 = y + lh * 3.50;   // linha 3
  const r4 = y + lh * 4.75;   // linha 4
  const r5 = y + lh * 6.00;   // linha 5

  // ── Linha 1: Nome | CNPJ/CPF ──────────────────────────
  doc.setTextColor(...GRAY);  doc.text('Nome:',     cL,      r1);
  doc.setTextColor(...BLACK); doc.text(fit(cliente?.nome, maxVal), cL + 12, r1);
  doc.setTextColor(...GRAY);  doc.text('CNPJ/CPF:', cR,      r1);
  doc.setTextColor(...BLACK); doc.text(cliente?.cnpjCpf || '-', cR + 18, r1);

  // ── Linha 2: Endereço | Bairro ────────────────────────
  doc.setTextColor(...GRAY);  doc.text('Endereço:', cL,      r2);
  doc.setTextColor(...BLACK); doc.text(fit(cliente?.endereco, maxVal - 6), cL + 18, r2);
  doc.setTextColor(...GRAY);  doc.text('Bairro:',   cR,      r2);
  doc.setTextColor(...BLACK); doc.text(fit(cliente?.bairro, maxVal), cR + 13, r2);

  // ── Linha 3: Cidade / UF | Telefone ──────────────────
  doc.setTextColor(...GRAY);  doc.text('Cidade / UF:', cL, r3);
  doc.setTextColor(...BLACK); doc.text(
    `${fit(cliente?.cidade, 30) } / ${cliente?.estado || 'ES'}`,
    cL + 22, r3
  );
  doc.setTextColor(...GRAY);  doc.text('Telefone:', cR,      r3);
  doc.setTextColor(...BLACK); doc.text(formatTel(cliente?.telefone), cR + 18, r3);

  // ── Linha 4: Whatsapp | Contato ───────────────────────
  doc.setTextColor(...GRAY);  doc.text('Whatsapp:', cL,      r4);
  doc.setTextColor(...BLACK); doc.text(formatTel(cliente?.whatsapp), cL + 18, r4);
  doc.setTextColor(...GRAY);  doc.text('Contato:',  cR,      r4);
  doc.setTextColor(...BLACK); doc.text(fit(cliente?.contato, maxVal), cR + 16, r4);

  // ── Linha 5: Email | PGT ──────────────────────────────
  doc.setTextColor(...GRAY);  doc.text('Email:', cL,      r5);
  doc.setTextColor(...BLACK); doc.text(fit(cliente?.email, maxVal), cL + 11, r5);
  doc.setTextColor(...GRAY);  doc.text('PGT:',   cR,      r5);
  doc.setTextColor(...BLACK); doc.text(cliente?.pgt || 'BOLETO', cR + 9, r5);

  y += BOX + 4;

  // =============================================
  // TABELA DE PRODUTOS
  // =============================================

  const totalQtd    = itens.reduce((s, i) => s + (Number(i.quantidade) || 0), 0);
  const totalValor  = itens.reduce((s, i) => s + (Number(i.vrTotal)    || 0), 0);
  const valorFinal  = Math.max(0, totalValor - Number(desconto || 0));

  autoTable(doc, {
    startY: y,
    margin: { left: MAR, right: MAR },
    head: [[
      { content: 'Cód.',        styles: { halign: 'center', cellWidth: 18 } },
      { content: '',            styles: { cellWidth: 'auto' } },
      { content: 'Quant.',      styles: { halign: 'center', cellWidth: 18 } },
      { content: 'Vr. Unitário',styles: { halign: 'right',  cellWidth: 30 } },
      { content: 'Vr. Total',   styles: { halign: 'right',  cellWidth: 30 } },
    ]],
    body: [
      // itens preenchidos
      ...itens.map(item => {
        // Se tem observações, concatena abaixo do nome em linha separada
        const nomeCompleto = item.observacoes
          ? `${item.nome || ''}\n${item.observacoes}`
          : (item.nome || '')
        return [
          { content: item.codigo || '',             styles: { halign: 'center' } },
          { content: nomeCompleto,                  styles: { cellWidth: 'auto' } },
          { content: String(item.quantidade || ''), styles: { halign: 'center' } },
          { content: fmtBRL(item.vrUnitario),       styles: { halign: 'right' } },
          { content: fmtBRL(item.vrTotal),          styles: { halign: 'right' } },
        ]
      }),
      // linhas em branco para parecer o modelo (mínimo 13 linhas — cabe numa página)
      ...Array(Math.max(0, 13 - itens.length)).fill([
        { content: '' }, { content: '' }, { content: '' }, { content: '' }, { content: '' }
      ]),
      // rodapé de totais
      [
        { content: 'Total Produtos:', colSpan: 2, styles: { halign: 'right', fontStyle: 'bold', fillColor: [255,255,255] } },
        { content: String(totalQtd),             styles: { halign: 'center', fontStyle: 'bold', fillColor: [255,255,255] } },
        { content: '',                           styles: { fillColor: [255,255,255] } },
        { content: fmtBRL(totalValor),           styles: { halign: 'right',  fontStyle: 'bold', fillColor: [255,255,255] } },
      ],
      [
        { content: 'Desconto:',  colSpan: 4, styles: { halign: 'right', fillColor: [255,255,255] } },
        { content: desconto ? fmtBRL(desconto) : 'R$ -', styles: { halign: 'right', fillColor: [255,255,255] } },
      ],
      [
        { content: 'Valor Final:', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold', fillColor: [255,255,255] } },
        { content: fmtBRL(valorFinal), styles: { halign: 'right', fontStyle: 'bold', fillColor: [255,255,255] } },
      ],
    ],
    styles: {
      fontSize: 8.5,
      cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 },
      lineColor: [200, 200, 200],
      lineWidth: 0.2,
      textColor: BLACK,
    },
    headStyles: {
      fillColor: VLGRAY,
      textColor: BLACK,
      fontStyle: 'bold',
      lineColor: [180, 180, 180],
      lineWidth: 0.3,
    },
    alternateRowStyles: { fillColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: 18, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 18, halign: 'center' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' },
    },
  });

  y = doc.lastAutoTable.finalY + 5;

  // =============================================
  // OBSERVAÇÕES
  // =============================================
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...LGRAY);
  doc.setLineWidth(0.3);
  doc.roundedRect(MAR, y, W, 20, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...BLACK);
  doc.text('Observações: ', cL, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(observacoes || 'Orçamento válido pelo período de 30 dias', cL + 24, y + 6);
  y += 24;

  // =============================================
  // RODAPÉ — Assinatura + Data
  // =============================================
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...BLACK);
  doc.text('Ass. Responsável: ', cL, y + 6);
  // linha de assinatura
  doc.setDrawColor(...BLACK);
  doc.setLineWidth(0.3);
  doc.line(cL + 35, y + 6.5, cL + 110, y + 6.5);

  doc.text(fmtData(data), PW - MAR, y + 6, { align: 'right' });

  // =============================================
  // SALVAR + retornar blob para compartilhamento
  // =============================================
  const nomeArq = `Pedido-${(cliente?.nome || 'cliente').replace(/\s+/g, '-').toLowerCase()}.pdf`;
  doc.save(nomeArq);

  // Retorna o blob para o chamador poder compartilhar via Web Share API
  const blob = doc.output('blob');
  return { blob, nome: nomeArq };
}

// ---- helpers ----
function formatTel(v) {
  if (!v) return '-';
  const d = v.replace(/\D/g, '');
  if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return v || '-';
}
