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
import { toast } from 'sonner';
import { Currency } from '@/types/finance';

interface AddGoalDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

const GOAL_ICONS = [
    '🏠', '🚗', '✈️', '🛡️', '💰', '🎓', '💍', '🎮', '📱', '🏖️', '🎸', '🏥'
];

const GOAL_COLORS = [
    '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#14b8a6', '#06b6d4', '#f59e0b'
];

export function AddGoalDialog({ isOpen, onClose }: AddGoalDialogProps) {
    const { addGoal, wallets } = useFinance();
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [targetDate, setTargetDate] = useState('');
    const [selectedIcon, setSelectedIcon] = useState(GOAL_ICONS[0]);
    const [selectedColor, setSelectedColor] = useState(GOAL_COLORS[0]);
    const [currency] = useState<Currency>('USD'); // Default currency

    const handleSubmit = () => {
        if (!name.trim() || !targetAmount || parseFloat(targetAmount) <= 0) {
            toast.error('Please fill in all required fields');
            return;
        }

        addGoal({
            name: name.trim(),
            targetAmount: parseFloat(targetAmount),
            currentAmount: 0,
            currency,
            targetDate: targetDate ? new Date(targetDate) : undefined,
            icon: selectedIcon,
            color: selectedColor,
        });

        toast.success(`Goal "${name}" created successfully!`);
        handleClose();
    };

    const handleClose = () => {
        setName('');
        setTargetAmount('');
        setTargetDate('');
        setSelectedIcon(GOAL_ICONS[0]);
        setSelectedColor(GOAL_COLORS[0]);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Create Savings Goal</DialogTitle>
                    <DialogDescription>
                        Set a target and start saving towards your goal
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
                            min="0"
                            step="0.01"
                            value={targetAmount}
                            onChange={(e) => setTargetAmount(e.target.value)}
                        />
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
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} className="gradient-primary">
                        Create Goal
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
