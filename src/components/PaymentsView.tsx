import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Payment } from '../types/index.ts';
import { formatCurrency } from '../lib/calculations.ts';
import {
  Wallet,
  Plus,
  RotateCcw,
  Search,
  CheckCircle2,
  X,
  CreditCard,
  Building,
  Banknote,
  Smartphone,
} from 'lucide-react';

export const PaymentsView: React.FC = () => {
  const { payments, addPayment, reversePayment, members, selectedMonth } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [memberFilter, setMemberFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [reversalTarget, setReversalTarget] = useState<Payment | null>(null);
  const [reversalReason, setReversalReason] = useState<string>('');

  // Form State
  const [date, setDate] = useState<string>('2026-11-07');
  const [memberId, setMemberId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [method, setMethod] = useState<'cash' | 'bkash' | 'nagad' | 'bank' | 'other'>('bkash');
  const [reference, setReference] = useState<string>('');
  const [note, setNote] = useState<string>('');

  const activeMembers = useMemo(() => members.filter((m) => m.status === 'active'), [members]);

  // Set default member
  useMemo(() => {
    if (activeMembers.length > 0 && !memberId) {
      setMemberId(activeMembers[0].id);
    }
  }, [activeMembers, memberId]);

  // Month filtered payments
  const monthPayments = useMemo(() => {
    return payments.filter((p) => p.date.startsWith(selectedMonth));
  }, [payments, selectedMonth]);

  const filteredPayments = useMemo(() => {
    return monthPayments.filter((p) => {
      const member = members.find((m) => m.id === p.memberId);
      const matchesSearch =
        (member?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.reference || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.note || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMember = memberFilter === 'all' || p.memberId === memberFilter;

      return matchesSearch && matchesMember;
    });
  }, [monthPayments, searchQuery, memberFilter, members]);

  // Summary Metrics
  const totalDeposits = monthPayments.reduce((sum, p) => {
    const sign = p.reversalOfId ? -1 : 1;
    return sum + sign * (Number(p.amount) || 0);
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!memberId || isNaN(numAmount) || numAmount <= 0) return;

    await addPayment({
      date,
      memberId,
      amount: numAmount,
      method,
      reference: reference.trim() || undefined,
      note: note.trim() || undefined,
    });

    setAmount('');
    setReference('');
    setNote('');
    setShowAddModal(false);
  };

  const handleConfirmReversal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reversalTarget) return;

    await reversePayment(reversalTarget.id, reversalReason.trim());
    setReversalTarget(null);
    setReversalReason('');
  };

  const getMethodBadge = (m: string) => {
    switch (m) {
      case 'bkash':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-pink-700 bg-pink-50 px-2 py-0.5 rounded border border-pink-200">
            <Smartphone className="w-3 h-3" />
            <span>bKash</span>
          </span>
        );
      case 'nagad':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
            <Smartphone className="w-3 h-3" />
            <span>Nagad</span>
          </span>
        );
      case 'bank':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            <Building className="w-3 h-3" />
            <span>Bank Transfer</span>
          </span>
        );
      case 'cash':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <Banknote className="w-3 h-3" />
            <span>Cash</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
            <CreditCard className="w-3 h-3" />
            <span>{m}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Member Deposits & Payments</h1>
          <p className="text-xs text-slate-500">
            Record advance payments and deposit entries with full audit trail and correction reversals.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Deposit</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Total Deposits Collected</span>
          <div className="text-2xl font-bold font-mono text-emerald-600 mt-0.5">
            {formatCurrency(totalDeposits)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">For month of {selectedMonth}</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Total Transactions</span>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-0.5">
            {monthPayments.length} entries
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Includes reversals</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Active Contributors</span>
          <div className="text-2xl font-bold font-mono text-indigo-600 mt-0.5">
            {new Set(monthPayments.map((p) => p.memberId)).size} / {activeMembers.length}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Members deposited</span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search member, reference, note..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">Filter Member:</span>
          <select
            value={memberFilter}
            onChange={(e) => setMemberFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-md px-2 py-1 font-medium text-slate-800"
          >
            <option value="all">All Members</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Resident Member</th>
                <th className="py-2.5 px-4">Method</th>
                <th className="py-2.5 px-4">Reference ID</th>
                <th className="py-2.5 px-4">Note</th>
                <th className="py-2.5 px-4 text-right">Amount</th>
                <th className="py-2.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const member = members.find((m) => m.id === p.memberId);
                  const isReversal = Boolean(p.reversalOfId);

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isReversal ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                        {p.date}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {member?.name || 'Unknown'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {getMethodBadge(p.method)}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {p.reference || '—'}
                      </td>
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                        {p.note || '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap">
                        {isReversal ? (
                          <span className="text-rose-600">-{formatCurrency(p.amount)}</span>
                        ) : (
                          <span className="text-emerald-600">+{formatCurrency(p.amount)}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {!isReversal ? (
                          <button
                            onClick={() => {
                              setReversalTarget(p);
                              setReversalReason('');
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                            title="Issue correction reversal"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reverse</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Reversal</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Deposit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">Record Member Deposit</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                <label className="block text-xs font-medium text-slate-700 mb-1">Resident Member:</label>
                <select
                  required
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-medium text-slate-900"
                >
                  {activeMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Amount (BDT ৳):</label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    placeholder="5000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Payment Method:</label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as any)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-900"
                  >
                    <option value="bkash">bKash</option>
                    <option value="nagad">Nagad</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Transaction Reference (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. TrxID 9H821K, Receipt #45"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Note (Optional):</label>
                <input
                  type="text"
                  placeholder="e.g. November initial deposit"
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
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
                >
                  Save Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Reversal Confirmation Modal */}
      {reversalTarget && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">Issue Payment Reversal Entry</h2>
              <button
                onClick={() => setReversalTarget(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Financial data is never deleted silently. A reversal entry will subtract{' '}
              <span className="font-bold text-rose-600 font-mono">
                {formatCurrency(reversalTarget.amount)}
              </span>{' '}
              from the member&apos;s ledger for complete audit trail transparency.
            </p>

            <form onSubmit={handleConfirmReversal} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Reason for Reversal / Correction:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Duplicate entry, incorrect amount recorded..."
                  value={reversalReason}
                  onChange={(e) => setReversalReason(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReversalTarget(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
                >
                  Confirm Reversal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
