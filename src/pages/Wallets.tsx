import { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { useAuth } from '@/contexts/AuthContext';
import { Wallet, Users, Plus, MoreVertical, TrendingUp, TrendingDown, Lock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { AddWalletDialog } from '@/components/wallet/AddWalletDialog';
import { formatCurrency } from '@/lib/utils/currency';
import { WalletDetailsDialog } from '@/components/wallet/WalletDetailsDialog';
import { Wallet as WalletType } from '@/types/finance';
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

// Map icon IDs back to images
const getWalletIcon = (iconId: string) => {
  const bankLogos: Record<string, string> = {
    'cbe': '/Banks Logo/CBE bank.jpg',
    'awash': '/Banks Logo/awash bank.jpg',
    'wegagen': '/Banks Logo/Wegagen Bank.jpg',
    'dashen': '/Banks Logo/Dashen Bank.jpg',
    'coop': '/Banks Logo/coop bank.jpg',
    'telebirr': '/Banks Logo/Telebirr.jpg',
  };
  return bankLogos[iconId];
};

// Bank-specific background colors/gradients
const getBankBackground = (iconId: string, walletName: string): string => {
  const nameL = walletName.toLowerCase();

  // Check for cash wallet
  if (iconId === 'cash' || nameL.includes('cash')) {
    return '#10b981'; // green
  }

  // Check icon ID first, then fallback to name matching
  if (iconId === 'awash' || nameL.includes('awash')) {
    return 'linear-gradient(135deg, #d97706 0%, #1e3a8a 100%)'; // dark orange to dark blue
  }
  if (iconId === 'coop' || nameL.includes('coop')) {
    return '#2596be'; // eastern blue
  }
  if (iconId === 'telebirr' || nameL.includes('telebirr')) {
    return '#65a30d'; // dark lime
  }
  if (iconId === 'dashen' || nameL.includes('dashen')) {
    return '#1e3a8a'; // dark blue
  }
  if (iconId === 'cbe' || nameL.includes('cbe')) {
    return '#6b21a8'; // dark purple
  }
  if (iconId === 'wegagen' || nameL.includes('wegagen')) {
    return '#d97706'; // dark orange
  }

  // Default fallback
  return 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)';
};

const Wallets = () => {
  const { wallets, transactions, deleteWallet, allTransactions, canEditWallet } = useFinance();
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<'all' | 'personal' | 'shared'>('all');

  // Dialog States
  const [detailsWallet, setDetailsWallet] = useState<WalletType | null>(null);
  const [editWallet, setEditWallet] = useState<WalletType | null>(null);
  const [deleteWalletId, setDeleteWalletId] = useState<string | null>(null);

  // Filter wallets based on selected type
  const filteredWallets = wallets.filter(w => {
    if (selectedType === 'all') return true;
    return w.type === selectedType;
  });

  const getWalletStats = (walletId: string) => {
    const walletTxns = transactions.filter(t => t.walletId === walletId);
    const income = walletTxns
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = walletTxns
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, txnCount: walletTxns.length };
  };

  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);

  const handleDelete = () => {
    if (deleteWalletId) {
      deleteWallet(deleteWalletId);
      toast.success('Wallet deleted successfully');
      setDeleteWalletId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Your Wallets</h2>
          <p className="text-muted-foreground">
            Total: {formatCurrency(totalBalance, user?.currency || 'USD')}
          </p>
        </div>
        <AddWalletDialog trigger={
          <Button className="gradient-primary text-primary-foreground gap-2">
            <Plus className="h-4 w-4" />
            Add Wallet
          </Button>
        } />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: 'all', label: 'All Mine' },
          { value: 'personal', label: 'Personal' },
          { value: 'shared', label: 'Shared' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setSelectedType(tab.value as typeof selectedType)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              selectedType === tab.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Wallet Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredWallets.map((wallet) => {
          const stats = getWalletStats(wallet.id);
          const logo = getWalletIcon(wallet.icon);
          const isPartnerWallet = !canEditWallet(wallet.id);

          return (
            <Card
              key={wallet.id}
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => setDetailsWallet(wallet)}
            >
              <CardHeader
                className="pb-3 relative text-white"
                style={{
                  background: getBankBackground(wallet.icon, wallet.name),
                  backgroundSize: 'cover'
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-12 w-12 rounded-xl flex items-center justify-center overflow-hidden bg-white shadow-md"
                    >
                      {logo ? (
                        <img src={logo} alt={wallet.name} className="h-full w-full object-contain p-1" />
                      ) : (
                        <div style={{ color: wallet.color }}>
                          {wallet.type === 'shared' ? <Users className="h-6 w-6" /> : <Wallet className="h-6 w-6" />}
                        </div>
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg text-white drop-shadow-md">{wallet.name}</CardTitle>
                      <div className="flex gap-1.5 flex-wrap">
                        <span className={cn(
                          'text-xs font-medium px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm'
                        )}>
                          {wallet.type === 'shared' ? 'Shared' : 'Personal'}
                        </span>
                        {isPartnerWallet && (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/80 text-white backdrop-blur-sm flex items-center gap-1">
                            <Eye className="h-3 w-3" /> View Only
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    {!isPartnerWallet ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 hover:bg-white/20 text-white">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditWallet(wallet)}>
                            Edit Wallet
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDetailsWallet(wallet)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteWalletId(wallet.id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 -mr-2 hover:bg-white/20 text-white/60"
                        title="View only - cannot edit partner's wallet"
                      >
                        <Lock className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground mb-4">
                  {formatCurrency(wallet.balance, wallet.currency)}
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-500/10 rounded-lg p-2.5">
                    <div className="flex items-center gap-1.5 text-emerald-600 mb-1">
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium">Income</span>
                    </div>
                    <p className="font-semibold text-sm text-emerald-700">
                      {formatCurrency(stats.income, wallet.currency)}
                    </p>
                  </div>
                  <div className="bg-rose-500/10 rounded-lg p-2.5">
                    <div className="flex items-center gap-1.5 text-rose-600 mb-1">
                      <TrendingDown className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium">Expenses</span>
                    </div>
                    <p className="font-semibold text-sm text-rose-700">
                      {formatCurrency(stats.expense, wallet.currency)}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mt-3">
                  {stats.txnCount} transactions this month
                </p>
              </CardContent>
            </Card>
          );
        })}

        {/* Add Wallet Card */}
        <AddWalletDialog trigger={
          <Card className="border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer h-full min-h-[220px]">
            <CardContent className="flex flex-col items-center justify-center h-full text-muted-foreground hover:text-primary">
              <Plus className="h-10 w-10 mb-2" />
              <p className="font-medium">Add New Wallet</p>
              <p className="text-sm">Create personal or shared</p>
            </CardContent>
          </Card>
        } />
      </div>

      {/* Details Dialog */}
      <WalletDetailsDialog
        wallet={detailsWallet}
        isOpen={!!detailsWallet}
        onClose={() => setDetailsWallet(null)}
        transactions={transactions}
      />

      {/* Edit Dialog */}
      <AddWalletDialog
        open={!!editWallet}
        onOpenChange={(open) => !open && setEditWallet(null)}
        walletToEdit={editWallet || undefined}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteWalletId} onOpenChange={(open) => !open && setDeleteWalletId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this wallet and remove all associated transactions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default Wallets;
