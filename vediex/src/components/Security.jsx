import { motion } from 'framer-motion';
import { useScrollAnimation, fadeUp, staggerContainer } from '../hooks/useScrollAnimation';
import { Shield, Lock, Server, Eye, Fingerprint, KeyRound } from 'lucide-react';

const features = [
  { icon: Lock, title: 'End-to-End Encryption', desc: 'All data encrypted in transit and at rest using AES-256' },
  { icon: Server, title: 'Secure Infrastructure', desc: 'Enterprise-grade servers with DDoS protection' },
  { icon: Eye, title: 'Real-Time Monitoring', desc: '24/7 threat detection and security monitoring' },
  { icon: Fingerprint, title: 'Biometric Auth', desc: 'Multi-factor authentication with biometric support' },
  { icon: KeyRound, title: 'Cold Storage', desc: 'Majority of digital assets stored in cold wallets' },
  { icon: Shield, title: 'Insurance Fund', desc: 'Protected reserves to safeguard user assets' },
];

export default function Security() {
  const { ref, controls } = useScrollAnimation();

  return (
    <section className="relative py-24 sm:py-32 bg-[#F2F2F2] overflow-hidden">
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
              className="inline-block px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-emerald-600 bg-emerald-500/10 rounded-full border border-emerald-500/15 mb-6"
            >
              Security
            </motion.span>
            <motion.h2
              variants={fadeUp}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1A1A2E] mb-4"
            >
              Built for Security and Trust
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-lg text-[#6B7280] max-w-2xl mx-auto"
            >
              VEDIEX uses industry-grade security systems, encryption, and infrastructure to protect users and digital assets.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={controls}
            variants={staggerContainer}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={fadeUp}
                  whileHover={{ y: -6, transition: { duration: 0.3 } }}
                  className="group p-6 rounded-2xl bg-white/80 border border-white/50 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] transition-all duration-300 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/15 transition-colors">
                    <Icon size={22} className="text-emerald-600" />
                  </div>
                  <h3 className="text-base font-semibold text-[#1A1A2E] mb-2">{feature.title}</h3>
                  <p className="text-sm text-[#6B7280] leading-relaxed">{feature.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div
            initial="hidden"
            animate={controls}
            variants={fadeUp}
            className="mt-16 text-center"
          >
            <div className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/80 border border-white/50 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
              <Shield size={24} className="text-emerald-600" />
              <span className="text-lg font-semibold text-[#1A1A2E]">Trusted by millions of users worldwide</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
