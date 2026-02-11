import { motion } from 'framer-motion';
import { useScrollAnimation, fadeUp, staggerContainer } from '../hooks/useScrollAnimation';
import { Building2, BookOpen, Users, ArrowRight } from 'lucide-react';

const sections = [
  {
    icon: Building2,
    title: 'About VEDIEX',
    description: 'VEDIEX is a next-generation digital trading platform built for the modern investor. We combine cutting-edge technology with institutional-grade security to provide seamless access to global markets.',
    link: 'Learn More',
    gradient: 'from-primary to-primary-light',
  },
  {
    icon: BookOpen,
    title: 'Blog & Insights',
    description: 'Stay informed with market analysis, trading strategies, platform updates, and industry insights from our expert team.',
    link: 'Read Blog',
    gradient: 'from-accent to-blue-400',
  },
  {
    icon: Users,
    title: 'Careers',
    description: 'Join a team of innovators shaping the future of digital finance. We are always looking for talented individuals who share our vision.',
    link: 'View Openings',
    gradient: 'from-accent-green to-emerald-400',
  },
];

export default function Company() {
  const { ref, controls } = useScrollAnimation();

  return (
    <section id="company" className="relative py-24 sm:py-32 bg-dark-card/50">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
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
            Company
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4"
          >
            About VEDIEX
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-lg text-gray-text max-w-2xl mx-auto"
          >
            Building the future of digital trading with innovation, transparency, and trust.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={controls}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-6"
        >
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.title}
                variants={fadeUp}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group relative p-8 rounded-2xl bg-dark-surface border border-border-subtle hover:border-primary/30 transition-all duration-300 cursor-pointer"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${section.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={26} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{section.title}</h3>
                <p className="text-sm text-gray-text leading-relaxed mb-6">{section.description}</p>
                <a
                  href="#"
                  className="group/link inline-flex items-center gap-2 text-sm font-medium text-primary-light hover:text-white transition-colors"
                >
                  {section.link}
                  <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                </a>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
