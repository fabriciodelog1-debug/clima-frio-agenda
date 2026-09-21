import React, { useState } from 'react';
import { DiagnosticReport, Customer, Equipment, ServiceOrder, DiagnosticPart } from '../types';
import { 
  FileCheck, 
  Plus, 
  Search, 
  Printer, 
  Share2, 
  Download, 
  Wrench, 
  AlertTriangle, 
  Thermometer, 
  ShieldCheck, 
  CheckCircle2, 
  X, 
  Edit3, 
  Trash2, 
  Send, 
  Zap, 
  Clock, 
  ChevronRight, 
  Sparkles,
  Camera,
  Layers,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateDiagnosticPDF, getWhatsAppDiagnosticShareText } from '../utils/diagnosticPdfGenerator';

interface DiagnosticReportsViewProps {
  diagnosticReports: DiagnosticReport[];
  customers: Customer[];
  equipments: Equipment[];
  serviceOrders: ServiceOrder[];
  onSaveReport: (report: DiagnosticReport) => void;
  onDeleteReport: (id: string) => void;
  onNavigateToOS?: (osId: string) => void;
}

const COMMON_DIAGNOSTIC_PRESETS = [
  {
    title: 'Falta de Gás & Vazamento na Flange',
    symptom: 'Aparelho ventila normalmente na unidade interna, porém o ar sai em temperatura ambiente e não refrigera.',
    cause: 'Microvazamento de fluido refrigerante detectado na flange da linha de sucção da condensadora devido à vibração e fadiga do cobre.',
    repair: 'Refação da flange de cobre com recozimento, pressurização com Nitrogênio a 250 PSI por 30min, vácuo de 450 microns e recarga de gás refrigerante por balança.',
    gas: 'R410A',
    pressure: 120,
    supplyTemp: 9.0,
    returnTemp: 23.5,
    warranty: 90
  },
  {
    title: 'Capacitor de Partida Queimado/Esgotado',
    symptom: 'Unidade interna liga o display e ventila, mas a condensadora externa faz um ruído de zumbido e desarma após 1 minuto.',
    cause: 'Capacitor eletrolítico permanente do motor compressor esgotado com capacitância muito abaixo da nominal recomendada pelo fabricante.',
    repair: 'Substituição do capacitor defeituoso por modelo novo blindado com capacitância nominal exata, revisão dos bornes de força e teste de corrente elétrica.',
    gas: 'R410A',
    pressure: 125,
    supplyTemp: 8.5,
    returnTemp: 23.0,
    warranty: 90
  },
  {
    title: 'Dreno Entupido / Vazamento de Água',
    symptom: 'Gotejamento contínuo de água pela carenagem da unidade interna (evaporadora) escorrendo pela parede.',
    cause: 'Bandeja de condensado e mangueira de dreno obstruídas por colônia de bactérias/biofilme gelatinoso e poeira acumulada.',
    repair: 'Desobstrução mecânica e pressurizada da linha de dreno, higienização com bactericida específico para alumínio e aplicação de pastilha sanitizante no reservatório.',
    gas: 'R410A',
    pressure: 120,
    supplyTemp: 9.5,
    returnTemp: 24.0,
    warranty: 90
  },
  {
    title: 'Turbina e Serpentina Sujas (Bloqueio de Ar)',
    symptom: 'Baixo fluxo de ar no difusor, odor de mofo ao ligar e congelamento parcial da serpentina frontal.',
    cause: 'Obstrução severa nas aletas da serpentina e palhetas da turbina tangencial por acúmulo de poeira e oleosidade suspendendo a troca térmica.',
    repair: 'Higienização profunda in loco com bolsa coletora e máquina de limpeza de alta pressão com xampu bactericida biodegradável e sanitização ultravioleta.',
    gas: 'R410A',
    pressure: 118,
    supplyTemp: 8.0,
    returnTemp: 23.0,
    warranty: 90
  }
];

export default function DiagnosticReportsView({
  diagnosticReports,
  customers,
  equipments,
  serviceOrders,
  onSaveReport,
  onDeleteReport,
  onNavigateToOS
}: DiagnosticReportsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'conserto_realizado' | 'diagnostico' | 'manutencao_completa'>('all');
  const [selectedReportForPreview, setSelectedReportForPreview] = useState<DiagnosticReport | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [activePresetIndex, setActivePresetIndex] = useState<number | null>(null);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formCustomerId, setFormCustomerId] = useState('');
  const [formEquipmentId, setFormEquipmentId] = useState('');
  const [formOsId, setFormOsId] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formTechnicianName, setFormTechnicianName] = useState('Carlos Eduardo Lima - Técnico Mecânico (CFT)');
  const [formReportType, setFormReportType] = useState<'diagnostico' | 'conserto_realizado' | 'manutencao_completa'>('conserto_realizado');
  const [formSymptom, setFormSymptom] = useState('');
  const [formFailureCause, setFormFailureCause] = useState('');
  const [formRepairAction, setFormRepairAction] = useState('');
  const [formGasType, setFormGasType] = useState('R410A');
  const [formSuctionPsi, setFormSuctionPsi] = useState<string>('120');
  const [formDischargePsi, setFormDischargePsi] = useState<string>('340');
  const [formSupplyTemp, setFormSupplyTemp] = useState<string>('8.5');
  const [formReturnTemp, setFormReturnTemp] = useState<string>('23.0');
  const [formVoltage, setFormVoltage] = useState<string>('220');
  const [formNominalCurrent, setFormNominalCurrent] = useState<string>('5.5');
  const [formMeasuredCurrent, setFormMeasuredCurrent] = useState<string>('5.2');
  const [formVacuumMicrons, setFormVacuumMicrons] = useState<string>('450');
  const [formCapacitor, setFormCapacitor] = useState('');
  const [formLeakTest, setFormLeakTest] = useState(true);
  const [formDrainTest, setFormDrainTest] = useState(true);
  const [formElectricalTest, setFormElectricalTest] = useState(true);
  const [formThermalTest, setFormThermalTest] = useState(true);
  const [formBeforePhotoUrl, setFormBeforePhotoUrl] = useState('');
  const [formAfterPhotoUrl, setFormAfterPhotoUrl] = useState('');
  const [formParts, setFormParts] = useState<DiagnosticPart[]>([]);
  const [formLaborValue, setFormLaborValue] = useState<string>('200');
  const [formFinalVerdict, setFormFinalVerdict] = useState('');
  const [formWarrantyDays, setFormWarrantyDays] = useState<number>(90);
  const [formRecommendations, setFormRecommendations] = useState('Manter os filtros limpos mensalmente e não obstruir a condensadora externa.');

  // Part inline inputs
  const [newPartName, setNewPartName] = useState('');
  const [newPartCode, setNewPartCode] = useState('');
  const [newPartQty, setNewPartQty] = useState('1');
  const [newPartPrice, setNewPartPrice] = useState('');
  const [newPartWarranty, setNewPartWarranty] = useState('3');

  // Calculate live delta T
  const calculatedDeltaT = (Number(formReturnTemp) && Number(formSupplyTemp)) 
    ? (Number(formReturnTemp) - Number(formSupplyTemp)).toFixed(1) 
    : null;

  // Filtered reports
  const filteredReports = diagnosticReports.filter(report => {
    const cust = customers.find(c => c.id === report.customerId);
    const equip = equipments.find(e => e.id === report.equipmentId);
    const q = searchQuery.toLowerCase();

    const matchesSearch = 
      report.id.toLowerCase().includes(q) ||
      (cust && cust.name.toLowerCase().includes(q)) ||
      (equip && `${equip.type} ${equip.brand} ${equip.locationRoom}`.toLowerCase().includes(q)) ||
      report.symptomReported.toLowerCase().includes(q) ||
      report.failureCause.toLowerCase().includes(q);

    const matchesType = typeFilter === 'all' || report.reportType === typeFilter;

    return matchesSearch && matchesType;
  });

  const handleOpenNew = (preset?: typeof COMMON_DIAGNOSTIC_PRESETS[0]) => {
    setEditingId(null);
    setFormCustomerId(customers[0]?.id || '');
    const firstCustEquips = equipments.filter(e => e.customerId === customers[0]?.id);
    setFormEquipmentId(firstCustEquips[0]?.id || equipments[0]?.id || '');
    setFormOsId('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormTechnicianName('Carlos Eduardo Lima - Técnico Mecânico (CFT)');
    setFormReportType('conserto_realizado');
    
    if (preset) {
      setFormSymptom(preset.symptom);
      setFormFailureCause(preset.cause);
      setFormRepairAction(preset.repair);
      setFormGasType(preset.gas);
      setFormSuctionPsi(String(preset.pressure));
      setFormSupplyTemp(String(preset.supplyTemp));
      setFormReturnTemp(String(preset.returnTemp));
      setFormWarrantyDays(preset.warranty);
      setFormFinalVerdict(`Conserto concluído com sucesso. Aparelho em pleno funcionamento, pressão e corrente nominais restabelecidas.`);
    } else {
      setFormSymptom('');
      setFormFailureCause('');
      setFormRepairAction('');
      setFormGasType('R410A');
      setFormSuctionPsi('120');
      setFormDischargePsi('340');
      setFormSupplyTemp('8.5');
      setFormReturnTemp('23.0');
      setFormFinalVerdict('Equipamento testado sob carga plena. Rendimento térmico aprovado e parâmetros elétricos normais.');
      setFormWarrantyDays(90);
    }

    setFormVoltage('220');
    setFormNominalCurrent('5.5');
    setFormMeasuredCurrent('5.2');
    setFormVacuumMicrons('450');
    setFormCapacitor('Verificado dentro dos parâmetros');
    setFormLeakTest(true);
    setFormDrainTest(true);
    setFormElectricalTest(true);
    setFormThermalTest(true);
    setFormBeforePhotoUrl('');
    setFormAfterPhotoUrl('');
    setFormParts([]);
    setFormLaborValue('200');
    setFormRecommendations('Manter os filtros limpos mensalmente e não obstruir a condensadora externa.');

    setIsFormModalOpen(true);
  };

  const handleEditReport = (report: DiagnosticReport) => {
    setEditingId(report.id);
    setFormCustomerId(report.customerId);
    setFormEquipmentId(report.equipmentId);
    setFormOsId(report.osId || '');
    setFormDate(report.date);
    setFormTechnicianName(report.technicianName);
    setFormReportType(report.reportType);
    setFormSymptom(report.symptomReported);
    setFormFailureCause(report.failureCause);
    setFormRepairAction(report.repairActionTaken);
    setFormGasType(report.gasType);
    setFormSuctionPsi(report.suctionPressurePsi ? String(report.suctionPressurePsi) : '');
    setFormDischargePsi(report.dischargePressurePsi ? String(report.dischargePressurePsi) : '');
    setFormSupplyTemp(report.supplyTempC !== undefined ? String(report.supplyTempC) : '');
    setFormReturnTemp(report.returnTempC !== undefined ? String(report.returnTempC) : '');
    setFormVoltage(report.voltageV ? String(report.voltageV) : '220');
    setFormNominalCurrent(report.nominalCurrentA ? String(report.nominalCurrentA) : '');
    setFormMeasuredCurrent(report.measuredCurrentA ? String(report.measuredCurrentA) : '');
    setFormVacuumMicrons(report.vacuumMicrons ? String(report.vacuumMicrons) : '');
    setFormCapacitor(report.capacitorMicrofarad || '');
    setFormLeakTest(report.leakTestPassed);
    setFormDrainTest(report.drainageTestPassed);
    setFormElectricalTest(report.electricalSafetyPassed);
    setFormThermalTest(report.thermalEfficiencyPassed);
    setFormBeforePhotoUrl(report.beforePhotoUrl || '');
    setFormAfterPhotoUrl(report.afterPhotoUrl || '');
    setFormParts(report.partsReplaced || []);
    setFormLaborValue(String(report.laborValue));
    setFormFinalVerdict(report.finalVerdict);
    setFormWarrantyDays(report.warrantyDays || 90);
    setFormRecommendations(report.recommendations || '');

    setIsFormModalOpen(true);
  };

  const handleAddPart = () => {
    if (!newPartName.trim()) return;
    const price = parseFloat(newPartPrice) || 0;
    const qty = parseInt(newPartQty) || 1;
    const warranty = parseInt(newPartWarranty) || 3;

    setFormParts([
      ...formParts,
      {
        name: newPartName.trim(),
        code: newPartCode.trim() || undefined,
        quantity: qty,
        unitPrice: price,
        warrantyMonths: warranty
      }
    ]);

    setNewPartName('');
    setNewPartCode('');
    setNewPartQty('1');
    setNewPartPrice('');
  };

  const handleRemovePart = (index: number) => {
    setFormParts(formParts.filter((_, i) => i !== index));
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCustomerId || !formEquipmentId) {
      alert('Por favor, selecione o cliente e o equipamento.');
      return;
    }

    const partsSum = formParts.reduce((acc, p) => acc + (p.quantity * p.unitPrice), 0);
    const laborVal = parseFloat(formLaborValue) || 0;

    const reportToSave: DiagnosticReport = {
      id: editingId || `LDO-${new Date().getFullYear()}-${String(diagnosticReports.length + 1).padStart(3, '0')}`,
      date: formDate,
      customerId: formCustomerId,
      equipmentId: formEquipmentId,
      osId: formOsId || undefined,
      technicianName: formTechnicianName || 'Técnico Responsável',
      reportType: formReportType,
      symptomReported: formSymptom || 'Aparelho não resfria adequadamente.',
      failureCause: formFailureCause || 'Identificado defeito de componente durante inspeção técnica.',
      repairActionTaken: formRepairAction || 'Manutenção e regulagem executadas.',
      gasType: formGasType,
      suctionPressurePsi: formSuctionPsi ? parseFloat(formSuctionPsi) : undefined,
      dischargePressurePsi: formDischargePsi ? parseFloat(formDischargePsi) : undefined,
      supplyTempC: formSupplyTemp !== '' ? parseFloat(formSupplyTemp) : undefined,
      returnTempC: formReturnTemp !== '' ? parseFloat(formReturnTemp) : undefined,
      voltageV: formVoltage ? parseFloat(formVoltage) : 220,
      nominalCurrentA: formNominalCurrent ? parseFloat(formNominalCurrent) : undefined,
      measuredCurrentA: formMeasuredCurrent ? parseFloat(formMeasuredCurrent) : undefined,
      vacuumMicrons: formVacuumMicrons ? parseFloat(formVacuumMicrons) : undefined,
      capacitorMicrofarad: formCapacitor || undefined,
      leakTestPassed: formLeakTest,
      drainageTestPassed: formDrainTest,
      electricalSafetyPassed: formElectricalTest,
      thermalEfficiencyPassed: formThermalTest,
      beforePhotoUrl: formBeforePhotoUrl || undefined,
      afterPhotoUrl: formAfterPhotoUrl || undefined,
      partsReplaced: formParts,
      laborValue: laborVal,
      partsValue: partsSum,
      totalValue: laborVal + partsSum,
      finalVerdict: formFinalVerdict || 'Equipamento consertado e aprovado para operação.',
      warrantyDays: formWarrantyDays || 90,
      recommendations: formRecommendations || undefined
    };

    onSaveReport(reportToSave);
    setIsFormModalOpen(false);
  };

  const handleDownloadPDF = (report: DiagnosticReport) => {
    const cust = customers.find(c => c.id === report.customerId);
    const equip = equipments.find(e => e.id === report.equipmentId);
    const doc = generateDiagnosticPDF(report, cust, equip);
    doc.save(`Laudo_${report.id}_${cust?.name.replace(/[^a-zA-Z0-9]/g, '_') || 'Cliente'}.pdf`);
  };

  const handleSendWhatsApp = (report: DiagnosticReport) => {
    const cust = customers.find(c => c.id === report.customerId);
    const equip = equipments.find(e => e.id === report.equipmentId);
    const text = getWhatsAppDiagnosticShareText(report, cust, equip);

    let cleanPhone = cust?.phone.replace(/\D/g, '') || '';
    if (cleanPhone.length === 10 || cleanPhone.length === 11) {
      cleanPhone = `55${cleanPhone}`;
    }

    const whatsappUrl = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;

    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Explanation */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-500/30">
              <FileCheck size={14} />
              <span>Laudo Técnico Oficial do Ar-Condicionado</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Diagnósticos & Laudos de Conserto
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Crie relatórios detalhados para enviar ao cliente em <strong>PDF timbrado</strong> ou pelo <strong>WhatsApp</strong>. 
              Comprove o defeito com fotos de antes e depois, medições de pressão, salto térmico (Delta T) e termo formal de garantia do conserto.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => handleOpenNew()}
              className="px-5 py-3 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-cyan-900/40 hover:shadow-cyan-600/30 transition flex items-center gap-2"
            >
              <Plus size={18} />
              <span>Novo Laudo de Conserto</span>
            </button>
          </div>
        </div>

        {/* Quick Diagnostics Presets */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-amber-400" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Diagnósticos Rápidos Pré-configurados (1 Clique para preencher):
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {COMMON_DIAGNOSTIC_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleOpenNew(preset)}
                className="text-left p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-cyan-400/50 transition group"
              >
                <div className="text-xs font-bold text-cyan-300 group-hover:text-cyan-200 truncate">
                  {preset.title}
                </div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">
                  Pressão {preset.pressure} PSI • {preset.gas}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-700">
            <FileCheck size={22} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase">Laudos Emitidos</div>
            <div className="text-2xl font-black text-slate-900">{diagnosticReports.length}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase">Consertos Concluídos</div>
            <div className="text-2xl font-black text-slate-900">
              {diagnosticReports.filter(r => r.reportType === 'conserto_realizado').length}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-cyan-50 text-cyan-700">
            <Thermometer size={22} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase">Rendimento Médio</div>
            <div className="text-2xl font-black text-slate-900">14.1°C</div>
            <span className="text-[10px] text-emerald-600 font-bold">Delta T Ótimo</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-700">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase">Garantia Ativa</div>
            <div className="text-2xl font-black text-slate-900">100%</div>
            <span className="text-[10px] text-slate-400">Padronizada 90 dias</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, laudo, modelo ou sintoma..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
              typeFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({diagnosticReports.length})
          </button>
          <button
            onClick={() => setTypeFilter('conserto_realizado')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
              typeFilter === 'conserto_realizado' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Consertos Realizados
          </button>
          <button
            onClick={() => setTypeFilter('diagnostico')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
              typeFilter === 'diagnostico' ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Apenas Diagnósticos
          </button>
          <button
            onClick={() => setTypeFilter('manutencao_completa')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
              typeFilter === 'manutencao_completa' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Revisão Completa
          </button>
        </div>
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <div className="w-16 h-16 bg-cyan-50 text-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileCheck size={32} />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">Nenhum laudo encontrado</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
            Você ainda não possui laudos com estes filtros ou busca. Crie um novo laudo de conserto para enviar ao seu cliente.
          </p>
          <button
            onClick={() => handleOpenNew()}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg transition inline-flex items-center gap-2"
          >
            <Plus size={16} />
            <span>Criar Primeiro Laudo de Conserto</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => {
            const customer = customers.find(c => c.id === report.customerId);
            const equipment = equipments.find(e => e.id === report.equipmentId);
            const deltaT = (report.returnTempC !== undefined && report.supplyTempC !== undefined)
              ? (report.returnTempC - report.supplyTempC).toFixed(1)
              : null;

            return (
              <div 
                key={report.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition duration-200 overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div className="flex items-start gap-3.5">
                      <div className="p-3 bg-cyan-50 text-cyan-700 rounded-xl border border-cyan-100 shrink-0">
                        <Wrench size={22} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                            {report.id}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            {report.date.split('-').reverse().join('/')}
                          </span>
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            report.reportType === 'conserto_realizado'
                              ? 'bg-emerald-100 text-emerald-800'
                              : report.reportType === 'diagnostico'
                              ? 'bg-cyan-100 text-cyan-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {report.reportType === 'conserto_realizado' ? 'Conserto Realizado' : report.reportType === 'diagnostico' ? 'Diagnóstico & Orçamento' : 'Manutenção Completa'}
                          </span>
                          {report.osId && (
                            <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              OS: {report.osId}
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-extrabold text-slate-900">
                          {customer?.name || 'Cliente'} 
                          <span className="text-slate-400 font-normal text-sm ml-2">
                            • {equipment ? `${equipment.type} ${equipment.brand} (${equipment.capacityBtu.toLocaleString()} BTUs)` : 'Ar-Condicionado'}
                          </span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Local: <strong>{equipment?.locationRoom || 'Ambiente'}</strong> • Técnico: {report.technicianName}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons (WhatsApp, PDF, Print, Edit) */}
                    <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
                      <button
                        onClick={() => handleSendWhatsApp(report)}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-xs"
                        title="Enviar Laudo formatado pelo WhatsApp"
                      >
                        <Share2 size={15} />
                        <span>Enviar no WhatsApp</span>
                      </button>

                      <button
                        onClick={() => handleDownloadPDF(report)}
                        className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-xs"
                        title="Baixar Laudo Técnico em PDF"
                      >
                        <Download size={15} />
                        <span>Baixar PDF</span>
                      </button>

                      <button
                        onClick={() => setSelectedReportForPreview(report)}
                        className="p-2 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 rounded-lg transition"
                        title="Visualizar Detalhes do Laudo"
                      >
                        <Printer size={16} />
                      </button>

                      <button
                        onClick={() => handleEditReport(report)}
                        className="p-2 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 rounded-lg transition"
                        title="Editar Laudo"
                      >
                        <Edit3 size={16} />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Deseja realmente excluir o laudo ${report.id}?`)) {
                            onDeleteReport(report.id);
                          }
                        }}
                        className="p-2 border border-slate-200 hover:border-red-300 text-slate-400 hover:text-red-600 rounded-lg transition"
                        title="Excluir Laudo"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Body highlights */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-1">
                    {/* Defeito e Diagnóstico */}
                    <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                      <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <AlertTriangle size={13} />
                        <span>Causa Raiz Diagnosticada</span>
                      </div>
                      <p className="text-xs text-slate-700 line-clamp-3 leading-relaxed">
                        {report.failureCause}
                      </p>
                    </div>

                    {/* Conserto Executado */}
                    <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                      <div className="text-[11px] font-bold text-cyan-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Wrench size={13} />
                        <span>Conserto Realizado</span>
                      </div>
                      <p className="text-xs text-slate-700 line-clamp-3 leading-relaxed">
                        {report.repairActionTaken}
                      </p>
                    </div>

                    {/* Medições e Rendimento */}
                    <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100 flex flex-col justify-between">
                      <div>
                        <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center justify-between">
                          <span>Medições & Rendimento</span>
                          <span className="font-bold text-cyan-700">{report.gasType}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-slate-400 text-[10px] block">Pressão Sucção</span>
                            <span className="font-bold text-slate-800">{report.suctionPressurePsi ? `${report.suctionPressurePsi} PSI` : 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] block">Salto Térmico (ΔT)</span>
                            <span className="font-bold text-emerald-600">{deltaT ? `${deltaT}°C` : 'Aprovado'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Garantia: <strong className="text-slate-800">{report.warrantyDays || 90} dias</strong></span>
                        <span className="font-extrabold text-slate-900">R$ {report.totalValue.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FORM MODAL (NOVO OU EDITAR LAUDO) */}
      <AnimatePresence>
        {isFormModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-cyan-500/20 text-cyan-300 rounded-xl border border-cyan-400/30">
                    <FileCheck size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      {editingId ? `Editar Laudo Técnico (${editingId})` : 'Novo Laudo de Diagnóstico & Conserto'}
                    </h2>
                    <p className="text-xs text-slate-300">
                      Gere o relatório detalhado do ar-condicionado pronto para envio em PDF e WhatsApp ao cliente.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsFormModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Form Scrollable */}
              <form onSubmit={handleSaveSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-800">
                
                {/* 1. Vínculo do Cliente e Aparelho */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-cyan-700 text-white flex items-center justify-center text-[11px]">1</span>
                    <span>Identificação do Atendimento</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Cliente *</label>
                      <select
                        required
                        value={formCustomerId}
                        onChange={(e) => {
                          setFormCustomerId(e.target.value);
                          // Auto select first equipment of this customer
                          const custEquips = equipments.filter(eq => eq.customerId === e.target.value);
                          if (custEquips.length > 0) setFormEquipmentId(custEquips[0].id);
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="">Selecione o cliente...</option>
                        {customers.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Aparelho de Ar-Condicionado *</label>
                      <select
                        required
                        value={formEquipmentId}
                        onChange={(e) => setFormEquipmentId(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="">Selecione o aparelho...</option>
                        {equipments
                          .filter(eq => !formCustomerId || eq.customerId === formCustomerId)
                          .map(eq => (
                            <option key={eq.id} value={eq.id}>
                              {eq.type} {eq.brand} ({eq.capacityBtu.toLocaleString()} BTUs) - {eq.locationRoom}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Tipo de Laudo</label>
                      <select
                        value={formReportType}
                        onChange={(e: any) => setFormReportType(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="conserto_realizado">Conserto Realizado (Reparo Concluído)</option>
                        <option value="diagnostico">Apenas Diagnóstico & Orçamento</option>
                        <option value="manutencao_completa">Revisão e Manutenção Completa</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Data da Emissão</label>
                      <input
                        type="date"
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Técnico Mecânico Responsável</label>
                      <input
                        type="text"
                        value={formTechnicianName}
                        onChange={(e) => setFormTechnicianName(e.target.value)}
                        placeholder="Nome do técnico e registro"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Vincular a OS (Opcional)</label>
                      <select
                        value={formOsId}
                        onChange={(e) => setFormOsId(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="">Sem vínculo direto</option>
                        {serviceOrders.map(os => (
                          <option key={os.id} value={os.id}>{os.id} - {os.issueReported.slice(0, 30)}...</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. Sintoma e Causa Raiz Diagnosticada */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Sintoma / Queixa Relatada pelo Cliente *
                    </label>
                    <input
                      type="text"
                      required
                      value={formSymptom}
                      onChange={(e) => setFormSymptom(e.target.value)}
                      placeholder="Ex: O ar parou de gelar no calor e faz barulho de zumbido na condensadora..."
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Diagnóstico Técnico & Causa Raiz da Falha *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formFailureCause}
                      onChange={(e) => setFormFailureCause(e.target.value)}
                      placeholder="Descreva exatamente onde estava o problema (ex: Microvazamento na flange de 3/8 da condensadora, capacitor estufado, biofilme no dreno...)"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                {/* 3. Medições Técnicas & Eficiência Térmica (Delta T) */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-cyan-700 text-white flex items-center justify-center text-[11px]">2</span>
                      <span>Medições Técnicas e Rendimento Térmico</span>
                    </h3>

                    {calculatedDeltaT && (
                      <div className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-extrabold flex items-center gap-1.5">
                        <Thermometer size={14} />
                        <span>Salto Térmico (ΔT): {calculatedDeltaT}°C</span>
                        <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded">
                          {Number(calculatedDeltaT) >= 10 ? 'Excelente' : Number(calculatedDeltaT) >= 7 ? 'Normal' : 'Baixo Rendimento'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Fluido (Gás)</label>
                      <select
                        value={formGasType}
                        onChange={(e) => setFormGasType(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="R410A">R410A (Inverter comum)</option>
                        <option value="R32">R32 (Ecológico novo)</option>
                        <option value="R22">R22 (Convencional antigo)</option>
                        <option value="R134a">R134a</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Pressão Sucção (PSI)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formSuctionPsi}
                        onChange={(e) => setFormSuctionPsi(e.target.value)}
                        placeholder="Ex: 120"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Temp. Insuflamento (°C)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formSupplyTemp}
                        onChange={(e) => setFormSupplyTemp(e.target.value)}
                        placeholder="Ex: 8.5"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Temp. Retorno (°C)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formReturnTemp}
                        onChange={(e) => setFormReturnTemp(e.target.value)}
                        placeholder="Ex: 23.0"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tensão Elétrica (V)</label>
                      <input
                        type="number"
                        value={formVoltage}
                        onChange={(e) => setFormVoltage(e.target.value)}
                        placeholder="220"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Corrente Medida (A)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formMeasuredCurrent}
                        onChange={(e) => setFormMeasuredCurrent(e.target.value)}
                        placeholder="Ex: 5.2"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nível de Vácuo (µm)</label>
                      <input
                        type="number"
                        value={formVacuumMicrons}
                        onChange={(e) => setFormVacuumMicrons(e.target.value)}
                        placeholder="Ex: 450"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Capacitor de Partida</label>
                      <input
                        type="text"
                        value={formCapacitor}
                        onChange={(e) => setFormCapacitor(e.target.value)}
                        placeholder="Ex: 35µF OK ou Substituído"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>

                  {/* Checklist dos Testes Finais */}
                  <div className="mt-4 pt-3 border-t border-slate-200">
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
                      Protocolo de Testes de Funcionamento Aprovados:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                      <label className="flex items-center gap-2 text-xs text-slate-700 bg-white p-2 rounded-lg border border-slate-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formLeakTest}
                          onChange={(e) => setFormLeakTest(e.target.checked)}
                          className="rounded text-cyan-600 focus:ring-cyan-500 w-4 h-4"
                        />
                        <span>Estanqueidade (Sem vazamento)</span>
                      </label>

                      <label className="flex items-center gap-2 text-xs text-slate-700 bg-white p-2 rounded-lg border border-slate-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formDrainTest}
                          onChange={(e) => setFormDrainTest(e.target.checked)}
                          className="rounded text-cyan-600 focus:ring-cyan-500 w-4 h-4"
                        />
                        <span>Dreno Desobstruído</span>
                      </label>

                      <label className="flex items-center gap-2 text-xs text-slate-700 bg-white p-2 rounded-lg border border-slate-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formElectricalTest}
                          onChange={(e) => setFormElectricalTest(e.target.checked)}
                          className="rounded text-cyan-600 focus:ring-cyan-500 w-4 h-4"
                        />
                        <span>Segurança Elétrica / Bornes</span>
                      </label>

                      <label className="flex items-center gap-2 text-xs text-slate-700 bg-white p-2 rounded-lg border border-slate-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formThermalTest}
                          onChange={(e) => setFormThermalTest(e.target.checked)}
                          className="rounded text-cyan-600 focus:ring-cyan-500 w-4 h-4"
                        />
                        <span>Rendimento Térmico OK</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* 4. Conserto Realizado & Peças Trocadas */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Serviço Executado & Procedimentos de Conserto Realizados *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formRepairAction}
                      onChange={(e) => setFormRepairAction(e.target.value)}
                      placeholder="Explique o que você fez para consertar (ex: Troca de peças, corte e flangeamento, vácuo com vacuômetro digital, recarga de gás por balança...)"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  {/* Peças Trocadas */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Peças / Componentes Trocados
                      </h4>
                      <span className="text-xs text-slate-500">
                        {formParts.length} {formParts.length === 1 ? 'peça adicionada' : 'peças adicionadas'}
                      </span>
                    </div>

                    {/* Form inline para adicionar peça */}
                    <div className="grid grid-cols-1 sm:grid-cols-6 gap-2 bg-white p-3 rounded-xl border border-slate-200 mb-3">
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          placeholder="Nome da peça (ex: Capacitor 35uF)"
                          value={newPartName}
                          onChange={(e) => setNewPartName(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Código (opcional)"
                          value={newPartCode}
                          onChange={(e) => setNewPartCode(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          placeholder="Qtd"
                          value={newPartQty}
                          onChange={(e) => setNewPartQty(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Valor R$"
                          value={newPartPrice}
                          onChange={(e) => setNewPartPrice(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                        />
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={handleAddPart}
                          className="w-full py-2 bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-bold rounded-lg transition"
                        >
                          + Adicionar
                        </button>
                      </div>
                    </div>

                    {/* Lista de peças */}
                    {formParts.length > 0 && (
                      <div className="space-y-1.5">
                        {formParts.map((p, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800">{p.quantity}x</span>
                              <span className="text-slate-700">{p.name} {p.code ? `(${p.code})` : ''}</span>
                              <span className="text-[10px] text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded">Garantia: {p.warrantyMonths} meses</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-slate-900">R$ {(p.quantity * p.unitPrice).toFixed(2)}</span>
                              <button
                                type="button"
                                onClick={() => handleRemovePart(idx)}
                                className="text-slate-400 hover:text-red-500"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 5. Fotos Antes e Depois */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Camera size={14} />
                    <span>Registro Fotográfico do Antes e Depois (Opcional)</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">URL da Foto do Defeito (Antes)</label>
                      <input
                        type="text"
                        placeholder="https://exemplo.com/foto-defeito.jpg"
                        value={formBeforePhotoUrl}
                        onChange={(e) => setFormBeforePhotoUrl(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                      />
                      {formBeforePhotoUrl && (
                        <img src={formBeforePhotoUrl} alt="Antes" className="mt-2 h-24 w-full object-cover rounded-lg border border-slate-200" />
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">URL da Foto do Aparelho Reparado (Depois)</label>
                      <input
                        type="text"
                        placeholder="https://exemplo.com/foto-conserto.jpg"
                        value={formAfterPhotoUrl}
                        onChange={(e) => setFormAfterPhotoUrl(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                      />
                      {formAfterPhotoUrl && (
                        <img src={formAfterPhotoUrl} alt="Depois" className="mt-2 h-24 w-full object-cover rounded-lg border border-slate-200" />
                      )}
                    </div>
                  </div>
                </div>

                {/* 6. Parecer, Garantia e Valores */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Parecer Conclusivo & Observações do Técnico
                    </label>
                    <input
                      type="text"
                      value={formFinalVerdict}
                      onChange={(e) => setFormFinalVerdict(e.target.value)}
                      placeholder="Ex: Aparelho testado por 40 minutos sob carga máxima. Rendimento térmico aprovado..."
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Prazo de Garantia (Dias)
                    </label>
                    <select
                      value={formWarrantyDays}
                      onChange={(e) => setFormWarrantyDays(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value={30}>30 Dias</option>
                      <option value={90}>90 Dias (Padrão Legal)</option>
                      <option value={180}>180 Dias (6 Meses)</option>
                      <option value={365}>365 Dias (1 Ano)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-cyan-50/50 p-4 rounded-xl border border-cyan-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Valor Mão de Obra (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formLaborValue}
                      onChange={(e) => setFormLaborValue(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Subtotal de Peças (R$)</label>
                    <div className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 font-bold">
                      R$ {formParts.reduce((acc, p) => acc + (p.quantity * p.unitPrice), 0).toFixed(2)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">VALOR TOTAL DO LAUDO (R$)</label>
                    <div className="px-3 py-2 bg-cyan-700 text-white rounded-lg text-sm font-black shadow-xs">
                      R$ {((parseFloat(formLaborValue) || 0) + formParts.reduce((acc, p) => acc + (p.quantity * p.unitPrice), 0)).toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Submit buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    className="px-4 py-2.5 border border-slate-300 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-100 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-bold rounded-lg shadow-md transition flex items-center gap-2"
                  >
                    <FileCheck size={16} />
                    <span>Salvar e Gerar Laudo</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PREVIEW MODAL (DOCUMENTO OFICIAL COMPLETO COM IMPRESSÃO E WHATSAPP) */}
      <AnimatePresence>
        {selectedReportForPreview && (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[94vh] flex flex-col overflow-hidden"
            >
              {/* Modal Top Actions */}
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <FileCheck size={20} className="text-cyan-400" />
                  <span className="font-bold text-sm">Visualização do Laudo Técnico • {selectedReportForPreview.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSendWhatsApp(selectedReportForPreview)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-xs"
                  >
                    <Share2 size={14} />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={() => handleDownloadPDF(selectedReportForPreview)}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-xs"
                  >
                    <Download size={14} />
                    <span>Baixar PDF</span>
                  </button>
                  <button
                    onClick={() => setSelectedReportForPreview(null)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Document Sheet Preview */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-100">
                <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md border border-slate-200 text-slate-800 space-y-6">
                  
                  {/* Header */}
                  <div className="flex justify-between items-start border-b border-slate-200 pb-5">
                    <div>
                      <h1 className="text-xl font-black text-slate-900 tracking-tight">
                        CLIMA FRIO CLIMATIZAÇÃO
                      </h1>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Laudo Técnico Pericial de Diagnóstico & Conserto de Ar-Condicionado
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block font-mono text-xs font-bold px-2.5 py-1 bg-cyan-100 text-cyan-900 rounded">
                        {selectedReportForPreview.id}
                      </span>
                      <p className="text-xs text-slate-400 mt-1">
                        Emissão: {selectedReportForPreview.date.split('-').reverse().join('/')}
                      </p>
                    </div>
                  </div>

                  {/* Customer & Equipment */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Cliente & Local</span>
                      <p className="font-bold text-slate-900 text-sm">
                        {customers.find(c => c.id === selectedReportForPreview.customerId)?.name || 'Cliente'}
                      </p>
                      <p className="text-slate-600 mt-0.5">
                        {customers.find(c => c.id === selectedReportForPreview.customerId)?.address.street}, {customers.find(c => c.id === selectedReportForPreview.customerId)?.address.number}
                      </p>
                      <p className="text-slate-600">
                        Tel: {customers.find(c => c.id === selectedReportForPreview.customerId)?.phone}
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Equipamento Atendido</span>
                      {(() => {
                        const eq = equipments.find(e => e.id === selectedReportForPreview.equipmentId);
                        return (
                          <>
                            <p className="font-bold text-slate-900 text-sm">
                              {eq ? `${eq.type} ${eq.brand} (${eq.capacityBtu.toLocaleString()} BTUs)` : 'Ar-Condicionado'}
                            </p>
                            <p className="text-slate-600 mt-0.5">
                              Modelo: {eq?.model || 'Padrão'} • Série: {eq?.serialNumber || 'N/A'}
                            </p>
                            <p className="text-slate-600">
                              Ambiente: <strong>{eq?.locationRoom || 'Ambiente'}</strong> • Gás: <strong>{selectedReportForPreview.gasType}</strong>
                            </p>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Sintoma e Causa */}
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-1">
                        1. Sintoma Informado pelo Cliente:
                      </span>
                      <p className="text-xs text-slate-700 bg-amber-50/50 p-3 rounded-lg border border-amber-200/60 leading-relaxed">
                        {selectedReportForPreview.symptomReported}
                      </p>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-cyan-900 uppercase tracking-wider block mb-1">
                        2. Diagnóstico Técnico & Causa Raiz:
                      </span>
                      <p className="text-xs text-slate-700 bg-cyan-50/50 p-3 rounded-lg border border-cyan-200/60 leading-relaxed">
                        {selectedReportForPreview.failureCause}
                      </p>
                    </div>
                  </div>

                  {/* Medições e Salto Térmico */}
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/80">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-3">
                      3. Medições Técnicas & Parâmetros de Eficiência
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                        <span className="text-slate-400 text-[10px] block">Pressão de Sucção</span>
                        <span className="font-bold text-slate-900">{selectedReportForPreview.suctionPressurePsi ? `${selectedReportForPreview.suctionPressurePsi} PSI` : 'N/A'}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                        <span className="text-slate-400 text-[10px] block">Insuflamento / Retorno</span>
                        <span className="font-bold text-slate-900">
                          {selectedReportForPreview.supplyTempC}°C / {selectedReportForPreview.returnTempC}°C
                        </span>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-emerald-200">
                        <span className="text-slate-400 text-[10px] block">Salto Térmico (ΔT)</span>
                        <span className="font-black text-emerald-700">
                          {(selectedReportForPreview.returnTempC !== undefined && selectedReportForPreview.supplyTempC !== undefined)
                            ? `${(selectedReportForPreview.returnTempC - selectedReportForPreview.supplyTempC).toFixed(1)}°C (Ótimo)`
                            : 'Aprovado'}
                        </span>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                        <span className="text-slate-400 text-[10px] block">Corrente Operacional</span>
                        <span className="font-bold text-slate-900">{selectedReportForPreview.measuredCurrentA ? `${selectedReportForPreview.measuredCurrentA} A` : 'Normal'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Conserto Executado */}
                  <div>
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                      4. Conserto Executado & Procedimentos:
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                      {selectedReportForPreview.repairActionTaken}
                    </p>
                  </div>

                  {/* Peças */}
                  {selectedReportForPreview.partsReplaced && selectedReportForPreview.partsReplaced.length > 0 && (
                    <div>
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                        5. Peças Substituídas com Garantia:
                      </span>
                      <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
                        <thead className="bg-slate-100 text-slate-700 font-bold">
                          <tr>
                            <th className="p-2">Peça</th>
                            <th className="p-2">Qtd</th>
                            <th className="p-2">Garantia</th>
                            <th className="p-2 text-right">Valor</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {selectedReportForPreview.partsReplaced.map((p, pIdx) => (
                            <tr key={pIdx}>
                              <td className="p-2 font-medium">{p.name} {p.code ? `(${p.code})` : ''}</td>
                              <td className="p-2">{p.quantity}</td>
                              <td className="p-2 text-cyan-700 font-bold">{p.warrantyMonths || 3} meses</td>
                              <td className="p-2 text-right font-bold">R$ {(p.quantity * p.unitPrice).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Garantia & Valores Box */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-cyan-50/70 border border-cyan-200 rounded-xl gap-3">
                    <div className="flex items-center gap-2 text-cyan-900">
                      <ShieldCheck size={24} className="text-cyan-700" />
                      <div>
                        <div className="font-extrabold text-sm">GARANTIA DO SERVIÇO: {selectedReportForPreview.warrantyDays || 90} DIAS</div>
                        <div className="text-[11px] text-cyan-800">Cobre defeitos de mão de obra e peças originais aplicadas.</div>
                      </div>
                    </div>
                    <div className="text-right font-black text-slate-900 text-lg">
                      R$ {selectedReportForPreview.totalValue.toFixed(2)}
                    </div>
                  </div>

                  {/* Assinatura */}
                  <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
                    <div>
                      <div className="w-48 border-b border-slate-400 mb-1"></div>
                      <p className="font-bold text-slate-800">{selectedReportForPreview.technicianName}</p>
                      <p className="text-[10px]">Técnico em Refrigeração e Climatização</p>
                    </div>

                    <div className="text-right">
                      <div className="w-48 border-b border-slate-400 mb-1 ml-auto"></div>
                      <p className="font-bold text-slate-800">
                        {customers.find(c => c.id === selectedReportForPreview.customerId)?.name || 'Cliente'}
                      </p>
                      <p className="text-[10px]">De acordo com o diagnóstico e conserto</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
