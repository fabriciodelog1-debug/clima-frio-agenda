import React, { useState } from 'react';
import { Appointment, Customer, ServiceType, AppointmentStatus } from '../types';
import { Plus, Search, Calendar, Clock, User, CheckCircle2, AlertTriangle, FileSpreadsheet, X, Trash2, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ScheduleViewProps {
  appointments: Appointment[];
  customers: Customer[];
  onAddAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  onEditAppointment: (appointment: Appointment) => void;
  onDeleteAppointment: (id: string) => void;
  onGenerateOSFromAppointment: (appt: Appointment) => void;
}

const SERVICE_TYPES: ServiceType[] = [
  'Instalação',
  'Manutenção Preventiva',
  'Manutenção Corretiva',
  'Orçamento',
  'Visita Técnica'
];

export default function ScheduleView({
  appointments,
  customers,
  onAddAppointment,
  onEditAppointment,
  onDeleteAppointment,
  onGenerateOSFromAppointment
}: ScheduleViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

  // Form States
  const [formId, setFormId] = useState('');
  const [formCustomerId, setFormCustomerId] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<ServiceType>('Visita Técnica');
  const [formDate, setFormDate] = useState('');
  const [formStartTime, setFormStartTime] = useState('');
  const [formEndTime, setFormEndTime] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formStatus, setFormStatus] = useState<AppointmentStatus>('scheduled');

  const filteredAppointments = appointments.filter(appt => {
    const matchesSearch = 
      appt.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (appt.notes && appt.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      appt.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' ? true : appt.status === statusFilter;

    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    // Sort by Date, then by start time
    const dateTimeA = `${a.date}T${a.startTime}`;
    const dateTimeB = `${b.date}T${b.startTime}`;
    return dateTimeA.localeCompare(dateTimeB);
  });

  const getCustomerName = (id: string) => {
    return customers.find(c => c.id === id)?.name || '';
  };

  const openAddModal = () => {
    setModalMode('add');
    setFormId('');
    setFormCustomerId(customers[0]?.id || '');
    setFormTitle('');
    setFormType('Visita Técnica');
    const todayStr = new Date().toISOString().split('T')[0];
    setFormDate(todayStr);
    setFormStartTime('09:00');
    setFormEndTime('10:30');
    setFormNotes('');
    setFormStatus('scheduled');
    setIsModalOpen(true);
  };

  const openEditModal = (appt: Appointment) => {
    setModalMode('edit');
    setFormId(appt.id);
    setFormCustomerId(appt.customerId);
    setFormTitle(appt.title);
    setFormType(appt.type);
    setFormDate(appt.date);
    setFormStartTime(appt.startTime);
    setFormEndTime(appt.endTime);
    setFormNotes(appt.notes || '');
    setFormStatus(appt.status);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCustomerId || !formTitle || !formDate || !formStartTime || !formEndTime) return;

    const customerName = getCustomerName(formCustomerId);

    const appointmentData = {
      customerId: formCustomerId,
      customerName,
      title: formTitle,
      type: formType,
      date: formDate,
      startTime: formStartTime,
      endTime: formEndTime,
      notes: formNotes || undefined,
      status: formStatus
    };

    if (modalMode === 'add') {
      onAddAppointment(appointmentData);
    } else {
      onEditAppointment({
        ...appointmentData,
        id: formId
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja realmente remover este agendamento?')) {
      onDeleteAppointment(id);
    }
  };

  const getStatusStyle = (status: AppointmentStatus) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'in_progress':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'completed':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border border-red-200';
    }
  };

  const getStatusText = (status: AppointmentStatus) => {
    switch (status) {
      case 'scheduled': return 'Agendado';
      case 'in_progress': return 'Em Atendimento';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
    }
  };

  // Grouping appointments by Date to display a nice timeline
  const groupedAppointments: { [key: string]: Appointment[] } = {};
  filteredAppointments.forEach(appt => {
    if (!groupedAppointments[appt.date]) {
      groupedAppointments[appt.date] = [];
    }
    groupedAppointments[appt.date].push(appt);
  });

  const getFriendlyDate = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    
    if (dateStr === today) return 'Hoje';
    if (dateStr === tomorrow) return 'Amanhã';

    const parts = dateStr.split('-');
    const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return dateObj.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  return (
    <div className="space-y-6" id="schedule-view-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Agenda de Atendimento</h1>
          <p className="text-sm text-slate-500">Acompanhe as visitas e serviços técnicos marcados</p>
        </div>
        <button
          id="btn-add-appointment"
          onClick={openAddModal}
          disabled={customers.length === 0}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition duration-200 shadow-sm disabled:opacity-50"
        >
          <Plus size={20} />
          <span>Novo Agendamento</span>
        </button>
      </div>

      {customers.length === 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm flex gap-3">
          <AlertTriangle className="shrink-0 text-amber-600" />
          <div>
            <p className="font-semibold">Nenhum cliente cadastrado!</p>
            <p className="mt-0.5">Cadastre um cliente antes de agendar uma visita técnica.</p>
          </div>
        </div>
      )}

      {/* Filters bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            id="schedule-search-input"
            type="text"
            placeholder="Buscar por cliente, título ou serviço..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto shrink-0 pb-1 md:pb-0">
          {[
            { value: 'all', label: 'Todos' },
            { value: 'scheduled', label: 'Agendados' },
            { value: 'in_progress', label: 'Em Rota' },
            { value: 'completed', label: 'Concluídos' },
            { value: 'cancelled', label: 'Cancelados' }
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 ${statusFilter === opt.value ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Layout */}
      <div className="space-y-8">
        {Object.keys(groupedAppointments).length === 0 ? (
          <div className="py-16 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <Calendar className="mx-auto mb-3 text-slate-300" size={32} />
            <p className="text-sm font-medium">Nenhum compromisso agendado para o filtro selecionado.</p>
          </div>
        ) : (
          Object.keys(groupedAppointments).map(date => (
            <div key={date} className="space-y-4" id={`timeline-group-${date}`}>
              {/* Date Header */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-800 uppercase tracking-wider min-w-[100px] border-r-2 border-slate-200 pr-3 text-right">
                  {getFriendlyDate(date)}
                </span>
                <span className="text-xs text-slate-400 font-medium font-mono">
                  {new Date(date + 'T12:00:00').toLocaleDateString('pt-BR')}
                </span>
              </div>

              {/* Day's appointments */}
              <div className="pl-0 md:pl-28 grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupedAppointments[date].map(appt => (
                  <div
                    id={`appt-card-${appt.id}`}
                    key={appt.id}
                    className="bg-white rounded-xl border border-slate-100 shadow-xs hover:shadow-md transition duration-200 p-4 space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      {/* Header with times & status */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium font-mono">
                          <Clock size={13} className="text-blue-500" />
                          <span>{appt.startTime} - {appt.endTime}</span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getStatusStyle(appt.status)}`}>
                          {getStatusText(appt.status)}
                        </span>
                      </div>

                      {/* Content */}
                      <h3 className="font-bold text-slate-800 text-sm mt-2">{appt.title}</h3>
                      <p className="text-[11px] uppercase font-bold tracking-wider text-blue-600 mt-1">{appt.type}</p>
                      
                      <div className="flex items-center gap-2 mt-3 text-xs text-slate-700 font-medium">
                        <User size={13} className="text-slate-400 shrink-0" />
                        <span className="truncate">{appt.customerName}</span>
                      </div>

                      {appt.notes && (
                        <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-2 rounded border border-slate-100/50 italic">
                          "{appt.notes}"
                        </p>
                      )}
                    </div>

                    {/* Actions footer */}
                    <div className="border-t border-slate-50 pt-2.5 mt-2 flex items-center justify-between gap-2">
                      <div className="flex gap-2">
                        {appt.status !== 'completed' && appt.status !== 'cancelled' && (
                          <button
                            id={`btn-generate-os-${appt.id}`}
                            onClick={() => onGenerateOSFromAppointment(appt)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold rounded-lg text-[10px] transition"
                            title="Gerar Ordem de Serviço"
                          >
                            <FileSpreadsheet size={12} />
                            <span>Abrir OS</span>
                          </button>
                        )}
                      </div>

                      <div className="flex gap-1 shrink-0">
                        <button
                          id={`btn-edit-appt-${appt.id}`}
                          onClick={() => openEditModal(appt)}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded transition"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          id={`btn-delete-appt-${appt.id}`}
                          onClick={() => handleDelete(appt.id)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-slate-50 rounded transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal - Appointment Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="appt-modal-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full max-h-[90vh] overflow-y-auto"
              id="appt-modal-content"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
                <h3 className="font-bold text-slate-800 text-lg">
                  {modalMode === 'add' ? 'Novo Agendamento de Serviço' : 'Editar Compromisso'}
                </h3>
                <button
                  id="btn-close-appt-modal"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {/* Customer selection */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Cliente Solicitante *</label>
                  <select
                    id="form-appt-customer"
                    required
                    value={formCustomerId}
                    onChange={(e) => setFormCustomerId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white"
                  >
                    <option value="" disabled>Selecione um cliente...</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Título do Serviço / Resumo *</label>
                  <input
                    id="form-appt-title"
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Ex: Instalação de Split Inverter ou Limpeza Química"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                  />
                </div>

                {/* Type and Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Tipo de Serviço *</label>
                    <select
                      id="form-appt-type"
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as ServiceType)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white"
                    >
                      {SERVICE_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Status do Agendamento *</label>
                    <select
                      id="form-appt-status"
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as AppointmentStatus)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white font-medium"
                    >
                      <option value="scheduled" className="text-blue-600">Agendado</option>
                      <option value="in_progress" className="text-yellow-600">Em Atendimento</option>
                      <option value="completed" className="text-green-600">Concluído</option>
                      <option value="cancelled" className="text-red-600">Cancelado</option>
                    </select>
                  </div>
                </div>

                {/* Date & Times */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Data *</label>
                    <input
                      id="form-appt-date"
                      type="date"
                      required
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Hora Início *</label>
                    <input
                      id="form-appt-start-time"
                      type="time"
                      required
                      value={formStartTime}
                      onChange={(e) => setFormStartTime(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Hora Fim *</label>
                    <input
                      id="form-appt-end-time"
                      type="time"
                      required
                      value={formEndTime}
                      onChange={(e) => setFormEndTime(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Instruções ou Observações para o Técnico</label>
                  <textarea
                    id="form-appt-notes"
                    rows={3}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Ex: Levar escada grande e tubo isolante de 3/8. Retirar chave na portaria."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    id="btn-cancel-appt"
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 font-medium rounded-lg text-sm hover:bg-slate-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    id="btn-save-appt"
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg text-sm hover:bg-blue-700 transition shadow-sm"
                  >
                    Confirmar Agendamento
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
