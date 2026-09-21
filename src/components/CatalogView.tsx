import React, { useState } from 'react';
import { CatalogItem, CatalogCategory } from '../types';
import { 
  Wrench, 
  Search, 
  Plus, 
  Tag, 
  Percent, 
  DollarSign, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  FileText, 
  Sparkles, 
  ShieldCheck, 
  ChevronRight,
  Package,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CatalogViewProps {
  catalogItems: CatalogItem[];
  onSaveItem: (item: CatalogItem) => void;
  onDeleteItem: (id: string) => void;
  onSelectForServiceOrder?: (item: CatalogItem) => void;
}

const CATEGORIES: CatalogCategory[] = [
  'Higienização & Limpeza',
  'Instalação',
  'Conserto & Reparo',
  'Carga de Gás / Fluido',
  'Peças & Componentes',
  'Insumos & Materiais',
  'Visita & Laudo'
];

export default function CatalogView({
  catalogItems,
  onSaveItem,
  onDeleteItem,
  onSelectForServiceOrder
}: CatalogViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'servico' | 'peca'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<CatalogCategory>('Higienização & Limpeza');
  const [formType, setFormType] = useState<'servico' | 'peca'>('servico');
  const [formPrice, setFormPrice] = useState<number>(180);
  const [formCostPrice, setFormCostPrice] = useState<number>(30);
  const [formUnit, setFormUnit] = useState<string>('serviço');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formWarrantyMonths, setFormWarrantyMonths] = useState<number>(3);

  // Filtered items
  const filteredItems = catalogItems.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' ? true : item.category === selectedCategory;
    const matchesType = typeFilter === 'all' ? true : item.type === typeFilter;

    return matchesSearch && matchesCategory && matchesType;
  });

  // Calculate stats
  const totalServices = catalogItems.filter(i => i.type === 'servico').length;
  const totalParts = catalogItems.filter(i => i.type === 'peca').length;
  const averageServicePrice = catalogItems
    .filter(i => i.type === 'servico')
    .reduce((acc, i) => acc + i.defaultPrice, 0) / (totalServices || 1);

  const openAddModal = () => {
    setEditingItem(null);
    setFormName('');
    setFormCategory('Higienização & Limpeza');
    setFormType('servico');
    setFormPrice(180);
    setFormCostPrice(30);
    setFormUnit('serviço');
    setFormDescription('');
    setFormWarrantyMonths(3);
    setIsModalOpen(true);
  };

  const openEditModal = (item: CatalogItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormType(item.type);
    setFormPrice(item.defaultPrice);
    setFormCostPrice(item.costPrice || 0);
    setFormUnit(item.unit);
    setFormDescription(item.description || '');
    setFormWarrantyMonths(item.defaultWarrantyMonths || 3);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || formPrice <= 0) {
      alert('Preencha o nome do item e o valor de venda.');
      return;
    }

    const item: CatalogItem = {
      id: editingItem ? editingItem.id : `cat-${Date.now()}`,
      name: formName.trim(),
      category: formCategory,
      type: formType,
      defaultPrice: formPrice,
      costPrice: formCostPrice > 0 ? formCostPrice : undefined,
      unit: formUnit,
      description: formDescription.trim() || undefined,
      defaultWarrantyMonths: formWarrantyMonths > 0 ? formWarrantyMonths : undefined
    };

    onSaveItem(item);
    setIsModalOpen(false);
  };

  // Helper for margin
  const getMargin = (price: number, cost?: number) => {
    if (!cost || cost <= 0) return null;
    const profit = price - cost;
    const marginPct = (profit / price) * 100;
    return {
      profit,
      marginPct: Math.round(marginPct)
    };
  };

  return (
    <div className="space-y-6" id="catalog-container">
      
      {/* Top Banner inspired by Agenda Boa */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-xs text-white shrink-0">
            <Wrench size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
                Estilo Agenda Boa
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                Tabela de Preços & Margem
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Catálogo de Serviços & Peças
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed mt-0.5">
              Padronize seus valores de higienização, instalação, cargas de gás e consertos para preencher orçamentos, ordens de serviço e recibos com apenas 1 clique.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            id="btn-add-catalog-item"
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Plus size={16} />
            <span>Cadastrar Serviço / Peça</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Serviços Padronizados</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900">
              {totalServices}
            </span>
            <span className="text-xs text-slate-400">cadastrados</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Peças & Insumos</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900">
              {totalParts}
            </span>
            <span className="text-xs text-slate-400">no catálogo</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Média de Mão de Obra</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-blue-700 font-mono">
              R$ {averageServicePrice.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400">por atendimento</span>
          </div>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="search-catalog"
              type="text"
              placeholder="Buscar serviço, instalação, peça ou código..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${typeFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Todos ({catalogItems.length})
            </button>
            <button
              onClick={() => setTypeFilter('servico')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${typeFilter === 'servico' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Apenas Serviços ({totalServices})
            </button>
            <button
              onClick={() => setTypeFilter('peca')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${typeFilter === 'peca' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Apenas Peças ({totalParts})
            </button>
          </div>
        </div>

        {/* Category Pill Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              selectedCategory === 'all' 
                ? 'bg-blue-600 text-white shadow-2xs' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Todas as Categorias
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat 
                  ? 'bg-blue-600 text-white shadow-2xs' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Package size={26} />
          </div>
          <h3 className="font-bold text-slate-800 text-base">Nenhum item encontrado</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Cadastre os serviços e peças que sua oficina mais realiza para agilizar a criação de orçamentos e OSs.
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Plus size={15} />
            <span>Adicionar Novo Item</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(item => {
            const margin = getMargin(item.defaultPrice, item.costPrice);

            return (
              <div 
                key={item.id}
                id={`catalog-item-${item.id}`}
                className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 shadow-2xs hover:shadow-sm transition p-5 flex flex-col justify-between gap-3"
              >
                <div className="space-y-2.5">
                  {/* Category and Type badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                      {item.category}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      item.type === 'servico' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {item.type === 'servico' ? 'Serviço' : 'Peça / Material'}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm leading-snug">
                      {item.name}
                    </h4>
                    {item.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Price Box */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Preço ao Cliente</span>
                      <div className="text-right">
                        <span className="text-lg font-black text-slate-900 font-mono">
                          R$ {item.defaultPrice.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400 block">/ {item.unit}</span>
                      </div>
                    </div>

                    {item.costPrice && item.costPrice > 0 && (
                      <div className="pt-1.5 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Custo: R$ {item.costPrice.toFixed(2)}</span>
                        {margin && (
                          <span className="font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded">
                            <Percent size={11} />
                            <span>{margin.marginPct}% margem (R$ {margin.profit.toFixed(2)})</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Warranty */}
                  {item.defaultWarrantyMonths && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <ShieldCheck size={13} className="text-blue-600" />
                      <span>Garantia padrão de {item.defaultWarrantyMonths} meses</span>
                    </div>
                  )}
                </div>

                {/* Card footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {onSelectForServiceOrder && (
                    <button
                      onClick={() => onSelectForServiceOrder(item)}
                      className="py-1.5 px-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      title="Usar em uma Ordem de Serviço"
                    >
                      <Plus size={13} />
                      <span>Usar na OS</span>
                    </button>
                  )}

                  <div className="flex items-center gap-1 ml-auto">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Editar item"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Deseja excluir "${item.name}" do catálogo?`)) {
                          onDeleteItem(item.id);
                        }
                      }}
                      className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                      title="Excluir item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal - Cadastro/Edição de Item do Catálogo */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="modal-catalog-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full max-h-[90vh] overflow-y-auto flex flex-col"
              id="modal-catalog-container"
            >
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <Wrench size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                      {editingItem ? 'Editar Item do Catálogo' : 'Novo Serviço ou Peça'}
                    </h3>
                    <p className="text-[11px] text-slate-500">Defina valor de venda, custos e detalhes do serviço</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-xs">
                {/* Type Selection */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Tipo de Item *
                  </label>
                  <div className="grid grid-cols-2 p-0.5 bg-slate-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setFormType('servico')}
                      className={`py-2 rounded-lg font-bold transition text-xs cursor-pointer ${
                        formType === 'servico' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-500'
                      }`}
                    >
                      Mão de Obra / Serviço
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormType('peca')}
                      className={`py-2 rounded-lg font-bold transition text-xs cursor-pointer ${
                        formType === 'peca' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-500'
                      }`}
                    >
                      Peça / Insumo / Material
                    </button>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Nome do Serviço ou Peça *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ex: Higienização Split High Wall 9.000 a 12.000 BTUs"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-slate-900"
                  />
                </div>

                {/* Category & Unit */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Categoria *
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as CatalogCategory)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                    >
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Unidade de Medida
                    </label>
                    <input
                      type="text"
                      value={formUnit}
                      onChange={(e) => setFormUnit(e.target.value)}
                      placeholder="serviço, un, kg, metro..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                {/* Prices: Sale Price and Cost Price */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                  <div>
                    <label className="block text-[10px] font-bold text-blue-900 uppercase tracking-wider mb-1">
                      Preço de Venda (R$) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      required
                      value={formPrice || ''}
                      onChange={(e) => setFormPrice(Number(e.target.value))}
                      placeholder="180.00"
                      className="w-full px-3 py-2 border border-blue-200 rounded-lg font-mono font-extrabold text-blue-950 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-blue-900 uppercase tracking-wider mb-1">
                      Preço de Custo (R$) - Opcional
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formCostPrice || ''}
                      onChange={(e) => setFormCostPrice(Number(e.target.value))}
                      placeholder="30.00"
                      className="w-full px-3 py-2 border border-blue-200 rounded-lg font-mono text-slate-700 bg-white"
                    />
                    {formCostPrice > 0 && formPrice > formCostPrice && (
                      <span className="text-[10px] text-emerald-700 font-bold block mt-1">
                        Lucro bruto: R$ {(formPrice - formCostPrice).toFixed(2)} ({Math.round(((formPrice - formCostPrice) / formPrice) * 100)}%)
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Descrição Detalhada do Serviço (Sai nos orçamentos)
                  </label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Ex: Desmontagem frontal, higienização de serpentina, turbina e dreno com bactericida hospitalar."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                {/* Warranty */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Garantia Recomendada (Meses)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={formWarrantyMonths}
                    onChange={(e) => setFormWarrantyMonths(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                {/* Actions */}
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
                    <Check size={16} />
                    <span>Salvar no Catálogo</span>
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
