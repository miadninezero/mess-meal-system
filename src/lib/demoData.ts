import { Attendance, Expense, GuestAttendance, Member, Payment, ServiceDay } from '../types/index.ts';

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'mem_1',
    name: 'Tanvir Ahmed',
    email: 'tanvir@dhakamess.com',
    phone: '+880 1711-223344',
    role: 'manager',
    status: 'active',
    activeFrom: '2026-01-01',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'mem_2',
    name: 'Rafiqul Islam',
    email: 'rafiq@dhakamess.com',
    phone: '+880 1812-334455',
    role: 'member',
    status: 'active',
    activeFrom: '2026-01-01',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'mem_3',
    name: 'Shakil Hasan',
    email: 'shakil@dhakamess.com',
    phone: '+880 1913-445566',
    role: 'member',
    status: 'active',
    activeFrom: '2026-01-01',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'mem_4',
    name: 'Naimur Rahman',
    email: 'naimur@dhakamess.com',
    phone: '+880 1614-556677',
    role: 'member',
    status: 'active',
    activeFrom: '2026-01-01',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'mem_5',
    name: 'Mehedi Hasan',
    email: 'mehedi@dhakamess.com',
    phone: '+880 1515-667788',
    role: 'member',
    status: 'active',
    activeFrom: '2026-01-01',
    createdAt: '2026-01-01T00:00:00Z',
  },
];

// Helper to generate seed service days for Nov 1 to Nov 7, 2026
export function getInitialServiceDays(): ServiceDay[] {
  return [
    {
      date: '2026-11-01', // Sunday: normal 2 services
      lunchServed: true,
      nightServed: true,
      updatedAt: '2026-11-01T21:00:00Z',
    },
    {
      date: '2026-11-02', // Monday: normal 2 services
      lunchServed: true,
      nightServed: true,
      updatedAt: '2026-11-02T21:00:00Z',
    },
    {
      date: '2026-11-03', // Tuesday: gas cylinder empty at night -> lunch only with exception
      lunchServed: true,
      nightServed: false,
      exceptionReason: 'Gas supply disrupted; night meal was cancelled.',
      updatedAt: '2026-11-03T21:00:00Z',
    },
    {
      date: '2026-11-04', // Wednesday: normal 2 services
      lunchServed: true,
      nightServed: true,
      updatedAt: '2026-11-04T21:00:00Z',
    },
    {
      date: '2026-11-05', // Thursday: normal 2 services
      lunchServed: true,
      nightServed: true,
      updatedAt: '2026-11-05T21:00:00Z',
    },
    {
      date: '2026-11-06', // Friday: standard Friday lunch only (1 unit)
      lunchServed: true,
      nightServed: false,
      isFridayOverride: false,
      needsReview: false,
      updatedAt: '2026-11-06T15:00:00Z',
    },
    {
      date: '2026-11-07', // Saturday (Today): normal 2 services
      lunchServed: true,
      nightServed: true,
      updatedAt: '2026-11-07T12:00:00Z',
    },
  ];
}

export function getInitialAttendance(): Attendance[] {
  return [
    // 2026-11-01: Both served
    { id: 'att_1_1', date: '2026-11-01', memberId: 'mem_1', lunchAttended: true, nightAttended: true, calculatedUnits: 2.0 },
    { id: 'att_1_2', date: '2026-11-01', memberId: 'mem_2', lunchAttended: true, nightAttended: true, calculatedUnits: 2.0 },
    { id: 'att_1_3', date: '2026-11-01', memberId: 'mem_3', lunchAttended: false, nightAttended: true, calculatedUnits: 1.0 }, // night only
    { id: 'att_1_4', date: '2026-11-01', memberId: 'mem_4', lunchAttended: true, nightAttended: false, calculatedUnits: 1.5 }, // lunch only
    { id: 'att_1_5', date: '2026-11-01', memberId: 'mem_5', lunchAttended: true, nightAttended: true, calculatedUnits: 2.0 },

    // 2026-11-02: Both served
    { id: 'att_2_1', date: '2026-11-02', memberId: 'mem_1', lunchAttended: true, nightAttended: true, calculatedUnits: 2.0 },
    { id: 'att_2_2', date: '2026-11-02', memberId: 'mem_2', lunchAttended: true, nightAttended: false, calculatedUnits: 1.5 },
    { id: 'att_2_3', date: '2026-11-02', memberId: 'mem_3', lunchAttended: true, nightAttended: true, calculatedUnits: 2.0 },
    { id: 'att_2_4', date: '2026-11-02', memberId: 'mem_4', lunchAttended: true, nightAttended: true, calculatedUnits: 2.0 },
    { id: 'att_2_5', date: '2026-11-02', memberId: 'mem_5', lunchAttended: false, nightAttended: true, calculatedUnits: 1.0 },

    // 2026-11-03: Lunch only (night cancelled). Lunch attendance gives 1.0 unit
    { id: 'att_3_1', date: '2026-11-03', memberId: 'mem_1', lunchAttended: true, nightAttended: false, calculatedUnits: 1.0 },
    { id: 'att_3_2', date: '2026-11-03', memberId: 'mem_2', lunchAttended: true, nightAttended: false, calculatedUnits: 1.0 },
    { id: 'att_3_3', date: '2026-11-03', memberId: 'mem_3', lunchAttended: true, nightAttended: false, calculatedUnits: 1.0 },
    { id: 'att_3_4', date: '2026-11-03', memberId: 'mem_4', lunchAttended: false, nightAttended: false, calculatedUnits: 0.0 },
    { id: 'att_3_5', date: '2026-11-03', memberId: 'mem_5', lunchAttended: true, nightAttended: false, calculatedUnits: 1.0 },

    // 2026-11-04: Both served
    { id: 'att_4_1', date: '2026-11-04', memberId: 'mem_1', lunchAttended: true, nightAttended: true, calculatedUnits: 2.0 },
    { id: 'att_4_2', date: '2026-11-04', memberId: 'mem_2', lunchAttended: true, nightAttended: true, calculatedUnits: 2.0 },
    { id: 'att_4_3', date: '2026-11-04', memberId: 'mem_3', lunchAttended: true, nightAttended: true, calculatedUnits: 2.0 },
    { id: 'att_4_4', date: '2026-11-04', memberId: 'mem_4', lunchAttended: true, nightAttended: true, calculatedUnits: 2.0 },
    { id: 'att_4_5', date: '2026-11-04', memberId: 'mem_5', lunchAttended: true, nightAttended: true, calculatedUnits: 2.0 },

    // 2026-11-05: Both served
    { id: 'att_5_1', date: '2026-11-05', memberId: 'mem_1', lunchAttended: true, nightAttended: true, calculatedUnits: 2.0 },
    { id: 'att_5_2', date: '2026-11-05', memberId: 'mem_2', lunchAttended: false, nightAttended: true, calculatedUnits: 1.0 },
    { id: 'att_5_3', date: '2026-11-05', memberId: 'mem_3', lunchAttended: true, nightAttended: true, calculatedUnits: 2.0 },
    { id: 'att_5_4', date: '2026-11-05', memberId: 'mem_4', lunchAttended: true, nightAttended: false, calculatedUnits: 1.5 },
    { id: 'att_5_5', date: '2026-11-05', memberId: 'mem_5', lunchAttended: true, nightAttended: true, calculatedUnits: 2.0 },

    // 2026-11-06: Friday lunch-only (1 unit each)
    { id: 'att_6_1', date: '2026-11-06', memberId: 'mem_1', lunchAttended: true, nightAttended: false, calculatedUnits: 1.0 },
    { id: 'att_6_2', date: '2026-11-06', memberId: 'mem_2', lunchAttended: true, nightAttended: false, calculatedUnits: 1.0 },
    { id: 'att_6_3', date: '2026-11-06', memberId: 'mem_3', lunchAttended: true, nightAttended: false, calculatedUnits: 1.0 },
    { id: 'att_6_4', date: '2026-11-06', memberId: 'mem_4', lunchAttended: true, nightAttended: false, calculatedUnits: 1.0 },
    { id: 'att_6_5', date: '2026-11-06', memberId: 'mem_5', lunchAttended: true, nightAttended: false, calculatedUnits: 1.0 },

    // 2026-11-07: Today (Both served)
    { id: 'att_7_1', date: '2026-11-07', memberId: 'mem_1', lunchAttended: true, nightAttended: true, calculatedUnits: 2.0 },
    { id: 'att_7_2', date: '2026-11-07', memberId: 'mem_2', lunchAttended: true, nightAttended: true, calculatedUnits: 2.0 },
    { id: 'att_7_3', date: '2026-11-07', memberId: 'mem_3', lunchAttended: true, nightAttended: true, calculatedUnits: 2.0 },
    { id: 'att_7_4', date: '2026-11-07', memberId: 'mem_4', lunchAttended: true, nightAttended: true, calculatedUnits: 2.0 },
    { id: 'att_7_5', date: '2026-11-07', memberId: 'mem_5', lunchAttended: true, nightAttended: false, calculatedUnits: 1.5 },
  ];
}

export function getInitialGuestAttendance(): GuestAttendance[] {
  return [
    {
      id: 'gst_1',
      date: '2026-11-01',
      hostMemberId: 'mem_3', // Shakil's cousins for lunch on 2-service day
      guestName: 'Shakils Cousin (2 persons)',
      lunchCount: 2,
      nightCount: 0,
      calculatedUnits: 3.0, // 2 * 1.5 = 3.0
      note: 'Family guests from Bogura',
      createdAt: '2026-11-01T13:30:00Z',
    },
    {
      id: 'gst_2',
      date: '2026-11-04',
      hostMemberId: 'mem_1', // Tanvir's friend for night meal on 2-service day
      guestName: 'Arif (Tanvirs friend)',
      lunchCount: 0,
      nightCount: 1,
      calculatedUnits: 1.0, // 1 * 1.0 = 1.0
      note: 'Dinner guest',
      createdAt: '2026-11-04T20:30:00Z',
    },
    {
      id: 'gst_3',
      date: '2026-11-06',
      hostMemberId: 'mem_4', // Naimur's guest on Friday lunch-only day
      guestName: 'Zubair',
      lunchCount: 1,
      nightCount: 0,
      calculatedUnits: 1.0, // Friday lunch only: 1 * 1.0 = 1.0
      note: 'Friday lunch guest',
      createdAt: '2026-11-06T14:00:00Z',
    },
  ];
}

export function getInitialExpenses(): Expense[] {
  return [
    {
      id: 'exp_1',
      date: '2026-11-01',
      description: 'Fish, chicken, and fresh vegetables (Karwan Bazar)',
      amount: 4250,
      category: 'Market / Bazaar',
      allocationMethod: 'meal_pool',
      paidByMemberId: 'mem_1',
      isPersonalFund: true, // Tanvir paid out-of-pocket -> gets reimbursement credit
      note: 'Paid by Tanvir personal bKash',
      createdAt: '2026-11-01T10:00:00Z',
    },
    {
      id: 'exp_2',
      date: '2026-11-02',
      description: 'Cooking oil (5L) and Miniket rice bag (25kg)',
      amount: 3800,
      category: 'Groceries',
      allocationMethod: 'meal_pool',
      isPersonalFund: false, // Paid from mess common cash -> NO personal credit
      note: 'Paid from mess manager common cash fund',
      createdAt: '2026-11-02T16:00:00Z',
    },
    {
      id: 'exp_3',
      date: '2026-11-03',
      description: 'LPG Gas Cylinder refill (12kg)',
      amount: 1450,
      category: 'Utilities / Shared',
      allocationMethod: 'split_equally', // Split equally among 5 active members (৳290 each)
      paidByMemberId: 'mem_3',
      isPersonalFund: true, // Shakil paid out-of-pocket -> gets reimbursement credit
      note: 'Emergency gas refill paid by Shakil',
      createdAt: '2026-11-03T18:00:00Z',
    },
    {
      id: 'exp_4',
      date: '2026-11-04',
      description: 'Beef (3kg) and spices for special dinner',
      amount: 2850,
      category: 'Market / Bazaar',
      allocationMethod: 'meal_pool',
      isPersonalFund: false, // Paid from mess common cash
      note: 'Mid-week beef dinner',
      createdAt: '2026-11-04T11:00:00Z',
    },
    {
      id: 'exp_5',
      date: '2026-11-05',
      description: 'Eggs (3 crates) and breakfast essentials',
      amount: 1350,
      category: 'Groceries',
      allocationMethod: 'meal_pool',
      paidByMemberId: 'mem_4',
      isPersonalFund: true, // Naimur paid personal -> gets reimbursement credit
      note: 'Local grocery store',
      createdAt: '2026-11-05T09:30:00Z',
    },
    {
      id: 'exp_6',
      date: '2026-11-06',
      description: 'Polao rice, mutton and salad for Friday feast',
      amount: 3600,
      category: 'Market / Bazaar',
      allocationMethod: 'meal_pool',
      isPersonalFund: false, // Paid from mess common cash
      note: 'Special Friday lunch feast',
      createdAt: '2026-11-06T10:30:00Z',
    },
    {
      id: 'exp_7',
      date: '2026-11-07',
      description: 'Individual room lock replacement for Mehedi',
      amount: 450,
      category: 'Maintenance',
      allocationMethod: 'member_charge',
      targetMemberId: 'mem_5', // Charged strictly to Mehedi
      isPersonalFund: false, // Paid from mess common cash
      note: 'Lock replaced on Mehedis request',
      createdAt: '2026-11-07T11:00:00Z',
    },
  ];
}

export function getInitialPayments(): Payment[] {
  return [
    {
      id: 'pay_1',
      date: '2026-11-01',
      memberId: 'mem_1',
      amount: 6000,
      method: 'bkash',
      reference: 'TXN88921B',
      note: 'November advance deposit',
      createdAt: '2026-11-01T09:00:00Z',
    },
    {
      id: 'pay_2',
      date: '2026-11-01',
      memberId: 'mem_2',
      amount: 6000,
      method: 'bank',
      reference: 'IBBL-9921',
      note: 'November advance deposit',
      createdAt: '2026-11-01T10:30:00Z',
    },
    {
      id: 'pay_3',
      date: '2026-11-01',
      memberId: 'mem_3',
      amount: 5000,
      method: 'cash',
      reference: 'CASH-001',
      note: 'Paid to manager in cash',
      createdAt: '2026-11-01T14:00:00Z',
    },
    {
      id: 'pay_4',
      date: '2026-11-02',
      memberId: 'mem_4',
      amount: 6000,
      method: 'bkash',
      reference: 'TXN11234A',
      note: 'November deposit',
      createdAt: '2026-11-02T11:00:00Z',
    },
    {
      id: 'pay_5',
      date: '2026-11-02',
      memberId: 'mem_5',
      amount: 5500,
      method: 'nagad',
      reference: 'NGD-7788',
      note: 'Advance payment',
      createdAt: '2026-11-02T12:00:00Z',
    },
  ];
}
