import React, { useState } from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  Receipt,
  Wallet,
  Scale,
  Users,
  Settings,
  MoreHorizontal,
  X,
} from 'lucide-react';

export type TabId = 'dashboard' | 'meals' | 'expenses' | 'payments' | 'settlement' | 'members' | 'settings';

interface SidebarProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const navItems = [
    { id: 'dashboard' as TabId, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'meals' as TabId, label: 'Daily Meal Log', icon: CalendarCheck },
    { id: 'expenses' as TabId, label: 'Expenses', icon: Receipt },
    { id: 'payments' as TabId, label: 'Deposits', icon: Wallet },
    { id: 'settlement' as TabId, label: 'Settlement', icon: Scale },
    { id: 'members' as TabId, label: 'Members', icon: Users },
    { id: 'settings' as TabId, label: 'Settings', icon: Settings },
  ];

  // Mobile bottom bar items: primary 4 + More
  const mobilePrimary = [
    { id: 'dashboard' as TabId, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'meals' as TabId, label: 'Meals', icon: CalendarCheck },
    { id: 'expenses' as TabId, label: 'Expenses', icon: Receipt },
    { id: 'settlement' as TabId, label: 'Settlement', icon: Scale },
  ];

  const mobileMoreItems = [
    { id: 'payments' as TabId, label: 'Deposits & Payments', icon: Wallet },
    { id: 'members' as TabId, label: 'Mess Members', icon: Users },
    { id: 'settings' as TabId, label: 'Settings & Rules', icon: Settings },
  ];

  const isMoreActive = mobileMoreItems.some((m) => m.id === activeTab);

  return (
    <>
      {/* Desktop Dark Navy Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0 select-none">
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
              DM
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight">Dhaka Central Mess</h2>
              <p className="text-[11px] text-slate-400">Monthly Accounting App</p>
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
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
        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1.5">
          <div className="flex justify-between items-center text-slate-300">
            <span>Currency:</span>
            <span className="font-mono font-medium text-slate-200">BDT (৳)</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span>Timezone:</span>
            <span className="text-slate-200">Asia/Dhaka</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span>Algorithm:</span>
            <span className="text-emerald-400 font-medium">Hare-Niemeyer</span>
          </div>
        </div>
      </aside>

      {/* Mobile Sticky Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 z-40 px-2 py-1 flex justify-around items-center">
        {mobilePrimary.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setShowMoreMenu(false);
              }}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-lg transition-colors cursor-pointer ${
                isActive ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          );
        })}

        {/* More button */}
        <button
          onClick={() => setShowMoreMenu((prev) => !prev)}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-lg transition-colors cursor-pointer ${
            isMoreActive || showMoreMenu ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">More</span>
        </button>
      </nav>

      {/* Mobile More Drawer Sheet */}
      {showMoreMenu && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex flex-col justify-end">
          <div className="bg-slate-900 border-t border-slate-800 rounded-t-2xl p-5 space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-white tracking-wide uppercase">More Application Sections</span>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-1 text-slate-400 hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {mobileMoreItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setShowMoreMenu(false);
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl text-xs font-semibold cursor-pointer transition ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800/80 text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-indigo-400" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 text-center">
              <p className="text-[11px] text-slate-400">Dhaka Central Mess • Progressive Web Application</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
