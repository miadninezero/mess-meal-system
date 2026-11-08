export type Role = 'admin' | 'manager' | 'member';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: Role;
  memberId?: string;
  photoURL?: string;
  isGoogleAuth?: boolean;
}

export interface Member {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: Role;
  status: 'active' | 'inactive';
  activeFrom: string;
  inactiveFrom?: string;
  createdAt: string;
}

export interface ServiceDay {
  date: string; // YYYY-MM-DD
  lunchServed: boolean;
  nightServed: boolean;
  exceptionReason?: string;
  isFridayOverride?: boolean;
  needsReview?: boolean;
  reviewNote?: string;
  updatedAt?: string;
}

export interface Attendance {
  id: string;
  date: string; // YYYY-MM-DD
  memberId: string;
  lunchAttended: boolean;
  nightAttended: boolean;
  calculatedUnits: number;
  updatedAt?: string;
}

export interface GuestAttendance {
  id: string;
  date: string; // YYYY-MM-DD
  hostMemberId: string;
  guestName?: string;
  lunchCount: number;
  nightCount: number;
  calculatedUnits: number;
  note?: string;
  createdAt: string;
}

export type AllocationMethod = 'meal_pool' | 'split_equally' | 'member_charge' | 'record_only';

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  amount: number;
  category: string;
  allocationMethod: AllocationMethod;
  paidByMemberId?: string; // If personal or designated member
  isPersonalFund: boolean; // TRUE: member paid from personal pocket (gets reimbursement credit); FALSE: paid from mess common cash (no credit)
  targetMemberId?: string; // If allocationMethod is 'member_charge'
  receiptPath?: string;
  note?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  date: string; // YYYY-MM-DD
  memberId: string;
  amount: number;
  method: 'cash' | 'bkash' | 'nagad' | 'bank' | 'other';
  reference?: string;
  reversalOfId?: string; // If this is a reversal/correction
  note?: string;
  createdAt: string;
}

export interface SettlementRow {
  memberId: string;
  memberName: string;
  regularUnits: number;
  guestUnits: number;
  totalUnits: number;
  exactShare: number; // Raw mathematical share before rounding
  allocatedMealCost: number; // Reconciled via Largest-Remainder to exact 2 decimals
  sharedCharges: number; // Split equally expenses
  individualCharges: number; // Charged directly to this member
  totalDebits: number; // allocatedMealCost + sharedCharges + individualCharges
  totalPayments: number; // Deposits made by this member
  personalReimbursements: number; // Personal out-of-pocket expenses paid by this member
  totalCredits: number; // totalPayments + personalReimbursements
  netBalance: number; // totalCredits - totalDebits. > 0: Receives; < 0: Owes; 0: Settled
  status: 'receives' | 'owes' | 'settled';
}

export interface MonthlyReconciliation {
  monthKey: string; // YYYY-MM
  totalMealPoolExpenses: number;
  totalWeightedUnits: number;
  rawMealRate: number; // totalMealPoolExpenses / totalWeightedUnits
  roundedDisplayRate: number;
  sumAllocatedMealCost: number; // Must equal totalMealPoolExpenses exactly
  reconciliationDifference: number; // Must be 0.00
  totalSharedExpenses: number;
  totalIndividualExpenses: number;
  totalPersonalReimbursements: number;
  totalDeposits: number;
  netMessCashBalance: number;
  isReconciled: boolean;
  rows: SettlementRow[];
}
