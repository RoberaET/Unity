import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Debt } from '@/types/finance';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency } from '@/lib/utils/currency';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';

interface DebtDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    debt: Debt | null;
}

export function DebtDetailsDialog({ isOpen, onClose, debt }: DebtDetailsDialogProps) {
    const { debtPayments } = useFinance();

    if (!debt) return null;

    const payments = debtPayments
        .filter(p => p.debtId === debt.id)
        .sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());

    const progress = ((debt.totalAmount - debt.remainingAmount) / debt.totalAmount) * 100;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
                <div className="p-6 pb-4 border-b bg-muted/20">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">{debt.name}</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Remaining</p>
                            <p className="text-2xl font-bold text-primary">
                                {formatCurrency(debt.remainingAmount, debt.currency)}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">Total Loan</p>
                            <p className="text-lg font-medium">
                                {formatCurrency(debt.totalAmount, debt.currency)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto">
                    {/* Details Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <Card>
                            <CardContent className="p-3">
                                <p className="text-xs text-muted-foreground uppercase">Due Date</p>
                                <p className="font-medium">
                                    {debt.dueDate ? format(new Date(debt.dueDate), 'MMM d, yyyy') : 'No due date'}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-3">
                                <p className="text-xs text-muted-foreground uppercase">Interest Rate</p>
                                <p className="font-medium">
                                    {debt.interestRate ? `${debt.interestRate}%` : '0%'}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Payment History */}
                    <div>
                        <h4 className="font-semibold mb-3">Payment History</h4>
                        {payments.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4 bg-secondary/20 rounded-lg">
                                No payments recorded yet
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {payments.map(payment => (
                                    <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                                        <div className="flex flex-col">
                                            <span className="font-medium">Payment Received</span>
                                            <span className="text-xs text-muted-foreground">
                                                {format(new Date(payment.paidAt), 'MMM d, yyyy')}
                                            </span>
                                        </div>
                                        <span className="font-bold text-emerald-600">
                                            -{formatCurrency(payment.amount, debt.currency)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
