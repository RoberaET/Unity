import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Loader2, ArrowRight } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsSubmitting(true);
    try {
      await registerUser(data.email, data.name, data.password);
      toast.success('Account created successfully');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create account');
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
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Create your workspace</h1>
            <p className="text-slate-500">Start managing your shared finances today.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 ml-1">Full Name</label>
              <Input
                {...register('name')}
                placeholder="John Doe"
                className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-emerald-500 transition-all"
              />
              {errors.name && (
                <p className="text-sm text-red-500 ml-1">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 ml-1">Email Address</label>
              <Input
                {...register('email')}
                type="email"
                placeholder="john@example.com"
                className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-emerald-500 transition-all"
              />
              {errors.email && (
                <p className="text-sm text-red-500 ml-1">{errors.email.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 ml-1">Password</label>
                <Input
                  {...register('password')}
                  type="password"
                  placeholder="••••••••"
                  className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-emerald-500 transition-all"
                />
                {errors.password && (
                  <p className="text-sm text-red-500 ml-1">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 ml-1">Confirm</label>
                <Input
                  {...register('confirmPassword')}
                  type="password"
                  placeholder="••••••••"
                  className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-emerald-500 transition-all"
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500 ml-1">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-lg mt-6 shadow-lg shadow-slate-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/auth/login" className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline">
              Log in
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
