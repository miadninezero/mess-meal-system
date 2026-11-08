import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  Download,
  Upload,
  CheckCircle2,
  BookOpen,
  Smartphone,
  Database,
  CloudCheck,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton.tsx';
import { useOnlineStatus } from '../hooks/useOnlineStatus.ts';

export const SettingsView: React.FC = () => {
  const {
    members,
    serviceDays,
    attendance,
    guestAttendance,
    expenses,
    payments,
    selectedMonth,
    resetToDemoData,
  } = useApp();

  const isOnline = useOnlineStatus();
  const [resetConfirmed, setResetConfirmed] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleReset = () => {
    resetToDemoData();
    setResetConfirmed(false);
    showNotification('Sample Dhaka mess ledger reloaded.');
  };

  // Full ledger JSON export
  const exportFullBackup = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      messName: 'Dhaka Central Mess',
      selectedMonth,
      members,
      serviceDays,
      attendance,
      guestAttendance,
      expenses,
      payments,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dhaka-mess-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('Database backup downloaded successfully.');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Application Configuration & Rules</h1>
        <p className="text-xs text-slate-500">
          Device installability, offline data synchronization, core parameters, and financial safeguards.
        </p>
      </div>

      {notification && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-medium flex items-center gap-2 animate-in fade-in ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* PWA Application Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Device Installation (PWA)</h2>
              <p className="text-xs text-slate-500">
                Install as a standalone native app on Android, iOS, or Desktop
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>PWA Enabled</span>
          </div>
        </div>

        <p className="text-xs text-slate-600">
          When installed, Mess Manager launches instantly in full-screen standalone mode without browser bars, supports offline calculation, and caches data locally on your device.
        </p>

        <div className="pt-1">
          <PWAInstallButton variant="full" />
        </div>
      </div>

      {/* Cloud & Offline Synchronization */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Database & Network Status</h2>
              <p className="text-xs text-slate-500">Persistent Firestore cloud ledger with local caching</p>
            </div>
          </div>
          <div className="text-xs">
            {isOnline ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 font-medium">
                <CloudCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cloud Connected</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Offline (Local Store)</span>
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-medium block">Database ID:</span>
            <span className="font-mono text-slate-800 font-semibold truncate block mt-0.5">
              ai-studio-62eea721-f80a-45fe-b1a2-abf86e0cf332
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-medium block">Local Cache Status:</span>
            <span className="text-emerald-700 font-semibold block mt-0.5">
              Active (Fast offline access enabled)
            </span>
          </div>
        </div>

        {/* Data Backup */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-3">
          <button
            onClick={exportFullBackup}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Download Complete Ledger (JSON)</span>
          </button>
        </div>
      </div>

      {/* Mess Details Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
          General Mess Profile
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
