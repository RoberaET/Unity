import { useState, useEffect } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  Users,
  Search,
  Send,
  Check,
  X,
  Bell,
  Mail,
  UserPlus,
  Clock,
  Heart,
  Wallet as WalletIcon,
  Lock,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const Partner = () => {
  const { user, partner, isPaired, partnerWallets, partnerRequests, sentRequests, sendPartnerRequest, respondToRequest, cancelRequest, unpair, refreshPartnerRequests } = useFinance();
  const { createNotification } = useAuth();
  const [searchEmail, setSearchEmail] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Refresh requests on mount
  useEffect(() => {
    refreshPartnerRequests();
  }, [refreshPartnerRequests]);

  const handleSendRequest = async () => {
    if (!searchEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setIsSending(true);
    const result = await sendPartnerRequest(searchEmail);
    setIsSending(false);

    if (result.success) {
      toast.success('Partner request sent!');
      setSearchEmail('');
    } else {
      toast.error(result.error || 'Failed to send request');
    }
  };

  const handleAccept = async (requestId: string) => {
    console.log('👆 Accept button clicked for request:', requestId);
    try {
      await respondToRequest(requestId, true);
      toast.success('Partner request accepted!');
    } catch (error: any) {
      console.error('Accept failed:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to accept request');
    }
  };

  const handleDecline = async (requestId: string) => {
    console.log('👆 Decline button clicked for request:', requestId);
    try {
      await respondToRequest(requestId, false);
      toast.success('Partner request declined');
    } catch (error: any) {
      console.error('Decline failed:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to decline request');
    }
  };

  const handleCancel = async (requestId: string) => {
    await cancelRequest(requestId);
    toast.success('Request canceled');
  };

  const handleUnpair = async () => {
    await unpair();
    toast.success('Successfully unpaired');
  };

  const getWalletStats = (walletId: string) => {
    // Note: detailed stats might not be available if partner transactions aren't fully loaded
    return { income: 0, expense: 0, txnCount: 0 };
  };

  // Map icon IDs back to images
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

  if (isPaired && partner) {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-foreground">Partner</h2>
          <p className="text-muted-foreground">Manage your coupled account</p>
        </div>

        {/* Paired Status Card */}
        <Card className="overflow-hidden border-2 border-emerald-200 dark:border-emerald-800">
          <div className="h-32 bg-gradient-to-r from-emerald-500 to-teal-600 relative">
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex items-end gap-4">
              <Avatar className="h-24 w-24 border-4 border-card shadow-xl">
                <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 mb-6 flex items-center justify-center shadow-lg">
                <Heart className="h-6 w-6 text-white fill-white" />
              </div>
              <Avatar className="h-24 w-24 border-4 border-card shadow-xl">
                <AvatarFallback className="bg-partner-b text-primary-foreground text-3xl font-bold">
                  {partner?.name?.charAt(0) || 'P'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          <CardContent className="pt-20 pb-8 text-center">
            <h3 className="text-2xl font-bold text-foreground mb-2">
              {user?.name} & {partner.name}
            </h3>
            <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
              <Check className="h-3 w-3 mr-1" />
              Connected
            </Badge>

            <div className="mt-6 flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  createNotification(
                    "Partner Ping 👋",
                    `${user?.name} says hello!`,
                    "info",
                    partner.id
                  );
                  toast.success("Ping sent to partner!");
                }}
              >
                <Bell className="mr-2 h-4 w-4" />
                Ping Partner
              </Button>

              <Button
                variant="outline"
                className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={handleUnpair}
              >
                Unpair
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Partner Wallets Section */}
        <div>
          <h3 className="text-xl font-bold text-foreground mb-4">Partner's Wallets</h3>
          {partnerWallets.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Partner has no visible wallets.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {partnerWallets.map((wallet) => {
                const logo = getWalletIcon(wallet.icon);
                return (
                  <Card
                    key={wallet.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow cursor-default group"
                  >
                    <CardHeader
                      className="pb-3 relative text-white"
                      style={{
                        background: getBankBackground(wallet.icon, wallet.name),
                        backgroundSize: 'cover'
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-12 w-12 rounded-xl flex items-center justify-center overflow-hidden bg-white shadow-md"
                          >
                            {logo ? (
                              <img src={logo} alt={wallet.name} className="h-full w-full object-contain p-1" />
                            ) : (
                              <div style={{ color: wallet.color }}>
                                <WalletIcon className="h-6 w-6" />
                              </div>
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-lg text-white drop-shadow-md">{wallet.name}</CardTitle>
                            <div className="flex gap-1.5 flex-wrap">
                              <span className={cn(
                                'text-xs font-medium px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm'
                              )}>
                                {wallet.type === 'shared' ? 'Shared' : 'Partner\'s'}
                              </span>
                              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/80 text-white backdrop-blur-sm flex items-center gap-1">
                                <Eye className="h-3 w-3" /> View Only
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 -mr-2 hover:bg-white/20 text-white/60"
                          title="View only - cannot edit partner's wallet"
                        >
                          <Lock className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="text-3xl font-bold text-foreground mb-1">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: wallet.currency }).format(wallet.balance)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Managed by {partner.name}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Not paired - show friend request UI
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 mb-4 shadow-lg">
          <UserPlus className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Find Your Partner</h2>
        <p className="text-muted-foreground mt-2">
          Search by email to send a partner request
        </p>
      </div>

      {/* Search Section */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Send Partner Request
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="partner-email">Partner's Email</Label>
            <div className="flex gap-2">
              <Input
                id="partner-email"
                type="email"
                placeholder="partner@example.com"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendRequest()}
                disabled={isSending}
              />
              <Button
                onClick={handleSendRequest}
                disabled={isSending || !searchEmail.trim()}
                className="gradient-primary text-primary-foreground"
              >
                {isSending ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Request
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests Tabs */}
      {(partnerRequests.length > 0 || sentRequests.length > 0) && (
        <Tabs defaultValue="incoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="incoming" className="gap-2">
              <Mail className="h-4 w-4" />
              Incoming ({partnerRequests.length})
            </TabsTrigger>
            <TabsTrigger value="sent" className="gap-2">
              <Send className="h-4 w-4" />
              Sent ({sentRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="incoming" className="space-y-3 mt-4">
            {partnerRequests.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No incoming requests
                </CardContent>
              </Card>
            ) : (
              partnerRequests.map((request) => (
                <Card key={request.id} className="border-2 hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                            {request.fromUser?.name?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-foreground">{request.fromUser?.name || 'Unknown User'}</p>
                          <p className="text-sm text-muted-foreground">wants to pair with you</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                          onClick={() => handleAccept(request.id)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive border-destructive/30 hover:bg-destructive/10"
                          onClick={() => handleDecline(request.id)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="sent" className="space-y-3 mt-4">
            {sentRequests.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No sent requests
                </CardContent>
              </Card>
            ) : (
              sentRequests.map((request) => (
                <Card key={request.id} className="border-2">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-secondary text-secondary-foreground text-lg">
                            {request.toUser?.name?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-foreground">{request.toUser?.name || 'Unknown User'}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant={request.status === 'pending' ? 'secondary' : request.status === 'accepted' ? 'default' : 'destructive'}>
                              {request.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {request.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-muted-foreground"
                          onClick={() => handleCancel(request.id)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Partner;
