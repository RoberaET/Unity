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
import { Progress } from '@/components/ui/progress';

interface ContributeToGoalDialogProps {
    isOpen: boolean;
    onClose: () => void;
    goal: Goal | null;
}

export function ContributeToGoalDialog({ isOpen, onClose, goal }: ContributeToGoalDialogProps) {
    const { wallets, contributeToGoal } = useFinance();
    const [amount, setAmount] = useState('');
    const [selectedWallet, setSelectedWallet] = useState('');
    const [note, setNote] = useState('');

    if (!goal) return null;

    const remaining = goal.targetAmount - goal.currentAmount;
    const progress = (goal.currentAmount / goal.targetAmount) * 100;
    const newProgress = ((goal.currentAmount + parseFloat(amount || '0')) / goal.targetAmount) * 100;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: goal.currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const handleContribute = () => {
        const contributionAmount = parseFloat(amount);

        if (!selectedWallet) {
            toast.error('Please select a wallet');
            return;
        }

        if (!amount || contributionAmount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        const wallet = wallets.find(w => w.id === selectedWallet);
        if (wallet && wallet.balance < contributionAmount) {
            toast.error('Insufficient funds in selected wallet');
            return;
        }

        contributeToGoal(goal.id, contributionAmount, selectedWallet, note || undefined);
        toast.success(`${formatCurrency(contributionAmount)} added to ${goal.name}!`);
        handleClose();
    };

    const handleClose = () => {
        setAmount('');
        setSelectedWallet('');
        setNote('');
        onClose();
    };

    const handleQuickAmount = (value: number) => {
        setAmount(value.toString());
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                        <span className="text-2xl">{goal.icon}</span>
                        Contribute to {goal.name}
                    </DialogTitle>
                    <DialogDescription>
                        Add funds from your wallet to this savings goal
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Goal Progress */}
                    <div className="p-4 rounded-lg border border-border bg-secondary/30">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium">Current Progress</span>
                            <span className="text-muted-foreground">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2 mb-2" />
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{formatCurrency(goal.currentAmount)}</span>
                            <span className="text-muted-foreground">{formatCurrency(goal.targetAmount)}</span>
                        </div>
                        <p className="text-sm text-center mt-2 font-medium text-primary">
                            {formatCurrency(remaining)} remaining
                        </p>
                    </div>

                    {/* Select Wallet */}
                    <div className="space-y-2">
                        <Label htmlFor="wallet">From Wallet *</Label>
                        <Select value={selectedWallet} onValueChange={setSelectedWallet}>
                            <SelectTrigger id="wallet">
                                <SelectValue placeholder="Choose a wallet" />
                            </SelectTrigger>
                            <SelectContent>
                                {wallets.filter(w => w.balance > 0).map((wallet) => (
                                    <SelectItem key={wallet.id} value={wallet.id}>
                                        {wallet.name} ({formatCurrency(wallet.balance)} available)
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
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />

                        {/* Quick Amount Buttons */}
                        <div className="flex gap-2 flex-wrap">
                            {[10, 25, 50, 100, Math.min(remaining, 500)].map((value) => (
                                <Button
                                    key={value}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleQuickAmount(value)}
                                    className="text-xs"
                                >
                                    +{formatCurrency(value)}
                                </Button>
                            ))}
                            {remaining > 0 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleQuickAmount(remaining)}
                                    className="text-xs font-medium"
                                >
                                    Complete Goal
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* New Progress Preview */}
                    {amount && parseFloat(amount) > 0 && (
                        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                            <p className="text-sm font-medium mb-2">New Progress Preview</p>
                            <Progress value={Math.min(newProgress, 100)} className="h-2 mb-1" />
                            <p className="text-sm text-center text-primary font-medium">
                                {Math.round(Math.min(newProgress, 100))}% complete
                            </p>
                        </div>
                    )}

                    {/* Note */}
                    <div className="space-y-2">
                        <Label htmlFor="note">Note (Optional)</Label>
                        <Input
                            id="note"
                            placeholder="e.g., Birthday gift, salary bonus..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleContribute} className="gradient-primary">
                        Contribute
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
