/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider } from './context/AppContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar, TabId } from './components/Sidebar.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { DailyLogView } from './components/DailyLogView.tsx';
import { ExpensesView } from './components/ExpensesView.tsx';
import { PaymentsView } from './components/PaymentsView.tsx';
import { SettlementView } from './components/SettlementView.tsx';
import { MembersView } from './components/MembersView.tsx';
import { SettingsView } from './components/SettingsView.tsx';

function MainLayout() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Top Bar Navigation */}
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pb-20 md:pb-8">
          {activeTab === 'dashboard' && <DashboardView setActiveTab={setActiveTab} />}
          {activeTab === 'meals' && <DailyLogView />}
          {activeTab === 'expenses' && <ExpensesView />}
          {activeTab === 'payments' && <PaymentsView />}
          {activeTab === 'settlement' && <SettlementView />}
          {activeTab === 'members' && <MembersView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
