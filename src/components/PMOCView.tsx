import React, { useState, useEffect, useRef } from 'react';
import { PMOCPlan, Customer, Equipment, PMOCRoutine, PMOCExecutionRecord, TechnicalResponsibility } from '../types';
import { generatePMOCPDF } from '../utils/pmocPdfGenerator';
import {
  ShieldCheck,
  Building2,
  Calendar,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  Download,
  Share2,
  Plus,
  PenTool,
  Award,
  ChevronRight,
  Filter,
  Flame,
  UserCheck,
  X,
  FileText,
  Search,
  Check,
  Info
} from 'lucide-react';

interface PMOCViewProps {
  customers: Customer[];
  equipments: Equipment[];
  pmocPlans: PMOCPlan[];
  onSavePMOCPlan: (plan: PMOCPlan) => void;
  onDeletePMOCPlan?: (planId: string) => void;
}

export default function PMOCView({
  customers,
  equipments,
  pmocPlans,
  onSavePMOCPlan
}: PMOCViewProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(pmocPlans[0]?.id || '');
  const [activeSubTab, setActiveSubTab] = useState<'plans' | 'routines' | 'art' | 'dossier'>('plans');
  const [searchTerm, setSearchTerm] = useState('');
  const [routineFilter, setRoutineFilter] = useState<string>('all');
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecordExecutionModalOpen, setIsRecordExecutionModalOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);

  // Form State for creating/editing PMOC Plan
  const [formCustomerId, setFormCustomerId] = useState(customers[0]?.id || '');
  const [formBuildingName, setFormBuildingName] = useState('');
  const [formArea, setFormArea] = useState<number>(250);
  const [formFixedOccupants, setFormFixedOccupants] = useState<number>(15);
  const [formTransientOccupants, setFormTransientOccupants] = useState<number>(80);
  const [formActivityType, setFormActivityType] = useState('Comercial / Atendimento ao Público');
  const [formSelectedEquipIds, setFormSelectedEquipIds] = useState<string[]>([]);
  const [formTechName, setFormTechName] = useState('Eng. Rafael Mendes de Oliveira');
  const [formTechTitle, setFormTechTitle] = useState<TechnicalResponsibility['professionalTitle']>('Engenheiro Mecânico');
  const [formCouncilType, setFormCouncilType] = useState<'CREA' | 'CFT / CRT'>('CREA');
  const [formCouncilNumber, setFormCouncilNumber] = useState('CREA-SP 5062891440/D');
  const [formCouncilState, setFormCouncilState] = useState('SP');
  const [formArtNumber, setFormArtNumber] = useState('ART Nº 2802723024881-SP');
  const [formArtValidUntil, setFormArtValidUntil] = useState('2027-01-09');

  // Execution modal state
  const [execMonthYear, setExecMonthYear] = useState(new Date().toISOString().substring(0, 7));
  const [execTechName, setExecTechName] = useState('Carlos Eduardo Lima (Téc. Mecânico)');
  const [execObs, setExecObs] = useState('Manutenção preventiva mensal executada conforme diretrizes do PMOC.');

  // Signature canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Company Profile
  const companyStored = typeof window !== 'undefined' ? localStorage.getItem('climafrio_company_profile') : null;
  const companyProfile = companyStored ? JSON.parse(companyStored) : null;

  const currentPlan = pmocPlans.find(p => p.id === selectedPlanId) || pmocPlans[0];
  const currentCustomer = customers.find(c => c.id === currentPlan?.customerId);
  const planEquipments = equipments.filter(e => currentPlan?.equipmentIds?.includes(e.id));

  // If selected plan changed, sync customer selection for modal
  useEffect(() => {
    if (customers.length > 0 && !formCustomerId) {
      setFormCustomerId(customers[0].id);
    }
  }, [customers, formCustomerId]);

  // Overall statistics
  const totalCoveredTR = pmocPlans.reduce((acc, p) => acc + p.totalThermalCapacityTR, 0);
  const totalCoveredBTU = pmocPlans.reduce((acc, p) => acc + p.totalThermalCapacityBtu, 0);
  const avgCompliance = pmocPlans.length > 0
    ? Math.round(pmocPlans.reduce((acc, p) => acc + p.compliancePercentage, 0) / pmocPlans.length)
    : 100;

  // Filter routines
  const filteredRoutines = (currentPlan?.routines || []).filter(r => {
    if (routineFilter === 'all') return true;
    return r.frequency === routineFilter || r.component === routineFilter;
  });

  // Handle Routine Status Toggle
  const handleToggleRoutineStatus = (routineId: string) => {
    if (!currentPlan) return;
    const updatedRoutines = currentPlan.routines.map(r => {
      if (r.id === routineId) {
        const nextStatus: PMOCRoutine['status'] = r.status === 'conforme' ? 'atencao' : r.status === 'atencao' ? 'pendente' : 'conforme';
        return {
          ...r,
          status: nextStatus,
          lastCompletedDate: nextStatus === 'conforme' ? new Date().toISOString().substring(0, 10) : r.lastCompletedDate
        };
      }
      return r;
    });

    const conformeCount = updatedRoutines.filter(r => r.status === 'conforme').length;
    const newCompliance = Math.round((conformeCount / updatedRoutines.length) * 100);

    const updatedPlan: PMOCPlan = {
      ...currentPlan,
      routines: updatedRoutines,
      compliancePercentage: newCompliance
    };

    onSavePMOCPlan(updatedPlan);
  };

  // Record monthly execution
  const handleSaveMonthlyExecution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPlan) return;

    const newExecution: PMOCExecutionRecord = {
      id: `ex-${Date.now()}`,
      monthYear: execMonthYear,
      executedDate: new Date().toISOString().substring(0, 10),
      technicianName: execTechName,
      status: 'concluido',
      routinesCheckedCount: currentPlan.routines.length,
      totalRoutinesCount: currentPlan.routines.length,
      observations: execObs
    };

    const updatedHistory = [newExecution, ...(currentPlan.executionHistory || [])];
    const updatedPlan: PMOCPlan = {
      ...currentPlan,
      executionHistory: updatedHistory,
      compliancePercentage: Math.min(100, currentPlan.compliancePercentage + 2)
    };

    onSavePMOCPlan(updatedPlan);
    setIsRecordExecutionModalOpen(false);
  };

  // Canvas drawing functions for signature
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSaveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !currentPlan) return;

    const signatureDataUrl = canvas.toDataURL('image/png');
    const updatedPlan: PMOCPlan = {
      ...currentPlan,
      technicalResp: {
        ...currentPlan.technicalResp,
        signatureUrl: signatureDataUrl,
        signedAt: new Date().toISOString()
      }
    };

    onSavePMOCPlan(updatedPlan);
    setIsSignatureModalOpen(false);
  };

  // Save new PMOC plan
  const handleSavePlanForm = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === formCustomerId);
    if (!cust) return;

    const selectedEquips = equipments.filter(e => formSelectedEquipIds.includes(e.id));
    const totalBtu = selectedEquips.reduce((acc, eq) => acc + eq.capacityBtu, 0);
    const totalTR = totalBtu / 12000;

    const addressText = cust.address
      ? `${cust.address.street}, ${cust.address.number}${cust.address.complement ? ` - ${cust.address.complement}` : ''} - ${cust.address.neighborhood}, ${cust.address.city}/${cust.address.state}`
      : 'Endereço Comercial';

    const newPlan: PMOCPlan = {
      id: `PMOC-2026-${String(pmocPlans.length + 1).padStart(3, '0')}`,
      customerId: cust.id,
      buildingName: formBuildingName.trim() || `Edifício ${cust.name}`,
      cnpjOrCpf: cust.cpfCnpj,
      addressText,
      contactPerson: cust.name,
      contactPhone: cust.phone,
      airConditionedAreaM2: Number(formArea) || 150,
      totalThermalCapacityBtu: totalBtu || 36000,
      totalThermalCapacityTR: Number(totalTR.toFixed(1)) || 3.0,
      fixedOccupants: Number(formFixedOccupants) || 10,
      transientOccupants: Number(formTransientOccupants) || 50,
      activityType: formActivityType,
      status: 'vigente',
      startDate: new Date().toISOString().substring(0, 10),
      endDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().substring(0, 10),
      equipmentIds: formSelectedEquipIds.length > 0 ? formSelectedEquipIds : equipments.filter(e => e.customerId === cust.id).map(e => e.id),
      compliancePercentage: 100,
      notes: 'Plano PMOC registrado sob responsabilidade técnica com ART/TRT mecânica vigente.',
      technicalResp: {
        technicalManagerName: formTechName,
        professionalTitle: formTechTitle,
        councilType: formCouncilType,
        councilNumber: formCouncilNumber,
        councilState: formCouncilState,
        cpf: '241.982.538-44',
        artOrTrtNumber: formArtNumber,
        artIssueDate: new Date().toISOString().substring(0, 10),
        artValidUntil: formArtValidUntil,
        signedAt: new Date().toISOString(),
        legalTextDeclaration: 'Declaro para os devidos fins legais, em estrita observância à Lei Federal nº 13.589/2018 e Resolução RE nº 09/2003 da ANVISA, que assumo a Responsabilidade Técnica Mecânica pela elaboração, supervisão e acompanhamento do PMOC deste empreendimento.'
      },
      routines: [
        {
          id: `r-${Date.now()}-1`,
          item: 'Higienização e lavagem de filtros de ar primários (G1/G4)',
          component: 'Filtro',
          frequency: 'Mensal',
          normativeReference: 'Portaria MS 3.523 / NBR 13971',
          lastCompletedDate: new Date().toISOString().substring(0, 10),
          status: 'conforme',
          notes: 'Filtros limpos com detergente neutro bactericida.'
        },
        {
          id: `r-${Date.now()}-2`,
          item: 'Limpeza e desinfecção química de bandejas de condensado com pastilha bactericida',
          component: 'Bandeja/Dreno',
          frequency: 'Mensal',
          normativeReference: 'Portaria MS 3.523 / NBR 13971',
          lastCompletedDate: new Date().toISOString().substring(0, 10),
          status: 'conforme'
        },
        {
          id: `r-${Date.now()}-3`,
          item: 'Desobstrução e teste de fluxo da linha de dreno',
          component: 'Bandeja/Dreno',
          frequency: 'Mensal',
          normativeReference: 'NBR 13971',
          lastCompletedDate: new Date().toISOString().substring(0, 10),
          status: 'conforme'
        },
        {
          id: `r-${Date.now()}-4`,
          item: 'Lavagem com desincrustante biodegradável das aletas do evaporador',
          component: 'Serpentina',
          frequency: 'Trimestral',
          normativeReference: 'Portaria MS 3.523 / NBR 14679',
          lastCompletedDate: new Date().toISOString().substring(0, 10),
          status: 'conforme'
        },
        {
          id: `r-${Date.now()}-5`,
          item: 'Limpeza por hidro-jateamento de baixa pressão na condensadora externa',
          component: 'Serpentina',
          frequency: 'Trimestral',
          normativeReference: 'NBR 13971',
          lastCompletedDate: new Date().toISOString().substring(0, 10),
          status: 'conforme'
        },
        {
          id: `r-${Date.now()}-6`,
          item: 'Medição da corrente nominal (A), tensão (V) e reaperto de conexões elétricas',
          component: 'Elétrica',
          frequency: 'Semestral',
          normativeReference: 'NBR 5410 / NBR 13971',
          lastCompletedDate: new Date().toISOString().substring(0, 10),
          status: 'conforme'
        },
        {
          id: `r-${Date.now()}-7`,
          item: 'Aferição de pressões (sucção/descarga) e teste de estanqueidade de fluido',
          component: 'Refrigeração',
          frequency: 'Semestral',
          normativeReference: 'Portaria 3.523 / NBR 13971',
          lastCompletedDate: new Date().toISOString().substring(0, 10),
          status: 'conforme'
        },
        {
          id: `r-${Date.now()}-8`,
          item: 'Análise laboratorial de qualidade do ar de interiores (Fungos, CO2, Poeira e Umidade)',
          component: 'Qualidade do Ar',
          frequency: 'Anual',
          normativeReference: 'Resolução ANVISA RE nº 09/2003',
          lastCompletedDate: new Date().toISOString().substring(0, 10),
          status: 'conforme'
        }
      ],
      executionHistory: [
        {
          id: `ex-init-${Date.now()}`,
          monthYear: new Date().toISOString().substring(0, 7),
          executedDate: new Date().toISOString().substring(0, 10),
          technicianName: formTechName,
          status: 'concluido',
          routinesCheckedCount: 8,
          totalRoutinesCount: 8,
          observations: 'Implantação inicial do plano PMOC e verificação técnica.'
        }
      ]
    };

    onSavePMOCPlan(newPlan);
    setSelectedPlanId(newPlan.id);
    setIsModalOpen(false);
  };

  // Export PDF function
  const handleExportPDF = () => {
    if (!currentPlan) return;
    const doc = generatePMOCPDF(currentPlan, currentCustomer, planEquipments);
    doc.save(`${currentPlan.id}_Dossie_PMOC_ART.pdf`);
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Share via WhatsApp
  const handleShareWhatsApp = () => {
    if (!currentPlan) return;
    const message = `*RELATÓRIO TÉCNICO PMOC & RESPONSABILIDADE TÉCNICA (ART/TRT)* ❄️📋

*Empreendimento:* ${currentPlan.buildingName}
*Documento:* ${currentPlan.id}
*Responsável Técnico:* ${currentPlan.technicalResp.technicalManagerName}
*Registro:* ${currentPlan.technicalResp.councilType} ${currentPlan.technicalResp.councilNumber}
*ART / TRT Mecânica:* ${currentPlan.technicalResp.artOrTrtNumber}
*Validade:* até ${new Date(currentPlan.technicalResp.artValidUntil).toLocaleDateString('pt-BR')}

📊 *Status de Conformidade:* ${currentPlan.compliancePercentage}% Conforme
❄️ *Carga Térmica:* ${currentPlan.totalThermalCapacityTR.toFixed(1)} TR (${currentPlan.totalThermalCapacityBtu.toLocaleString('pt-BR')} BTU/h)
📌 *Equipamentos Cobertos:* ${planEquipments.length} unidades climatizadoras
🏢 *Normas Atendidas:* Lei Federal nº 13.589/2018 e Resolução RE 09 ANVISA

O dossiê completo de manutenções e o laudo oficial com ART encontram-se disponíveis no sistema.`;

    const encoded = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="space-y-6" id="pmoc-main-view">
      {/* Top Professional Regulatory Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-sm border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-10 pointer-events-none text-white">
          <ShieldCheck size={320} />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <ShieldCheck size={13} />
                Lei Federal Nº 13.589/2018
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <Award size={13} />
                ART / TRT Mecânica Ativa
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-full">
                Portaria MS 3.523 / ANVISA RE 09
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              PMOC & Responsabilidade Técnica Mecânica
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Acompanhamento oficial de rotinas de manutenção preventiva, controle de qualidade do ar e termo formal de Responsabilidade Técnica Mecânica (ART do CREA / TRT do CFT) exigido para ambientes climatizados.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-xs"
            >
              <Plus size={16} />
              <span>Novo Plano PMOC</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-2"
            >
              <Download size={16} />
              <span>Exportar Laudo PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Executive Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Building2 size={24} />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Planos PMOC</span>
            <div className="text-xl font-black text-slate-800 mt-0.5">{pmocPlans.length} Ativos</div>
            <span className="text-[10px] text-slate-500 font-medium">Contratos regulares</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl">
            <Flame size={24} />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Carga Térmica Total</span>
            <div className="text-xl font-black text-slate-800 mt-0.5">{totalCoveredTR.toFixed(1)} TR</div>
            <span className="text-[10px] text-slate-500 font-medium">{totalCoveredBTU.toLocaleString('pt-BR')} BTU/h</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Conformidade Global</span>
            <div className="text-xl font-black text-emerald-600 mt-0.5">{avgCompliance}%</div>
            <span className="text-[10px] text-slate-500 font-medium">Rotinas em dia</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Award size={24} />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Resp. Técnica (ART/TRT)</span>
            <div className="text-sm font-black text-slate-800 mt-0.5 truncate max-w-[140px]">
              {currentPlan?.technicalResp?.artOrTrtNumber ? 'Vigente e Certificada' : 'Pendente'}
            </div>
            <span className="text-[10px] text-slate-500 font-medium">{currentPlan?.technicalResp?.councilType || 'CREA/CFT'}</span>
          </div>
        </div>
      </div>

      {/* Plan Selector & Navigation Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Selector for PMOC Plan */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 shrink-0">Plano Selecionado:</span>
          <select
            value={selectedPlanId}
            onChange={(e) => setSelectedPlanId(e.target.value)}
            className="text-xs font-bold bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            {pmocPlans.map(plan => (
              <option key={plan.id} value={plan.id}>
                {plan.id} - {plan.buildingName} ({plan.totalThermalCapacityTR.toFixed(1)} TR)
              </option>
            ))}
          </select>
        </div>

        {/* Sub-tab Pills */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100/70 p-1 rounded-xl">
          <button
            onClick={() => setActiveSubTab('plans')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'plans' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 size={14} />
            <span>Empreendimentos</span>
          </button>
          <button
            onClick={() => setActiveSubTab('routines')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'routines' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar size={14} />
            <span>Rotinas & Vistorias</span>
          </button>
          <button
            onClick={() => setActiveSubTab('art')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'art' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award size={14} />
            <span>Assinatura & ART Mecânica</span>
          </button>
          <button
            onClick={() => setActiveSubTab('dossier')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'dossier' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Printer size={14} />
            <span>Dossiê & Impressão</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: PLANS & BUILDINGS */}
      {activeSubTab === 'plans' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pmocPlans.map((plan) => {
              const cust = customers.find(c => c.id === plan.customerId);
              const isSelected = plan.id === selectedPlanId;

              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`bg-white rounded-3xl p-6 border transition cursor-pointer shadow-xs relative ${
                    isSelected ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {plan.id}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                          {plan.status === 'vigente' ? 'Vigente' : 'Em Revisão'}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-base text-slate-900 mt-2">{plan.buildingName}</h3>
                      <p className="text-xs text-slate-500 font-medium">{cust?.name || 'Cliente'} • CNPJ: {plan.cnpjOrCpf}</p>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-black text-blue-700">{plan.totalThermalCapacityTR.toFixed(1)} TR</div>
                      <span className="text-[10px] text-slate-400">{plan.totalThermalCapacityBtu.toLocaleString('pt-BR')} BTU/h</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Área Climatizada</span>
                      <span className="font-bold text-slate-700">{plan.airConditionedAreaM2} m²</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Ocupação Média</span>
                      <span className="font-bold text-slate-700">{plan.fixedOccupants + plan.transientOccupants} pessoas</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Responsável Técnico</span>
                      <span className="font-bold text-slate-700 truncate block">{plan.technicalResp.technicalManagerName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">ART / TRT Vinculada</span>
                      <span className="font-mono font-bold text-blue-600 truncate block">{plan.technicalResp.artOrTrtNumber}</span>
                    </div>
                  </div>

                  {/* Compliance bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="text-slate-500 font-medium">Índice de Conformidade Preventiva</span>
                      <span className="font-black text-emerald-600">{plan.compliancePercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${plan.compliancePercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Card quick actions */}
                  <div className="mt-5 flex items-center justify-between gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPlanId(plan.id);
                        setActiveSubTab('routines');
                      }}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <span>Ver Rotinas</span>
                      <ChevronRight size={14} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPlanId(plan.id);
                        setActiveSubTab('art');
                      }}
                      className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                    >
                      <Award size={14} className="text-blue-500" />
                      <span>Termo ART</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPlanId(plan.id);
                        setActiveSubTab('dossier');
                      }}
                      className="text-xs font-bold px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition"
                    >
                      Dossiê Técnico
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: ROUTINES & MAINTENANCE MONITORING */}
      {activeSubTab === 'routines' && currentPlan && (
        <div className="space-y-6">
          {/* Header of the selected PMOC */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg">
                  {currentPlan.id}
                </span>
                <span className="text-xs font-bold text-slate-700">
                  {currentPlan.buildingName}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Cronograma periódico de atividades preventivas em conformidade com a ABNT NBR 13971 e Portaria 3.523/GM.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsRecordExecutionModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
              >
                <CheckCircle2 size={16} />
                <span>Registrar Vistoria Mensal</span>
              </button>
            </div>
          </div>

          {/* Filter pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <Filter size={14} /> Filtrar por:
            </span>
            {['all', 'Mensal', 'Trimestral', 'Semestral', 'Anual', 'Filtro', 'Serpentina', 'Refrigeração'].map(f => (
              <button
                key={f}
                onClick={() => setRoutineFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  routineFilter === f ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {f === 'all' ? 'Todas as Rotinas' : f}
              </button>
            ))}
          </div>

          {/* Routines Table */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Componente</th>
                    <th className="py-3.5 px-4">Procedimento / Rotina Técnica</th>
                    <th className="py-3.5 px-4">Periodicidade</th>
                    <th className="py-3.5 px-4">Referência Normativa</th>
                    <th className="py-3.5 px-4">Última Execução</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredRoutines.map((routine) => (
                    <tr key={routine.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-semibold">
                          {routine.component}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="font-bold text-slate-800 text-xs">{routine.item}</div>
                        {routine.notes && (
                          <p className="text-[11px] text-slate-500 mt-0.5 font-normal">{routine.notes}</p>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-700">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          routine.frequency === 'Mensal' ? 'bg-blue-50 text-blue-700' :
                          routine.frequency === 'Trimestral' ? 'bg-purple-50 text-purple-700' :
                          routine.frequency === 'Semestral' ? 'bg-amber-50 text-amber-700' :
                          'bg-emerald-50 text-emerald-700'
                        }`}>
                          {routine.frequency}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {routine.normativeReference}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                        {routine.lastCompletedDate ? new Date(routine.lastCompletedDate + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                          routine.status === 'conforme' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          routine.status === 'atencao' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {routine.status === 'conforme' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                          {routine.status === 'conforme' ? 'Conforme' : routine.status === 'atencao' ? 'Em Atenção' : 'Pendente'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleToggleRoutineStatus(routine.id)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-bold rounded-lg text-[11px] transition"
                        >
                          Alternar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Execution History Section */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Clock size={18} className="text-blue-600" />
              Histórico de Vistorias e Assinaturas Mensais
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {(currentPlan.executionHistory || []).map((exec) => (
                <div key={exec.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-blue-900 font-mono">
                      Mês: {exec.monthYear}
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check size={10} /> Executado
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-semibold">
                    {exec.technicianName}
                  </p>
                  <p className="text-[11px] text-slate-500 font-normal line-clamp-2">
                    {exec.observations || 'Rotina mensal de conformidade realizada.'}
                  </p>
                  <div className="pt-2 border-t border-slate-200/50 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                    <span>Data: {exec.executedDate ? new Date(exec.executedDate + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}</span>
                    <span className="font-bold text-slate-600">{exec.routinesCheckedCount} rotinas verificadas</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: TECHNICAL RESPONSIBILITY & ART MECÂNICA */}
      {activeSubTab === 'art' && currentPlan && (
        <div className="space-y-6">
          {/* Certificate Design / Timbre Oficial */}
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-8 shadow-sm space-y-6 relative overflow-hidden" id="art-certificate-box">
            {/* Top Certificate Header */}
            <div className="border-b-2 border-slate-800 pb-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
              <div className="space-y-1">
                <span className="text-[11px] font-black tracking-widest uppercase text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  DOCUMENTO OFICIAL REGULAMENTAR
                </span>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mt-2">
                  Termo de Responsabilidade Técnica Mecânica
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Vínculo com ART (CREA) / TRT (CFT) para Operação e Manutenção de Sistemas de Climatização (PMOC)
                </p>
              </div>

              {/* Official Seal Mockup */}
              <div className="w-28 h-28 shrink-0 rounded-full border-4 border-double border-blue-800 bg-blue-50/50 flex flex-col items-center justify-center text-center p-2 shadow-xs">
                <ShieldCheck size={28} className="text-blue-800" />
                <span className="text-[8px] font-black text-blue-900 tracking-tighter uppercase mt-1">RESPONSÁVEL</span>
                <span className="text-[8px] font-black text-blue-900 tracking-tighter uppercase">TÉCNICO MECÂNICO</span>
                <span className="text-[7px] font-mono text-blue-700">LEI 13.589/18</span>
              </div>
            </div>

            {/* Engineer & Council Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Responsável Técnico</span>
                <span className="text-sm font-black text-slate-900 block mt-0.5">{currentPlan.technicalResp.technicalManagerName}</span>
                <span className="text-xs text-slate-600 font-medium">{currentPlan.technicalResp.professionalTitle}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Conselho Profissional</span>
                <span className="text-sm font-black text-slate-900 block mt-0.5">{currentPlan.technicalResp.councilType} ({currentPlan.technicalResp.councilState})</span>
                <span className="text-xs text-slate-600 font-mono">{currentPlan.technicalResp.councilNumber}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Número da ART / TRT Mecânica</span>
                <span className="text-sm font-black text-blue-700 block mt-0.5 font-mono">{currentPlan.technicalResp.artOrTrtNumber}</span>
                <span className="text-xs text-emerald-600 font-bold">Válida até {new Date(currentPlan.technicalResp.artValidUntil).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>

            {/* Legal Text Declaration */}
            <div className="space-y-3 bg-blue-50/40 p-5 rounded-2xl border border-blue-100 text-xs text-slate-700 leading-relaxed font-sans">
              <h4 className="font-extrabold text-blue-900 uppercase tracking-wide flex items-center gap-1.5 text-xs">
                <Info size={14} className="text-blue-600" />
                Declaração e Fundamentação Jurídica
              </h4>
              <p className="italic">
                "{currentPlan.technicalResp.legalTextDeclaration || 'Declaro sob as penas da lei que assumo a Responsabilidade Técnica pela elaboração, supervisão e execução do Plano de Manutenção, Operação e Controle (PMOC) dos sistemas de climatização deste empreendimento, em observância à Lei Federal nº 13.589/2018, Portaria MS nº 3.523/1998 e Resolução RE nº 09/2003 da ANVISA.'}"
              </p>
              <div className="text-[11px] text-slate-500 font-medium pt-2 border-t border-blue-100">
                • <strong>Empreendimento Atendido:</strong> {currentPlan.buildingName} ({currentPlan.cnpjOrCpf})<br />
                • <strong>Endereço:</strong> {currentPlan.addressText}<br />
                • <strong>Capacidade Total:</strong> {currentPlan.totalThermalCapacityTR.toFixed(1)} TR ({currentPlan.totalThermalCapacityBtu.toLocaleString('pt-BR')} BTU/h) em {planEquipments.length} condicionadores de ar.
              </div>
            </div>

            {/* Digital Signatures Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              {/* Technician Signature */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-white text-center space-y-3">
                <div className="min-h-[90px] flex flex-col items-center justify-center">
                  {currentPlan.technicalResp.signatureUrl ? (
                    <img
                      src={currentPlan.technicalResp.signatureUrl}
                      alt="Assinatura do Responsável Técnico"
                      className="max-h-20 object-contain mx-auto"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="text-center text-slate-400 text-xs">
                      <PenTool size={28} className="mx-auto mb-1 text-slate-300" />
                      Assinatura pendente
                    </div>
                  )}
                </div>

                <div className="border-t-2 border-slate-800 pt-2 text-center">
                  <span className="font-black text-xs text-slate-900 block uppercase">
                    {currentPlan.technicalResp.technicalManagerName}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium block">
                    {currentPlan.technicalResp.professionalTitle}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    {currentPlan.technicalResp.councilType}: {currentPlan.technicalResp.councilNumber} | {currentPlan.technicalResp.artOrTrtNumber}
                  </span>
                </div>

                <button
                  onClick={() => setIsSignatureModalOpen(true)}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition inline-flex items-center gap-1"
                >
                  <PenTool size={13} />
                  <span>{currentPlan.technicalResp.signatureUrl ? 'Alterar Assinatura Digital' : 'Assinar Digitalmente'}</span>
                </button>
              </div>

              {/* Client / Building Owner Signature */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-white text-center space-y-3 flex flex-col justify-between">
                <div className="min-h-[90px] flex flex-col items-center justify-center text-slate-400 text-xs">
                  <CheckCircle2 size={28} className="mx-auto mb-1 text-emerald-500" />
                  <span className="text-emerald-700 font-bold text-xs">De Acordo do Contratante</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Assinado em cartório / digitalmente</span>
                </div>

                <div className="border-t-2 border-slate-800 pt-2 text-center">
                  <span className="font-black text-xs text-slate-900 block uppercase">
                    {currentCustomer?.name || currentPlan.buildingName}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium block">
                    Contratante / Síndico / Gestor do Edifício
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    CNPJ/CPF: {currentPlan.cnpjOrCpf}
                  </span>
                </div>

                <div className="text-[10px] text-slate-400 font-mono">
                  Validação jurídica em conformidade com a MP 2.200-2/2001
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: DOSSIÊ TÉCNICO & PRINT SHEET */}
      {activeSubTab === 'dossier' && currentPlan && (
        <div className="space-y-6">
          {/* Action Header for printing */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
              <FileText size={16} className="text-blue-600" />
              <span>Dossiê Completo pronto para apresentação em auditoria da ANVISA e fiscalizações.</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShareWhatsApp}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
              >
                <Share2 size={14} />
                <span>Enviar WhatsApp</span>
              </button>
              <button
                onClick={handlePrint}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
              >
                <Printer size={14} />
                <span>Imprimir Folha A4</span>
              </button>
              <button
                onClick={handleExportPDF}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
              >
                <Download size={14} />
                <span>Baixar PDF Oficial</span>
              </button>
            </div>
          </div>

          {/* High-fidelity A4 Printable Sheet */}
          <div className="border border-slate-300 p-8 rounded-2xl bg-white space-y-6 font-sans text-slate-800 max-w-4xl mx-auto shadow-sm" id="pmoc-printable-sheet">
            {/* Timbre com Banner da Empresa ou Nome da Oficina */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b-2 border-slate-800 pb-5">
              {companyProfile?.bannerUrl ? (
                <div className="max-w-md w-full sm:w-2/3">
                  <img
                    src={companyProfile.bannerUrl}
                    alt="Banner da Empresa"
                    className="w-full h-auto max-h-16 object-contain object-left rounded-lg"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-black uppercase tracking-wider text-slate-800">
                    {companyProfile?.name || 'CLIMA FRIO'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {companyProfile?.slogan || 'Sistemas de Climatização & Refrigeração'}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Suporte: {companyProfile?.email || 'contato@climafrio.com'} • {companyProfile?.phone || '(11) 98765-4321'}
                  </p>
                </div>
              )}

              <div className="text-right shrink-0">
                <div className="font-mono text-sm font-black bg-blue-50 text-blue-900 border border-blue-200 px-3 py-1 rounded">
                  {currentPlan.id}
                </div>
                <p className="text-[10px] text-slate-500 mt-1 font-mono">
                  ART: {currentPlan.technicalResp.artOrTrtNumber}
                </p>
                <p className="text-[10px] text-emerald-700 font-bold">
                  Conformidade: {currentPlan.compliancePercentage}%
                </p>
              </div>
            </div>

            {/* Document Title Banner */}
            <div className="bg-slate-900 text-white p-3 rounded-lg flex justify-between items-center text-xs font-bold">
              <span>PLANO DE MANUTENÇÃO, OPERAÇÃO E CONTROLE - PMOC</span>
              <span className="text-[10px] text-slate-300 font-mono">LEI FEDERAL Nº 13.589/2018</span>
            </div>

            {/* Section 1: Empreendimento */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase text-slate-800 border-b border-slate-200 pb-1">
                1. Dados do Empreendimento e Edificação
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Cliente / Razão Social:</span>
                  <span className="font-bold text-slate-800">{currentCustomer?.name || currentPlan.buildingName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">CNPJ / CPF:</span>
                  <span className="font-mono text-slate-700">{currentPlan.cnpjOrCpf}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Nome do Edifício:</span>
                  <span className="font-bold text-slate-800">{currentPlan.buildingName}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-slate-400 block font-semibold">Endereço Completo:</span>
                  <span className="text-slate-700">{currentPlan.addressText}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Área Climatizada / Ocupação:</span>
                  <span className="text-slate-700 font-bold">{currentPlan.airConditionedAreaM2} m² • {currentPlan.fixedOccupants + currentPlan.transientOccupants} pessoas</span>
                </div>
              </div>
            </div>

            {/* Section 2: Responsável Técnico Mecânico */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase text-slate-800 border-b border-slate-200 pb-1">
                2. Responsável Técnico Mecânico (ART / TRT)
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Nome do Profissional:</span>
                  <span className="font-bold text-slate-800">{currentPlan.technicalResp.technicalManagerName}</span>
                  <span className="text-[10px] text-slate-500 block">{currentPlan.technicalResp.professionalTitle}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Registro no Conselho:</span>
                  <span className="font-bold text-slate-800 font-mono">{currentPlan.technicalResp.councilType}: {currentPlan.technicalResp.councilNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Número da ART / TRT:</span>
                  <span className="font-bold text-blue-700 font-mono">{currentPlan.technicalResp.artOrTrtNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Validade da ART:</span>
                  <span className="font-bold text-slate-800">{new Date(currentPlan.technicalResp.artValidUntil).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>

            {/* Section 3: Equipamentos Climatizadores */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase text-slate-800 border-b border-slate-200 pb-1">
                3. Inventário de Aparelhos Climatizadores Cobertos
              </h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 font-bold text-[10px] text-slate-600 uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-2">TAG / Nº Série</th>
                      <th className="p-2">Localização / Sala</th>
                      <th className="p-2">Tipo</th>
                      <th className="p-2">Marca / Modelo</th>
                      <th className="p-2 text-right">Capacidade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {planEquipments.map((eq) => (
                      <tr key={eq.id}>
                        <td className="p-2 font-mono font-bold text-slate-800">{eq.serialNumber || eq.id}</td>
                        <td className="p-2 text-slate-700">{eq.locationRoom}</td>
                        <td className="p-2 text-slate-700">{eq.type}</td>
                        <td className="p-2 text-slate-700">{eq.brand} {eq.model}</td>
                        <td className="p-2 text-right font-bold text-slate-800">{eq.capacityBtu.toLocaleString('pt-BR')} BTU/h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 4: Assinaturas e Carimbo */}
            <div className="pt-6 border-t-2 border-slate-800 grid grid-cols-2 gap-8 text-center">
              <div className="space-y-1">
                {currentPlan.technicalResp.signatureUrl ? (
                  <img
                    src={currentPlan.technicalResp.signatureUrl}
                    alt="Assinatura"
                    className="max-h-16 mx-auto object-contain mb-1"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="h-12" />
                )}
                <div className="border-t border-slate-400 pt-1">
                  <p className="font-bold text-xs text-slate-800 uppercase">{currentPlan.technicalResp.technicalManagerName}</p>
                  <p className="text-[10px] text-slate-500">{currentPlan.technicalResp.professionalTitle} • {currentPlan.technicalResp.councilType} {currentPlan.technicalResp.councilNumber}</p>
                  <p className="text-[9px] text-slate-400 font-mono">{currentPlan.technicalResp.artOrTrtNumber}</p>
                </div>
              </div>

              <div className="space-y-1">
                <div className="h-12" />
                <div className="border-t border-slate-400 pt-1">
                  <p className="font-bold text-xs text-slate-800 uppercase">{currentCustomer?.name || currentPlan.buildingName}</p>
                  <p className="text-[10px] text-slate-500">Contratante / Síndico / Gestor do Edifício</p>
                  <p className="text-[9px] text-slate-400 font-mono">CNPJ/CPF: {currentPlan.cnpjOrCpf}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: NOVO PLANO PMOC */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 my-8 space-y-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Novo Plano PMOC com ART Mecânica</h3>
                  <p className="text-xs text-slate-500">Cadastre um plano de conformidade para atendimento à Lei 13.589/2018</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSavePlanForm} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cliente / Contratante *</label>
                  <select
                    value={formCustomerId}
                    onChange={(e) => setFormCustomerId(e.target.value)}
                    required
                    className="w-full text-xs font-medium px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.cpfCnpj})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do Edifício / Empresa *</label>
                  <input
                    type="text"
                    required
                    value={formBuildingName}
                    onChange={(e) => setFormBuildingName(e.target.value)}
                    placeholder="Ex: Edifício Comercial Alpha / Restaurante..."
                    className="w-full text-xs font-medium px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Área Climatizada (m²)</label>
                  <input
                    type="number"
                    value={formArea}
                    onChange={(e) => setFormArea(Number(e.target.value))}
                    className="w-full text-xs font-medium px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ramo de Atividade</label>
                  <input
                    type="text"
                    value={formActivityType}
                    onChange={(e) => setFormActivityType(e.target.value)}
                    placeholder="Comercial, Escritório, Restaurante..."
                    className="w-full text-xs font-medium px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ocupantes Fixos</label>
                  <input
                    type="number"
                    value={formFixedOccupants}
                    onChange={(e) => setFormFixedOccupants(Number(e.target.value))}
                    className="w-full text-xs font-medium px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ocupantes Flutuantes</label>
                  <input
                    type="number"
                    value={formTransientOccupants}
                    onChange={(e) => setFormTransientOccupants(Number(e.target.value))}
                    className="w-full text-xs font-medium px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Technical Responsibility details */}
              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-blue-900 mb-2 flex items-center gap-1.5">
                  <Award size={14} /> Dados da Responsabilidade Técnica Mecânica (ART / TRT)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Responsável Técnico *</label>
                    <input
                      type="text"
                      required
                      value={formTechName}
                      onChange={(e) => setFormTechName(e.target.value)}
                      className="w-full text-xs font-medium px-3 py-2 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Titulação Profissional</label>
                    <select
                      value={formTechTitle}
                      onChange={(e) => setFormTechTitle(e.target.value as any)}
                      className="w-full text-xs font-medium px-3 py-2 border border-slate-200 rounded-xl"
                    >
                      <option value="Engenheiro Mecânico">Engenheiro Mecânico</option>
                      <option value="Engenheiro Industrial Mecânico">Engenheiro Industrial Mecânico</option>
                      <option value="Técnico em Refrigeração e Climatização">Técnico em Refrigeração e Climatização</option>
                      <option value="Técnico em Mecânica">Técnico em Mecânica</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Conselho & Registro</label>
                    <div className="flex gap-2">
                      <select
                        value={formCouncilType}
                        onChange={(e) => setFormCouncilType(e.target.value as any)}
                        className="text-xs font-medium px-2 py-2 border border-slate-200 rounded-xl"
                      >
                        <option value="CREA">CREA</option>
                        <option value="CFT / CRT">CFT / CRT</option>
                      </select>
                      <input
                        type="text"
                        value={formCouncilNumber}
                        onChange={(e) => setFormCouncilNumber(e.target.value)}
                        placeholder="Nº Registro"
                        className="w-full text-xs font-medium px-3 py-2 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Número da ART / TRT *</label>
                    <input
                      type="text"
                      required
                      value={formArtNumber}
                      onChange={(e) => setFormArtNumber(e.target.value)}
                      placeholder="Ex: ART Nº 2802723024881-SP"
                      className="w-full text-xs font-medium px-3 py-2 border border-slate-200 rounded-xl font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Equipment Link */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Vincular Equipamentos Climatizadores do Cliente:
                </label>
                <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {equipments.filter(e => e.customerId === formCustomerId).length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-2">Nenhum equipamento cadastrado para este cliente.</p>
                  ) : (
                    equipments.filter(e => e.customerId === formCustomerId).map(eq => {
                      const isChecked = formSelectedEquipIds.includes(eq.id);
                      return (
                        <label key={eq.id} className="flex items-center gap-2 p-1.5 bg-white rounded-lg border border-slate-200/60 cursor-pointer text-xs">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormSelectedEquipIds(prev => [...prev, eq.id]);
                              } else {
                                setFormSelectedEquipIds(prev => prev.filter(id => id !== eq.id));
                              }
                            }}
                            className="rounded text-blue-600"
                          />
                          <span className="font-bold text-slate-800">{eq.locationRoom}</span>
                          <span className="text-slate-500">({eq.type} - {eq.brand} {eq.capacityBtu.toLocaleString('pt-BR')} BTU/h)</span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Salvar e Ativar PMOC
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REGISTRAR VISTORIA MENSAL */}
      {isRecordExecutionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-600" />
                Registrar Vistoria Preventiva Mensal
              </h3>
              <button onClick={() => setIsRecordExecutionModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveMonthlyExecution} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Mês de Referência</label>
                <input
                  type="month"
                  value={execMonthYear}
                  onChange={(e) => setExecMonthYear(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Técnico Executor</label>
                <input
                  type="text"
                  required
                  value={execTechName}
                  onChange={(e) => setExecTechName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Observações Técnicas da Inspeção</label>
                <textarea
                  rows={3}
                  value={execObs}
                  onChange={(e) => setExecObs(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRecordExecutionModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 font-bold hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Confirmar Vistoria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ASSINATURA DIGITAL NO CANVAS */}
      {isSignatureModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <PenTool size={18} className="text-blue-600" />
                Assinatura do Responsável Técnico (Mecânico)
              </h3>
              <button onClick={() => setIsSignatureModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Desenhe sua assinatura ou rubrica com o dedo ou mouse no quadro abaixo. Ela será incorporada nos laudos e ART do PMOC.
            </p>

            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-1 bg-slate-50 flex justify-center">
              <canvas
                ref={canvasRef}
                width={360}
                height={160}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="bg-white rounded-xl touch-none cursor-crosshair shadow-inner"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={clearCanvas}
                className="text-xs font-bold text-slate-500 hover:text-slate-700 underline"
              >
                Limpar Traço
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSignatureModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveSignature}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Salvar Assinatura
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
