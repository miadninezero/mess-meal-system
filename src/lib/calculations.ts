import { Attendance, Expense, GuestAttendance, Member, MonthlyReconciliation, Payment, SettlementRow } from '../types/index.ts';

/**
 * Calculates weighted meal units for a single member on a single date
 * based on actual services served.
 */
export function calculateMealUnits(
  lunchServed: boolean,
  nightServed: boolean,
  lunchAttended: boolean,
  nightAttended: boolean
): number {
  // If no service was served, units are 0
  if (!lunchServed && !nightServed) {
    return 0;
  }

  // If both lunch and night were served
  if (lunchServed && nightServed) {
    if (lunchAttended && nightAttended) return 2.0;
    if (lunchAttended && !nightAttended) return 1.5;
    if (!lunchAttended && nightAttended) return 1.0;
    return 0;
  }

  // If only lunch was served (e.g. Friday default or cancelled night meal)
  if (lunchServed && !nightServed) {
    return lunchAttended ? 1.0 : 0;
  }

  // If only night was served (lunch cancelled)
  if (!lunchServed && nightServed) {
    return nightAttended ? 1.0 : 0;
  }

  return 0;
}

/**
 * Calculates guest weighted units based on actual services served.
 * Same weighting principle:
 * - 2-service day: lunch guest = 1.5, night guest = 1.0
 * - 1-service day: attended guest = 1.0
 */
export function calculateGuestUnits(
  lunchServed: boolean,
  nightServed: boolean,
  lunchCount: number,
  nightCount: number
): number {
  const safeLunch = Math.max(0, lunchCount || 0);
  const safeNight = Math.max(0, nightCount || 0);

  if (!lunchServed && !nightServed) return 0;

  if (lunchServed && nightServed) {
    return safeLunch * 1.5 + safeNight * 1.0;
  }

  if (lunchServed && !nightServed) {
    return safeLunch * 1.0;
  }

  if (!lunchServed && nightServed) {
    return safeNight * 1.0;
  }

  return 0;
}

/**
 * Checks whether a given date is a Friday (day of week 5 in local calendar).
 */
export function isFriday(dateStr: string): boolean {
  if (!dateStr) return false;
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.getDay() === 5;
}

/**
 * Inspects Friday meal configuration.
 * Returns review flag if Friday has both services or full attendance without confirmed override.
 */
export function checkFridayReviewNeeded(
  dateStr: string,
  lunchServed: boolean,
  nightServed: boolean,
  isFridayOverride: boolean = false
): { needsReview: boolean; message: string | null } {
  if (!isFriday(dateStr)) {
    return { needsReview: false, message: null };
  }

  // Friday standard is Lunch only
  if (nightServed && !isFridayOverride) {
    return {
      needsReview: true,
      message: 'Friday defaults to lunch-only. Night meal is marked as served—please confirm this exception.',
    };
  }

  return { needsReview: false, message: null };
}

/**
 * Formats a currency number safely to 2 decimal places with BDT ৳ symbol.
 */
export function formatCurrency(amount: number, currency: string = 'BDT'): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const formattedNumber = Math.abs(safeAmount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const symbol = currency === 'BDT' ? '৳' : currency + ' ';
  const sign = safeAmount < -0.005 ? '-' : '';
  return `${sign}${symbol}${formattedNumber}`;
}

/**
 * Formats units to readable string (e.g., 1.5 or 2 or 0).
 */
export function formatUnits(units: number): string {
  if (!Number.isFinite(units)) return '0';
  return Number.isInteger(units) ? units.toString() : units.toFixed(1);
}

/**
 * Calculates the monthly settlement using the Hare-Niemeyer (Largest-Remainder) method.
 * Guarantees that the sum of allocated member meal costs EXACTLY EQUALS total meal-pool expenses.
 */
export function calculateMonthlySettlement(
  members: Member[],
  attendanceList: Attendance[],
  guestList: GuestAttendance[],
  expenses: Expense[],
  payments: Payment[],
  monthKey: string // YYYY-MM
): MonthlyReconciliation {
  // 1. Filter transactions and attendance for this month
  const monthAttendance = attendanceList.filter((a) => a.date.startsWith(monthKey));
  const monthGuests = guestList.filter((g) => g.date.startsWith(monthKey));
  const monthExpenses = expenses.filter((e) => e.date.startsWith(monthKey));
  const monthPayments = payments.filter((p) => p.date.startsWith(monthKey));

  // 2. Identify active members for this period
  const activeMembers = members.filter((m) => m.status === 'active');
  const allTargetMembers = members; // We calculate rows for all members in roster

  // 3. Compute meal-pool expenses (only allocationMethod === 'meal_pool')
  const mealPoolExpenses = monthExpenses
    .filter((e) => e.allocationMethod === 'meal_pool')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  // 4. Compute regular and guest units per member
  const memberUnitsMap: Record<string, { regular: number; guest: number }> = {};
  allTargetMembers.forEach((m) => {
    memberUnitsMap[m.id] = { regular: 0, guest: 0 };
  });

  monthAttendance.forEach((att) => {
    if (memberUnitsMap[att.memberId]) {
      memberUnitsMap[att.memberId].regular += Number(att.calculatedUnits) || 0;
    }
  });

  monthGuests.forEach((guest) => {
    if (memberUnitsMap[guest.hostMemberId]) {
      memberUnitsMap[guest.hostMemberId].guest += Number(guest.calculatedUnits) || 0;
    }
  });

  const totalWeightedUnits = Object.values(memberUnitsMap).reduce(
    (sum, u) => sum + u.regular + u.guest,
    0
  );

  // 5. Raw meal rate
  const rawMealRate = totalWeightedUnits > 0 ? mealPoolExpenses / totalWeightedUnits : 0;
  const roundedDisplayRate = Math.round(rawMealRate * 100) / 100;

  // 6. Largest-Remainder (Hare-Niemeyer) Rounding Method
  // This completely eliminates penny/poisha rounding drift!
  const totalPoolCents = Math.round(mealPoolExpenses * 100);

  interface MemberAllocDraft {
    memberId: string;
    totalUnits: number;
    exactShare: number;
    exactCents: number;
    baseCents: number;
    remainder: number;
    allocatedCents: number;
  }

  const drafts: MemberAllocDraft[] = allTargetMembers.map((m) => {
    const u = memberUnitsMap[m.id] || { regular: 0, guest: 0 };
    const totUnits = u.regular + u.guest;
    const exactShare = totUnits * rawMealRate;
    const exactCents = exactShare * 100;
    const baseCents = Math.floor(exactCents);
    const remainder = exactCents - baseCents;

    return {
      memberId: m.id,
      totalUnits: totUnits,
      exactShare,
      exactCents,
      baseCents,
      remainder,
      allocatedCents: baseCents,
    };
  });

  const sumBaseCents = drafts.reduce((sum, d) => sum + d.baseCents, 0);
  let centsToDistribute = totalPoolCents - sumBaseCents;

  // Sort descending by remainder
  const sortedIndices = drafts
    .map((d, index) => ({ index, remainder: d.remainder }))
    .sort((a, b) => b.remainder - a.remainder);

  for (let i = 0; i < sortedIndices.length && centsToDistribute > 0; i++) {
    drafts[sortedIndices[i].index].allocatedCents += 1;
    centsToDistribute--;
  }

  const allocatedCostMap: Record<string, { exactShare: number; allocatedCost: number }> = {};
  drafts.forEach((d) => {
    allocatedCostMap[d.memberId] = {
      exactShare: d.exactShare,
      allocatedCost: d.allocatedCents / 100,
    };
  });

  // 7. Calculate shared expenses ('split_equally')
  const sharedExpensesTotal = monthExpenses
    .filter((e) => e.allocationMethod === 'split_equally')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const sharedPerMember =
    activeMembers.length > 0 ? Math.round((sharedExpensesTotal / activeMembers.length) * 100) / 100 : 0;

  // 8. Calculate individual charges ('member_charge')
  const individualChargesMap: Record<string, number> = {};
  allTargetMembers.forEach((m) => (individualChargesMap[m.id] = 0));

  monthExpenses
    .filter((e) => e.allocationMethod === 'member_charge' && e.targetMemberId)
    .forEach((e) => {
      if (e.targetMemberId && individualChargesMap[e.targetMemberId] !== undefined) {
        individualChargesMap[e.targetMemberId] += Number(e.amount) || 0;
      }
    });

  // 9. Calculate personal out-of-pocket reimbursements
  // (Expenses where isPersonalFund === true credited back to paidByMemberId)
  const personalReimbursementsMap: Record<string, number> = {};
  allTargetMembers.forEach((m) => (personalReimbursementsMap[m.id] = 0));

  monthExpenses
    .filter((e) => e.isPersonalFund && e.paidByMemberId)
    .forEach((e) => {
      if (e.paidByMemberId && personalReimbursementsMap[e.paidByMemberId] !== undefined) {
        personalReimbursementsMap[e.paidByMemberId] += Number(e.amount) || 0;
      }
    });

  // 10. Calculate payments / deposits (accounting for reversals)
  const paymentsMap: Record<string, number> = {};
  allTargetMembers.forEach((m) => (paymentsMap[m.id] = 0));

  monthPayments.forEach((p) => {
    if (paymentsMap[p.memberId] !== undefined) {
      // If payment is a reversal entry, it subtracts
      const sign = p.reversalOfId ? -1 : 1;
      paymentsMap[p.memberId] += sign * (Number(p.amount) || 0);
    }
  });

  // 11. Build final settlement rows
  const rows: SettlementRow[] = allTargetMembers.map((m) => {
    const units = memberUnitsMap[m.id] || { regular: 0, guest: 0 };
    const totUnits = units.regular + units.guest;
    const alloc = allocatedCostMap[m.id] || { exactShare: 0, allocatedCost: 0 };
    const shared = m.status === 'active' ? sharedPerMember : 0;
    const individual = individualChargesMap[m.id] || 0;
    const totalDebits = Math.round((alloc.allocatedCost + shared + individual) * 100) / 100;

    const paymentsPaid = Math.round((paymentsMap[m.id] || 0) * 100) / 100;
    const personalReimbursements = Math.round((personalReimbursementsMap[m.id] || 0) * 100) / 100;
    const totalCredits = Math.round((paymentsPaid + personalReimbursements) * 100) / 100;

    const netBalance = Math.round((totalCredits - totalDebits) * 100) / 100;

    let status: 'receives' | 'owes' | 'settled' = 'settled';
    if (netBalance > 0.005) status = 'receives';
    else if (netBalance < -0.005) status = 'owes';

    return {
      memberId: m.id,
      memberName: m.name,
      regularUnits: units.regular,
      guestUnits: units.guest,
      totalUnits: totUnits,
      exactShare: alloc.exactShare,
      allocatedMealCost: alloc.allocatedCost,
      sharedCharges: shared,
      individualCharges: individual,
      totalDebits,
      totalPayments: paymentsPaid,
      personalReimbursements,
      totalCredits,
      netBalance,
      status,
    };
  });

  const sumAllocatedMealCost = Math.round(
    rows.reduce((sum, r) => sum + r.allocatedMealCost, 0) * 100
  ) / 100;

  const reconciliationDifference = Math.round((sumAllocatedMealCost - mealPoolExpenses) * 100) / 100;
  const isReconciled = Math.abs(reconciliationDifference) < 0.001;

  const totalSharedExpenses = monthExpenses
    .filter((e) => e.allocationMethod === 'split_equally')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const totalIndividualExpenses = monthExpenses
    .filter((e) => e.allocationMethod === 'member_charge')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const totalPersonalReimbursements = Object.values(personalReimbursementsMap).reduce(
    (sum, v) => sum + v,
    0
  );

  const totalDeposits = Object.values(paymentsMap).reduce((sum, v) => sum + v, 0);

  // Net cash in mess treasury = total deposits collected - expenses paid from mess common cash
  const messCashExpenses = monthExpenses
    .filter((e) => !e.isPersonalFund && e.allocationMethod !== 'record_only')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const netMessCashBalance = Math.round((totalDeposits - messCashExpenses) * 100) / 100;

  return {
    monthKey,
    totalMealPoolExpenses: Math.round(mealPoolExpenses * 100) / 100,
    totalWeightedUnits: Math.round(totalWeightedUnits * 100) / 100,
    rawMealRate,
    roundedDisplayRate,
    sumAllocatedMealCost,
    reconciliationDifference,
    totalSharedExpenses: Math.round(sharedExpensesTotal * 100) / 100,
    totalIndividualExpenses: Math.round(totalIndividualExpenses * 100) / 100,
    totalPersonalReimbursements: Math.round(totalPersonalReimbursements * 100) / 100,
    totalDeposits: Math.round(totalDeposits * 100) / 100,
    netMessCashBalance,
    isReconciled,
    rows,
  };
}
