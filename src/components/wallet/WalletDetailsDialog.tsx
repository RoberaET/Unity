import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Wallet, Transaction } from '@/types/finance';
import { formatCurrency } from '@/lib/utils/currency';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Calendar, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface WalletDetailsDialogProps {
    wallet: Wallet | null;
    isOpen: boolean;
    onClose: () => void;
    transactions: Transaction[];
}

export function WalletDetailsDialog({ wallet, isOpen, onClose, transactions }: WalletDetailsDialogProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const walletTransactions = useMemo(() => {
        if (!wallet) return [];
        return transactions
            .filter(t => t.walletId === wallet.id || t.destinationWalletId === wallet.id)
            .filter(t =>
                t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (t.categoryId && t.categoryId.toLowerCase().includes(searchTerm.toLowerCase()))
            )
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [wallet, transactions, searchTerm]);

    if (!wallet) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">

                {/* Header Section with Wallet Info */}
                <div className="p-6 pb-4 border-b" style={{ backgroundColor: `${wallet.color}10` }}>
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <DialogTitle className="text-xl font-bold">{wallet.name}</DialogTitle>
                            <p className="text-muted-foreground text-sm capitalize">{wallet.type} Wallet</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold" style={{ color: wallet.color }}>
                                {formatCurrency(wallet.balance, wallet.currency)}
                            </p>
                            <p className="text-xs text-muted-foreground">Current Balance</p>
                        </div>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search transactions..."
                            className="pl-9 bg-white/50 border-transparent focus:bg-white transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Transactions List */}
                <div className="flex-1 overflow-y-auto p-0">
                    {walletTransactions.length > 0 ? (
                        <div className="divide-y">
                            {walletTransactions.map((t) => (
                                <div key={t.id} className="p-4 hover:bg-muted/30 transition-colors flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "h-10 w-10 rounded-full flex items-center justify-center border",
                                            t.type === 'income' ? "bg-emerald-100 text-emerald-600 border-emerald-200" :
                                                t.type === 'expense' ? "bg-rose-100 text-rose-600 border-rose-200" :
                                                    (t.destinationWalletId === wallet.id) ?
                                                        "bg-emerald-100 text-emerald-600 border-emerald-200" : // Incoming Transfer
                                                        "bg-blue-100 text-blue-600 border-blue-200" // Outgoing Transfer
                                        )}>
                                            {t.type === 'income' && <ArrowDownLeft className="h-5 w-5" />}
                                            {t.type === 'expense' && <ArrowUpRight className="h-5 w-5" />}
                                            {t.type === 'transfer' && <ArrowLeftRight className={cn("h-5 w-5", t.destinationWalletId === wallet.id && "rotate-180")} />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm text-foreground">{t.description}</p>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {format(new Date(t.date), 'MMM d, yyyy')}
                                                </span>
                                                {t.categoryId && (
                                                    <span className="bg-secondary px-1.5 py-0.5 rounded text-[10px]">
                                                        {t.categoryId}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={cn(
                                            "font-semibold text-sm",
                                            t.type === 'income' ? "text-emerald-600" :
                                                t.type === 'expense' ? "text-rose-600" :
                                                    (t.type === 'transfer' && t.destinationWalletId === wallet.id) ? "text-emerald-600" : "text-rose-600"
                                        )}>
                                            {t.type === 'expense' ? '-' :
                                                t.type === 'income' ? '+' :
                                                    (t.destinationWalletId === wallet.id ? '+' : '-')}
                                            {formatCurrency(t.amount, t.currency)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                                <Search className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="text-foreground font-medium">No transactions found</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                {searchTerm ? 'Try adjusting your search terms' : 'This wallet has no activity yet'}
                            </p>
                        </div>
                    )}
                </div>

            </DialogContent>
        </Dialog>
    );
}
