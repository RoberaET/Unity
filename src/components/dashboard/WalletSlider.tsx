import { Wallet as WalletType } from '@/types/finance';
import { Wallet, Users, PiggyBank, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface WalletSliderProps {
  wallets: WalletType[];
  onAddWallet?: () => void;
}

const walletIcons: Record<string, typeof Wallet> = {
  wallet: Wallet,
  users: Users,
  'piggy-bank': PiggyBank,
};

const getWalletIcon = (iconId: string) => {
  const bankLogos: Record<string, string> = {
    'cbe': '/Banks Logo/CBE bank.jpg',
    'awash': '/Banks Logo/awash bank.jpg',
    'wegagen': '/Banks Logo/Wegagen Bank.jpg',
    'dashen': '/Banks Logo/Dashen Bank.jpg',
    'coop': '/Banks Logo/coop bank.jpg',
    'telebirr': '/Banks Logo/Telebirr.jpg',
  };
  return bankLogos[iconId];
};

// Bank-specific background colors/gradients
const getBankBackground = (iconId: string, walletName: string): string => {
  const nameL = walletName.toLowerCase();

  // Check for cash wallet
  if (iconId === 'cash' || nameL.includes('cash')) {
    return '#10b981'; // green
  }

  // Check icon ID first, then fallback to name matching
  if (iconId === 'awash' || nameL.includes('awash')) {
    return 'linear-gradient(135deg, #d97706 0%, #1e3a8a 100%)'; // dark orange to dark blue
  }
  if (iconId === 'coop' || nameL.includes('coop')) {
    return '#2596be'; // eastern blue
  }
  if (iconId === 'telebirr' || nameL.includes('telebirr')) {
    return '#65a30d'; // dark lime
  }
  if (iconId === 'dashen' || nameL.includes('dashen')) {
    return '#1e3a8a'; // dark blue
  }
  if (iconId === 'cbe' || nameL.includes('cbe')) {
    return '#6b21a8'; // dark purple
  }
  if (iconId === 'wegagen' || nameL.includes('wegagen')) {
    return '#d97706'; // dark orange
  }

  // Default fallback
  return 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)';
};

export function WalletSlider({ wallets, onAddWallet }: WalletSliderProps) {
  const { user } = useAuth(); // If needed for currency

  // Reuse formatCurrency logic locally or from utils if not already imported (it is not imported here yet in this snippet context but was in previous steps? Wait, I saw it in view_file)
  // Actually, let's stick to simple logic or import if available. In previous step I added it.

  // Let's assume formatCurrency from utils is better.
  // Wait, I can't import formatCurrency here because I am replacing a block that doesn't include imports.
  // I should check imports.

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Wallets</h3>
        <button
          onClick={onAddWallet}
          className="text-sm text-primary font-medium hover:text-primary/80 transition-colors"
        >
          See all
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {wallets.map((wallet) => {
          const Icon = walletIcons[wallet.icon] || Wallet;
          const logo = getWalletIcon(wallet.icon);

          return (
            <div
              key={wallet.id}
              className={cn(
                'flex-shrink-0 w-40 rounded-xl overflow-hidden',
                'hover:shadow-md transition-all duration-200 cursor-pointer'
              )}
            >
              {/* Colored Header */}
              <div
                className="p-3 flex items-center gap-2"
                style={{ background: getBankBackground(wallet.icon, wallet.name) }}
              >
                <div
                  className="flex items-center justify-center h-10 w-10 rounded-lg bg-white shadow-sm overflow-hidden"
                >
                  {logo ? (
                    <img src={logo} alt={wallet.name} className="h-full w-full object-contain p-0.5" />
                  ) : (
                    <Icon className="h-5 w-5" style={{ color: wallet.color }} />
                  )}
                </div>
                <p className="text-sm font-medium text-white truncate flex-1">{wallet.name}</p>
              </div>

              {/* Card Body */}
              <div className="p-4 bg-card border border-border border-t-0">
                <p className="text-lg font-bold text-foreground">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: wallet.currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(wallet.balance)}
                </p>
                {wallet.type === 'shared' && (
                  <span className="inline-flex items-center gap-1 mt-2 text-xs text-accent font-medium">
                    <Users className="h-3 w-3" />
                    Shared
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Add Wallet Card */}
        <button
          onClick={onAddWallet}
          className="flex-shrink-0 w-40 p-4 rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary"
        >
          <Plus className="h-6 w-6" />
          <span className="text-sm font-medium">Add Wallet</span>
        </button>
      </div>
    </div>
  );
}
