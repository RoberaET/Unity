import { motion } from 'framer-motion';

const steps = [
    {
        number: '01',
        title: 'Create an Account',
        description: 'Sign up in seconds. We only need your name and email to get started. No sensitive bank credentials required.',
        color: 'bg-blue-500'
    },
    {
        number: '02',
        title: 'Pair with Partner',
        description: 'Generate a secure 4-digit code. Share it with your partner, and you are instantly connected in a private financial space.',
        color: 'bg-indigo-500'
    },
    {
        number: '03',
        title: 'Start Tracking',
        description: 'Add wallets, log transactions, and watch your shared financial health improve with every entry.',
        color: 'bg-emerald-500'
    },
];

export const HowItWorks = () => {
    return (
        <section className="py-24 lg:py-32 bg-slate-50 dark:bg-slate-900">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">

                    {/* Header Section (Sticky on Desktop) */}
                    <div className="lg:w-1/3">
                        <div className="lg:sticky lg:top-32">
                            <motion.h2
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="text-3xl font-bold tracking-tight sm:text-4xl mb-6 text-slate-900 dark:text-white"
                            >
                                Three simple steps to financial harmony
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="text-xl text-slate-500 dark:text-slate-400 mb-8"
                            >
                                No complicated setup. No bank logins. Just you, your partner, and your goals.
                            </motion.p>
                        </div>
                    </div>

                    {/* Timeline Section */}
                    <div className="lg:w-2/3 relative">
                        <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-slate-700 lg:left-[35px]" />

                        <div className="space-y-16">
                            {steps.map((step, index) => (
                                <motion.div
                                    key={step.number}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="relative pl-24 lg:pl-32"
                                >
                                    <div className={`absolute left-0 top-0 w-14 h-14 lg:w-16 lg:h-16 rounded-2xl ${step.color} text-white flex items-center justify-center text-xl font-bold font-mono shadow-lg z-10`}>
                                        {step.number}
                                    </div>

                                    <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">{step.title}</h3>
                                    <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                                        {step.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
