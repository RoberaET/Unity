import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PartnerService } from '@/services/partnerService';
import {
  User,
  Wallet,
  Transaction,
  Debt,
  DebtPayment,
  Goal,
  GoalContribution,
  Category,
  mockCategories,
} from '@/types/finance';
import { currencyApi, ExchangeRates } from '@/lib/currency-api';

interface FinanceContextType {
  user: User | null;
  partner: User | null;
  isPaired: boolean;
  wallets: Wallet[];
  transactions: Transaction[];
  // Partner data (read-only for current user)
  partnerWallets: Wallet[];
  partnerTransactions: Transaction[];
  // Combined data for views
  allWallets: Wallet[];
  allTransactions: Transaction[];

  debts: Debt[];
  debtPayments: DebtPayment[];
  goals: Goal[];
  goalContributions: GoalContribution[];
  categories: Category[];

  // Partner requests
  partnerRequests: any[];
  sentRequests: any[];

  // Ownership helpers
  isOwnWallet: (walletId: string) => boolean;
  canEditWallet: (walletId: string) => boolean;
  isOwnTransaction: (transactionId: string) => boolean;

  // Partner request actions
  sendPartnerRequest: (email: string) => Promise<{ success: boolean; error?: string }>;
  respondToRequest: (requestId: string, accept: boolean) => Promise<void>;
  cancelRequest: (requestId: string) => Promise<void>;
  refreshPartnerRequests: () => Promise<void>;
  unpair: () => Promise<void>;
  refreshPartner: () => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  addWallet: (wallet: Omit<Wallet, 'id'>) => void;
  updateWallet: (id: string, data: Partial<Wallet>) => void;
  deleteWallet: (id: string) => void;
  addDebt: (debt: Omit<Debt, 'id' | 'createdAt'>) => void;
  deleteDebt: (id: string) => void;
  addDebtPayment: (debtId: string, amount: number) => void;
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (id: string, data: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  contributeToGoal: (goalId: string, amount: number, walletId: string, note?: string) => void;
  withdrawFromGoal: (goalId: string, amount: number, walletId: string, note?: string) => void;

  // Computed values
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  internalBalance: number;

  // Currency
  exchangeRates: ExchangeRates | null;
  convertAmount: (amount: number, fromCurrency: string) => number;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { user: authUser } = useAuth();

  // Helper to load from local storage
  const loadState = <T,>(key: string, defaultValue: T): T => {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(`Failed to parse ${key}`, e);
      }
    }
    return defaultValue;
  };

  const [partner, setPartner] = useState<User | null>(() =>
    loadState('finance-partner', null)
  );

  const [isPaired, setIsPaired] = useState(() =>
    loadState('finance-isPaired', false)
  );

  const [wallets, setWallets] = useState<Wallet[]>(() =>
    loadState('finance-wallets', [])
  );

  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    loadState('finance-transactions', [])
  );

  const [debts, setDebts] = useState<Debt[]>(() =>
    loadState('finance-debts', [])
  );

  const [debtPayments, setDebtPayments] = useState<DebtPayment[]>(() =>
    loadState('finance-debt-payments', [])
  );

  const [goals, setGoals] = useState<Goal[]>(() =>
    loadState('finance-goals', [])
  );

  const [goalContributions, setGoalContributions] = useState<GoalContribution[]>(() =>
    loadState('finance-goal-contributions', [])
  );

  // Partner data (synced from partner's localStorage in a real app)
  const [partnerWallets, setPartnerWallets] = useState<Wallet[]>(() =>
    loadState('finance-partner-wallets', [])
  );

  const [partnerTransactions, setPartnerTransactions] = useState<Transaction[]>(() =>
    loadState('finance-partner-transactions', [])
  );

  const [categories] = useState<Category[]>(mockCategories);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(null);

  useEffect(() => {
    if (authUser?.currency) {
      currencyApi.getRates(authUser.currency).then(setExchangeRates);
    }
  }, [authUser?.currency]);

  const convertAmount = useCallback((amount: number, fromCurrency: string) => {
    if (!exchangeRates || !authUser?.currency) return amount;
    return currencyApi.convert(amount, fromCurrency, authUser.currency, exchangeRates);
  }, [exchangeRates, authUser]);

  // Derived: Combined wallets and transactions (user's + partner's)
  const allWallets = [...wallets, ...partnerWallets];
  const allTransactions = [...transactions, ...partnerTransactions];

  // Ownership helper functions
  const isOwnWallet = useCallback((walletId: string): boolean => {
    const wallet = wallets.find(w => w.id === walletId);
    return !!wallet;
  }, [wallets]);

  const canEditWallet = useCallback((walletId: string): boolean => {
    const wallet = allWallets.find(w => w.id === walletId);
    if (!wallet) return false;
    // Can edit if: own personal wallet OR any shared wallet
    if (wallet.type === 'shared') return true;
    return isOwnWallet(walletId);
  }, [allWallets, isOwnWallet]);

  const isOwnTransaction = useCallback((transactionId: string): boolean => {
    const transaction = transactions.find(t => t.id === transactionId);
    return !!transaction;
  }, [transactions]);

  // Persist partner data
  useEffect(() => {
    localStorage.setItem('finance-partner-wallets', JSON.stringify(partnerWallets));
  }, [partnerWallets]);

  useEffect(() => {
    localStorage.setItem('finance-partner-transactions', JSON.stringify(partnerTransactions));
  }, [partnerTransactions]);

  // Persist state changes
  useEffect(() => {
    localStorage.setItem('finance-partner', JSON.stringify(partner));
  }, [partner]);

  useEffect(() => {
    localStorage.setItem('finance-isPaired', JSON.stringify(isPaired));
  }, [isPaired]);

  useEffect(() => {
    localStorage.setItem('finance-wallets', JSON.stringify(wallets));
  }, [wallets]);

  useEffect(() => {
    localStorage.setItem('finance-transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('finance-debts', JSON.stringify(debts));
  }, [debts]);

  useEffect(() => {
    localStorage.setItem('finance-debt-payments', JSON.stringify(debtPayments));
  }, [debtPayments]);

  useEffect(() => {
    localStorage.setItem('finance-goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('finance-goal-contributions', JSON.stringify(goalContributions));
  }, [goalContributions]);

  // Refresh partner data from backend
  const refreshPartner = useCallback(async () => {
    if (!authUser) return;
    try {
      const partnerData = await PartnerService.getPartner();
      if (partnerData) {
        setPartner(partnerData);
        setIsPaired(true);
      } else {
        setPartner(null);
        setIsPaired(false);
      }
    } catch (error) {
      console.error('Failed to fetch partner:', error);
    }
  }, [authUser]);

  // Load partner on mount and when user changes
  useEffect(() => {
    if (authUser) {
      refreshPartner();
      refreshPartnerRequests();
    }
  }, [authUser]);

  // Partner request state
  const [partnerRequests, setPartnerRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);

  const refreshPartnerRequests = useCallback(async () => {
    if (!authUser) return;
    try {
      const { received, sent } = await PartnerService.getRequests();
      setPartnerRequests(received);
      setSentRequests(sent);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    }
  }, [authUser]);

  const sendPartnerRequest = useCallback(async (email: string) => {
    console.log('📧 Sending partner request to:', email);
    if (!authUser) {
      console.error('❌ Not logged in');
      return { success: false, error: 'Not logged in' };
    }
    try {
      console.log('📤 Calling PartnerService.sendRequest...');
      const result = await PartnerService.sendRequest(email);
      console.log('✅ Request sent successfully:', result);

      console.log('🔄 Refreshing partner requests...');
      await refreshPartnerRequests();

      return { success: true };
    } catch (error: any) {
      console.error('❌ Failed to send partner request:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send request';
      return { success: false, error: errorMessage };
    }
  }, [authUser, refreshPartnerRequests]);

  const respondToRequest = useCallback(async (requestId: string, accept: boolean) => {
    console.log('🔵 respondToRequest called:', { requestId, accept });
    try {
      console.log('📤 Calling PartnerService.respondToRequest...');
      const result = await PartnerService.respondToRequest(requestId, accept);
      console.log('✅ Response successful:', result);

      console.log('🔄 Refreshing partner requests...');
      await refreshPartnerRequests();

      if (accept) {
        console.log('🔄 Refreshing partner info...');
        await refreshPartner();
      }
      console.log('✅ respondToRequest completed successfully');
    } catch (error: any) {
      console.error('❌ Failed to respond:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error; // Re-throw so the caller can handle it
    }
  }, [refreshPartnerRequests, refreshPartner]);

  const cancelRequest = useCallback(async (requestId: string) => {
    // Current API doesn't support cancel yet, or reuse unpair/reject logic?
    // For now assuming we implement cancel later or it's same as reject
    // await PartnerService.cancelRequest(requestId);
    // await refreshPartnerRequests();
  }, [refreshPartnerRequests]);

  const unpair = useCallback(async () => {
    if (!authUser) return;
    try {
      await PartnerService.unpair();
      setPartner(null);
      setIsPaired(false);
    } catch (error) {
      console.error('Failed to unpair:', error);
    }
  }, [authUser]);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);

    // Update wallet balance
    // Update wallet balance
    setWallets(prev => prev.map(w => {
      // Source Wallet Logic
      if (w.id === transaction.walletId) {
        const balanceChange = transaction.type === 'income'
          ? transaction.amount
          : -transaction.amount; // Expense AND Transfer subtract from source
        return { ...w, balance: w.balance + balanceChange };
      }
      // Destination Wallet Logic (for transfers)
      if (transaction.type === 'transfer' && w.id === transaction.destinationWalletId) {
        return { ...w, balance: w.balance + transaction.amount };
      }
      return w;
    }));
  }, []);

  const addWallet = useCallback((wallet: Omit<Wallet, 'id'>) => {
    const newWallet: Wallet = {
      ...wallet,
      id: Date.now().toString(),
    };
    setWallets(prev => [...prev, newWallet]);
  }, []);

  const updateWallet = useCallback((id: string, data: Partial<Wallet>) => {
    setWallets(prev => prev.map(w => w.id === id ? { ...w, ...data } : w));
  }, []);

  const deleteWallet = useCallback((id: string) => {
    setWallets(prev => prev.filter(w => w.id !== id));
    // Optional: Delete transactions associated with this wallet
    setTransactions(prev => prev.filter(t => t.walletId !== id));
  }, []);

  const addDebt = useCallback((debt: Omit<Debt, 'id' | 'createdAt'>) => {
    const newDebt: Debt = {
      ...debt,
      id: Date.now().toString(),
      createdAt: new Date(),
      currency: debt.currency // Ensure currency is preserved
    };
    setDebts(prev => [...prev, newDebt]);
  }, []);

  const deleteDebt = useCallback((id: string) => {
    setDebts(prev => prev.filter(d => d.id !== id));
    // Optionally remove payments too, but keeping them for history might be safer?
    // User probably wants them gone if deleting the debt.
    setDebtPayments(prev => prev.filter(p => p.debtId !== id));
  }, []);

  const addDebtPayment = useCallback((debtId: string, amount: number) => {
    const debt = debts.find(d => d.id === debtId);
    if (!debt) return;

    // 1. Create Payment Record
    const newPayment: DebtPayment = {
      id: Date.now().toString(),
      debtId,
      amount,
      paidAt: new Date(),
      paidBy: 'user1', // TODO: Use actual user ID
    };
    setDebtPayments(prev => [newPayment, ...prev]);

    // 2. Update Debt Balance
    setDebts(prev => prev.map(d => {
      if (d.id === debtId) {
        return {
          ...d,
          remainingAmount: Math.max(0, d.remainingAmount - amount),
        };
      }
      return d;
    }));

    // 3. Create Transaction (to reflect money leaving/entering wallet)
    // For now, auto-select first wallet or finding one matching currency
    // ideally the UI prompts this, but for "best practice" context logic:
    const wallet = wallets.find(w => w.currency === debt.currency) || wallets[0];
    if (wallet) {
      addTransaction({
        walletId: wallet.id,
        type: debt.type === 'we_owe' ? 'expense' : 'income',
        amount: amount,
        currency: debt.currency,
        categoryId: 'debt_repayment', // Needs to exist or handle string
        description: `Payment for: ${debt.name}`,
        date: new Date(),
        createdBy: 'user1',
        isRecurring: false
      });
    }
  }, [debts, wallets, addTransaction]);

  const addGoal = useCallback((goal: Omit<Goal, 'id'>) => {
    const newGoal: Goal = {
      ...goal,
      id: Date.now().toString(),
    };
    setGoals(prev => [...prev, newGoal]);
  }, []);

  const updateGoal = useCallback((id: string, data: Partial<Goal>) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...data } : g));
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    setGoalContributions(prev => prev.filter(c => c.goalId !== id));
  }, []);

  const contributeToGoal = useCallback((goalId: string, amount: number, walletId: string, note?: string) => {
    const goal = goals.find(g => g.id === goalId);
    const wallet = wallets.find(w => w.id === walletId);

    if (!goal || !wallet) {
      console.error('Goal or wallet not found');
      return;
    }

    if (wallet.balance < amount) {
      console.error('Insufficient funds in wallet');
      return;
    }

    // Create contribution record
    const contribution: GoalContribution = {
      id: Date.now().toString(),
      goalId,
      amount,
      walletId,
      contributedBy: 'user1', // TODO: Use actual user ID
      contributedAt: new Date(),
      note,
      type: 'contribution'
    };
    setGoalContributions(prev => [contribution, ...prev]);

    // Update goal's current amount
    setGoals(prev => prev.map(g =>
      g.id === goalId
        ? { ...g, currentAmount: g.currentAmount + amount }
        : g
    ));

    // Deduct from wallet balance
    setWallets(prev => prev.map(w =>
      w.id === walletId
        ? { ...w, balance: w.balance - amount }
        : w
    ));

    // Create transaction record
    addTransaction({
      walletId,
      type: 'expense',
      amount,
      currency: goal.currency,
      categoryId: 'savings_goal',
      description: `Contribution to: ${goal.name}`,
      date: new Date(),
      createdBy: 'user1',
      isRecurring: false
    });
  }, [goals, wallets, addTransaction]);

  const withdrawFromGoal = useCallback((goalId: string, amount: number, walletId: string, note?: string) => {
    const goal = goals.find(g => g.id === goalId);
    const wallet = wallets.find(w => w.id === walletId);

    if (!goal || !wallet) {
      console.error('Goal or wallet not found');
      return;
    }

    if (goal.currentAmount < amount) {
      console.error('Insufficient funds in goal');
      return;
    }

    // Create withdrawal record
    const contribution: GoalContribution = {
      id: Date.now().toString(),
      goalId,
      amount,
      walletId,
      contributedBy: 'user1', // TODO: Use actual user ID
      contributedAt: new Date(),
      note,
      type: 'withdrawal'
    };
    setGoalContributions(prev => [contribution, ...prev]);

    // Update goal's current amount
    setGoals(prev => prev.map(g =>
      g.id === goalId
        ? { ...g, currentAmount: Math.max(0, g.currentAmount - amount) }
        : g
    ));

    // Add to wallet balance
    setWallets(prev => prev.map(w =>
      w.id === walletId
        ? { ...w, balance: w.balance + amount }
        : w
    ));

    // Create transaction record
    addTransaction({
      walletId,
      type: 'income',
      amount,
      currency: goal.currency,
      categoryId: 'savings_goal',
      description: `Withdrawal from: ${goal.name}`,
      date: new Date(),
      createdBy: 'user1',
      isRecurring: false
    });
  }, [goals, wallets, addTransaction]);

  // Computed values
  const totalBalance = wallets.reduce((sum, w) => sum + convertAmount(w.balance, w.currency), 0);

  // Derive user and partner data from shared storage
  // This ensures that in a single-browser session (shared localStorage), data is properly separated
  const userWallets = useMemo(() => {
    return wallets.filter(w =>
      w.ownerId === authUser?.id ||
      (!w.ownerId && !partner) || // Legacy support: if no owner and not paired, assume yours
      (w.type === 'shared') // Shared wallets visible to both
    );
  }, [wallets, authUser, partner]);

  const derivedPartnerWallets = useMemo(() => {
    if (!partner) return [];
    return wallets.filter(w =>
      w.ownerId === partner.id &&
      w.type === 'personal' // Only show partner's personal wallets here (shared are in main list)
    );
  }, [wallets, partner]);

  const userTransactions = useMemo(() => {
    return transactions.filter(t =>
      // Filter by wallet ownership/visibility logic
      userWallets.some(w => w.id === t.walletId)
    );
  }, [transactions, userWallets]);

  const derivedPartnerTransactions = useMemo(() => {
    if (!partner) return [];
    return transactions.filter(t =>
      // Transactions in partner's personal wallets
      derivedPartnerWallets.some(w => w.id === t.walletId)
    );
  }, [transactions, derivedPartnerWallets]);

  // Combined for calculations if needed, but context exposes separated
  const activeAllWallets = [...userWallets, ...derivedPartnerWallets];
  const activeAllTransactions = [...userTransactions, ...derivedPartnerTransactions];

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyIncome = transactions
    .filter(t =>
      t.type === 'income' &&
      new Date(t.date).getMonth() === currentMonth &&
      new Date(t.date).getFullYear() === currentYear
    )
    .reduce((sum, t) => sum + convertAmount(t.amount, t.currency), 0);

  const monthlyExpenses = transactions
    .filter(t =>
      t.type === 'expense' &&
      new Date(t.date).getMonth() === currentMonth &&
      new Date(t.date).getFullYear() === currentYear
    )
    .reduce((sum, t) => sum + convertAmount(t.amount, t.currency), 0);

  const internalDebt = debts.find(d => d.type === 'internal');
  const internalBalance = internalDebt ? convertAmount(internalDebt.remainingAmount, internalDebt.currency) : 0;

  return (
    <FinanceContext.Provider
      value={{
        user: authUser,
        partner,
        isPaired,
        wallets: userWallets,
        transactions: userTransactions,
        // Partner data
        partnerWallets: derivedPartnerWallets,
        partnerTransactions: derivedPartnerTransactions,
        allWallets: activeAllWallets,
        allTransactions: activeAllTransactions,
        // Ownership helpers
        isOwnWallet,
        canEditWallet,
        isOwnTransaction,

        debts,
        debtPayments,
        goals,
        goalContributions,
        categories,
        // Partner requests
        partnerRequests,
        sentRequests,
        // Partner request actions
        sendPartnerRequest,
        respondToRequest,
        cancelRequest,
        refreshPartnerRequests,
        unpair,
        refreshPartner,
        addTransaction,
        addWallet,
        updateWallet,
        deleteWallet,

        addDebt,
        deleteDebt,
        addDebtPayment,
        addGoal,
        updateGoal,
        deleteGoal,
        contributeToGoal,
        withdrawFromGoal,
        totalBalance,
        monthlyIncome,
        monthlyExpenses,
        internalBalance,
        exchangeRates,
        convertAmount,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
