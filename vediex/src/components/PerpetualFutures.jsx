import { motion } from 'framer-motion';
import { useScrollAnimation, fadeUp, staggerContainer } from '../hooks/useScrollAnimation';
import { AlertTriangle, TrendingUp, TrendingDown, Gauge, Shield } from 'lucide-react';

const chartBars = Array.from({ length: 40 }, (_, i) => 20 + Math.sin(i * 0.3) * 30 + (i % 3) * 12);

export default function PerpetualFutures() {
  const { ref, controls } = useScrollAnimation();

  return (
    <section id="solutions" className="relative py-24 sm:py-32 bg-dark-card/50">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={controls}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.span
            variants={fadeUp}
            className="inline-block px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-primary-light bg-primary/10 rounded-full border border-primary/20 mb-6"
          >
            Futures
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4"
          >
            Perpetual Futures
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-lg text-gray-text max-w-2xl mx-auto"
          >
            Advanced trading tools for experienced traders to open long or short positions with leverage.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={controls}
          variants={staggerContainer}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {[
            { icon: TrendingUp, label: 'Long Positions', value: 'Go Long', desc: 'Profit from price increases', color: 'text-accent-green' },
            { icon: TrendingDown, label: 'Short Positions', value: 'Go Short', desc: 'Profit from price decreases', color: 'text-red-400' },
            { icon: Gauge, label: 'Leverage', value: 'Up to 100x', desc: 'Amplify your positions', color: 'text-primary-light' },
            { icon: Shield, label: 'Risk Management', value: 'Advanced Tools', desc: 'Stop-loss & take-profit', color: 'text-accent' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                variants={fadeUp}
                whileHover={{ y: -6, transition: { duration: 0.3 } }}
                className="p-6 rounded-2xl bg-dark-surface border border-border-subtle hover:border-primary/30 transition-all duration-300 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <Icon size={22} className={item.color} />
                </div>
                <div className="text-lg font-bold text-white mb-1">{item.value}</div>
                <div className="text-sm font-medium text-white/80 mb-1">{item.label}</div>
                <p className="text-xs text-gray-text">{item.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial="hidden"
          animate={controls}
          variants={fadeUp}
          className="rounded-2xl bg-dark-surface border border-border-subtle p-6 sm:p-8 overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-bold text-white">BTC/USDT Perpetual</h3>
              <span className="px-2 py-1 text-xs font-medium text-accent-green bg-accent-green/10 rounded">100x</span>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-2xl font-bold text-white">$67,842.50</div>
              <div className="text-sm text-accent-green">+3.24%</div>
            </div>
          </div>

          <div className="h-48 sm:h-64 rounded-xl bg-white/[0.02] border border-border-subtle flex items-end justify-center gap-1 p-4 mb-6">
            {chartBars.map((height, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-gradient-to-t from-primary/40 to-primary-light/60 min-w-[2px]"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {[
              { label: '24h Volume', value: '$1.2B' },
              { label: 'Open Interest', value: '$890M' },
              { label: 'Funding Rate', value: '0.01%' },
              { label: 'Next Funding', value: '4h 23m' },
            ].map((stat) => (
              <div key={stat.label} className="p-3 rounded-xl bg-white/[0.02]">
                <div className="text-xs text-gray-text mb-1">{stat.label}</div>
                <div className="text-sm font-semibold text-white">{stat.value}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={controls}
          variants={fadeUp}
          className="mt-8 flex items-start gap-2 p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/15 max-w-3xl mx-auto"
        >
          <AlertTriangle size={16} className="text-yellow-500 shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-500/80 leading-relaxed">
            Perpetual futures are complex products and leveraged trading can amplify losses. Please ensure you fully understand the risks involved.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
