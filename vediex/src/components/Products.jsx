import { motion } from 'framer-motion';
import { useScrollAnimation, fadeUp, staggerContainer } from '../hooks/useScrollAnimation';
import { BarChart3, Bitcoin, TrendingUp, Coins } from 'lucide-react';

const products = [
  {
    icon: BarChart3,
    title: 'Stock-Linked Digital Assets',
    description: 'Gain exposure to global companies through digital stock-linked instruments.',
    gradient: 'from-blue-500 to-cyan-400',
  },
  {
    icon: Bitcoin,
    title: 'Crypto Spot Trading',
    description: 'Trade popular digital assets with low fees, deep liquidity, and fast execution.',
    gradient: 'from-orange-500 to-yellow-400',
  },
  {
    icon: TrendingUp,
    title: 'Perpetual Futures',
    description: 'Advanced trading tools for experienced traders with leverage options.',
    gradient: 'from-primary to-primary-light',
  },
  {
    icon: Coins,
    title: 'Staking & Earn',
    description: 'Earn rewards on your digital assets through flexible staking programs.',
    gradient: 'from-accent-green to-emerald-400',
  },
];

export default function Products() {
  const { ref, controls } = useScrollAnimation();

  return (
    <section id="products" className="relative py-24 sm:py-32 bg-[#F2F2F2] overflow-hidden">
      {/* Animated cross grid background */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <motion.div
          animate={{ x: [0, -120], y: [0, 120] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-[120px] -left-[120px] w-[calc(100%+240px)] h-[calc(100%+240px)]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #9CA3AF 1px, transparent 1px), linear-gradient(to bottom, #9CA3AF 1px, transparent 1px)',
            backgroundSize: '120px 120px',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white/70 backdrop-blur-md border border-white/40 shadow-[0_4px_40px_rgba(0,0,0,0.06)] p-8 sm:p-12 lg:p-16">
          <motion.div
            ref={ref}
            initial="hidden"
            animate={controls}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.span
              variants={fadeUp}
              className="inline-block px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-primary bg-primary/10 rounded-full border border-primary/15 mb-6"
            >
              Products
            </motion.span>
            <motion.h2
              variants={fadeUp}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1A1A2E] mb-4"
            >
              Everything You Need to Trade
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-lg text-[#6B7280] max-w-2xl mx-auto"
            >
              A comprehensive suite of trading products designed for every level of experience.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={controls}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {products.map((product) => {
              const Icon = product.icon;
              return (
                <motion.div
                  key={product.title}
                  variants={fadeUp}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className="group relative p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/50 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] transition-all duration-300 cursor-pointer"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${product.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={22} className="text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1A1A2E] mb-2">{product.title}</h3>
                  <p className="text-sm text-[#6B7280] leading-relaxed">{product.description}</p>
                  <div className="mt-4 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Learn more →
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
