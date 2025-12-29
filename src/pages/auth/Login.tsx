import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Loader2, ArrowRight } from 'lucide-react';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'), // Relaxed min length for login
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // @ts-ignore
    const from = location.state?.from?.pathname || '/dashboard';

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginForm) => {
        setIsSubmitting(true);
        try {
            // In this mock, we only need email to find the user, but we'd pass password in real app
            // Name is just a placeholder here as login() signature requires it for legacy reasons (which we should fix but keeping for now)
            await login(data.email, 'User');
            toast.success('Welcome back!');

            // Check role from storage directly as state update might lag or just assume from logic
            // But we can check if email is admin email for immediate redirect, or wait for context?
            // Since login() is async and sets state, we can trust it? 
            // Actually, context 'user' might not be updated inside this function closure immediately.
            // We can read from localStorage to be safe.
            const stored = JSON.parse(localStorage.getItem('partner-finance-user') || '{}');
            if (stored.role === 'ADMIN') {
                navigate('/admin', { replace: true });
            } else {
                navigate(from, { replace: true });
            }
        } catch (error) {
            toast.error('Invalid credentials'); // Genuine security practice (don't reveal if user exists)
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute inset-0 z-0">
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-emerald-100/40 rounded-full blur-[100px]" />
                <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-teal-100/40 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md z-10"
            >
                <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl overflow-hidden p-8 sm:p-10">

                    <div className="text-center mb-10">
                        <Link to="/" className="inline-block mb-6">
                            <span className="font-bold text-3xl tracking-tight text-slate-900">Unity</span>
                        </Link>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome back</h1>
                        <p className="text-slate-500">Sign in to manage your finances.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700 ml-1">Email Address</label>
                            <Input
                                {...register('email')}
                                type="email"
                                inputMode="email"
                                autoComplete="email"
                                placeholder="john@example.com"
                                className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-emerald-500 transition-all"
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500 ml-1">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-medium text-slate-700">Password</label>
                                <Link
                                    to="/auth/forgot-password"
                                    className="text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <Input
                                {...register('password')}
                                type="password"
                                autoComplete="current-password"
                                placeholder="••••••••"
                                className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-emerald-500 transition-all"
                            />
                            {errors.password && (
                                <p className="text-sm text-red-500 ml-1">{errors.password.message}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-lg mt-6 shadow-lg shadow-slate-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 text-center text-sm text-slate-500">
                        Don't have an account?{' '}
                        <Link to="/auth/register" className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline">
                            Create workspace
                        </Link>
                    </div>
                </div>

                <div className="mt-8 text-center flex justify-center gap-6 text-sm text-slate-400 font-medium">
                    <span>© 2026 Unity Finance</span>
                    <a href="#" className="hover:text-slate-600 transition-colors">Privacy</a>
                    <a href="#" className="hover:text-slate-600 transition-colors">Terms</a>
                </div>

            </motion.div>
        </div>
    );
}
