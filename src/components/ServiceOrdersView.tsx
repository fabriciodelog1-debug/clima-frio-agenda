import React, { useState } from 'react';
import { ServiceOrder, Customer, Equipment, OSStatus, OSChecklist } from '../types';
import { Search, Plus, FileText, CheckSquare, Square, DollarSign, Printer, Calendar, ShieldCheck, X, Edit2, AlertCircle, Upload, Camera, Image, Share2, FileDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateOSPDF, getWhatsAppShareText } from '../utils/pdfGenerator';

interface ServiceOrdersViewProps {
  serviceOrders: ServiceOrder[];
  customers: Customer[];
  equipment: Equipment[];
  onAddOS: (os: Omit<ServiceOrder, 'id'>) => void;
  onEditOS: (os: ServiceOrder) => void;
  onDeleteOS: (id: string) => void;
  activeOSForCreation?: { customerId: string; title: string; type: string } | null;
  onClearActiveOSCreation?: () => void;
  onAddCustomer?: (customer: Omit<Customer, 'id' | 'createdAt'>) => Customer;
  onAddEquipment?: (eq: Omit<Equipment, 'id'>) => Equipment;
}

const CHECKLIST_LABELS: { [key in keyof OSChecklist]: string } = {
  cleanEvaporator: 'Higienização da Evaporadora',
  cleanCondenser: 'Limpeza da Condensadora',
  checkGasPressure: 'Verificação da Pressão do Gás',
  checkElectrical: 'Aperto de Contatos Elétricos',
  checkDrainage: 'Teste do Drenagem e Vazamentos',
  testRemote: 'Teste de Controle e Funções',
  sanitizeUnit: 'Sanitização Química e Bactericida'
};

export default function ServiceOrdersView({
  serviceOrders,
  customers,
  equipment,
  onAddOS,
  onEditOS,
  onDeleteOS,
  activeOSForCreation,
  onClearActiveOSCreation,
  onAddCustomer,
  onAddEquipment
}: ServiceOrdersViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOS, setSelectedOS] = useState<ServiceOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [isPrintPreview, setIsPrintPreview] = useState(false);

  const companyProfileStored = typeof window !== 'undefined' ? localStorage.getItem('climafrio_company_profile') : null;
  const companyProfile = companyProfileStored ? JSON.parse(companyProfileStored) : null;

  // Form States
  const [formId, setFormId] = useState('');
  const [formCustomerId, setFormCustomerId] = useState('');
  const [formEquipmentId, setFormEquipmentId] = useState('');
  const [formStatus, setFormStatus] = useState<OSStatus>('draft');
  const [formIssueReported, setFormIssueReported] = useState('');
  const [formServicePerformed, setFormServicePerformed] = useState('');
  const [formLaborValue, setFormLaborValue] = useState<number>(0);
  const [formPartsValue, setFormPartsValue] = useState<number>(0);
  const [formPaymentStatus, setFormPaymentStatus] = useState<'pending' | 'paid'>('pending');
  const [formNextMaintenanceMonths, setFormNextMaintenanceMonths] = useState<number>(0);
  const [formChecklist, setFormChecklist] = useState<OSChecklist>({
    cleanEvaporator: false,
    cleanCondenser: false,
    checkGasPressure: false,
    checkElectrical: false,
    checkDrainage: false,
    testRemote: false,
    sanitizeUnit: false
  });
  const [formNotes, setFormNotes] = useState('');
  const [formPhotoUrl, setFormPhotoUrl] = useState('');
  const [formPhotoDescription, setFormPhotoDescription] = useState('');

  // Custom Customer States
  const [isCustomCustomer, setIsCustomCustomer] = useState<boolean>(false);
  const [customCustomerName, setCustomCustomerName] = useState<string>('');
  const [customCustomerPhone, setCustomCustomerPhone] = useState<string>('');
  const [customEquipBrand, setCustomEquipBrand] = useState<string>('LG');
  const [customEquipType, setCustomEquipType] = useState<string>('Split High Wall');
  const [customEquipCapacity, setCustomEquipCapacity] = useState<number>(12000);
  const [customEquipModel, setCustomEquipModel] = useState<string>('Inverter');
  const [customEquipLocation, setCustomEquipLocation] = useState<string>('Sala');

  // WhatsApp Guidance Modal States
  const [isWhatsAppGuideOpen, setIsWhatsAppGuideOpen] = useState<boolean>(false);
  const [whatsAppGuideUrl, setWhatsAppGuideUrl] = useState<string>('');
  const [whatsAppGuideFileName, setWhatsAppGuideFileName] = useState<string>('');

  // Handle pre-fill from agenda if trigger exists
  React.useEffect(() => {
    if (activeOSForCreation) {
      setModalMode('add');
      setFormCustomerId(activeOSForCreation.customerId);
      // Select first equipment of this customer
      const custEquips = equipment.filter(e => e.customerId === activeOSForCreation.customerId);
      setFormEquipmentId(custEquips[0]?.id || '');
      setFormStatus('in_progress');
      setFormIssueReported(activeOSForCreation.title);
      setFormServicePerformed('');
      setFormLaborValue(150);
      setFormPartsValue(0);
      setFormPaymentStatus('pending');
      setFormChecklist({
        cleanEvaporator: false,
        cleanCondenser: false,
        checkGasPressure: false,
        checkElectrical: false,
        checkDrainage: false,
        testRemote: false,
        sanitizeUnit: false
      });
      setFormNotes('');
      setFormPhotoUrl('');
      setFormPhotoDescription('');
      setIsCustomCustomer(false);
      setCustomCustomerName('');
      setCustomCustomerPhone('');
      setIsModalOpen(true);
      if (onClearActiveOSCreation) {
        onClearActiveOSCreation();
      }
    }
  }, [activeOSForCreation]);

  const getCustomer = (id: string) => customers.find(c => c.id === id);
  const getEquipment = (id: string) => equipment.find(e => e.id === id);

  const filteredOrders = serviceOrders.filter(so => {
    const customer = getCustomer(so.customerId);
    const equip = getEquipment(so.equipmentId);
    const custName = customer ? customer.name.toLowerCase() : '';
    const equipDetails = equip ? `${equip.brand} ${equip.model}`.toLowerCase() : '';
    const query = searchQuery.toLowerCase();

    const matchesSearch = 
      so.id.toLowerCase().includes(query) ||
      custName.includes(query) ||
      equipDetails.includes(query) ||
      so.issueReported.toLowerCase().includes(query);

    const matchesStatus = statusFilter === 'all' ? true : so.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleOpenAdd = () => {
    setModalMode('add');
    setFormId('');
    setFormCustomerId(customers[0]?.id || '');
    const firstCustEquips = equipment.filter(e => e.customerId === customers[0]?.id);
    setFormEquipmentId(firstCustEquips[0]?.id || '');
    setFormStatus('draft');
    setFormIssueReported('');
    setFormServicePerformed('');
    setFormLaborValue(0);
    setFormPartsValue(0);
    setFormPaymentStatus('pending');
    setFormNextMaintenanceMonths(0);
    setFormChecklist({
      cleanEvaporator: false,
      cleanCondenser: false,
      checkGasPressure: false,
      checkElectrical: false,
      checkDrainage: false,
      testRemote: false,
      sanitizeUnit: false
    });
    setFormNotes('');
    setFormPhotoUrl('');
    setFormPhotoDescription('');
    setIsCustomCustomer(false);
    setCustomCustomerName('');
    setCustomCustomerPhone('');
    setCustomEquipBrand('LG');
    setCustomEquipType('Split High Wall');
    setCustomEquipCapacity(12000);
    setCustomEquipModel('Inverter');
    setCustomEquipLocation('Sala');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (so: ServiceOrder, e: React.MouseEvent) => {
    e.stopPropagation();
    setModalMode('edit');
    setFormId(so.id);
    setFormCustomerId(so.customerId);
    setFormEquipmentId(so.equipmentId);
    setFormStatus(so.status);
    setFormIssueReported(so.issueReported);
    setFormServicePerformed(so.servicePerformed || '');
    setFormLaborValue(so.laborValue);
    setFormPartsValue(so.partsValue);
    setFormPaymentStatus(so.paymentStatus);
    setFormNextMaintenanceMonths(so.nextMaintenanceMonths || 0);
    setFormChecklist(so.checklist);
    setFormNotes(so.notes || '');
    setFormPhotoUrl(so.photoUrl || '');
    setFormPhotoDescription(so.photoDescription || '');
    setIsCustomCustomer(false);
    setCustomCustomerName('');
    setCustomCustomerPhone('');
    setIsModalOpen(true);
  };

  const handleCustomerChangeInForm = (custId: string) => {
    setFormCustomerId(custId);
    const filtered = equipment.filter(e => e.customerId === custId);
    setFormEquipmentId(filtered[0]?.id || '');
  };

  const toggleChecklistInForm = (key: keyof OSChecklist) => {
    setFormChecklist(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formIssueReported) return;

    let finalCustomerId = formCustomerId;
    let finalEquipmentId = formEquipmentId;

    if (modalMode === 'add' && isCustomCustomer) {
      if (!customCustomerName.trim()) {
        alert('Por favor, informe o nome do cliente.');
        return;
      }
      if (!onAddCustomer || !onAddEquipment) {
        alert('Erro interno: funções de criação de cliente rápido indisponíveis.');
        return;
      }

      // 1. Create customer on the fly
      const newCust = onAddCustomer({
        name: customCustomerName,
        cpfCnpj: '',
        email: `${customCustomerName.toLowerCase().replace(/\s+/g, '')}@example.com`,
        phone: customCustomerPhone || '(00) 00000-0000',
        address: {
          street: 'Não informado',
          number: 'S/N',
          neighborhood: 'Não informado',
          city: 'São Paulo',
          state: 'SP',
          cep: '01000-000'
        },
        notes: 'Cliente criado automaticamente pela Ordem de Serviço.'
      });

      // 2. Create equipment for this customer
      const newEquip = onAddEquipment({
        customerId: newCust.id,
        brand: customEquipBrand as any,
        type: customEquipType as any,
        capacityBtu: customEquipCapacity,
        model: customEquipModel,
        serialNumber: `SN-${Date.now()}`,
        locationRoom: customEquipLocation,
        status: 'active'
      });

      finalCustomerId = newCust.id;
      finalEquipmentId = newEquip.id;
    } else {
      if (!formCustomerId || !formEquipmentId) {
        alert('Por favor, selecione o cliente solicitante e o aparelho correspondente.');
        return;
      }
    }

    let nextMaintenanceDate: string | undefined = undefined;
    if (formNextMaintenanceMonths > 0) {
      const d = new Date();
      d.setMonth(d.getMonth() + Number(formNextMaintenanceMonths));
      nextMaintenanceDate = d.toISOString().split('T')[0];
    }

    const osData = {
      customerId: finalCustomerId,
      equipmentId: finalEquipmentId,
      status: formStatus,
      issueReported: formIssueReported,
      servicePerformed: formServicePerformed || undefined,
      checklist: formChecklist,
      laborValue: Number(formLaborValue),
      partsValue: Number(formPartsValue),
      totalValue: Number(formLaborValue) + Number(formPartsValue),
      paymentStatus: formPaymentStatus,
      dateOpened: modalMode === 'add' ? new Date().toISOString().split('T')[0] : serviceOrders.find(s => s.id === formId)?.dateOpened || new Date().toISOString().split('T')[0],
      dateClosed: formStatus === 'completed' ? new Date().toISOString().split('T')[0] : undefined,
      notes: formNotes || undefined,
      photoUrl: formPhotoUrl || undefined,
      photoDescription: formPhotoDescription || undefined,
      nextMaintenanceMonths: formNextMaintenanceMonths > 0 ? formNextMaintenanceMonths : undefined,
      nextMaintenanceDate: nextMaintenanceDate
    };

    if (modalMode === 'add') {
      onAddOS(osData);
    } else {
      onEditOS({
        ...osData,
        id: formId
      });
      // Update active selection details
      if (selectedOS?.id === formId) {
        setSelectedOS({
          ...osData,
          id: formId
        });
      }
    }
    setIsModalOpen(false);
  };

  const getStatusBadge = (status: OSStatus) => {
    switch (status) {
      case 'draft': return <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-full font-semibold">Orçamento</span>;
      case 'approved': return <span className="bg-sky-50 text-sky-700 text-xs px-2.5 py-1 rounded-full font-semibold">Aprovada</span>;
      case 'in_progress': return <span className="bg-amber-50 text-amber-700 text-xs px-2.5 py-1 rounded-full font-semibold">Em Atendimento</span>;
      case 'completed': return <span className="bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-full font-semibold">Concluída</span>;
      case 'cancelled': return <span className="bg-red-50 text-red-700 text-xs px-2.5 py-1 rounded-full font-semibold">Cancelada</span>;
    }
  };

  const activeCustomerEquips = equipment.filter(e => e.customerId === formCustomerId);

  return (
    <div className="space-y-6" id="service-orders-view-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Ordens de Serviço (O.S.)</h1>
          <p className="text-sm text-slate-500">Controle, preenchimento de checklists técnicos e faturamento de serviços</p>
        </div>
        <button
          id="btn-add-os"
          onClick={handleOpenAdd}
          disabled={customers.length === 0 || equipment.length === 0}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition duration-200 shadow-sm disabled:opacity-50"
        >
          <Plus size={20} />
          <span>Nova O.S.</span>
        </button>
      </div>

      {equipment.length === 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm flex gap-3">
          <AlertCircle className="shrink-0 text-amber-600" />
          <div>
            <p className="font-semibold">Nenhum equipamento cadastrado!</p>
            <p className="mt-0.5">Cadastre um equipamento para um cliente para poder abrir uma ordem de serviço.</p>
          </div>
        </div>
      )}

      {/* Grid containing list on left and technical sheet on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* List of OS */}
        <div className={`lg:col-span-1 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[700px] ${selectedOS ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-4 border-b border-slate-100 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                id="os-search-input"
                type="text"
                placeholder="Buscar por N° OS, cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
              {[
                { value: 'all', label: 'Todas' },
                { value: 'draft', label: 'Orçamentos' },
                { value: 'in_progress', label: 'Execução' },
                { value: 'completed', label: 'Concluídas' }
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setStatusFilter(opt.value)}
                  className={`px-2.5 py-1 rounded-md transition shrink-0 ${statusFilter === opt.value ? 'bg-slate-800 text-white font-medium' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
            {filteredOrders.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                Nenhuma O.S. encontrada.
              </div>
            ) : (
              filteredOrders.map(so => {
                const client = getCustomer(so.customerId);
                return (
                  <div
                    id={`os-item-${so.id}`}
                    key={so.id}
                    onClick={() => { setSelectedOS(so); setIsPrintPreview(false); }}
                    className={`p-4 cursor-pointer transition flex flex-col justify-between h-28 ${selectedOS?.id === so.id ? 'bg-blue-50/50 border-r-4 border-blue-600' : 'hover:bg-slate-50'}`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="font-mono font-bold text-slate-800 text-sm">{so.id}</span>
                        <h4 className="font-semibold text-slate-700 text-xs truncate max-w-[150px] mt-0.5">{client?.name}</h4>
                      </div>
                      {getStatusBadge(so.status)}
                    </div>

                    <div className="flex justify-between items-end mt-2">
                      <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1 font-mono">
                        <Calendar size={11} />
                        <span>{new Date(so.dateOpened + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-800">
                        R$ {so.totalValue.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Technical Sheet Detail */}
        <div className={`lg:col-span-2 ${selectedOS ? 'block' : 'hidden lg:flex lg:items-center lg:justify-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-400'}`}>
          {selectedOS ? (
            (() => {
              const client = getCustomer(selectedOS.customerId);
              const equip = getEquipment(selectedOS.equipmentId);

              return (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm h-[700px] flex flex-col overflow-hidden">
                  
                  {/* Top Bar Actions */}
                  <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-10">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        id="btn-back-to-os-list"
                        onClick={() => setSelectedOS(null)}
                        className="lg:hidden flex items-center text-blue-600 font-bold text-sm mr-2"
                      >
                        &larr; Lista
                      </button>
                      <button
                        id="btn-toggle-print"
                        onClick={() => setIsPrintPreview(!isPrintPreview)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${isPrintPreview ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                      >
                        <Printer size={14} />
                        <span>{isPrintPreview ? 'Visualização Normal' : 'Ficha Técnica'}</span>
                      </button>

                      <button
                        id="btn-download-pdf-direct"
                        onClick={() => {
                          try {
                            const client = getCustomer(selectedOS.customerId);
                            const equip = getEquipment(selectedOS.equipmentId);
                            const doc = generateOSPDF(selectedOS, client, equip);
                            doc.save(`Orçamento_${selectedOS.id}.pdf`);
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50 transition"
                      >
                        <FileDown size={14} />
                        <span>Baixar PDF</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {(() => {
                        const client = getCustomer(selectedOS.customerId);
                        const { phone, text } = getWhatsAppShareText(selectedOS, client);
                        let waUrl = `https://web.whatsapp.com/send?text=${text}`;
                        if (phone) {
                          waUrl = `https://web.whatsapp.com/send?phone=${phone}&text=${text}`;
                        }
                        if (typeof navigator !== 'undefined' && /Android|iPhone|iPad/i.test(navigator.userAgent)) {
                          waUrl = `https://api.whatsapp.com/send?${phone ? `phone=${phone}&` : ''}text=${text}`;
                        }
                        const fileName = `Orçamento_${selectedOS.id}.pdf`;

                        return (
                          <button
                            id="btn-trigger-whatsapp-flow"
                            onClick={() => {
                              try {
                                const equip = getEquipment(selectedOS.equipmentId);
                                const doc = generateOSPDF(selectedOS, client, equip);
                                doc.save(fileName);
                                setWhatsAppGuideUrl(waUrl);
                                setWhatsAppGuideFileName(fileName);
                                setIsWhatsAppGuideOpen(true);
                              } catch (err) {
                                console.error(err);
                              }
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition shadow-sm cursor-pointer"
                          >
                            <Share2 size={14} />
                            <span>Enviar por WhatsApp</span>
                          </button>
                        );
                      })()}

                      <button
                        id={`btn-edit-os-${selectedOS.id}`}
                        onClick={(e) => handleOpenEdit(selectedOS, e)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-700 transition"
                      >
                        <Edit2 size={14} />
                        <span>Editar</span>
                      </button>
                    </div>
                  </div>

                  {/* Sheet Body */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {isPrintPreview ? (
                      /* High-fidelity Technical Sheet / Printable Layout */
                      <div className="border border-slate-300 p-8 rounded-lg bg-white space-y-6 font-sans text-slate-800 max-w-3xl mx-auto" id="os-print-preview-sheet">
                        {/* Company Logo and Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b-2 border-slate-800 pb-5">
                          {companyProfile?.bannerUrl ? (
                            <div className="max-w-md w-full sm:w-2/3">
                              <img
                                src={companyProfile.bannerUrl}
                                alt="Banner da Oficina"
                                className="w-full h-auto max-h-16 object-contain object-left rounded-lg"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          ) : (
                            <div>
                              <h2 className="text-xl font-black uppercase tracking-wider text-slate-800">
                                {companyProfile?.name || 'CLIMA FRIO'}
                              </h2>
                              <p className="text-xs text-slate-500 mt-1">
                                {companyProfile?.slogan || 'Sistemas de Climatização & Refrigeração'}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                Suporte Técnico: {companyProfile?.email || 'contato@climafrio.com'} • {companyProfile?.phone || '(11) 98765-4321'}
                              </p>
                              {companyProfile?.cnpj && (
                                <p className="text-[9px] text-slate-500 font-mono mt-0.5">CNPJ: {companyProfile.cnpj}</p>
                              )}
                            </div>
                          )}
                          <div className="text-right shrink-0">
                            <h3 className="font-mono text-base font-black bg-slate-100 px-3 py-1.5 rounded border border-slate-200">OS N° {selectedOS.id}</h3>
                            <p className="text-xs text-slate-500 mt-2 font-mono">Aberta em: {new Date(selectedOS.dateOpened + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                            {selectedOS.dateClosed && (
                              <p className="text-xs text-slate-500 font-mono">Concluída em: {new Date(selectedOS.dateClosed + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                            )}
                          </div>
                        </div>

                        {/* Customer & Location */}
                        <div className="grid grid-cols-2 gap-4 text-xs border-b border-slate-200 pb-4">
                          <div>
                            <h4 className="font-bold text-slate-700 uppercase tracking-wide mb-1">CLIENTE</h4>
                            <p className="font-semibold text-slate-900">{client?.name}</p>
                            <p>CPF/CNPJ: {client?.cpfCnpj}</p>
                            <p>Telefone: {client?.phone}</p>
                            <p>E-mail: {client?.email}</p>
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-700 uppercase tracking-wide mb-1">LOCAL DE INSTALAÇÃO</h4>
                            <p>{client?.address.street}, {client?.address.number} {client?.address.complement ? ` - ${client?.address.complement}` : ''}</p>
                            <p>{client?.address.neighborhood} - {client?.address.city}/{client?.address.state}</p>
                            <p>CEP: {client?.address.cep}</p>
                          </div>
                        </div>

                        {/* Equipment Section */}
                        <div className="text-xs border-b border-slate-200 pb-4">
                          <h4 className="font-bold text-slate-700 uppercase tracking-wide mb-2">EQUIPAMENTO ATENDIDO</h4>
                          <div className="grid grid-cols-4 gap-2 bg-slate-50 p-3 rounded border border-slate-100 font-mono text-[11px]">
                            <div>
                              <span className="text-slate-400 block">MARCA / TIPO</span>
                              <span className="font-bold text-slate-800">{equip?.brand} - {equip?.type}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">CAPACIDADE</span>
                              <span className="font-bold text-slate-800">{equip?.capacityBtu.toLocaleString()} BTUs</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">MODELO</span>
                              <span className="font-bold text-slate-800">{equip?.model}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">N° SÉRIE</span>
                              <span className="font-bold text-slate-800">{equip?.serialNumber}</span>
                            </div>
                          </div>
                        </div>

                        {/* Checklist Section */}
                        <div className="text-xs border-b border-slate-200 pb-4">
                          <h4 className="font-bold text-slate-700 uppercase tracking-wide mb-3 flex items-center gap-1">
                            <ShieldCheck size={14} className="text-emerald-600" />
                            CHECKLIST DE MANUTENÇÃO EFETUADO
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                            {Object.entries(selectedOS.checklist).map(([key, value]) => (
                              <div key={key} className="flex items-center gap-2">
                                {value ? (
                                  <CheckSquare className="text-emerald-600" size={15} />
                                ) : (
                                  <Square className="text-slate-300" size={15} />
                                )}
                                <span className={value ? 'text-slate-800 font-medium' : 'text-slate-400 line-through'}>
                                  {CHECKLIST_LABELS[key as keyof OSChecklist]}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Issues & Services Performed */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs border-b border-slate-200 pb-4">
                          <div>
                            <h4 className="font-bold text-slate-700 uppercase tracking-wide mb-1.5">DEFEITO / SERVIÇO SOLICITADO</h4>
                            <p className="bg-slate-50 p-2.5 rounded border border-slate-100 leading-relaxed min-h-16 italic text-slate-600">
                              "{selectedOS.issueReported}"
                            </p>
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-700 uppercase tracking-wide mb-1.5">DESCRIÇÃO TÉCNICA DO SERVIÇO EXECUTADO</h4>
                            <p className="bg-slate-50 p-2.5 rounded border border-slate-100 leading-relaxed min-h-16 text-slate-700 font-medium">
                              {selectedOS.servicePerformed || 'Aguardando execução do serviço.'}
                            </p>
                          </div>
                        </div>

                        {/* Photo Evidence in Ficha Técnica */}
                        {selectedOS.photoUrl && (
                          <div className="text-xs border-b border-slate-200 pb-4">
                            <h4 className="font-bold text-slate-700 uppercase tracking-wide mb-2">REGISTRO FOTOGRÁFICO DO ATENDIMENTO / PEÇAS</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-3 rounded border border-slate-100 items-center">
                              <div className="max-h-48 overflow-hidden rounded border border-slate-200 bg-white flex items-center justify-center p-1">
                                <img
                                  src={selectedOS.photoUrl}
                                  alt="Registro do Atendimento"
                                  className="max-h-44 object-contain rounded"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <p className="font-bold text-slate-700">Evidência / Peça Substituída:</p>
                                <p className="text-slate-600 leading-relaxed italic">
                                  {selectedOS.photoDescription || 'Foto ilustrativa documentando as ações executadas no equipamento.'}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Values Summary */}
                        <div className="flex justify-between items-center text-xs">
                          <div>
                            <p className="text-xs text-slate-500 font-mono">Faturamento Clima Frio</p>
                            <p className="text-[10px] text-slate-400">Impostos incidentes retidos na fonte conforme legislação.</p>
                          </div>
                          <div className="w-64 space-y-1.5 text-right font-mono border-l border-slate-200 pl-6">
                            <div className="flex justify-between text-slate-500">
                              <span>MÃO DE OBRA:</span>
                              <span>R$ {selectedOS.laborValue.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-slate-500">
                              <span>PEÇAS/INSUMOS:</span>
                              <span>R$ {selectedOS.partsValue.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-1.5">
                              <span>TOTAL GERAL:</span>
                              <span>R$ {selectedOS.totalValue.toFixed(2)}</span>
                            </div>
                            <p className="text-[10px] font-bold text-emerald-700 mt-1">
                              PAGAMENTO: {selectedOS.paymentStatus === 'paid' ? 'CONCLUÍDO (À VISTA)' : 'PENDENTE'}
                            </p>
                          </div>
                        </div>

                        {/* Signatures */}
                        <div className="grid grid-cols-2 gap-12 pt-8 text-center text-[10px] text-slate-400">
                          <div className="border-t border-slate-300 pt-2">
                            <p>ASSINATURA DO TÉCNICO RESPONSÁVEL</p>
                            <p className="font-bold text-slate-600 mt-1">{(companyProfile?.name || 'CLIMA FRIO').toUpperCase()} SERVICE</p>
                          </div>
                          <div className="border-t border-slate-300 pt-2">
                            <p>ASSINATURA DO CLIENTE (DE ACORDO)</p>
                            <p className="font-bold text-slate-600 mt-1">{client?.name}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Interactive Standard Dashboard View */
                      <div className="space-y-6">
                        
                        {/* OS Header Status */}
                        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <div className="space-y-1">
                            <span className="text-xs text-slate-400 font-medium font-mono">Número do Atendimento</span>
                            <p className="font-bold text-slate-800 text-lg font-mono">{selectedOS.id}</p>
                          </div>
                          <div className="text-right space-y-1">
                            <span className="text-xs text-slate-400 block">Status Operacional</span>
                            {getStatusBadge(selectedOS.status)}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Client Box */}
                          <div className="p-4 border border-slate-100 rounded-xl space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                              <FileText size={14} />
                              Informações do Cliente
                            </h4>
                            <div className="space-y-1.5 text-sm text-slate-700">
                              <p className="font-bold text-slate-900">{client?.name}</p>
                              <p className="text-xs text-slate-500">CNPJ/CPF: {client?.cpfCnpj}</p>
                              <p className="text-xs">Tel: {client?.phone}</p>
                              <p className="text-xs">Endereço: {client?.address.street}, {client?.address.number} - {client?.address.neighborhood}, {client?.address.city}/{client?.address.state}</p>
                            </div>
                          </div>

                          {/* Equipment Box */}
                          <div className="p-4 border border-slate-100 rounded-xl space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                              <ShieldCheck size={14} />
                              Equipamento Vinculado
                            </h4>
                            {equip ? (
                              <div className="space-y-1.5 text-sm text-slate-700">
                                <p className="font-bold text-slate-900">{equip.brand} {equip.model}</p>
                                <p className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-sm inline-block">{equip.type} • {equip.capacityBtu.toLocaleString()} BTUs</p>
                                <p className="text-xs text-slate-500 font-mono">Série: {equip.serialNumber}</p>
                                <p className="text-xs">Local: {equip.locationRoom}</p>
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400">Aparelho não configurado ou removido.</p>
                            )}
                          </div>
                        </div>

                        {/* Defect description */}
                        <div className="p-4 border border-slate-100 rounded-xl space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Defeito Reclamado</h4>
                          <p className="text-sm text-slate-700 bg-slate-50/50 p-3 rounded-lg leading-relaxed italic">
                            "{selectedOS.issueReported}"
                          </p>
                        </div>

                        {/* Checklist Interactive List */}
                        <div className="p-4 border border-slate-100 rounded-xl space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Checklist Operacional do Técnico</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                            {Object.entries(selectedOS.checklist).map(([key, value]) => (
                              <div
                                key={key}
                                onClick={() => {
                                  // Live interactive toggling in details view
                                  const updatedChecklist = {
                                    ...selectedOS.checklist,
                                    [key]: !value
                                  };
                                  onEditOS({
                                    ...selectedOS,
                                    checklist: updatedChecklist
                                  });
                                  setSelectedOS({
                                    ...selectedOS,
                                    checklist: updatedChecklist
                                  });
                                }}
                                className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg hover:bg-slate-100/70 transition cursor-pointer text-xs"
                              >
                                {value ? (
                                  <CheckSquare className="text-emerald-600 shrink-0" size={18} />
                                ) : (
                                  <Square className="text-slate-300 shrink-0" size={18} />
                                )}
                                <span className={value ? 'text-slate-800 font-semibold' : 'text-slate-500 font-medium'}>
                                  {CHECKLIST_LABELS[key as keyof OSChecklist]}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Service Performed details */}
                        <div className="p-4 border border-slate-100 rounded-xl space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Trabalho Executado</h4>
                          {selectedOS.servicePerformed ? (
                            <p className="text-sm text-slate-800 bg-slate-50 p-3.5 rounded-lg border border-slate-100/50 leading-relaxed font-medium">
                              {selectedOS.servicePerformed}
                            </p>
                          ) : (
                            <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100/50 flex gap-2 items-center">
                              <AlertCircle size={14} />
                              <span>Descrição pendente. Edite esta OS para detalhar as ações executadas pelo técnico.</span>
                            </p>
                          )}
                        </div>

                        {/* Service Photo Evidence in Standard Dashboard */}
                        {selectedOS.photoUrl && (
                          <div className="p-4 border border-slate-100 rounded-xl space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Evidência Fotográfica do Serviço</h4>
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                              <div className="w-full sm:w-48 h-36 rounded-lg overflow-hidden border border-slate-100 shrink-0 bg-slate-50 flex items-center justify-center">
                                <img
                                  src={selectedOS.photoUrl}
                                  alt="Evidência do Serviço"
                                  className="max-h-full max-w-full object-contain"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <p className="text-xs text-slate-400 font-semibold uppercase">Descrição da Foto / Peça</p>
                                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                  {selectedOS.photoDescription || 'Sem observações anexas à imagem.'}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Financial summary card */}
                        <div className="p-5 bg-slate-800 text-white rounded-2xl flex flex-col md:flex-row justify-between gap-6 items-start md:items-center">
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Resumo Financeiro da OS</span>
                            <div className="flex gap-4 text-xs pt-1.5 text-slate-300">
                              <div>
                                <span>Mão de Obra:</span>
                                <span className="font-mono text-white ml-1 font-semibold">R$ {selectedOS.laborValue.toFixed(2)}</span>
                              </div>
                              <div>
                                <span>Insumos/Peças:</span>
                                <span className="font-mono text-white ml-1 font-semibold">R$ {selectedOS.partsValue.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-6 items-center w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-slate-700 pt-3 md:pt-0">
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-widest">Valor Geral Cobrado</span>
                              <span className="text-xl font-bold font-mono text-emerald-400">R$ {selectedOS.totalValue.toFixed(2)}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-widest mb-1">Pagamento</span>
                              <span className={`text-xs px-3 py-1 rounded-md font-bold ${selectedOS.paymentStatus === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                {selectedOS.paymentStatus === 'paid' ? 'PAGO' : 'PENDENTE'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Próxima Preventiva / Pós-Venda Panel */}
                        {selectedOS.nextMaintenanceDate && (
                          <div className="p-4 border border-blue-100 bg-blue-50/30 rounded-xl space-y-2 mt-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
                              <Calendar size={14} />
                              Próxima Manutenção Preventiva (Pós-Venda)
                            </h4>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
                              <div>
                                <p className="text-slate-700 font-medium">
                                  Próxima higienização recomendada:{' '}
                                  <strong className="text-blue-800 font-bold">
                                    {new Date(selectedOS.nextMaintenanceDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                                  </strong>{' '}
                                  (em {selectedOS.nextMaintenanceMonths} meses)
                                </p>
                                <p className="text-[11px] text-slate-500 leading-tight">
                                  Mantém o ambiente saudável, evita vazamentos e reduz o consumo elétrico do ar condicionado.
                                </p>
                              </div>

                              <button
                                onClick={() => {
                                  const text = `Olá ${client?.name || 'Cliente'}, aqui é da ${companyProfile?.name || 'Clima Frio'}! ❄️

Passando para lembrar que já está se aproximando o período recomendado (${selectedOS.nextMaintenanceMonths} meses) para a *Manutenção Preventiva e Higienização* do seu aparelho de ar condicionado [${equip?.brand || ''} ${equip?.model || ''}] localizado na *${equip?.locationRoom || 'Sala'}*.

Manter a limpeza em dia garante o bom funcionamento, evita quebras repentinas e economiza energia elétrica! 🔋

Gostaria de agendar uma visita para esta semana? Estamos com horários disponíveis.`;
                                  const encodedText = encodeURIComponent(text);
                                  const phone = client?.phone ? client.phone.replace(/\D/g, '') : '';
                                  let waUrl = `https://web.whatsapp.com/send?text=${encodedText}`;
                                  if (phone) {
                                    waUrl = `https://web.whatsapp.com/send?phone=${phone}&text=${encodedText}`;
                                  }
                                  if (typeof navigator !== 'undefined' && /Android|iPhone|iPad/i.test(navigator.userAgent)) {
                                    waUrl = `https://api.whatsapp.com/send?${phone ? `phone=${phone}&` : ''}text=${encodedText}`;
                                  }
                                  window.open(waUrl, '_blank');
                                }}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shrink-0 flex items-center gap-1.5 shadow-xs"
                              >
                                <span>Lembrar Cliente WhatsApp</span>
                              </button>
                            </div>
                          </div>
                        )}

                      </div>
                    )}
                  </div>
                </div>
              );
            })()
          ) : (
            <div>
              <FileText className="mx-auto mb-3 text-slate-300" size={36} />
              <p className="text-sm font-medium text-slate-500">Selecione uma ordem de serviço para visualizar a ficha técnica</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal - OS Form (Add/Edit) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="os-modal-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              id="os-modal-content"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
                <h3 className="font-bold text-slate-800 text-lg">
                  {modalMode === 'add' ? 'Abertura de Ordem de Serviço (O.S.)' : 'Edição de Ordem de Serviço'}
                </h3>
                <button
                  id="btn-close-os-modal"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-6">
                
                {/* Mode toggle */}
                {modalMode === 'add' && (
                  <div className="flex items-center gap-2 pb-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <input
                      type="checkbox"
                      id="toggle-custom-customer"
                      checked={isCustomCustomer}
                      onChange={(e) => setIsCustomCustomer(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 h-4 w-4"
                    />
                    <label htmlFor="toggle-custom-customer" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                      Escrever nome personalizado (Cliente / Aparelho novo não cadastrado)
                    </label>
                  </div>
                )}

                {/* Customer and Equipment select */}
                {isCustomCustomer && modalMode === 'add' ? (
                  <div className="space-y-4 p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600">Cadastro Rápido de Cliente e Aparelho</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Nome do Cliente *</label>
                        <input
                          type="text"
                          required
                          value={customCustomerName}
                          onChange={(e) => setCustomCustomerName(e.target.value)}
                          placeholder="Ex: Fabrício, João, Matheus, Adriano..."
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Telefone / WhatsApp (Opcional)</label>
                        <input
                          type="text"
                          value={customCustomerPhone}
                          onChange={(e) => setCustomCustomerPhone(e.target.value)}
                          placeholder="Ex: (11) 99999-9999"
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-mono bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Marca *</label>
                        <select
                          value={customEquipBrand}
                          onChange={(e) => setCustomEquipBrand(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs bg-white"
                        >
                          {['Daikin', 'Fujitsu', 'LG', 'Samsung', 'Carrier', 'Midea', 'Gree', 'Consul', 'Electrolux', 'Outra'].map(b => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Tipo *</label>
                        <select
                          value={customEquipType}
                          onChange={(e) => setCustomEquipType(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs bg-white"
                        >
                          {['Split High Wall', 'Cassete', 'Piso Teto', 'Janela', 'Multi-Split', 'Chiller', 'Outro'].map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">BTUs *</label>
                        <input
                          type="number"
                          required
                          value={customEquipCapacity}
                          onChange={(e) => setCustomEquipCapacity(Number(e.target.value))}
                          placeholder="Ex: 12000"
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs bg-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Local (Cômodo) *</label>
                        <input
                          type="text"
                          required
                          value={customEquipLocation}
                          onChange={(e) => setCustomEquipLocation(e.target.value)}
                          placeholder="Ex: Sala, Quarto, Cozinha..."
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Cliente Solicitante *</label>
                      <select
                        id="form-os-customer"
                        required={!isCustomCustomer}
                        value={formCustomerId}
                        onChange={(e) => handleCustomerChangeInForm(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white"
                      >
                        <option value="" disabled>Selecione um cliente...</option>
                        {customers.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Aparelho do Cliente *</label>
                      <select
                        id="form-os-equipment"
                        required={!isCustomCustomer}
                        value={formEquipmentId}
                        onChange={(e) => setFormEquipmentId(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white"
                      >
                        <option value="" disabled>Selecione um aparelho...</option>
                        {activeCustomerEquips.map(eq => (
                          <option key={eq.id} value={eq.id}>{eq.brand} {eq.model} ({eq.locationRoom})</option>
                        ))}
                      </select>
                      {activeCustomerEquips.length === 0 && formCustomerId && (
                        <p className="text-[10px] text-red-500 mt-1">Este cliente não possui nenhum equipamento cadastrado!</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Status & Payment Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Fase da O.S. *</label>
                    <select
                      id="form-os-status"
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as OSStatus)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white font-semibold text-slate-700"
                    >
                      <option value="draft">Orçamento / Rascunho</option>
                      <option value="approved">Aprovada / Aguardando Execução</option>
                      <option value="in_progress">Em Atendimento Técnico</option>
                      <option value="completed">Concluída / Entregue</option>
                      <option value="cancelled">Cancelada</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Status do Faturamento *</label>
                    <select
                      id="form-os-payment"
                      value={formPaymentStatus}
                      onChange={(e) => setFormPaymentStatus(e.target.value as 'pending' | 'paid')}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white font-medium"
                    >
                      <option value="pending" className="text-red-600">Aguardando Pagamento</option>
                      <option value="paid" className="text-green-600">Pago / Caixa</option>
                    </select>
                  </div>
                </div>

                {/* Próxima Manutenção Preventiva */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Planejar Próxima Preventiva (Pós-Venda)</label>
                    <select
                      id="form-os-next-maintenance"
                      value={formNextMaintenanceMonths}
                      onChange={(e) => setFormNextMaintenanceMonths(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white font-medium text-slate-700"
                    >
                      <option value={0}>Nenhum lembrete planejado</option>
                      <option value={3}>Em 3 meses (Recomendado comercial/frequente)</option>
                      <option value={6}>Em 6 meses (Padrão residencial)</option>
                      <option value={12}>Em 1 ano</option>
                    </select>
                  </div>
                  {formNextMaintenanceMonths > 0 && (
                    <div className="flex items-end pb-0.5 text-xs text-slate-500">
                      <span className="bg-blue-50 text-blue-800 px-3 py-1.5 rounded-lg border border-blue-100 flex items-center gap-1.5 font-medium">
                        <span>📅 Lembrete para:</span>
                        <strong className="font-bold">
                          {(() => {
                            const d = new Date();
                            d.setMonth(d.getMonth() + formNextMaintenanceMonths);
                            return d.toLocaleDateString('pt-BR');
                          })()}
                        </strong>
                      </span>
                    </div>
                  )}
                </div>

                {/* Issue and Service Performed */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Defeito Reclamado / Serviço Solicitado *</label>
                    <textarea
                      id="form-os-issue"
                      rows={2}
                      required
                      value={formIssueReported}
                      onChange={(e) => setFormIssueReported(e.target.value)}
                      placeholder="Relato do cliente..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Serviço Técnico Executado (Relatório)</label>
                    <textarea
                      id="form-os-service-performed"
                      rows={3}
                      value={formServicePerformed}
                      onChange={(e) => setFormServicePerformed(e.target.value)}
                      placeholder="Descrição detalhada das ações tomadas (carga de gás, troca de capacitor, desobstrução)..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>

                {/* Photo Space for OS */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600">Registro Fotográfico / Foto do Serviço</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Upload de Foto (Peça trocada / Evidência)</label>
                      {formPhotoUrl ? (
                        <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 h-36 flex items-center justify-center">
                          <img
                            src={formPhotoUrl}
                            alt="Preview Peça"
                            className="max-h-full max-w-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            type="button"
                            onClick={() => setFormPhotoUrl('')}
                            className="absolute top-2 right-2 p-1.5 bg-slate-900/70 text-white rounded-full hover:bg-slate-900 transition"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="border border-dashed border-slate-200 rounded-xl p-3 text-center bg-slate-50 hover:border-blue-400 transition flex flex-col justify-center h-36">
                          <Upload className="mx-auto text-slate-400 mb-1.5" size={20} />
                          <p className="text-xs font-semibold text-slate-600">Arraste ou clique para enviar foto</p>
                          <input
                            id="os-file-input"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  if (typeof reader.result === 'string') {
                                    setFormPhotoUrl(reader.result);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="hidden"
                          />
                          <label
                            htmlFor="os-file-input"
                            className="mt-2 inline-block px-2.5 py-1 bg-white border border-slate-200 text-slate-700 font-semibold rounded text-[11px] hover:bg-slate-50 transition cursor-pointer self-center"
                          >
                            Selecionar Foto
                          </label>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Descrição do Registro Fotográfico</label>
                        <input
                          type="text"
                          value={formPhotoDescription}
                          onChange={(e) => setFormPhotoDescription(e.target.value)}
                          placeholder="Ex: Novo capacitor de 35uF 440VAC instalado."
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Ou simule uma foto técnica:</span>
                        <div className="flex flex-wrap gap-1">
                          {[
                            { name: 'Troca de Capacitor', url: 'https://images.unsplash.com/photo-1517055729445-fa7d27394b48?auto=format&fit=crop&w=400&q=80' },
                            { name: 'Filtro Lavado', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80' },
                            { name: 'Pressão do Gás', url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80' }
                          ].map(preset => (
                            <button
                              key={preset.name}
                              type="button"
                              onClick={() => {
                                setFormPhotoUrl(preset.url);
                                if (!formPhotoDescription) {
                                  setFormPhotoDescription(preset.name === 'Troca de Capacitor' ? 'Instalação de capacitor novo.' : preset.name === 'Filtro Lavado' ? 'Higienização profunda concluída.' : 'Manômetro acoplado para aferir pressão.');
                                }
                              }}
                              className="px-1.5 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded text-[9px] transition"
                            >
                              {preset.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Technical checklist toggle checkboxes */}
                <div className="space-y-3 pt-4 border-t border-slate-50">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600">Checklist Operacional de Manutenção</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(formChecklist).map(([key, value]) => (
                      <div
                        key={key}
                        onClick={() => toggleChecklistInForm(key as keyof OSChecklist)}
                        className="flex items-center gap-3 p-2.5 border border-slate-100 rounded-lg cursor-pointer hover:bg-slate-50 transition"
                      >
                        {value ? (
                          <CheckSquare className="text-blue-600 shrink-0" size={18} />
                        ) : (
                          <Square className="text-slate-300 shrink-0" size={18} />
                        )}
                        <span className="text-xs text-slate-700 font-medium">{CHECKLIST_LABELS[key as keyof OSChecklist]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial parts & labor costs */}
                <div className="space-y-4 pt-4 border-t border-slate-50">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600">Custos & Faturamento</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Mão de Obra (R$)</label>
                      <input
                        id="form-os-labor-cost"
                        type="number"
                        min="0"
                        step="1"
                        required
                        value={formLaborValue}
                        onChange={(e) => setFormLaborValue(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Peças / Materiais (R$)</label>
                      <input
                        id="form-os-parts-cost"
                        type="number"
                        min="0"
                        step="1"
                        required
                        value={formPartsValue}
                        onChange={(e) => setFormPartsValue(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Custo Total Previsto</label>
                      <div className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 text-sm font-mono">
                        R$ {(Number(formLaborValue) + Number(formPartsValue)).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Observações Gerais</label>
                  <textarea
                    id="form-os-notes"
                    rows={2}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Ex: Cliente dividiu em 3x sem juros no cartão ou reclamação sobre parafuso oxidado."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    id="btn-cancel-os"
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 font-medium rounded-lg text-sm hover:bg-slate-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    id="btn-save-os"
                    type="submit"
                    disabled={modalMode === 'add' ? (!isCustomCustomer && activeCustomerEquips.length === 0) : false}
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg text-sm hover:bg-blue-700 transition shadow-sm disabled:opacity-50"
                  >
                    Gerar / Salvar O.S.
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isWhatsAppGuideOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden border border-slate-100"
            >
              <div className="bg-emerald-600 px-5 py-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <Share2 size={20} />
                  <h3 className="font-bold text-base">Enviar por WhatsApp</h3>
                </div>
                <button
                  onClick={() => setIsWhatsAppGuideOpen(false)}
                  className="text-white/80 hover:text-white transition"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100 flex items-center gap-2.5 text-xs">
                  <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold shrink-0">✓</div>
                  <div>
                    <p className="font-bold">PDF baixado com sucesso!</p>
                    <p className="text-[11px] text-emerald-700/90 font-mono">Arquivo: {whatsAppGuideFileName}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Devido às limitações de segurança dos navegadores e do próprio WhatsApp, não é possível anexar arquivos automaticamente através de links externos.
                </p>

                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Como enviar para o cliente:</span>
                  
                  <div className="flex gap-3 items-start">
                    <span className="w-5 h-5 bg-blue-100 text-blue-700 font-bold text-xs rounded-full flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <p className="text-xs text-slate-600 font-medium">
                      Clique no botão verde abaixo para <strong>Abrir o WhatsApp</strong> (a conversa com o cliente será iniciada com o texto preenchido).
                    </p>
                  </div>

                  <div className="flex gap-3 items-start">
                    <span className="w-5 h-5 bg-blue-100 text-blue-700 font-bold text-xs rounded-full flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <p className="text-xs text-slate-600 font-medium">
                      No WhatsApp, clique no botão de <strong>Anexo (ícone de clipe 📎 ou +)</strong>.
                    </p>
                  </div>

                  <div className="flex gap-3 items-start">
                    <span className="w-5 h-5 bg-blue-100 text-blue-700 font-bold text-xs rounded-full flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <p className="text-xs text-slate-600 font-medium">
                      Selecione o arquivo PDF de orçamento que acabou de ser baixado e envie!
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <a
                    href={whatsAppGuideUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setIsWhatsAppGuideOpen(false)}
                    className="w-full py-2.5 bg-emerald-600 text-white font-bold text-sm text-center rounded-lg hover:bg-emerald-700 transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Share2 size={16} />
                    <span>Abrir Conversa no WhatsApp</span>
                  </a>
                  <button
                    onClick={() => setIsWhatsAppGuideOpen(false)}
                    className="w-full py-2 border border-slate-200 text-slate-600 font-bold text-xs text-center rounded-lg hover:bg-slate-50 transition"
                  >
                    Fechar Instruções
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
