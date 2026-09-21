import React, { useState, useEffect } from 'react';
import { Customer, Equipment, Appointment, ServiceOrder, Transaction, PMOCPlan, DiagnosticReport, Receipt, CatalogItem } from './types';
import { 
  initialCustomers, 
  initialEquipment, 
  initialAppointments, 
  initialServiceOrders, 
  initialTransactions,
  initialPMOCPlans,
  initialDiagnosticReports,
  initialReceipts,
  initialCatalogItems
} from './initialData';

// Icons
import { 
  LayoutDashboard, 
  Users, 
  Cpu, 
  Calendar, 
  FileText, 
  Landmark, 
  Menu, 
  X, 
  Snowflake, 
  Building, 
  ShieldCheck, 
  FileCheck,
  Plus,
  ChevronRight,
  Sparkles,
  Info,
  Wrench,
  Receipt as ReceiptIcon,
  Tag,
  Package
} from 'lucide-react';

// Views
import DashboardView from './components/DashboardView';
import CustomersView from './components/CustomersView';
import EquipmentView from './components/EquipmentView';
import ScheduleView from './components/ScheduleView';
import ServiceOrdersView from './components/ServiceOrdersView';
import FinancialView from './components/FinancialView';
import CompanyProfileView from './components/CompanyProfileView';
import PMOCView from './components/PMOCView';
import DiagnosticReportsView from './components/DiagnosticReportsView';
import ReceiptsView from './components/ReceiptsView';
import CatalogView from './components/CatalogView';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('Dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState<boolean>(false);

  // Core States
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pmocPlans, setPmocPlans] = useState<PMOCPlan[]>([]);
  const [diagnosticReports, setDiagnosticReports] = useState<DiagnosticReport[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);

  // Cross-view creation states (e.g. creating OS from schedule page)
  const [activeOSForCreation, setActiveOSForCreation] = useState<{ customerId: string; title: string; type: string } | null>(null);
  const [selectedOSForSheet, setSelectedOSForSheet] = useState<ServiceOrder | null>(null);
  const [initialReceiptForCreation, setInitialReceiptForCreation] = useState<Partial<Receipt> | null>(null);

  // Initialize data from localStorage or fallback to mock data
  useEffect(() => {
    const storedCustomers = localStorage.getItem('climafrio_customers');
    const storedEquipment = localStorage.getItem('climafrio_equipment');
    const storedAppointments = localStorage.getItem('climafrio_appointments');
    const storedServiceOrders = localStorage.getItem('climafrio_service_orders');
    const storedTransactions = localStorage.getItem('climafrio_transactions');
    const storedPMOC = localStorage.getItem('climafrio_pmoc_plans');
    const storedDiagnostics = localStorage.getItem('climafrio_diagnostic_reports');
    const storedReceipts = localStorage.getItem('climafrio_receipts');
    const storedCatalog = localStorage.getItem('climafrio_catalog_items');

    if (storedCustomers) setCustomers(JSON.parse(storedCustomers));
    else {
      setCustomers(initialCustomers);
      localStorage.setItem('climafrio_customers', JSON.stringify(initialCustomers));
    }

    if (storedEquipment) setEquipment(JSON.parse(storedEquipment));
    else {
      setEquipment(initialEquipment);
      localStorage.setItem('climafrio_equipment', JSON.stringify(initialEquipment));
    }

    if (storedAppointments) setAppointments(JSON.parse(storedAppointments));
    else {
      setAppointments(initialAppointments);
      localStorage.setItem('climafrio_appointments', JSON.stringify(initialAppointments));
    }

    if (storedServiceOrders) setServiceOrders(JSON.parse(storedServiceOrders));
    else {
      setServiceOrders(initialServiceOrders);
      localStorage.setItem('climafrio_service_orders', JSON.stringify(initialServiceOrders));
    }

    if (storedTransactions) setTransactions(JSON.parse(storedTransactions));
    else {
      setTransactions(initialTransactions);
      localStorage.setItem('climafrio_transactions', JSON.stringify(initialTransactions));
    }

    if (storedPMOC) setPmocPlans(JSON.parse(storedPMOC));
    else {
      setPmocPlans(initialPMOCPlans);
      localStorage.setItem('climafrio_pmoc_plans', JSON.stringify(initialPMOCPlans));
    }

    if (storedDiagnostics) setDiagnosticReports(JSON.parse(storedDiagnostics));
    else {
      setDiagnosticReports(initialDiagnosticReports);
      localStorage.setItem('climafrio_diagnostic_reports', JSON.stringify(initialDiagnosticReports));
    }

    if (storedReceipts) setReceipts(JSON.parse(storedReceipts));
    else {
      setReceipts(initialReceipts);
      localStorage.setItem('climafrio_receipts', JSON.stringify(initialReceipts));
    }

    if (storedCatalog) setCatalogItems(JSON.parse(storedCatalog));
    else {
      setCatalogItems(initialCatalogItems);
      localStorage.setItem('climafrio_catalog_items', JSON.stringify(initialCatalogItems));
    }
  }, []);

  // Save states helper
  const saveState = (key: string, data: any, setter: Function) => {
    setter(data);
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Automated financial lockstep check:
  // When service orders change, check if any are completed & paid without a linked transaction
  useEffect(() => {
    if (serviceOrders.length === 0) return;

    let changed = false;
    const updatedTransactions = [...transactions];

    serviceOrders.forEach(os => {
      if (os.status === 'completed' && os.paymentStatus === 'paid') {
        const linkedExists = updatedTransactions.some(t => t.linkedOsId === os.id);
        if (!linkedExists) {
          const client = customers.find(c => c.id === os.customerId);
          const newTrans: Transaction = {
            id: `t-os-${os.id}`,
            type: 'income',
            amount: os.totalValue,
            category: 'Orçamento Pago',
            date: os.dateClosed || new Date().toISOString().split('T')[0],
            description: `Recebimento OS ${os.id} - ${client?.name || 'Cliente'}`,
            linkedOsId: os.id
          };
          updatedTransactions.push(newTrans);
          changed = true;
        }
      }
    });

    if (changed) {
      saveState('climafrio_transactions', updatedTransactions, setTransactions);
    }
  }, [serviceOrders, customers]);

  // MUTATORS
  // Customers
  const handleAddCustomer = (c: Omit<Customer, 'id' | 'createdAt'>): Customer => {
    const newCustomer: Customer = {
      ...c,
      id: `cust-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    saveState('climafrio_customers', [newCustomer, ...customers], setCustomers);
    return newCustomer;
  };

  const handleEditCustomer = (c: Customer) => {
    const updated = customers.map(item => item.id === c.id ? c : item);
    saveState('climafrio_customers', updated, setCustomers);
  };

  const handleDeleteCustomer = (id: string) => {
    const updated = customers.filter(item => item.id !== id);
    saveState('climafrio_customers', updated, setCustomers);
    // Orphan linked equipment
    const updatedEquip = equipment.filter(eq => eq.customerId !== id);
    saveState('climafrio_equipment', updatedEquip, setEquipment);
  };

  // Equipment
  const handleAddEquipment = (eq: Omit<Equipment, 'id'>): Equipment => {
    const newEquipment: Equipment = {
      ...eq,
      id: `equip-${Date.now()}`
    };
    saveState('climafrio_equipment', [newEquipment, ...equipment], setEquipment);
    return newEquipment;
  };

  const handleEditEquipment = (eq: Equipment) => {
    const updated = equipment.map(item => item.id === eq.id ? eq : item);
    saveState('climafrio_equipment', updated, setEquipment);
  };

  const handleDeleteEquipment = (id: string) => {
    const updated = equipment.filter(item => item.id !== id);
    saveState('climafrio_equipment', updated, setEquipment);
  };

  // Appointments
  const handleAddAppointment = (appt: Omit<Appointment, 'id'>) => {
    const newAppt: Appointment = {
      ...appt,
      id: `appt-${Date.now()}`
    };
    saveState('climafrio_appointments', [newAppt, ...appointments], setAppointments);
  };

  const handleEditAppointment = (appt: Appointment) => {
    const updated = appointments.map(item => item.id === appt.id ? appt : item);
    saveState('climafrio_appointments', updated, setAppointments);
  };

  const handleDeleteAppointment = (id: string) => {
    const updated = appointments.filter(item => item.id !== id);
    saveState('climafrio_appointments', updated, setAppointments);
  };

  // Service Orders
  const handleAddOS = (os: Omit<ServiceOrder, 'id'>) => {
    // Generate OS number: e.g. OS-2026-XXXX
    const year = new Date().getFullYear();
    const count = serviceOrders.filter(o => o.id.includes(`OS-${year}`)).length + 1;
    const paddingStr = String(count).padStart(4, '0');
    const osId = `OS-${year}-${paddingStr}`;

    const newOS: ServiceOrder = {
      ...os,
      id: osId
    };
    saveState('climafrio_service_orders', [newOS, ...serviceOrders], setServiceOrders);
  };

  const handleEditOS = (os: ServiceOrder) => {
    const updated = serviceOrders.map(item => item.id === os.id ? os : item);
    saveState('climafrio_service_orders', updated, setServiceOrders);
  };

  const handleDeleteOS = (id: string) => {
    const updated = serviceOrders.filter(item => item.id !== id);
    saveState('climafrio_service_orders', updated, setServiceOrders);
    // Remove linked automatic transaction
    const updatedTrans = transactions.filter(t => t.linkedOsId !== id);
    saveState('climafrio_transactions', updatedTrans, setTransactions);
  };

  // Transactions
  const handleAddTransaction = (t: Omit<Transaction, 'id'>) => {
    const newTrans: Transaction = {
      ...t,
      id: `trans-${Date.now()}`
    };
    saveState('climafrio_transactions', [newTrans, ...transactions], setTransactions);
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter(item => item.id !== id);
    saveState('climafrio_transactions', updated, setTransactions);
  };

  // PMOC Plans
  const handleSavePMOCPlan = (plan: PMOCPlan) => {
    const exists = pmocPlans.some(p => p.id === plan.id);
    const updated = exists ? pmocPlans.map(p => p.id === plan.id ? plan : p) : [plan, ...pmocPlans];
    saveState('climafrio_pmoc_plans', updated, setPmocPlans);
  };

  const handleDeletePMOCPlan = (id: string) => {
    const updated = pmocPlans.filter(p => p.id !== id);
    saveState('climafrio_pmoc_plans', updated, setPmocPlans);
  };

  // Diagnostic & Repair Reports
  const handleSaveDiagnosticReport = (report: DiagnosticReport) => {
    const exists = diagnosticReports.some(r => r.id === report.id);
    const updated = exists 
      ? diagnosticReports.map(r => r.id === report.id ? report : r)
      : [report, ...diagnosticReports];
    saveState('climafrio_diagnostic_reports', updated, setDiagnosticReports);
  };

  const handleDeleteDiagnosticReport = (id: string) => {
    const updated = diagnosticReports.filter(r => r.id !== id);
    saveState('climafrio_diagnostic_reports', updated, setDiagnosticReports);
  };

  // Receipts Mutators
  const handleSaveReceipt = (receipt: Receipt) => {
    const exists = receipts.some(r => r.id === receipt.id);
    const updated = exists 
      ? receipts.map(r => r.id === receipt.id ? receipt : r)
      : [receipt, ...receipts];
    saveState('climafrio_receipts', updated, setReceipts);
  };

  const handleDeleteReceipt = (id: string) => {
    const updated = receipts.filter(r => r.id !== id);
    saveState('climafrio_receipts', updated, setReceipts);
  };

  // Open Receipt from OS
  const handleOpenReceiptForOS = (os: ServiceOrder) => {
    const cust = customers.find(c => c.id === os.customerId);
    const equip = equipment.find(e => e.id === os.equipmentId);
    setInitialReceiptForCreation({
      serviceOrderId: os.id,
      customerName: cust?.name || 'Cliente',
      customerDocument: cust?.cpf || cust?.cnpj || '',
      amount: os.totalValue,
      description: `Quitação referente à Ordem de Serviço #${os.id} (${os.issueReported}${equip ? ` - ${equip.brand} ${equip.model}` : ''})`,
      paymentMethod: 'pix'
    });
    setActiveTab('Recibos');
  };

  // Catalog Mutators
  const handleSaveCatalogItem = (item: CatalogItem) => {
    const exists = catalogItems.some(i => i.id === item.id);
    const updated = exists 
      ? catalogItems.map(i => i.id === item.id ? item : i)
      : [item, ...catalogItems];
    saveState('climafrio_catalog_items', updated, setCatalogItems);
  };

  const handleDeleteCatalogItem = (id: string) => {
    const updated = catalogItems.filter(i => i.id !== id);
    saveState('climafrio_catalog_items', updated, setCatalogItems);
  };

  // Navigation handlers
  const handleGenerateOSFromAppointment = (appt: Appointment) => {
    setActiveOSForCreation({
      customerId: appt.customerId,
      title: appt.title,
      type: appt.type
    });
    setActiveTab('Ordem de Serviço');
  };

  // Categorized Navigation
  const navigationSections = [
    {
      title: 'Operação & Atendimentos',
      items: [
        { 
          id: 'Dashboard', 
          name: 'Dashboard', 
          icon: LayoutDashboard, 
          badge: null,
          hint: 'Visão Geral & Métricas'
        },
        { 
          id: 'Ordem de Serviço', 
          name: 'Ordens de Serviço', 
          icon: FileText, 
          badge: serviceOrders.filter(o => o.status === 'in_progress').length > 0 
            ? `${serviceOrders.filter(o => o.status === 'in_progress').length}` 
            : null,
          badgeColor: 'bg-blue-100 text-blue-700',
          hint: 'Abertura, execução e fechamento'
        },
        { 
          id: 'Laudo & Diagnóstico', 
          name: 'Laudos & Consertos', 
          icon: FileCheck, 
          badge: 'PDF',
          badgeColor: 'bg-emerald-100 text-emerald-700',
          hint: 'Diagnóstico com envio em PDF/WhatsApp'
        },
        { 
          id: 'Recibos', 
          name: 'Recibos Digitais', 
          icon: ReceiptIcon, 
          badge: 'Assinatura',
          badgeColor: 'bg-blue-100 text-blue-700',
          hint: 'Recibo com valor por extenso e assinatura'
        },
        { 
          id: 'Agenda', 
          name: 'Agenda & Visitas', 
          icon: Calendar, 
          badge: appointments.filter(a => a.status === 'scheduled').length > 0 
            ? `${appointments.filter(a => a.status === 'scheduled').length}` 
            : null,
          badgeColor: 'bg-amber-100 text-amber-700',
          hint: 'Compromissos agendados'
        }
      ]
    },
    {
      title: 'Cadastros Técnicos',
      items: [
        { 
          id: 'Clientes', 
          name: 'Clientes', 
          icon: Users, 
          badge: `${customers.length}`,
          badgeColor: 'bg-slate-100 text-slate-700',
          hint: 'Contatos e endereços'
        },
        { 
          id: 'Equipamentos', 
          name: 'Equipamentos', 
          icon: Cpu, 
          badge: `${equipment.length}`,
          badgeColor: 'bg-slate-100 text-slate-700',
          hint: 'Aparelhos de ar cadastrados'
        },
        { 
          id: 'Catálogo', 
          name: 'Catálogo & Preços', 
          icon: Tag, 
          badge: `${catalogItems.length}`,
          badgeColor: 'bg-emerald-100 text-emerald-700',
          hint: 'Tabela de serviços e margem'
        }
      ]
    },
    {
      title: 'Regulamentação & Gestão',
      items: [
        { 
          id: 'PMOC / ART', 
          name: 'PMOC / ART Legal', 
          icon: ShieldCheck, 
          badge: 'Lei 13.589',
          badgeColor: 'bg-indigo-100 text-indigo-700',
          hint: 'Manutenção periódica e ART técnica'
        },
        { 
          id: 'Financeiro', 
          name: 'Financeiro', 
          icon: Landmark, 
          badge: null,
          badgeColor: '',
          hint: 'Fluxo de caixa e faturamento'
        },
        { 
          id: 'Minha Empresa', 
          name: 'Minha Empresa', 
          icon: Building, 
          badge: null,
          badgeColor: '',
          hint: 'Banner e timbrado nos relatórios'
        }
      ]
    }
  ];

  // Screen descriptions for enhanced clarity and organization
  const screenInfoMap: Record<string, { title: string; subtitle: string }> = {
    'Dashboard': {
      title: 'Visão Geral Operacional',
      subtitle: 'Resumo de faturamento, chamados em aberto, diagnósticos e agenda da sua oficina.'
    },
    'Ordem de Serviço': {
      title: 'Ordens de Serviço (OS)',
      subtitle: 'Gerencie ordens de serviço, checklists técnicos, aprovações de orçamento e faturamento.'
    },
    'Laudo & Diagnóstico': {
      title: 'Laudos Técnicos de Diagnóstico & Conserto',
      subtitle: 'Emita laudos periciais com testes de pressão, salto térmico (ΔT), peças trocadas e envio em PDF/WhatsApp.'
    },
    'Recibos': {
      title: 'Recibos Profissionais de Pagamento',
      subtitle: 'Emissão ágil de recibos de quitação com valor por extenso automático, assinatura na tela e envio em PDF/WhatsApp.'
    },
    'Agenda': {
      title: 'Agenda de Atendimentos',
      subtitle: 'Controle de visitas técnicas, preventivas e instalações agendadas com os clientes.'
    },
    'Clientes': {
      title: 'Cadastro de Clientes',
      subtitle: 'Controle de clientes residenciais e comerciais com histórico de equipamentos e manutenções.'
    },
    'Equipamentos': {
      title: 'Parque de Equipamentos',
      subtitle: 'Inventário de condicionadores de ar (Split, Cassete, Piso Teto) com histórico e BTUs.'
    },
    'Catálogo': {
      title: 'Catálogo de Serviços, Peças & Tabela de Preços',
      subtitle: 'Tabela padronizada com cálculo de margem de lucro para higienização, instalação, cargas de gás e componentes.'
    },
    'PMOC / ART': {
      title: 'PMOC & Responsabilidade Técnica (ART/TRT)',
      subtitle: 'Plano de Manutenção, Operação e Controle conforme a Lei Federal 13.589/18 com relatórios técnicos.'
    },
    'Financeiro': {
      title: 'Fluxo Financeiro',
      subtitle: 'Entradas de ordens de serviço pagas e despesas operacionais da oficina em tempo real.'
    },
    'Minha Empresa': {
      title: 'Minha Oficina / Empresa',
      subtitle: 'Configure o banner oficial, CNPJ e dados de contato que saem no cabeçalho de todos os laudos e orçamentos.'
    }
  };

  // Cashier balance calculator for sidebar footer
  const totalIncomes = transactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);
  const currentCash = totalIncomes - totalExpenses;

  const currentScreenInfo = screenInfoMap[activeTab] || {
    title: activeTab,
    subtitle: 'Gestão técnica de climatização e refrigeração'
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row antialiased font-sans text-slate-800" id="app-container">
      
      {/* Mobile Top Header */}
      <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-xs" id="mobile-header">
        <div className="flex items-center gap-2 text-blue-600 font-black tracking-tight text-lg">
          <Snowflake size={22} className="animate-spin-slow text-blue-500" />
          <span>Clima Frio</span>
        </div>
        <button
          id="btn-mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition"
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Sidebar - Desktop navigation drawer */}
      <aside 
        id="app-sidebar"
        className={`fixed lg:static inset-y-0 left-0 w-72 bg-white border-r border-slate-200 z-50 flex flex-col justify-between transform transition-transform duration-300 ease-in-out lg:transform-none ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Sidebar Brand Logo Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <Snowflake size={22} />
              </div>
              <div>
                <span className="font-black text-slate-900 tracking-tight text-base block leading-none">Clima Frio</span>
                <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider block mt-0.5">Gestão HVAC & PMOC</span>
              </div>
            </div>
            {/* Close button for mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-slate-600 rounded-lg transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Quick Action Button inside sidebar */}
          <div className="p-3 border-b border-slate-100 bg-slate-50/60">
            <button
              id="btn-sidebar-quick-diagnostic"
              onClick={() => {
                setActiveTab('Laudo & Diagnóstico');
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <FileCheck size={16} />
              <span>+ Emitir Laudo / PDF</span>
            </button>
          </div>

          {/* Categorized Navigation Links */}
          <nav className="p-3 space-y-5" id="sidebar-navigation">
            {navigationSections.map((section, sIdx) => (
              <div key={section.title} className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 block mb-1">
                  {section.title}
                </span>
                <div className="space-y-0.5">
                  {section.items.map(item => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                      <button
                        id={`nav-tab-${item.id.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition duration-150 cursor-pointer ${
                          isActive 
                            ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/80 shadow-2xs' 
                            : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon size={17} className={isActive ? 'text-blue-600 shrink-0' : 'text-slate-400 shrink-0'} />
                          <span className="truncate">{item.name}</span>
                        </div>
                        {item.badge && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${
                            item.badgeColor || 'bg-slate-100 text-slate-600'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer with current cashier info */}
        <div className="p-4 border-t border-slate-200 bg-slate-50" id="sidebar-footer">
          <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400">Saldo Operacional</span>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                ● Ativo
              </span>
            </div>
            <span className="font-mono text-base font-black text-slate-900 block">
              R$ {currentCash.toFixed(2)}
            </span>
            <div className="text-[10px] text-slate-500 flex justify-between pt-1 border-t border-slate-100">
              <span>{serviceOrders.length} OSs</span>
              <span>{diagnosticReports.length} Laudos</span>
              <span>{customers.length} Clientes</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay backdrop for mobile side-drawer */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Main Content Pane */}
      <main className="flex-1 overflow-y-auto min-w-0" id="main-content-pane">
        
        {/* Top Contextual Header Bar */}
        <header className="bg-white border-b border-slate-200 px-4 py-3.5 sm:px-8 sm:py-4 sticky top-0 z-30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-2xs">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-0.5">
              <span>Clima Frio</span>
              <ChevronRight size={12} />
              <span className="font-semibold text-blue-600">{activeTab}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight truncate">
              {currentScreenInfo.title}
            </h1>
            <p className="text-xs text-slate-500 line-clamp-1">
              {currentScreenInfo.subtitle}
            </p>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <button
                id="btn-top-quick-actions"
                onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}
                className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Plus size={15} />
                <span>Ação Rápida</span>
              </button>

              {isQuickActionOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsQuickActionOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-50 text-xs font-semibold space-y-1">
                    <button
                      onClick={() => {
                        setActiveTab('Laudo & Diagnóstico');
                        setIsQuickActionOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 flex items-center gap-2 transition"
                    >
                      <FileCheck size={16} className="text-emerald-600" />
                      <div>
                        <span className="block font-bold">Novo Laudo / Conserto</span>
                        <span className="text-[10px] text-slate-400 font-normal">Diagnóstico com PDF p/ Cliente</span>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('Ordem de Serviço');
                        setIsQuickActionOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 text-slate-700 hover:text-blue-700 flex items-center gap-2 transition"
                    >
                      <FileText size={16} className="text-blue-600" />
                      <div>
                        <span className="block font-bold">Nova Ordem de Serviço</span>
                        <span className="text-[10px] text-slate-400 font-normal">Abertura de serviço técnico</span>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('Agenda');
                        setIsQuickActionOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-amber-50 text-slate-700 hover:text-amber-700 flex items-center gap-2 transition"
                    >
                      <Calendar size={16} className="text-amber-600" />
                      <div>
                        <span className="block font-bold">Novo Agendamento</span>
                        <span className="text-[10px] text-slate-400 font-normal">Marcar visita ou manutenção</span>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('Clientes');
                        setIsQuickActionOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 flex items-center gap-2 transition"
                    >
                      <Users size={16} className="text-indigo-600" />
                      <div>
                        <span className="block font-bold">Novo Cliente</span>
                        <span className="text-[10px] text-slate-400 font-normal">Cadastrar cliente e endereço</span>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('Recibos');
                        setIsQuickActionOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 text-slate-700 hover:text-blue-700 flex items-center gap-2 transition border-t border-slate-100 pt-2"
                    >
                      <ReceiptIcon size={16} className="text-blue-600" />
                      <div>
                        <span className="block font-bold">Emitir Recibo</span>
                        <span className="text-[10px] text-slate-400 font-normal">Com valor por extenso e assinatura</span>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('Catálogo');
                        setIsQuickActionOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 flex items-center gap-2 transition"
                    >
                      <Tag size={16} className="text-emerald-600" />
                      <div>
                        <span className="block font-bold">Tabela de Preços</span>
                        <span className="text-[10px] text-slate-400 font-normal">Catálogo de serviços e peças</span>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-4 sm:p-8 max-w-7xl mx-auto">
          {activeTab === 'Dashboard' && (
            <DashboardView
              customers={customers}
              equipment={equipment}
              appointments={appointments}
              serviceOrders={serviceOrders}
              transactions={transactions}
              setActiveTab={setActiveTab}
              onEditAppointment={handleEditAppointment}
              onEditOS={handleEditOS}
              setSelectedOSForSheet={(os) => {
                setSelectedOSForSheet(os);
              }}
            />
          )}

          {activeTab === 'Laudo & Diagnóstico' && (
            <DiagnosticReportsView
              customers={customers}
              equipments={equipment}
              serviceOrders={serviceOrders}
              diagnosticReports={diagnosticReports}
              onSaveReport={handleSaveDiagnosticReport}
              onDeleteReport={handleDeleteDiagnosticReport}
            />
          )}

          {activeTab === 'Recibos' && (
            <ReceiptsView
              receipts={receipts}
              customers={customers}
              serviceOrders={serviceOrders}
              onSaveReceipt={handleSaveReceipt}
              onDeleteReceipt={handleDeleteReceipt}
              initialReceiptData={initialReceiptForCreation}
              onClearInitialData={() => setInitialReceiptForCreation(null)}
            />
          )}

          {activeTab === 'Clientes' && (
            <CustomersView
              customers={customers}
              equipment={equipment}
              serviceOrders={serviceOrders}
              onAddCustomer={handleAddCustomer}
              onEditCustomer={handleEditCustomer}
              onDeleteCustomer={handleDeleteCustomer}
            />
          )}

          {activeTab === 'Equipamentos' && (
            <EquipmentView
              equipment={equipment}
              customers={customers}
              onAddEquipment={handleAddEquipment}
              onEditEquipment={handleEditEquipment}
              onDeleteEquipment={handleDeleteEquipment}
            />
          )}

          {activeTab === 'Catálogo' && (
            <CatalogView
              catalogItems={catalogItems}
              onSaveItem={handleSaveCatalogItem}
              onDeleteItem={handleDeleteCatalogItem}
              onSelectForServiceOrder={(item) => {
                setActiveOSForCreation({
                  customerId: customers[0]?.id || '',
                  title: `${item.name} (${item.type === 'servico' ? 'Mão de Obra' : 'Peça'})`,
                  type: item.type === 'servico' ? 'Preventiva' : 'Corretiva'
                });
                setActiveTab('Ordem de Serviço');
              }}
            />
          )}

          {activeTab === 'Agenda' && (
            <ScheduleView
              appointments={appointments}
              customers={customers}
              onAddAppointment={handleAddAppointment}
              onEditAppointment={handleEditAppointment}
              onDeleteAppointment={handleDeleteAppointment}
              onGenerateOSFromAppointment={handleGenerateOSFromAppointment}
            />
          )}

          {activeTab === 'Ordem de Serviço' && (
            <ServiceOrdersView
              serviceOrders={serviceOrders}
              customers={customers}
              equipment={equipment}
              catalogItems={catalogItems}
              onAddOS={handleAddOS}
              onEditOS={handleEditOS}
              onDeleteOS={handleDeleteOS}
              activeOSForCreation={activeOSForCreation}
              onClearActiveOSCreation={() => setActiveOSForCreation(null)}
              onAddCustomer={handleAddCustomer}
              onAddEquipment={handleAddEquipment}
              onOpenReceiptForOs={handleOpenReceiptForOS}
            />
          )}

          {activeTab === 'PMOC / ART' && (
            <PMOCView
              customers={customers}
              equipments={equipment}
              pmocPlans={pmocPlans}
              onSavePMOCPlan={handleSavePMOCPlan}
              onDeletePMOCPlan={handleDeletePMOCPlan}
            />
          )}

          {activeTab === 'Financeiro' && (
            <FinancialView
              transactions={transactions}
              serviceOrders={serviceOrders}
              customers={customers}
              onAddTransaction={handleAddTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              onMarkOsPaid={(os) => {
                handleEditOS({ ...os, paymentStatus: 'paid' });
              }}
              onOpenReceiptForOs={handleOpenReceiptForOS}
            />
          )}

          {activeTab === 'Minha Empresa' && (
            <CompanyProfileView />
          )}
        </div>
      </main>

    </div>
  );
}

