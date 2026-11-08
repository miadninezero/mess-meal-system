import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import { formatCurrency, formatUnits } from '../lib/calculations.ts';
import { TabId } from './Sidebar.tsx';
import {
  Utensils,
  Receipt,
  Users,
  Wallet,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Scale,
  CalendarCheck,
} from 'lucide-react';

interface DashboardViewProps {
  setActiveTab: (tab: TabId) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setActiveTab }) => {
  const { reconciliation, members, serviceDays, confirmFridayReview, selectedMonth, setDepositTargetMemberId, currentUser } = useApp();

  const isManager = currentUser.role === 'manager' || currentUser.role === 'admin';
  const activeMembersCount = members.filter((m) => m.status === 'active').length;

  // Check for any service days with review flags in selected month
  const daysNeedingReview = serviceDays.filter(
    (s) => s.date.startsWith(selectedMonth) && s.needsReview
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title & Quick Month Context */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Mess Dashboard</h1>
          <p className="text-xs text-slate-500">
            Real-time monthly accounting summary for {selectedMonth}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('meals')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Log Meals</span>
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Add Expense</span>
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>{isManager ? 'Record Deposit' : 'View Deposits'}</span>
          </button>
          <button
            onClick={() => setActiveTab('settlement')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Settlement</span>
          </button>
        </div>
      </div>

      {/* Friday Review Notice Alert if any Friday has needsReview */}
      {daysNeedingReview.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-amber-900">
                Friday Multi-Service Entry Flagged for Review
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                {daysNeedingReview.length} date(s) have Friday entries with both services or 2 units. The system requires manager confirmation before locking.
              </p>
              <div className="flex gap-2 mt-2">
                {daysNeedingReview.map((d) => (
                  <span key={d.date} className="text-[11px] font-mono bg-white px-2 py-0.5 rounded border border-amber-300 text-amber-900">
                    {d.date}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            {daysNeedingReview.map((d) => (
              <button
                key={d.date}
                onClick={() => confirmFridayReview(d.date)}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Confirm {d.date} Override
              </button>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Meal Pool Expenses */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">Meal-Pool Expenses</span>
            <Receipt className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-slate-900">
            {formatCurrency(reconciliation.totalMealPoolExpenses)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>Market / grocery food pool</span>
            <span className="font-mono text-slate-700">100% reconciled</span>
          </div>
        </div>

        {/* Card 2: Total Weighted Units */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">Total Weighted Units</span>
            <Utensils className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-slate-900">
            {formatUnits(reconciliation.totalWeightedUnits)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>Weighted meals eaten</span>
            <span className="text-slate-600">Includes guests</span>
          </div>
        </div>

        {/* Card 3: Exact Meal Rate */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">Current Meal Rate</span>
            <Scale className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-emerald-700">
            {reconciliation.totalWeightedUnits > 0
              ? `${formatCurrency(reconciliation.roundedDisplayRate)}`
              : 'N/A'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>Per weighted unit</span>
            <span className="font-mono text-[10px] text-slate-400">
              {reconciliation.totalWeightedUnits > 0
                ? `৳${reconciliation.rawMealRate.toFixed(4)} raw`
                : 'No units yet'}
            </span>
          </div>
        </div>

        {/* Card 4: Mess Treasury Cash */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">Mess Treasury Cash</span>
            <Wallet className="w-4 h-4 text-slate-700" />
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-slate-900">
            {formatCurrency(reconciliation.netMessCashBalance)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>Deposits - Cash spent</span>
            <span className="font-mono text-slate-700">{activeMembersCount} active members</span>
          </div>
        </div>
      </div>

      {/* Member Balance Overview Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Member Financial Settlement Preview</h2>
            <p className="text-xs text-slate-500">
              Live balances computed via Hare-Niemeyer largest-remainder allocation
            </p>
          </div>
          <button
            onClick={() => setActiveTab('settlement')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>Full Statement & Reconciliation</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-4">Member</th>
                <th className="py-2.5 px-4 text-right">Units (Reg+Gst)</th>
                <th className="py-2.5 px-4 text-right">Meal Cost</th>
                <th className="py-2.5 px-4 text-right">Reimbursements</th>
                <th className="py-2.5 px-4 text-right">Deposits Paid</th>
                <th className="py-2.5 px-4 text-right">Net Balance</th>
                <th className="py-2.5 px-4 text-center">Status</th>
                {isManager && <th className="py-2.5 px-4 text-center">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reconciliation.rows.map((row) => (
                <tr key={row.memberId} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-4 font-medium text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                        {row.memberName.charAt(0)}
                      </div>
                      <span>{row.memberName}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-700">
                    <span>{formatUnits(row.totalUnits)}</span>
                    {row.guestUnits > 0 && (
                      <span className="text-[10px] text-slate-400 block">
                        ({formatUnits(row.regularUnits)} + {formatUnits(row.guestUnits)}g)
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-700">
                    {formatCurrency(row.allocatedMealCost)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-600">
                    {row.personalReimbursements > 0 ? (
                      <span className="text-emerald-700">+{formatCurrency(row.personalReimbursements)}</span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-700">
                    {formatCurrency(row.totalPayments)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold">
                    {row.netBalance > 0 && (
                      <span className="text-emerald-600">+{formatCurrency(row.netBalance)}</span>
                    )}
                    {row.netBalance < 0 && (
                      <span className="text-rose-600">{formatCurrency(row.netBalance)}</span>
                    )}
                    {row.netBalance === 0 && (
                      <span className="text-slate-500">৳0.00</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    {row.status === 'receives' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                        <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                        <span>Receives</span>
                      </span>
                    )}
                    {row.status === 'owes' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700">
                        <ArrowDownRight className="w-3 h-3 text-rose-600" />
                        <span>Owes</span>
                      </span>
                    )}
                    {row.status === 'settled' && (
                      <span className="text-[11px] font-medium text-slate-500">
                        Settled
                      </span>
                    )}
                  </td>
                  {isManager && (
                    <td className="py-2.5 px-4 text-center">
                      <button
                        onClick={() => {
                          setDepositTargetMemberId(row.memberId);
                          setActiveTab('payments');
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded transition-colors cursor-pointer"
                        title={`Record deposit for ${row.memberName}`}
                      >
                        <Plus className="w-3 h-3" />
                        <span>Deposit</span>
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
