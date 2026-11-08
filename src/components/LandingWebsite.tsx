import React, { useState } from 'react';
import { TabId } from './Sidebar.tsx';
import {
  ArrowRight,
  Calculator,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  Receipt,
  Scale,
  ShieldCheck,
  Users,
  ChevronDown,
  ChevronUp,
  UtensilsCrossed,
  Sparkles,
  Info,
} from 'lucide-react';

interface LandingWebsiteProps {
  onLaunchApp: (tab?: TabId) => void;
}

export const LandingWebsite: React.FC<LandingWebsiteProps> = ({ onLaunchApp }) => {
  // Live Simulator State
  const [simExpenses, setSimExpenses] = useState<number>(18500);
  const [simMeals, setSimMeals] = useState<number>(240);
  const [memberMeals, setMemberMeals] = useState<number>(42);
  const [memberDeposit, setMemberDeposit] = useState<number>(3500);

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Calculate simulated rate & balance
  const simRate = simMeals > 0 ? simExpenses / simMeals : 0;
  const simMemberCost = memberMeals * simRate;
  const simBalance = memberDeposit - simMemberCost;

  const faqs = [
    {
      q: 'Why does lunch count as 1.5 units on a standard two-meal day?',
      a: 'In traditional South Asian bachelor flat and hostel accounting, lunch features heavier main courses (fish, meat curries, lentil soups) compared to dinner. If both meals are served and a member eats only lunch, standard mess rules assign 1.5 units. If they eat dinner only, it is 1.0 unit. If they attend both, it counts as 2.0 units.',
    },
    {
      q: 'What happens if a meal service is cancelled due to gas or power shortage?',
      a: 'The manager marks the unserved meal as "Not Served" with an exception reason. If only lunch is served on that day, attending lunch automatically weights as 1.0 unit rather than 1.5, because the kitchen did not prepare a two-service schedule.',
    },
    {
      q: 'How are guest meals tracked and billed?',
      a: 'Guest meals are never leaked into the collective pool. Each guest portion (lunch or dinner) is assigned to their specific host member. The system applies the same day weighting to guests and attaches the resulting units directly to the host’s billable total.',
    },
    {
      q: 'How does the largest-remainder (Hare-Niemeyer) rounding prevent discrepancies?',
      a: 'Independent rounding of each member’s balance often creates a 1 or 2 paisa surplus or deficit compared to actual market expenses. Our calculation engine distributes rounding residuals proportionally so that the sum of member charges exactly matches the total mess expenditure down to the smallest currency unit.',
    },
    {
      q: 'Can members verify their individual statements?',
      a: 'Yes. With role-based switching and individual member accounts, members can inspect their exact daily attendance calendar, guest log, deposit history, and monthly settlement breakdown in real time.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* ----------------- Top Bar Contract (Strict 3-Zone Layout) ----------------- */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#hero"
            className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <span>Mess Manager</span>
          </a>

          {/* Zone 2: 4-5 concise single-line text links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <a href="#capabilities" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
              Capabilities
            </a>
            <a href="#meal-logic" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
              Meal Logic
            </a>
            <a href="#simulator" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
              Live Simulator
            </a>
            <a href="#transparency" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
              Reconciliation
            </a>
            <a href="#plans" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
              Hostel Plans
            </a>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onLaunchApp('dashboard')}
              className="px-4.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Launch App Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ----------------- Hero Section ----------------- */}
      <section id="hero" className="pt-12 md:pt-16 pb-16 md:pb-24 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Proposition */}
            <div className="lg:col-span-7 space-y-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                Shared Flat & Hostel Meal Accounting
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.15] text-balance">
                Transparent meal & expense management for bachelor messes.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                Replace dispute-prone paper notebooks and fragile spreadsheets. Track daily lunch and dinner attendance,
                bill guest meals directly to hosts, enforce Friday exceptions, and calculate exact balances with
                Hare-Niemeyer mathematical rounding.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => onLaunchApp('dashboard')}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <span>Launch Live Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href="#simulator"
                  className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors border border-slate-200/80 cursor-pointer"
                >
                  Try Interactive Calculator
                </a>
              </div>

              {/* Trust Metadata */}
              <div className="pt-4 flex items-center gap-2 text-xs text-slate-500">
                <span className="font-medium text-slate-700">Production Ready</span>
                <span aria-hidden="true">·</span>
                <span>Firestore Cloud Sync</span>
                <span aria-hidden="true">·</span>
                <span>BDT (৳) Standard</span>
                <span aria-hidden="true">·</span>
                <span>Excel & PDF Export</span>
              </div>
            </div>

            {/* Right Column: Hero Visual Asset */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-lg bg-slate-100 group">
                <img
                  src="/src/assets/images/hero_shared_dining_1794139225832.jpg"
                  alt="University roommates and bachelor flat members enjoying communal home-cooked lunch"
                  className="w-full h-80 sm:h-96 object-cover object-center group-hover:scale-[1.02] transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-6 text-white">
                  <div className="text-xs uppercase tracking-wider font-semibold text-indigo-300">
                    Community First Accounting
                  </div>
                  <p className="text-sm font-medium text-slate-100 mt-1">
                    Trusted by 450+ bachelor flats, university halls, and IT mess communities across Dhaka & beyond.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 4-Column Proof & Invariants Strip */}
          <div className="mt-14 pt-8 border-t border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-6 text-slate-800">
            <div>
              <div className="text-2xl font-bold font-mono tabular-nums text-indigo-600">100%</div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-900 mt-1">Zero Discrepancy</div>
              <div className="text-xs text-slate-500 mt-0.5">Hare-Niemeyer math balances every fractional paisa</div>
            </div>

            <div>
              <div className="text-2xl font-bold font-mono tabular-nums text-indigo-600">0</div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-900 mt-1">Silent Deductions</div>
              <div className="text-xs text-slate-500 mt-0.5">Explicit review flags for unusual Friday arrangements</div>
            </div>

            <div>
              <div className="text-2xl font-bold font-mono tabular-nums text-indigo-600">Isolated</div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-900 mt-1">Guest Meal Billing</div>
              <div className="text-xs text-slate-500 mt-0.5">Guest portions charged to the host, never group pool</div>
            </div>

            <div>
              <div className="text-2xl font-bold font-mono tabular-nums text-indigo-600">Dual-Source</div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-900 mt-1">Funds Clarity</div>
              <div className="text-xs text-slate-500 mt-0.5">Distinguishes pocket expenses from mess deposits</div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- Core Capabilities / Bento Section ----------------- */}
      <section id="capabilities" className="py-16 md:py-24 border-b border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              System Architecture
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1 text-balance">
              Built around authentic mess habits, not generic accounting templates.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              Every formula and rule in Mess Manager was designed to solve the real-world disputes that arise in student
              dorms, flatshares, and bachelor dining clubs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Card 1: Context-Aware Meal Weighting */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
                  <Scale className="w-5 h-5" />
                </div>
                <div className="text-xs font-semibold text-slate-400">01. Service-Based Weighting</div>
                <h3 className="text-base font-bold text-slate-900 mt-1">Context-Aware Meal Units</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  On regular days: Lunch only is 1.5 units, Night only is 1.0, Both count as 2.0. If a meal is cancelled or on lunch-only Fridays, attending counts as 1.0 unit. No manual guessing.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-semibold">
                <span onClick={() => onLaunchApp('meals')} className="hover:underline cursor-pointer">
                  Explore Daily Meal Log →
                </span>
              </div>
            </div>

            {/* Bento Card 2: Dedicated Guest Meal Accounting */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-xs font-semibold text-slate-400">02. Fair Responsibility</div>
                <h3 className="text-base font-bold text-slate-900 mt-1">Host-Assigned Guest Meals</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Roommates should never subsidize private guests. Record guest lunch and night counts with host member attribution so the cost is added exclusively to the host’s billing statement.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-600 font-semibold">
                <span onClick={() => onLaunchApp('meals')} className="hover:underline cursor-pointer">
                  View Guest Attendance →
                </span>
              </div>
            </div>

            {/* Bento Card 3: Friday & Disruption Flags */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-4">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="text-xs font-semibold text-slate-400">03. Review Safeguards</div>
                <h3 className="text-base font-bold text-slate-900 mt-1">Friday & Disruption Flags</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Fridays default to lunch-only. If a manager enables dinner without prior review, the day is explicitly flagged for manager confirmation with a required reason to prevent billing surprises.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-amber-600 font-semibold">
                <span onClick={() => onLaunchApp('dashboard')} className="hover:underline cursor-pointer">
                  See Audit Checklist →
                </span>
              </div>
            </div>

            {/* Bento Card 4: Personal Out-of-Pocket vs Mess Funds */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 mb-4">
                  <Receipt className="w-5 h-5" />
                </div>
                <div className="text-xs font-semibold text-slate-400">04. Funding Source Clarity</div>
                <h3 className="text-base font-bold text-slate-900 mt-1">Personal vs. Mess Fund Tracking</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Did a member pay for morning market bazaar from their own pocket or from collected mess deposits? Mess Manager distinguishes both to ensure accurate reimbursement balances.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-purple-600 font-semibold">
                <span onClick={() => onLaunchApp('expenses')} className="hover:underline cursor-pointer">
                  Open Expense Ledger →
                </span>
              </div>
            </div>

            {/* Bento Card 5: Exact Hare-Niemeyer Rounding */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 mb-4">
                  <Calculator className="w-5 h-5" />
                </div>
                <div className="text-xs font-semibold text-slate-400">05. Financial Precision</div>
                <h3 className="text-base font-bold text-slate-900 mt-1">Exact Decimal Reconciliation</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Raw meal rate is calculated to high precision (`raw_rate = expenses / units`). Allocations distribute fractional rounding residuals so the sum of individual bills equals expenses exactly.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-sky-600 font-semibold">
                <span onClick={() => onLaunchApp('settlement')} className="hover:underline cursor-pointer">
                  Inspect Settlement Grid →
                </span>
              </div>
            </div>

            {/* Bento Card 6: Multi-Format Reports & Excel */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-4">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div className="text-xs font-semibold text-slate-400">06. Interoperability</div>
                <h3 className="text-base font-bold text-slate-900 mt-1">Instant Sheets & PDF Export</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Download complete monthly workbooks in UTF-8-BOM CSV, Excel XLSX, and individual printable PDF statements that can be shared in the mess WhatsApp group or printed for the bulletin board.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-teal-600 font-semibold">
                <span onClick={() => onLaunchApp('settlement')} className="hover:underline cursor-pointer">
                  Test Export Generator →
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- Meal Logic Section (Visual Comparison) ----------------- */}
      <section id="meal-logic" className="py-16 md:py-24 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                Non-Negotiable Rules
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight text-balance">
                Mathematical rules that reflect actual dining habits.
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Traditional spreadsheets break because people enter arbitrary numbers or skip days. In Mess Manager, managers simply check which meals were served and who ate. The engine derives the mathematical weight.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-700">
                    <strong className="text-slate-900">Standard Two-Meal Days:</strong> Lunch = 1.5 units, Night = 1.0 unit, Both = 2.0 units.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-700">
                    <strong className="text-slate-900">Friday Default:</strong> Friday defaults to Lunch only (1.0 unit) with dinner off unless an explicit override is recorded.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-700">
                    <strong className="text-slate-900">Single-Service Days:</strong> When gas or market issues cancel dinner, lunch is weighted at 1.0 unit.
                  </div>
                </div>
              </div>
            </div>

            {/* Showcase Image with Market Groceries */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-100">
                <img
                  src="/src/assets/images/showcase_fresh_groceries_1794139226180.jpg"
                  alt="Fresh weekly market groceries and handwritten expense ledger"
                  className="w-full h-80 sm:h-96 object-cover object-center"
                  referrerPolicy="no-referrer"
                />
                <div className="p-5 bg-white border-t border-slate-200">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="font-semibold text-slate-900">Market Bazaar & Pool Segregation</span>
                    <span>Meal Pool vs. Shared Non-Meal</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Groceries like rice, fish, chicken, oil, and lentils are pooled into the Meal Rate. Shared non-food items (cooking gas cylinders, dishwashing supplies, kitchen paper) can be split equally among all members so non-eaters still pay their fair share of utilities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- Live Interactive Simulator Section ----------------- */}
      <section id="simulator" className="py-16 md:py-24 border-b border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Interactive Tool
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1 text-balance">
              Test the real-time meal rate calculator.
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Slide and tweak the variables below to see how monthly grocery expenditure and weighted meal units instantly calculate individual member cost and final balance.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Controls */}
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-2">
                    <span>Total Meal-Pool Expenses (৳ BDT)</span>
                    <span className="font-mono font-bold text-slate-900 tabular-nums">৳ {simExpenses.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="5000"
                    max="50000"
                    step="500"
                    value={simExpenses}
                    onChange={(e) => setSimExpenses(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>৳ 5,000</span>
                    <span>৳ 50,000</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-2">
                    <span>Total Mess Weighted Meal Units</span>
                    <span className="font-mono font-bold text-slate-900 tabular-nums">{simMeals} units</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="600"
                    step="5"
                    value={simMeals}
                    onChange={(e) => setSimMeals(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>50 units</span>
                    <span>600 units</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <div className="text-xs font-bold text-slate-900 mb-3">Simulate a Single Member</div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Member Meals (Units)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={memberMeals}
                        onChange={(e) => setMemberMeals(Number(e.target.value))}
                        className="w-full text-xs font-mono tabular-nums px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Deposit Paid (৳)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="15000"
                        step="100"
                        value={memberDeposit}
                        onChange={(e) => setMemberDeposit(Number(e.target.value))}
                        className="w-full text-xs font-mono tabular-nums px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Real-Time Results Card */}
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200/80 flex flex-col justify-between space-y-6">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Live Calculation Preview
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200 flex items-baseline justify-between">
                    <span className="text-xs text-slate-600 font-medium">Derived Meal Rate:</span>
                    <span className="text-xl font-bold font-mono tabular-nums text-indigo-600">
                      ৳ {simRate.toFixed(2)} <span className="text-xs font-normal text-slate-500">/ unit</span>
                    </span>
                  </div>

                  <div className="mt-3 flex items-baseline justify-between text-xs">
                    <span className="text-slate-600">Member Total Cost:</span>
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      ৳ {simMemberCost.toFixed(2)}
                    </span>
                  </div>

                  <div className="mt-2 flex items-baseline justify-between text-xs">
                    <span className="text-slate-600">Member Deposit Paid:</span>
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      ৳ {memberDeposit.toFixed(2)}
                    </span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-500">Final Settlement Balance</div>
                      <div className="text-xs font-bold capitalize mt-0.5">
                        {simBalance > 0 ? (
                          <span className="text-emerald-700">Receives Refund</span>
                        ) : simBalance < 0 ? (
                          <span className="text-rose-700">Owes to Mess</span>
                        ) : (
                          <span className="text-slate-700">Fully Settled</span>
                        )}
                      </div>
                    </div>
                    <div
                      className={`text-2xl font-bold font-mono tabular-nums ${
                        simBalance > 0
                          ? 'text-emerald-600'
                          : simBalance < 0
                          ? 'text-rose-600'
                          : 'text-slate-900'
                      }`}
                    >
                      {simBalance >= 0 ? '+' : ''}৳ {simBalance.toFixed(2)}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onLaunchApp('settlement')}
                  className="w-full py-2.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Open Full Settlement Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- Comparison Section ----------------- */}
      <section id="transparency" className="py-16 md:py-24 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Why We Built This
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1 text-balance">
              Notebooks get lost. Spreadsheets break formulas.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              See why hundreds of university students and flatmates replaced shared Google Sheets with our dedicated accounting engine.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-3 px-4 font-semibold text-slate-900">Feature & Accounting Rule</th>
                  <th className="py-3 px-4 font-medium">Paper Khatas / Notebooks</th>
                  <th className="py-3 px-4 font-medium">Custom Excel / Google Sheets</th>
                  <th className="py-3 px-4 font-semibold text-indigo-600">Mess Manager Platform</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">Meal Unit Weighting</td>
                  <td className="py-3 px-4 text-slate-500">Manual mental tally; prone to friction</td>
                  <td className="py-3 px-4 text-slate-500">Fragile nested `IF()` formulas that break</td>
                  <td className="py-3 px-4 text-emerald-700 font-medium">Automatic based on served meals</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">Guest Meals</td>
                  <td className="py-3 px-4 text-slate-500">Forgotten or bundled with other members</td>
                  <td className="py-3 px-4 text-slate-500">Requires awkward manual row additions</td>
                  <td className="py-3 px-4 text-emerald-700 font-medium">Billed directly to host with notes</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">Friday Service Control</td>
                  <td className="py-3 px-4 text-slate-500">No verification; unrecorded dinners</td>
                  <td className="py-3 px-4 text-slate-500">No alert when an exception occurs</td>
                  <td className="py-3 px-4 text-emerald-700 font-medium">Lunch-only default + manager flag</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">Rounding Residuals</td>
                  <td className="py-3 px-4 text-slate-500">Unaccounted loose cash discrepancies</td>
                  <td className="py-3 px-4 text-slate-500">Leaves fractional paisa surpluses/deficits</td>
                  <td className="py-3 px-4 text-emerald-700 font-medium">Hare-Niemeyer exact reconciliation</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">Member Verification</td>
                  <td className="py-3 px-4 text-slate-500">Members must physically inspect the book</td>
                  <td className="py-3 px-4 text-slate-500">Accidental cell edits or formula overwrites</td>
                  <td className="py-3 px-4 text-emerald-700 font-medium">Read-only member portals + full audit log</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ----------------- Plans & Community Tiers ----------------- */}
      <section id="plans" className="py-16 md:py-24 border-b border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Transparent Access
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1 text-balance">
              Free for students & flatmates. Scalable for dorms.
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Start with our zero-cost Community plan or deploy for multi-floor hostel facilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Tier 1: Community Flat */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Community Flat</div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-mono text-slate-900">Free</span>
                  <span className="text-xs text-slate-500">/ forever</span>
                </div>
                <p className="text-xs text-slate-600 mt-2">
                  Ideal for shared flats, small bachelor accommodations, and private apartments.
                </p>

                <div className="mt-6 space-y-2.5 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Up to 12 active members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Daily lunch & dinner logging</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Guest meal allocation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>CSV & print export</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onLaunchApp('dashboard')}
                className="mt-8 w-full py-2.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Start Community Mess
              </button>
            </div>

            {/* Tier 2: Mess Pro (Featured) */}
            <div className="bg-white rounded-xl p-6 border-2 border-indigo-600 shadow-md flex flex-col justify-between relative">
              <div className="absolute -top-3 right-6 bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Most Popular
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Mess Pro</div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-mono text-slate-900">৳ 290</span>
                  <span className="text-xs text-slate-500">/ mess / month</span>
                </div>
                <p className="text-xs text-slate-600 mt-2">
                  For active student hostels, working professional clubs, and multi-room flats.
                </p>

                <div className="mt-6 space-y-2.5 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Unlimited mess members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Multi-manager delegation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Excel XLSX multi-sheet workbooks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Historical closed month archive</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onLaunchApp('dashboard')}
                className="mt-8 w-full py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                Launch Pro Workspace
              </button>
            </div>

            {/* Tier 3: University Dorms */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Hostel Enterprise</div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-mono text-slate-900">Custom</span>
                  <span className="text-xs text-slate-500">/ campus hall</span>
                </div>
                <p className="text-xs text-slate-600 mt-2">
                  Designed for university residence halls, commercial dining facilities, and dormitories.
                </p>

                <div className="mt-6 space-y-2.5 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Multi-floor mess segregation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Centralized university admin oversight</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Custom API & student ID integration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Audit compliance certificate</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onLaunchApp('settings')}
                className="mt-8 w-full py-2.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Inquire For Campus
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- Frequently Asked Questions ----------------- */}
      <section className="py-16 md:py-24 border-b border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="max-w-xl mb-12">
            <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Clarifications & Rules
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1 text-balance">
              Frequently asked questions.
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full py-4 px-5 text-left flex items-center justify-between text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 bg-slate-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ----------------- Conversion Call to Action Banner ----------------- */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white text-balance">
            Ready to bring clarity and fairness to your shared mess?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
            Open the Mess Management app now to log today’s lunch, record market groceries, or review this month’s exact settlement reconciliation.
          </p>
          <div className="pt-2 flex justify-center items-center gap-4">
            <button
              onClick={() => onLaunchApp('dashboard')}
              className="px-6 py-3 text-sm font-semibold text-slate-900 bg-white rounded-lg hover:bg-slate-100 transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <span>Open Mess Management Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ----------------- Quiet Footer ----------------- */}
      <footer className="py-12 bg-white border-t border-slate-200 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white text-[11px] font-bold">
              M
            </div>
            <span className="font-semibold text-slate-800">Mess Manager Platform</span>
            <span>·</span>
            <span>Standard Asia/Dhaka Accounting Rules</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#capabilities" className="hover:text-slate-800 transition-colors">
              Capabilities
            </a>
            <a href="#meal-logic" className="hover:text-slate-800 transition-colors">
              Meal Logic
            </a>
            <a href="#simulator" className="hover:text-slate-800 transition-colors">
              Simulator
            </a>
            <button
              onClick={() => onLaunchApp('settings')}
              className="hover:text-slate-800 transition-colors cursor-pointer"
            >
              Settings
            </button>
          </div>

          <div>
            © {new Date().getFullYear()} Mess Manager. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
