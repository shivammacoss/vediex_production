import { motion } from 'framer-motion';
import { useScrollAnimation, fadeUp, staggerContainer } from '../hooks/useScrollAnimation';
import { Instagram, Facebook, Github } from 'lucide-react';

const linkToSection = {
  'Stock Tokens': '#stock-tokens',
  'Crypto Spot Trading': '#trading-tools',
  'Perpetual Futures': '#solutions',
  'Staking & Earn': '#products',
  'Trading Tools': '#trading-tools',
  'Live Prices': '#markets',
  'Trending Assets': '#markets',
  'Market Overview': '#markets',
  'Trading Pairs': '#markets',
  'New Listings': '#markets',
  'About VEDIEX': '#company',
  'Blog & Insights': '#company',
  'Careers': '#company',
  'Press Kit': '#company',
  'Partners': '#company',
};

const footerLinks = {
  Products: ['Stock Tokens', 'Crypto Spot Trading', 'Perpetual Futures', 'Staking & Earn', 'Trading Tools'],
  Markets: ['Live Prices', 'Trending Assets', 'Market Overview', 'Trading Pairs', 'New Listings'],
  Company: ['About VEDIEX', 'Blog & Insights', 'Careers', 'Press Kit', 'Partners'],
  Legal: ['Terms of Service', 'Privacy Policy', 'Risk Disclosure', 'Cookie Policy', 'Compliance'],
};

const socialLinks = [
  { icon: Instagram, label: 'Instagram', href: '#' },
  { icon: Facebook, label: 'Facebook', href: '#' },
  { icon: Github, label: 'GitHub', href: '#' },
];

function scrollToSection(e, href) {
  e.preventDefault();
  const id = href.slice(1);
  const el = document.getElementById(id);
  if (el) {
    const offset = 64;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}

export default function Footer() {
  const { ref, controls } = useScrollAnimation(0.05);

  return (
    <footer className="relative pt-20 pb-8 bg-dark-card/80 border-t border-border-subtle">
      <div className="absolute inset-0">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary/3 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={controls}
          variants={staggerContainer}
        >
          {/* Top section */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
            {/* Brand column */}
            <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-4 lg:mb-0">
              <a href="#" className="flex items-center gap-2 mb-4">
                <img src="/logo_edited.png" alt="VEDIEX" className="h-14 w-auto" />
              </a>
              <p className="text-sm text-gray-text leading-relaxed mb-6 max-w-xs">
                A smart digital platform designed for speed, security, and full control over your trading experience.
              </p>
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      aria-label={social.label}
                      className="w-9 h-9 rounded-lg bg-white/5 border border-border-subtle flex items-center justify-center text-gray-text hover:text-white hover:bg-primary/20 hover:border-primary/30 transition-all duration-200"
                    >
                      <Icon size={16} />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Link columns */}
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="text-sm font-semibold text-white mb-4">{category}</h4>
                <ul className="space-y-3">
                  {links.map((link) => {
                    const href = linkToSection[link] || '#';
                    return (
                      <li key={link}>
                        <a
                          href={href}
                          onClick={(e) => href !== '#' && scrollToSection(e, href)}
                          className="text-sm text-gray-text hover:text-white transition-colors duration-200 cursor-pointer"
                        >
                          {link}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </motion.div>

          {/* Divider */}
          <motion.div variants={fadeUp} className="border-t border-border-subtle pt-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-text">
                &copy; 2026 VEDIEX. All rights reserved.
              </p>
              <div className="flex items-center gap-6">
                <a href="#" className="text-xs text-gray-text hover:text-white transition-colors">Terms</a>
                <a href="#" className="text-xs text-gray-text hover:text-white transition-colors">Privacy</a>
                <a href="#" className="text-xs text-gray-text hover:text-white transition-colors">Risk Disclosure</a>
                <a href="#" className="text-xs text-gray-text hover:text-white transition-colors">Cookies</a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
}
