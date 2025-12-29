import { useFinance } from '@/contexts/FinanceContext';
import { BalanceCard } from '@/components/dashboard/BalanceCard';
import { WalletSlider } from '@/components/dashboard/WalletSlider';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { InternalBalance } from '@/components/dashboard/InternalBalance';
import { SpendingChart } from '@/components/dashboard/SpendingChart';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const {
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
    wallets,
    transactions,
    categories,
    isPaired,
  } = useFinance();

  // @ts-ignore
  const { getNotifications } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  useEffect(() => {
    // Load dismissed notification IDs from localStorage
    const stored = localStorage.getItem('dismissedNotifications');
    if (stored) {
      setDismissedIds(JSON.parse(stored));
    }

    // @ts-ignore
    getNotifications().then(data => setNotifications(data));
  }, []);

  const dismissNotification = (notificationId: string) => {
    const newDismissed = [...dismissedIds, notificationId];
    setDismissedIds(newDismissed);
    localStorage.setItem('dismissedNotifications', JSON.stringify(newDismissed));
  };

  const visibleNotifications = notifications.filter(
    note => note.severity === 'critical' || !dismissedIds.includes(note.id || note.title)
  );

  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Broadcasts */}
      {visibleNotifications.length > 0 && visibleNotifications.map((note, i) => (
        <div key={note.id || i} className={`p-4 rounded-xl border flex items-start gap-3 shadow-sm ${note.severity === 'critical' ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100' :
          note.severity === 'warning' ? 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100' :
            'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100'
          }`}>
          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-1">{note.title}</h4>
            <p className="text-sm opacity-90">{note.body}</p>
          </div>
          {/* Only show dismiss button for non-critical notifications */}
          {note.severity !== 'critical' && (
            <div className="flex gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-white/50 dark:hover:bg-black/20"
                onClick={() => dismissNotification(note.id || note.title)}
                title="Mark as read"
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-white/50 dark:hover:bg-black/20"
                onClick={() => dismissNotification(note.id || note.title)}
                title="Dismiss"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      ))}

      {/* Balance Card */}
      <BalanceCard
        totalBalance={totalBalance}
        monthlyIncome={monthlyIncome}
        monthlyExpenses={monthlyExpenses}
      />

      {/* Wallets Slider */}
      <WalletSlider
        wallets={wallets}
        onAddWallet={() => navigate('/wallets')}
      />

      {/* Two Column Layout for larger screens */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Spending Chart */}
        <SpendingChart transactions={transactions} />

        {/* Internal Balance (only if paired) */}
        {isPaired && <InternalBalance />}
      </div>

      {/* Recent Transactions */}
      <RecentTransactions
        transactions={transactions}
        categories={categories}
        limit={5}
      />
    </div>
  );
};

export default Dashboard;

