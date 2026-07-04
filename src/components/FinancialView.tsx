import React, { useState } from 'react';
import { Transaction, ServiceOrder } from '../types';
import { DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Search, Plus, Calendar, Filter, X, CreditCard } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

interface FinancialViewProps {
  transactions: Transaction[];
  serviceOrders: ServiceOrder[];
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
}

const CATEGORIES_INFLOW = ['Instalação', 'Manutenção Preventiva', 'Manutenção Corretiva', 'Orçamento Pago', 'Outro'];
const CATEGORIES_OUTFLOW = ['Insumos', 'Combustível', 'Ferramentas', 'Refeição', 'Marketing', 'Impostos', 'Outro'];

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

export default function FinancialView({
  transactions,
  serviceOrders,
  onAddTransaction,
  onDeleteTransaction
}: FinancialViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form States
  const [formType, setFormType] = useState<'income' | 'expense'>('income');
  const [formAmount, setFormAmount] = useState<number>(0);
  const [formCategory, setFormCategory] = useState<string>('Instalação');
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formDescription, setFormDescription] = useState<string>('');

  // 1. Math calculations
  const totalIncomes = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const currentBalance = totalIncomes - totalExpenses;

  // Pending payments from Service Orders (Status: completed, paymentStatus: pending)
  const outstandingReceivable = serviceOrders
    .filter(so => so.status === 'completed' && so.paymentStatus === 'pending')
    .reduce((acc, so) => acc + so.totalValue, 0);

  // 2. Filter transactions
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = 
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' ? true : t.type === typeFilter;

    return matchesSearch && matchesType;
  }).sort((a, b) => b.date.localeCompare(a.date));

  // 3. Prepare Chart Data for Area Chart (Grouped by Date)
  const getChartData = () => {
    // Collect all unique dates
    const dates = Array.from(new Set(transactions.map(t => t.date))).sort();
    
    // Sum by date
    let cumulativeBalance = 0;
    return dates.map(date => {
      const dayIncomes = transactions.filter(t => t.date === date && t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
      const dayExpenses = transactions.filter(t => t.date === date && t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
      cumulativeBalance += (dayIncomes - dayExpenses);
      
      const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

      return {
        dateStr: formattedDate,
        'Receitas': dayIncomes,
        'Despesas': dayExpenses,
        'Saldo Acumulado': cumulativeBalance
      };
    });
  };

  // 4. Prepare Pie Chart Data for Expense Distribution
  const getExpensePieData = () => {
    const categories: { [key: string]: number } = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
      });

    return Object.keys(categories).map(cat => ({
      name: cat,
      value: categories[cat]
    }));
  };

  const handleOpenAdd = (type: 'income' | 'expense') => {
    setFormType(type);
    setFormAmount(0);
    setFormCategory(type === 'income' ? CATEGORIES_INFLOW[0] : CATEGORIES_OUTFLOW[0]);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormDescription('');
    setIsModalOpen(true);
  };

  const handleTypeChangeInForm = (type: 'income' | 'expense') => {
    setFormType(type);
    setFormCategory(type === 'income' ? CATEGORIES_INFLOW[0] : CATEGORIES_OUTFLOW[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formAmount <= 0 || !formDescription) return;

    onAddTransaction({
      type: formType,
      amount: Number(formAmount),
      category: formCategory,
      date: formDate,
      description: formDescription
    });

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja realmente remover esta transação?')) {
      onDeleteTransaction(id);
    }
  };

  const chartData = getChartData();
  const expensePieData = getExpensePieData();

  return (
    <div className="space-y-6" id="financial-view-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Financeiro & Caixa</h1>
          <p className="text-sm text-slate-500">Acompanhe receitas de O.S., gastos operacionais e saúde do negócio</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            id="btn-add-expense"
            onClick={() => handleOpenAdd('expense')}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 border border-red-200 text-red-600 font-semibold rounded-xl text-sm hover:bg-red-50 transition"
          >
            <Plus size={16} />
            <span>Nova Despesa</span>
          </button>
          <button
            id="btn-add-income"
            onClick={() => handleOpenAdd('income')}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition shadow-sm"
          >
            <Plus size={16} />
            <span>Nova Entrada</span>
          </button>
        </div>
      </div>

      {/* Numerical Indicators Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Balance Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Saldo Atual Caixa</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <DollarSign size={18} />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold font-mono text-slate-800">
              R$ {currentBalance.toFixed(2)}
            </span>
            <p className="text-[10px] text-slate-400 mt-1">Saldo acumulado geral</p>
          </div>
        </div>

        {/* Revenues Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Receitas Totais</span>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <TrendingUp size={18} />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold font-mono text-green-600">
              R$ {totalIncomes.toFixed(2)}
            </span>
            <p className="text-[10px] text-green-500 mt-1 flex items-center gap-0.5 font-medium">
              <ArrowUpRight size={12} /> Entradas registradas
            </p>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Despesas Pagas</span>
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <TrendingDown size={18} />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold font-mono text-red-500">
              R$ {totalExpenses.toFixed(2)}
            </span>
            <p className="text-[10px] text-red-500 mt-1 flex items-center gap-0.5 font-medium">
              <ArrowDownRight size={12} /> Saídas de materiais/veículo
            </p>
          </div>
        </div>

        {/* Receivable Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Valores Pendentes (A receber)</span>
            <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
              <CreditCard size={18} />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold font-mono text-slate-700">
              R$ {outstandingReceivable.toFixed(2)}
            </span>
            <p className="text-[10px] text-yellow-600 mt-1 font-semibold">
              O.S. Concluídas aguardando pgto
            </p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cashflow timeline chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Evolução Financeira</h3>
            <p className="text-xs text-slate-400">Ganhos acumulados e fluxo diário</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenues" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="dateStr" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                <Area type="monotone" dataKey="Receitas" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenues)" strokeWidth={2} />
                <Area type="monotone" dataKey="Saldo Acumulado" stroke="#2563eb" fillOpacity={1} fill="url(#colorBalance)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense share pie chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Distribuição de Despesas</h3>
            <p className="text-xs text-slate-400">Classificação de gastos do caixa</p>
          </div>

          {expensePieData.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs py-10">
              <TrendingDown className="text-slate-300 mb-2" size={24} />
              <span>Nenhuma despesa para exibir</span>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center">
              <div className="h-44 flex justify-center items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expensePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {expensePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `R$ ${Number(value).toFixed(2)}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend list */}
              <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1 text-[11px] mt-2">
                {expensePieData.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between text-slate-600">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="truncate">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-800 font-mono">R$ {item.value.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive ledger log list */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Livro Caixa / Histórico</h3>
            <p className="text-xs text-slate-400">Listagem de todas as movimentações financeiras executadas</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                id="ledger-search-input"
                type="text"
                placeholder="Filtrar por descrição, categoria..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-xs"
              />
            </div>

            {/* Inflow / Outflow toggle buttons */}
            <div className="flex border border-slate-100 rounded-lg p-0.5 bg-slate-50 shrink-0 text-xs font-semibold">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-3 py-1 rounded-md transition ${typeFilter === 'all' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Todas
              </button>
              <button
                onClick={() => setTypeFilter('income')}
                className={`px-3 py-1 rounded-md transition ${typeFilter === 'income' ? 'bg-white text-green-600 shadow-xs' : 'text-slate-500 hover:text-green-600'}`}
              >
                Entradas
              </button>
              <button
                onClick={() => setTypeFilter('expense')}
                className={`px-3 py-1 rounded-md transition ${typeFilter === 'expense' ? 'bg-white text-red-600 shadow-xs' : 'text-slate-500 hover:text-red-600'}`}
              >
                Saídas
              </button>
            </div>
          </div>
        </div>

        {/* Ledger Table/List */}
        <div className="divide-y divide-slate-50 overflow-x-auto">
          {filteredTransactions.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              Nenhuma movimentação financeira encontrada para os critérios selecionados.
            </div>
          ) : (
            filteredTransactions.map(t => (
              <div
                id={`ledger-row-${t.id}`}
                key={t.id}
                className="p-4 flex items-center justify-between gap-4 text-xs hover:bg-slate-50/50 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-xl shrink-0 ${t.type === 'income' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {t.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{t.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase">
                        {t.category}
                      </span>
                      {t.linkedOsId && (
                        <span className="text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-mono font-semibold">
                          Vinc: {t.linkedOsId}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 text-right">
                  <div>
                    <span className={`font-mono font-bold text-sm ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                      {t.type === 'income' ? '+' : '-'} R$ {t.amount.toFixed(2)}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1 font-mono justify-end">
                      <Calendar size={10} />
                      <span>{new Date(t.date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>

                  <button
                    id={`btn-delete-trans-${t.id}`}
                    onClick={() => handleDelete(t.id)}
                    className="p-1 text-slate-300 hover:text-red-500 rounded transition shrink-0"
                    title="Remover Registro"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal - Manual Transaction registration */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="ledger-modal-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full"
              id="ledger-modal-content"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-base">
                  Registrar {formType === 'income' ? 'Entrada / Receita' : 'Saída / Despesa'} manual
                </h3>
                <button
                  id="btn-close-ledger-modal"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
                {/* Type toggle */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Tipo de Registro</label>
                  <div className="grid grid-cols-2 p-0.5 bg-slate-100 rounded-lg">
                    <button
                      type="button"
                      onClick={() => handleTypeChangeInForm('income')}
                      className={`py-1.5 rounded-md font-semibold text-center transition ${formType === 'income' ? 'bg-white text-green-600 shadow-xs' : 'text-slate-500'}`}
                    >
                      Receita (Entrada)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTypeChangeInForm('expense')}
                      className={`py-1.5 rounded-md font-semibold text-center transition ${formType === 'expense' ? 'bg-white text-red-600 shadow-xs' : 'text-slate-500'}`}
                    >
                      Despesa (Saída)
                    </button>
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Valor Monetário (R$) *</label>
                  <input
                    id="form-ledger-amount"
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={formAmount === 0 ? '' : formAmount}
                    onChange={(e) => setFormAmount(Number(e.target.value))}
                    placeholder="Ex: 150.00"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-mono font-bold text-slate-800"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Data do Registro *</label>
                  <input
                    id="form-ledger-date"
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                  />
                </div>

                {/* Category select */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Categoria *</label>
                  <select
                    id="form-ledger-category"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white"
                  >
                    {formType === 'income' 
                      ? CATEGORIES_INFLOW.map(cat => <option key={cat} value={cat}>{cat}</option>)
                      : CATEGORIES_OUTFLOW.map(cat => <option key={cat} value={cat}>{cat}</option>)
                    }
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Descrição / Justificativa *</label>
                  <input
                    id="form-ledger-description"
                    type="text"
                    required
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Ex: Abastecimento de veículo Fiorino ou Compra de mangueira cristal dreno"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    id="btn-cancel-ledger"
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 font-medium rounded-lg text-xs hover:bg-slate-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    id="btn-save-ledger"
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg text-xs hover:bg-blue-700 transition shadow-sm"
                  >
                    Gravar Transação
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
