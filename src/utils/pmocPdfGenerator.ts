import { jsPDF } from 'jspdf';
import { PMOCPlan, Customer, Equipment } from '../types';

export function generatePMOCPDF(
  plan: PMOCPlan,
  customer: Customer | undefined,
  equipments: Equipment[]
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const marginX = 14;
  const pageWidth = 210;
  const pageHeight = 297;
  const contentWidth = pageWidth - marginX * 2; // 182mm
  let currentY = 14;

  // Colors
  const colorNavy = [15, 23, 42]; // #0f172a
  const colorBlue = [30, 64, 175]; // #1e40af
  const colorLightBg = [248, 250, 252]; // #f8fafc
  const colorBorder = [203, 213, 225]; // #cbd5e1
  const colorTextDark = [30, 41, 59]; // #1e293b
  const colorTextMuted = [100, 116, 139]; // #64748b
  const colorGreen = [16, 185, 129];

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

  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - 16) {
      doc.addPage();
      currentY = 14;
      drawHeaderMini();
    }
  };

  const drawHeaderMini = () => {
    doc.setFillColor(colorLightBg[0], colorLightBg[1], colorLightBg[2]);
    doc.rect(marginX, currentY, contentWidth, 10, 'F');
    doc.setDrawColor(colorBorder[0], colorBorder[1], colorBorder[2]);
    doc.line(marginX, currentY + 10, marginX + contentWidth, currentY + 10);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(colorNavy[0], colorNavy[1], colorNavy[2]);
    doc.text(`${compName.toUpperCase()} • DOSSIÊ TÉCNICO PMOC (LEI 13.589/2018)`, marginX + 3, currentY + 6.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(colorTextMuted[0], colorTextMuted[1], colorTextMuted[2]);
    doc.text(`Doc: ${plan.id} | ART/TRT: ${plan.technicalResp.artOrTrtNumber}`, pageWidth - marginX - 3, currentY + 6.5, { align: 'right' });

    currentY += 14;
  };

  // --- PAGE 1: OFFICIAL HEADER ---
  if (company?.bannerUrl) {
    try {
      doc.addImage(company.bannerUrl, 'JPEG', marginX, currentY, 125, 22);
    } catch (err) {
      doc.setFillColor(colorLightBg[0], colorLightBg[1], colorLightBg[2]);
      doc.rect(marginX, currentY, 125, 22, 'F');
      doc.setDrawColor(colorBlue[0], colorBlue[1], colorBlue[2]);
      doc.setLineWidth(1);
      doc.line(marginX, currentY, marginX, currentY + 22);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(colorNavy[0], colorNavy[1], colorNavy[2]);
      doc.text(compName.toUpperCase(), marginX + 4, currentY + 6);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(colorTextMuted[0], colorTextMuted[1], colorTextMuted[2]);
      doc.text(compSlogan, marginX + 4, currentY + 11);
      doc.text(`E-mail: ${compEmail} | Tel: ${compPhone}`, marginX + 4, currentY + 15);
      doc.text(compCNPJ, marginX + 4, currentY + 19);
    }
  } else {
    doc.setFillColor(colorLightBg[0], colorLightBg[1], colorLightBg[2]);
    doc.rect(marginX, currentY, 125, 22, 'F');
    doc.setDrawColor(colorBlue[0], colorBlue[1], colorBlue[2]);
    doc.setLineWidth(1);
    doc.line(marginX, currentY, marginX, currentY + 22);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(colorNavy[0], colorNavy[1], colorNavy[2]);
    doc.text(compName.toUpperCase(), marginX + 4, currentY + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(colorTextMuted[0], colorTextMuted[1], colorTextMuted[2]);
    doc.text(compSlogan, marginX + 4, currentY + 11);
    doc.text(`E-mail: ${compEmail} | Tel: ${compPhone}`, marginX + 4, currentY + 15);
    doc.text(compCNPJ, marginX + 4, currentY + 19);
  }

  // Top Right Info Box
  doc.setFillColor(241, 245, 249);
  doc.rect(143, currentY, 53, 22, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.rect(143, currentY, 53, 22, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(colorBlue[0], colorBlue[1], colorBlue[2]);
  doc.text('PMOC REGULAMENTAR', 146, currentY + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(colorNavy[0], colorNavy[1], colorNavy[2]);
  doc.text(plan.id, 146, currentY + 10.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(colorTextMuted[0], colorTextMuted[1], colorTextMuted[2]);
  doc.text(`Vigência: ${new Date(plan.startDate).toLocaleDateString('pt-BR')} a ${new Date(plan.endDate).toLocaleDateString('pt-BR')}`, 146, currentY + 15);
  doc.text(`Conformidade: ${plan.compliancePercentage}%`, 146, currentY + 19);

  currentY += 28;

  // Title Banner
  doc.setFillColor(colorBlue[0], colorBlue[1], colorBlue[2]);
  doc.rect(marginX, currentY, contentWidth, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('PLANO DE MANUTENÇÃO, OPERAÇÃO E CONTROLE - PMOC', marginX + 4, currentY + 5.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('LEI FEDERAL Nº 13.589/2018 | PORTARIA MS Nº 3.523/1998', pageWidth - marginX - 4, currentY + 5.5, { align: 'right' });

  currentY += 12;

  // --- SECTION 1: EMPREENDIMENTO & CONTRATANTE ---
  doc.setFillColor(241, 245, 249);
  doc.rect(marginX, currentY, contentWidth, 5.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(colorNavy[0], colorNavy[1], colorNavy[2]);
  doc.text('1. DADOS DO EMPREENDIMENTO E EDIFICAÇÃO', marginX + 3, currentY + 4);

  currentY += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(colorTextDark[0], colorTextDark[1], colorTextDark[2]);
  doc.text('Razão Social / Cliente:', marginX, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${customer?.name || plan.buildingName} (${plan.cnpjOrCpf})`, marginX + 32, currentY);

  doc.setFont('helvetica', 'bold');
  doc.text('Nome do Edifício:', 125, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(plan.buildingName, 150, currentY);

  currentY += 4.5;

  doc.setFont('helvetica', 'bold');
  doc.text('Endereço Completo:', marginX, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(plan.addressText, marginX + 28, currentY);

  currentY += 4.5;

  doc.setFont('helvetica', 'bold');
  doc.text('Área Climatizada:', marginX, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${plan.airConditionedAreaM2} m²`, marginX + 26, currentY);

  doc.setFont('helvetica', 'bold');
  doc.text('Carga Térmica Total:', 65, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${plan.totalThermalCapacityBtu.toLocaleString('pt-BR')} BTU/h (${plan.totalThermalCapacityTR.toFixed(1)} TR)`, 95, currentY);

  doc.setFont('helvetica', 'bold');
  doc.text('Ocupação:', 145, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${plan.fixedOccupants} fixos / ${plan.transientOccupants} flutuantes`, 160, currentY);

  currentY += 8;

  // --- SECTION 2: RESPONSÁVEL TÉCNICO MECÂNICO (ART / TRT) ---
  doc.setFillColor(241, 245, 249);
  doc.rect(marginX, currentY, contentWidth, 5.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(colorNavy[0], colorNavy[1], colorNavy[2]);
  doc.text('2. IDENTIFICAÇÃO DA RESPONSABILIDADE TÉCNICA MECÂNICA (ART / TRT)', marginX + 3, currentY + 4);

  currentY += 8;

  const resp = plan.technicalResp;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(colorTextDark[0], colorTextDark[1], colorTextDark[2]);
  doc.text('Responsável Técnico:', marginX, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${resp.technicalManagerName} - ${resp.professionalTitle}`, marginX + 32, currentY);

  doc.setFont('helvetica', 'bold');
  doc.text('Conselho Profissional:', 130, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${resp.councilType}: ${resp.councilNumber} (${resp.councilState})`, 160, currentY);

  currentY += 4.5;

  doc.setFont('helvetica', 'bold');
  doc.text('Documento ART / TRT:', marginX, currentY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colorBlue[0], colorBlue[1], colorBlue[2]);
  doc.text(resp.artOrTrtNumber, marginX + 32, currentY);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colorTextDark[0], colorTextDark[1], colorTextDark[2]);
  doc.text('Validade da ART/TRT:', 130, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(resp.artValidUntil).toLocaleDateString('pt-BR'), 160, currentY);

  currentY += 8;

  // --- SECTION 3: EQUIPAMENTOS CLIMATIZADORES ATENDIDOS ---
  doc.setFillColor(241, 245, 249);
  doc.rect(marginX, currentY, contentWidth, 5.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(colorNavy[0], colorNavy[1], colorNavy[2]);
  doc.text('3. INVENTÁRIO DE SISTEMAS E CONDICIONADORES DE AR', marginX + 3, currentY + 4);

  currentY += 7.5;

  // Table header
  doc.setFillColor(226, 232, 240);
  doc.rect(marginX, currentY, contentWidth, 5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(colorNavy[0], colorNavy[1], colorNavy[2]);
  doc.text('TAG / ID', marginX + 2, currentY + 3.5);
  doc.text('AMBIENTE', marginX + 26, currentY + 3.5);
  doc.text('TIPO', marginX + 68, currentY + 3.5);
  doc.text('MARCA / MODELO', marginX + 104, currentY + 3.5);
  doc.text('CAPACIDADE', marginX + 148, currentY + 3.5);
  doc.text('STATUS', marginX + 168, currentY + 3.5);

  currentY += 5;

  equipments.forEach((eq, idx) => {
    const isEven = idx % 2 === 0;
    if (isEven) {
      doc.setFillColor(250, 250, 250);
      doc.rect(marginX, currentY, contentWidth, 5, 'F');
    }
    doc.setDrawColor(colorBorder[0], colorBorder[1], colorBorder[2]);
    doc.setLineWidth(0.1);
    doc.line(marginX, currentY + 5, marginX + contentWidth, currentY + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(colorTextDark[0], colorTextDark[1], colorTextDark[2]);
    doc.text(eq.serialNumber || eq.id, marginX + 2, currentY + 3.5);

    doc.setFont('helvetica', 'normal');
    doc.text(eq.locationRoom, marginX + 26, currentY + 3.5);
    doc.text(eq.type, marginX + 68, currentY + 3.5);
    doc.text(`${eq.brand} ${eq.model || ''}`, marginX + 104, currentY + 3.5);
    doc.text(`${eq.capacityBtu.toLocaleString('pt-BR')} BTU/h`, marginX + 148, currentY + 3.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(eq.status === 'active' ? colorGreen[0] : 220, eq.status === 'active' ? colorGreen[1] : 38, eq.status === 'active' ? colorGreen[2] : 38);
    doc.text(eq.status === 'active' ? 'OPERACIONAL' : 'MANUTENÇÃO', marginX + 168, currentY + 3.5);

    currentY += 5;
  });

  currentY += 4;

  // --- SECTION 4: ROTINAS DE MANUTENÇÃO PREVENTIVA PMOC ---
  checkPageBreak(50);

  doc.setFillColor(241, 245, 249);
  doc.rect(marginX, currentY, contentWidth, 5.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(colorNavy[0], colorNavy[1], colorNavy[2]);
  doc.text('4. PLANO DE ROTINAS TÉCNICAS E PERIODICIDADE (PORTARIA 3.523 / NBR 13971)', marginX + 3, currentY + 4);

  currentY += 7.5;

  // Routines table header
  doc.setFillColor(226, 232, 240);
  doc.rect(marginX, currentY, contentWidth, 5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(colorNavy[0], colorNavy[1], colorNavy[2]);
  doc.text('COMPONENTE', marginX + 2, currentY + 3.5);
  doc.text('PROCEDIMENTO TÉCNICO REGULAMENTAR', marginX + 30, currentY + 3.5);
  doc.text('PERIODICIDADE', marginX + 130, currentY + 3.5);
  doc.text('NORMA', marginX + 155, currentY + 3.5);

  currentY += 5;

  plan.routines.slice(0, 8).forEach((rt, idx) => {
    checkPageBreak(8);
    const isEven = idx % 2 === 0;
    if (isEven) {
      doc.setFillColor(250, 250, 250);
      doc.rect(marginX, currentY, contentWidth, 5, 'F');
    }
    doc.setDrawColor(colorBorder[0], colorBorder[1], colorBorder[2]);
    doc.setLineWidth(0.1);
    doc.line(marginX, currentY + 5, marginX + contentWidth, currentY + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(colorTextDark[0], colorTextDark[1], colorTextDark[2]);
    doc.text(rt.component, marginX + 2, currentY + 3.5);

    doc.setFont('helvetica', 'normal');
    const truncated = rt.item.length > 68 ? rt.item.substring(0, 68) + '...' : rt.item;
    doc.text(truncated, marginX + 30, currentY + 3.5);

    doc.setFont('helvetica', 'bold');
    doc.text(rt.frequency.toUpperCase(), marginX + 130, currentY + 3.5);

    doc.setFont('helvetica', 'normal');
    doc.text(rt.normativeReference.split('/')[0] || rt.normativeReference, marginX + 155, currentY + 3.5);

    currentY += 5;
  });

  currentY += 6;

  // --- SECTION 5: TERMO DE RESPONSABILIDADE TÉCNICA E ASSINATURAS ---
  checkPageBreak(55);

  doc.setFillColor(241, 245, 249);
  doc.rect(marginX, currentY, contentWidth, 5.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(colorNavy[0], colorNavy[1], colorNavy[2]);
  doc.text('5. DECLARAÇÃO DE RESPONSABILIDADE TÉCNICA MECÂNICA E ASSINATURAS', marginX + 3, currentY + 4);

  currentY += 8;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.8);
  doc.setTextColor(colorTextMuted[0], colorTextMuted[1], colorTextMuted[2]);
  const legalDeclaration = resp.legalTextDeclaration ||
    'Declaro para os devidos fins legais, em estrito cumprimento à Lei nº 13.589 de 04 de janeiro de 2018 e Resolução RE nº 09/2003 da ANVISA, que assumo a Responsabilidade Técnica pela elaboração, execução e acompanhamento do presente Plano de Manutenção, Operação e Controle (PMOC).';
  const splitDeclaration = doc.splitTextToSize(legalDeclaration, contentWidth - 4);
  doc.text(splitDeclaration, marginX + 2, currentY);

  currentY += splitDeclaration.length * 3.5 + 14;

  // Signature lines
  const colW = (contentWidth - 20) / 2;

  // Left: Responsible Technician
  doc.setDrawColor(colorNavy[0], colorNavy[1], colorNavy[2]);
  doc.setLineWidth(0.4);
  doc.line(marginX + 5, currentY, marginX + 5 + colW, currentY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(colorNavy[0], colorNavy[1], colorNavy[2]);
  doc.text(resp.technicalManagerName.toUpperCase(), marginX + 5 + colW / 2, currentY + 4, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(colorTextMuted[0], colorTextMuted[1], colorTextMuted[2]);
  doc.text(`${resp.professionalTitle} • ${resp.councilType} ${resp.councilNumber}`, marginX + 5 + colW / 2, currentY + 7.5, { align: 'center' });
  doc.text(`ART/TRT Vinculada: ${resp.artOrTrtNumber}`, marginX + 5 + colW / 2, currentY + 11, { align: 'center' });

  // Right: Building Owner / Client
  doc.line(marginX + 15 + colW, currentY, marginX + 15 + colW * 2, currentY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(colorNavy[0], colorNavy[1], colorNavy[2]);
  doc.text((customer?.name || plan.buildingName).toUpperCase(), marginX + 15 + colW + colW / 2, currentY + 4, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(colorTextMuted[0], colorTextMuted[1], colorTextMuted[2]);
  doc.text('Contratante / Responsável Legal pelo Edifício', marginX + 15 + colW + colW / 2, currentY + 7.5, { align: 'center' });
  doc.text(`CPF/CNPJ: ${plan.cnpjOrCpf}`, marginX + 15 + colW + colW / 2, currentY + 11, { align: 'center' });

  // Footer seal
  currentY += 16;
  doc.setFillColor(248, 250, 252);
  doc.rect(marginX, currentY, contentWidth, 7, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(colorTextMuted[0], colorTextMuted[1], colorTextMuted[2]);
  doc.text(
    `Documento técnico certificado emitido em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')} • Sistema ${compName} Gestão PMOC`,
    pageWidth / 2,
    currentY + 4.5,
    { align: 'center' }
  );

  return doc;
}
