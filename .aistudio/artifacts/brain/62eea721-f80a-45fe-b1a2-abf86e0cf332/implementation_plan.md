# Mess Manager — Product Architecture & Implementation Plan

A reliable, mobile-friendly mess accounting and financial settlement web application replacing monthly spreadsheets with non-negotiable meal-weighting rules, transparent expense allocations, fair largest-remainder reconciliation, and accountable settlement balances.

### User Review & Refined Decisions

> [!IMPORTANT]
> The implementation plan has been refined with the following core principles:

- **Friday Exception Review**: Friday defaults to lunch-only (1 unit). Any Friday entry with both services or 2 units is flagged with a **Needs Review** status for explicit manager confirmation instead of being silently or automatically modified.
- **Dedicated Guest Meal Tracking**: Guest meals are recorded in a separate guest log with host attribution and guest lunch/night attendance, calculated using the exact same meal-weighting rules, and charged to the host member while keeping regular vs. guest units visibly distinct in statements.
- **Expense Funding Source Distinction**: Explicitly distinguish between **Personal Funds** (paid out-of-pocket by a member, adding an approved reimbursement credit to their balance) and **Mess Cash / Common Fund** (paid from shared treasury, which does not credit any individual member).
- **Fair Largest-Remainder Reconciliation**: Distribute meal-pool expenses using the Hare-Niemeyer (largest remainder) method so the sum of individual member charges reconciles to the total expense pool to the exact cent/poisha without artificial surplus or deficit.
- **Lean First Release**: Prioritize the essential working foundation: authentication, member management, daily meal attendance, guest tracking, expenses & funding sources, deposits, and settlement balances. Advanced imports and background automations are deferred to subsequent releases.

---

### 1. Overview & Core Concept

- **What It Does**: Replaces error-prone manual spreadsheets with an intuitive system that tracks daily meal service availability, records member and guest attendance, applies fair weighted meal rules, tracks categorized expenses with funding source clarity, records payments, and computes who owes money and who receives money back.
- **Target Roles**:
  - **Admin / Manager**: Records daily service availability, logs member attendance and guests, logs market/utility purchases with funding source, records deposits, and generates monthly settlements.
  - **Member**: Views individual monthly meal history, guest portions, deposit record, and real-time net balance status (**Owes**, **Receives**, or **Settled**).
- **Core Value**: 100% transparent, tamper-evident accounting where every taka/dollar is accounted for without rounding leakage or hidden calculations.

---

### 2. User Experience & Essential Workflows

#### Key User Flows
1. **Daily Meal Log**:
   - Date picker with quick navigation.
   - Service availability toggles: *Lunch Served?* and *Night Served?* (Friday defaults to lunch-only).
   - Flag indicator: If Friday has 2 units or night service entered without confirmation, highlight with an amber badge: `"Friday Multi-Service — Needs Confirmation"`.
   - Member attendance grid with separate Lunch and Night toggles. Calculated weighted units (0, 1, 1.5, 2) display in real-time.
   - Dedicated Guest section: Host member selector, Lunch guest count, Night guest count, and optional note.
2. **Expenses & Market Ledger**:
   - Enter Date, Description, Amount, Category, and Allocation Method (*Meal pool*, *Split equally*, *Charge to member*, or *Record only*).
   - **Funding Source Selection**:
     - *Paid by Member (Personal)* $\rightarrow$ Credits the paying member for reimbursement in settlement.
     - *Paid from Mess Fund (Common Cash)* $\rightarrow$ Expense is recorded against the pool/split without generating a personal credit.
   - Same-day duplicate warning alert with explicit confirmation button.
3. **Deposits & Payments**:
   - Record member deposits with Date, Amount, Payment Method (Cash, bKash/Nagad/Mobile Wallet, Bank), and Reference.
   - Complete ledger per member with reversal support for corrections.
4. **Settlement & Monthly Reconciliation**:
   - Per-member breakdown: Regular Units, Guest Units, Total Units, Meal Cost, Shared Charges, Individual Charges, Deposits, Approved Reimbursements.
   - Net Balance Formula:
     $$\text{Balance} = \text{Payments} + \text{Personal Reimbursements} - \text{Meal Cost} - \text{Shared Charges} - \text{Individual Charges}$$
   - Status badge: **Receives** (green), **Owes** (red), or **Settled** (neutral).
   - Monthly summary showing total meal pool, total units, exact meal rate, and reconciliation balance check.

#### Visual Theme & Ergonomics
- **Color Discipline**: Clean light/dark responsive UI. Deep navy header/sidebar (`#0F172A`), neutral slate content background (`#F8FAFC`), crisp white surface cards with 1px border (`#E2E8F0`).
- **Semantic Accents**:
  - Emerald (`#16A34A`): Credit / Receives
  - Crimson (`#DC2626`): Deficit / Owes
  - Amber (`#D97706`): Needs Review / Exception
  - Indigo (`#4F46E5`): Primary actions & active tabs
- **Typographic Math**: Monospace tabular numerals (`font-mono tabular-nums`) across all financial tables, attendance counts, and rate previews.
- **Zero-Pill Discipline**: Unboxed metadata with quiet typographic bullet separators (`·`). Status tags feature clear text and iconography, not garish candy pills.

---

### 3. Calculation & Reconciliation Engine

The mathematical core operates as a pure TypeScript module shared between server validation and UI live previews:

#### Service Availability & Meal Weighting Rules
| Services Actually Served | Member Attendance | Weighted Units |
|---|---|---:|
| Lunch + Night | Lunch only | 1.5 |
| Lunch + Night | Night only | 1.0 |
| Lunch + Night | Both | 2.0 |
| Lunch only (standard Friday or night cancelled) | Lunch attended | 1.0 |
| Night only (lunch cancelled) | Night attended | 1.0 |
| No service served | None | 0.0 |

*Guests follow the exact same weighting rules per guest portion and are summed to the host's billable units while retaining separate line-item visibility.*

#### Fair Largest-Remainder (Hare-Niemeyer) Rounding Method
To prevent rounding discrepancies between the meal pool expenses and individual member charges:
1. $\text{Raw Meal Rate} = \frac{\text{Total Meal-Pool Expenses}}{\text{Total Weighted Units}}$ (computed with floating precision).
2. For each member: $\text{Exact Share} = \text{Member Total Units} \times \text{Raw Meal Rate}$.
3. Convert to currency integer cents/poisha:
   - $\text{Base Cents}_i = \lfloor \text{Exact Share}_i \times 100 \rfloor$
   - $\text{Remainder}_i = (\text{Exact Share}_i \times 100) - \text{Base Cents}_i$
4. Sum all base cents: $\Delta = (\text{Total Meal-Pool Expenses} \times 100) - \sum \text{Base Cents}_i$.
5. Sort members by $\text{Remainder}_i$ in descending order; distribute 1 cent/poisha to the top $\Delta$ members.
6. Result: Every member's charge is rounded to 2 decimals, and $\sum \text{Allocated Charges} \equiv \text{Total Meal-Pool Expenses}$ to the exact cent.

---

### 4. Technical Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Client Interface                              │
│  React 19 + Vite SPA (Dashboard, Daily Log, Expenses, Deposits, Balances)│
│  • Zod Form Validation                                                 │
│  • Pure TypeScript Calculation Engine for Real-Time Previews           │
│  • Responsive Desktop Sidebar + Mobile Bottom Navigation               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / Bearer Auth Token
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Express Full-Stack Server                       │
│  • /api/auth: Strict email authentication and session verification     │
│  • /api/members: Member roster and active status management            │
│  • /api/meals: Service availability, attendance matrix, guest records  │
│  • /api/expenses: Transactions, funding sources, allocation methods    │
│  • /api/payments: Member deposits, payment references, reversals       │
│  • /api/settlement: Server-authoritative Largest-Remainder calculation │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Drizzle ORM (Connection Pool)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  Cloud SQL (PostgreSQL Database)                       │
│  users • messes • members • service_days • attendance                  │
│  guest_attendance • expenses • payments • audit_log                    │
└────────────────────────────────────────────────────────────────────────┘
```

#### Core Data Entities
- **`users` & `messes`**: User authentication, role assignment (`admin`, `manager`, `member`), mess currency (BDT) and timezone (`Asia/Dhaka`).
- **`members`**: Member display names, status (active/inactive), and stable identifier.
- **`service_days`**: Date, lunch_served (boolean), night_served (boolean), exception_reason, review_flag (boolean).
- **`attendance`**: Service day reference, member reference, lunch_attended (boolean), night_attended (boolean), calculated_units.
- **`guest_attendance`**: Service day reference, host member reference, guest_lunch_count, guest_night_count, calculated_units, note.
- **`expenses`**: Date, description, amount, category, allocation_method (`meal_pool`, `split_equally`, `member_charge`, `record_only`), payer_member_id (optional), is_personal_fund (boolean), note.
- **`payments`**: Date, member reference, amount, payment method, reference note, reversal_of_id.
- **`audit_log`**: Record of corrections, date overrides, and payment adjustments.

---

### 5. Prioritized Implementation Roadmap

| Stage | Focus Area | Deliverables |
|---|---|---|
| **Step 1: Setup & Data Foundation** | Cloud SQL & Auth | Provision Cloud SQL PostgreSQL database, configure Drizzle ORM schema, and set up strict email-based authentication. |
| **Step 2: Core Calculation Module** | Unit-Tested Engine | Implement the pure calculation module covering standard two-service days, Friday lunch-only, cancellation exceptions, guest weighting, and largest-remainder rounding. |
| **Step 3: Member & Daily Meal Attendance** | Member & Meal Log UI | Build the member roster, daily date picker, service switches with Friday review flagging, attendance matrix, and dedicated guest meal entry. |
| **Step 4: Expenses & Payments** | Transaction Ledgers | Build the categorized expense logger with Personal vs. Mess Funds distinction, duplicate alert check, and member payment/deposit tracking. |
| **Step 5: Settlement Dashboard** | Real-Time Reconciliation | Build the settlement ledger with transparent breakdown (Regular vs. Guest units, meal cost, personal reimbursements, net balance Owes/Receives). |
| **Step 6: Polish & Verification** | End-to-End Testing | Verify against all required edge cases: zero units, Friday multi-service confirmation, exact zero-residual sum reconciliation, and responsive mobile testing. |

---

### 6. Deliverables & Acceptance Checklist

- [ ] **Meal Weighting Invariants**:
  - Two-service day: Lunch only = 1.5, Night only = 1.0, Both = 2.0.
  - Single-service day: Attended service = 1.0.
  - Friday with 2 units is flagged for manager review with an explicit confirmation step.
- [ ] **Guest Tracking**:
  - Guests tracked in a distinct section with host attribution and verified meal-rule weighting.
  - Host statement displays member regular units and guest units as distinct line items.
- [ ] **Funding Source Integrity**:
  - Personal expense payments add a reimbursement credit to the paying member.
  - Mess fund expenses do not add individual credits to any member.
- [ ] **Reconciliation Integrity**:
  - Hare-Niemeyer largest-remainder algorithm allocates meal-pool expenses with zero discrepancy.
  - Member balances correctly reflect: $\text{Payments} + \text{Reimbursements} - \text{Charges}$.
