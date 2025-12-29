import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageCircle, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ForgotPassword() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute inset-0 z-0">
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-100/40 rounded-full blur-[100px]" />
                <div className="absolute bottom-[20%] right-[10%] w-[40%] h-[40%] bg-indigo-100/40 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md z-10"
            >
                <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl overflow-hidden p-8 sm:p-10 relative">

                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600" />

                    <div className="mb-8">
                        <Link
                            to="/auth/login"
                            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mb-6 group"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                            Back to Sign In
                        </Link>

                        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                            <ShieldAlert className="w-6 h-6" />
                        </div>

                        <h1 className="text-2xl font-bold text-slate-900 mb-3">Manual Reset Required</h1>
                        <p className="text-slate-600 leading-relaxed">
                            For security reasons, password resets are handled manually by our administration team. We do not use automated email links.
                        </p>
                    </div>

                    <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100 mb-8">
                        <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Instructions
                        </h3>
                        <ol className="list-decimal list-inside text-sm text-blue-800 space-y-3 ml-1">
                            <li>Message our admin on Telegram using the handle below.</li>
                            <li>Provide your registered <strong>email address</strong>.</li>
                            <li>You will receive a temporary <strong>6-digit code</strong>.</li>
                            <li>Enter that code on the next screen to reset your password.</li>
                        </ol>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-slate-100 rounded-xl text-center">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Admin Handle</span>
                            <span className="text-lg font-mono font-bold text-slate-900 select-all">@common_admin</span>
                        </div>

                        <div className="grid gap-3">
                            <Button
                                variant="outline"
                                className="w-full h-12 rounded-xl border-slate-200 hover:bg-slate-50 hover:text-slate-900 font-medium"
                                onClick={() => window.open('https://t.me/common_admin', '_blank')}
                            >
                                Open Telegram
                            </Button>

                            <Link to="/auth/reset-password">
                                <Button
                                    className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-lg shadow-slate-900/10"
                                >
                                    I have a code
                                </Button>
                            </Link>
                        </div>
                    </div>

                </div>
            </motion.div>
        </div>
    );
}
