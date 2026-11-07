import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { AllocationMethod, Expense } from '../types/index.ts';
import { formatCurrency } from '../lib/calculations.ts';
import {
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Receipt,
  Trash2,
  CheckCircle2,
  X,
  User,
  DollarSign,
  Wallet,
} from 'lucide-react';

export const ExpensesView: React.FC = () => {
  const { expenses, addExpense, deleteExpense, members, selectedMonth } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  // Modal / Form state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [date, setDate] = useState<string>('2026-11-07');
  const [description, setDescription] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('Market / Bazaar');
  const [allocationMethod, setAllocationMethod] = useState<AllocationMethod>('meal_pool');
  const [isPersonalFund, setIsPersonalFund] = useState<boolean>(false);
  const [paidByMemberId, setPaidByMemberId] = useState<string>('');
  const [targetMemberId, setTargetMemberId] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [duplicateConfirmed, setDuplicateConfirmed] = useState<boolean>(false);

  const activeMembers = useMemo(() => members.filter((m) => m.status === 'active'), [members]);

  // Set default payer if personal fund selected
  const handleFundingChange = (personal: boolean) => {
    setIsPersonalFund(personal);
    if (personal && !paidByMemberId && activeMembers.length > 0) {
      setPaidByMemberId(activeMembers[0].id);
    }
  };

  // Duplicate detection on same date with same amount
  const duplicateWarning = useMemo(() => {
    const numAmount = parseFloat(amount);
    if (!date || isNaN(numAmount) || numAmount <= 0) return null;

    const match = expenses.find(
      (e) => e.date === date && Math.abs(e.amount - numAmount) < 0.01
    );

    if (match) {
      return `Warning: An expense with the exact amount (${formatCurrency(match.amount)}) already exists on ${date} ("${match.description}"). Confirm if this is an intentional second purchase.`;
    }
    return null;
  }, [date, amount, expenses]);

  // Filtered expenses for selected month
  const monthExpenses = useMemo(() => {
    return expenses.filter((e) => e.date.startsWith(selectedMonth));
  }, [expenses, selectedMonth]);

  const filteredExpenses = useMemo(() => {
    return monthExpenses.filter((e) => {
      const matchesSearch =
        e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMethod = methodFilter === 'all' || e.allocationMethod === methodFilter;
      const matchesSource =
        sourceFilter === 'all' ||
        (sourceFilter === 'personal' && e.isPersonalFund) ||
        (sourceFilter === 'mess' && !e.isPersonalFund);

      return matchesSearch && matchesMethod && matchesSource;
    });
  }, [monthExpenses, searchQuery, methodFilter, sourceFilter]);

  // Metrics
  const totalExpenses = monthExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const mealPoolExpenses = monthExpenses
    .filter((e) => e.allocationMethod === 'meal_pool')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const sharedExpenses = monthExpenses
    .filter((e) => e.allocationMethod === 'split_equally')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const personalReimbursements = monthExpenses
    .filter((e) => e.isPersonalFund)
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!description.trim() || isNaN(numAmount) || numAmount <= 0) return;

    if (duplicateWarning && !duplicateConfirmed) {
      return;
    }

    await addExpense({
      date,
      description: description.trim(),
      amount: numAmount,
      category,
      allocationMethod,
      isPersonalFund,
      paidByMemberId: isPersonalFund ? paidByMemberId : undefined,
      targetMemberId: allocationMethod === 'member_charge' ? targetMemberId : undefined,
      note: note.trim() || undefined,
    });

    // Reset form
    setDescription('');
    setAmount('');
    setNote('');
    setDuplicateConfirmed(false);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Expenses & Market Ledger</h1>
          <p className="text-xs text-slate-500">
            Categorize transactions and differentiate personal member payments from common mess funds.
          </p>
        </div>

        <button
          onClick={() => {
            setDuplicateConfirmed(false);
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Expense</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500">Total Month Spend</span>
          <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
            {formatCurrency(totalExpenses)}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500">Meal-Pool Food Costs</span>
          <div className="text-lg font-bold font-mono text-indigo-600 mt-0.5">
            {formatCurrency(mealPoolExpenses)}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500">Shared / Split Utilities</span>
          <div className="text-lg font-bold font-mono text-slate-700 mt-0.5">
            {formatCurrency(sharedExpenses)}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500">Personal Out-of-Pocket</span>
          <div className="text-lg font-bold font-mono text-emerald-600 mt-0.5">
            {formatCurrency(personalReimbursements)}
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search item, category, note..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-medium text-[11px]">Allocation:</span>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-md px-2 py-1 font-medium text-slate-800"
            >
              <option value="all">All Methods</option>
              <option value="meal_pool">Meal Pool</option>
              <option value="split_equally">Split Equally</option>
              <option value="member_charge">Member Charge</option>
              <option value="record_only">Record Only</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-medium text-[11px]">Source:</span>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-md px-2 py-1 font-medium text-slate-800"
            >
              <option value="all">All Sources</option>
              <option value="personal">Personal Out-of-Pocket</option>
              <option value="mess">Mess Common Cash</option>
            </select>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Description</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4">Allocation</th>
                <th className="py-2.5 px-4">Funding Source</th>
                <th className="py-2.5 px-4 text-right">Amount</th>
                <th className="py-2.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    No expense records found matching filter.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => {
                  const payer = members.find((m) => m.id === exp.paidByMemberId);
                  const target = members.find((m) => m.id === exp.targetMemberId);

                  return (
                    <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                        {exp.date}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900 max-w-xs">
                        <div>{exp.description}</div>
                        {exp.note && (
                          <div className="text-[11px] text-slate-400 truncate">{exp.note}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {exp.category}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {exp.allocationMethod === 'meal_pool' && (
                          <span className="text-indigo-700 font-semibold">Meal Pool</span>
                        )}
                        {exp.allocationMethod === 'split_equally' && (
                          <span className="text-slate-700 font-medium">Split Equally</span>
                        )}
                        {exp.allocationMethod === 'member_charge' && (
                          <span className="text-rose-700 font-medium">
                            Charged to {target?.name.split(' ')[0] || 'Member'}
                          </span>
                        )}
                        {exp.allocationMethod === 'record_only' && (
                          <span className="text-slate-400">Record Only</span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {exp.isPersonalFund ? (
                          <div className="text-emerald-700 font-medium flex items-center gap-1">
                            <span>Personal ({payer?.name.split(' ')[0] || 'Member'})</span>
                            <span className="text-[10px] text-slate-400">· gets credit</span>
                          </div>
                        ) : (
                          <span className="text-slate-600">Mess Common Fund</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(exp.amount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => deleteExpense(exp.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                          title="Delete expense"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">Record New Mess Expense</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Date:</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Amount (BDT ৳):</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Duplicate check warning */}
              {duplicateWarning && (
                <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-xs text-amber-900 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{duplicateWarning}</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-amber-950">
                    <input
                      type="checkbox"
                      checked={duplicateConfirmed}
                      onChange={(e) => setDuplicateConfirmed(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded border-amber-300"
                    />
                    <span>Yes, this is a separate genuine purchase. Proceed.</span>
                  </label>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Description / Item:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5kg Fish, onions, potatoes (Karwan Bazar)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Category:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-900"
                  >
                    <option value="Market / Bazaar">Market / Bazaar</option>
                    <option value="Groceries">Groceries</option>
                    <option value="Utilities / Shared">Utilities / Shared</option>
                    <option value="Cooking Gas">Cooking Gas</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Allocation Method:</label>
                  <select
                    value={allocationMethod}
                    onChange={(e) => setAllocationMethod(e.target.value as AllocationMethod)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-medium text-slate-900"
                  >
                    <option value="meal_pool">Meal Pool (Affects meal rate)</option>
                    <option value="split_equally">Split Equally (Shared utility)</option>
                    <option value="member_charge">Charge to a Member</option>
                    <option value="record_only">Record Only (No balance impact)</option>
                  </select>
                </div>
              </div>

              {/* Target Member if member_charge */}
              {allocationMethod === 'member_charge' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Charge Directly To:</label>
                  <select
                    required
                    value={targetMemberId}
                    onChange={(e) => setTargetMemberId(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-900"
                  >
                    <option value="">Select Resident Member...</option>
                    {activeMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Funding Source (Personal vs Mess Common Fund) */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                <label className="block text-xs font-bold text-slate-900">
                  Who paid for this purchase?
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleFundingChange(false)}
                    className={`p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${
                      !isPersonalFund
                        ? 'bg-white border-indigo-500 font-semibold text-slate-900 shadow-xs'
                        : 'border-slate-200 text-slate-500 hover:bg-white'
                    }`}
                  >
                    <div className="font-semibold text-slate-900">Mess Common Fund</div>
                    <div className="text-[10px] text-slate-500">Paid from collected deposits</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFundingChange(true)}
                    className={`p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${
                      isPersonalFund
                        ? 'bg-white border-indigo-500 font-semibold text-slate-900 shadow-xs'
                        : 'border-slate-200 text-slate-500 hover:bg-white'
                    }`}
                  >
                    <div className="font-semibold text-emerald-700">Member Personal Pocket</div>
                    <div className="text-[10px] text-slate-500">Member gets credit back</div>
                  </button>
                </div>

                {isPersonalFund && (
                  <div className="pt-1">
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Paying Member (will receive settlement reimbursement):
                    </label>
                    <select
                      required
                      value={paidByMemberId}
                      onChange={(e) => setPaidByMemberId(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-medium text-slate-900"
                    >
                      {activeMembers.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Note (Optional):</label>
                <input
                  type="text"
                  placeholder="e.g. Receipt verified, Karwan Bazar wholesale"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={Boolean(duplicateWarning && !duplicateConfirmed)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer disabled:opacity-50"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
