import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowLeftRight, 
  HandCoins, 
  MoreHorizontal 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/wallets', icon: Wallet, label: 'Wallets' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Activity' },
  { to: '/debts', icon: HandCoins, label: 'Debts' },
  { to: '/settings', icon: MoreHorizontal, label: 'More' },
];

export function MobileNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg supports-[backdrop-filter]:bg-card/80">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 min-w-[60px]',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={cn(
                    'p-1.5 rounded-lg transition-all duration-200',
                    isActive && 'gradient-primary'
                  )}
                >
                  <item.icon
                    className={cn(
                      'h-5 w-5',
                      isActive && 'text-primary-foreground'
                    )}
                  />
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
