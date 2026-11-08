import React, { useState, useMemo, useEffect } from 'react';
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
  User,
  Edit2,
  Trash2,
  ArrowRight,
  Filter,
} from 'lucide-react';

export const PaymentsView: React.FC = () => {
  const {
    payments,
    addPayment,
    updatePayment,
    deletePayment,
    reversePayment,
    members,
    selectedMonth,
    currentUser,
    depositTargetMemberId,
    setDepositTargetMemberId,
    reconciliation,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [memberFilter, setMemberFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [reversalTarget, setReversalTarget] = useState<Payment | null>(null);
  const [reversalReason, setReversalReason] = useState<string>('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form State for Recording Deposit
  const [date, setDate] = useState<string>('2026-11-08');
  const [memberId, setMemberId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [method, setMethod] = useState<'cash' | 'bkash' | 'nagad' | 'bank' | 'other'>('bkash');
  const [reference, setReference] = useState<string>('');
  const [note, setNote] = useState<string>('');

  // Form State for Editing/Reassigning Deposit
  const [editMemberId, setEditMemberId] = useState<string>('');
  const [editDate, setEditDate] = useState<string>('');
  const [editAmount, setEditAmount] = useState<string>('');
  const [editMethod, setEditMethod] = useState<'cash' | 'bkash' | 'nagad' | 'bank' | 'other'>('bkash');
  const [editReference, setEditReference] = useState<string>('');
  const [editNote, setEditNote] = useState<string>('');

  const activeMembers = useMemo(() => members.filter((m) => m.status === 'active'), [members]);
  const isManager = currentUser.role === 'manager' || currentUser.role === 'admin';

  // Handle external trigger to open modal for specific member (Manager only)
  useEffect(() => {
    if (depositTargetMemberId && isManager) {
      setMemberId(depositTargetMemberId);
      setShowAddModal(true);
      setDepositTargetMemberId(null);
    } else if (depositTargetMemberId && !isManager) {
      setDepositTargetMemberId(null);
    }
  }, [depositTargetMemberId, isManager, setDepositTargetMemberId]);

  // When modal opens, properly select target member (Manager only)
  const openAddModalForMember = (targetId?: string) => {
    if (!isManager) return;
    if (targetId) {
      setMemberId(targetId);
    } else if (memberFilter !== 'all') {
      setMemberId(memberFilter);
    } else if (!memberId && activeMembers.length > 0) {
      setMemberId(activeMembers[0].id);
    }
    setDate('2026-11-08');
    setAmount('');
    setReference('');
    setNote('');
    setShowAddModal(true);
  };

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

  // Per-member deposit totals for the month
  const memberDepositTotals = useMemo(() => {
    const map: Record<string, number> = {};
    activeMembers.forEach((m) => (map[m.id] = 0));
    monthPayments.forEach((p) => {
      if (map[p.memberId] !== undefined) {
        const sign = p.reversalOfId ? -1 : 1;
        map[p.memberId] += sign * (Number(p.amount) || 0);
      }
    });
    return map;
  }, [activeMembers, monthPayments]);

  const selectedMemberData = activeMembers.find((m) => m.id === memberId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isManager) return;
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

    const creditedMember = members.find((m) => m.id === memberId)?.name || 'Member';
    setSuccessToast(`Deposit of ${formatCurrency(numAmount)} credited to ${creditedMember}`);
    setTimeout(() => setSuccessToast(null), 3500);

    setAmount('');
    setReference('');
    setNote('');
    setShowAddModal(false);
  };

  const handleOpenEdit = (p: Payment) => {
    if (!isManager) return;
    setEditingPayment(p);
    setEditMemberId(p.memberId);
    setEditDate(p.date);
    setEditAmount(String(p.amount));
    setEditMethod(p.method);
    setEditReference(p.reference || '');
    setEditNote(p.note || '');
  };

  const handleUpdatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isManager || !editingPayment) return;
    const numAmount = parseFloat(editAmount);
    if (!editMemberId || isNaN(numAmount) || numAmount <= 0) return;

    await updatePayment(editingPayment.id, {
      memberId: editMemberId,
      date: editDate,
      amount: numAmount,
      method: editMethod,
      reference: editReference.trim() || undefined,
      note: editNote.trim() || undefined,
    });

    const targetMember = members.find((m) => m.id === editMemberId)?.name || 'Member';
    setSuccessToast(`Payment updated & assigned to ${targetMember}`);
    setTimeout(() => setSuccessToast(null), 3500);

    setEditingPayment(null);
  };

  const handleDelete = async (id: string) => {
    if (!isManager) return;
    if (window.confirm('Are you sure you want to delete this deposit entry?')) {
      await deletePayment(id);
      setSuccessToast('Deposit entry deleted.');
      setTimeout(() => setSuccessToast(null), 3500);
    }
  };

  const handleConfirmReversal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isManager || !reversalTarget) return;

    await reversePayment(reversalTarget.id, reversalReason.trim());
    setReversalTarget(null);
    setReversalReason('');
    setSuccessToast('Reversal entry recorded.');
    setTimeout(() => setSuccessToast(null), 3500);
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
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Member Deposits & Advance Ledger</h1>
          <p className="text-xs text-slate-500">
            Individual advance payments collected from each resident member for {selectedMonth}.
          </p>
        </div>

        {isManager ? (
          <button
            onClick={() => openAddModalForMember()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Record New Deposit</span>
          </button>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 border border-slate-200 text-xs font-medium rounded-lg self-start sm:self-auto">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>Manager-Only Deposit Access</span>
          </div>
        )}
      </div>

      {/* Role Banner for regular members */}
      {!isManager && (
        <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3.5 flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0 text-xs mt-0.5">
            ℹ
          </div>
          <div className="text-xs text-amber-900">
            <h3 className="font-bold text-amber-950">Deposit Access Restricted to Manager</h3>
            <p className="text-amber-800 mt-0.5">
              Only designated Mess Managers have authority to record, reassign, or reverse deposits. Resident members have read-only access to verify their deposits and balance statements.
            </p>
          </div>
        </div>
      )}

      {/* Success Notification Toast */}
      {successToast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-lg flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Per-Member Deposit Breakdown Grid */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Individual Member Deposit Balances ({selectedMonth})
          </h2>
          <span className="text-[11px] text-slate-500">
            Total Mess Fund Collected: <strong className="text-emerald-700 font-mono">{formatCurrency(totalDeposits)}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {activeMembers.map((m) => {
            const deposited = memberDepositTotals[m.id] || 0;
            const settlementRow = reconciliation.rows.find((r) => r.memberId === m.id);
            const isCurrent = currentUser.memberId === m.id;
            const isFiltered = memberFilter === m.id;

            return (
              <div
                key={m.id}
                className={`bg-white border rounded-xl p-3.5 shadow-xs flex flex-col justify-between transition-all ${
                  isFiltered
                    ? 'border-indigo-500 ring-2 ring-indigo-100 bg-indigo-50/20'
                    : isCurrent
                    ? 'border-indigo-300'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                        {m.name.charAt(0)}
                      </div>
                      <div className="truncate">
                        <h3 className="text-xs font-bold text-slate-900 truncate leading-tight">
                          {m.name}
                        </h3>
                        <span className="text-[10px] text-slate-400 capitalize">{m.role}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <span className="text-[10px] text-slate-500 block">Total Deposited:</span>
                    <span className="text-base font-bold font-mono text-emerald-600 block mt-0.5">
                      {formatCurrency(deposited)}
                    </span>
                  </div>

                  {settlementRow && (
                    <div className="mt-1 text-[10px]">
                      <span className="text-slate-400">Net Balance: </span>
                      <span
                        className={`font-mono font-semibold ${
                          settlementRow.netBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {formatCurrency(settlementRow.netBalance)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-1">
                  <button
                    onClick={() => setMemberFilter(memberFilter === m.id ? 'all' : m.id)}
                    className={`text-[10px] font-medium px-2 py-1 rounded transition-colors cursor-pointer ${
                      memberFilter === m.id
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
                    }`}
                  >
                    {memberFilter === m.id ? 'Showing' : 'Filter'}
                  </button>

                  {isManager && (
                    <button
                      onClick={() => openAddModalForMember(m.id)}
                      className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded transition-colors cursor-pointer flex items-center gap-0.5"
                      title={`Record deposit for ${m.name}`}
                    >
                      <Plus className="w-3 h-3" />
                      <span>Deposit</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
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
          <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">Filter by Member:</span>
          <select
            value={memberFilter}
            onChange={(e) => setMemberFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-md px-2 py-1 font-medium text-slate-800 cursor-pointer"
          >
            <option value="all">All Members ({monthPayments.length})</option>
            {members.map((m) => {
              const count = monthPayments.filter((p) => p.memberId === m.id).length;
              return (
                <option key={m.id} value={m.id}>
                  {m.name} ({count} deposits)
                </option>
              );
            })}
          </select>

          {memberFilter !== 'all' && (
            <button
              onClick={() => setMemberFilter('all')}
              className="text-[11px] text-indigo-600 hover:underline cursor-pointer font-medium ml-1"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            Detailed Deposit History {memberFilter !== 'all' ? `(Filtered)` : ''}
          </h2>
          <span className="text-[11px] text-slate-400">
            {filteredPayments.length} transaction{filteredPayments.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Credited Member</th>
                <th className="py-2.5 px-4">Payment Method</th>
                <th className="py-2.5 px-4">Reference ID</th>
                <th className="py-2.5 px-4">Note / Description</th>
                <th className="py-2.5 px-4 text-right">Amount</th>
                {isManager && <th className="py-2.5 px-4 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={isManager ? 7 : 6} className="text-center py-8 text-slate-400">
                    No deposit records found for this criteria.
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
                      <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-[10px]">
                            {member?.name ? member.name.charAt(0) : '?'}
                          </div>
                          <span>{member?.name || 'Unknown Member'}</span>
                        </div>
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
                      {isManager && (
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="inline-flex items-center gap-2">
                            {!isReversal && (
                              <>
                                <button
                                  onClick={() => handleOpenEdit(p)}
                                  className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-indigo-600 p-1 cursor-pointer transition-colors"
                                  title="Reassign to another member or edit details"
                                >
                                  <Edit2 className="w-3 h-3" />
                                  <span>Edit/Move</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setReversalTarget(p);
                                    setReversalReason('');
                                  }}
                                  className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-amber-600 p-1 cursor-pointer transition-colors"
                                  title="Issue correction reversal entry"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Reverse</span>
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-300 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                              title="Delete deposit entry"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Deposit Modal */}
      {isManager && showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Record Member Deposit</h2>
                <p className="text-[11px] text-slate-500">
                  Select which member deposited the money to credit their account.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Prominent Visual Member Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Select Member to Credit:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {activeMembers.map((m) => {
                    const isSelected = memberId === m.id;
                    const deposited = memberDepositTotals[m.id] || 0;

                    return (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => setMemberId(m.id)}
                        className={`flex flex-col p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-200 shadow-xs'
                            : 'border-slate-200 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              isSelected
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {m.name.charAt(0)}
                          </div>
                          <span
                            className={`text-xs font-bold truncate ${
                              isSelected ? 'text-indigo-950' : 'text-slate-800'
                            }`}
                          >
                            {m.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Paid: {formatCurrency(deposited)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Confirmation preview banner */}
              {selectedMemberData && (
                <div className="bg-indigo-50/60 border border-indigo-200 rounded-xl p-3 flex items-center justify-between text-xs text-indigo-950">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>
                      Crediting deposit to: <strong>{selectedMemberData.name}</strong>
                    </span>
                  </div>
                  {amount && parseFloat(amount) > 0 && (
                    <span className="font-mono font-bold text-emerald-700">
                      +{formatCurrency(parseFloat(amount))}
                    </span>
                  )}
                </div>
              )}

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
                    step="1"
                    min="1"
                    required
                    placeholder="e.g. 5000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Payment Method:</label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as any)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-900 cursor-pointer"
                  >
                    <option value="bkash">bKash</option>
                    <option value="nagad">Nagad</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    TrxID / Reference (Optional):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TrxID 9H821K, Receipt #45"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 font-mono text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Note (Optional):</label>
                <input
                  type="text"
                  placeholder="e.g. November meal deposit, advance payment"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 text-xs text-slate-600 hover:text-slate-800 cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  Save Deposit for {selectedMemberData ? selectedMemberData.name.split(' ')[0] : 'Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit / Reassign Payment Modal */}
      {isManager && editingPayment && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Edit / Reassign Deposit</h2>
                <p className="text-[11px] text-slate-500">
                  Move this deposit to the correct member or adjust the recorded amount.
                </p>
              </div>
              <button
                onClick={() => setEditingPayment(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdatePayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Reassign to Resident Member:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {activeMembers.map((m) => {
                    const isSelected = editMemberId === m.id;
                    return (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => setEditMemberId(m.id)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200'
                            : 'border-slate-200 bg-slate-50 hover:bg-white'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {m.name.charAt(0)}
                        </div>
                        <span className="text-xs font-bold truncate">{m.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Date:</label>
                  <input
                    type="date"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Amount (BDT ৳):</label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Payment Method:</label>
                  <select
                    value={editMethod}
                    onChange={(e) => setEditMethod(e.target.value as any)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-900 cursor-pointer"
                  >
                    <option value="bkash">bKash</option>
                    <option value="nagad">Nagad</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Reference ID:</label>
                  <input
                    type="text"
                    value={editReference}
                    onChange={(e) => setEditReference(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 font-mono text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Note:</label>
                <input
                  type="text"
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingPayment(null)}
                  className="px-3.5 py-2 text-xs text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Reversal Confirmation Modal */}
      {isManager && reversalTarget && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
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
              Financial records are preserved for auditing. A reversal entry will deduct{' '}
              <span className="font-bold text-rose-600 font-mono">
                {formatCurrency(reversalTarget.amount)}
              </span>{' '}
              from the member&apos;s ledger balance.
            </p>

            <form onSubmit={handleConfirmReversal} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Reason for Reversal / Correction:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Duplicate entry, incorrect member credited..."
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
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
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
