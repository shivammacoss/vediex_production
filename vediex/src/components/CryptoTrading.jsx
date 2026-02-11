import { motion } from 'framer-motion';
import { useScrollAnimation, fadeUp, staggerContainer } from '../hooks/useScrollAnimation';
import { Zap, DollarSign, Activity, ArrowRight } from 'lucide-react';

const points = [
  { icon: Activity, text: '65+ digital assets', desc: 'Wide range of cryptocurrencies available for trading' },
  { icon: DollarSign, text: 'Low trading costs', desc: 'Competitive fee structure for all traders' },
  { icon: Zap, text: 'High-speed execution', desc: 'Ultra-fast order matching engine' },
];

const coins = [
  { symbol: 'BTC', name: 'Bitcoin', price: '$67,842.50', change: '+3.24%', color: 'from-orange-500 to-yellow-500' },
  { symbol: 'ETH', name: 'Ethereum', price: '$3,456.80', change: '+2.18%', color: 'from-blue-500 to-purple-500' },
  { symbol: 'SOL', name: 'Solana', price: '$178.35', change: '+5.67%', color: 'from-purple-500 to-pink-500' },
];

export default function CryptoTrading() {
  const { ref, controls } = useScrollAnimation();

  return (
    <section id="trading-tools" className="relative py-24 sm:py-32">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={controls}
          variants={staggerContainer}
          className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center"
        >
          <motion.div variants={fadeUp} className="order-2 lg:order-1">
            <div className="space-y-4">
              {coins.map((coin) => (
                <div
                  key={coin.symbol}
                  className="flex items-center justify-between p-5 rounded-2xl bg-dark-card border border-border-subtle hover:border-primary/30 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${coin.color} flex items-center justify-center`}>
                      <span className="text-sm font-bold text-white">{coin.symbol.slice(0, 1)}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{coin.name}</h4>
                      <span className="text-sm text-gray-text">{coin.symbol}/USDT</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-white">{coin.price}</div>
                    <div className="text-sm font-medium text-accent-green">{coin.change}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="order-1 lg:order-2">
            <motion.span
              variants={fadeUp}
              className="inline-block px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-orange-400 bg-orange-500/10 rounded-full border border-orange-500/20 mb-6"
            >
              Spot Trading
            </motion.span>
            <motion.h2
              variants={fadeUp}
              className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4"
            >
              Crypto Spot Trading
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-lg text-gray-text leading-relaxed mb-8"
            >
              Trade popular digital assets like Bitcoin, Ethereum, and Solana with low fees, deep liquidity, and fast execution.
            </motion.p>

            <motion.div variants={fadeUp} className="space-y-4 mb-8">
              {points.map((point) => {
                const Icon = point.icon;
                return (
                  <div key={point.text} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon size={18} className="text-primary-light" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{point.text}</h4>
                      <p className="text-sm text-gray-text mt-1">{point.desc}</p>
                    </div>
                  </div>
                );
              })}
            </motion.div>

            <motion.div variants={fadeUp}>
              <a
                href="#"
                className="group inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary-light rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"
              >
                Start Trading
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
