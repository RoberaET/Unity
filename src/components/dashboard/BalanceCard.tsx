import { TrendingUp, TrendingDown, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface BalanceCardProps {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  currency?: string;
}

export function BalanceCard({
  totalBalance,
  monthlyIncome,
  monthlyExpenses,
  currency = 'USD'
}: BalanceCardProps) {
  const [isHidden, setIsHidden] = useState(false);

  const formatCurrency = (amount: number) => {
    if (isHidden) return '••••••';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const netChange = monthlyIncome - monthlyExpenses;
  const isPositive = netChange >= 0;

  return (
    <div className="relative overflow-hidden rounded-2xl gradient-primary p-6 text-primary-foreground">
      {/* Decorative elements */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary-foreground/10" />
      <div className="absolute -right-4 top-12 h-20 w-20 rounded-full bg-primary-foreground/5" />

      <div className="relative">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-primary-foreground/80">Total Balance</span>
          <button
            onClick={() => setIsHidden(!isHidden)}
            className="p-1.5 rounded-lg hover:bg-primary-foreground/10 transition-colors"
          >
            {isHidden ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          {formatCurrency(totalBalance)}
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-emerald-950 border border-emerald-900 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex items-center justify-center h-6 w-6 rounded-full bg-emerald-900/50">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-100" />
              </div>
              <span className="text-xs text-emerald-200">Income</span>
            </div>
            <p className="text-lg font-semibold text-white">{formatCurrency(monthlyIncome)}</p>
          </div>

          <div className="bg-rose-950 border border-rose-900 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex items-center justify-center h-6 w-6 rounded-full bg-rose-900/50">
                <TrendingDown className="h-3.5 w-3.5 text-rose-100" />
              </div>
              <span className="text-xs text-rose-200">Expenses</span>
            </div>
            <p className="text-lg font-semibold text-white">{formatCurrency(monthlyExpenses)}</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-primary-foreground/20">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white">This month</span>
            <div className={cn(
              'flex items-center gap-1 text-sm font-medium text-white'
            )}>
              {isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {isPositive ? '+' : ''}{formatCurrency(netChange)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
