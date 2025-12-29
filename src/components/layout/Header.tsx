import { Plus, Moon, Sun, FileText } from 'lucide-react';
import { NotificationCenter } from '@/components/layout/NotificationCenter';
import { Button } from '@/components/ui/button';
import { useFinance } from '@/contexts/FinanceContext';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState, useEffect } from 'react';
import { AddTransactionModal } from '@/components/transactions/AddTransactionModal';
import { useNavigate } from 'react-router-dom';
import { generateFinancialReport } from '@/lib/utils/reportGenerator';
import { toast } from 'sonner';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { partner, isPaired, wallets, transactions, debts, goals, totalBalance, monthlyIncome, monthlyExpenses } = useFinance();
  const { user, logout } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();

  // Initialize dark mode from localStorage/document
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  const handleGenerateReport = () => {
    try {
      generateFinancialReport({
        userName: user?.name || 'User',
        wallets,
        transactions,
        debts,
        goals,
        totalBalance,
        monthlyIncome,
        monthlyExpenses,
        currency: 'USD'
      });
      toast.success('Report generated successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-lg supports-[backdrop-filter]:bg-card/80">
        <div className="container flex h-16 items-center justify-between px-4 lg:px-8">
          {/* Left: Title and couple avatars on mobile */}
          <div className="flex items-center gap-3">
            <div className="lg:hidden flex items-center gap-2">
              {/* Couple Avatars for Mobile */}
              <div className="relative flex items-center">
                <Avatar className="h-8 w-8 border-2 border-primary">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                {isPaired && partner && (
                  <Avatar className="h-8 w-8 -ml-2 border-2 border-partner-b">
                    <AvatarFallback className="bg-partner-b text-primary-foreground text-xs">
                      {partner.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
            <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <NotificationCenter />

            <Button
              onClick={() => setIsAddModalOpen(true)}
              size="sm"
              className="gradient-primary text-primary-foreground gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add</span>
            </Button>

            {/* User Menu (Desktop) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="hidden lg:flex">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-secondary text-foreground">
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={toggleDarkMode}>
                  {isDarkMode ? (
                    <><Sun className="h-4 w-4 mr-2" /> Light Mode</>
                  ) : (
                    <><Moon className="h-4 w-4 mr-2" /> Dark Mode</>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleGenerateReport}>
                  <FileText className="h-4 w-4 mr-2" /> Generate Report
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </>
  );
}
