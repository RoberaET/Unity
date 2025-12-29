import { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import {
  HandCoins,
  TrendingUp,
  TrendingDown,
  Plus,
  ChevronRight,
  Calendar,
  Users,

  ExternalLink,
  Eye,
  CreditCard,
  Trash2,
  AlertCircle
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Debt } from '@/types/finance';
import { AddDebtDialog } from '@/components/debts/AddDebtDialog';
import { RecordPaymentDialog } from '@/components/debts/RecordPaymentDialog';
import { DebtDetailsDialog } from '@/components/debts/DebtDetailsDialog';

const Debts = () => {
  const { debts, internalBalance, user, partner, isPaired, deleteDebt } = useFinance();
  const [selectedType, setSelectedType] = useState<'all' | Debt['type']>('all');
  const [isAddDebtOpen, setIsAddDebtOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [paymentDebt, setPaymentDebt] = useState<Debt | null>(null);
  const [debtToDelete, setDebtToDelete] = useState<Debt | null>(null);

  const filteredDebts = debts.filter(d => {
    if (selectedType === 'all') return true;
    return d.type === selectedType;
  });

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const totalWeOwe = debts
    .filter(d => d.type === 'we_owe')
    .reduce((sum, d) => sum + d.remainingAmount, 0);

  const totalOwedToUs = debts
    .filter(d => d.type === 'owed_to_us')
    .reduce((sum, d) => sum + d.remainingAmount, 0);

  const getDebtIcon = (type: Debt['type']) => {
    switch (type) {
      case 'we_owe':
        return TrendingDown;
      case 'owed_to_us':
        return TrendingUp;
      case 'internal':
        return Users;
    }
  };

  const getDebtColor = (type: Debt['type']) => {
    switch (type) {
      case 'we_owe':
        return 'text-expense';
      case 'owed_to_us':
        return 'text-income';
      case 'internal':
        return 'text-accent';
    }
  };

  const getDebtBgColor = (type: Debt['type']) => {
    switch (type) {
      case 'we_owe':
        return 'bg-expense/10';
      case 'owed_to_us':
        return 'bg-income/10';
      case 'internal':
        return 'bg-accent/10';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <AddDebtDialog
        isOpen={isAddDebtOpen}
        onClose={() => setIsAddDebtOpen(false)}
      />
      <RecordPaymentDialog
        isOpen={!!paymentDebt}
        onClose={() => setPaymentDebt(null)}
        debt={paymentDebt}
      />
      <DebtDetailsDialog
        isOpen={!!selectedDebt}
        onClose={() => setSelectedDebt(null)}
        debt={selectedDebt}
      />

      <AlertDialog open={!!debtToDelete} onOpenChange={() => setDebtToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the debt
              "{debtToDelete?.name}" and all its payment history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (debtToDelete) {
                  deleteDebt(debtToDelete.id);
                  setDebtToDelete(null);
                  toast.success("Debt deleted successfully");
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Debts & Lending</h2>
          <p className="text-muted-foreground">Track what you owe and what others owe you</p>
        </div>
        <Button
          onClick={() => setIsAddDebtOpen(true)}
          className="gradient-primary text-primary-foreground gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Debt
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-rose-950 border-rose-900">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-full bg-rose-900/50 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-rose-100" />
              </div>
              <span className="text-sm font-medium text-rose-200">We Owe</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(totalWeOwe)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-emerald-950 border-emerald-900">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-full bg-emerald-900/50 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-emerald-100" />
              </div>
              <span className="text-sm font-medium text-emerald-200">Owed to Us</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(totalOwedToUs)}
            </p>
          </CardContent>
        </Card>

        {isPaired && (
          <Card className="bg-accent/5 border-accent/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <Users className="h-5 w-5 text-accent" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Internal Balance</span>
              </div>
              <p className="text-2xl font-bold text-accent">
                {internalBalance === 0 ? 'Settled' : formatCurrency(Math.abs(internalBalance))}
              </p>
              {internalBalance !== 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  {internalBalance > 0 ? `${user?.name} owes ${partner?.name}` : `${partner?.name} owes ${user?.name}`}
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Type Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { value: 'all', label: 'All Debts' },
          { value: 'we_owe', label: 'We Owe' },
          { value: 'owed_to_us', label: 'Owed to Us' },
          { value: 'internal', label: 'Internal' },
        ].map((filter) => (
          <button
            key={filter.value}
            onClick={() => setSelectedType(filter.value as typeof selectedType)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
              selectedType === filter.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Debts List */}
      <div className="space-y-4">
        {filteredDebts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <HandCoins className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No debts found</p>
              <Button variant="outline" className="mt-4">
                Add Your First Debt
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredDebts.map((debt) => {
            const Icon = getDebtIcon(debt.type);
            const progress = ((debt.totalAmount - debt.remainingAmount) / debt.totalAmount) * 100;
            const paidAmount = debt.totalAmount - debt.remainingAmount;

            const isWeOwe = debt.type === 'we_owe';
            const cardBg = isWeOwe ? 'bg-rose-950 border-rose-900' : 'bg-emerald-950 border-emerald-900';
            const textColor = 'text-white';
            const subTextColor = isWeOwe ? 'text-rose-200' : 'text-emerald-200';
            const iconBg = isWeOwe ? 'bg-rose-900/50' : 'bg-emerald-900/50';
            const iconColor = isWeOwe ? 'text-rose-100' : 'text-emerald-100';
            const progressClassName = isWeOwe ? 'bg-rose-900' : 'bg-emerald-900';
            const indicatorClassName = isWeOwe ? 'bg-rose-400' : 'bg-emerald-400';

            return (
              <Card key={debt.id} className={cn("overflow-hidden hover:shadow-lg transition-all", cardBg)}>
                <CardContent className="p-0">
                  <div className="flex items-start gap-4 p-4">
                    <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center shrink-0', iconBg)}>
                      <Icon className={cn('h-6 w-6', iconColor)} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className={cn("font-semibold text-lg", textColor)}>{debt.name}</h4>
                          {debt.externalName && (
                            <p className={cn("text-sm flex items-center gap-1", subTextColor)}>
                              <ExternalLink className="h-3 w-3" />
                              {debt.externalName}
                            </p>
                          )}
                        </div>
                        <ChevronRight className={cn("h-5 w-5 shrink-0", subTextColor)} />
                      </div>

                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className={subTextColor}>
                            {formatCurrency(paidAmount)} paid
                          </span>
                          <span className={cn("font-medium", textColor)}>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className={cn("h-2", progressClassName)} indicatorClassName={indicatorClassName} />
                      </div>

                      <div className={cn("flex items-center gap-4 mt-3 text-sm", subTextColor)}>
                        <span className={cn('font-bold', textColor)}>
                          {formatCurrency(debt.remainingAmount)} remaining
                        </span>
                        {debt.dueDate && (
                          <span className="flex items-center gap-1 opacity-80">
                            <Calendar className="h-3.5 w-3.5" />
                            {format(new Date(debt.dueDate), 'MMM d')}
                          </span>
                        )}
                        {debt.interestRate && (
                          <span className="opacity-80">{debt.interestRate}% APR</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className={cn("px-4 py-3 flex items-center justify-between gap-2", isWeOwe ? "bg-rose-900/20" : "bg-emerald-900/20")}>
                    <div className="flex gap-2 w-full">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn("flex-1 h-9 hover:bg-white/10", subTextColor, "hover:text-white")}
                        onClick={() => setSelectedDebt(debt)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Details
                      </Button>
                      <Button
                        size="sm"
                        className={cn(
                          "flex-1 h-9 shadow-sm transition-all border-0",
                          debt.remainingAmount <= 0
                            ? "bg-white/10 text-white/50"
                            : isWeOwe
                              ? "bg-rose-500 hover:bg-rose-400 text-white"
                              : "bg-emerald-500 hover:bg-emerald-400 text-white"
                        )}
                        onClick={() => setPaymentDebt(debt)}
                        disabled={debt.remainingAmount <= 0}
                      >
                        {isWeOwe ? <CreditCard className="w-4 h-4 mr-2" /> : <HandCoins className="w-4 h-4 mr-2" />}
                        {debt.remainingAmount <= 0 ? 'Settled' : (isWeOwe ? 'Pay' : 'Receive')}
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn("h-9 w-9 hover:bg-white/10", subTextColor, "hover:text-red-400")}
                      onClick={() => setDebtToDelete(debt)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Debts;
