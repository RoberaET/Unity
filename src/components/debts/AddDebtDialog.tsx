import { useState } from 'react';
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
import { cn } from '@/lib/utils';
import { TrendingDown, TrendingUp, Calendar as CalendarIcon, Wallet, Percent, User as UserIcon } from 'lucide-react';

interface AddDebtDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AddDebtDialog({ isOpen, onClose }: AddDebtDialogProps) {
    const { addDebt } = useFinance();
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<Debt['type']>('we_owe');
    const [externalName, setExternalName] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [interestRate, setInterestRate] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !amount) {
            toast.error('Please fill in name and amount');
            return;
        }

        addDebt({
            name,
            totalAmount: parseFloat(amount),
            remainingAmount: parseFloat(amount),
            type,
            currency: 'USD',
            externalName: externalName || undefined,
            dueDate: dueDate ? new Date(dueDate) : undefined,
            interestRate: interestRate ? parseFloat(interestRate) : undefined,
        });

        toast.success('Debt added successfully');
        handleClose();
    };

    const handleClose = () => {
        setName('');
        setAmount('');
        setType('we_owe');
        setExternalName('');
        setDueDate('');
        setInterestRate('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px] bg-background border-border shadow-lg">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        {type === 'we_owe' ? <TrendingDown className="text-rose-500 h-5 w-5" /> : <TrendingUp className="text-emerald-500 h-5 w-5" />}
                        Add New Debt
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-2">
                    {/* Type Selection */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setType('we_owe')}
                            className={cn(
                                "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2",
                                type === 'we_owe'
                                    ? "border-rose-500 bg-rose-500/10 text-rose-700"
                                    : "border-border hover:border-rose-200 hover:bg-rose-50/50 text-muted-foreground"
                            )}
                        >
                            <TrendingDown className="h-6 w-6" />
                            <span className="font-semibold text-sm">We Owe</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('owed_to_us')}
                            className={cn(
                                "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2",
                                type === 'owed_to_us'
                                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-700"
                                    : "border-border hover:border-emerald-200 hover:bg-emerald-50/50 text-muted-foreground"
                            )}
                        >
                            <TrendingUp className="h-6 w-6" />
                            <span className="font-semibold text-sm">Owed to Us</span>
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Amount & Name */}
                        <div className="grid grid-cols-1 gap-4">
                            <div className="relative">
                                <Label htmlFor="amount" className="sr-only">Amount</Label>
                                <div className="relative">
                                    <span className={cn(
                                        "absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold",
                                        type === 'we_owe' ? "text-rose-500" : "text-emerald-500"
                                    )}>$</span>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="pl-7 h-14 text-2xl font-bold bg-secondary/20"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="name" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</Label>
                                <div className="relative">
                                    <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        placeholder="e.g. Car Loan, Dinner Split"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="externalName" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    {type === 'we_owe' ? 'Lender' : 'Borrower'}
                                </Label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="externalName"
                                        placeholder="Name (Optional)"
                                        value={externalName}
                                        onChange={(e) => setExternalName(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="dueDate" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Due Date</Label>
                                <div className="relative">
                                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="dueDate"
                                        type="date"
                                        min={new Date().toISOString().split('T')[0]}
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5 col-span-2">
                                <Label htmlFor="interestRate" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Interest Rate (Annual %)</Label>
                                <div className="relative">
                                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="interestRate"
                                        type="number"
                                        step="0.1"
                                        placeholder="0.0%"
                                        value={interestRate}
                                        onChange={(e) => setInterestRate(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={handleClose} className="flex-1 h-11">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className={cn(
                                "flex-1 h-11 text-white font-medium shadow-md transition-all",
                                type === 'we_owe'
                                    ? "bg-rose-600 hover:bg-rose-700 shadow-rose-500/20"
                                    : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
                            )}
                        >
                            {type === 'we_owe' ? 'Add Liability' : 'Add Asset'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
