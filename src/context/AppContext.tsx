import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  Attendance,
  Expense,
  GuestAttendance,
  Member,
  MonthlyReconciliation,
  Payment,
  Role,
  ServiceDay,
  UserProfile,
} from '../types/index.ts';
import {
  calculateGuestUnits,
  calculateMealUnits,
  calculateMonthlySettlement,
  checkFridayReviewNeeded,
} from '../lib/calculations.ts';
import {
  INITIAL_MEMBERS,
  getInitialAttendance,
  getInitialExpenses,
  getInitialGuestAttendance,
  getInitialPayments,
  getInitialServiceDays,
} from '../lib/demoData.ts';
import { auth, db, googleAuthProvider, handleFirestoreError, OperationType, testFirestoreConnection } from '../lib/firebase.ts';
import { doc, setDoc, getDocs, collection } from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';

interface AppContextType {
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  switchPersona: (role: Role, memberId?: string) => void;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  members: Member[];
  serviceDays: ServiceDay[];
  attendance: Attendance[];
  guestAttendance: GuestAttendance[];
  expenses: Expense[];
  payments: Payment[];
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  saveStatus: 'saved' | 'saving' | 'error';
  saveDailyLog: (
    date: string,
    lunchServed: boolean,
    nightServed: boolean,
    exceptionReason: string,
    isFridayOverride: boolean,
    memberAttendance: { memberId: string; lunchAttended: boolean; nightAttended: boolean }[],
    guests: { hostMemberId: string; guestName?: string; lunchCount: number; nightCount: number; note?: string }[]
  ) => Promise<void>;
  confirmFridayReview: (date: string) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addPayment: (payment: Omit<Payment, 'id' | 'createdAt'>) => Promise<void>;
  updatePayment: (paymentId: string, updates: Partial<Payment>) => Promise<void>;
  deletePayment: (paymentId: string) => Promise<void>;
  reversePayment: (paymentId: string, reason?: string) => Promise<void>;
  addMember: (member: Omit<Member, 'id' | 'createdAt'>) => Promise<void>;
  updateMemberStatus: (memberId: string, status: 'active' | 'inactive') => Promise<void>;
  resetToDemoData: () => void;
  reconciliation: MonthlyReconciliation;
  depositTargetMemberId: string | null;
  setDepositTargetMemberId: (id: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_PREFIX = 'mess_manager_v1_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current user / role
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    return {
      uid: 'user_tanvir_admin',
      email: 'tanvir@dhakamess.com',
      displayName: 'Tanvir Ahmed',
      role: 'manager',
      memberId: 'mem_1',
    };
  });

  const [selectedMonth, setSelectedMonth] = useState<string>('2026-11');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [depositTargetMemberId, setDepositTargetMemberIdState] = useState<string | null>(null);

  const setDepositTargetMemberId = (id: string | null) => {
    if (id && currentUser.role !== 'manager' && currentUser.role !== 'admin') {
      console.warn('Access denied: Only managers can access deposit options.');
      return;
    }
    setDepositTargetMemberIdState(id);
  };

  // Load state from localStorage or initialize with demo data
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}members`);
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [serviceDays, setServiceDays] = useState<ServiceDay[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}service_days`);
    return saved ? JSON.parse(saved) : getInitialServiceDays();
  });

  const [attendance, setAttendance] = useState<Attendance[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}attendance`);
    return saved ? JSON.parse(saved) : getInitialAttendance();
  });

  const [guestAttendance, setGuestAttendance] = useState<GuestAttendance[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}guest_attendance`);
    return saved ? JSON.parse(saved) : getInitialGuestAttendance();
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}expenses`);
    return saved ? JSON.parse(saved) : getInitialExpenses();
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}payments`);
    return saved ? JSON.parse(saved) : getInitialPayments();
  });

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}members`, JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}service_days`, JSON.stringify(serviceDays));
  }, [serviceDays]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}attendance`, JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}guest_attendance`, JSON.stringify(guestAttendance));
  }, [guestAttendance]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}expenses`, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}payments`, JSON.stringify(payments));
  }, [payments]);

  // Initial connection check & auth listener
  useEffect(() => {
    testFirestoreConnection().catch((err) => console.log('Offline/Local mode active', err));

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const matched = members.find((m) => m.email?.toLowerCase() === user.email?.toLowerCase());
        setCurrentUser({
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || user.email?.split('@')[0] || 'User',
          role: matched?.role || 'manager',
          memberId: matched?.id || 'mem_1',
          photoURL: user.photoURL || undefined,
          isGoogleAuth: true,
        });

        // Pull any existing documents from Firestore if present
        (async () => {
          try {
            const expSnap = await getDocs(collection(db, 'expenses'));
            if (!expSnap.empty) {
              const cloudExpenses = expSnap.docs.map((d) => d.data() as Expense);
              setExpenses((prev) => {
                const map = new Map<string, Expense>();
                [...cloudExpenses, ...prev].forEach((e) => map.set(e.id, e));
                return Array.from(map.values());
              });
            }
          } catch (e) {
            console.log('Deferred cloud load:', e);
          }
        })();
      }
    });

    return () => unsubscribe();
  }, [members]);

  // Google Login
  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (err) {
      console.warn('Google sign-in popup closed or cancelled:', err);
    }
  };

  // Google Sign-out
  const signOutUser = async () => {
    try {
      await signOut(auth);
      switchPersona('manager');
    } catch (err) {
      console.warn('Sign out error:', err);
    }
  };

  // Persona switcher for easy role testing
  const switchPersona = (role: Role, memberId?: string) => {
    if (role === 'admin' || role === 'manager') {
      const managerMember = members.find((m) => m.role === 'manager') || members[0];
      setCurrentUser({
        uid: 'user_tanvir_admin',
        email: managerMember?.email || 'manager@dhakamess.com',
        displayName: managerMember?.name || 'Tanvir Ahmed (Manager)',
        role,
        memberId: managerMember?.id,
        isGoogleAuth: false,
      });
    } else {
      const targetId = memberId || 'mem_3';
      const member = members.find((m) => m.id === targetId) || members[1];
      setCurrentUser({
        uid: `user_${member?.id || 'member'}`,
        email: member?.email || 'member@dhakamess.com',
        displayName: member?.name || 'Mess Member',
        role: 'member',
        memberId: member?.id,
        isGoogleAuth: false,
      });
    }
  };

  // Reconciled monthly settlement computed dynamically
  const reconciliation = useMemo(() => {
    return calculateMonthlySettlement(members, attendance, guestAttendance, expenses, payments, selectedMonth);
  }, [members, attendance, guestAttendance, expenses, payments, selectedMonth]);

  // Save daily service status, member attendance, and guests
  const saveDailyLog = async (
    date: string,
    lunchServed: boolean,
    nightServed: boolean,
    exceptionReason: string,
    isFridayOverride: boolean,
    memberAttendance: { memberId: string; lunchAttended: boolean; nightAttended: boolean }[],
    guests: { hostMemberId: string; guestName?: string; lunchCount: number; nightCount: number; note?: string }[]
  ) => {
    setSaveStatus('saving');
    try {
      const fridayCheck = checkFridayReviewNeeded(date, lunchServed, nightServed, isFridayOverride);

      const newServiceDay: ServiceDay = {
        date,
        lunchServed,
        nightServed,
        exceptionReason: exceptionReason.trim() || undefined,
        isFridayOverride,
        needsReview: fridayCheck.needsReview,
        reviewNote: fridayCheck.message || undefined,
        updatedAt: new Date().toISOString(),
      };

      // Calculate units for each member
      const newAttendanceList: Attendance[] = memberAttendance.map((m) => {
        const units = calculateMealUnits(lunchServed, nightServed, m.lunchAttended, m.nightAttended);
        return {
          id: `att_${date}_${m.memberId}`,
          date,
          memberId: m.memberId,
          lunchAttended: m.lunchAttended,
          nightAttended: m.nightAttended,
          calculatedUnits: units,
          updatedAt: new Date().toISOString(),
        };
      });

      // Calculate units for guests
      const newGuestList: GuestAttendance[] = guests.map((g, idx) => {
        const units = calculateGuestUnits(lunchServed, nightServed, g.lunchCount, g.nightCount);
        return {
          id: `gst_${date}_${g.hostMemberId}_${idx}`,
          date,
          hostMemberId: g.hostMemberId,
          guestName: g.guestName?.trim() || undefined,
          lunchCount: g.lunchCount,
          nightCount: g.nightCount,
          calculatedUnits: units,
          note: g.note?.trim() || undefined,
          createdAt: new Date().toISOString(),
        };
      });

      // Update state locally
      setServiceDays((prev) => {
        const filtered = prev.filter((s) => s.date !== date);
        return [...filtered, newServiceDay];
      });

      setAttendance((prev) => {
        const filtered = prev.filter((a) => a.date !== date);
        return [...filtered, ...newAttendanceList];
      });

      setGuestAttendance((prev) => {
        const filtered = prev.filter((g) => g.date !== date);
        return [...filtered, ...newGuestList];
      });

      // Attempt async cloud sync to Firestore
      try {
        if (auth.currentUser) {
          await setDoc(doc(db, 'service_days', date), newServiceDay);
          for (const att of newAttendanceList) {
            await setDoc(doc(db, 'attendance', att.id), att);
          }
        }
      } catch (e) {
        console.warn('Local save successful; Firestore sync deferred:', e);
      }

      setSaveStatus('saved');
    } catch (error) {
      console.error('Error saving daily log:', error);
      setSaveStatus('error');
    }
  };

  // Confirm review on a flagged Friday
  const confirmFridayReview = async (date: string) => {
    setSaveStatus('saving');
    setServiceDays((prev) =>
      prev.map((s) =>
        s.date === date
          ? {
              ...s,
              needsReview: false,
              isFridayOverride: true,
              reviewNote: 'Confirmed by manager',
              updatedAt: new Date().toISOString(),
            }
          : s
      )
    );
    setSaveStatus('saved');
  };

  // Add expense
  const addExpense = async (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    setSaveStatus('saving');
    const newExpense: Expense = {
      ...expenseData,
      id: `exp_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setExpenses((prev) => [newExpense, ...prev]);

    try {
      if (auth.currentUser) {
        await setDoc(doc(db, 'expenses', newExpense.id), newExpense);
      }
    } catch (e) {
      console.warn('Saved locally; Cloud sync deferred:', e);
    }

    setSaveStatus('saved');
  };

  // Delete expense
  const deleteExpense = async (id: string) => {
    setSaveStatus('saving');
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    setSaveStatus('saved');
  };

  // Add payment deposit (Manager only)
  const addPayment = async (paymentData: Omit<Payment, 'id' | 'createdAt'>) => {
    if (currentUser.role !== 'manager' && currentUser.role !== 'admin') {
      console.warn('Access denied: Only managers can add deposits.');
      return;
    }
    setSaveStatus('saving');
    const newPayment: Payment = {
      ...paymentData,
      id: `pay_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setPayments((prev) => [newPayment, ...prev]);

    try {
      if (auth.currentUser) {
        await setDoc(doc(db, 'payments', newPayment.id), newPayment);
      }
    } catch (e) {
      console.warn('Saved locally; Cloud sync deferred:', e);
    }

    setSaveStatus('saved');
  };

  // Update or reassign a payment (Manager only)
  const updatePayment = async (paymentId: string, updates: Partial<Payment>) => {
    if (currentUser.role !== 'manager' && currentUser.role !== 'admin') {
      console.warn('Access denied: Only managers can update deposits.');
      return;
    }
    setSaveStatus('saving');
    setPayments((prev) =>
      prev.map((p) => (p.id === paymentId ? { ...p, ...updates } : p))
    );

    try {
      if (auth.currentUser) {
        await setDoc(doc(db, 'payments', paymentId), updates, { merge: true });
      }
    } catch (e) {
      console.warn('Saved locally; Cloud sync deferred:', e);
    }

    setSaveStatus('saved');
  };

  // Delete a payment entry (Manager only)
  const deletePayment = async (paymentId: string) => {
    if (currentUser.role !== 'manager' && currentUser.role !== 'admin') {
      console.warn('Access denied: Only managers can delete deposits.');
      return;
    }
    setSaveStatus('saving');
    setPayments((prev) => prev.filter((p) => p.id !== paymentId));
    setSaveStatus('saved');
  };

  // Reverse a payment (Manager only)
  const reversePayment = async (paymentId: string, reason?: string) => {
    if (currentUser.role !== 'manager' && currentUser.role !== 'admin') {
      console.warn('Access denied: Only managers can reverse deposits.');
      return;
    }
    setSaveStatus('saving');
    const original = payments.find((p) => p.id === paymentId);
    if (!original) return;

    const reversal: Payment = {
      id: `rev_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      memberId: original.memberId,
      amount: original.amount,
      method: original.method,
      reference: `REV:${original.reference || original.id}`,
      reversalOfId: original.id,
      note: reason || `Reversal of payment on ${original.date}`,
      createdAt: new Date().toISOString(),
    };

    setPayments((prev) => [reversal, ...prev]);
    setSaveStatus('saved');
  };

  // Add member
  const addMember = async (memberData: Omit<Member, 'id' | 'createdAt'>) => {
    setSaveStatus('saving');
    const newMember: Member = {
      ...memberData,
      id: `mem_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setMembers((prev) => [...prev, newMember]);
    setSaveStatus('saved');
  };

  // Update member status
  const updateMemberStatus = async (memberId: string, status: 'active' | 'inactive') => {
    setSaveStatus('saving');
    setMembers((prev) =>
      prev.map((m) =>
        m.id === memberId
          ? {
              ...m,
              status,
              inactiveFrom: status === 'inactive' ? new Date().toISOString().split('T')[0] : undefined,
            }
          : m
      )
    );
    setSaveStatus('saved');
  };

  // Reset to initial demo data
  const resetToDemoData = () => {
    setMembers(INITIAL_MEMBERS);
    setServiceDays(getInitialServiceDays());
    setAttendance(getInitialAttendance());
    setGuestAttendance(getInitialGuestAttendance());
    setExpenses(getInitialExpenses());
    setPayments(getInitialPayments());
    setSelectedMonth('2026-11');
    setSaveStatus('saved');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchPersona,
        signInWithGoogle,
        signOutUser,
        members,
        serviceDays,
        attendance,
        guestAttendance,
        expenses,
        payments,
        selectedMonth,
        setSelectedMonth,
        saveStatus,
        saveDailyLog,
        confirmFridayReview,
        addExpense,
        deleteExpense,
        addPayment,
        updatePayment,
        deletePayment,
        reversePayment,
        addMember,
        updateMemberStatus,
        resetToDemoData,
        reconciliation,
        depositTargetMemberId,
        setDepositTargetMemberId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
