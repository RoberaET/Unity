import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFinance } from '@/contexts/FinanceContext';
import { TransactionType, SplitType } from '@/types/finance';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils/currency';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Users } from 'lucide-react';
import { toast } from 'sonner';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const transactionTypes: { value: TransactionType; label: string; icon: typeof ArrowDownLeft; color: string }[] = [
  { value: 'income', label: 'Income', icon: ArrowDownLeft, color: 'text-income' },
  { value: 'expense', label: 'Expense', icon: ArrowUpRight, color: 'text-expense' },
  { value: 'transfer', label: 'Transfer', icon: ArrowLeftRight, color: 'text-primary' },
];

export function AddTransactionModal({ isOpen, onClose }: AddTransactionModalProps) {
  const { wallets, categories, addTransaction, isPaired } = useFinance();
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [walletId, setWalletId] = useState('');
  const [destinationWalletId, setDestinationWalletId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [splitType, setSplitType] = useState<SplitType>('equal');
  const [notes, setNotes] = useState('');
  const [showSplit, setShowSplit] = useState(false);

  // Set default wallet when modal opens or wallets load
  useEffect(() => {
    if (wallets.length > 0 && !walletId) {
      setWalletId(wallets[0].id);
    }
  }, [wallets, walletId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !walletId) {
      toast.error('Please fill in amount and wallet');
      return;
    }

    // Check for insufficient funds
    if (type === 'expense' || type === 'transfer') {
      const sourceWallet = wallets.find(w => w.id === walletId);
      if (sourceWallet && sourceWallet.balance < parseFloat(amount)) {
        toast.error('Insufficient funds in the selected wallet');
        return;
      }
    }

    if (type !== 'transfer' && (!description || !categoryId)) {
      toast.error('Please fill in description and category');
      return;
    }

    if (type === 'transfer' && !destinationWalletId) {
      toast.error('Please select a destination wallet');
      return;
    }

    if (type === 'transfer' && walletId === destinationWalletId) {
      toast.error('Source and destination wallets cannot be the same');
      return;
    }

    // Auto-generate description for transfers
    let finalDescription = description;
    let finalCategoryId = categoryId;

    if (type === 'transfer') {
      const destWallet = wallets.find(w => w.id === destinationWalletId);
      finalDescription = `Transfer to ${destWallet?.name || 'Wallet'}`;
      finalCategoryId = 'transfer'; // Or leave empty/handle in context
    }

    addTransaction({
      walletId,
      destinationWalletId: type === 'transfer' ? destinationWalletId : undefined,
      type,
      amount: parseFloat(amount),
      currency: 'USD',
      categoryId: finalCategoryId,
      description: finalDescription,
      date: new Date(),
      createdBy: 'user1',
      splitType: (showSplit && type === 'expense') ? splitType : undefined,
      isRecurring: false,
      notes: notes || undefined,
    });

    toast.success('Transaction added successfully');
    handleClose();
  };

  const handleClose = () => {
    setType('expense');
    setAmount('');
    setDescription('');
    setDestinationWalletId('');
    setCategoryId('');
    setNotes('');
    setShowSplit(false);
    onClose();
  };

  const availableDestinations = wallets.filter(w => w.id !== walletId);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Transaction Type */}
          <div className="flex gap-2">
            {transactionTypes.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className={cn(
                  'flex-1 flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all',
                  type === t.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <t.icon className={cn('h-4 w-4', t.color)} />
                <span className="text-xs font-medium">{t.label}</span>
              </button>
            ))}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-xs">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onBlur={() => {
                  if ((type === 'expense' || type === 'transfer') && amount) {
                    const wallet = wallets.find(w => w.id === walletId);
                    if (wallet && parseFloat(amount) > wallet.balance) {
                      setAmount(wallet.balance.toString());
                      toast.warning(`Amount adjusted to available balance: ${formatCurrency(wallet.balance, wallet.currency)}`);
                    }
                  }
                }}
                className="pl-7 text-xl font-semibold h-10"
              />
            </div>
          </div>

          {/* Description (Hidden for Transfers) */}
          {type !== 'transfer' && (
            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs">Description</Label>
              <Input
                id="description"
                placeholder="What was this for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-9"
              />
            </div>
          )}

          {/* Wallets */}
          <div className={cn("grid gap-3", type === 'transfer' ? "grid-cols-2" : "grid-cols-2")}>
            <div className="space-y-2">
              <Label className="text-xs">{type === 'transfer' ? 'From Wallet' : 'Wallet'}</Label>
              <Select value={walletId} onValueChange={setWalletId}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select wallet" />
                </SelectTrigger>
                <SelectContent>
                  {wallets.map((wallet) => (
                    <SelectItem key={wallet.id} value={wallet.id}>
                      {wallet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Destination Wallet (Only for Transfers) */}
            {type === 'transfer' ? (
              <div className="space-y-2">
                <Label className="text-xs">To Wallet</Label>
                <Select value={destinationWalletId} onValueChange={setDestinationWalletId}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDestinations.map((wallet) => (
                      <SelectItem key={wallet.id} value={wallet.id}>
                        {wallet.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              /* Category (Hidden for Transfers) */
              <div className="space-y-2">
                <Label className="text-xs">Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Split Toggle (only if paired AND expense) */}
          {isPaired && type === 'expense' && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowSplit(!showSplit)}
                className={cn(
                  'w-full flex items-center justify-between p-2 rounded-lg border transition-all h-9',
                  showSplit ? 'border-primary bg-primary/5' : 'border-border'
                )}
              >
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium">Split with partner</span>
                </div>
                <div className={cn(
                  'h-4 w-7 rounded-full transition-colors relative',
                  showSplit ? 'bg-primary' : 'bg-muted'
                )}>
                  <div className={cn(
                    'absolute top-0.5 h-3 w-3 rounded-full bg-card transition-transform',
                    showSplit ? 'left-[calc(100%-14px)]' : 'left-0.5'
                  )} />
                </div>
              </button>

              {showSplit && (
                <Select value={splitType} onValueChange={(v) => setSplitType(v as SplitType)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equal">50/50 Split</SelectItem>
                    <SelectItem value="custom">Custom Split</SelectItem>
                    <SelectItem value="income_based">Income-based Split</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-xs">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="min-h-[60px]"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1 h-9">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 gradient-primary text-primary-foreground h-9">
              {type === 'transfer' ? 'Transfer Funds' : 'Add Transaction'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
