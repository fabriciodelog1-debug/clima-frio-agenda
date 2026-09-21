import { jsPDF } from 'jspdf';
import { DiagnosticReport, Customer, Equipment } from '../types';

export function generateDiagnosticPDF(
  report: DiagnosticReport,
  customer?: Customer,
  equipment?: Equipment
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const marginX = 14;
  const pageWidth = 210;
  const contentWidth = pageWidth - marginX * 2; // 182mm
  let currentY = 12;

  // Colors
  const cPrimary = [14, 116, 144]; // #0e7490 Cyan 700 / HVAC Blue
  const cDark = [15, 23, 42]; // Slate 900
  const cText = [30, 41, 59]; // Slate 800
  const cMuted = [100, 116, 139]; // Slate 500
  const cBorder = [226, 232, 240]; // Slate 200
  const cBgLight = [248, 250, 252]; // Slate 50
  const cEmerald = [16, 185, 129];

  // Helper lines
  const drawDivider = (y: number, thickness = 0.2) => {
    doc.setDrawColor(cBorder[0], cBorder[1], cBorder[2]);
    doc.setLineWidth(thickness);
    doc.line(marginX, y, marginX + contentWidth, y);
  };

  const drawSectionHeader = (title: string, y: number) => {
    doc.setFillColor(241, 245, 249);
    doc.rect(marginX, y, contentWidth, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(cPrimary[0], cPrimary[1], cPrimary[2]);
    doc.text(title.toUpperCase(), marginX + 3, y + 4.2);
    return y + 8.5;
  };

  // Load company profile
  let company: any = null;
  try {
    const stored = localStorage.getItem('climafrio_company_profile');
    if (stored) company = JSON.parse(stored);
  } catch (e) {
    console.error('Error loading company profile', e);
  }

  const companyName = company?.name || 'CLIMA FRIO - ENGENHARIA TÉCNICA EM CLIMATIZAÇÃO';
  const companyCnpj = company?.cnpj || '12.345.678/0001-99';
  const companyPhone = company?.phone || '(11) 98765-4321';
  const companyEmail = company?.email || 'contato@climafrio.com.br';

  // 1. TOP HEADER / TIMBRADO
  doc.setFillColor(15, 23, 42); // Dark slate header banner
  doc.rect(marginX, currentY, contentWidth, 22, 'F');

  // Title in header banner
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(companyName.toUpperCase(), marginX + 5, currentY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`CNPJ: ${companyCnpj}  |  Tel: ${companyPhone}  |  E-mail: ${companyEmail}`, marginX + 5, currentY + 12);
  doc.text('Especialistas em Refrigeração, Diagnóstico Eletrônico e Climatização Residencial / Comercial', marginX + 5, currentY + 17);

  // Badge right
  doc.setFillColor(14, 116, 144);
  doc.rect(marginX + contentWidth - 46, currentY + 4, 42, 14, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('LAUDO TÉCNICO', marginX + contentWidth - 25, currentY + 9, { align: 'center' });
  doc.setFontSize(7);
  doc.text(report.id, marginX + contentWidth - 25, currentY + 14, { align: 'center' });

  currentY += 26;

  // Title Box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(cDark[0], cDark[1], cDark[2]);
  const typeText = report.reportType === 'conserto_realizado' 
    ? 'LAUDO DE DIAGNÓSTICO E CONSERTO DE AR-CONDICIONADO' 
    : report.reportType === 'diagnostico' 
    ? 'PARECER TÉCNICO DE DIAGNÓSTICO & AVALIAÇÃO' 
    : 'LAUDO DE REVISÃO E MANUTENÇÃO COMPLETA';
  doc.text(typeText, marginX, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
  const formattedDate = report.date ? report.date.split('-').reverse().join('/') : new Date().toLocaleDateString('pt-BR');
  doc.text(`Data de Emissão: ${formattedDate}   |   Técnico: ${report.technicianName}`, marginX, currentY + 4.5);

  currentY += 8.5;

  // 2. CLIENTE & EQUIPAMENTO (2 COLUNAS)
  const boxWidth = (contentWidth - 4) / 2;
  const colY = currentY;

  // Box Cliente
  doc.setFillColor(cBgLight[0], cBgLight[1], cBgLight[2]);
  doc.setDrawColor(cBorder[0], cBorder[1], cBorder[2]);
  doc.roundedRect(marginX, colY, boxWidth, 25, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(cPrimary[0], cPrimary[1], cPrimary[2]);
  doc.text('1. DADOS DO CLIENTE', marginX + 3, colY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(cText[0], cText[1], cText[2]);
  doc.text(`Cliente: ${customer?.name || 'Cliente Cadastrado'}`, marginX + 3, colY + 9);
  doc.text(`CPF/CNPJ: ${customer?.cpfCnpj || 'Não informado'}   Tel: ${customer?.phone || '-'}`, marginX + 3, colY + 13.5);
  const fullAddress = customer?.address 
    ? `${customer.address.street}, ${customer.address.number} ${customer.address.complement || ''} - ${customer.address.neighborhood}, ${customer.address.city}/${customer.address.state}`
    : 'Endereço no local do atendimento';
  const splitAddress = doc.splitTextToSize(`Local: ${fullAddress}`, boxWidth - 6);
  doc.text(splitAddress.slice(0, 2), marginX + 3, colY + 18);

  // Box Equipamento
  const equipColX = marginX + boxWidth + 4;
  doc.setFillColor(cBgLight[0], cBgLight[1], cBgLight[2]);
  doc.roundedRect(equipColX, colY, boxWidth, 25, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(cPrimary[0], cPrimary[1], cPrimary[2]);
  doc.text('2. APARELHO ATENDIDO', equipColX + 3, colY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(cText[0], cText[1], cText[2]);
  doc.text(`Tipo / Marca: ${equipment ? `${equipment.type} - ${equipment.brand}` : 'Ar-Condicionado Split'}`, equipColX + 3, colY + 9);
  doc.text(`Modelo: ${equipment?.model || 'Padrão'}   Série: ${equipment?.serialNumber || 'N/A'}`, equipColX + 3, colY + 13.5);
  doc.text(`Capacidade: ${equipment ? equipment.capacityBtu.toLocaleString('pt-BR') : '12.000'} BTUs   Gás: ${report.gasType || 'R410A'}`, equipColX + 3, colY + 18);
  doc.text(`Ambiente: ${equipment?.locationRoom || 'Ambiente do cliente'}`, equipColX + 3, colY + 22.5);

  currentY += 28;

  // 3. SINTOMA RELATADO & CAUSA RAIZ
  currentY = drawSectionHeader('3. Sintoma Informado & Causa Raiz Diagnosticada', currentY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(cDark[0], cDark[1], cDark[2]);
  doc.text('• Queixa / Sintoma do Cliente:', marginX + 2, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(cText[0], cText[1], cText[2]);
  const symptomLines = doc.splitTextToSize(report.symptomReported || 'Aparelho não resfriava adequadamente.', contentWidth - 45);
  doc.text(symptomLines, marginX + 44, currentY);
  currentY += Math.max(symptomLines.length * 3.6, 4.5) + 1.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(cDark[0], cDark[1], cDark[2]);
  doc.text('• Causa Raiz Identificada:', marginX + 2, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(cText[0], cText[1], cText[2]);
  const causeLines = doc.splitTextToSize(report.failureCause || 'Fadiga de componente e microvazamento na tubulação.', contentWidth - 45);
  doc.text(causeLines, marginX + 44, currentY);
  currentY += Math.max(causeLines.length * 3.6, 5) + 2.5;

  // 4. MEDIÇÕES TÉCNICAS (GRID)
  currentY = drawSectionHeader('4. Medições Técnicas & Parâmetros de Eficiência Térmica', currentY);

  const deltaT = (report.returnTempC !== undefined && report.supplyTempC !== undefined)
    ? (report.returnTempC - report.supplyTempC).toFixed(1)
    : null;

  const measureCols = 4;
  const mCellWidth = contentWidth / measureCols;
  const mCellHeight = 11;

  const measurements = [
    { label: 'Fluido Refrigerante', value: report.gasType || 'R410A' },
    { label: 'Pressão Sucção (Baixa)', value: report.suctionPressurePsi ? `${report.suctionPressurePsi} PSI` : 'N/A' },
    { label: 'Temp. Insuflamento', value: report.supplyTempC ? `${report.supplyTempC}°C` : 'N/A' },
    { label: 'Temp. Retorno', value: report.returnTempC ? `${report.returnTempC}°C` : 'N/A' },
    { label: 'Salto Térmico (Delta T)', value: deltaT ? `${deltaT}°C (Aprovado)` : 'N/A', highlight: true },
    { label: 'Tensão Elétrica', value: report.voltageV ? `${report.voltageV} V` : '220 V' },
    { label: 'Corrente Medida', value: report.measuredCurrentA ? `${report.measuredCurrentA} A (Nom: ${report.nominalCurrentA || '-'} A)` : 'N/A' },
    { label: 'Nível de Vácuo', value: report.vacuumMicrons ? `${report.vacuumMicrons} µm` : 'Estanque' },
  ];

  measurements.forEach((m, idx) => {
    const col = idx % measureCols;
    const row = Math.floor(idx / measureCols);
    const cellX = marginX + col * mCellWidth;
    const cellY = currentY + row * mCellHeight;

    doc.setFillColor(m.highlight ? 236 : 248, m.highlight ? 253 : 250, m.highlight ? 245 : 252);
    doc.setDrawColor(cBorder[0], cBorder[1], cBorder[2]);
    doc.rect(cellX, cellY, mCellWidth, mCellHeight, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
    doc.text(m.label, cellX + 2, cellY + 3.8);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(m.highlight ? cEmerald[0] : cDark[0], m.highlight ? cEmerald[1] : cDark[1], m.highlight ? cEmerald[2] : cDark[2]);
    doc.text(m.value, cellX + 2, cellY + 8.5);
  });

  currentY += Math.ceil(measurements.length / measureCols) * mCellHeight + 3;

  // 5. CONSERTO EXECUTADO & PEÇAS SUBSTITUÍDAS
  currentY = drawSectionHeader('5. Procedimentos de Conserto Realizados & Peças Trocadas', currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(cText[0], cText[1], cText[2]);
  const repairLines = doc.splitTextToSize(report.repairActionTaken || 'Manutenção corretiva e regulagem executadas.', contentWidth - 4);
  doc.text(repairLines, marginX + 2, currentY);
  currentY += repairLines.length * 3.6 + 2;

  // Tabela de peças se houver
  if (report.partsReplaced && report.partsReplaced.length > 0) {
    doc.setFillColor(241, 245, 249);
    doc.rect(marginX, currentY, contentWidth, 5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(cDark[0], cDark[1], cDark[2]);
    doc.text('Peça / Componente Substituído', marginX + 3, currentY + 3.5);
    doc.text('Qtd', marginX + 105, currentY + 3.5);
    doc.text('Garantia Peça', marginX + 125, currentY + 3.5);
    doc.text('Valor Unit.', marginX + 155, currentY + 3.5);
    currentY += 5;

    report.partsReplaced.forEach((part, pIdx) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(cText[0], cText[1], cText[2]);
      doc.text(`${pIdx + 1}. ${part.name} ${part.code ? `(${part.code})` : ''}`, marginX + 3, currentY + 3.5);
      doc.text(`${part.quantity}`, marginX + 105, currentY + 3.5);
      doc.text(`${part.warrantyMonths || 3} meses`, marginX + 125, currentY + 3.5);
      doc.text(`R$ ${part.unitPrice.toFixed(2)}`, marginX + 155, currentY + 3.5);
      currentY += 4.5;
    });
    currentY += 1.5;
  }

  // 6. TESTES FINAIS & CERTIFICAÇÃO DO CONSERTO
  currentY = drawSectionHeader('6. Protocolo de Testes Finais de Funcionamento & Segurança', currentY);

  const testList = [
    { label: 'Teste de Estanqueidade de Fluido (Sem vazamento de gás)', ok: report.leakTestPassed },
    { label: 'Escoamento Livre e Higiene do Dreno (Sem transbordo de água)', ok: report.drainageTestPassed },
    { label: 'Segurança Elétrica, Bornes e Aterramento', ok: report.electricalSafetyPassed },
    { label: 'Rendimento Térmico / Delta T Comprovado em Operação', ok: report.thermalEfficiencyPassed }
  ];

  const testColWidth = contentWidth / 2;
  testList.forEach((t, idx) => {
    const tCol = idx % 2;
    const tRow = Math.floor(idx / 2);
    const tX = marginX + tCol * testColWidth;
    const tY = currentY + tRow * 4.5;

    doc.setFillColor(t.ok ? 16 : 239, t.ok ? 185 : 68, t.ok ? 129 : 68);
    doc.circle(tX + 2, tY + 2, 1.2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(cDark[0], cDark[1], cDark[2]);
    doc.text(t.ok ? '[APROVADO]' : '[ATENÇÃO]', tX + 5, tY + 2.8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(cText[0], cText[1], cText[2]);
    doc.text(t.label, tX + 26, tY + 2.8);
  });

  currentY += Math.ceil(testList.length / 2) * 4.5 + 3.5;

  // 7. PARECER CONCLUSIVO & GARANTIA
  currentY = drawSectionHeader('7. Parecer Conclusivo, Garantia e Recomendações', currentY);

  // Verdict text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(cDark[0], cDark[1], cDark[2]);
  doc.text('Parecer Técnico:', marginX + 2, currentY);
  doc.setFont('helvetica', 'normal');
  const verdictLines = doc.splitTextToSize(report.finalVerdict || 'Aparelho liberado em perfeito estado operacional.', contentWidth - 30);
  doc.text(verdictLines, marginX + 26, currentY);
  currentY += Math.max(verdictLines.length * 3.6, 5) + 2;

  // Recomendações
  if (report.recommendations) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('Recomendações:', marginX + 2, currentY);
    doc.setFont('helvetica', 'normal');
    const recLines = doc.splitTextToSize(report.recommendations, contentWidth - 30);
    doc.text(recLines, marginX + 26, currentY);
    currentY += Math.max(recLines.length * 3.6, 4.5) + 2;
  }

  // Box Garantia e Valores
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(marginX, currentY, contentWidth, 11, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(14, 116, 144);
  doc.text(`GARANTIA DO SERVIÇO: ${report.warrantyDays || 90} DIAS`, marginX + 4, currentY + 6.8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(cDark[0], cDark[1], cDark[2]);
  doc.text(`Mão de Obra: R$ ${report.laborValue.toFixed(2)}  |  Peças: R$ ${report.partsValue.toFixed(2)}  |  VALOR TOTAL: R$ ${report.totalValue.toFixed(2)}`, marginX + contentWidth - 4, currentY + 6.8, { align: 'right' });

  currentY += 16;

  // 8. ASSINATURAS
  const sigWidth = 75;
  const sig1X = marginX + 10;
  const sig2X = marginX + contentWidth - sigWidth - 10;

  drawDivider(currentY + 6, 0.4);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(cDark[0], cDark[1], cDark[2]);
  doc.text(report.technicianName || 'Técnico Responsável', sig1X + sigWidth / 2, currentY + 10, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
  doc.text('Responsável Técnico em Climatização', sig1X + sigWidth / 2, currentY + 13.5, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(cDark[0], cDark[1], cDark[2]);
  doc.text(customer?.name || 'Cliente / Responsável no Local', sig2X + sigWidth / 2, currentY + 10, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
  doc.text('Ciência do Diagnóstico, Conserto e Garantia', sig2X + sigWidth / 2, currentY + 13.5, { align: 'center' });

  // Rodapé
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`Laudo emitido eletronicamente via Clima Frio Gestão HVAC  •  Página 1/1  •  Código de Autenticidade: ${report.id}`, marginX + contentWidth / 2, 290, { align: 'center' });

  return doc;
}

export function getWhatsAppDiagnosticShareText(
  report: DiagnosticReport,
  customer?: Customer,
  equipment?: Equipment
): string {
  const customerName = customer?.name ? customer.name.split(' ')[0] : 'Cliente';
  const deltaT = (report.returnTempC !== undefined && report.supplyTempC !== undefined)
    ? (report.returnTempC - report.supplyTempC).toFixed(1)
    : null;

  const partsList = report.partsReplaced && report.partsReplaced.length > 0
    ? report.partsReplaced.map(p => `   • ${p.name} (Garantia: ${p.warrantyMonths || 3} meses)`).join('\n')
    : '   • Sem necessidade de troca de componentes';

  return `❄️ *LAUDO TÉCNICO DE CONSERTO DO AR-CONDICIONADO* ❄️
*Clima Frio - Refrigeração & Climatização*

Olá, *${customerName}*! Tudo bem?
Segue o laudo técnico com o diagnóstico e o conserto realizado no seu ar-condicionado:

📋 *Laudo Nº:* ${report.id}
📅 *Data:* ${report.date.split('-').reverse().join('/')}
📍 *Aparelho:* ${equipment ? `${equipment.type} ${equipment.brand} (${equipment.capacityBtu.toLocaleString('pt-BR')} BTUs)` : 'Ar-Condicionado'}
📌 *Ambiente:* ${equipment?.locationRoom || 'Residência/Escritório'}

🔍 *SINTOMA / DEFEITO CONSTATADO:*
${report.symptomReported}

⚠️ *CAUSA RAIZ IDENTIFICADA:*
${report.failureCause}

🛠️ *CONSERTO & PROCEDIMENTOS REALIZADOS:*
${report.repairActionTaken}

📦 *PEÇAS SUBSTITUÍDAS:*
${partsList}

📊 *TESTES DE FUNCIONAMENTO REALIZADOS:*
${report.supplyTempC ? `🌡️ Temperatura no Insuflamento: ${report.supplyTempC}°C` : ''}
${deltaT ? `❄️ Salto Térmico (Delta T): ${deltaT}°C (Rendimento térmico ótimo!)` : ''}
${report.suctionPressurePsi ? `⏱️ Pressão do Fluido (${report.gasType}): ${report.suctionPressurePsi} PSI` : ''}
✅ Teste de estanqueidade: 100% aprovado (sem vazamentos)
✅ Teste de dreno: 100% desobstruído e limpo

🛡️ *GARANTIA DO SERVIÇO:* ${report.warrantyDays || 90} dias
💰 *VALOR TOTAL DO SERVIÇO:* R$ ${report.totalValue.toFixed(2)}

${report.recommendations ? `💡 *DICA DE CUIDADO:* ${report.recommendations}` : ''}

Qualquer dúvida estamos à sua total disposição! Obrigado pela confiança na Clima Frio!`;
}
