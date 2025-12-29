import { Transaction, Category } from '@/types/finance';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface RecentTransactionsProps {
  transactions: Transaction[];
  categories: Category[];
  limit?: number;
}

export function RecentTransactions({
  transactions,
  categories,
  limit = 5
}: RecentTransactionsProps) {
  const recentTransactions = Array.isArray(transactions)
    ? [...transactions]
      .sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, limit)
    : [];

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getCategory = (categoryId: string) => {
    return categories.find(c => c.id === categoryId);
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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
        <button className="text-sm text-primary font-medium hover:text-primary/80 transition-colors">
          View all
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border divide-y divide-border">
        {recentTransactions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No transactions yet</p>
          </div>
        ) : (
          recentTransactions.map((transaction) => {
            const category = getCategory(transaction.categoryId);
            const Icon = getTransactionIcon(transaction.type);

            return (
              <div
                key={transaction.id}
                className={cn(
                  "flex items-center gap-3 p-4 transition-colors cursor-pointer",
                  transaction.type === 'income' && "bg-emerald-950 hover:bg-emerald-900",
                  transaction.type === 'expense' && "bg-rose-950 hover:bg-rose-900",
                  transaction.type === 'transfer' && "bg-card hover:bg-secondary/50"
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center h-10 w-10 rounded-full shrink-0",
                    transaction.type === 'income' && "bg-emerald-900/50",
                    transaction.type === 'expense' && "bg-rose-900/50",
                    transaction.type === 'transfer' && "bg-primary/20"
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4',
                      transaction.type === 'income' && 'text-emerald-100',
                      transaction.type === 'expense' && 'text-rose-100',
                      transaction.type === 'transfer' && 'text-primary'
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
                  <p className={cn(
                    "text-sm",
                    (transaction.type === 'income' || transaction.type === 'expense') ? "text-white/70" : "text-muted-foreground"
                  )}>
                    {category?.name} • {formatDistanceToNow(new Date(transaction.date), { addSuffix: true })}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className={cn(
                    'font-semibold',
                    transaction.type === 'income' && 'text-emerald-400',
                    transaction.type === 'expense' && 'text-rose-400',
                    transaction.type === 'transfer' && 'text-foreground'
                  )}>
                    {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </p>
                  {transaction.splitType && (
                    <span className="text-xs text-accent">Split</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
