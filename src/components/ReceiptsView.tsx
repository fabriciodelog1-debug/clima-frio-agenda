import React, { useState } from 'react';
import { Receipt, Customer, ServiceOrder, CompanyProfile, PaymentMethod } from '../types';
import { numberToCurrencyWords } from '../utils/numberToWords';
import SignaturePadModal from './SignaturePadModal';
import { 
  Receipt as ReceiptIcon, 
  Plus, 
  Search, 
  Share2, 
  Printer, 
  CheckCircle2, 
  Calendar, 
  DollarSign, 
  CreditCard, 
  User, 
  FileText, 
  PenTool, 
  Trash2, 
  X, 
  Copy, 
  Check, 
  ArrowUpRight,
  Sparkles,
  Building,
  Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ReceiptsViewProps {
  receipts: Receipt[];
  customers: Customer[];
  serviceOrders: ServiceOrder[];
  onSaveReceipt: (receipt: Receipt) => void;
  onDeleteReceipt: (id: string) => void;
  initialReceiptData?: Partial<Receipt> | null;
  onClearInitialData?: () => void;
}

export default function ReceiptsView({
  receipts,
  customers,
  serviceOrders,
  onSaveReceipt,
  onDeleteReceipt,
  initialReceiptData,
  onClearInitialData
}: ReceiptsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReceiptForPrint, setSelectedReceiptForPrint] = useState<Receipt | null>(null);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states for creating/editing receipt
  const [formId, setFormId] = useState('');
  const [formReceiptNumber, setFormReceiptNumber] = useState('');
  const [formCustomerId, setFormCustomerId] = useState('');
  const [formCustomerName, setFormCustomerName] = useState('');
  const [formCustomerCpfCnpj, setFormCustomerCpfCnpj] = useState('');
  const [formCustomerPhone, setFormCustomerPhone] = useState('');
  const [formAmount, setFormAmount] = useState<number>(180);
  const [formPaymentMethod, setFormPaymentMethod] = useState<PaymentMethod>('Pix');
  const [formPaymentDate, setFormPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formServiceDescription, setFormServiceDescription] = useState('');
  const [formLinkedOsId, setFormLinkedOsId] = useState('');
  const [formSignatureUrl, setFormSignatureUrl] = useState<string | undefined>(undefined);
  const [formNotes, setFormNotes] = useState('');

  // Load company profile for header in print
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);

  React.useEffect(() => {
    const storedCompany = localStorage.getItem('climafrio_company_profile');
    if (storedCompany) {
      setCompanyProfile(JSON.parse(storedCompany));
    }
  }, []);

  React.useEffect(() => {
    if (initialReceiptData) {
      setFormId(`rec-${Date.now()}`);
      setFormReceiptNumber(`REC-${new Date().getFullYear()}-${String(receipts.length + 1).padStart(3, '0')}`);
      setFormCustomerName(initialReceiptData.customerName || '');
      setFormCustomerCpfCnpj(initialReceiptData.customerDocument || '');
      setFormAmount(initialReceiptData.amount || 0);
      setFormServiceDescription(initialReceiptData.description || '');
      setFormLinkedOsId(initialReceiptData.serviceOrderId || '');
      setFormPaymentMethod('Pix');
      setFormPaymentDate(new Date().toISOString().split('T')[0]);
      setFormSignatureUrl(undefined);
      setFormNotes('Pagamento confirmado via Ordem de Serviço.');
      setIsModalOpen(true);
      if (onClearInitialData) {
        onClearInitialData();
      }
    }
  }, [initialReceiptData]);

  // Filtered receipts
  const filteredReceipts = receipts.filter(r => {
    const matchesSearch = 
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.serviceDescription.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesMethod = methodFilter === 'all' ? true : r.paymentMethod === methodFilter;

    return matchesSearch && matchesMethod;
  }).sort((a, b) => b.paymentDate.localeCompare(a.paymentDate));

  // Stats
  const totalAmountReceived = receipts.reduce((acc, r) => acc + r.amount, 0);
  const pixReceiptsCount = receipts.filter(r => r.paymentMethod === 'Pix').length;

  const openNewReceiptModal = (fromOs?: ServiceOrder) => {
    const nextSeq = String(receipts.length + 1).padStart(3, '0');
    const currentYear = new Date().getFullYear();
    const newNumber = `${nextSeq}/${currentYear}`;

    setFormId(`REC-${currentYear}-${nextSeq}`);
    setFormReceiptNumber(newNumber);
    setFormPaymentDate(new Date().toISOString().split('T')[0]);
    setFormPaymentMethod('Pix');
    setFormNotes('');
    setFormSignatureUrl(undefined);

    if (fromOs) {
      setFormLinkedOsId(fromOs.id);
      setFormCustomerId(fromOs.customerId);
      const cust = customers.find(c => c.id === fromOs.customerId);
      setFormCustomerName(cust?.name || 'Cliente');
      setFormCustomerCpfCnpj(cust?.cpfCnpj || '');
      setFormCustomerPhone(cust?.phone || '');
      setFormAmount(fromOs.totalValue);
      setFormServiceDescription(fromOs.servicePerformed || fromOs.issueReported || 'Serviços de climatização e refrigeração');
    } else {
      setFormLinkedOsId('');
      setFormCustomerId('');
      setFormCustomerName('');
      setFormCustomerCpfCnpj('');
      setFormCustomerPhone('');
      setFormAmount(180);
      setFormServiceDescription('Higienização preventiva completa de ar condicionado Split High Wall.');
    }

    setIsModalOpen(true);
  };

  const handleCustomerSelect = (customerId: string) => {
    setFormCustomerId(customerId);
    const cust = customers.find(c => c.id === customerId);
    if (cust) {
      setFormCustomerName(cust.name);
      setFormCustomerCpfCnpj(cust.cpfCnpj);
      setFormCustomerPhone(cust.phone);
    }
  };

  const handleLinkedOsSelect = (osId: string) => {
    setFormLinkedOsId(osId);
    const os = serviceOrders.find(o => o.id === osId);
    if (os) {
      setFormCustomerId(os.customerId);
      const cust = customers.find(c => c.id === os.customerId);
      if (cust) {
        setFormCustomerName(cust.name);
        setFormCustomerCpfCnpj(cust.cpfCnpj);
        setFormCustomerPhone(cust.phone);
      }
      setFormAmount(os.totalValue);
      setFormServiceDescription(os.servicePerformed || os.issueReported || 'Serviços de manutenção');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCustomerName || formAmount <= 0) {
      alert('Preencha o nome do cliente e o valor do recibo.');
      return;
    }

    const receipt: Receipt = {
      id: formId || `REC-${Date.now()}`,
      receiptNumber: formReceiptNumber,
      customerId: formCustomerId,
      customerName: formCustomerName,
      customerCpfCnpj: formCustomerCpfCnpj || undefined,
      customerPhone: formCustomerPhone || undefined,
      amount: formAmount,
      amountInWords: numberToCurrencyWords(formAmount),
      paymentMethod: formPaymentMethod,
      paymentDate: formPaymentDate,
      serviceDescription: formServiceDescription,
      linkedOsId: formLinkedOsId || undefined,
      signatureUrl: formSignatureUrl,
      notes: formNotes || undefined,
      createdAt: new Date().toISOString()
    };

    onSaveReceipt(receipt);
    setIsModalOpen(false);
  };

  const generateWhatsAppMessage = (r: Receipt) => {
    const companyName = companyProfile?.name || 'Clima Frio Climatização';
    const dateFormatted = new Date(r.paymentDate + 'T12:00:00').toLocaleDateString('pt-BR');
    
    return encodeURIComponent(
      `*RECIBO DE PAGAMENTO - ${companyName.toUpperCase()}*\n\n` +
      `Olá *${r.customerName}*, confirmamos com sucesso o recebimento do seu pagamento!\n\n` +
      `📄 *Recibo Nº:* ${r.receiptNumber}\n` +
      `💰 *Valor Pago:* R$ ${r.amount.toFixed(2)} (${r.amountInWords})\n` +
      `📅 *Data de Pagamento:* ${dateFormatted}\n` +
      `💳 *Forma de Pagamento:* ${r.paymentMethod}\n` +
      `🛠️ *Serviço:* ${r.serviceDescription}\n` +
      (r.linkedOsId ? `📋 *Ordem de Serviço:* ${r.linkedOsId}\n` : '') +
      `\nAgradecemos pela preferência e confiança em nossos serviços de climatização e refrigeração! Qualquer dúvida estamos à disposição.`
    );
  };

  const handleShareWhatsApp = (r: Receipt) => {
    const rawPhone = r.customerPhone?.replace(/\D/g, '') || '';
    const phone = rawPhone.length >= 10 ? `55${rawPhone}` : '';
    const message = generateWhatsAppMessage(r);
    const url = phone ? `https://wa.me/${phone}?text=${message}` : `https://wa.me/?text=${message}`;
    window.open(url, '_blank');
  };

  const handleCopyText = (r: Receipt) => {
    const companyName = companyProfile?.name || 'Clima Frio Climatização';
    const dateFormatted = new Date(r.paymentDate + 'T12:00:00').toLocaleDateString('pt-BR');
    const text = 
      `*RECIBO DE PAGAMENTO - ${companyName.toUpperCase()}*\n\n` +
      `Olá ${r.customerName}, confirmamos com sucesso o recebimento do seu pagamento!\n\n` +
      `• Recibo Nº: ${r.receiptNumber}\n` +
      `• Valor Pago: R$ ${r.amount.toFixed(2)} (${r.amountInWords})\n` +
      `• Data: ${dateFormatted}\n` +
      `• Forma de Pagamento: ${r.paymentMethod}\n` +
      `• Serviço: ${r.serviceDescription}\n` +
      `\nAgradecemos pela preferência!`;

    navigator.clipboard.writeText(text);
    setCopiedId(r.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6" id="receipts-container">
      
      {/* Top Banner & Quick Metrics */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white p-5 sm:p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-xs text-white shrink-0">
            <ReceiptIcon size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                Estilo Agenda Boa
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-400/30 text-emerald-100 px-2 py-0.5 rounded-full">
                Comprovante Legal com Assinatura
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Emissão de Recibos de Pagamento
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed mt-0.5">
              Gere comprovantes profissionais com valor por extenso, forma de pagamento, assinatura digital na tela e envio em 1 clique no WhatsApp ou impressão em PDF.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            id="btn-new-receipt"
            onClick={() => openNewReceiptModal()}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-blue-700 hover:bg-blue-50 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Plus size={16} />
            <span>Novo Recibo</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total em Recibos</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900 font-mono">
              R$ {totalAmountReceived.toFixed(2)}
            </span>
            <span className="text-xs font-semibold text-emerald-600">
              {receipts.length} recibos
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mais Utilizado</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-black text-slate-900">
              Pix ({pixReceiptsCount})
            </span>
            <span className="text-xs text-slate-400">
              Pagamentos instantâneos
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assinatura Digital</span>
            <span className="text-xs text-slate-600 font-semibold block mt-1">
              Coleta na tela do smartphone
            </span>
          </div>
          <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <PenTool size={18} />
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="search-receipts"
            type="text"
            placeholder="Buscar por cliente, número ou serviço..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['all', 'Pix', 'Dinheiro', 'Cartão de Crédito', 'Transferência Bancária'].map((m) => (
            <button
              key={m}
              onClick={() => setMethodFilter(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                methodFilter === m 
                  ? 'bg-blue-600 text-white shadow-2xs' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {m === 'all' ? 'Todos os Métodos' : m}
            </button>
          ))}
        </div>
      </div>

      {/* Receipts List */}
      {filteredReceipts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <ReceiptIcon size={26} />
          </div>
          <h3 className="font-bold text-slate-800 text-base">Nenhum recibo encontrado</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Emita recibos formais de pagamento para seus clientes e compartilhe no WhatsApp imediatamente.
          </p>
          <button
            onClick={() => openNewReceiptModal()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Plus size={15} />
            <span>Emitir Primeiro Recibo</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReceipts.map((r) => {
            const dateFormatted = new Date(r.paymentDate + 'T12:00:00').toLocaleDateString('pt-BR');

            return (
              <div 
                key={r.id}
                id={`receipt-card-${r.id}`}
                className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 shadow-2xs hover:shadow-sm transition p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  {/* Top card header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-blue-700">
                        <span>Recibo Nº</span>
                        <span className="bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">{r.receiptNumber}</span>
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-sm mt-1 line-clamp-1">
                        {r.customerName}
                      </h4>
                    </div>

                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 flex items-center gap-1">
                      <CheckCircle2 size={11} />
                      <span>{r.paymentMethod}</span>
                    </span>
                  </div>

                  {/* Value display */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Valor Recebido</span>
                      <span className="text-base font-black text-slate-900 font-mono">
                        R$ {r.amount.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 italic line-clamp-1">
                      "{r.amountInWords}"
                    </p>
                  </div>

                  {/* Service info */}
                  <div className="text-xs text-slate-600 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Serviço Realizado</span>
                    <p className="line-clamp-2 text-slate-700 text-[11px] leading-relaxed">
                      {r.serviceDescription}
                    </p>
                  </div>

                  {/* Meta info */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} className="text-slate-400" />
                      <span>{dateFormatted}</span>
                    </div>
                    {r.signatureUrl && (
                      <span className="text-indigo-600 font-semibold flex items-center gap-1 text-[10px]">
                        <PenTool size={11} /> Assinado
                      </span>
                    )}
                    {r.linkedOsId && (
                      <span className="text-blue-600 font-mono text-[10px]">
                        {r.linkedOsId}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleShareWhatsApp(r)}
                    className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    title="Enviar recibo pelo WhatsApp"
                  >
                    <Share2 size={13} />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={() => setSelectedReceiptForPrint(r)}
                    className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    title="Visualizar / Imprimir em PDF"
                  >
                    <Printer size={13} />
                    <span>PDF</span>
                  </button>

                  <button
                    onClick={() => handleCopyText(r)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                    title="Copiar texto do recibo"
                  >
                    {copiedId === r.id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('Deseja excluir este recibo?')) {
                        onDeleteReceipt(r.id);
                      }
                    }}
                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                    title="Excluir recibo"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal - Novo Recibo */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="modal-receipt-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full max-h-[90vh] overflow-y-auto flex flex-col"
              id="modal-receipt-container"
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <ReceiptIcon size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">Emitir Recibo de Pagamento</h3>
                    <p className="text-[11px] text-slate-500">Preencha os dados e colete a assinatura na tela</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-xs">
                
                {/* Number & Date */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Número do Recibo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formReceiptNumber}
                      onChange={(e) => setFormReceiptNumber(e.target.value)}
                      placeholder="Ex: 001/2026"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-bold text-blue-700 bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Data do Pagamento *
                    </label>
                    <input
                      type="date"
                      required
                      value={formPaymentDate}
                      onChange={(e) => setFormPaymentDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                {/* Link to OS (Optional) */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Vincular a uma Ordem de Serviço (Opcional)
                  </label>
                  <select
                    value={formLinkedOsId}
                    onChange={(e) => handleLinkedOsSelect(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="">Sem vínculo / Recibo avulso</option>
                    {serviceOrders.map(os => {
                      const cust = customers.find(c => c.id === os.customerId);
                      return (
                        <option key={os.id} value={os.id}>
                          {os.id} - {cust?.name || 'Cliente'} (R$ {os.totalValue.toFixed(2)})
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Customer selection */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Selecionar Cliente Cadastrado
                  </label>
                  <select
                    value={formCustomerId}
                    onChange={(e) => handleCustomerSelect(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="">Digitar nome manualmente ou selecione...</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Manual customer fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Nome do Cliente / Empresa *
                    </label>
                    <input
                      type="text"
                      required
                      value={formCustomerName}
                      onChange={(e) => setFormCustomerName(e.target.value)}
                      placeholder="Ex: Roberto Souza"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      CPF ou CNPJ
                    </label>
                    <input
                      type="text"
                      value={formCustomerCpfCnpj}
                      onChange={(e) => setFormCustomerCpfCnpj(e.target.value)}
                      placeholder="000.000.000-00"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    WhatsApp / Telefone para Envio
                  </label>
                  <input
                    type="text"
                    value={formCustomerPhone}
                    onChange={(e) => setFormCustomerPhone(e.target.value)}
                    placeholder="(11) 98765-4321"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                {/* Amount and Payment Method */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                  <div>
                    <label className="block text-[10px] font-bold text-blue-900 uppercase tracking-wider mb-1">
                      Valor Recebido (R$) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      required
                      value={formAmount || ''}
                      onChange={(e) => setFormAmount(Number(e.target.value))}
                      placeholder="180.00"
                      className="w-full px-3 py-2 border border-blue-200 rounded-lg font-mono font-extrabold text-base text-blue-950 bg-white"
                    />
                    <span className="text-[10px] text-blue-700 italic block mt-1 line-clamp-1">
                      Extenso: {numberToCurrencyWords(formAmount)}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-blue-900 uppercase tracking-wider mb-1">
                      Forma de Pagamento *
                    </label>
                    <select
                      value={formPaymentMethod}
                      onChange={(e) => setFormPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full px-3 py-2 border border-blue-200 rounded-lg bg-white font-semibold text-slate-800"
                    >
                      <option value="Pix">Pix</option>
                      <option value="Dinheiro">Dinheiro</option>
                      <option value="Cartão de Crédito">Cartão de Crédito</option>
                      <option value="Cartão de Débito">Cartão de Débito</option>
                      <option value="Transferência Bancária">Transferência Bancária</option>
                      <option value="Boleto">Boleto Bancário</option>
                    </select>
                  </div>
                </div>

                {/* Service description */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Referente aos Serviços de *
                    </label>
                    {/* Quick presets */}
                    <div className="flex items-center gap-1 text-[10px] text-blue-600">
                      <span className="text-slate-400">Inserir rápido:</span>
                      <button
                        type="button"
                        onClick={() => setFormServiceDescription('Higienização preventiva de Split com aplicação de bactericida.')}
                        className="hover:underline font-semibold"
                      >
                        Higienização
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => setFormServiceDescription('Instalação completa de ar condicionado Split com suporte e teste de vácuo.')}
                        className="hover:underline font-semibold"
                      >
                        Instalação
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => setFormServiceDescription('Carga de fluido refrigerante R410A e reparo de vazamento.')}
                        className="hover:underline font-semibold"
                      >
                        Carga de Gás
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={3}
                    required
                    value={formServiceDescription}
                    onChange={(e) => setFormServiceDescription(e.target.value)}
                    placeholder="Descreva detalhadamente o serviço ou conserto realizado..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                {/* Digital Signature Pad trigger */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Assinatura Digital do Cliente / Responsável</span>
                      <span className="text-[10px] text-slate-500 block">Coletar assinatura no celular ou tablet</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsSignatureModalOpen(true)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <PenTool size={13} />
                      <span>{formSignatureUrl ? 'Alterar Assinatura' : 'Assinar na Tela'}</span>
                    </button>
                  </div>

                  {formSignatureUrl && (
                    <div className="p-2 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                      <img src={formSignatureUrl} alt="Assinatura" className="h-10 max-w-[200px] object-contain" />
                      <button
                        type="button"
                        onClick={() => setFormSignatureUrl(undefined)}
                        className="text-[10px] text-red-600 hover:underline font-semibold"
                      >
                        Remover
                      </button>
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Observações Internas ou Garantia (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Ex: Garantia de 90 dias dos serviços prestados."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                {/* Footer buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 size={16} />
                    <span>Salvar e Emitir Recibo</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Signature Pad Modal Component */}
      <SignaturePadModal
        isOpen={isSignatureModalOpen}
        title="Assinatura Digital do Recibo"
        subtitle="O cliente ou responsável pode assinar com o dedo ou caneta stylus diretamente na tela."
        initialSignature={formSignatureUrl}
        onClose={() => setIsSignatureModalOpen(false)}
        onSave={(dataUrl) => setFormSignatureUrl(dataUrl)}
      />

      {/* Modal - Visualização & Impressão em PDF do Recibo */}
      <AnimatePresence>
        {selectedReceiptForPrint && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="modal-print-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[92vh] overflow-y-auto flex flex-col"
              id="modal-print-container"
            >
              {/* Action bar for printing and sharing */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10 print:hidden">
                <div className="flex items-center gap-2">
                  <ReceiptIcon size={18} className="text-blue-600" />
                  <span className="font-bold text-slate-800 text-sm">Recibo Nº {selectedReceiptForPrint.receiptNumber}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleShareWhatsApp(selectedReceiptForPrint)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Share2 size={14} />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Printer size={14} />
                    <span>Imprimir / PDF</span>
                  </button>

                  <button
                    onClick={() => setSelectedReceiptForPrint(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* PRINTABLE RECEIPT SHEET */}
              <div className="p-6 sm:p-8 space-y-6 text-slate-800 font-sans" id="printable-receipt-document">
                
                {/* Header Banner / Company Info */}
                <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    {companyProfile?.bannerUrl ? (
                      <img 
                        src={companyProfile.bannerUrl} 
                        alt="Logo da Empresa" 
                        className="h-14 object-contain mb-2" 
                      />
                    ) : (
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                        {companyProfile?.name || 'CLIMA FRIO CLIMATIZAÇÃO'}
                      </h2>
                    )}
                    <p className="text-xs font-semibold text-slate-600">
                      {companyProfile?.slogan || 'Instalação, Manutenção e Soluções em Ar Condicionado'}
                    </p>
                    <div className="text-[11px] text-slate-500 mt-1 space-y-0.5">
                      <p>CNPJ: {companyProfile?.cnpj || '00.000.000/0001-00'} • Telefone: {companyProfile?.phone || '(11) 98765-4321'}</p>
                      <p>{companyProfile?.address.street}, {companyProfile?.address.number} - {companyProfile?.address.city}/{companyProfile?.address.state}</p>
                    </div>
                  </div>

                  {/* Receipt Number & Value Box */}
                  <div className="border-2 border-slate-900 p-3.5 rounded-xl text-center shrink-0 bg-slate-50 sm:min-w-[190px]">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block">RECIBO Nº</span>
                    <span className="text-lg font-black text-slate-900 font-mono block">
                      {selectedReceiptForPrint.receiptNumber}
                    </span>
                    <div className="mt-1 pt-1 border-t border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">VALOR</span>
                      <span className="text-xl font-black text-emerald-700 font-mono block">
                        R$ {selectedReceiptForPrint.amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Declaration Body (Texto formal do recibo) */}
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 text-xs leading-relaxed">
                  <p className="text-justify text-slate-800">
                    Recebemos de <strong className="font-extrabold text-slate-950 uppercase">{selectedReceiptForPrint.customerName}</strong>
                    {selectedReceiptForPrint.customerCpfCnpj ? `, inscrito(a) no CPF/CNPJ sob o nº ${selectedReceiptForPrint.customerCpfCnpj}` : ''}, 
                    a quantia líquida e certa de <strong className="font-black text-slate-900 font-mono">R$ {selectedReceiptForPrint.amount.toFixed(2)}</strong> (<em>{selectedReceiptForPrint.amountInWords}</em>), 
                    efetuada através de <strong className="font-bold text-blue-800">{selectedReceiptForPrint.paymentMethod}</strong>.
                  </p>

                  <div className="pt-2 border-t border-slate-200 space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Referente a:</span>
                    <p className="font-medium text-slate-800 bg-white p-3 rounded-xl border border-slate-200">
                      {selectedReceiptForPrint.serviceDescription}
                    </p>
                  </div>

                  {selectedReceiptForPrint.linkedOsId && (
                    <div className="text-[11px] text-slate-500">
                      Ordem de Serviço Vinculada: <span className="font-mono font-bold text-slate-700">{selectedReceiptForPrint.linkedOsId}</span>
                    </div>
                  )}

                  {selectedReceiptForPrint.notes && (
                    <div className="text-[11px] text-slate-500 bg-blue-50/60 p-2.5 rounded-lg border border-blue-100">
                      <strong>Observações:</strong> {selectedReceiptForPrint.notes}
                    </div>
                  )}

                  <p className="text-[11px] text-slate-500 italic">
                    Para clareza e comprovação, firmamos o presente recibo dando plena, rasa e geral quitação pelo valor acima discriminado.
                  </p>
                </div>

                {/* Date & Signatures Section */}
                <div className="pt-4 space-y-8">
                  <div className="text-right text-xs text-slate-600 font-medium">
                    {companyProfile?.address.city || 'São Paulo'}, {new Date(selectedReceiptForPrint.paymentDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}.
                  </div>

                  <div className="grid grid-cols-2 gap-8 pt-4">
                    {/* Prestador / Empresa */}
                    <div className="text-center space-y-1">
                      <div className="h-14 border-b border-slate-400 flex items-end justify-center pb-1">
                        <span className="font-mono text-xs text-slate-400 tracking-wider">Assinatura do Prestador</span>
                      </div>
                      <span className="font-bold text-xs text-slate-800 block">
                        {companyProfile?.name || 'Clima Frio Climatização'}
                      </span>
                      <span className="text-[10px] text-slate-500 block">CNPJ {companyProfile?.cnpj || '00.000.000/0001-00'}</span>
                    </div>

                    {/* Cliente / Recebedor */}
                    <div className="text-center space-y-1">
                      <div className="h-14 border-b border-slate-400 flex items-end justify-center pb-1">
                        {selectedReceiptForPrint.signatureUrl ? (
                          <img 
                            src={selectedReceiptForPrint.signatureUrl} 
                            alt="Assinatura do Cliente" 
                            className="max-h-12 max-w-[180px] object-contain" 
                          />
                        ) : (
                          <span className="font-mono text-xs text-slate-400 tracking-wider">Assinatura do Cliente</span>
                        )}
                      </div>
                      <span className="font-bold text-xs text-slate-800 block truncate">
                        {selectedReceiptForPrint.customerName}
                      </span>
                      <span className="text-[10px] text-slate-500 block">Ciente e De Acordo</span>
                    </div>
                  </div>
                </div>

                {/* Stamp footer */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400 font-mono">
                  <span>Documento emitido pelo sistema Clima Frio</span>
                  <span>Autenticação: {selectedReceiptForPrint.id}</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
