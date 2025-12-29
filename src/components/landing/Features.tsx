import { motion } from 'framer-motion';
import { Wallet, Users, TrendingUp, Shield, Lock, Smartphone, ArrowRight, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import dashboardMockup from '@/assets/dashboard-mockup.png';
import goalsMockup from '@/assets/goals-mockup.png';

const majorFeatures = [
    {
        title: "Complete Financial Visibility",
        description: "See the full picture of your joint finances. Link your personal and shared wallets to track every income and expense source in one place.",
        icon: Wallet,
        color: "text-indigo-600",
        bgColor: "bg-indigo-50",
        image: dashboardMockup,
    },
    {
        title: "Smarter Budgeting Together",
        description: "Set shared goals and categorical budgets. Get real-time alerts when you're close to your limits and celebrate when you hit your savings targets.",
        icon: PieChart,
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
        image: goalsMockup,
    }
];

const bentoFeatures = [
    {
        icon: Users,
        title: 'Easy Pairing',
        description: 'Connect instantly with a secure 4-digit code.',
        colSpan: 'md:col-span-1',
        className: 'border-l-4 border-indigo-500 hover:shadow-indigo-100'
    },
    {
        icon: Shield,
        title: 'Debt Tracking',
        description: 'Keep track of IOUs and settle debts easily.',
        colSpan: 'md:col-span-2',
        className: 'border-l-4 border-orange-500 hover:shadow-orange-100'
    },
    {
        icon: Lock,
        title: 'Secure Infrastructure',
        description: 'Bank-grade encryption for your peace of mind.',
        colSpan: 'md:col-span-2',
        className: 'border-l-4 border-rose-500 hover:shadow-rose-100'
    },
    {
        icon: Smartphone,
        title: 'Mobile First',
        description: 'Optimized for every device you use.',
        colSpan: 'md:col-span-1',
        className: 'border-l-4 border-violet-500 hover:shadow-violet-100'
    },
];

export const Features = () => {
    return (
        <section className="pt-0 pb-24 lg:pb-32 bg-slate-50 dark:bg-black/20">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-20 lg:mb-32 pt-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6 text-slate-900 dark:text-white">
                            Features that empower your relationship
                        </h2>
                        <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                            Tools designed to build trust, transparency, and financial freedom.
                        </p>
                    </motion.div>
                </div>

                {/* Major Feature Blocks */}
                <div className="space-y-32 mb-32">
                    {majorFeatures.map((feature, index) => (
                        <div key={feature.title} className={`flex flex-col lg:flex-row gap-16 lg:gap-24 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                            <motion.div
                                className="flex-1 space-y-8"
                                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.7 }}
                            >
                                <div className={`inline-flex p-4 rounded-2xl ${feature.bgColor} ${feature.color}`}>
                                    <feature.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{feature.title}</h3>
                                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                                    {feature.description}
                                </p>

                                <ul className="space-y-4">
                                    {['Real-time sync', 'Categorized insights', 'Exportable reports'].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-slate-600 dark:text-slate-300 font-medium">
                                            <div className="h-2 w-2 rounded-full bg-indigo-500" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Button variant="link" className="p-0 h-auto text-indigo-600 text-base font-bold group hover:text-indigo-700">
                                    Learn more <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </motion.div>

                            <motion.div
                                className="flex-1 w-full"
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.7 }}
                            >
                                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-2">
                                    {/* Image Container with subtle inner border */}
                                    <div className="rounded-2xl overflow-hidden bg-slate-50 relative aspect-[4/3] group-hover:scale-[1.02] transition-transform duration-500">
                                        <img
                                            src={feature.image}
                                            alt={feature.title}
                                            className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    ))}
                </div>

                {/* Bento Grid for Secondary Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {bentoFeatures.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className={`${feature.colSpan} group h-full`}
                        >
                            <Card className={`h-full min-h-[280px] border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-900 ${feature.className}`}>
                                <CardContent className="p-10 h-full flex flex-col justify-between">
                                    <div>
                                        <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-8 text-slate-900 dark:text-white group-hover:scale-110 transition-transform duration-300">
                                            <feature.icon className="w-7 h-7" />
                                        </div>
                                        <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">{feature.title}</h3>
                                        <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
