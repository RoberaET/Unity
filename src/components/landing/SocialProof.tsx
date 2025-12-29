import { motion } from 'framer-motion';

export const SocialProof = () => {
    return (
        <section className="py-12 border-y border-border/50 bg-secondary/20">
            <div className="container mx-auto px-4 text-center">
                <p className="text-sm font-medium text-muted-foreground mb-8">
                    TRUSTED BY COUPLES WORLDWIDE
                </p>
                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 grayscale opacity-70">
                    {/* Placeholder Logos */}
                    {['Acme', 'FinanceCo', 'MoneyTree', 'SafeBank', 'TrustWallet'].map((brand, i) => (
                        <motion.div
                            key={brand}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 0.7 }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="text-xl font-bold text-foreground"
                        >
                            {brand}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
