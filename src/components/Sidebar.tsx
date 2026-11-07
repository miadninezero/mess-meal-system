import React from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  Receipt,
  Wallet,
  Scale,
  Users,
  Settings,
} from 'lucide-react';

export type TabId = 'dashboard' | 'meals' | 'expenses' | 'payments' | 'settlement' | 'members' | 'settings';

interface SidebarProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard' as TabId, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'meals' as TabId, label: 'Daily Meal Log', icon: CalendarCheck },
    { id: 'expenses' as TabId, label: 'Expenses', icon: Receipt },
    { id: 'payments' as TabId, label: 'Deposits', icon: Wallet },
    { id: 'settlement' as TabId, label: 'Settlement', icon: Scale },
    { id: 'members' as TabId, label: 'Members', icon: Users },
    { id: 'settings' as TabId, label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Desktop Dark Navy Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0 select-none">
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-indigo-500 text-white font-bold flex items-center justify-center text-xs">
              DM
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight">Dhaka Central Mess</h2>
              <p className="text-[11px] text-slate-400">Monthly Accounting</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Currency & Rule Hint footer */}
        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
          <div className="flex justify-between items-center text-slate-300">
            <span>Currency:</span>
            <span className="font-mono font-medium text-slate-200">BDT (৳)</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span>Timezone:</span>
            <span className="text-slate-200">Asia/Dhaka</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span>Friday Default:</span>
            <span className="text-amber-400 font-medium">Lunch only</span>
          </div>
        </div>
      </aside>

      {/* Mobile Sticky Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-40 px-2 py-1.5 flex justify-around items-center">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center p-1.5 rounded-md min-w-[54px] cursor-pointer ${
                isActive ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 font-medium whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
