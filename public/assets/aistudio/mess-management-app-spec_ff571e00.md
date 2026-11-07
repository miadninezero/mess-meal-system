# Mess Management App — Product & Technical Blueprint

## 1. Product goal

Build a simple, mobile-friendly mess accounting app that replaces the monthly spreadsheet workflow while keeping the same rules:

- Track daily lunch/day and night meal service.
- Record which members ate each available service.
- Calculate weighted meal units using the mess rules.
- Record market/household expenses and member deposits.
- Calculate each member's monthly cost and whether they owe money or should receive money back.
- Keep a transparent history so members can check the numbers.
- Export reports in formats that open easily in Excel and Google Sheets.

The app must be understandable to non-technical mess members. The interface should use plain language, clear totals, and an optional Bangla/English display.

## 2. Non-negotiable meal rules

Do not ask users to type a weighted meal value for normal attendance. Ask which services were available and which services each person ate; calculate the weight.

### Service availability and member attendance

| Services actually served that date | Member attendance | Weighted units |
|---|---|---:|
| Lunch + night | Lunch only | 1.5 |
| Lunch + night | Night only | 1 |
| Lunch + night | Both | 2 |
| Lunch only | Lunch | 1 |
| Night only | Night | 1 |
| No service | None | 0 |

Friday defaults to **lunch only**, so lunch attendance is 1 unit. The manager can record an exception if a Friday has a different service arrangement.

If the night meal is cancelled because of an external issue, mark night service as **not served**. Lunch attendance then counts as 1 unit, not 1.5. If only night service is served, night attendance counts as 1.

The calculation is based on what was actually served that day, not merely the weekday.

### Guest meals

Guest meals are valid and must not be flagged as accidental values above 2. In the new app, record guests explicitly:

- Date and host/member to whom the guest cost is assigned.
- Number of guests eating lunch.
- Number of guests eating night meal.
- Optional guest name/note.

Apply the same weighting rule to each guest's attendance. For example, a guest eating lunch on a normal two-service day contributes 1.5 units; on a lunch-only day, 1 unit. This makes guest totals explainable. During historical import, retain existing values such as 3 or 4 exactly and flag them for review rather than guessing how many guests or which meal they represent.

## 3. Main user roles

1. **Owner/Admin:** manages the mess, members, settings, access, corrections, and monthly closing.
2. **Manager:** enters attendance, expenses, deposits, and prepares settlement. Can correct open months.
3. **Member:** views their own meal history, deposits, statements, and current balance. Optional permission to submit a payment confirmation or attendance correction request.

A small mess can start with one Admin/Manager account and add member accounts later.

## 4. Main screens and features

### A. Dashboard

- Month selector and month status: Open / Needs review / Closed.
- KPI cards: Meal-related expenses, total weighted units, current meal rate, active members, total deposits, and outstanding/credit balance.
- Daily summary: services served, total units, and days needing review.
- Member balance preview: member, weighted units, meal cost, paid, balance, status.
- Expense trend and quick actions: Log meals, Add expense, Record payment, View settlement.
- A visible data freshness indicator: Saved / Saving / Save failed.

### B. Daily meal log

- Calendar and date picker.
- Service switches: Lunch served? Night served? Friday automatically defaults to lunch-only.
- If a service is unavailable, require a reason when it is an exception (for example, kitchen issue, chef unavailable, external disruption).
- Member grid with separate Lunch and Night toggles.
- Show the calculated weighted value beside each member immediately: 0, 1, 1.5, or 2.
- Guest section with guest lunch/night counts and host member.
- Show daily total units, including guests.
- Warn if attendance is entered for a service that was not served.
- Allow a manager to correct a date, with a reason recorded in the audit log.

### C. Expenses

Each purchase is a separate transaction. Fields:

- Date (required), description/item, amount, category, who paid, optional receipt/photo, and note.
- Allocation method: **Meal pool**, **Split equally**, **Charge to a member**, or **Record only**.
- Multiple purchases on the same date are allowed. Do not block them as duplicates.
- Warn when a new transaction looks very similar to an existing same-date transaction (same description/amount), but allow the user to confirm it is a separate purchase.
- Show monthly totals by category and a searchable transaction ledger.

Default food/market items to Meal pool to preserve the current calculation. Shared items such as gas or utilities should have an explicit allocation method rather than being silently mixed into the meal rate.

### D. Members

- Add, edit, deactivate, and view members.
- Keep stable member IDs. Names can change without losing history.
- Store aliases for historical spellings, but never merge similar names automatically.
- Track active-from and inactive-from dates so historical attendance remains intact.
- A member who leaves should be deactivated, not deleted.

### E. Payments / deposits

- Record date, member, amount, payment method (cash, bank, mobile wallet, other), transaction reference, and note.
- Show payment history and running total per member.
- Support correction/reversal entries rather than silently overwriting a payment.

### F. Settlement

Per member, show:

- Weighted units (member + guest units assigned to them, visibly separated).
- Meal cost.
- Equal/shared charges and individual charges.
- Deposits/payments.
- Reimbursements or approved adjustments.
- Final balance and plain-language status: **Owes** / **Receives** / **Settled**.

Balance formula:

`member balance = payments + approved credits/reimbursements - meal cost - shared charges - individual charges`

Positive means the mess/manager owes the member. Negative means the member owes the mess/manager. Zero means settled.

### G. Reports

- Monthly summary for the whole mess.
- Individual member statement.
- Daily attendance/weighted-unit report.
- Expense ledger and category totals.
- Deposits and settlement report.
- Export buttons for CSV, XLSX, and PDF.

### H. Settings

- Mess name, currency (default BDT), timezone (Asia/Dhaka), language, Friday default, meal weighting rules, categories, roles, and export preferences.
- Keep meal rule versions. Do not silently recalculate a closed month when rules are changed later.

## 5. Calculation engine

Calculations must live in one shared, tested TypeScript module and run on the server for final saved totals. The UI can call the same pure functions for previews.

Pseudo-logic for one person on one date:

1. Read which meal services were actually served.
2. Read whether the person attended lunch and/or night.
3. If both lunch and night were served:
   - both attended = 2
   - lunch only = 1.5
   - night only = 1
   - neither = 0
4. If exactly one service was served and the person attended it = 1.
5. If no service was served = 0.
6. Apply the same rule to each guest, then add guest units to the host member's billable units while keeping guest units separately visible.

Monthly calculation:

- `meal_pool_expense_total = sum(expenses with allocation_method = Meal pool)`
- `total_weighted_units = sum(member units + guest units)`
- `raw_meal_rate = meal_pool_expense_total / total_weighted_units`
- If total units are zero, show `Not available` and do not divide by zero.
- Member meal charge is based on their billable weighted units multiplied by the unrounded rate.
- Show the meal rate rounded to two decimal places, but calculate with higher precision internally.
- Allocate currency rounding residuals so the sum of member meal charges equals the meal-pool total exactly to the smallest currency unit. Do not let independent rounding create an unexplained surplus/shortfall.
- Add equal-split and individual charges separately; do not mix them into the meal rate.

Use a decimal/numeric money type in the database (not JavaScript floating-point arithmetic) for final accounting.

## 6. Error handling and safeguards

| Situation | Expected system behavior |
|---|---|
| Friday set to lunch + night | Show warning; require manager confirmation and reason before saving. |
| Night meal cancelled on a normal day | Set Night served = No; require an exception reason; lunch-only attendance becomes 1. |
| Attendance entered for a meal not served | Block by default or require an explicit manager override and note. |
| Guest meal / value above 2 | Treat as guest portions, not a data error; show guest detail. Historical unexplained values are flagged for review. |
| Missing expense date, amount, description, or category | Prevent saving; show the field-level error. |
| Similar expense on same date | Show duplicate warning, allow confirmation. Multiple genuine purchases on one day remain valid. |
| Negative balance | Valid; label as amount the member owes. Do not clamp to zero. |
| Zero total weighted units | Do not calculate a rate; show a clear warning. |
| Member has no attendance on a date | Keep blank/unknown distinct from an explicit zero/no meal where possible; month close asks manager to review missing days. |
| Formula/calculation mismatch | Stop month closing, show a reconciliation panel, preserve all entries, and identify the source rows. |
| Network/save error | Keep unsaved form data locally, show Save failed, allow retry; never display an unsaved value as confirmed. |
| Edit after month close | Require Admin to reopen the month; write the before/after values and reason to audit log. |

Never silently repair financial data. Provide a suggested correction, ask an authorized user to confirm, and log the correction.

## 7. Monthly review and closing

Before closing a month, run a checklist:

- Every calendar date is classified as served/no service or intentionally not applicable.
- Friday service configuration is correct.
- Exceptions have reasons.
- Unusual guest totals are explained.
- No required expense fields are missing.
- Payments are assigned to a member.
- All totals recalculate successfully.
- Sum of member balances and the manager/cash reconciliation agree.

The manager reviews the checklist and closes the month. A closed month becomes read-only for normal users. Admin can reopen it with a reason. Every change is audited.

## 8. Backend architecture

Recommended stack for a practical first version:

- **Frontend:** Next.js + TypeScript + Tailwind CSS + shadcn/ui.
- **Backend/database:** Supabase (PostgreSQL, Auth, Row Level Security, Storage).
- **Hosting:** Vercel for the web app; Supabase for database and file storage.
- **Validation:** Zod schemas on every write endpoint/action.
- **Charts:** Recharts or a similar lightweight chart library.

Use the database as the source of truth. Do not use one growing Excel workbook or a browser-only file as the live database. Use version-controlled SQL migrations. Keep database service-role secrets on the server only.

### Suggested database tables

- `messes`: name, currency, timezone, settings.
- `profiles`: auth user ID, display name.
- `mess_memberships`: mess ID, user ID, role.
- `members`: stable member ID, mess ID, display name, aliases, active dates, status.
- `accounting_months`: mess ID, year, month, status, closed_at, closed_by, rules_version.
- `service_days`: date, lunch_served, night_served, day_type, exception_reason, approved_by.
- `attendance`: date, member_id, lunch_attended, night_attended, calculated_units.
- `guest_attendance`: date, host_member_id, guest_count_lunch, guest_count_night, note, calculated_units.
- `expenses`: date, description, amount, category_id, allocation_method, paid_by_member_id, receipt_path, note, created_by.
- `expense_categories`: name, default allocation method.
- `payments`: date, member_id, amount, method, reference, created_by, reversal_of_id.
- `adjustments`: member_id, amount, reason, type, approved_by.
- `audit_log`: actor, entity/table, entity ID, action, before JSON, after JSON, reason, timestamp.
- `monthly_snapshots`: locked calculation summary and calculation version at closing.

Use foreign keys, non-negative constraints for expense/payment amounts, unique constraints where appropriate, and indexes on mess/date/member. Multiple expenses on the same date must remain possible.

Enable Supabase Row Level Security on every mess-owned table. A user can only access data for a mess in which they have a membership. Members can read their permitted statements; managers/admins can write according to role.

## 9. Where data and files are saved

### Live records

- Structured records (members, meals, expenses, payments, balances) live in Supabase PostgreSQL.
- Receipt images live in a private Supabase Storage bucket. Store only the file path and metadata in the database.
- Exported reports and backup files live in a private storage bucket, organized by mess and month.
- The browser may temporarily cache a draft to prevent data loss, but that cache is not the official record.

Suggested storage paths:

```text
mess-data/{mess_id}/receipts/{YYYY}/{MM}/{expense_id}.jpg
mess-data/{mess_id}/exports/{YYYY}/{MM}/monthly-report.xlsx
mess-data/{mess_id}/exports/{YYYY}/{MM}/monthly-report.pdf
mess-data/{mess_id}/exports/{YYYY}/{MM}/expenses.csv
mess-data/{mess_id}/backups/{YYYY}/{MM}/backup-{timestamp}.json
```

### Export formats

- **CSV UTF-8 with BOM:** best for opening in Excel/Google Sheets and preserving Bangla text. Export one table per CSV (attendance, expenses, payments, members, balances).
- **XLSX:** one readable workbook with tabs such as Summary, Daily Meals, Guests, Expenses, Payments, Member Balances, and Exceptions. Use formatted dates, currency, filters, frozen headers, and clear totals.
- **PDF:** print/share-friendly monthly summary and individual member statement.
- **JSON:** complete structured backup for restoring/importing the data. Include schema version and export timestamp.

PostgreSQL remains the source of truth. CSV/XLSX/PDF are readable reports, not the only copy of the data. Make backup and restore available to Admins and test restoration before launch.

## 10. Frontend visual direction

Use a clean desktop dashboard with a responsive mobile layout:

- Dark navy left sidebar with Dashboard, Daily Log, Expenses, Members, Payments, Reports, Settings.
- Header with selected month, month status, and save/sync indicator.
- Four main summary cards: Total Weighted Units, Meal-Pool Expenses, Meal Rate, Active Members.
- Main content split into Daily Meal Log and Member Overview.
- Quick action buttons: Log Meals, Add Expense, Record Payment, View Report.
- Lower section with expense trend and Settlement Summary.
- Use green for credit/receives, red for owes, amber for needs review, and neutral colors for ordinary data. Never rely on color alone; always include text labels and/or icons.
- Mobile: bottom navigation or compact menu, stacked KPI cards, and a scrollable attendance grid with sticky member/date labels.
- Every form should show a live calculation preview and explicit Save/Cancel controls.

## 11. Importing the existing workbook

Create a guided Excel import flow:

1. Upload the workbook.
2. Preview each monthly sheet and map columns to members/fields.
3. Let the Admin match aliases such as spelling variations; never merge names automatically.
4. Preserve historical values exactly.
5. Flag blank expense dates, ambiguous member names, unusual Friday entries, and historical guest values that lack a guest breakdown.
6. Show import totals and a reconciliation preview before committing.
7. Save an import batch ID so imported rows can be traced back to the workbook and rolled back as a batch if necessary.

Do not invent missing dates or silently normalize historical balances. Keep an original source workbook backup in private storage.

## 12. Test cases required before launch

Meal calculation tests:

- Normal two-service day: lunch only = 1.5.
- Normal two-service day: night only = 1.
- Normal two-service day: both = 2.
- Friday lunch-only: lunch = 1.
- Normal weekday with night cancelled: lunch = 1.
- Night-only service: night = 1.
- No service: 0.
- Guest attendance follows the same rules and adds to total units.

Accounting tests:

- Meal rate = meal-pool expenses / weighted units.
- Zero units never causes division by zero.
- Member balance sign is correct for owes vs receives.
- Allocated meal charges exactly reconcile to meal-pool expenses after rounding.
- Equal-split and individual expenses are kept separate from the meal rate.
- Reversals and post-close edits preserve audit history.
- A duplicate-looking purchase can be confirmed as a legitimate second purchase.

## 13. Recommended build phases

**Phase 1 — Reliable core:** authentication, roles, members, service days, attendance, guest meals, expenses, payments, calculations, member balances, audit log.

**Phase 2 — Operations:** monthly review/lock, reports, CSV/XLSX/PDF exports, workbook import, storage backups.

**Phase 3 — Convenience:** mobile PWA, optional offline draft queue, Bangla language toggle, member self-service, receipt capture, reminders.

Build Phase 1 first. Do not add chat, AI predictions, complex wallet integrations, or unrelated features until the basic accounting reconciles correctly.

---

# Master prompt for a vibe-coding tool

Build a production-minded, responsive web app called **Mess Manager** using Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, and Supabase (PostgreSQL, Auth, Storage). This replaces a multi-month mess-management Google Sheets workbook.

Follow the product and technical blueprint in this document. Treat it as the source of truth. Prioritize accounting correctness over decorative features.

## Required app behavior

1. Implement role-based access: Admin, Manager, Member. Enforce permissions on the server and with Supabase Row Level Security.
2. Build Dashboard, Daily Log, Expenses, Members, Payments, Reports, and Settings pages.
3. Use Asia/Dhaka timezone and configurable currency defaulting to BDT.
4. On each date, record whether Lunch and Night services were actually served. Fridays default to Lunch only. Exceptions require a reason.
5. Record each member's Lunch and Night attendance separately. Calculate units using these rules:
   - If both services were served: lunch only = 1.5, night only = 1, both = 2, neither = 0.
   - If only one service was served and the person attended it = 1.
   - If no service was served = 0.
6. Record guests separately, linked to a host member, with guest counts for Lunch and Night. Apply the same weighting rules. Never treat guest values above 2 as automatic mistakes.
7. Record each expense as a separate transaction, including date, description, amount, category, payer, allocation method, and optional receipt. Multiple expenses on one date are valid.
8. Support allocation methods Meal pool, Split equally, Charge to a member, and Record only. Only Meal pool expenses affect the meal rate.
9. Record member deposits/payments with date, amount, method, reference, and history.
10. Calculate raw meal rate using high-precision decimal arithmetic: meal-pool expenses divided by total weighted units. Handle zero units safely. Allocate rounding residuals so member meal charges reconcile exactly to the pool total.
11. Calculate each member's balance as payments plus approved credits/reimbursements minus meal cost and other charges. Positive = Receives; negative = Owes; zero = Settled.
12. Implement monthly review and close. Closed months are read-only except for an Admin reopen with a required reason. Keep immutable before/after audit history.
13. Build helpful validation, warnings, save states, and error recovery. Never silently change financial values.
14. Export readable UTF-8-BOM CSV, formatted multi-sheet XLSX, PDF statements, and schema-versioned JSON backups. Use private Supabase Storage for receipts, reports, and backups. PostgreSQL is the source of truth.
15. Provide an Excel import preview that preserves old values and requires manual confirmation for ambiguous member aliases, missing dates, and unexplained historical guest totals.

## Engineering requirements

- Create SQL migrations and typed database models.
- Use Zod validation for all inputs.
- Put final calculation logic in a shared, unit-tested TypeScript module; calculate final saved balances on the server.
- Use Supabase RLS for mess-level data isolation. Never expose a service-role key to the browser.
- Use database numeric/decimal columns for money.
- Add loading, empty, success, and error states to every page.
- Add tests for all meal rules, guest rules, rounding reconciliation, balance signs, month closing, and permissions.
- Make all tables filterable/searchable; include clear labels, keyboard-accessible controls, and responsive mobile layouts.
- Do not use mock data as the final backend. Seed demo data only in a clearly marked development environment.

## Initial UI target

Create a desktop dashboard with a dark navy sidebar; a month selector and save indicator; four KPI cards; a Daily Meal Log table; a Member Overview table; Quick Actions; an expense trend chart; and a Settlement Summary with reconciliation status. Use a clean, calm visual style, readable typography, rounded cards, and consistent spacing. On mobile, stack cards and simplify navigation. Use green/red/amber with textual status labels, never color alone.

Build in small verifiable stages. First produce the database schema and calculation tests, then the core CRUD flows, then reports/import/export. Before declaring completion, verify that all test cases pass and that the sum of allocated member charges reconciles exactly with the meal-pool expense total.
