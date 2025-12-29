import { useState, useEffect } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Debt } from '@/types/finance';
import { formatCurrency } from '@/lib/utils/currency';
import { CheckCircle2 } from 'lucide-react';

interface RecordPaymentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    debt: Debt | null;
}

export function RecordPaymentDialog({ isOpen, onClose, debt }: RecordPaymentDialogProps) {
    const { addDebtPayment } = useFinance();
    const [amount, setAmount] = useState('');

    // Pre-fill amount if near payoff? Or just empty.
    // Empty is safer.

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!debt || !amount) return;

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            toast.error('Invalid amount');
            return;
        }

        if (numAmount > debt.remainingAmount) {
            toast.error('Payment cannot exceed remaining debt');
            return;
        }

        addDebtPayment(debt.id, numAmount);
        toast.success('Payment recorded successfully');
        handleClose();
    };

    const handleClose = () => {
        setAmount('');
        onClose();
    };

    if (!debt) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CheckCircle2 className="text-primary h-5 w-5" />
                        Record Payment
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4">
                    <div className="bg-secondary/30 p-4 rounded-lg mb-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Debt</span>
                            <span className="font-medium">{debt.name}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Remaining</span>
                            <span className="font-medium">{formatCurrency(debt.remainingAmount, debt.currency)}</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Payment Amount</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">$</span>
                                <Input
                                    id="amount"
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="pl-7 text-lg font-semibold"
                                    max={debt.remainingAmount}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                                Cancel
                            </Button>
                            <Button type="submit" className="flex-1 gradient-primary text-primary-foreground">
                                Confirm Payment
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
