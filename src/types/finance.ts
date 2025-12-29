// Core types for the finance app

export type TransactionType = 'income' | 'expense' | 'transfer';
export type DebtType = 'we_owe' | 'owed_to_us' | 'internal';
export type SplitType = 'equal' | 'custom' | 'income_based';
export type WalletType = 'personal' | 'shared';
export type Currency = 'USD' | 'EUR' | 'GBP' | 'INR' | 'AUD' | 'CAD' | 'ETB';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role?: 'USER' | 'ADMIN';
  currency?: Currency; // Preferred currency
  createdAt: Date;
}

export interface Couple {
  id: string;
  partnerAId: string;
  partnerBId: string;
  createdAt: Date;
  status: 'active' | 'pending' | 'inactive';
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  parentId?: string;
  isDefault: boolean;
}

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  currency: Currency;
  balance: number;
  ownerId?: string;
  coupleId?: string;
  color: string;
  icon: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  destinationWalletId?: string;
  type: TransactionType;
  amount: number;
  currency: Currency;
  categoryId: string;
  description: string;
  date: Date;
  createdBy: string;
  splitType?: SplitType;
  splitRatio?: number[];
  receiptUrl?: string;
  isRecurring: boolean;
  recurringInterval?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  notes?: string;
}

export interface Debt {
  id: string;
  type: DebtType;
  name: string;
  totalAmount: number;
  remainingAmount: number;
  currency: Currency;
  interestRate?: number;
  dueDate?: Date;
  creditorId?: string;
  debtorId?: string;
  externalName?: string;
  notes?: string;
  createdAt: Date;
}

export interface DebtPayment {
  id: string;
  debtId: string;
  amount: number;
  paidAt: Date;
  paidBy: string;
  notes?: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  currency: Currency;
  targetDate?: Date;
  walletId?: string;
  icon: string;
  color: string;
}

export interface GoalContribution {
  id: string;
  goalId: string;
  amount: number;
  walletId: string;
  contributedBy: string;
  contributedAt: Date;
  note?: string;
  type: 'contribution' | 'withdrawal';
}

export interface PairingCode {
  code: string;
  userId: string;
  expiresAt: Date;
  isUsed: boolean;
}

// Mock data for development
export const mockCategories: Category[] = [
  { id: '1', name: 'Food & Dining', icon: 'utensils', color: '#f97316', isDefault: true },
  { id: '2', name: 'Transportation', icon: 'car', color: '#3b82f6', isDefault: true },
  { id: '3', name: 'Shopping', icon: 'shopping-bag', color: '#ec4899', isDefault: true },
  { id: '4', name: 'Entertainment', icon: 'film', color: '#8b5cf6', isDefault: true },
  { id: '5', name: 'Bills & Utilities', icon: 'receipt', color: '#ef4444', isDefault: true },
  { id: '6', name: 'Healthcare', icon: 'heart', color: '#10b981', isDefault: true },
  { id: '7', name: 'Salary', icon: 'banknote', color: '#22c55e', isDefault: true },
  { id: '8', name: 'Investments', icon: 'trending-up', color: '#6366f1', isDefault: true },
];

export const mockWallets: Wallet[] = [
  { id: '1', name: 'My Wallet', type: 'personal', currency: 'USD', balance: 4580.50, color: '#3b82f6', icon: 'wallet' },
  { id: '2', name: 'Shared Account', type: 'shared', currency: 'USD', balance: 12450.00, color: '#8b5cf6', icon: 'users' },
  { id: '3', name: 'Savings', type: 'personal', currency: 'USD', balance: 8200.00, color: '#10b981', icon: 'piggy-bank' },
];

export const mockTransactions: Transaction[] = [
  { id: '1', walletId: '1', type: 'expense', amount: 45.50, currency: 'USD', categoryId: '1', description: 'Dinner at Italian Place', date: new Date('2026-12-27'), createdBy: 'user1', isRecurring: false },
  { id: '2', walletId: '2', type: 'expense', amount: 120.00, currency: 'USD', categoryId: '5', description: 'Electricity Bill', date: new Date('2026-12-26'), createdBy: 'user1', splitType: 'equal', isRecurring: true, recurringInterval: 'monthly' },
  { id: '3', walletId: '1', type: 'income', amount: 3500.00, currency: 'USD', categoryId: '7', description: 'Monthly Salary', date: new Date('2026-12-25'), createdBy: 'user1', isRecurring: true, recurringInterval: 'monthly' },
  { id: '4', walletId: '2', type: 'expense', amount: 89.99, currency: 'USD', categoryId: '3', description: 'Amazon Purchase', date: new Date('2026-12-24'), createdBy: 'user2', splitType: 'custom', splitRatio: [60, 40], isRecurring: false },
  { id: '5', walletId: '1', type: 'expense', amount: 35.00, currency: 'USD', categoryId: '2', description: 'Gas Station', date: new Date('2026-12-23'), createdBy: 'user1', isRecurring: false },
];

export const mockDebts: Debt[] = [
  { id: '1', type: 'we_owe', name: 'Car Loan', totalAmount: 15000, remainingAmount: 8500, currency: 'USD', interestRate: 4.5, dueDate: new Date('2028-06-01'), createdAt: new Date('2026-01-01') },
  { id: '2', type: 'owed_to_us', name: 'Lent to John', totalAmount: 500, remainingAmount: 300, currency: 'USD', externalName: 'John Smith', createdAt: new Date('2026-11-15') },
  { id: '3', type: 'internal', name: 'Partner Balance', totalAmount: 0, remainingAmount: 150, currency: 'USD', notes: 'Partner A owes Partner B', createdAt: new Date('2026-12-01') },
];

export const mockGoals: Goal[] = [
  { id: '1', name: 'Vacation Fund', targetAmount: 5000, currentAmount: 2300, currency: 'USD', targetDate: new Date('2027-06-01'), icon: 'plane', color: '#3b82f6' },
  { id: '2', name: 'Emergency Fund', targetAmount: 10000, currentAmount: 6800, currency: 'USD', icon: 'shield', color: '#10b981' },
  { id: '3', name: 'New Car', targetAmount: 25000, currentAmount: 8500, currency: 'USD', targetDate: new Date('2026-01-01'), icon: 'car', color: '#8b5cf6' },
];
