import React, { useState } from 'react';
import { Equipment, Customer, EquipmentType, EquipmentBrand } from '../types';
import { Search, Plus, Cpu, User, Calendar, Settings, Tag, Edit2, Trash2, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EquipmentViewProps {
  equipment: Equipment[];
  customers: Customer[];
  onAddEquipment: (equipment: Omit<Equipment, 'id'>) => void;
  onEditEquipment: (equipment: Equipment) => void;
  onDeleteEquipment: (id: string) => void;
}

const EQUIPMENT_TYPES: EquipmentType[] = [
  'Split High Wall',
  'Cassete',
  'Piso Teto',
  'Janela',
  'Multi-Split',
  'Chiller',
  'Outro'
];

const EQUIPMENT_BRANDS: EquipmentBrand[] = [
  'Daikin',
  'Fujitsu',
  'LG',
  'Samsung',
  'Carrier',
  'Midea',
  'Gree',
  'Consul',
  'Electrolux',
  'Outra'
];

const BTUS_LIST = [9000, 12000, 18000, 24000, 30000, 36000, 48000, 60000];

export default function EquipmentView({
  equipment,
  customers,
  onAddEquipment,
  onEditEquipment,
  onDeleteEquipment
}: EquipmentViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

  // Form States
  const [formId, setFormId] = useState('');
  const [formCustomerId, setFormCustomerId] = useState('');
  const [formType, setFormType] = useState<EquipmentType>('Split High Wall');
  const [formBrand, setFormBrand] = useState<EquipmentBrand>('Daikin');
  const [formCapacityBtu, setFormCapacityBtu] = useState<number>(12000);
  const [formModel, setFormModel] = useState('');
  const [formSerialNumber, setFormSerialNumber] = useState('');
  const [formLocationRoom, setFormLocationRoom] = useState('');
  const [formInstallationDate, setFormInstallationDate] = useState('');
  const [formLastMaintenanceDate, setFormLastMaintenanceDate] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'maintenance' | 'inactive'>('active');

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Cliente não encontrado';
  };

  const filteredEquipment = equipment.filter(eq => {
    const customerName = getCustomerName(eq.customerId).toLowerCase();
    const query = searchQuery.toLowerCase();
    return (
      eq.brand.toLowerCase().includes(query) ||
      eq.model.toLowerCase().includes(query) ||
      eq.serialNumber.toLowerCase().includes(query) ||
      eq.locationRoom.toLowerCase().includes(query) ||
      customerName.includes(query) ||
      eq.type.toLowerCase().includes(query)
    );
  });

  const openAddModal = () => {
    setModalMode('add');
    setFormId('');
    setFormCustomerId(customers[0]?.id || '');
    setFormType('Split High Wall');
    setFormBrand('Daikin');
    setFormCapacityBtu(12000);
    setFormModel('');
    setFormSerialNumber('');
    setFormLocationRoom('');
    setFormInstallationDate(new Date().toISOString().split('T')[0]);
    setFormLastMaintenanceDate('');
    setFormNotes('');
    setFormStatus('active');
    setIsModalOpen(true);
  };

  const openEditModal = (eq: Equipment) => {
    setModalMode('edit');
    setFormId(eq.id);
    setFormCustomerId(eq.customerId);
    setFormType(eq.type);
    setFormBrand(eq.brand);
    setFormCapacityBtu(eq.capacityBtu);
    setFormModel(eq.model);
    setFormSerialNumber(eq.serialNumber);
    setFormLocationRoom(eq.locationRoom);
    setFormInstallationDate(eq.installationDate || '');
    setFormLastMaintenanceDate(eq.lastMaintenanceDate || '');
    setFormNotes(eq.notes || '');
    setFormStatus(eq.status);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCustomerId || !formModel || !formSerialNumber) return;

    const equipmentData = {
      customerId: formCustomerId,
      type: formType,
      brand: formBrand,
      capacityBtu: formCapacityBtu,
      model: formModel,
      serialNumber: formSerialNumber,
      locationRoom: formLocationRoom,
      installationDate: formInstallationDate || undefined,
      lastMaintenanceDate: formLastMaintenanceDate || undefined,
      notes: formNotes || undefined,
      status: formStatus
    };

    if (modalMode === 'add') {
      onAddEquipment(equipmentData);
    } else {
      onEditEquipment({
        ...equipmentData,
        id: formId
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja realmente excluir este equipamento? Esta ação não pode ser desfeita.')) {
      onDeleteEquipment(id);
    }
  };

  return (
    <div className="space-y-6" id="equipment-view-container">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Equipamentos (Ar Condicionado)</h1>
          <p className="text-sm text-slate-500">Controle os aparelhos de climatização instalados nos clientes</p>
        </div>
        <button
          id="btn-add-equipment"
          onClick={openAddModal}
          disabled={customers.length === 0}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={20} />
          <span>Cadastrar Equipamento</span>
        </button>
      </div>

      {customers.length === 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm flex gap-3">
          <AlertCircle className="shrink-0 text-amber-600" />
          <div>
            <p className="font-semibold">Nenhum cliente cadastrado!</p>
            <p className="mt-0.5">Você precisa cadastrar pelo menos um cliente antes de poder adicionar equipamentos.</p>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            id="equipment-search-input"
            type="text"
            placeholder="Buscar por marca, modelo, série, cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
          />
        </div>
        <div className="text-xs text-slate-400 font-medium self-end md:self-center shrink-0">
          Mostrando {filteredEquipment.length} de {equipment.length} equipamentos
        </div>
      </div>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEquipment.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <Cpu className="mx-auto mb-3 text-slate-300" size={32} />
            <p className="text-sm font-medium">Nenhum equipamento cadastrado ou encontrado.</p>
          </div>
        ) : (
          filteredEquipment.map(eq => {
            const customerName = getCustomerName(eq.customerId);
            return (
              <div
                id={`equipment-card-${eq.id}`}
                key={eq.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition duration-200 p-5 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-blue-50 text-blue-700">
                      {eq.type}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${eq.status === 'active' ? 'bg-green-50 text-green-700' : eq.status === 'maintenance' ? 'bg-yellow-50 text-yellow-700' : 'bg-slate-100 text-slate-600'}`}>
                      {eq.status === 'active' ? '● Ativo' : eq.status === 'maintenance' ? '🔧 Em Manutenção' : '● Inativo'}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-800 text-base mt-3">{eq.brand} <span className="font-medium text-slate-500 text-sm">{eq.capacityBtu.toLocaleString()} BTU</span></h3>
                  <p className="text-xs text-slate-500 mt-1">Modelo: <span className="font-medium text-slate-700">{eq.model}</span></p>
                  <p className="text-xs text-slate-500 font-mono">Série: {eq.serialNumber}</p>

                  <div className="mt-4 space-y-2 border-t border-slate-50 pt-3">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <User size={14} className="text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-800 truncate">{customerName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Tag size={14} className="text-slate-400 shrink-0" />
                      <span>Local: <span className="text-slate-700 font-medium">{eq.locationRoom}</span></span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-50 pt-3 flex items-center justify-between">
                  <div className="space-y-1">
                    {eq.lastMaintenanceDate && (
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Calendar size={12} />
                        <span>Manut: {new Date(eq.lastMaintenanceDate).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                    {eq.installationDate && (
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Settings size={12} />
                        <span>Instalado: {new Date(eq.installationDate).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-1.5 shrink-0">
                    <button
                      id={`btn-edit-equipment-${eq.id}`}
                      onClick={() => openEditModal(eq)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition"
                      title="Editar Aparelho"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      id={`btn-delete-equipment-${eq.id}`}
                      onClick={() => handleDelete(eq.id)}
                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-50 rounded-lg transition"
                      title="Excluir Aparelho"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal - Register/Edit Equipment */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="equipment-modal-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-xl w-full max-h-[90vh] overflow-y-auto"
              id="equipment-modal-content"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
                <h3 className="font-bold text-slate-800 text-lg">
                  {modalMode === 'add' ? 'Cadastrar Equipamento' : 'Editar Equipamento'}
                </h3>
                <button
                  id="btn-close-equipment-modal"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-5">
                {/* Customer Link */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Cliente Responsável *</label>
                  <select
                    id="form-equipment-customer"
                    required
                    value={formCustomerId}
                    onChange={(e) => setFormCustomerId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white"
                  >
                    <option value="" disabled>Selecione um cliente...</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                    ))}
                  </select>
                </div>

                {/* Grid info: Type & Brand */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Tipo de Aparelho *</label>
                    <select
                      id="form-equipment-type"
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as EquipmentType)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white"
                    >
                      {EQUIPMENT_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Marca do Fabricante *</label>
                    <select
                      id="form-equipment-brand"
                      value={formBrand}
                      onChange={(e) => setFormBrand(e.target.value as EquipmentBrand)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white"
                    >
                      {EQUIPMENT_BRANDS.map(brand => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Capacity & Model */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Capacidade (BTUs) *</label>
                    <select
                      id="form-equipment-capacity"
                      value={formCapacityBtu}
                      onChange={(e) => setFormCapacityBtu(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white"
                    >
                      {BTUS_LIST.map(btu => (
                        <option key={btu} value={btu}>{btu.toLocaleString()} BTUs</option>
                      ))}
                      <option value={100000}>Outro / Comercial de alta potência</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Modelo Comercial *</label>
                    <input
                      id="form-equipment-model"
                      type="text"
                      required
                      value={formModel}
                      onChange={(e) => setFormModel(e.target.value)}
                      placeholder="Ex: Windfree Inverter 12k"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>

                {/* Serial Number & Room Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Número de Série *</label>
                    <input
                      id="form-equipment-serial"
                      type="text"
                      required
                      value={formSerialNumber}
                      onChange={(e) => setFormSerialNumber(e.target.value)}
                      placeholder="Ex: SN-1293847-XYZ"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Local de Instalação (Cômodo) *</label>
                    <input
                      id="form-equipment-room"
                      type="text"
                      required
                      value={formLocationRoom}
                      onChange={(e) => setFormLocationRoom(e.target.value)}
                      placeholder="Ex: Recepção, Suíte Casal, Sala"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>

                {/* Dates & Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Instalação</label>
                    <input
                      id="form-equipment-installation-date"
                      type="date"
                      value={formInstallationDate}
                      onChange={(e) => setFormInstallationDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Última Manut.</label>
                    <input
                      id="form-equipment-maintenance-date"
                      type="date"
                      value={formLastMaintenanceDate}
                      onChange={(e) => setFormLastMaintenanceDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Status Operacional *</label>
                    <select
                      id="form-equipment-status"
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as 'active' | 'maintenance' | 'inactive')}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white font-medium"
                    >
                      <option value="active" className="text-green-600">● Ativo / Ok</option>
                      <option value="maintenance" className="text-yellow-600">🔧 Em Manutenção</option>
                      <option value="inactive" className="text-slate-600">● Inativo</option>
                    </select>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Observações Técnicas</label>
                  <textarea
                    id="form-equipment-notes"
                    rows={3}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Histórico de problemas, detalhes da fiação ou carga de gás específica..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    id="btn-cancel-equipment"
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 font-medium rounded-lg text-sm hover:bg-slate-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    id="btn-save-equipment"
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg text-sm hover:bg-blue-700 transition shadow-sm"
                  >
                    Salvar Equipamento
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
