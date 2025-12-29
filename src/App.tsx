import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { FinanceProvider } from "@/contexts/FinanceContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Loader2 } from "lucide-react";

// Lazy Load Pages
const Index = lazy(() => import("./pages/Index"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Wallets = lazy(() => import("./pages/Wallets"));
const Transactions = lazy(() => import("./pages/Transactions"));
const Debts = lazy(() => import("./pages/Debts"));
const Goals = lazy(() => import("./pages/Goals"));
const Partner = lazy(() => import("./pages/Partner"));
const Settings = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const UsersPage = lazy(() => import("./pages/admin/Users"));
const ResetPage = lazy(() => import("./pages/admin/Reset"));
const LogsPage = lazy(() => import("./pages/admin/Logs"));
const OverviewPage = lazy(() => import("./pages/admin/Overview"));
const BroadcastPage = lazy(() => import("./pages/admin/Broadcast"));

const queryClient = new QueryClient();

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
    <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AuthProvider>
        <FinanceProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  {/* Landing Page */}
                  <Route path="/" element={<Index />} />

                  {/* Auth Routes */}
                  <Route path="/auth/login" element={<Login />} />
                  <Route path="/auth/register" element={<Register />} />
                  <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                  <Route path="/auth/reset-password" element={<ResetPassword />} />

                  {/* Admin Routes */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Navigate to="/admin/overview" replace />} />
                    <Route path="overview" element={<OverviewPage />} />
                    <Route path="users" element={<UsersPage />} />
                    <Route path="broadcast" element={<BroadcastPage />} />
                    <Route path="reset" element={<ResetPage />} />
                    <Route path="logs" element={<LogsPage />} />
                  </Route>

                  {/* App Routes with Layout & Protection */}
                  <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/wallets" element={<Wallets />} />
                    <Route path="/transactions" element={<Transactions />} />
                    <Route path="/debts" element={<Debts />} />
                    <Route path="/goals" element={<Goals />} />
                    <Route path="/partner" element={<Partner />} />
                    <Route path="/settings" element={<Settings />} />
                  </Route>

                  {/* Catch-all */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </FinanceProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
