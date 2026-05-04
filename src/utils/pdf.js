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
  doc.text('ORÇAMENTO', PW - MAR, y + 8, { align: 'right' });

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
  // DADOS DO CLIENTE
  // =============================================
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...LGRAY);
  doc.setLineWidth(0.3);
  doc.roundedRect(MAR, y, W, 28, 1, 1, 'FD');

  const lh = 5.5; // line height
  const col1 = MAR + 3;
  const col2 = MAR + W * 0.45;
  const col3 = MAR + W * 0.7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  // Linha 1: Nome | CNPJ/CPF
  doc.setTextColor(...GRAY); doc.text('Nome:', col1, y + lh);
  doc.setTextColor(...BLACK); doc.text(cliente?.nome || '-', col1 + 12, y + lh);
  doc.setTextColor(...GRAY); doc.text('CNPJ/CPF:', col2, y + lh);
  doc.setTextColor(...BLACK); doc.text(cliente?.cnpjCpf || '-', col2 + 18, y + lh);

  // Linha 2: Endereço | Telefone | Bairro
  doc.setTextColor(...GRAY); doc.text('Endereço:', col1, y + lh * 2.3);
  doc.setTextColor(...BLACK); doc.text(cliente?.endereco || '-', col1 + 18, y + lh * 2.3);
  doc.setTextColor(...GRAY); doc.text('Telefone:', col2, y + lh * 2.3);
  doc.setTextColor(...BLACK); doc.text(formatTel(cliente?.telefone), col2 + 18, y + lh * 2.3);
  doc.setTextColor(...GRAY); doc.text('Bairro:', col3, y + lh * 2.3);
  doc.setTextColor(...BLACK); doc.text(cliente?.bairro || '-', col3 + 14, y + lh * 2.3);

  // Linha 3: Cidade | UF | Whatsapp | Contato
  doc.setTextColor(...GRAY); doc.text('Cidade:', col1, y + lh * 3.6);
  doc.setTextColor(...BLACK); doc.text(cliente?.cidade || '-', col1 + 13, y + lh * 3.6);
  doc.setTextColor(...GRAY); doc.text('UF:', col2, y + lh * 3.6);
  doc.setTextColor(...BLACK); doc.text(cliente?.estado || 'ES', col2 + 7, y + lh * 3.6);
  doc.setTextColor(...GRAY); doc.text('Whatsapp:', col2 + 22, y + lh * 3.6);
  doc.setTextColor(...BLACK); doc.text(formatTel(cliente?.whatsapp), col2 + 38, y + lh * 3.6);
  doc.setTextColor(...GRAY); doc.text('Contato:', col3, y + lh * 3.6);
  doc.setTextColor(...BLACK); doc.text(cliente?.contato || '-', col3 + 16, y + lh * 3.6);

  // Linha 4: Email | PGT
  doc.setTextColor(...GRAY); doc.text('Email:', col1, y + lh * 4.9);
  doc.setTextColor(...BLACK); doc.text(cliente?.email || '-', col1 + 11, y + lh * 4.9);
  doc.setTextColor(...GRAY); doc.text('PGT:', col3, y + lh * 4.9);
  doc.setTextColor(...BLACK); doc.text(cliente?.pgt || 'BOLETO', col3 + 9, y + lh * 4.9);

  y += 32;

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
      // linhas em branco para parecer o modelo (mínimo 18 linhas)
      ...Array(Math.max(0, 18 - itens.length)).fill([
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
  doc.text('Observações: ', col1, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(observacoes || 'Orçamento válido pelo período de 30 dias', col1 + 24, y + 6);
  y += 24;

  // =============================================
  // RODAPÉ — Assinatura + Data
  // =============================================
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...BLACK);
  doc.text('Ass. Responsável: ', col1, y + 6);
  // linha de assinatura
  doc.setDrawColor(...BLACK);
  doc.setLineWidth(0.3);
  doc.line(col1 + 35, y + 6.5, col1 + 110, y + 6.5);

  doc.text(fmtData(data), PW - MAR, y + 6, { align: 'right' });

  // =============================================
  // SALVAR + retornar blob para compartilhamento
  // =============================================
  const nomeArq = `orcamento-${(cliente?.nome || 'cliente').replace(/\s+/g, '-').toLowerCase()}.pdf`;
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
