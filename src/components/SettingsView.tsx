import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Settings, RefreshCw, CheckCircle2, Shield, AlertTriangle, BookOpen } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { resetToDemoData } = useApp();
  const [resetConfirmed, setResetConfirmed] = useState<boolean>(false);
  const [showResetSuccess, setShowResetSuccess] = useState<boolean>(false);

  const handleReset = () => {
    resetToDemoData();
    setResetConfirmed(false);
    setShowResetSuccess(true);
    setTimeout(() => setShowResetSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Mess Configuration & Rules</h1>
        <p className="text-xs text-slate-500">
          Core parameters, mathematical meal rules, and database maintenance.
        </p>
      </div>

      {showResetSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Demo data successfully reloaded.</span>
        </div>
      )}

      {/* Mess Details Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
          General Mess Settings
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-500 font-medium mb-1">Mess Name:</label>
            <input
              type="text"
              readOnly
              value="Dhaka Central Mess"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-medium mb-1">Default Currency:</label>
            <input
              type="text"
              readOnly
              value="BDT (৳ Bangladeshi Taka)"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium font-mono text-slate-800"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-medium mb-1">Accounting Timezone:</label>
            <input
              type="text"
              readOnly
              value="Asia/Dhaka (GMT+6)"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Non-Negotiable Meal Rules Reference */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900">
            Non-Negotiable Meal Weighting Constitution
          </h2>
        </div>

        <p className="text-xs text-slate-600">
          The calculation is strictly determined by what services were actually cooked and served on that date, not by weekday assumptions:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                <th className="py-2 px-3">Services Actually Served</th>
                <th className="py-2 px-3">Resident / Guest Attendance</th>
                <th className="py-2 px-3 text-right">Weighted Units</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              <tr>
                <td className="py-2 px-3 text-slate-900 font-sans">Lunch + Night (Normal day)</td>
                <td className="py-2 px-3 text-slate-700 font-sans">Both Lunch & Night</td>
                <td className="py-2 px-3 text-right font-bold text-indigo-600">2.0 units</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-slate-900 font-sans">Lunch + Night (Normal day)</td>
                <td className="py-2 px-3 text-slate-700 font-sans">Lunch only</td>
                <td className="py-2 px-3 text-right font-bold text-indigo-600">1.5 units</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-slate-900 font-sans">Lunch + Night (Normal day)</td>
                <td className="py-2 px-3 text-slate-700 font-sans">Night only</td>
                <td className="py-2 px-3 text-right font-bold text-slate-800">1.0 unit</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-slate-900 font-sans">Lunch only (Standard Friday or Night cancelled)</td>
                <td className="py-2 px-3 text-slate-700 font-sans">Lunch attended</td>
                <td className="py-2 px-3 text-right font-bold text-slate-800">1.0 unit</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-slate-900 font-sans">Night only (Lunch cancelled)</td>
                <td className="py-2 px-3 text-slate-700 font-sans">Night attended</td>
                <td className="py-2 px-3 text-right font-bold text-slate-800">1.0 unit</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-slate-900 font-sans">No service served</td>
                <td className="py-2 px-3 text-slate-700 font-sans">None</td>
                <td className="py-2 px-3 text-right font-bold text-slate-400">0.0 units</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Reset & Maintenance */}
      <div className="bg-white border border-rose-200 rounded-xl p-5 shadow-xs space-y-3">
        <h2 className="text-sm font-bold text-rose-900">Reset Demo Environment</h2>
        <p className="text-xs text-slate-600">
          Restore the initial seed ledger (5 members, attendance logs, categorized expenses, and payments) for testing and demonstration.
        </p>

        {!resetConfirmed ? (
          <button
            onClick={() => setResetConfirmed(true)}
            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Reset to Sample Dhaka Mess Ledger
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
            >
              Confirm Reset Now
            </button>
            <button
              onClick={() => setResetConfirmed(false)}
              className="px-3 py-2 text-xs text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
