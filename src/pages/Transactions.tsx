import { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Filter,
  Search,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { Transaction } from '@/types/finance';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';

const Transactions = () => {
  const { transactions, categories, wallets } = useFinance();
  const [filterType, setFilterType] = useState<'all' | Transaction['type']>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const filteredTransactions = transactions.filter(t => {
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.categoryId && t.categoryId.toLowerCase().includes(searchQuery.toLowerCase()));

    let matchesDate = true;
    if (dateRange?.from) {
      const txnDate = new Date(t.date);
      const fromDate = startOfDay(dateRange.from);
      const toDate = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
      matchesDate = isWithinInterval(txnDate, { start: fromDate, end: toDate });
    }

    return matchesType && matchesSearch && matchesDate;
  });

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const getCategory = (categoryId: string) => {
    return categories.find(c => c.id === categoryId);
  };

  const getWallet = (walletId: string) => {
    return wallets.find(w => w.id === walletId);
  };

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'income':
        return ArrowDownLeft;
      case 'expense':
        return ArrowUpRight;
      case 'transfer':
        return ArrowLeftRight;
    }
  };

  // Group transactions by date
  const groupedTransactions = filteredTransactions.reduce((groups, txn) => {
    const date = format(new Date(txn.date), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(txn);
    return groups;
  }, {} as Record<string, Transaction[]>);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Transactions</h2>
        <p className="text-muted-foreground">
          {transactions.length} total transactions
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Type Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { value: 'all', label: 'All', color: 'primary' },
          { value: 'income', label: 'Income', color: 'income' },
          { value: 'expense', label: 'Expense', color: 'expense' },
          { value: 'transfer', label: 'Transfer', color: 'primary' },
        ].map((filter) => (
          <button
            key={filter.value}
            onClick={() => setFilterType(filter.value as typeof filterType)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap',
              filterType === filter.value
                ? filter.value === 'income'
                  ? 'bg-income text-income-foreground'
                  : filter.value === 'expense'
                    ? 'bg-expense text-expense-foreground'
                    : 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      <div className="space-y-6">
        {Object.keys(groupedTransactions).length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <p className="text-muted-foreground">No transactions found</p>
          </div>
        ) : (
          Object.entries(groupedTransactions).map(([date, txns]) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                {format(new Date(date), 'EEEE, MMMM d')}
              </h3>
              <div className="bg-card rounded-xl border border-border divide-y divide-border">
                {txns.map((transaction) => {
                  const category = getCategory(transaction.categoryId);
                  const wallet = getWallet(transaction.walletId);
                  const Icon = getTransactionIcon(transaction.type);

                  return (
                    <div
                      key={transaction.id}
                      className={cn(
                        "flex items-center gap-3 p-4 transition-colors cursor-pointer border-b last:border-0",
                        transaction.type === 'income' && "bg-emerald-950 hover:bg-emerald-900 border-emerald-900",
                        transaction.type === 'expense' && "bg-rose-950 hover:bg-rose-900 border-rose-900",
                        transaction.type === 'transfer' && "bg-accent/10 hover:bg-accent/20 border-accent/20"
                      )}
                    >
                      <div
                        className={cn(
                          "flex items-center justify-center h-12 w-12 rounded-full shrink-0",
                          transaction.type === 'income' && "bg-emerald-900/50",
                          transaction.type === 'expense' && "bg-rose-900/50",
                          transaction.type === 'transfer' && "bg-accent/20"
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-5 w-5',
                            transaction.type === 'income' && 'text-emerald-100',
                            transaction.type === 'expense' && 'text-rose-100',
                            transaction.type === 'transfer' && 'text-accent'
                          )}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "font-medium truncate",
                          (transaction.type === 'income' || transaction.type === 'expense') ? "text-white" : "text-foreground"
                        )}>
                          {transaction.description}
                        </p>
                        <div className={cn(
                          "flex items-center gap-2 text-sm",
                          (transaction.type === 'income' || transaction.type === 'expense') ? "text-white/70" : "text-muted-foreground"
                        )}>
                          <span>{category?.name}</span>
                          <span>•</span>
                          <span>{wallet?.name || 'Unknown Wallet'}</span>
                          {transaction.splitType && (
                            <>
                              <span>•</span>
                              <span className="text-accent">Split</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p
                          className={cn(
                            'font-semibold text-lg',
                            transaction.type === 'income' && 'text-emerald-400',
                            transaction.type === 'expense' && 'text-rose-400',
                            transaction.type === 'transfer' && 'text-foreground'
                          )}
                        >
                          {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}
                          {formatCurrency(transaction.amount, transaction.currency)}
                        </p>
                        {transaction.isRecurring && (
                          <span className={cn(
                            "text-xs",
                            (transaction.type === 'income' || transaction.type === 'expense') ? "text-white/50" : "text-muted-foreground"
                          )}>Recurring</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Transactions;
