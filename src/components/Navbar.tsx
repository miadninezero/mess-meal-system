import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import { CheckCircle2, Clock, AlertTriangle, UserCheck, Shield } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentUser, switchPersona, members, selectedMonth, setSelectedMonth, saveStatus } = useApp();

  return (
    <header className="flex items-center justify-between gap-6 px-6 py-3.5 bg-white border-b border-slate-200 sticky top-0 z-30">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3">
        <a href="#dashboard" className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            M
          </div>
          <span>Mess Manager</span>
        </a>
      </div>

      {/* Zone 2: Month selector and data freshness */}
      <div className="hidden sm:flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <label htmlFor="month-select" className="text-slate-500 font-medium px-2">Month:</label>
          <select
            id="month-select"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-white border-0 text-slate-800 font-semibold text-xs rounded px-2.5 py-1 focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-xs"
          >
            <option value="2026-11">November 2026</option>
            <option value="2026-10">October 2026</option>
            <option value="2026-09">September 2026</option>
          </select>
        </div>

        {/* Freshness Indicator */}
        <div className="flex items-center gap-1.5 text-xs font-medium">
          {saveStatus === 'saved' && (
            <span className="flex items-center gap-1 text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Saved</span>
            </span>
          )}
          {saveStatus === 'saving' && (
            <span className="flex items-center gap-1 text-indigo-600 animate-pulse">
              <Clock className="w-3.5 h-3.5" />
              <span>Saving...</span>
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="flex items-center gap-1 text-rose-600">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Save failed</span>
            </span>
          )}
        </div>
      </div>

      {/* Zone 3: Interactive Role / Persona switcher for evaluation & live use */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
          <Shield className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <div className="flex flex-col text-left">
            <span className="text-[11px] font-semibold text-slate-900 leading-tight">
              {currentUser.displayName}
            </span>
            <span className="text-[10px] text-slate-500 capitalize leading-tight">
              {currentUser.role}
            </span>
          </div>

          {/* Quick role changer dropdown */}
          <select
            className="text-xs text-slate-600 bg-transparent border-0 focus:ring-0 cursor-pointer pl-1 font-medium hover:text-slate-900"
            title="Switch Persona to test role-based access"
            value={currentUser.role === 'manager' ? 'manager' : currentUser.memberId}
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'manager') {
                switchPersona('manager');
              } else {
                switchPersona('member', val);
              }
            }}
          >
            <option value="manager">Manager (Tanvir)</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                Member ({m.name.split(' ')[0]})
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
};
