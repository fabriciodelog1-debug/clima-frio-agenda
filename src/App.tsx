import React, { useState, useEffect } from 'react';
import { Customer, Equipment, Appointment, ServiceOrder, Transaction } from './types';
import { 
  initialCustomers, 
  initialEquipment, 
  initialAppointments, 
  initialServiceOrders, 
  initialTransactions 
} from './initialData';

// Icons
import { LayoutDashboard, Users, Cpu, Calendar, FileText, Landmark, Menu, X, Snowflake } from 'lucide-react';

// Views
import DashboardView from './components/DashboardView';
import CustomersView from './components/CustomersView';
import EquipmentView from './components/EquipmentView';
import ScheduleView from './components/ScheduleView';
import ServiceOrdersView from './components/ServiceOrdersView';
import FinancialView from './components/FinancialView';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('Dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Core States
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Cross-view creation states (e.g. creating OS from schedule page)
  const [activeOSForCreation, setActiveOSForCreation] = useState<{ customerId: string; title: string; type: string } | null>(null);
  const [selectedOSForSheet, setSelectedOSForSheet] = useState<ServiceOrder | null>(null);

  // Initialize data from localStorage or fallback to mock data
  useEffect(() => {
    const storedCustomers = localStorage.getItem('climafrio_customers');
    const storedEquipment = localStorage.getItem('climafrio_equipment');
    const storedAppointments = localStorage.getItem('climafrio_appointments');
    const storedServiceOrders = localStorage.getItem('climafrio_service_orders');
    const storedTransactions = localStorage.getItem('climafrio_transactions');

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
  const handleAddCustomer = (c: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCustomer: Customer = {
      ...c,
      id: `cust-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    saveState('climafrio_customers', [newCustomer, ...customers], setCustomers);
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
  const handleAddEquipment = (eq: Omit<Equipment, 'id'>) => {
    const newEquipment: Equipment = {
      ...eq,
      id: `equip-${Date.now()}`
    };
    saveState('climafrio_equipment', [newEquipment, ...equipment], setEquipment);
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

  // Navigation handlers
  const handleGenerateOSFromAppointment = (appt: Appointment) => {
    setActiveOSForCreation({
      customerId: appt.customerId,
      title: appt.title,
      type: appt.type
    });
    setActiveTab('Ordem de Serviço');
  };

  // Layout sidebar items helper
  const sidebarItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Clientes', icon: Users },
    { name: 'Equipamentos', icon: Cpu },
    { name: 'Agenda', icon: Calendar },
    { name: 'Ordem de Serviço', icon: FileText },
    { name: 'Financeiro', icon: Landmark }
  ];

  // Cashier balance calculator for sidebar footer
  const totalIncomes = transactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);
  const currentCash = totalIncomes - totalExpenses;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row antialiased font-sans" id="app-container">
      
      {/* Mobile Top Header */}
      <header className="lg:hidden bg-white border-b border-slate-100 px-4 py-3.5 flex items-center justify-between sticky top-0 z-40 shadow-xs" id="mobile-header">
        <div className="flex items-center gap-2 text-blue-600 font-black tracking-tight text-lg">
          <Snowflake size={24} className="animate-spin-slow text-blue-500" />
          <span>Clima Frio</span>
        </div>
        <button
          id="btn-mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-1.5 text-slate-600 hover:bg-slate-50 rounded-lg transition"
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Sidebar - Desktop navigation drawer */}
      <aside 
        id="app-sidebar"
        className={`fixed lg:static inset-y-0 left-0 w-64 bg-white border-r border-slate-100 z-50 flex flex-col justify-between transform transition-transform duration-300 ease-in-out lg:transform-none ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex flex-col flex-1">
          {/* Sidebar Brand Logo Header */}
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-600 font-black tracking-wider text-xl">
              <Snowflake size={26} className="text-blue-500 animate-pulse" />
              <span>Clima Frio</span>
            </div>
            {/* Close button for mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-slate-600 rounded-lg transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1" id="sidebar-navigation">
            {sidebarItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;

              return (
                <button
                  id={`nav-tab-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                  key={item.name}
                  onClick={() => {
                    setActiveTab(item.name);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition duration-150 ${isActive ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer with current cashier info */}
        <div className="p-4 border-t border-slate-50 bg-slate-50/50" id="sidebar-footer">
          <div className="p-3 bg-white border border-slate-100 rounded-xl space-y-1">
            <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 block">Faturamento em Caixa</span>
            <span className="font-mono text-sm font-bold text-slate-800 block">
              R$ {currentCash.toFixed(2)}
            </span>
            <span className="text-[9px] text-green-600 font-semibold flex items-center gap-0.5">
              ● Saldo Operacional Ok
            </span>
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
      <main className="flex-1 overflow-y-auto px-4 py-6 sm:p-8" id="main-content-pane">
        <div className="max-w-7xl mx-auto">
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
                // Switch immediately to service order tab in order detail state
              }}
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
              onAddOS={handleAddOS}
              onEditOS={handleEditOS}
              onDeleteOS={handleDeleteOS}
              activeOSForCreation={activeOSForCreation}
              onClearActiveOSCreation={() => setActiveOSForCreation(null)}
            />
          )}

          {activeTab === 'Financeiro' && (
            <FinancialView
              transactions={transactions}
              serviceOrders={serviceOrders}
              onAddTransaction={handleAddTransaction}
              onDeleteTransaction={handleDeleteTransaction}
            />
          )}
        </div>
      </main>

    </div>
  );
}
