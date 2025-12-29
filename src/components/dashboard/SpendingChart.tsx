import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Transaction } from '@/types/finance';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay } from 'date-fns';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency } from '@/lib/utils/currency';

interface SpendingChartProps {
  transactions?: Transaction[];
}

export function SpendingChart({ transactions = [] }: SpendingChartProps) {
  const { user, convertAmount } = useFinance();

  // Calculate weekly data
  const now = new Date();
  const start = startOfWeek(now, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(now, { weekStartsOn: 1 }); // Sunday
  const days = eachDayOfInterval({ start, end });

  const data = days.map(day => {
    const dayTransactions = transactions.filter(t => {
      if (!t.date) return false;
      try {
        return isSameDay(new Date(t.date), day);
      } catch {
        return false;
      }
    });
    const income = dayTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + convertAmount(t.amount, t.currency), 0);
    const expense = dayTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + convertAmount(t.amount, t.currency), 0);

    return {
      name: format(day, 'EEE'),
      fullDate: format(day, 'MMM d'),
      income,
      expense
    };
  });

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">This Week</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-income" />
            <span className="text-muted-foreground">Income</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-expense" />
            <span className="text-muted-foreground">Expenses</span>
          </div>
        </div>
      </div>

      <div className="h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickFormatter={(value) => `${value}`} // Simplifiction for space
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-sm)',
                color: 'hsl(var(--popover-foreground))'
              }}
              labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '0.25rem' }}
              formatter={(value: number) => [formatCurrency(value, user?.currency), '']}
              labelFormatter={(label, payload) => payload[0]?.payload.fullDate || label}
            />
            <Area
              type="monotone"
              dataKey="income"
              stroke="hsl(var(--success))"
              strokeWidth={2}
              fill="url(#incomeGradient)"
              animationDuration={1000}
            />
            <Area
              type="monotone"
              dataKey="expense"
              stroke="hsl(var(--destructive))"
              strokeWidth={2}
              fill="url(#expenseGradient)"
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
