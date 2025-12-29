import { useState, useEffect } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Wallet as WalletType } from '@/types/finance';
import { Wallet, Landmark, Plus, Users } from 'lucide-react';
import { toast } from 'sonner';

interface BankOption {
    id: string;
    name: string;
    logo?: string;
    color: string;
}

const BANKS: BankOption[] = [
    { id: 'cbe', name: 'CBE', logo: '/Banks Logo/CBE bank.jpg', color: '#8B2252' },
    { id: 'awash', name: 'Awash Bank', logo: '/Banks Logo/awash bank.jpg', color: '#1E3A8A' },
    { id: 'wegagen', name: 'Wegagen Bank', logo: '/Banks Logo/Wegagen Bank.jpg', color: '#F59E0B' },
    { id: 'dashen', name: 'Dashen Bank', logo: '/Banks Logo/Dashen Bank.jpg', color: '#B45309' },
    { id: 'coop', name: 'Coop Bank', logo: '/Banks Logo/coop bank.jpg', color: '#047857' },
    { id: 'telebirr', name: 'Telebirr', logo: '/Banks Logo/Telebirr.jpg', color: '#0EA5E9' },
    { id: 'cash', name: 'Cash / Other', color: '#64748B' },
];

interface AddWalletDialogProps {
    trigger?: React.ReactNode;
    walletToEdit?: WalletType;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function AddWalletDialog({ trigger, walletToEdit, open: controlledOpen, onOpenChange }: AddWalletDialogProps) {
    const { addWallet, updateWallet } = useFinance();
    const { user } = useAuth();
    const [internalOpen, setInternalOpen] = useState(false);

    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setIsOpen = onOpenChange || setInternalOpen;

    const [name, setName] = useState('');
    const [type, setType] = useState<'personal' | 'shared'>('personal');
    const [selectedBank, setSelectedBank] = useState<string>('cbe');
    const [balance, setBalance] = useState('');
    const [currency, setCurrency] = useState('ETB');

    // Load data when editing
    useEffect(() => {
        if (isOpen && walletToEdit) {
            setName(walletToEdit.name);
            setType(walletToEdit.type);
            setSelectedBank(walletToEdit.icon || 'cbe');
            setBalance(walletToEdit.balance.toString());
            setCurrency(walletToEdit.currency);
        } else if (isOpen && !walletToEdit) {
            // Reset if opening in add mode
            resetForm();
        }
    }, [isOpen, walletToEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !balance) {
            toast.error('Please fill in all fields');
            return;
        }

        const bank = BANKS.find(b => b.id === selectedBank);
        const walletData = {
            name,
            type,
            currency: currency as any,
            balance: parseFloat(balance),
            color: bank?.color || '#64748B',
            icon: selectedBank,
            ownerId: user?.id,
        };

        if (walletToEdit) {
            updateWallet(walletToEdit.id, walletData);
            toast.success('Wallet updated successfully');
        } else {
            addWallet(walletData);
            toast.success('Wallet added successfully');
        }

        setIsOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setName('');
        setType('personal');
        setSelectedBank('cbe');
        setBalance('');
        setCurrency('ETB');
    };

    const handleBankSelect = (bankId: string) => {
        setSelectedBank(bankId);
        const bank = BANKS.find(b => b.id === bankId);
        // Only auto-fill name if it's empty or matches another bank name (fresh input)
        if (bank && (!name || BANKS.some(b => b.name === name))) {
            setName(bank.name);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-2">
                    <DialogTitle>{walletToEdit ? 'Edit Wallet' : 'Add New Wallet'}</DialogTitle>
                    <DialogDescription>
                        {walletToEdit ? 'Update your wallet details.' : 'Connect a bank account or create a cash wallet.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Wallet Type */}
                    <div className="space-y-2">
                        <Label className="text-xs">Wallet Type</Label>
                        <RadioGroup
                            value={type}
                            onValueChange={(v) => setType(v as 'personal' | 'shared')}
                            className="grid grid-cols-2 gap-3"
                        >
                            <div>
                                <RadioGroupItem value="personal" id="personal" className="peer sr-only" />
                                <Label
                                    htmlFor="personal"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
                                    <Wallet className="mb-1 h-5 w-5" />
                                    <span className="text-xs">Personal</span>
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="shared" id="shared" className="peer sr-only" />
                                <Label
                                    htmlFor="shared"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
                                    <Users className="mb-1 h-5 w-5" />
                                    <span className="text-xs">Shared</span>
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Bank Selection */}
                    <div className="space-y-2">
                        <Label className="text-xs">Bank / Provider</Label>
                        <div className="grid grid-cols-4 gap-2">
                            {BANKS.map((bank) => (
                                <div
                                    key={bank.id}
                                    onClick={() => handleBankSelect(bank.id)}
                                    className={cn(
                                        "relative flex flex-col items-center justify-center p-2 rounded-lg border-2 cursor-pointer transition-all hover:bg-accent/50 max-h-[80px]",
                                        selectedBank === bank.id ? "border-primary bg-accent/20" : "border-transparent bg-secondary/50"
                                    )}
                                >
                                    {bank.logo ? (
                                        <div className="h-8 w-8 relative mb-1 rounded-full overflow-hidden bg-white">
                                            <img
                                                src={bank.logo}
                                                alt={bank.name}
                                                className="h-full w-full object-contain p-0.5"
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-8 w-8 mb-1 rounded-full bg-slate-200 flex items-center justify-center">
                                            <Landmark className="h-4 w-4 text-slate-600" />
                                        </div>
                                    )}
                                    <span className="text-[9px] font-medium text-center leading-tight truncate w-full">{bank.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs">Wallet Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. My Savings"
                            required
                            className="h-9"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="balance" className="text-xs">Initial Balance</Label>
                            <Input
                                id="balance"
                                type="number"
                                placeholder="0.00"
                                value={balance}
                                onChange={(e) => setBalance(e.target.value)}
                                required
                                className="h-9"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="currency" className="text-xs">Currency</Label>
                            <Select value={currency} onValueChange={setCurrency}>
                                <SelectTrigger className="h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ETB">ETB</SelectItem>
                                    <SelectItem value="USD">USD</SelectItem>
                                    <SelectItem value="EUR">EUR</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter className="pt-2">
                        <Button type="submit" className="w-full h-10">
                            {walletToEdit ? 'Save Changes' : 'Create Wallet'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
