import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  HandCoins,
  Target,
  Users,
  Settings,
  Heart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFinance } from '@/contexts/FinanceContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/wallets', icon: Wallet, label: 'Wallets' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/debts', icon: HandCoins, label: 'Debts' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/partner', icon: Users, label: 'Partner' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function DesktopSidebar() {
  const { user, partner, isPaired } = useFinance();

  return (
    <aside className="hidden lg:fixed lg:inset-y-4 lg:left-4 lg:flex lg:w-60 lg:flex-col z-50">
      <div
        className="flex grow flex-col gap-y-4 overflow-y-auto rounded-2xl p-5"
        style={{
          background: 'linear-gradient(180deg, #10B981 0%, #064E3B 50%, #022C22 100%)',
        }}
      >
        {/* Logo */}
        <div className="flex shrink-0 items-center gap-2.5 px-1 mb-2">
          <div className="h-9 w-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <img src="/unitylogo.jpg" alt="Unity" className="h-full w-full object-contain p-0.5 rounded-lg" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Unity</span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center gap-x-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-white/20 text-white backdrop-blur-sm shadow-lg'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    )
                  }
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile Section */}
        <div className="mt-auto pt-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-1">
            <div className="relative">
              <Avatar className="h-10 w-10 border-2 border-white/30">
                <AvatarFallback className="bg-white/20 text-white font-semibold">
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              {isPaired && (
                <Avatar className="absolute -right-1.5 -bottom-1 h-6 w-6 border-2 border-emerald-800">
                  <AvatarFallback className="bg-pink-500 text-white text-[10px] font-semibold">
                    {partner?.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-white/60 truncate">
                {isPaired ? `with ${partner?.name}` : 'Solo mode'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
