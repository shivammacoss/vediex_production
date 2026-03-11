import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, Search, Book, CreditCard, Shield, Settings, Users, TrendingUp, ChevronRight, ExternalLink } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const HelpCenterPage = () => {
  const [searchQuery, setSearchQuery] = useState('')

  const categories = [
    {
      icon: Book,
      title: 'Getting Started',
      description: 'Learn the basics of using VEDIEX',
      articles: ['How to create an account', 'Verifying your identity (KYC)', 'Setting up two-factor authentication', 'Understanding the dashboard'],
      color: '#6C5CE7',
    },
    {
      icon: CreditCard,
      title: 'Deposits & Withdrawals',
      description: 'Managing your funds',
      articles: ['How to deposit funds', 'Withdrawal methods and fees', 'Processing times', 'Minimum deposit requirements'],
      color: '#00D2FF',
    },
    {
      icon: TrendingUp,
      title: 'Trading',
      description: 'Everything about trading',
      articles: ['Placing your first trade', 'Understanding order types', 'Using leverage', 'Reading charts and indicators'],
      color: '#00B894',
    },
    {
      icon: Shield,
      title: 'Security',
      description: 'Keeping your account safe',
      articles: ['Password best practices', 'Enabling 2FA', 'Recognizing phishing attempts', 'Account recovery'],
      color: '#FDCB6E',
    },
    {
      icon: Users,
      title: 'Copy Trading',
      description: 'Follow expert traders',
      articles: ['How copy trading works', 'Choosing traders to follow', 'Managing your copy portfolio', 'Understanding fees'],
      color: '#E17055',
    },
    {
      icon: Settings,
      title: 'Account Settings',
      description: 'Manage your preferences',
      articles: ['Updating personal information', 'Notification settings', 'API access', 'Closing your account'],
      color: '#A29BFE',
    },
  ]

  const popularArticles = [
    'How to deposit funds using cryptocurrency',
    'Understanding trading fees and spreads',
    'How to withdraw profits to your bank account',
    'Setting up stop-loss and take-profit orders',
    'Verifying your identity (KYC) requirements',
  ]

  return (
    <div className="min-h-screen bg-[#0B0D17]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0B0D17]/90 backdrop-blur-xl border-b border-[rgba(108,92,231,0.15)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo_edited.png" alt="VEDIEX" className="h-10 w-auto" />
            </Link>
            <Link to="/" className="flex items-center gap-2 text-[#8892B0] hover:text-white transition-colors">
              <ArrowLeft size={18} />
              <span className="text-sm">Back to Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero with Search */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-b from-[#12152B] to-[#0B0D17]">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.span variants={fadeUp} className="inline-block px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-[#6C5CE7] bg-[#6C5CE7]/10 rounded-full border border-[#6C5CE7]/20 mb-6">
              Help Center
            </motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl font-bold text-white mb-6">
              How Can We Help You?
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-[#8892B0] mb-8">
              Search our knowledge base or browse categories below
            </motion.p>
            <motion.div variants={fadeUp} className="relative">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8892B0]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for articles..."
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-[#1A1D35] border border-[rgba(108,92,231,0.15)] text-white placeholder-[#8892B0] focus:outline-none focus:border-[#6C5CE7] transition-colors"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <motion.div key={category.title} variants={fadeUp} className="group p-6 rounded-2xl bg-[#12152B] border border-[rgba(108,92,231,0.15)] hover:border-[#6C5CE7]/30 transition-all cursor-pointer">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${category.color}20` }}>
                    <Icon size={22} style={{ color: category.color }} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#6C5CE7] transition-colors">{category.title}</h3>
                  <p className="text-sm text-[#8892B0] mb-4">{category.description}</p>
                  <ul className="space-y-2">
                    {category.articles.map((article) => (
                      <li key={article} className="flex items-center gap-2 text-sm text-[#8892B0] hover:text-white transition-colors cursor-pointer">
                        <ChevronRight size={14} className="text-[#6C5CE7]" />
                        {article}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-16 px-4 bg-[#12152B]/50">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            <motion.h2 variants={fadeUp} className="text-2xl font-bold text-white mb-8 text-center">Popular Articles</motion.h2>
            <motion.div variants={fadeUp} className="space-y-3">
              {popularArticles.map((article) => (
                <div key={article} className="flex items-center justify-between p-4 rounded-xl bg-[#1A1D35] border border-[rgba(108,92,231,0.15)] hover:border-[#6C5CE7]/30 transition-all cursor-pointer group">
                  <span className="text-[#8892B0] group-hover:text-white transition-colors">{article}</span>
                  <ExternalLink size={16} className="text-[#6C5CE7]" />
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            <motion.h2 variants={fadeUp} className="text-3xl font-bold text-white mb-4">Still Need Help?</motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-[#8892B0] mb-8">Our support team is available 24/7 to assist you with any questions.</motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/contact" className="px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] rounded-xl hover:shadow-xl hover:shadow-[#6C5CE7]/30 transition-all">
                Contact Support
              </Link>
              <Link to="/faq" className="px-8 py-4 text-base font-semibold text-white bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
                View FAQ
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-[rgba(108,92,231,0.15)]">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-[#8892B0]">&copy; {new Date().getFullYear()} VEDIEX. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default HelpCenterPage
