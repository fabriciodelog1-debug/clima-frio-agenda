import { jsPDF } from 'jspdf';
import { ServiceOrder, Customer, Equipment, OSChecklist } from '../types';

const CHECKLIST_LABELS: { [key in keyof OSChecklist]: string } = {
  cleanEvaporator: 'Limpeza da Unidade Evaporadora (Interna)',
  cleanCondenser: 'Limpeza da Unidade Condensadora (Externa)',
  checkGasPressure: 'Verificação da Pressão do Gás Refrigerante',
  checkElectrical: 'Reaperto dos Bornes Elétricos e Cabos',
  checkDrainage: 'Desobstrução e Limpeza do Sistema de Dreno',
  testRemote: 'Teste de Funcionamento e Controle Remoto',
  sanitizeUnit: 'Aplicação de Bactericida / Higienização',
};

export function generateOSPDF(selectedOS: ServiceOrder, client: Customer | undefined, equip: Equipment | undefined): jsPDF {
  // Create PDF document in A4 portrait format (210mm x 297mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const marginX = 15;
  const pageWidth = 210;
  const pageHeight = 297;
  const contentWidth = pageWidth - (marginX * 2); // 180mm
  let currentY = 15;

  // Primary accent colors
  const colorPrimary = [30, 64, 175]; // #1e40af (Blue 800)
  const colorSecondary = [15, 23, 42]; // #0f172a (Slate 900)
  const colorLightBg = [248, 250, 252]; // #f8fafc (Slate 50)
  const colorBorder = [226, 232, 240]; // #e2e8f0 (Slate 200)
  const colorTextDark = [30, 41, 59]; // #1e293b (Slate 800)
  const colorTextMuted = [100, 116, 139]; // #64748b (Slate 500)

  // Helper for drawing a solid horizontal line
  const drawDivider = (y: number, thickness = 0.3) => {
    doc.setDrawColor(colorBorder[0], colorBorder[1], colorBorder[2]);
    doc.setLineWidth(thickness);
    doc.line(marginX, y, marginX + contentWidth, y);
  };

  // Helper for drawing section header
  const drawSectionHeader = (title: string, y: number) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
    doc.text(title.toUpperCase(), marginX, y);
    return y + 4;
  };

  // Load company profile from localStorage
  let company: any = null;
  try {
    const stored = localStorage.getItem('climafrio_company_profile');
    if (stored) {
      company = JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error loading company profile', e);
  }

  const compName = company?.name || 'CLIMA FRIO';
  const compSlogan = company?.slogan || 'Sistemas de Climatização & Refrigeração';
  const compCNPJ = company?.cnpj ? `CNPJ: ${company.cnpj}` : '';
  const compPhone = company?.phone || '(11) 98765-4321';
  const compEmail = company?.email || 'contato@climafrio.com';

  let compAddressLine = '';
  if (company?.address) {
    const addr = company.address;
    compAddressLine = `${addr.street || ''}, ${addr.number || ''} ${addr.complement ? `- ${addr.complement}` : ''} - ${addr.neighborhood || ''}, ${addr.city || ''}/${addr.state || ''}`;
  } else {
    compAddressLine = 'Suporte Técnico Especializado de Ar Condicionado';
  }

  // --- HEADER SECTION ---
  if (company?.bannerUrl) {
    try {
      // Draw custom company banner on the left (125mm wide, 24mm high)
      doc.addImage(company.bannerUrl, 'JPEG', marginX, currentY, 125, 24);
    } catch (err) {
      console.error("Error drawing banner image in PDF", err);
      // Fallback
      doc.setFillColor(colorLightBg[0], colorLightBg[1], colorLightBg[2]);
      doc.rect(marginX, currentY, 125, 24, 'F');
      doc.setDrawColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
      doc.setLineWidth(1);
      doc.line(marginX, currentY, marginX, currentY + 24);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(colorSecondary[0], colorSecondary[1], colorSecondary[2]);
      doc.text(compName.toUpperCase(), marginX + 4, currentY + 7);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(colorTextMuted[0], colorTextMuted[1], colorTextMuted[2]);
      doc.text(compSlogan, marginX + 4, currentY + 12);
      doc.text(`E-mail: ${compEmail} | Tel: ${compPhone}`, marginX + 4, currentY + 16);
      doc.text(compCNPJ ? `${compCNPJ} | ${compAddressLine}` : compAddressLine, marginX + 4, currentY + 20);
    }
  } else {
    doc.setFillColor(colorLightBg[0], colorLightBg[1], colorLightBg[2]);
    doc.rect(marginX, currentY, 125, 24, 'F');
    doc.setDrawColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
    doc.setLineWidth(1);
    doc.line(marginX, currentY, marginX, currentY + 24); // Left blue border accent

    // Company details
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(colorSecondary[0], colorSecondary[1], colorSecondary[2]);
    doc.text(compName.toUpperCase(), marginX + 4, currentY + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(colorTextMuted[0], colorTextMuted[1], colorTextMuted[2]);
    doc.text(compSlogan, marginX + 4, currentY + 12);
    doc.text(`E-mail: ${compEmail}  |  Tel: ${compPhone}`, marginX + 4, currentY + 16);
    doc.text(compCNPJ ? `${compCNPJ} | ${compAddressLine}` : compAddressLine, marginX + 4, currentY + 20);
  }

  // OS Info Box on top right (Always standard right aligned, 50mm wide)
  doc.setFillColor(241, 245, 249); // light blue-gray
  doc.rect(145, currentY, 50, 24, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.2);
  doc.rect(145, currentY, 50, 24, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(colorSecondary[0], colorSecondary[1], colorSecondary[2]);
  doc.text('DOCUMENTO', 148, currentY + 7);
  doc.setFontSize(11);
  doc.setTextColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
  doc.text(`N° ${selectedOS.id}`, 148, currentY + 12);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(colorTextDark[0], colorTextDark[1], colorTextDark[2]);
  doc.text(`Data: ${new Date(selectedOS.dateOpened + 'T12:00:00').toLocaleDateString('pt-BR')}`, 148, currentY + 17);
  doc.text(`Status: ${selectedOS.status.toUpperCase()}`, 148, currentY + 21);

  currentY += 30;

  // --- CLIENT & LOCAL DE INSTALAÇÃO ---
  doc.setFillColor(255, 255, 255);
  drawSectionHeader('Dados do Cliente & Localização', currentY);
  currentY += 2;

  // Let's print two columns
  const colWidth = contentWidth / 2 - 2;

  // Col 1: Customer Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(colorTextDark[0], colorTextDark[1], colorTextDark[2]);
  doc.text('CLIENTE:', marginX, currentY + 4);
  doc.setFont('helvetica', 'normal');
  doc.text(client?.name || 'Cliente Geral', marginX + 16, currentY + 4);

  doc.setFont('helvetica', 'bold');
  doc.text('CPF/CNPJ:', marginX, currentY + 8);
  doc.setFont('helvetica', 'normal');
  doc.text(client?.cpfCnpj || 'Não Informado', marginX + 18, currentY + 8);

  doc.setFont('helvetica', 'bold');
  doc.text('TEL/WHATS:', marginX, currentY + 12);
  doc.setFont('helvetica', 'normal');
  doc.text(client?.phone || 'Não Informado', marginX + 19, currentY + 12);

  doc.setFont('helvetica', 'bold');
  doc.text('E-MAIL:', marginX, currentY + 16);
  doc.setFont('helvetica', 'normal');
  doc.text(client?.email || 'Não Informado', marginX + 14, currentY + 16);

  // Col 2: Address
  const addrX = marginX + colWidth + 4;
  doc.setFont('helvetica', 'bold');
  doc.text('ENDEREÇO DE ATENDIMENTO:', addrX, currentY + 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const streetText = `${client?.address.street || 'Não informado'}, ${client?.address.number || 'S/N'}`;
  const compText = client?.address.complement ? ` - ${client?.address.complement}` : '';
  doc.text(streetText + compText, addrX, currentY + 8);
  
  const cityText = `${client?.address.neighborhood || ''} - ${client?.address.city || ''}/${client?.address.state || ''}`;
  doc.text(cityText, addrX, currentY + 12);
  doc.text(`CEP: ${client?.address.cep || '01000-000'}`, addrX, currentY + 16);

  currentY += 22;
  drawDivider(currentY);
  currentY += 5;

  // --- EQUIPAMENTO ATENDIDO ---
  drawSectionHeader('Equipamento Atendido', currentY);
  currentY += 2;

  // Equipment table / box
  doc.setFillColor(colorLightBg[0], colorLightBg[1], colorLightBg[2]);
  doc.rect(marginX, currentY, contentWidth, 14, 'F');
  doc.setDrawColor(colorBorder[0], colorBorder[1], colorBorder[2]);
  doc.rect(marginX, currentY, contentWidth, 14, 'S');

  // Headers
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(colorTextMuted[0], colorTextMuted[1], colorTextMuted[2]);
  doc.text('MARCA / MODELO', marginX + 4, currentY + 4);
  doc.text('TIPO', marginX + 50, currentY + 4);
  doc.text('CAPACIDADE', marginX + 90, currentY + 4);
  doc.text('Nº SÉRIE', marginX + 125, currentY + 4);
  doc.text('LOCALIZAÇÃO', marginX + 155, currentY + 4);

  // Values
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(colorTextDark[0], colorTextDark[1], colorTextDark[2]);
  doc.text(`${equip?.brand || 'Geral'} / ${equip?.model || 'Inverter'}`, marginX + 4, currentY + 10);
  doc.text(equip?.type || 'Split High Wall', marginX + 50, currentY + 10);
  doc.text(`${equip?.capacityBtu?.toLocaleString() || '12.000'} BTUs`, marginX + 90, currentY + 10);
  doc.text(equip?.serialNumber || 'Não Informado', marginX + 125, currentY + 10);
  doc.text(equip?.locationRoom || 'Sala', marginX + 155, currentY + 10);

  currentY += 20;
  drawDivider(currentY);
  currentY += 5;

  // --- CHECKLIST DE MANUTENÇÃO EFETUADA ---
  drawSectionHeader('Checklist de Manutenção Efetuado', currentY);
  currentY += 3;

  doc.setFontSize(8);
  const checklistKeys = Object.keys(selectedOS.checklist) as Array<keyof OSChecklist>;
  
  // Arrange checklist in 2 columns
  checklistKeys.forEach((key, index) => {
    const isCol2 = index % 2 === 1;
    const itemX = isCol2 ? (marginX + contentWidth / 2 + 5) : marginX;
    const itemY = currentY + Math.floor(index / 2) * 5.5;

    const isChecked = selectedOS.checklist[key];
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.2);
    
    // Draw checkbox
    doc.setFillColor(isChecked ? 240 : 255, isChecked ? 253 : 255, isChecked ? 250 : 255);
    doc.rect(itemX, itemY - 2.5, 3, 3, isChecked ? 'DF' : 'S');
    
    if (isChecked) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(16, 185, 129); // emerald-500
      doc.text('X', itemX + 0.6, itemY - 0.2);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colorTextDark[0], colorTextDark[1], colorTextDark[2]);
    } else {
      doc.setTextColor(colorTextMuted[0], colorTextMuted[1], colorTextMuted[2]);
    }

    doc.text(CHECKLIST_LABELS[key], itemX + 5, itemY);
  });

  currentY += Math.ceil(checklistKeys.length / 2) * 5.5 + 4;
  drawDivider(currentY);
  currentY += 5;

  // --- DESCRITIVO DE DEFEITOS E SERVIÇOS ---
  drawSectionHeader('Descritivos do Serviço', currentY);
  currentY += 2;

  // Issue Reported
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(colorSecondary[0], colorSecondary[1], colorSecondary[2]);
  doc.text('DEFEITO RECLAMADO / SERVIÇO SOLICITADO:', marginX, currentY + 3);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(colorTextDark[0], colorTextDark[1], colorTextDark[2]);
  
  const issueLines = doc.splitTextToSize(selectedOS.issueReported, contentWidth);
  doc.text(issueLines, marginX, currentY + 7);
  currentY += (issueLines.length * 4) + 9;

  // Service Performed
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(colorSecondary[0], colorSecondary[1], colorSecondary[2]);
  doc.text('TÉCNICO: SERVIÇO EXECUTADO & OBSERVAÇÕES:', marginX, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(colorTextDark[0], colorTextDark[1], colorTextDark[2]);
  
  const serviceText = selectedOS.servicePerformed || 'Aguardando execução / orçamento pendente.';
  const serviceLines = doc.splitTextToSize(serviceText, contentWidth);
  doc.text(serviceLines, marginX, currentY + 4);
  currentY += (serviceLines.length * 4) + 8;

  // Photo Evidence details if any
  if (selectedOS.photoUrl) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(colorSecondary[0], colorSecondary[1], colorSecondary[2]);
    doc.text('EVIDÊNCIA COMPLEMENTAR:', marginX, currentY);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(colorTextMuted[0], colorTextMuted[1], colorTextMuted[2]);
    const photoDescText = selectedOS.photoDescription || 'Registro fotográfico das ações efetuadas no equipamento.';
    const photoDescLines = doc.splitTextToSize(photoDescText, contentWidth);
    doc.text(photoDescLines, marginX, currentY + 4);
    currentY += (photoDescLines.length * 4) + 6;
  }

  drawDivider(currentY);
  currentY += 5;

  // Check if we need a page break soon, standard A4 is 297mm height, currentY should be < 240
  if (currentY > 230) {
    doc.addPage();
    currentY = 15;
  }

  // --- VALORES E PAGAMENTO ---
  drawSectionHeader('Valores do Atendimento & Orçamento', currentY);
  currentY += 3;

  doc.setFillColor(colorLightBg[0], colorLightBg[1], colorLightBg[2]);
  doc.rect(marginX, currentY, contentWidth, 20, 'F');
  doc.setDrawColor(colorBorder[0], colorBorder[1], colorBorder[2]);
  doc.rect(marginX, currentY, contentWidth, 20, 'S');

  // Values detail left side
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(colorTextMuted[0], colorTextMuted[1], colorTextMuted[2]);
  doc.text('MÃO DE OBRA / TÉCNICA:', marginX + 4, currentY + 6);
  doc.text('PEÇAS & INSUMOS SUBSTITUÍDOS:', marginX + 4, currentY + 11);
  doc.text('FORMA DE PAGAMENTO / VENCIMENTO:', marginX + 4, currentY + 16);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colorTextDark[0], colorTextDark[1], colorTextDark[2]);
  doc.text(`R$ ${selectedOS.laborValue.toFixed(2)}`, marginX + 60, currentY + 6);
  doc.text(`R$ ${selectedOS.partsValue.toFixed(2)}`, marginX + 60, currentY + 11);
  doc.text('Conforme combinado à vista (PIX / Cartão)', marginX + 60, currentY + 16);

  // Total Summary right side
  doc.setDrawColor(colorBorder[0], colorBorder[1], colorBorder[2]);
  doc.line(marginX + 115, currentY + 2, marginX + 115, currentY + 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
  doc.text('VALOR TOTAL:', marginX + 120, currentY + 7);
  doc.setFontSize(14);
  doc.text(`R$ ${selectedOS.totalValue.toFixed(2)}`, marginX + 120, currentY + 13);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  const isPaid = selectedOS.paymentStatus === 'paid';
  doc.setTextColor(isPaid ? 16 : 220, isPaid ? 185 : 38, isPaid ? 129 : 38); // emerald vs red
  doc.text(`SITUAÇÃO: ${isPaid ? 'CONCLUÍDO / PAGO' : 'PENDENTE DE PAGAMENTO'}`, marginX + 120, currentY + 17);

  currentY += 28;

  // --- SIGNATURES AND COMPLIANCE ---
  if (currentY > 250) {
    doc.addPage();
    currentY = 15;
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(colorTextMuted[0], colorTextMuted[1], colorTextMuted[2]);
  doc.text(`Este documento oficial de atendimento ${compName} serve como comprovante de prestação de serviços de refrigeração e climatização.`, marginX, currentY);
  doc.text('Garantia legal de 90 dias para mão de obra e peças aplicadas a contar da data de conclusão do chamado técnico.', marginX, currentY + 3);

  currentY += 15;

  // Signature lines
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.3);
  
  // Left line
  doc.line(marginX + 5, currentY, marginX + 75, currentY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(colorTextDark[0], colorTextDark[1], colorTextDark[2]);
  doc.text(`${compName.toUpperCase()} SERVICE & TECH`, marginX + 22, currentY + 4);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Assinatura do Técnico Responsável', marginX + 18, currentY + 7.5);

  // Right line
  doc.line(marginX + 105, currentY, marginX + 175, currentY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(colorTextDark[0], colorTextDark[1], colorTextDark[2]);
  doc.text((client?.name || 'Cliente de Refrigeração').toUpperCase(), marginX + 115, currentY + 4);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Assinatura do Cliente (De Acordo)', marginX + 122, currentY + 7.5);

  return doc;
}

/**
 * Builds the URL and predefined polite message for WhatsApp.
 */
export function getWhatsAppShareText(selectedOS: ServiceOrder, client: Customer | undefined): { phone: string; text: string } {
  const phone = client?.phone ? client.phone.replace(/\D/g, '') : '';
  const clientName = client?.name || 'Cliente';
  const osNum = selectedOS.id;
  const total = selectedOS.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const statusLabel = selectedOS.paymentStatus === 'paid' ? 'Pago (Confirmado)' : 'Pendente de aprovação / pagamento';
  
  let compName = 'Clima Frio';
  try {
    const stored = localStorage.getItem('climafrio_company_profile');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.name) compName = parsed.name;
    }
  } catch (e) {}

  const text = `Olá ${clientName}, segue o orçamento / ordem de serviço de manutenção ${compName} referente ao seu equipamento.

📋 *Código do Documento:* ${osNum}
💰 *Valor Total:* ${total}
🔧 *Serviço:* ${selectedOS.issueReported}
🏷️ *Situação:* ${statusLabel}

O documento em formato PDF foi gerado pelo nosso técnico e já foi baixado em seu computador ou celular.
Qualquer dúvida, estamos à disposição no WhatsApp! Obrigado pela preferência!`;

  return {
    phone,
    text: encodeURIComponent(text)
  };
}
