import { motion } from 'framer-motion';
import { useScrollAnimation, fadeUp, staggerContainer } from '../hooks/useScrollAnimation';
import { Lightbulb, Rocket, TrendingUp } from 'lucide-react';

const highlights = [
  {
    icon: Lightbulb,
    title: 'Innovation',
    description: 'Pioneering new ways to access and trade digital assets with cutting-edge technology and intuitive design.',
    gradient: 'from-primary to-primary-light',
    stat: '50+',
    statLabel: 'Features Released',
  },
  {
    icon: Rocket,
    title: 'Performance',
    description: 'Ultra-low latency execution engine processing thousands of transactions per second with 99.9% uptime.',
    gradient: 'from-accent to-blue-400',
    stat: '<10ms',
    statLabel: 'Avg. Latency',
  },
  {
    icon: TrendingUp,
    title: 'Continuous Platform Growth',
    description: 'Constantly expanding our product offerings, supported markets, and platform capabilities to serve traders globally.',
    gradient: 'from-accent-green to-emerald-400',
    stat: '200%',
    statLabel: 'YoY Growth',
  },
];

export default function Highlights() {
  const { ref, controls } = useScrollAnimation();

  return (
    <section className="relative py-24 sm:py-32 bg-dark-card/50">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
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
            Why VEDIEX
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white"
          >
            Platform Highlights
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={controls}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-6"
        >
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                variants={fadeUp}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group relative p-8 rounded-2xl bg-dark-surface border border-border-subtle hover:border-primary/30 transition-all duration-300 overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${item.gradient} opacity-5 rounded-full blur-[40px] group-hover:opacity-10 transition-opacity pointer-events-none`} />

                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={26} className="text-white" />
                </div>

                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-sm text-gray-text leading-relaxed mb-6">{item.description}</p>

                <div className="pt-6 border-t border-border-subtle">
                  <div className="text-3xl font-bold text-white">{item.stat}</div>
                  <div className="text-sm text-gray-text mt-1">{item.statLabel}</div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
