import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence, useAnimation, useInView } from 'framer-motion'
import { 
  Menu, X, BarChart3, Bitcoin, TrendingUp, TrendingDown,
  Coins, Star, ArrowRight, LineChart, PieChart, Globe, Zap, DollarSign,
  Activity, Gauge, Shield, Lightbulb, Rocket, Building2, BookOpen, Users, HelpCircle,
  MessageCircle, FileQuestion, Instagram, Facebook, Github, KeyRound, Fingerprint, Server, Lock, Eye, Download,
  Trophy, Target, CheckCircle
} from 'lucide-react'

// Animation hooks
function useScrollAnimation(threshold = 0.15) {
  const controls = useAnimation()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: threshold })

  useEffect(() => {
    if (inView) {
      controls.start('visible')
    }
  }, [controls, inView])

  return { ref, controls }
}

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

// Trade subdomain URL
const TRADE_URL = 'https://trade.vediex.com'

// ============ NAVBAR ============
const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')
  const [scrolled, setScrolled] = useState(false)

  const navLinks = [
    { label: 'Home', href: '#hero' },
    { label: 'Markets', href: '#markets' },
    { label: 'Solutions', href: '#solutions' },
    { label: 'Prop Funding', href: '#prop-funding' },
    { label: 'Company', href: '#company' },
    { label: 'Support', href: '#support' },
  ]

  useEffect(() => {
    const sectionIds = navLinks.map((l) => l.href.slice(1))
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
      const scrollPos = window.scrollY + 100
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i])
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sectionIds[i])
          break
        }
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = useCallback((e, href) => {
    e.preventDefault()
    const id = href.slice(1)
    
    // Close mobile menu first
    setMobileOpen(false)
    
    // Small delay to allow menu to close, then scroll
    setTimeout(() => {
      const el = document.getElementById(id)
      if (el) {
        const offset = 80 // Account for fixed navbar
        const top = el.getBoundingClientRect().top + window.scrollY - offset
        window.scrollTo({ top, behavior: 'smooth' })
      }
    }, 100)
  }, [])

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`fixed top-0 left-0 w-full z-50 backdrop-blur-xl border-b transition-colors duration-300 ${scrolled ? 'bg-[#0B0D17]/90 border-[rgba(108,92,231,0.15)]' : 'bg-transparent border-transparent'}`}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="#hero" onClick={(e) => scrollTo(e, '#hero')} className="flex items-center gap-2 shrink-0">
            <img src="/logo_edited.png" alt="VEDIEX" className="h-14 w-auto" />
          </a>
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.slice(1)
              return (
                <a key={link.label} href={link.href} onClick={(e) => scrollTo(e, link.href)} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${isActive ? 'text-white bg-white/10' : 'text-[#8892B0] hover:text-white hover:bg-white/5'}`}>
                  {link.label}
                </a>
              )
            })}
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <a href="/vediex-app.apk" download className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-500/20 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors">
              <Download size={16} />
              Download App
            </a>
            <a href={`${TRADE_URL}/user/login`} className="px-4 py-2 text-sm font-medium text-white hover:text-[#A29BFE] transition-colors">Log In</a>
            <a href={`${TRADE_URL}/user/signup`} className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] rounded-lg hover:shadow-lg hover:shadow-[#6C5CE7]/25 transition-all">Sign Up</a>
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-[#8892B0] hover:text-white">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="lg:hidden bg-[#12152B]/95 backdrop-blur-xl border-t border-[rgba(108,92,231,0.15)] overflow-hidden">
            <div className="w-full max-w-7xl mx-auto px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <a key={link.label} href={link.href} onClick={(e) => scrollTo(e, link.href)} className={`block px-4 py-3 text-sm rounded-lg ${activeSection === link.href.slice(1) ? 'text-white bg-white/10 font-medium' : 'text-[#8892B0] hover:text-white hover:bg-white/5'}`}>
                  {link.label}
                </a>
              ))}
              <div className="pt-4 flex flex-col gap-2 border-t border-[rgba(108,92,231,0.15)] mt-2">
                <a href="/vediex-app.apk" download className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-green-500/20 border border-green-500/30 rounded-lg">
                  <Download size={16} />
                  Download App
                </a>
                <a href={`${TRADE_URL}/user/login`} className="px-4 py-3 text-sm text-center text-white hover:bg-white/5 rounded-lg">Log In</a>
                <a href={`${TRADE_URL}/user/signup`} className="px-4 py-3 text-sm text-center font-semibold text-white bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] rounded-lg">Sign Up</a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

// ============ HERO ============
const Hero = () => (
  <section id="hero" className="relative min-h-screen flex items-center overflow-hidden bg-[#0B0D17]">
    <div className="absolute inset-0 pointer-events-none">
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
        <source src="/video1.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-r from-[#0B0D17]/80 via-[#0B0D17]/60 to-[#0B0D17]/30" />
    </div>
    <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }} className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight max-w-3xl">
        Access Global Markets{' '}
        <span className="bg-gradient-to-r from-[#A29BFE] via-[#00D2FF] to-[#00B894] bg-clip-text text-transparent">with VEDIEX</span>
      </motion.h1>
      <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.7 }} className="mt-6 text-base sm:text-lg text-[#8892B0] max-w-xl leading-relaxed">
        A smart digital platform designed for speed, security, and full control over your trading experience.
      </motion.p>
    </div>
    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0B0D17] to-transparent pointer-events-none" />
  </section>
)

// ============ PRODUCTS ============
const Products = () => {
  const { ref, controls } = useScrollAnimation()
  const products = [
    { icon: BarChart3, title: 'Stock-Linked Digital Assets', description: 'Gain exposure to global companies through digital stock-linked instruments.', gradient: 'from-blue-500 to-cyan-400' },
    { icon: Bitcoin, title: 'Crypto Spot Trading', description: 'Trade popular digital assets with low fees, deep liquidity, and fast execution.', gradient: 'from-orange-500 to-yellow-400' },
    { icon: TrendingUp, title: 'Perpetual Futures', description: 'Advanced trading tools for experienced traders with leverage options.', gradient: 'from-[#6C5CE7] to-[#A29BFE]' },
    { icon: Coins, title: 'Staking & Earn', description: 'Earn rewards on your digital assets through flexible staking programs.', gradient: 'from-[#00B894] to-emerald-400' },
  ]

  return (
    <section id="products" className="relative py-24 sm:py-32 bg-[#F2F2F2] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <motion.div animate={{ x: [0, -120], y: [0, 120] }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} className="absolute -top-[120px] -left-[120px] w-[calc(100%+240px)] h-[calc(100%+240px)]" style={{ backgroundImage: 'linear-gradient(to right, #9CA3AF 1px, transparent 1px), linear-gradient(to bottom, #9CA3AF 1px, transparent 1px)', backgroundSize: '120px 120px' }} />
      </div>
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white/70 backdrop-blur-md border border-white/40 shadow-[0_4px_40px_rgba(0,0,0,0.06)] p-8 sm:p-12 lg:p-16">
          <motion.div ref={ref} initial="hidden" animate={controls} variants={staggerContainer} className="text-center mb-16">
            <motion.span variants={fadeUp} className="inline-block px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-[#6C5CE7] bg-[#6C5CE7]/10 rounded-full border border-[#6C5CE7]/15 mb-6">Products</motion.span>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1A1A2E] mb-4">Everything You Need to Trade</motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-[#6B7280] max-w-2xl mx-auto">A comprehensive suite of trading products designed for every level of experience.</motion.p>
          </motion.div>
          <motion.div initial="hidden" animate={controls} variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const Icon = product.icon
              return (
                <motion.div key={product.title} variants={fadeUp} whileHover={{ y: -8, transition: { duration: 0.3 } }} className="group relative p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/50 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] transition-all duration-300 cursor-pointer">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${product.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={22} className="text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1A1A2E] mb-2">{product.title}</h3>
                  <p className="text-sm text-[#6B7280] leading-relaxed">{product.description}</p>
                  <div className="mt-4 text-sm font-medium text-[#6C5CE7] opacity-0 group-hover:opacity-100 transition-opacity duration-300">Learn more →</div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ============ MARKETS ============
const Markets = () => {
  const { ref, controls } = useScrollAnimation()
  const [activeTab, setActiveTab] = useState('All Assets')
  const marketData = [
    { symbol: 'BTC', name: 'Bitcoin', price: '$67,842.50', change: '+3.24%', volume: '$28.4B', cap: '$1.33T', positive: true, trending: true },
    { symbol: 'ETH', name: 'Ethereum', price: '$3,456.80', change: '+2.18%', volume: '$15.2B', cap: '$415B', positive: true, trending: true },
    { symbol: 'SOL', name: 'Solana', price: '$178.35', change: '+5.67%', volume: '$4.8B', cap: '$78B', positive: true, trending: true },
    { symbol: 'BNB', name: 'BNB', price: '$612.40', change: '-0.82%', volume: '$2.1B', cap: '$91B', positive: false, trending: false },
    { symbol: 'XRP', name: 'Ripple', price: '$0.6234', change: '+1.45%', volume: '$3.2B', cap: '$34B', positive: true, trending: false },
    { symbol: 'ADA', name: 'Cardano', price: '$0.5812', change: '-1.23%', volume: '$1.8B', cap: '$20B', positive: false, trending: false },
  ]
  const tabs = ['Trending', 'All Assets', 'Gainers', 'Losers']
  const filteredData = marketData.filter((item) => {
    if (activeTab === 'Trending') return item.trending
    if (activeTab === 'Gainers') return item.positive
    if (activeTab === 'Losers') return !item.positive
    return true
  })

  return (
    <section id="markets" className="relative py-24 sm:py-32 bg-[#0B0D17]">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div ref={ref} initial="hidden" animate={controls} variants={staggerContainer} className="text-center mb-16">
          <motion.span variants={fadeUp} className="inline-block px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-[#00D2FF] bg-[#00D2FF]/10 rounded-full border border-[#00D2FF]/20 mb-6">Markets</motion.span>
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">Live Market Prices</motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-[#8892B0] max-w-2xl mx-auto">Trending digital assets and global market overview in real-time.</motion.p>
        </motion.div>
        <motion.div initial="hidden" animate={controls} variants={fadeUp} className="flex items-center justify-center gap-2 mb-8 flex-wrap">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${activeTab === tab ? 'bg-[#6C5CE7] text-white shadow-lg shadow-[#6C5CE7]/25' : 'text-[#8892B0] hover:text-white hover:bg-white/5'}`}>
              {tab}
            </button>
          ))}
        </motion.div>
        <motion.div initial="hidden" animate={controls} variants={fadeUp} className="rounded-2xl bg-[#12152B] border border-[rgba(108,92,231,0.15)] overflow-hidden">
          <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-4 border-b border-[rgba(108,92,231,0.15)] text-xs font-medium text-[#8892B0] uppercase tracking-wider">
            <div className="col-span-1">#</div>
            <div className="col-span-3">Asset</div>
            <div className="col-span-2 text-right">Price</div>
            <div className="col-span-2 text-right">24h Change</div>
            <div className="col-span-2 text-right">Volume</div>
            <div className="col-span-2 text-right">Market Cap</div>
          </div>
          {filteredData.map((item, index) => (
            <motion.div key={item.symbol} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }} className="grid grid-cols-2 sm:grid-cols-12 gap-4 px-6 py-4 border-b border-[rgba(108,92,231,0.15)] last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer items-center">
              <div className="hidden sm:flex col-span-1 items-center gap-2">
                <Star size={14} className="text-[#8892B0]/40 hover:text-yellow-400 transition-colors cursor-pointer" />
                <span className="text-sm text-[#8892B0]">{index + 1}</span>
              </div>
              <div className="col-span-1 sm:col-span-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#6C5CE7]/20 to-[#00D2FF]/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{item.symbol.slice(0, 2)}</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{item.name}</div>
                  <div className="text-xs text-[#8892B0]">{item.symbol}</div>
                </div>
              </div>
              <div className="col-span-1 sm:col-span-2 text-right text-sm font-semibold text-white">{item.price}</div>
              <div className={`hidden sm:block col-span-2 text-right text-sm font-medium ${item.positive ? 'text-[#00B894]' : 'text-red-400'}`}>
                <span className="inline-flex items-center gap-1">
                  {item.positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {item.change}
                </span>
              </div>
              <div className="hidden sm:block col-span-2 text-right text-sm text-[#8892B0]">{item.volume}</div>
              <div className="hidden sm:block col-span-2 text-right text-sm text-[#8892B0]">{item.cap}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ============ PERPETUAL FUTURES ============
const PerpetualFutures = () => {
  const { ref, controls } = useScrollAnimation()
  const chartBars = Array.from({ length: 40 }, (_, i) => 20 + Math.sin(i * 0.3) * 30 + (i % 3) * 12)

  return (
    <section id="solutions" className="relative py-24 sm:py-32 bg-[#12152B]/50">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#6C5CE7]/5 rounded-full blur-[120px]" />
      </div>
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div ref={ref} initial="hidden" animate={controls} variants={staggerContainer} className="text-center mb-16">
          <motion.span variants={fadeUp} className="inline-block px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-[#A29BFE] bg-[#6C5CE7]/10 rounded-full border border-[#6C5CE7]/20 mb-6">Futures</motion.span>
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">Perpetual Futures</motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-[#8892B0] max-w-2xl mx-auto">Advanced trading tools for experienced traders to open long or short positions with leverage.</motion.p>
        </motion.div>
        <motion.div initial="hidden" animate={controls} variants={staggerContainer} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { icon: TrendingUp, label: 'Long Positions', value: 'Go Long', desc: 'Profit from price increases', color: 'text-[#00B894]' },
            { icon: TrendingDown, label: 'Short Positions', value: 'Go Short', desc: 'Profit from price decreases', color: 'text-red-400' },
            { icon: Gauge, label: 'Leverage', value: 'Up to 2000x', desc: 'Amplify your positions', color: 'text-[#A29BFE]' },
            { icon: Shield, label: 'Risk Management', value: 'Advanced Tools', desc: 'Stop-loss & take-profit', color: 'text-[#00D2FF]' },
          ].map((item) => {
            const Icon = item.icon
            return (
              <motion.div key={item.label} variants={fadeUp} whileHover={{ y: -6, transition: { duration: 0.3 } }} className="p-6 rounded-2xl bg-[#1A1D35] border border-[rgba(108,92,231,0.15)] hover:border-[#6C5CE7]/30 transition-all duration-300 text-center">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <Icon size={22} className={item.color} />
                </div>
                <div className="text-lg font-bold text-white mb-1">{item.value}</div>
                <div className="text-sm font-medium text-white/80 mb-1">{item.label}</div>
                <p className="text-xs text-[#8892B0]">{item.desc}</p>
              </motion.div>
            )
          })}
        </motion.div>
        <motion.div initial="hidden" animate={controls} variants={fadeUp} className="rounded-2xl bg-[#1A1D35] border border-[rgba(108,92,231,0.15)] p-6 sm:p-8 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-bold text-white">BTC/USDT Perpetual</h3>
              <span className="px-2 py-1 text-xs font-medium text-[#00B894] bg-[#00B894]/10 rounded">100x</span>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-2xl font-bold text-white">$67,842.50</div>
              <div className="text-sm text-[#00B894]">+3.24%</div>
            </div>
          </div>
          <div className="h-48 sm:h-64 rounded-xl bg-white/[0.02] border border-[rgba(108,92,231,0.15)] flex items-end justify-center gap-1 p-4 mb-6">
            {chartBars.map((height, i) => (
              <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-[#6C5CE7]/40 to-[#A29BFE]/60 min-w-[2px]" style={{ height: `${height}%` }} />
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
                <div className="text-xs text-[#8892B0] mb-1">{stat.label}</div>
                <div className="text-sm font-semibold text-white">{stat.value}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ============ PROP FUNDING CHALLENGE ============
const PropFunding = () => {
  const { ref, controls } = useScrollAnimation()
  const challenges = [
    { name: 'Starter', fundingAmount: '$10,000', price: '$99', profitSplit: '80%', dailyDrawdown: '5%', maxDrawdown: '10%', profitTarget: '8%', color: '#00B894' },
    { name: 'Growth', fundingAmount: '$25,000', price: '$199', profitSplit: '80%', dailyDrawdown: '5%', maxDrawdown: '10%', profitTarget: '8%', color: '#6C5CE7', popular: true },
    { name: 'Pro', fundingAmount: '$50,000', price: '$349', profitSplit: '85%', dailyDrawdown: '5%', maxDrawdown: '10%', profitTarget: '8%', color: '#A29BFE' },
    { name: 'Elite', fundingAmount: '$100,000', price: '$549', profitSplit: '90%', dailyDrawdown: '5%', maxDrawdown: '10%', profitTarget: '8%', color: '#FDCB6E' },
  ]

  return (
    <section id="prop-funding" className="relative py-24 sm:py-32 bg-[#0B0D17]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-[#FDCB6E]/5 rounded-full blur-[120px]" />
      </div>
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div ref={ref} initial="hidden" animate={controls} variants={staggerContainer} className="text-center mb-16">
          <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-[#FDCB6E] bg-[#FDCB6E]/10 rounded-full border border-[#FDCB6E]/20 mb-6">
            <Trophy size={14} />
            Prop Funding Challenge
          </motion.span>
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Get Funded Up To <span className="text-[#FDCB6E]">$100,000</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-[#8892B0] max-w-2xl mx-auto">
            Prove your trading skills and get funded. Trade with our capital, keep up to 90% of the profits. No risk to your own money.
          </motion.p>
        </motion.div>

        {/* How It Works */}
        <motion.div initial="hidden" animate={controls} variants={staggerContainer} className="grid sm:grid-cols-3 gap-6 mb-16">
          {[
            { icon: Target, title: '1. Pass the Challenge', desc: 'Hit the profit target while respecting drawdown limits', color: '#00B894' },
            { icon: CheckCircle, title: '2. Get Verified', desc: 'Complete verification and receive your funded account', color: '#6C5CE7' },
            { icon: DollarSign, title: '3. Earn Profits', desc: 'Trade with our capital and keep up to 90% of profits', color: '#FDCB6E' },
          ].map((step) => {
            const Icon = step.icon
            return (
              <motion.div key={step.title} variants={fadeUp} className="p-6 rounded-2xl bg-[#1A1D35] border border-[rgba(108,92,231,0.15)] text-center">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${step.color}20` }}>
                  <Icon size={22} style={{ color: step.color }} />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-[#8892B0]">{step.desc}</p>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Challenge Tiers */}
        <motion.div initial="hidden" animate={controls} variants={staggerContainer} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {challenges.map((challenge) => (
            <motion.div
              key={challenge.name}
              variants={fadeUp}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className={`relative p-6 rounded-2xl bg-[#1A1D35] border transition-all duration-300 ${
                challenge.popular ? 'border-[#6C5CE7] ring-2 ring-[#6C5CE7]/20' : 'border-[rgba(108,92,231,0.15)] hover:border-[#6C5CE7]/30'
              }`}
            >
              {challenge.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-bold text-white bg-[#6C5CE7] rounded-full">
                  MOST POPULAR
                </div>
              )}
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: `${challenge.color}20` }}>
                  <Trophy size={22} style={{ color: challenge.color }} />
                </div>
                <h3 className="text-white font-bold text-xl mb-1">{challenge.name}</h3>
                <div className="text-3xl font-bold" style={{ color: challenge.color }}>{challenge.fundingAmount}</div>
                <div className="text-sm text-[#8892B0]">Funding</div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-[#8892B0]">Profit Split</span>
                  <span className="text-white font-medium">{challenge.profitSplit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#8892B0]">Daily Drawdown</span>
                  <span className="text-white font-medium">{challenge.dailyDrawdown}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#8892B0]">Max Drawdown</span>
                  <span className="text-white font-medium">{challenge.maxDrawdown}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#8892B0]">Profit Target</span>
                  <span className="text-white font-medium">{challenge.profitTarget}</span>
                </div>
              </div>

              <div className="border-t border-[rgba(108,92,231,0.15)] pt-4">
                <div className="text-center mb-4">
                  <span className="text-sm text-[#8892B0]">One-time fee</span>
                  <div className="text-2xl font-bold text-white">{challenge.price}</div>
                </div>
                <a
                  href={`${TRADE_URL}/user/login`}
                  className={`w-full block text-center py-3 rounded-xl font-semibold transition-all duration-200 ${
                    challenge.popular
                      ? 'bg-[#6C5CE7] hover:bg-[#5B4BD5] text-white'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                  }`}
                >
                  Buy Challenge
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.p variants={fadeUp} className="text-center text-sm text-[#8892B0]/60 mt-10">
          * Challenge rules and profit splits may vary. Please review full terms before purchasing.
        </motion.p>
      </div>
    </section>
  )
}

// ============ SECURITY ============
const Security = () => {
  const { ref, controls } = useScrollAnimation()
  const features = [
    { icon: Lock, title: 'End-to-End Encryption', desc: 'All data encrypted in transit and at rest using AES-256' },
    { icon: Server, title: 'Secure Infrastructure', desc: 'Enterprise-grade servers with DDoS protection' },
    { icon: Eye, title: 'Real-Time Monitoring', desc: '24/7 threat detection and security monitoring' },
    { icon: Fingerprint, title: 'Biometric Auth', desc: 'Multi-factor authentication with biometric support' },
    { icon: KeyRound, title: 'Cold Storage', desc: 'Majority of digital assets stored in cold wallets' },
    { icon: Shield, title: 'Insurance Fund', desc: 'Protected reserves to safeguard user assets' },
  ]

  return (
    <section className="relative py-24 sm:py-32 bg-[#F2F2F2] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <motion.div animate={{ x: [0, -120], y: [0, 120] }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} className="absolute -top-[120px] -left-[120px] w-[calc(100%+240px)] h-[calc(100%+240px)]" style={{ backgroundImage: 'linear-gradient(to right, #9CA3AF 1px, transparent 1px), linear-gradient(to bottom, #9CA3AF 1px, transparent 1px)', backgroundSize: '120px 120px' }} />
      </div>
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white/70 backdrop-blur-md border border-white/40 shadow-[0_4px_40px_rgba(0,0,0,0.06)] p-8 sm:p-12 lg:p-16">
          <motion.div ref={ref} initial="hidden" animate={controls} variants={staggerContainer} className="text-center mb-16">
            <motion.span variants={fadeUp} className="inline-block px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-emerald-600 bg-emerald-500/10 rounded-full border border-emerald-500/15 mb-6">Security</motion.span>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1A1A2E] mb-4">Built for Security and Trust</motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-[#6B7280] max-w-2xl mx-auto">VEDIEX uses industry-grade security systems, encryption, and infrastructure to protect users and digital assets.</motion.p>
          </motion.div>
          <motion.div initial="hidden" animate={controls} variants={staggerContainer} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <motion.div key={feature.title} variants={fadeUp} whileHover={{ y: -6, transition: { duration: 0.3 } }} className="group p-6 rounded-2xl bg-white/80 border border-white/50 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] transition-all duration-300 cursor-pointer">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/15 transition-colors">
                    <Icon size={22} className="text-emerald-600" />
                  </div>
                  <h3 className="text-base font-semibold text-[#1A1A2E] mb-2">{feature.title}</h3>
                  <p className="text-sm text-[#6B7280] leading-relaxed">{feature.desc}</p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ============ COMPANY ============
const Company = () => {
  const { ref, controls } = useScrollAnimation()
  const sections = [
    { icon: Building2, title: 'About VEDIEX', description: 'VEDIEX is a next-generation digital trading platform built for the modern investor.', link: 'Learn More', gradient: 'from-[#6C5CE7] to-[#A29BFE]' },
    { icon: BookOpen, title: 'Blog & Insights', description: 'Stay informed with market analysis, trading strategies, and platform updates.', link: 'Read Blog', gradient: 'from-[#00D2FF] to-blue-400' },
    { icon: Users, title: 'Careers', description: 'Join a team of innovators shaping the future of digital finance.', link: 'View Openings', gradient: 'from-[#00B894] to-emerald-400' },
  ]

  return (
    <section id="company" className="relative py-24 sm:py-32 bg-[#12152B]/50">
      <div className="absolute inset-0"><div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#6C5CE7]/5 rounded-full blur-[120px]" /></div>
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div ref={ref} initial="hidden" animate={controls} variants={staggerContainer} className="text-center mb-16">
          <motion.span variants={fadeUp} className="inline-block px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-[#A29BFE] bg-[#6C5CE7]/10 rounded-full border border-[#6C5CE7]/20 mb-6">Company</motion.span>
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">About VEDIEX</motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-[#8892B0] max-w-2xl mx-auto">Building the future of digital trading with innovation, transparency, and trust.</motion.p>
        </motion.div>
        <motion.div initial="hidden" animate={controls} variants={staggerContainer} className="grid md:grid-cols-3 gap-6">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <motion.div key={section.title} variants={fadeUp} whileHover={{ y: -8, transition: { duration: 0.3 } }} className="group relative p-8 rounded-2xl bg-[#1A1D35] border border-[rgba(108,92,231,0.15)] hover:border-[#6C5CE7]/30 transition-all duration-300 cursor-pointer">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${section.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={26} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{section.title}</h3>
                <p className="text-sm text-[#8892B0] leading-relaxed mb-6">{section.description}</p>
                <a href="#" className="group/link inline-flex items-center gap-2 text-sm font-medium text-[#A29BFE] hover:text-white transition-colors">
                  {section.link}
                  <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                </a>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

// ============ SUPPORT ============
const Support = () => {
  const { ref, controls } = useScrollAnimation()
  const supportItems = [
    { icon: HelpCircle, title: 'Help Center', description: 'Browse our comprehensive knowledge base with guides and tutorials.', link: 'Visit Help Center', gradient: 'from-[#6C5CE7] to-[#A29BFE]' },
    { icon: FileQuestion, title: 'FAQ', description: 'Find quick answers to the most commonly asked questions.', link: 'View FAQ', gradient: 'from-[#00D2FF] to-blue-400' },
    { icon: MessageCircle, title: 'Contact Support', description: 'Get in touch with our dedicated support team available 24/7.', link: 'Contact Us', gradient: 'from-[#00B894] to-emerald-400' },
  ]

  return (
    <section id="support" className="relative py-24 sm:py-32 bg-[#0B0D17]">
      <div className="absolute inset-0"><div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#00D2FF]/5 rounded-full blur-[120px]" /></div>
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div ref={ref} initial="hidden" animate={controls} variants={staggerContainer} className="text-center mb-16">
          <motion.span variants={fadeUp} className="inline-block px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-[#00D2FF] bg-[#00D2FF]/10 rounded-full border border-[#00D2FF]/20 mb-6">Support</motion.span>
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">How Can We Help?</motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-[#8892B0] max-w-2xl mx-auto">Our support team is here to help you every step of the way.</motion.p>
        </motion.div>
        <motion.div initial="hidden" animate={controls} variants={staggerContainer} className="grid md:grid-cols-3 gap-6">
          {supportItems.map((item) => {
            const Icon = item.icon
            return (
              <motion.div key={item.title} variants={fadeUp} whileHover={{ y: -8, transition: { duration: 0.3 } }} className="group relative p-8 rounded-2xl bg-[#12152B] border border-[rgba(108,92,231,0.15)] hover:border-[#00D2FF]/30 transition-all duration-300 cursor-pointer text-center">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={28} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-sm text-[#8892B0] leading-relaxed mb-6">{item.description}</p>
                <a href="#" className="group/link inline-flex items-center gap-2 text-sm font-medium text-[#A29BFE] hover:text-white transition-colors">
                  {item.link}
                  <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                </a>
              </motion.div>
            )
          })}
        </motion.div>
        <motion.div initial="hidden" animate={controls} variants={fadeUp} className="mt-16 text-center p-8 sm:p-12 rounded-2xl bg-gradient-to-br from-[#12152B] to-[#1A1D35] border border-[rgba(108,92,231,0.15)]">
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">Ready to Start Trading?</h3>
          <p className="text-[#8892B0] max-w-lg mx-auto mb-8">Join millions of users worldwide and experience the future of digital trading.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/signup" className="px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] rounded-xl hover:shadow-xl hover:shadow-[#6C5CE7]/30 transition-all duration-300 hover:-translate-y-0.5">Create Free Account</a>
            <a href="#" className="px-8 py-4 text-base font-semibold text-white bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300">Contact Sales</a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ============ FOOTER ============
const Footer = () => {
  const { ref, controls } = useScrollAnimation(0.05)
  const footerLinks = {
    Products: [
      { label: 'Stock Tokens', href: '#solutions' },
      { label: 'Crypto Spot Trading', href: '#solutions' },
      { label: 'Perpetual Futures', href: '#solutions' },
      { label: 'Staking & Earn', href: '#solutions' },
    ],
    Markets: [
      { label: 'Live Prices', href: '#markets' },
      { label: 'Trending Assets', href: '#markets' },
      { label: 'Market Overview', href: '#markets' },
      { label: 'Trading Pairs', href: `${TRADE_URL}/user/login` },
    ],
    Company: [
      { label: 'About VEDIEX', href: '#company' },
      { label: 'Blog & Insights', href: '#company' },
      { label: 'Careers', href: '#company' },
      { label: 'Partners', href: '#company' },
    ],
    Legal: [
      { label: 'Terms of Service', href: '/terms-of-service' },
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Risk Disclosure', href: '/terms-of-service' },
      { label: 'Compliance', href: '/terms-of-service' },
    ],
  }
  const socialLinks = [
    { icon: Instagram, label: 'Instagram', href: 'https://instagram.com' },
    { icon: Facebook, label: 'Facebook', href: 'https://facebook.com' },
    { icon: Github, label: 'GitHub', href: 'https://github.com' },
  ]
  
  const handleFooterClick = (e, href) => {
    if (href.startsWith('#')) {
      e.preventDefault()
      const id = href.slice(1)
      const el = document.getElementById(id)
      if (el) {
        const offset = 80
        const top = el.getBoundingClientRect().top + window.scrollY - offset
        window.scrollTo({ top, behavior: 'smooth' })
      }
    }
  }

  return (
    <footer className="relative pt-20 pb-8 bg-[#12152B]/80 border-t border-[rgba(108,92,231,0.15)]">
      <div className="absolute inset-0"><div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#6C5CE7]/3 rounded-full blur-[120px]" /></div>
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div ref={ref} initial="hidden" animate={controls} variants={staggerContainer}>
          <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
            <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-4 lg:mb-0">
              <a href="#" className="flex items-center gap-2 mb-4">
                <img src="/logo_edited.png" alt="VEDIEX" className="h-14 w-auto" />
              </a>
              <p className="text-sm text-[#8892B0] leading-relaxed mb-6 max-w-xs">A smart digital platform designed for speed, security, and full control over your trading experience.</p>
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon
                  return (
                    <a key={social.label} href={social.href} aria-label={social.label} className="w-9 h-9 rounded-lg bg-white/5 border border-[rgba(108,92,231,0.15)] flex items-center justify-center text-[#8892B0] hover:text-white hover:bg-[#6C5CE7]/20 hover:border-[#6C5CE7]/30 transition-all duration-200">
                      <Icon size={16} />
                    </a>
                  )
                })}
              </div>
            </div>
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="text-sm font-semibold text-white mb-4">{category}</h4>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <a href={link.href} onClick={(e) => handleFooterClick(e, link.href)} className="text-sm text-[#8892B0] hover:text-white transition-colors duration-200 cursor-pointer">{link.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </motion.div>
          <motion.div variants={fadeUp} className="border-t border-[rgba(108,92,231,0.15)] pt-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-[#8892B0]">&copy; 2026 VEDIEX. All rights reserved.</p>
              <div className="flex items-center gap-6">
                <a href="/terms-of-service" className="text-xs text-[#8892B0] hover:text-white transition-colors">Terms</a>
                <a href="/privacy-policy" className="text-xs text-[#8892B0] hover:text-white transition-colors">Privacy</a>
                <a href="#" className="text-xs text-[#8892B0] hover:text-white transition-colors">Risk Disclosure</a>
                <a href="#" className="text-xs text-[#8892B0] hover:text-white transition-colors">Cookies</a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  )
}

// ============ MAIN LANDING PAGE ============
const LandingPageNew = () => {
  return (
    <div className="min-h-screen bg-[#0B0D17] overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <Products />
        <Markets />
        <PerpetualFutures />
        <PropFunding />
        <Security />
        <Company />
        <Support />
      </main>
      <Footer />
    </div>
  )
}

export default LandingPageNew
