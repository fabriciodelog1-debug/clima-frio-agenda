import React from 'react';
import { Customer, Equipment, Appointment, ServiceOrder, Transaction } from '../types';
import { Users, Cpu, Calendar, FileText, CheckCircle2, Clock, AlertCircle, ChevronRight, TrendingUp } from 'lucide-react';

interface DashboardViewProps {
  customers: Customer[];
  equipment: Equipment[];
  appointments: Appointment[];
  serviceOrders: ServiceOrder[];
  transactions: Transaction[];
  setActiveTab: (tab: string) => void;
  onEditAppointment: (appt: Appointment) => void;
  onEditOS: (os: ServiceOrder) => void;
  setSelectedOSForSheet: (os: ServiceOrder) => void;
}

export default function DashboardView({
  customers,
  equipment,
  appointments,
  serviceOrders,
  transactions,
  setActiveTab,
  onEditAppointment,
  onEditOS,
  setSelectedOSForSheet
}: DashboardViewProps) {
  
  const activeOSList = serviceOrders.filter(os => os.status === 'in_progress');
  const upcomingAppts = appointments
    .filter(a => a.status === 'scheduled')
    .slice(0, 3); // Get top 3 upcoming

  // Financial summary
  const totalIncomes = transactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);
  const balance = totalIncomes - totalExpenses;

  // Filter service orders that have scheduled preventive maintenance
  const maintenanceReminders = serviceOrders
    .filter(os => os.nextMaintenanceDate)
    .map(os => {
      const client = customers.find(c => c.id === os.customerId);
      const equip = equipment.find(e => e.id === os.equipmentId);
      return {
        os,
        client,
        equip,
      };
    })
    .sort((a, b) => new Date(a.os.nextMaintenanceDate!).getTime() - new Date(b.os.nextMaintenanceDate!).getTime());

  const handleStartAppointment = (appt: Appointment) => {
    onEditAppointment({
      ...appt,
      status: 'in_progress'
    });
  };

  const handleCompleteOS = (os: ServiceOrder) => {
    const updatedOS: ServiceOrder = {
      ...os,
      status: 'completed',
      paymentStatus: 'paid', // Mark as paid for demo ease
      dateClosed: new Date().toISOString().split('T')[0]
    };
    onEditOS(updatedOS);
  };

  return (
    <div className="space-y-6" id="dashboard-view-container">
      {/* Welcome Hero Panel */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
          <Cpu size={250} />
        </div>
        <div className="relative z-10 max-w-xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-100 bg-blue-800/30 px-3 py-1 rounded-full">Painel Central Clima Frio</span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Painel de Operações</h1>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed font-medium">
            Gerenciamento completo de serviços, visitas e finanças para prestadores e técnicos de climatização.
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI: Customers */}
        <div 
          onClick={() => setActiveTab('Clientes')}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition duration-150 cursor-pointer flex items-center justify-between gap-3"
        >
          <div className="space-y-1 min-w-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block truncate">Clientes Ativos</span>
            <span className="text-xl font-bold font-mono text-slate-800 block leading-none">{customers.length}</span>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0">
            <Users size={18} />
          </div>
        </div>

        {/* KPI: Equipment */}
        <div 
          onClick={() => setActiveTab('Equipamentos')}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition duration-150 cursor-pointer flex items-center justify-between gap-3"
        >
          <div className="space-y-1 min-w-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block truncate">Aparelhos</span>
            <span className="text-xl font-bold font-mono text-slate-800 block leading-none">{equipment.length}</span>
          </div>
          <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl shrink-0">
            <Cpu size={18} />
          </div>
        </div>

        {/* KPI: Open Services */}
        <div 
          onClick={() => setActiveTab('Ordem de Serviço')}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition duration-150 cursor-pointer flex items-center justify-between gap-3"
        >
          <div className="space-y-1 min-w-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block truncate">O.S. Em Execução</span>
            <span className="text-xl font-bold font-mono text-slate-800 block leading-none">{activeOSList.length}</span>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl shrink-0">
            <FileText size={18} />
          </div>
        </div>

        {/* KPI: Financial Balance */}
        <div 
          onClick={() => setActiveTab('Financeiro')}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition duration-150 cursor-pointer flex items-center justify-between gap-3"
        >
          <div className="space-y-1 min-w-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block truncate">Saldo de Caixa</span>
            <span className="text-xl font-bold font-mono text-green-600 block leading-none">R$ {balance.toFixed(2)}</span>
          </div>
          <div className="p-2.5 bg-green-50 text-green-600 rounded-xl shrink-0">
            <TrendingUp size={18} />
          </div>
        </div>
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Scheduled Appointments Panel */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Calendar size={16} className="text-blue-500" />
                Próximos Agendamentos
              </h3>
              <p className="text-xs text-slate-400">Próximos serviços a serem realizados em campo</p>
            </div>
            <button
              onClick={() => setActiveTab('Agenda')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
            >
              <span>Ver todos</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-96">
            {upcomingAppts.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Nenhum serviço agendado pendente.
              </div>
            ) : (
              upcomingAppts.map(appt => (
                <div key={appt.id} className="p-3.5 border border-slate-50 rounded-xl bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-100/50 text-blue-700 rounded">
                        {appt.type}
                      </span>
                      <span className="text-slate-400 text-[10px] font-mono flex items-center gap-1">
                        <Clock size={11} /> {appt.startTime}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-xs truncate mt-1">{appt.title}</h4>
                    <p className="text-[11px] text-slate-500 truncate font-semibold">Cliente: {appt.customerName}</p>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      id={`btn-dash-start-appt-${appt.id}`}
                      onClick={() => handleStartAppointment(appt)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[10px] font-semibold transition"
                    >
                      Iniciar Serviço
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active OS List Panel */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <FileText size={16} className="text-amber-500" />
                O.S. Ativas
              </h3>
              <p className="text-xs text-slate-400">Ordens abertas em andamento</p>
            </div>
            <button
              onClick={() => setActiveTab('Ordem de Serviço')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
            >
              <span>Ver todas</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-96">
            {activeOSList.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                <CheckCircle2 size={24} className="text-slate-300" />
                <span>Nenhuma ordem de serviço ativa no momento.</span>
              </div>
            ) : (
              activeOSList.map(os => {
                const client = customers.find(c => c.id === os.customerId);
                return (
                  <div key={os.id} className="p-3 border border-slate-100 rounded-xl space-y-2">
                    <div className="flex justify-between items-start">
                      <span 
                        onClick={() => { setSelectedOSForSheet(os); setActiveTab('Ordem de Serviço'); }}
                        className="font-mono font-bold text-blue-600 hover:underline cursor-pointer text-xs"
                      >
                        {os.id}
                      </span>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-mono">
                        R$ {os.totalValue.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-700 text-xs truncate">Cliente: {client?.name}</p>
                      <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">Motivo: {os.issueReported}</p>
                    </div>

                    <div className="border-t border-slate-50 pt-2 flex justify-end gap-1.5">
                      <button
                        id={`btn-dash-complete-os-${os.id}`}
                        onClick={() => handleCompleteOS(os)}
                        className="px-2.5 py-1 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-[9px] font-bold transition"
                      >
                        Concluir e Faturar
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Central de Pós-Venda e Lembretes de Preventiva */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4" id="pos-venda-panel">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                <Clock size={18} />
              </span>
              Central de Pós-Venda & Preventivas (WhatsApp)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Monitore o período recomendado de higienização do ar condicionado e envie mensagens de lembrete com um clique.
            </p>
          </div>
          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full self-start sm:self-center font-mono">
            {maintenanceReminders.length} Planejados
          </span>
        </div>

        {maintenanceReminders.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs border border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
            Nenhuma manutenção preventiva agendada para o pós-venda. Cadastre um planejamento ao finalizar/criar uma O.S.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {maintenanceReminders.map(({ os, client, equip }) => {
              if (!os.nextMaintenanceDate) return null;
              const dateObj = new Date(os.nextMaintenanceDate + 'T12:00:00');
              const isOverdue = dateObj < new Date();
              const formattedDate = dateObj.toLocaleDateString('pt-BR');

              return (
                <div 
                  key={os.id} 
                  className={`p-4 rounded-2xl border transition duration-150 flex flex-col justify-between gap-4 ${isOverdue ? 'bg-amber-50/30 border-amber-100 hover:border-amber-300' : 'bg-slate-50/50 border-slate-100 hover:border-slate-300'}`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${isOverdue ? 'bg-amber-100 text-amber-800' : 'bg-blue-100/60 text-blue-800'}`}>
                        {isOverdue ? '⚠️ RECOMENDADO / VENCIDO' : '📅 EM BREVE'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono font-bold">OS Ref: {os.id}</span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-800 text-sm truncate">{client?.name || 'Cliente Geral'}</h4>
                      <p className="text-xs text-slate-500 font-medium">Aparelho: <span className="font-semibold text-slate-700">{equip ? `${equip.brand} ${equip.model}` : 'Split'}</span></p>
                      <p className="text-xs text-slate-500 font-medium">Ambiente: <span className="text-slate-700 font-semibold">{equip?.locationRoom || 'Sala'}</span></p>
                    </div>

                    <div className="pt-2 flex items-center gap-1.5 text-xs">
                      <span className="text-slate-400 font-medium">Próxima Visita:</span>
                      <strong className={`font-bold ${isOverdue ? 'text-amber-700' : 'text-blue-800'}`}>
                        {formattedDate}
                      </strong>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {client?.phone || 'Sem telefone'}
                    </span>

                    <button
                      onClick={() => {
                        const message = `Olá ${client?.name || 'Cliente'}, aqui é o técnico da Clima Frio! ❄️

Espero que esteja tudo bem! Passando para avisar que está no período recomendado de *Manutenção Preventiva e Higienização* do seu ar condicionado *${equip?.brand || ''} ${equip?.model || 'Inverter'}* da *${equip?.locationRoom || 'Sala'}*.

Já se passaram cerca de *${os.nextMaintenanceMonths || 6} meses* da última limpeza. Manter o aparelho limpo garante ar saudável para sua família, evita barulhos/vazamentos e economiza até 30% de energia elétrica! 🔋

Podemos agendar uma visita técnica de limpeza rápida para esta semana? Quais dias ficam melhores para você?`;
                        const encodedMessage = encodeURIComponent(message);
                        const cleanPhone = client?.phone ? client.phone.replace(/\D/g, '') : '';
                        let waUrl = `https://web.whatsapp.com/send?text=${encodedMessage}`;
                        if (cleanPhone) {
                          waUrl = `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`;
                        }
                        if (typeof navigator !== 'undefined' && /Android|iPhone|iPad/i.test(navigator.userAgent)) {
                          waUrl = `https://api.whatsapp.com/send?${cleanPhone ? `phone=${cleanPhone}&` : ''}text=${encodedMessage}`;
                        }
                        window.open(waUrl, '_blank');
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-xs"
                    >
                      <span className="shrink-0 font-semibold">Lembrar Cliente</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
