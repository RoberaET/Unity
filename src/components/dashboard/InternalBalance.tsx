import { useFinance } from '@/contexts/FinanceContext';
import { ArrowRight, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function InternalBalance() {
  const { user, partner, internalBalance, isPaired } = useFinance();

  if (!isPaired || !partner) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(Math.abs(amount));
  };

  const owesPartner = internalBalance > 0;
  const isSettled = internalBalance === 0;

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-5 w-5 text-accent" />
        <h3 className="font-semibold text-foreground">Internal Balance</h3>
      </div>
      
      {isSettled ? (
        <div className="text-center py-4">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-success/10 mb-2">
            <span className="text-2xl">🎉</span>
          </div>
          <p className="text-success font-medium">All settled up!</p>
          <p className="text-sm text-muted-foreground mt-1">No debts between you two</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-partner-a/20 flex items-center justify-center text-sm font-bold text-primary">
                {owesPartner ? user?.name.charAt(0) : partner.name.charAt(0)}
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="h-10 w-10 rounded-full bg-partner-b/20 flex items-center justify-center text-sm font-bold text-partner-b">
                {owesPartner ? partner.name.charAt(0) : user?.name.charAt(0)}
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(internalBalance)}
              </p>
              <p className="text-sm text-muted-foreground">
                {owesPartner ? 'You owe' : 'Owes you'}
              </p>
            </div>
          </div>
          
          <Button variant="outline" className="w-full">
            Settle Up
          </Button>
        </>
      )}
    </div>
  );
}
