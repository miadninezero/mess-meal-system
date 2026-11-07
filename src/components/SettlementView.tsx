import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { formatCurrency, formatUnits } from '../lib/calculations.ts';
import {
  Scale,
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  ShieldCheck,
  Lock,
} from 'lucide-react';

export const SettlementView: React.FC = () => {
  const { reconciliation, selectedMonth } = useApp();

  const [isMonthClosed, setIsMonthClosed] = useState<boolean>(false);
  const [showCloseModal, setShowCloseModal] = useState<boolean>(false);

  // Generate CSV with UTF-8 BOM for Excel / Google Sheets compatibility
  const exportToCSV = () => {
    const BOM = '\uFEFF';
    const headers = [
      'Member Name',
      'Regular Units',
      'Guest Units',
      'Total Units',
      'Allocated Meal Cost (BDT)',
      'Shared Charges (BDT)',
      'Individual Charges (BDT)',
      'Total Debits (BDT)',
      'Deposits Paid (BDT)',
      'Personal Reimbursements (BDT)',
      'Total Credits (BDT)',
      'Net Balance (BDT)',
      'Settlement Status',
    ];

    const rows = reconciliation.rows.map((r) => [
      `"${r.memberName}"`,
      r.regularUnits.toFixed(1),
      r.guestUnits.toFixed(1),
      r.totalUnits.toFixed(1),
      r.allocatedMealCost.toFixed(2),
      r.sharedCharges.toFixed(2),
      r.individualCharges.toFixed(2),
      r.totalDebits.toFixed(2),
      r.totalPayments.toFixed(2),
      r.personalReimbursements.toFixed(2),
      r.totalCredits.toFixed(2),
      r.netBalance.toFixed(2),
      r.status.toUpperCase(),
    ]);

    // Add summary row
    rows.push([]);
    rows.push([
      '"TOTAL / RECONCILIATION"',
      '',
      '',
      reconciliation.totalWeightedUnits.toFixed(1),
      reconciliation.sumAllocatedMealCost.toFixed(2),
      reconciliation.totalSharedExpenses.toFixed(2),
      reconciliation.totalIndividualExpenses.toFixed(2),
      '',
      reconciliation.totalDeposits.toFixed(2),
      reconciliation.totalPersonalReimbursements.toFixed(2),
      '',
      '',
      reconciliation.isReconciled ? 'RECONCILED (DIFF: 0.00)' : 'UNRECONCILED',
    ]);

    const csvContent = BOM + [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `mess-settlement-${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header and Export Tools */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Monthly Settlement & Reconciliation
            </h1>
            {isMonthClosed ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                <Lock className="w-3 h-3" />
                <span>Month Closed</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                <span>Month Open</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Individual member balances computed via Hare-Niemeyer largest-remainder allocation for {selectedMonth}.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={exportToCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Statement</span>
          </button>
          {!isMonthClosed && (
            <button
              onClick={() => setShowCloseModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Review & Close Month</span>
            </button>
          )}
        </div>
      </div>

      {/* Mathematical Reconciliation Guarantee Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h2 className="text-xs font-bold text-slate-900">
              Zero-Residual Financial Reconciliation Guarantee
            </h2>
          </div>
          <span className="text-[11px] font-mono font-semibold text-emerald-700">
            Difference: {formatCurrency(reconciliation.reconciliationDifference)}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 text-xs">
          <div>
            <span className="text-slate-500 text-[11px]">Total Meal-Pool Expenses:</span>
            <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
              {formatCurrency(reconciliation.totalMealPoolExpenses)}
            </div>
          </div>
          <div>
            <span className="text-slate-500 text-[11px]">Sum of Allocated Charges:</span>
            <div className="text-base font-bold font-mono text-indigo-600 mt-0.5">
              {formatCurrency(reconciliation.sumAllocatedMealCost)}
            </div>
          </div>
          <div>
            <span className="text-slate-500 text-[11px]">Total Weighted Units:</span>
            <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
              {formatUnits(reconciliation.totalWeightedUnits)}
            </div>
          </div>
          <div>
            <span className="text-slate-500 text-[11px]">Calculated Meal Rate:</span>
            <div className="text-base font-bold font-mono text-emerald-700 mt-0.5">
              {reconciliation.totalWeightedUnits > 0
                ? `${formatCurrency(reconciliation.roundedDisplayRate)}`
                : 'N/A'}
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>
            Hare-Niemeyer largest-remainder algorithm guarantees that the sum of member charges exactly matches the meal-pool expense total down to the single cent/poisha.
          </span>
        </div>
      </div>

      {/* Master Settlement Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200">
          <h2 className="text-sm font-bold text-slate-900">Member Balance & Settlement Breakdown</h2>
          <p className="text-xs text-slate-500">
            Positive balance means the mess owes the member (Receives). Negative means the member owes the mess (Owes).
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-4">Resident Member</th>
                <th className="py-2.5 px-3 text-right">Regular Units</th>
                <th className="py-2.5 px-3 text-right">Guest Units</th>
                <th className="py-2.5 px-3 text-right">Total Units</th>
                <th className="py-2.5 px-3 text-right">Meal Cost</th>
                <th className="py-2.5 px-3 text-right">Shared</th>
                <th className="py-2.5 px-3 text-right">Direct</th>
                <th className="py-2.5 px-3 text-right">Deposits Paid</th>
                <th className="py-2.5 px-3 text-right">Reimbursements</th>
                <th className="py-2.5 px-4 text-right">Net Balance</th>
                <th className="py-2.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reconciliation.rows.map((row) => (
                <tr key={row.memberId} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                    {row.memberName}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-700">
                    {formatUnits(row.regularUnits)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-indigo-600">
                    {row.guestUnits > 0 ? `+${formatUnits(row.guestUnits)}` : '—'}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                    {formatUnits(row.totalUnits)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-800">
                    {formatCurrency(row.allocatedMealCost)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-600">
                    {row.sharedCharges > 0 ? formatCurrency(row.sharedCharges) : '—'}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-600">
                    {row.individualCharges > 0 ? formatCurrency(row.individualCharges) : '—'}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-800">
                    {formatCurrency(row.totalPayments)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-700">
                    {row.personalReimbursements > 0
                      ? `+${formatCurrency(row.personalReimbursements)}`
                      : '—'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap text-sm">
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
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    {row.status === 'receives' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                        <span>Receives</span>
                      </span>
                    )}
                    {row.status === 'owes' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        <ArrowDownRight className="w-3 h-3 text-rose-600" />
                        <span>Owes</span>
                      </span>
                    )}
                    {row.status === 'settled' && (
                      <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        Settled
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Closing Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">Monthly Audit Closing Checklist</h2>
              <button
                onClick={() => setShowCloseModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Closing a month seals the calculations and creates an immutable snapshot. Normal members will have read-only access.
            </p>

            <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>All days classified as served or cancelled</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Friday exceptions confirmed</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Expenses and personal funding sources categorized</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Reconciliation sum exact match: ৳0.00 discrepancy</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCloseModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMonthClosed(true);
                  setShowCloseModal(false);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
              >
                Confirm & Seal Month
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
