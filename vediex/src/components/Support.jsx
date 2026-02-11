import { motion } from 'framer-motion';
import { useScrollAnimation, fadeUp, staggerContainer } from '../hooks/useScrollAnimation';
import { HelpCircle, MessageCircle, FileQuestion, ArrowRight } from 'lucide-react';

const supportItems = [
  {
    icon: HelpCircle,
    title: 'Help Center',
    description: 'Browse our comprehensive knowledge base with guides, tutorials, and troubleshooting articles.',
    link: 'Visit Help Center',
    gradient: 'from-primary to-primary-light',
  },
  {
    icon: FileQuestion,
    title: 'FAQ',
    description: 'Find quick answers to the most commonly asked questions about our platform and services.',
    link: 'View FAQ',
    gradient: 'from-accent to-blue-400',
  },
  {
    icon: MessageCircle,
    title: 'Contact Support',
    description: 'Get in touch with our dedicated support team available 24/7 to assist you with any issues.',
    link: 'Contact Us',
    gradient: 'from-accent-green to-emerald-400',
  },
];

export default function Support() {
  const { ref, controls } = useScrollAnimation();

  return (
    <section id="support" className="relative py-24 sm:py-32">
      <div className="absolute inset-0">
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px]" />
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
            className="inline-block px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-accent bg-accent/10 rounded-full border border-accent/20 mb-6"
          >
            Support
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4"
          >
            How Can We Help?
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-lg text-gray-text max-w-2xl mx-auto"
          >
            Our support team is here to help you every step of the way.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={controls}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-6"
        >
          {supportItems.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                variants={fadeUp}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group relative p-8 rounded-2xl bg-dark-card border border-border-subtle hover:border-accent/30 transition-all duration-300 cursor-pointer text-center"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={28} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-sm text-gray-text leading-relaxed mb-6">{item.description}</p>
                <a
                  href="#"
                  className="group/link inline-flex items-center gap-2 text-sm font-medium text-primary-light hover:text-white transition-colors"
                >
                  {item.link}
                  <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                </a>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial="hidden"
          animate={controls}
          variants={fadeUp}
          className="mt-16 text-center p-8 sm:p-12 rounded-2xl bg-gradient-to-br from-dark-card to-dark-surface border border-border-subtle"
        >
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Ready to Start Trading?
          </h3>
          <p className="text-gray-text max-w-lg mx-auto mb-8">
            Join millions of users worldwide and experience the future of digital trading.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#"
              className="px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-primary to-primary-light rounded-xl hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              Create Free Account
            </a>
            <a
              href="#"
              className="px-8 py-4 text-base font-semibold text-white bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300"
            >
              Contact Sales
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
