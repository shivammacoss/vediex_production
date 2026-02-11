import { useState } from 'react';
import { motion } from 'framer-motion';
import { useScrollAnimation, fadeUp, staggerContainer } from '../hooks/useScrollAnimation';
import { TrendingUp, TrendingDown, Star, ArrowRight } from 'lucide-react';

const marketData = [
  { symbol: 'BTC', name: 'Bitcoin', price: '$67,842.50', change: '+3.24%', volume: '$28.4B', cap: '$1.33T', positive: true, trending: true },
  { symbol: 'ETH', name: 'Ethereum', price: '$3,456.80', change: '+2.18%', volume: '$15.2B', cap: '$415B', positive: true, trending: true },
  { symbol: 'SOL', name: 'Solana', price: '$178.35', change: '+5.67%', volume: '$4.8B', cap: '$78B', positive: true, trending: true },
  { symbol: 'BNB', name: 'BNB', price: '$612.40', change: '-0.82%', volume: '$2.1B', cap: '$91B', positive: false, trending: false },
  { symbol: 'XRP', name: 'Ripple', price: '$0.6234', change: '+1.45%', volume: '$3.2B', cap: '$34B', positive: true, trending: false },
  { symbol: 'ADA', name: 'Cardano', price: '$0.5812', change: '-1.23%', volume: '$1.8B', cap: '$20B', positive: false, trending: false },
  { symbol: 'AVAX', name: 'Avalanche', price: '$42.15', change: '+4.32%', volume: '$1.5B', cap: '$16B', positive: true, trending: true },
  { symbol: 'DOT', name: 'Polkadot', price: '$8.92', change: '+0.87%', volume: '$890M', cap: '$12B', positive: true, trending: false },
];

const tabs = ['Trending', 'All Assets', 'Gainers', 'Losers'];

export default function Markets() {
  const { ref, controls } = useScrollAnimation();
  const [activeTab, setActiveTab] = useState('All Assets');

  const filteredData = marketData.filter((item) => {
    if (activeTab === 'Trending') return item.trending;
    if (activeTab === 'Gainers') return item.positive;
    if (activeTab === 'Losers') return !item.positive;
    return true;
  });

  return (
    <section id="markets" className="relative py-24 sm:py-32">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={controls}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.span
            variants={fadeUp}
            className="inline-block px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-accent bg-accent/10 rounded-full border border-accent/20 mb-6"
          >
            Markets
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4"
          >
            Live Market Prices
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-lg text-gray-text max-w-2xl mx-auto"
          >
            Trending digital assets and global market overview in real-time.
          </motion.p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial="hidden"
          animate={controls}
          variants={fadeUp}
          className="flex items-center justify-center gap-2 mb-8 flex-wrap"
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'text-gray-text hover:text-white hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </motion.div>

        {/* Market table */}
        <motion.div
          initial="hidden"
          animate={controls}
          variants={fadeUp}
          className="rounded-2xl bg-dark-card border border-border-subtle overflow-hidden"
        >
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-4 border-b border-border-subtle text-xs font-medium text-gray-text uppercase tracking-wider">
            <div className="col-span-1">#</div>
            <div className="col-span-3">Asset</div>
            <div className="col-span-2 text-right">Price</div>
            <div className="col-span-2 text-right">24h Change</div>
            <div className="col-span-2 text-right">Volume</div>
            <div className="col-span-2 text-right">Market Cap</div>
          </div>

          {/* Table rows */}
          {filteredData.map((item, index) => (
            <motion.div
              key={item.symbol}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="grid grid-cols-2 sm:grid-cols-12 gap-4 px-6 py-4 border-b border-border-subtle last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer items-center"
            >
              <div className="hidden sm:flex col-span-1 items-center gap-2">
                <Star size={14} className="text-gray-text/40 hover:text-yellow-400 transition-colors cursor-pointer" />
                <span className="text-sm text-gray-text">{index + 1}</span>
              </div>
              <div className="col-span-1 sm:col-span-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{item.symbol.slice(0, 2)}</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{item.name}</div>
                  <div className="text-xs text-gray-text">{item.symbol}</div>
                </div>
              </div>
              <div className="col-span-1 sm:col-span-2 text-right text-sm font-semibold text-white">{item.price}</div>
              <div className={`hidden sm:block col-span-2 text-right text-sm font-medium ${item.positive ? 'text-accent-green' : 'text-red-400'}`}>
                <span className="inline-flex items-center gap-1">
                  {item.positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {item.change}
                </span>
              </div>
              <div className="hidden sm:block col-span-2 text-right text-sm text-gray-text">{item.volume}</div>
              <div className="hidden sm:block col-span-2 text-right text-sm text-gray-text">{item.cap}</div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial="hidden"
          animate={controls}
          variants={fadeUp}
          className="mt-8 text-center"
        >
          <a
            href="#"
            className="group inline-flex items-center gap-2 text-sm font-medium text-primary-light hover:text-white transition-colors"
          >
            View All Markets
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
