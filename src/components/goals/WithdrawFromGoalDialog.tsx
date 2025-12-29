import { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Goal } from '@/types/finance';
import { AlertCircle } from 'lucide-react';

interface WithdrawFromGoalDialogProps {
    isOpen: boolean;
    onClose: () => void;
    goal: Goal | null;
}

export function WithdrawFromGoalDialog({ isOpen, onClose, goal }: WithdrawFromGoalDialogProps) {
    const { wallets, withdrawFromGoal } = useFinance();
    const [amount, setAmount] = useState('');
    const [selectedWallet, setSelectedWallet] = useState('');
    const [note, setNote] = useState('');

    if (!goal) return null;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: goal.currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const handleWithdraw = () => {
        const withdrawalAmount = parseFloat(amount);

        if (!selectedWallet) {
            toast.error('Please select a wallet');
            return;
        }

        if (!amount || withdrawalAmount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        if (withdrawalAmount > goal.currentAmount) {
            toast.error('Withdrawal amount exceeds available funds');
            return;
        }

        withdrawFromGoal(goal.id, withdrawalAmount, selectedWallet, note || undefined);
        toast.success(`${formatCurrency(withdrawalAmount)} withdrawn from ${goal.name}`);
        handleClose();
    };

    const handleClose = () => {
        setAmount('');
        setSelectedWallet('');
        setNote('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                        <span className="text-2xl">{goal.icon}</span>
                        Withdraw from {goal.name}
                    </DialogTitle>
                    <DialogDescription>
                        Take funds back from this savings goal
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Warning */}
                    <div className="flex gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <p className="font-medium text-yellow-900 dark:text-yellow-200">
                                Withdrawing funds will reduce your progress
                            </p>
                            <p className="text-yellow-800 dark:text-yellow-300 mt-1">
                                Available: {formatCurrency(goal.currentAmount)}
                            </p>
                        </div>
                    </div>

                    {/* Select Wallet */}
                    <div className="space-y-2">
                        <Label htmlFor="wallet">To Wallet *</Label>
                        <Select value={selectedWallet} onValueChange={setSelectedWallet}>
                            <SelectTrigger id="wallet">
                                <SelectValue placeholder="Choose a wallet" />
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

                    {/* Amount Input */}
                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount *</Label>
                        <Input
                            id="amount"
                            type="number"
                            placeholder="0.00"
                            min="0"
                            max={goal.currentAmount}
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />

                        {/* Quick Amount Buttons */}
                        <div className="flex gap-2 flex-wrap">
                            {[
                                Math.min(goal.currentAmount * 0.25, goal.currentAmount),
                                Math.min(goal.currentAmount * 0.5, goal.currentAmount),
                                Math.min(goal.currentAmount * 0.75, goal.currentAmount),
                                goal.currentAmount
                            ].map((value, index) => (
                                <Button
                                    key={index}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setAmount(value.toFixed(2))}
                                    className="text-xs"
                                    disabled={value <= 0}
                                >
                                    {index === 3 ? 'All' : `${(index + 1) * 25}%`} ({formatCurrency(value)})
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Note */}
                    <div className="space-y-2">
                        <Label htmlFor="note">Reason (Optional)</Label>
                        <Input
                            id="note"
                            placeholder="e.g., Emergency expense, changed plans..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleWithdraw} variant="destructive">
                        Withdraw
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
