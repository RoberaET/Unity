import { useFinance } from '@/contexts/FinanceContext';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Goal } from '@/types/finance';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { Calendar, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

interface GoalDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    goal: Goal | null;
    onEdit?: () => void;
    onContribute?: () => void;
    onWithdraw?: () => void;
    onDelete?: () => void;
}

export function GoalDetailsDialog({
    isOpen,
    onClose,
    goal,
    onEdit,
    onContribute,
    onWithdraw,
    onDelete,
}: GoalDetailsDialogProps) {
    const { goalContributions } = useFinance();

    if (!goal) return null;

    const progress = (goal.currentAmount / goal.targetAmount) * 100;
    const remaining = goal.targetAmount - goal.currentAmount;
    const isComplete = progress >= 100;

    const contributions = goalContributions
        .filter(c => c.goalId === goal.id)
        .sort((a, b) => new Date(b.contributedAt).getTime() - new Date(a.contributedAt).getTime());

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: goal.currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                        <span className="text-3xl">{goal.icon}</span>
                        {goal.name}
                    </DialogTitle>
                    <DialogDescription>
                        Goal details and contribution history
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Progress Section */}
                    <div className="p-4 rounded-lg border border-border bg-secondary/30">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-semibold">Progress</h3>
                            {isComplete && (
                                <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                                    🎉 Completed!
                                </span>
                            )}
                        </div>
                        <Progress value={Math.min(progress, 100)} className="h-3 mb-2" />
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-primary">{formatCurrency(goal.currentAmount)}</span>
                            <span className="text-muted-foreground">{Math.round(progress)}%</span>
                            <span className="font-medium">{formatCurrency(goal.targetAmount)}</span>
                        </div>
                        {!isComplete && (
                            <p className="text-sm text-center mt-2 text-muted-foreground">
                                {formatCurrency(remaining)} remaining to reach your goal
                            </p>
                        )}
                    </div>

                    {/* Goal Info */}
                    <div className="grid grid-cols-2 gap-4">
                        {goal.targetDate && (
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-muted-foreground">Target Date</p>
                                    <p className="font-medium">{format(new Date(goal.targetDate), 'MMM d, yyyy')}</p>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-muted-foreground">Total Saved</p>
                                <p className="font-medium">{formatCurrency(goal.currentAmount)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Contribution History */}
                    <div>
                        <h3 className="font-semibold mb-3">Contribution History</h3>
                        {contributions.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-6">
                                No contributions yet. Start saving to reach your goal!
                            </p>
                        ) : (
                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                {contributions.map((contribution) => (
                                    <div
                                        key={contribution.id}
                                        className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${contribution.type === 'contribution'
                                                    ? 'bg-emerald-500/10 text-emerald-500'
                                                    : 'bg-rose-500/10 text-rose-500'
                                                }`}>
                                                {contribution.type === 'contribution' ? (
                                                    <TrendingUp className="h-4 w-4" />
                                                ) : (
                                                    <TrendingDown className="h-4 w-4" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {contribution.type === 'contribution' ? 'Contribution' : 'Withdrawal'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {format(new Date(contribution.contributedAt), 'MMM d, yyyy h:mm a')}
                                                </p>
                                                {contribution.note && (
                                                    <p className="text-xs text-muted-foreground italic mt-1">
                                                        {contribution.note}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <span className={`font-semibold ${contribution.type === 'contribution'
                                                ? 'text-emerald-600 dark:text-emerald-400'
                                                : 'text-rose-600 dark:text-rose-400'
                                            }`}>
                                            {contribution.type === 'contribution' ? '+' : '-'}
                                            {formatCurrency(contribution.amount)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                        {!isComplete && onContribute && (
                            <Button
                                onClick={() => {
                                    onClose();
                                    onContribute();
                                }}
                                className="gradient-primary"
                            >
                                Add Funds
                            </Button>
                        )}
                        {goal.currentAmount > 0 && onWithdraw && (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    onClose();
                                    onWithdraw();
                                }}
                            >
                                Withdraw
                            </Button>
                        )}
                        {onEdit && (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    onClose();
                                    onEdit();
                                }}
                            >
                                Edit Goal
                            </Button>
                        )}
                        {onDelete && (
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    onClose();
                                    onDelete();
                                }}
                            >
                                Delete Goal
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
