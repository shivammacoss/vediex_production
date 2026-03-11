import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, ChevronDown, Search } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const FAQPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [openIndex, setOpenIndex] = useState(null)
  const [activeCategory, setActiveCategory] = useState('All')

  const categories = ['All', 'Account', 'Trading', 'Deposits', 'Withdrawals', 'Security', 'Fees']

  const faqs = [
    {
      category: 'Account',
      question: 'How do I create an account?',
      answer: 'Creating an account is simple. Click the "Sign Up" button, enter your email address, create a secure password, and verify your email. You can then complete your profile and start trading after identity verification.',
    },
    {
      category: 'Account',
      question: 'What documents do I need for verification?',
      answer: 'For identity verification (KYC), you\'ll need a valid government-issued ID (passport, driver\'s license, or national ID) and a proof of address document (utility bill, bank statement, or government letter) dated within the last 3 months.',
    },
    {
      category: 'Account',
      question: 'How long does verification take?',
      answer: 'Most verifications are completed within 24 hours. In some cases, it may take up to 72 hours if additional review is required. You\'ll receive an email notification once your account is verified.',
    },
    {
      category: 'Trading',
      question: 'What markets can I trade on VEDIEX?',
      answer: 'VEDIEX offers trading across multiple markets including Forex (50+ currency pairs), Cryptocurrencies (100+ coins), Stocks (1000+ global stocks), Commodities (gold, silver, oil), and Indices (major global indices).',
    },
    {
      category: 'Trading',
      question: 'What is leverage and how does it work?',
      answer: 'Leverage allows you to control a larger position with a smaller amount of capital. For example, with 100x leverage, you can control $10,000 worth of assets with just $100. While leverage can amplify profits, it also increases risk.',
    },
    {
      category: 'Trading',
      question: 'What are stop-loss and take-profit orders?',
      answer: 'Stop-loss orders automatically close your position when the price reaches a specified level to limit losses. Take-profit orders close your position when the price reaches your target profit level. Both are essential risk management tools.',
    },
    {
      category: 'Deposits',
      question: 'What deposit methods are available?',
      answer: 'We accept various deposit methods including bank transfers, credit/debit cards (Visa, Mastercard), cryptocurrency deposits (BTC, ETH, USDT), and popular e-wallets. Available methods may vary by region.',
    },
    {
      category: 'Deposits',
      question: 'What is the minimum deposit amount?',
      answer: 'The minimum deposit varies by account type. Standard accounts require a minimum of $100, while premium accounts may have higher minimums. Cryptocurrency deposits have no minimum amount.',
    },
    {
      category: 'Deposits',
      question: 'How long do deposits take to process?',
      answer: 'Cryptocurrency deposits are usually credited within 10-30 minutes after network confirmations. Bank transfers take 1-3 business days. Card deposits are typically instant.',
    },
    {
      category: 'Withdrawals',
      question: 'How do I withdraw funds?',
      answer: 'Go to your Wallet, click "Withdraw", select your preferred withdrawal method, enter the amount, and confirm. Withdrawals are processed within 24 hours and may take additional time depending on the method.',
    },
    {
      category: 'Withdrawals',
      question: 'Are there withdrawal fees?',
      answer: 'Withdrawal fees vary by method. Bank transfers have a flat fee of $25, cryptocurrency withdrawals include network fees, and e-wallet withdrawals are typically free. Check the Fees page for current rates.',
    },
    {
      category: 'Withdrawals',
      question: 'What is the maximum withdrawal limit?',
      answer: 'Withdrawal limits depend on your verification level and account type. Fully verified accounts can withdraw up to $100,000 per day. Contact support for higher limits.',
    },
    {
      category: 'Security',
      question: 'How is my account protected?',
      answer: 'We use industry-leading security measures including 256-bit SSL encryption, two-factor authentication (2FA), cold storage for digital assets, and 24/7 security monitoring. We also offer biometric login on mobile devices.',
    },
    {
      category: 'Security',
      question: 'What should I do if I suspect unauthorized access?',
      answer: 'Immediately change your password, enable 2FA if not already active, and contact our support team. We can temporarily freeze your account while we investigate. Review your recent activity and report any suspicious transactions.',
    },
    {
      category: 'Fees',
      question: 'What are the trading fees?',
      answer: 'Trading fees vary by asset class. Forex spreads start from 0.1 pips, crypto trading fees are 0.1% maker / 0.2% taker, and stock CFDs have spreads starting from 0.01%. Volume discounts are available for active traders.',
    },
    {
      category: 'Fees',
      question: 'Are there any hidden fees?',
      answer: 'No, we believe in transparent pricing. All fees are clearly displayed before you confirm any transaction. You can view our complete fee schedule on the Fees page or in your account settings.',
    },
  ]

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = activeCategory === 'All' || faq.category === activeCategory
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

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

      {/* Hero */}
      <section className="pt-32 pb-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.span variants={fadeUp} className="inline-block px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-[#00D2FF] bg-[#00D2FF]/10 rounded-full border border-[#00D2FF]/20 mb-6">
              FAQ
            </motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Frequently Asked Questions
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-[#8892B0] mb-8">
              Find quick answers to the most commonly asked questions
            </motion.p>
            <motion.div variants={fadeUp} className="relative">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8892B0]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions..."
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-[#1A1D35] border border-[rgba(108,92,231,0.15)] text-white placeholder-[#8892B0] focus:outline-none focus:border-[#6C5CE7] transition-colors"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeCategory === category
                    ? 'bg-[#6C5CE7] text-white'
                    : 'text-[#8892B0] hover:text-white hover:bg-white/5'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ List */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-4">
            {filteredFaqs.map((faq, index) => (
              <motion.div key={index} variants={fadeUp} className="rounded-xl bg-[#12152B] border border-[rgba(108,92,231,0.15)] overflow-hidden">
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <div className="flex items-center gap-4">
                    <span className="px-2 py-1 text-xs font-medium text-[#00D2FF] bg-[#00D2FF]/10 rounded">{faq.category}</span>
                    <span className="text-white font-medium">{faq.question}</span>
                  </div>
                  <ChevronDown size={20} className={`text-[#8892B0] transition-transform ${openIndex === index ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 text-[#8892B0] leading-relaxed border-t border-[rgba(108,92,231,0.15)] pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>

          {filteredFaqs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[#8892B0]">No questions found matching your search.</p>
            </div>
          )}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 px-4 bg-[#12152B]/50">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            <motion.h2 variants={fadeUp} className="text-3xl font-bold text-white mb-4">Still Have Questions?</motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-[#8892B0] mb-8">Can't find what you're looking for? Our support team is here to help.</motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/contact" className="px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] rounded-xl hover:shadow-xl hover:shadow-[#6C5CE7]/30 transition-all">
                Contact Support
              </Link>
              <Link to="/help-center" className="px-8 py-4 text-base font-semibold text-white bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
                Visit Help Center
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

export default FAQPage
