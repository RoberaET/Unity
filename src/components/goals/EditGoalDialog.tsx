import { useState, useEffect } from 'react';
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
import { toast } from 'sonner';
import { Goal } from '@/types/finance';

interface EditGoalDialogProps {
    isOpen: boolean;
    onClose: () => void;
    goal: Goal | null;
}

const GOAL_ICONS = [
    '🏠', '🚗', '✈️', '🛡️', '💰', '🎓', '💍', '🎮', '📱', '🏖️', '🎸', '🏥'
];

const GOAL_COLORS = [
    '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#14b8a6', '#06b6d4', '#f59e0b'
];

export function EditGoalDialog({ isOpen, onClose, goal }: EditGoalDialogProps) {
    const { updateGoal } = useFinance();
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [targetDate, setTargetDate] = useState('');
    const [selectedIcon, setSelectedIcon] = useState(GOAL_ICONS[0]);
    const [selectedColor, setSelectedColor] = useState(GOAL_COLORS[0]);

    useEffect(() => {
        if (goal) {
            setName(goal.name);
            setTargetAmount(goal.targetAmount.toString());
            setTargetDate(goal.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : '');
            setSelectedIcon(goal.icon);
            setSelectedColor(goal.color);
        }
    }, [goal]);

    if (!goal) return null;

    const handleSubmit = () => {
        if (!name.trim() || !targetAmount || parseFloat(targetAmount) <= 0) {
            toast.error('Please fill in all required fields');
            return;
        }

        const newTargetAmount = parseFloat(targetAmount);
        if (newTargetAmount < goal.currentAmount) {
            toast.error('Target amount cannot be less than current savings');
            return;
        }

        updateGoal(goal.id, {
            name: name.trim(),
            targetAmount: newTargetAmount,
            targetDate: targetDate ? new Date(targetDate) : undefined,
            icon: selectedIcon,
            color: selectedColor,
        });

        toast.success('Goal updated successfully!');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Edit Goal</DialogTitle>
                    <DialogDescription>
                        Update your savings goal details
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Goal Name */}
                    <div className="space-y-2">
                        <Label htmlFor="goal-name">Goal Name *</Label>
                        <Input
                            id="goal-name"
                            placeholder="e.g., Vacation, New Car, Emergency Fund"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    {/* Target Amount */}
                    <div className="space-y-2">
                        <Label htmlFor="target-amount">Target Amount *</Label>
                        <Input
                            id="target-amount"
                            type="number"
                            placeholder="0.00"
                            min={goal.currentAmount}
                            step="0.01"
                            value={targetAmount}
                            onChange={(e) => setTargetAmount(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Minimum: {new Intl.NumberFormat('en-US', { style: 'currency', currency: goal.currency }).format(goal.currentAmount)} (current savings)
                        </p>
                    </div>

                    {/* Target Date */}
                    <div className="space-y-2">
                        <Label htmlFor="target-date">Target Date (Optional)</Label>
                        <Input
                            id="target-date"
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            value={targetDate}
                            onChange={(e) => setTargetDate(e.target.value)}
                        />
                    </div>

                    {/* Icon Picker */}
                    <div className="space-y-2">
                        <Label>Icon</Label>
                        <div className="grid grid-cols-6 gap-2">
                            {GOAL_ICONS.map((icon) => (
                                <button
                                    key={icon}
                                    type="button"
                                    onClick={() => setSelectedIcon(icon)}
                                    className={`p-3 text-2xl rounded-lg border-2 transition-all hover:scale-110 ${selectedIcon === icon
                                            ? 'border-primary bg-primary/10'
                                            : 'border-border hover:border-primary/50'
                                        }`}
                                >
                                    {icon}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Color Picker */}
                    <div className="space-y-2">
                        <Label>Color</Label>
                        <div className="flex gap-2 flex-wrap">
                            {GOAL_COLORS.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setSelectedColor(color)}
                                    className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-110 ${selectedColor === color
                                            ? 'border-foreground scale-110'
                                            : 'border-border'
                                        }`}
                                    style={{ backgroundColor: color }}
                                    aria-label={`Select color ${color}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} className="gradient-primary">
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
