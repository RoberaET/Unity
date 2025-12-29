import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const Hero = () => {
    return (
        <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32">
            {/* Background decoration - Moving Green Wave */}
            <div className="absolute inset-0 bg-background/50 z-0" />

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 pointer-events-none z-[-1]"
            >
                {/* Large Green Moving Blob */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0],
                        x: [0, 50, -50, 0],
                        y: [0, -30, 30, 0]
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute -top-[20%] left-[10%] w-[80%] h-[80%] bg-gradient-to-br from-emerald-400/40 via-green-300/30 to-teal-400/40 rounded-full blur-[120px]"
                />

                {/* Secondary Blob for "Wave" interaction */}
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        rotate: [0, -15, 15, 0],
                        x: [0, -30, 30, 0],
                        y: [0, 40, -40, 0]
                    }}
                    transition={{
                        duration: 18,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                    }}
                    className="absolute top-[10%] right-[10%] w-[60%] h-[60%] bg-gradient-to-bl from-green-400/40 via-emerald-300/30 to-cyan-400/40 rounded-full blur-[100px]"
                />
            </motion.div>

            <div className="container relative mx-auto px-4 text-center z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center rounded-full border border-emerald-100 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/50 px-4 py-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-8 shadow-sm backdrop-blur-sm"
                >
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                    New: Smart Goals Feature
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="mx-auto max-w-5xl text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-7xl mb-8 leading-tight"
                >
                    Master your finances,{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 relative">
                        together
                    </span>
                    .
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mx-auto max-w-2xl text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-12 font-medium"
                >
                    The smart finance app for couples. Track expenses, split bills,
                    manage debts, and achieve goals as a team. No bank connection required.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                    <Link to="/auth/register">
                        <Button size="lg" className="h-14 px-8 text-lg rounded-2xl bg-emerald-600 hover:bg-emerald-700 shadow-glow shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 text-white border-0">
                            Start Your Journey
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                    <Link to="/auth/login">
                        <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white font-semibold bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                            Explore Demo
                        </Button>
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mt-12 flex items-center justify-center gap-6 text-sm text-slate-600 dark:text-slate-300 font-medium"
                >
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span>No credit card required</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span>Bank-level security</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span>Setup in seconds</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
