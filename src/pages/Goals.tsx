import { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Plus, Target, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Goal } from '@/types/finance';
import { AddGoalDialog } from '@/components/goals/AddGoalDialog';
import { ContributeToGoalDialog } from '@/components/goals/ContributeToGoalDialog';
import { GoalDetailsDialog } from '@/components/goals/GoalDetailsDialog';
import { EditGoalDialog } from '@/components/goals/EditGoalDialog';
import { WithdrawFromGoalDialog } from '@/components/goals/WithdrawFromGoalDialog';

const Goals = () => {
  const { goals, deleteGoal } = useFinance();
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [contributeGoal, setContributeGoal] = useState<Goal | null>(null);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);
  const [withdrawGoal, setWithdrawGoal] = useState<Goal | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleDeleteGoal = () => {
    if (goalToDelete) {
      deleteGoal(goalToDelete.id);
      toast.success(`Goal "${goalToDelete.name}" deleted`);
      setGoalToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Dialogs */}
      <AddGoalDialog
        isOpen={isAddGoalOpen}
        onClose={() => setIsAddGoalOpen(false)}
      />
      <ContributeToGoalDialog
        isOpen={!!contributeGoal}
        onClose={() => setContributeGoal(null)}
        goal={contributeGoal}
      />
      <WithdrawFromGoalDialog
        isOpen={!!withdrawGoal}
        onClose={() => setWithdrawGoal(null)}
        goal={withdrawGoal}
      />
      <GoalDetailsDialog
        isOpen={!!selectedGoal}
        onClose={() => setSelectedGoal(null)}
        goal={selectedGoal}
        onEdit={() => {
          setEditGoal(selectedGoal);
          setSelectedGoal(null);
        }}
        onContribute={() => {
          setContributeGoal(selectedGoal);
          setSelectedGoal(null);
        }}
        onWithdraw={() => {
          setWithdrawGoal(selectedGoal);
          setSelectedGoal(null);
        }}
        onDelete={() => {
          setGoalToDelete(selectedGoal);
          setSelectedGoal(null);
        }}
      />
      <EditGoalDialog
        isOpen={!!editGoal}
        onClose={() => setEditGoal(null)}
        goal={editGoal}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!goalToDelete} onOpenChange={() => setGoalToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the goal "{goalToDelete?.name}" and all its contribution history.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteGoal}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Savings Goals</h2>
          <p className="text-muted-foreground">Track your financial goals together</p>
        </div>
        <Button
          className="gradient-primary text-primary-foreground gap-2"
          onClick={() => setIsAddGoalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          New Goal
        </Button>
      </div>

      {/* Goals Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          const remaining = goal.targetAmount - goal.currentAmount;
          const isComplete = progress >= 100;

          return (
            <Card
              key={goal.id}
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedGoal(goal)}
            >
              <CardContent className="p-0">
                {/* Goal Header with Color */}
                <div
                  className="h-2"
                  style={{ backgroundColor: goal.color }}
                />

                <div className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div
                      className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                      style={{ backgroundColor: `${goal.color}15` }}
                    >
                      {goal.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-foreground">{goal.name}</h4>

                        {/* Menu Button */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              setEditGoal(goal);
                            }}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setGoalToDelete(goal);
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {goal.targetDate && (
                        <p className="text-sm text-muted-foreground">
                          Target: {format(new Date(goal.targetDate), 'MMM yyyy')}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Completion Badge */}
                  {isComplete && (
                    <div className="mb-3 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-center">
                      <span className="text-sm font-medium text-primary">🎉 Goal Completed!</span>
                    </div>
                  )}

                  {/* Progress */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-foreground">
                        {formatCurrency(goal.currentAmount, goal.currency)}
                      </span>
                      <span className="text-muted-foreground">
                        {formatCurrency(goal.targetAmount, goal.currency)}
                      </span>
                    </div>
                    <Progress
                      value={Math.min(progress, 100)}
                      className="h-3"
                      indicatorClassName="transition-all"
                      style={{
                        // @ts-ignore
                        '--progress-indicator-color': goal.color
                      }}
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      {Math.round(progress)}% complete
                      {!isComplete && ` • ${formatCurrency(remaining, goal.currency)} to go`}
                    </p>
                  </div>

                  {/* Quick Add */}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setContributeGoal(goal);
                    }}
                    disabled={isComplete}
                  >
                    {isComplete ? 'Completed' : 'Add Funds'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Add Goal Card */}
        <Card
          className="border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer min-h-[220px]"
          onClick={() => setIsAddGoalOpen(true)}
        >
          <CardContent className="flex flex-col items-center justify-center h-full text-muted-foreground hover:text-primary py-12">
            <Target className="h-10 w-10 mb-2" />
            <p className="font-medium">Create New Goal</p>
            <p className="text-sm text-center mt-1">
              Vacation, emergency fund, new car...
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tips Section */}
      <Card className="bg-secondary/30">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <p className="font-medium text-foreground">Pro Tip</p>
              <p className="text-sm text-muted-foreground">
                Set up automatic transfers to your goal wallets. Small consistent savings add up fast!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Goals;
