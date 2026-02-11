import { motion } from 'framer-motion';
import { useScrollAnimation, fadeUp, staggerContainer } from '../hooks/useScrollAnimation';
import { LineChart, PieChart, Globe, AlertTriangle } from 'lucide-react';

const features = [
  { icon: Globe, label: 'Global Companies', desc: 'Access top global stocks digitally' },
  { icon: LineChart, label: 'Index Exposure', desc: 'Track major market indices' },
  { icon: PieChart, label: 'Portfolio Diversification', desc: 'Spread risk across assets' },
];

export default function StockTokens() {
  const { ref, controls } = useScrollAnimation();

  return (
    <section id="stock-tokens" className="relative py-24 sm:py-32 bg-[#F2F2F2] overflow-hidden">
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
            className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center"
          >
            <div>
              <motion.span
                variants={fadeUp}
                className="inline-block px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-blue-600 bg-blue-500/10 rounded-full border border-blue-500/15 mb-6"
              >
                Stock Tokens
              </motion.span>
              <motion.h2
                variants={fadeUp}
                className="text-3xl sm:text-4xl font-bold text-[#1A1A2E] leading-tight mb-4"
              >
                Stock-Linked Digital Assets
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="text-lg text-[#6B7280] leading-relaxed mb-8"
              >
                Gain exposure to global companies and indices through digital stock-linked instruments designed for portfolio diversification.
              </motion.p>

              <motion.div variants={fadeUp} className="space-y-4 mb-6">
                {features.map((f) => {
                  const Icon = f.icon;
                  return (
                    <div key={f.label} className="flex items-start gap-4 p-4 rounded-xl bg-white/80 border border-white/50 shadow-[0_1px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-200">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                        <Icon size={18} className="text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-[#1A1A2E]">{f.label}</h4>
                        <p className="text-sm text-[#6B7280] mt-1">{f.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="flex items-start gap-2 p-4 rounded-xl bg-amber-50 border border-amber-200/60"
              >
                <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  Stock-linked instruments are derivative products and involve risk.
                </p>
              </motion.div>
            </div>

            <motion.div variants={fadeUp}>
              <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-white/50 shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-6 sm:p-8 overflow-hidden">
                <div className="space-y-3">
                  {[
                    { name: 'AAPL', price: '$178.72', change: '+2.34%', positive: true },
                    { name: 'TSLA', price: '$248.50', change: '+1.87%', positive: true },
                    { name: 'GOOGL', price: '$141.80', change: '-0.45%', positive: false },
                    { name: 'MSFT', price: '$378.91', change: '+1.12%', positive: true },
                    { name: 'AMZN', price: '$185.60', change: '+0.98%', positive: true },
                  ].map((stock) => (
                    <div
                      key={stock.name}
                      className="flex items-center justify-between p-4 rounded-xl bg-[#F2F2F2]/60 border border-black/[0.04] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/15 to-cyan-500/15 flex items-center justify-center">
                          <span className="text-xs font-bold text-blue-600">{stock.name.slice(0, 2)}</span>
                        </div>
                        <span className="font-semibold text-[#1A1A2E] text-sm">{stock.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-[#1A1A2E]">{stock.price}</div>
                        <div className={`text-xs font-medium ${stock.positive ? 'text-emerald-600' : 'text-red-500'}`}>
                          {stock.change}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
