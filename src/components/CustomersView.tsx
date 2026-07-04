import React, { useState } from 'react';
import { Customer, Equipment, ServiceOrder } from '../types';
import { Search, Plus, User, Mail, Phone, MapPin, FileText, ChevronRight, Edit2, Trash2, X, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CustomersViewProps {
  customers: Customer[];
  equipment: Equipment[];
  serviceOrders: ServiceOrder[];
  onAddCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
}

export default function CustomersView({
  customers,
  equipment,
  serviceOrders,
  onAddCustomer,
  onEditCustomer,
  onDeleteCustomer
}: CustomersViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  
  // Form States
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formCpfCnpj, setFormCpfCnpj] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formStreet, setFormStreet] = useState('');
  const [formNumber, setFormNumber] = useState('');
  const [formComplement, setFormComplement] = useState('');
  const [formNeighborhood, setFormNeighborhood] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formState, setFormState] = useState('SP');
  const [formCep, setFormCep] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Search filter
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery) ||
    c.cpfCnpj.includes(searchQuery)
  );

  const openAddModal = () => {
    setModalMode('add');
    setFormId('');
    setFormName('');
    setFormCpfCnpj('');
    setFormEmail('');
    setFormPhone('');
    setFormStreet('');
    setFormNumber('');
    setFormComplement('');
    setFormNeighborhood('');
    setFormCity('');
    setFormState('SP');
    setFormCep('');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (c: Customer, e: React.MouseEvent) => {
    e.stopPropagation();
    setModalMode('edit');
    setFormId(c.id);
    setFormName(c.name);
    setFormCpfCnpj(c.cpfCnpj);
    setFormEmail(c.email);
    setFormPhone(c.phone);
    setFormStreet(c.address.street);
    setFormNumber(c.address.number);
    setFormComplement(c.address.complement || '');
    setFormNeighborhood(c.address.neighborhood);
    setFormCity(c.address.city);
    setFormState(c.address.state);
    setFormCep(c.address.cep);
    setFormNotes(c.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPhone || !formEmail) return;

    const customerData = {
      name: formName,
      cpfCnpj: formCpfCnpj,
      email: formEmail,
      phone: formPhone,
      address: {
        street: formStreet,
        number: formNumber,
        complement: formComplement || undefined,
        neighborhood: formNeighborhood,
        city: formCity,
        state: formState,
        cep: formCep
      },
      notes: formNotes || undefined
    };

    if (modalMode === 'add') {
      onAddCustomer(customerData);
    } else {
      onEditCustomer({
        ...customerData,
        id: formId,
        createdAt: customers.find(c => c.id === formId)?.createdAt || new Date().toISOString()
      });
      // Update selected customer if edited
      if (selectedCustomer?.id === formId) {
        setSelectedCustomer({
          ...customerData,
          id: formId,
          createdAt: customers.find(c => c.id === formId)?.createdAt || new Date().toISOString()
        });
      }
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Deseja realmente excluir este cliente? Todos os equipamentos associados perderão o vínculo.')) {
      onDeleteCustomer(id);
      if (selectedCustomer?.id === id) {
        setSelectedCustomer(null);
      }
    }
  };

  // Get equipment and service orders for a customer
  const getCustomerEquipment = (customerId: string) => 
    equipment.filter(eq => eq.customerId === customerId);

  const getCustomerOrders = (customerId: string) => 
    serviceOrders.filter(so => so.customerId === customerId);

  return (
    <div className="space-y-6" id="customers-view-container">
      {/* Header section with search and add button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Clientes</h1>
          <p className="text-sm text-slate-500">Gerencie a base de clientes atendidos pela Clima Frio</p>
        </div>
        <button
          id="btn-add-customer"
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition duration-200 shadow-sm"
        >
          <Plus size={20} />
          <span>Novo Cliente</span>
        </button>
      </div>

      {/* Main split grid or single view depending on whether a customer is selected */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customers List Column */}
        <div className={`lg:col-span-1 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[650px] ${selectedCustomer ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                id="customer-search-input"
                type="text"
                placeholder="Buscar cliente, email, telefone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
            {filteredCustomers.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                Nenhum cliente encontrado.
              </div>
            ) : (
              filteredCustomers.map(c => {
                const customerEquips = getCustomerEquipment(c.id);
                return (
                  <div
                    id={`customer-item-${c.id}`}
                    key={c.id}
                    onClick={() => setSelectedCustomer(c)}
                    className={`p-4 cursor-pointer transition duration-150 flex items-center justify-between gap-3 ${selectedCustomer?.id === c.id ? 'bg-blue-50/50 border-r-4 border-blue-600' : 'hover:bg-slate-50'}`}
                  >
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-800 text-sm truncate">{c.name}</h3>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{c.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
                          {c.phone}
                        </span>
                        <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                          {customerEquips.length} {customerEquips.length === 1 ? 'Equipamento' : 'Equipamentos'}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-400 shrink-0" />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Customer Details Column */}
        <div className={`lg:col-span-2 ${selectedCustomer ? 'block' : 'hidden lg:flex lg:items-center lg:justify-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-400'}`}>
          {selectedCustomer ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6 h-[650px] overflow-y-auto flex flex-col justify-between">
              <div>
                {/* Back button for mobile */}
                <button
                  id="btn-back-to-list"
                  onClick={() => setSelectedCustomer(null)}
                  className="lg:hidden flex items-center gap-1 text-blue-600 font-medium text-sm mb-4"
                >
                  &larr; Voltar para Lista
                </button>

                {/* Profile Header */}
                <div className="flex items-start justify-between gap-4 pb-6 border-b border-slate-100">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                      <User size={24} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-800">{selectedCustomer.name}</h2>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">CPF/CNPJ: {selectedCustomer.cpfCnpj || 'Não cadastrado'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      id={`btn-edit-customer-${selectedCustomer.id}`}
                      onClick={(e) => openEditModal(selectedCustomer, e)}
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition"
                      title="Editar Cliente"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      id={`btn-delete-customer-${selectedCustomer.id}`}
                      onClick={(e) => handleDelete(selectedCustomer.id, e)}
                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-slate-50 rounded-lg transition"
                      title="Excluir Cliente"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Grid info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                  {/* Contact Info */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Contato</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2.5 text-sm text-slate-600">
                        <Mail size={16} className="text-slate-400 shrink-0" />
                        <span className="truncate">{selectedCustomer.email}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-sm text-slate-600">
                        <Phone size={16} className="text-slate-400 shrink-0" />
                        <span>{selectedCustomer.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Address Info */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Endereço de Atendimento</h3>
                    <div className="flex items-start gap-2.5 text-sm text-slate-600">
                      <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <p>{selectedCustomer.address.street}, {selectedCustomer.address.number}</p>
                        {selectedCustomer.address.complement && <p className="text-xs text-slate-500">{selectedCustomer.address.complement}</p>}
                        <p className="text-xs text-slate-500">{selectedCustomer.address.neighborhood} - {selectedCustomer.address.city}/{selectedCustomer.address.state}</p>
                        <p className="text-xs text-slate-500 font-mono">CEP: {selectedCustomer.address.cep}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes section if any */}
                {selectedCustomer.notes && (
                  <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <h4 className="text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                      <FileText size={14} className="text-slate-500" />
                      Observações Internas
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{selectedCustomer.notes}</p>
                  </div>
                )}

                {/* Equipment & OS tabs */}
                <div className="mt-8 space-y-6">
                  {/* Associated Equipment */}
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                      Equipamentos ({getCustomerEquipment(selectedCustomer.id).length})
                    </h3>
                    {getCustomerEquipment(selectedCustomer.id).length === 0 ? (
                      <p className="text-xs text-slate-400 py-2 border border-dashed border-slate-200 rounded-xl text-center">
                        Nenhum equipamento cadastrado para este cliente.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {getCustomerEquipment(selectedCustomer.id).map(eq => (
                          <div key={eq.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50">
                            <div className="flex justify-between items-start">
                              <span className="text-xs font-semibold text-slate-700">{eq.brand} - {eq.type}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full ${eq.status === 'active' ? 'bg-green-50 text-green-700' : eq.status === 'maintenance' ? 'bg-yellow-50 text-yellow-700' : 'bg-slate-100 text-slate-600'}`}>
                                {eq.status === 'active' ? 'Ativo' : eq.status === 'maintenance' ? 'Manutenção' : 'Inativo'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1 font-mono">{eq.capacityBtu.toLocaleString()} BTUs • Mod: {eq.model}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Loc: {eq.locationRoom}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Service Order history */}
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                      Histórico de Ordens de Serviço ({getCustomerOrders(selectedCustomer.id).length})
                    </h3>
                    {getCustomerOrders(selectedCustomer.id).length === 0 ? (
                      <p className="text-xs text-slate-400 py-2 border border-dashed border-slate-200 rounded-xl text-center">
                        Nenhuma ordem de serviço cadastrada para este cliente.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {getCustomerOrders(selectedCustomer.id).map(so => (
                          <div key={so.id} className="flex items-center justify-between p-2.5 border border-slate-100 rounded-xl text-xs hover:bg-slate-50">
                            <div>
                              <span className="font-mono font-bold text-slate-700">{so.id}</span>
                              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{so.issueReported}</p>
                            </div>
                            <div className="text-right">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full ${so.status === 'completed' ? 'bg-green-50 text-green-700' : so.status === 'in_progress' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                                {so.status === 'completed' ? 'Concluída' : so.status === 'in_progress' ? 'Em Progresso' : so.status === 'cancelled' ? 'Cancelada' : 'Aprovada'}
                              </span>
                              <p className="text-[11px] font-bold text-slate-700 mt-1 font-mono">R$ {so.totalValue.toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 border-t border-slate-100 pt-4 mt-4 font-mono">
                Cliente desde: {new Date(selectedCustomer.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
          ) : (
            <div>
              <ShieldAlert className="mx-auto mb-3 text-slate-300" size={36} />
              <p className="text-sm font-medium text-slate-500">Selecione um cliente para visualizar os detalhes</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal - Register or Edit Customer */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="customer-modal-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              id="customer-modal-content"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
                <h3 className="font-bold text-slate-800 text-lg">
                  {modalMode === 'add' ? 'Cadastrar Novo Cliente' : 'Editar Dados do Cliente'}
                </h3>
                <button
                  id="btn-close-customer-modal"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-6">
                {/* Basic Section */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600">Informações Básicas</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Nome Completo / Razão Social *</label>
                      <input
                        id="form-customer-name"
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="Ex: Ana Silva Santos ou Ar Condicionado Ltda"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">CPF / CNPJ</label>
                      <input
                        id="form-customer-cpf"
                        type="text"
                        value={formCpfCnpj}
                        onChange={(e) => setFormCpfCnpj(e.target.value)}
                        placeholder="Ex: 123.456.789-00 ou 12.345.678/0001-00"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">E-mail *</label>
                      <input
                        id="form-customer-email"
                        type="email"
                        required
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        placeholder="Ex: contato@email.com"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Telefone / WhatsApp *</label>
                      <input
                        id="form-customer-phone"
                        type="text"
                        required
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        placeholder="Ex: (11) 99999-9999"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Address Section */}
                <div className="space-y-4 pt-4 border-t border-slate-50">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600">Endereço de Atendimento</h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-600 mb-1">Logradouro / Rua *</label>
                      <input
                        id="form-customer-street"
                        type="text"
                        required
                        value={formStreet}
                        onChange={(e) => setFormStreet(e.target.value)}
                        placeholder="Ex: Rua das Flores"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Número *</label>
                      <input
                        id="form-customer-number"
                        type="text"
                        required
                        value={formNumber}
                        onChange={(e) => setFormNumber(e.target.value)}
                        placeholder="Ex: 123"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Complemento / Bloco</label>
                      <input
                        id="form-customer-complement"
                        type="text"
                        value={formComplement}
                        onChange={(e) => setFormComplement(e.target.value)}
                        placeholder="Ex: Apt 45, Bloco B"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Bairro *</label>
                      <input
                        id="form-customer-neighborhood"
                        type="text"
                        required
                        value={formNeighborhood}
                        onChange={(e) => setFormNeighborhood(e.target.value)}
                        placeholder="Ex: Centro"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-600 mb-1">Cidade *</label>
                      <input
                        id="form-customer-city"
                        type="text"
                        required
                        value={formCity}
                        onChange={(e) => setFormCity(e.target.value)}
                        placeholder="Ex: São Paulo"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Estado *</label>
                      <select
                        id="form-customer-state"
                        value={formState}
                        onChange={(e) => setFormState(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white"
                      >
                        {['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'].map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">CEP *</label>
                    <input
                      id="form-customer-cep"
                      type="text"
                      required
                      value={formCep}
                      onChange={(e) => setFormCep(e.target.value)}
                      placeholder="Ex: 01000-000"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-mono"
                    />
                  </div>
                </div>

                {/* Notes Section */}
                <div className="space-y-4 pt-4 border-t border-slate-50">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600">Observações</h4>
                  <div>
                    <textarea
                      id="form-customer-notes"
                      rows={3}
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      placeholder="Alguma observação, restrição de horário ou detalhe especial sobre o cliente..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    id="btn-cancel-customer"
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 font-medium rounded-lg text-sm hover:bg-slate-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    id="btn-save-customer"
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg text-sm hover:bg-blue-700 transition shadow-sm"
                  >
                    Salvar Cliente
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
