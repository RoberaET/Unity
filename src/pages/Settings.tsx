import { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import {
  User,
  Bell,
  Moon,
  Sun,
  Globe,
  Lock,
  CreditCard,
  HelpCircle,
  LogOut,
  ChevronRight,
  Smartphone,
  Shield,
  Palette,
  Laptop,
  Loader2,
  Camera
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

// --- Components for each section ---

const ProfileForm = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.string().email("Invalid email address."),
  });

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await updateProfile(data);
      toast.success("Profile updated successfully.");
    } catch (error) {
      toast.error("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        updateProfile({ avatar: base64String });
        toast.success("Profile picture updated");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Column: Avatar */}
        <div className="flex-shrink-0 flex flex-col items-center md:items-start space-y-4">
          <div className="relative group cursor-pointer h-32 w-32 rounded-full overflow-hidden shadow-sm ring-4 ring-white dark:ring-slate-900 transition-all hover:ring-emerald-500/20">
            <Avatar className="h-full w-full">
              <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-3xl font-bold">
                {user?.name.charAt(0)}
              </AvatarFallback>
              {user?.avatar && <img src={user.avatar} alt="Profile" className="h-full w-full object-cover transition-transform group-hover:scale-105" />}
            </Avatar>
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-200">
              <Camera className="h-8 w-8 text-white mb-1" />
              <span className="text-white text-xs font-medium">Change</span>
            </div>
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleImageUpload}
            />
          </div>
          <p className="text-sm text-muted-foreground text-center md:text-left max-w-[150px]">
            Recommended 500x500px <br /> JPG or PNG
          </p>
        </div>

        {/* Right Column: Form */}
        <div className="flex-1 space-y-8 max-w-xl">
          <div className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base font-semibold">Display Name</Label>
              <Input
                id="name"
                {...register('name')}
                className="h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
              {errors.name && <p className="text-sm text-red-500 font-medium">{errors.name.message as string}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-semibold">Email</Label>
              <Input
                id="email"
                {...register('email')}
                className="h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
              {errors.email && <p className="text-sm text-red-500 font-medium">{errors.email.message as string}</p>}
            </div>
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={!isDirty || loading}
              className="w-full md:w-auto min-w-[140px] h-11 text-base font-medium shadow-lg shadow-emerald-500/20 disabled:shadow-none transition-all"
            >
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving</> : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

const SecurityForm = () => {
  const { changePassword } = useAuth();
  const [loading, setLoading] = useState(false);

  const formSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await changePassword(data.currentPassword, data.newPassword);
      toast.success("Password changed successfully.");
      reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="current" className="text-base font-semibold">Current Password</Label>
          <Input id="current" type="password" {...register('currentPassword')} className="h-11" />
          {errors.currentPassword && <p className="text-sm text-red-500">{errors.currentPassword.message as string}</p>}
        </div>
        <Separator className="my-6" />
        <div className="space-y-2">
          <Label htmlFor="new" className="text-base font-semibold">New Password</Label>
          <Input id="new" type="password" {...register('newPassword')} className="h-11" />
          {errors.newPassword && <p className="text-sm text-red-500">{errors.newPassword.message as string}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm" className="text-base font-semibold">Confirm New Password</Label>
          <Input id="confirm" type="password" {...register('confirmPassword')} className="h-11" />
          {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message as string}</p>}
        </div>
      </div>

      <div className="pt-6">
        <Button onClick={handleSubmit(onSubmit)} disabled={loading} className="w-full md:w-auto h-11 px-8">
          {loading ? "Updating..." : "Update Password"}
        </Button>
      </div>
    </div>
  );
}

const PaymentMethods = () => {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="grid gap-4">
        {[
          { type: 'Visa', last4: '4242', exp: '12/28', icon: CreditCard },
          { type: 'Mastercard', last4: '8888', exp: '10/25', icon: CreditCard }
        ].map((card, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-emerald-500/50 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                <card.icon className="h-6 w-6 text-slate-700 dark:text-slate-200" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{card.type} ending in {card.last4}</p>
                <p className="text-sm text-slate-500">Expires {card.exp}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">Remove</Button>
          </div>
        ))}
      </div>
      <Button variant="outline" className="w-full border-dashed border-2 h-14 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/10">
        <Plus className="mr-2 h-5 w-5" /> Add New Payment Method
      </Button>
    </div>
  );
}

// Importing Plus icon since it was used above but not imported
import { Plus } from 'lucide-react';

const PreferencesForm = () => {
  const { theme, setTheme } = useTheme();
  const { user, updateProfile } = useAuth();

  return (
    <div className="max-w-2xl space-y-8">
      {/* Appearance */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Palette className="h-5 w-5 text-emerald-600" /> Appearance
        </h3>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base font-medium">Dark Mode</Label>
            <p className="text-sm text-muted-foreground">Adjust the interface contrast.</p>
          </div>
          <Select value={theme} onValueChange={(val: any) => setTheme(val)}>
            <SelectTrigger className="w-[140px] h-10">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">
                <div className="flex items-center gap-2"><Sun className="h-4 w-4" /> Light</div>
              </SelectItem>
              <SelectItem value="dark">
                <div className="flex items-center gap-2"><Moon className="h-4 w-4" /> Dark</div>
              </SelectItem>
              <SelectItem value="system">
                <div className="flex items-center gap-2"><Laptop className="h-4 w-4" /> System</div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Regional */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Globe className="h-5 w-5 text-emerald-600" /> Region & Currency
        </h3>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base font-medium">Currency</Label>
            <p className="text-sm text-muted-foreground">Main display currency.</p>
          </div>
          <Select defaultValue={user?.currency || "USD"} onValueChange={(val) => updateProfile({ currency: val })}>
            <SelectTrigger className="w-[140px] h-10">
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD ($)</SelectItem>
              <SelectItem value="EUR">EUR (€)</SelectItem>
              <SelectItem value="GBP">GBP (£)</SelectItem>
              <SelectItem value="JPY">JPY (¥)</SelectItem>
              <SelectItem value="ETB">ETB (Br)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Notifications */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Bell className="h-5 w-5 text-emerald-600" /> Notifications
        </h3>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base font-medium">Activity Alerts</Label>
            <p className="text-sm text-muted-foreground">Emails about your account.</p>
          </div>
          <Switch defaultChecked />
        </div>
      </div>
    </div>
  );
}

const Settings = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="container max-w-5xl py-8 lg:py-12 space-y-8 animate-fade-in pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Settings</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">Manage your account and preferences.</p>
        </div>
        <Button
          variant="outline"
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 border-red-200"
          onClick={() => { logout(); navigate('/auth/login'); }}
        >
          <LogOut className="mr-2 h-4 w-4" /> Log Out
        </Button>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <div className="sticky top-16 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 -mx-4 px-4 py-2 border-b mb-8">
          <TabsList className="w-auto inline-flex h-11 items-center justify-start rounded-none bg-transparent p-0 text-muted-foreground gap-6 overflow-x-auto no-scrollbar max-w-full">
            <TabsTrigger
              value="account"
              className="inline-flex items-center justify-center whitespace-nowrap py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-transparent data-[state=active]:text-emerald-600 data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-emerald-600 rounded-none px-1"
            >
              Account
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="inline-flex items-center justify-center whitespace-nowrap py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-transparent data-[state=active]:text-emerald-600 data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-emerald-600 rounded-none px-1"
            >
              Security
            </TabsTrigger>
            <TabsTrigger
              value="billing"
              className="inline-flex items-center justify-center whitespace-nowrap py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-transparent data-[state=active]:text-emerald-600 data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-emerald-600 rounded-none px-1"
            >
              Billing
            </TabsTrigger>
            <TabsTrigger
              value="app"
              className="inline-flex items-center justify-center whitespace-nowrap py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-transparent data-[state=active]:text-emerald-600 data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-emerald-600 rounded-none px-1"
            >
              Preferences
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="space-y-8">
          <TabsContent value="account" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-1">
              <div className="max-w-4xl">
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-1">Your Profile</h2>
                  <p className="text-slate-500 text-sm">Update your personal information and public avatar.</p>
                </div>
                <ProfileForm />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-1">
              <div className="max-w-4xl">
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-1">Login & Security</h2>
                  <p className="text-slate-500 text-sm">Manage your password to keep your account safe.</p>
                </div>
                <SecurityForm />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="billing" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-1">
              <div className="max-w-4xl">
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-1">Payment Methods</h2>
                  <p className="text-slate-500 text-sm">Manage your saved cards and billing info.</p>
                </div>
                <PaymentMethods />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="app" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-1">
              <div className="max-w-4xl">
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-1">App Preferences</h2>
                  <p className="text-slate-500 text-sm">Customize how the app looks and behaves.</p>
                </div>
                <PreferencesForm />

                <div className="mt-12 pt-8 border-t">
                  <h3 className="font-medium mb-4">Support</h3>
                  <p className="text-sm text-slate-500 mb-4">
                    Need help? Check our <a href="#" className="text-emerald-600 underline">docs</a> or contact support.
                  </p>
                  <Button variant="outline">Contact Support</Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default Settings;
