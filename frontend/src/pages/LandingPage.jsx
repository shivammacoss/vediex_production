import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  TrendingUp, TrendingDown, Shield, Zap, Globe, Smartphone, BarChart3,
  Menu, X, Download, ArrowRight, ChevronRight, Users, Award, Clock, Lock,
  DollarSign, LineChart, PieChart, Wallet, CreditCard, Headphones
} from 'lucide-react'
import logoImage from '../assets/Vediex.png'

// ============ NAVBAR COMPONENT ============
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  const menuItems = [
    { name: 'Markets', href: '#markets' },
    { name: 'Features', href: '#features' },
    { name: 'Why Vediex', href: '#why-us' },
    { name: 'Download App', href: '#download' },
  ]

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-[100] w-full border-b transition-all duration-300 ${
        isScrolled ? 'bg-black/90 border-white/10 backdrop-blur-lg' : 'bg-black/40 border-white/5 backdrop-blur-lg'
      }`}>
        <div className="mx-auto flex h-[70px] md:h-[86px] max-w-[1440px] items-center justify-between px-4 md:px-6 xl:px-8">
          <div className="flex shrink-0 items-center">
            <a href="/" className="flex items-center" aria-label="Vediex Home">
              <img 
                src={logoImage} 
                alt="Vediex Logo" 
                className="h-12 md:h-14 w-auto object-contain"
              />
            </a>
          </div>

          <div className="hidden items-center gap-x-6 lg:gap-x-8 lg:flex">
            {menuItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-[14px] lg:text-[15px] font-medium text-white transition-opacity hover:opacity-80"
              >
                {item.name}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            <a
              href="/vediex.apk"
              download
              className="flex items-center gap-2 rounded-lg border border-green-500/50 bg-green-500/10 px-4 lg:px-5 py-2 lg:py-2.5 text-[14px] lg:text-[15px] font-semibold text-green-400 backdrop-blur-sm transition-all hover:bg-green-500/20 active:scale-95"
            >
              <Download className="w-4 h-4" />
              Download APK
            </a>
            <a
              href="/user/login"
              className="rounded-lg border border-white/20 bg-white/5 px-4 lg:px-5 py-2 lg:py-2.5 text-[14px] lg:text-[15px] font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10 active:scale-95"
            >
              Sign In
            </a>
            <a
              href="/user/signup"
              className="rounded-lg bg-white px-4 lg:px-5 py-2 lg:py-2.5 text-[14px] lg:text-[15px] font-semibold text-[#111111] transition-all hover:bg-opacity-90 active:scale-95"
            >
              Get Started
            </a>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[99] bg-black/95 backdrop-blur-lg md:hidden pt-[70px]">
          <div className="flex flex-col h-full px-6 py-8">
            <div className="flex flex-col gap-4">
              {menuItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[18px] font-medium text-white py-3 border-b border-white/10 transition-opacity hover:opacity-80"
                >
                  {item.name}
                </a>
              ))}
            </div>
            <div className="mt-8 flex flex-col gap-4">
              <a
                href="/vediex.apk"
                download
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-green-500/50 bg-green-500/10 px-5 py-3 text-[16px] font-semibold text-green-400 transition-all hover:bg-green-500/20"
              >
                <Download className="w-5 h-5" />
                Download APK
              </a>
              <a
                href="/user/login"
                className="w-full rounded-lg border border-white/20 bg-white/5 px-5 py-3 text-[16px] font-semibold text-white transition-all hover:bg-white/10 text-center"
              >
                Sign In
              </a>
              <a
                href="/user/signup"
                className="w-full rounded-lg bg-white px-5 py-3 text-[16px] font-semibold text-[#111111] transition-all hover:bg-opacity-90 text-center"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ============ LIVE PRICE TICKER ============
const LivePriceTicker = () => {
  const prices = [
    { symbol: 'EUR/USD', price: '1.0847', change: '+0.12%', up: true },
    { symbol: 'GBP/USD', price: '1.2634', change: '+0.08%', up: true },
    { symbol: 'XAU/USD', price: '2,341.50', change: '-0.24%', up: false },
    { symbol: 'BTC/USD', price: '67,432', change: '+2.15%', up: true },
    { symbol: 'USD/JPY', price: '154.82', change: '-0.05%', up: false },
    { symbol: 'ETH/USD', price: '3,245', change: '+1.87%', up: true },
  ]

  return (
    <div className="bg-[#0a0a0a] border-y border-white/10 py-3 overflow-hidden">
      <div className="flex animate-scroll gap-8">
        {[...prices, ...prices].map((item, i) => (
          <div key={i} className="flex items-center gap-3 whitespace-nowrap">
            <span className="text-white font-semibold">{item.symbol}</span>
            <span className="text-white/80">{item.price}</span>
            <span className={`text-sm font-medium ${item.up ? 'text-green-400' : 'text-red-400'}`}>
              {item.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============ HERO COMPONENT ============
const Hero = () => {
  const navigate = useNavigate()

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] text-white">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[90vh] flex-col items-center justify-center px-4 sm:px-6 pt-24 pb-12 md:px-12 lg:pt-32 lg:pb-16 max-w-[1400px]">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 w-full">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 mb-6">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-emerald-400 text-sm font-medium">Live Trading Available 24/7</span>
            </div>

            <h1 className="text-[32px] sm:text-[42px] md:text-[52px] lg:text-[60px] leading-[1.1] font-bold tracking-tight mb-6">
              Trade <span className="text-emerald-400">Forex</span>, <span className="text-blue-400">Crypto</span> & <span className="text-amber-400">Gold</span> with Confidence
            </h1>

            <p className="text-[16px] sm:text-[18px] leading-[1.7] text-white/70 mb-8 max-w-[540px] mx-auto lg:mx-0">
              Access global markets with tight spreads, lightning-fast execution, and powerful trading tools. Start trading with as little as $10.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start mb-10">
              <a
                href="/user/signup"
                className="w-full sm:w-auto rounded-xl bg-emerald-500 hover:bg-emerald-400 px-8 py-4 text-[16px] font-bold text-black transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-center flex items-center justify-center gap-2"
              >
                Start Trading Now
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="/user/login"
                className="w-full sm:w-auto text-center rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-[16px] font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10 active:scale-[0.98]"
              >
                Sign In
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-6 justify-center lg:justify-start text-sm text-white/50">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Secure & Regulated</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>0.01s Execution</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span>50K+ Traders</span>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full max-w-[500px]">
            <div className="bg-[#111111] rounded-2xl border border-white/10 p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Popular Markets</h3>
                <a href="#markets" className="text-emerald-400 text-sm hover:underline">View All</a>
              </div>
              
              <div className="space-y-3">
                {[
                  { symbol: 'XAU/USD', name: 'Gold', price: '2,341.50', change: '+1.24%', up: true },
                  { symbol: 'EUR/USD', name: 'Euro/Dollar', price: '1.0847', change: '+0.12%', up: true },
                  { symbol: 'BTC/USD', name: 'Bitcoin', price: '67,432', change: '+2.15%', up: true },
                  { symbol: 'GBP/USD', name: 'Pound/Dollar', price: '1.2634', change: '-0.08%', up: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        item.symbol.includes('XAU') ? 'bg-amber-500/20' :
                        item.symbol.includes('BTC') ? 'bg-orange-500/20' :
                        'bg-blue-500/20'
                      }`}>
                        {item.symbol.includes('XAU') ? '🥇' :
                         item.symbol.includes('BTC') ? '₿' : '💱'}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{item.symbol}</div>
                        <div className="text-xs text-white/50">{item.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-white">{item.price}</div>
                      <div className={`text-sm font-medium flex items-center gap-1 justify-end ${item.up ? 'text-emerald-400' : 'text-red-400'}`}>
                        {item.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {item.change}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <a 
                href="/user/signup"
                className="mt-6 w-full block text-center bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 py-3 rounded-xl font-semibold hover:bg-emerald-500/20 transition-colors"
              >
                Open Free Account
              </a>
            </div>
          </div>
        </div>
      </div>

      <LivePriceTicker />
    </section>
  )
}

// ============ MARKETS SECTION ============
const MarketsSection = () => {
  const markets = [
    {
      category: 'Forex',
      icon: '💱',
      color: 'blue',
      instruments: '50+ Pairs',
      spread: 'From 0.1 pips',
      leverage: 'Up to 1:500',
      description: 'Trade major, minor, and exotic currency pairs'
    },
    {
      category: 'Crypto',
      icon: '₿',
      color: 'orange',
      instruments: '30+ Coins',
      spread: 'From 0.5%',
      leverage: 'Up to 1:100',
      description: 'Bitcoin, Ethereum, and top altcoins'
    },
    {
      category: 'Metals',
      icon: '🥇',
      color: 'amber',
      instruments: 'Gold & Silver',
      spread: 'From 0.3 pips',
      leverage: 'Up to 1:200',
      description: 'Trade precious metals against USD'
    },
    {
      category: 'Indices',
      icon: '📊',
      color: 'purple',
      instruments: '15+ Indices',
      spread: 'From 0.5 pts',
      leverage: 'Up to 1:100',
      description: 'US, EU, and Asian market indices'
    },
  ]

  return (
    <section id="markets" className="bg-[#0a0a0a] py-20 px-4 sm:px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-[32px] sm:text-[40px] md:text-[48px] font-bold text-white mb-4">
            Trade Global Markets
          </h2>
          <p className="text-white/60 text-lg max-w-[600px] mx-auto">
            Access hundreds of instruments across multiple asset classes with competitive spreads
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {markets.map((market, i) => (
            <div key={i} className="bg-[#111111] rounded-2xl p-6 border border-white/10 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-2 group">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-4 ${
                market.color === 'blue' ? 'bg-blue-500/20' :
                market.color === 'orange' ? 'bg-orange-500/20' :
                market.color === 'amber' ? 'bg-amber-500/20' :
                'bg-purple-500/20'
              }`}>
                {market.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{market.category}</h3>
              <p className="text-white/50 text-sm mb-4">{market.description}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/40">Instruments</span>
                  <span className="text-white font-medium">{market.instruments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Spread</span>
                  <span className="text-emerald-400 font-medium">{market.spread}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Leverage</span>
                  <span className="text-white font-medium">{market.leverage}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <a href="/user/signup" className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-8 py-4 rounded-xl transition-all">
            Start Trading
            <ChevronRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  )
}

// ============ FEATURES SECTION ============
const FeaturesSection = () => {
  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast Execution',
      description: 'Execute trades in milliseconds with our advanced trading infrastructure',
      color: 'amber'
    },
    {
      icon: Shield,
      title: 'Bank-Grade Security',
      description: 'Your funds are protected with industry-leading security measures',
      color: 'emerald'
    },
    {
      icon: Smartphone,
      title: 'Trade Anywhere',
      description: 'Full-featured mobile app for iOS and Android devices',
      color: 'blue'
    },
    {
      icon: BarChart3,
      title: 'Advanced Charts',
      description: 'Professional charting tools with 100+ technical indicators',
      color: 'purple'
    },
    {
      icon: Wallet,
      title: 'Easy Deposits',
      description: 'Multiple payment methods with instant deposits',
      color: 'pink'
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      description: 'Round-the-clock customer support in multiple languages',
      color: 'cyan'
    },
  ]

  return (
    <section id="features" className="bg-white py-20 px-4 sm:px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-[32px] sm:text-[40px] md:text-[48px] font-bold text-gray-900 mb-4">
            Why Traders Choose Vediex
          </h2>
          <p className="text-gray-600 text-lg max-w-[600px] mx-auto">
            Everything you need to trade successfully, all in one powerful platform
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div key={i} className="p-6 rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-lg transition-all duration-300 group">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                feature.color === 'amber' ? 'bg-amber-100 text-amber-600' :
                feature.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                feature.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                feature.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                feature.color === 'pink' ? 'bg-pink-100 text-pink-600' :
                'bg-cyan-100 text-cyan-600'
              }`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============ STATS SECTION ============
const StatsSection = () => {
  const stats = [
    { value: '$2.5B+', label: 'Trading Volume', icon: LineChart },
    { value: '50K+', label: 'Active Traders', icon: Users },
    { value: '0.01s', label: 'Avg Execution', icon: Clock },
    { value: '99.9%', label: 'Uptime', icon: Award },
  ]

  return (
    <section id="why-us" className="bg-gradient-to-r from-emerald-600 to-emerald-500 py-16 px-4 sm:px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <stat.icon className="w-8 h-8 text-white/80 mx-auto mb-3" />
              <div className="text-[32px] sm:text-[40px] font-bold text-white mb-1">{stat.value}</div>
              <div className="text-white/80 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============ APP DOWNLOAD SECTION ============
const AppDownloadSection = () => {
  return (
    <section id="download" className="bg-[#0a0a0a] py-20 px-4 sm:px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-3xl p-8 sm:p-12 lg:p-16 border border-white/10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-[32px] sm:text-[40px] font-bold text-white mb-4">
                Trade On The Go
              </h2>
              <p className="text-white/60 text-lg mb-8 max-w-[500px]">
                Download our mobile app and never miss a trading opportunity. Available for Android devices.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a 
                  href="/vediex.apk"
                  download
                  className="inline-flex items-center gap-3 bg-white text-black px-6 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                >
                  <Download className="w-6 h-6" />
                  <div className="text-left">
                    <div className="text-xs text-gray-500">Download</div>
                    <div className="font-bold">Android APK</div>
                  </div>
                </a>
              </div>

              <div className="flex items-center gap-6 mt-8 justify-center lg:justify-start text-sm text-white/50">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>Secure</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span>Fast</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span>Global</span>
                </div>
              </div>
            </div>

            <div className="flex-1 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/20 blur-[80px] rounded-full" />
                <div className="relative bg-[#1a1a1a] rounded-[40px] p-4 border border-white/10 shadow-2xl">
                  <div className="w-[200px] h-[400px] bg-[#0a0a0a] rounded-[32px] flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-4">📱</div>
                      <div className="text-white font-bold">Vediex</div>
                      <div className="text-white/50 text-sm">Trading App</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ============ CTA SECTION ============
const CTASection = () => {
  return (
    <section className="bg-white py-20 px-4 sm:px-6">
      <div className="max-w-[800px] mx-auto text-center">
        <h2 className="text-[32px] sm:text-[40px] md:text-[48px] font-bold text-gray-900 mb-4">
          Ready to Start Trading?
        </h2>
        <p className="text-gray-600 text-lg mb-8">
          Join thousands of traders who trust Vediex for their trading needs. Open your free account in minutes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/user/signup"
            className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-8 py-4 rounded-xl transition-all"
          >
            Create Free Account
            <ArrowRight className="w-5 h-5" />
          </a>
          <a
            href="/user/login"
            className="inline-flex items-center justify-center gap-2 border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold px-8 py-4 rounded-xl transition-all"
          >
            Sign In
          </a>
        </div>
      </div>
    </section>
  )
}

// ============ FOOTER COMPONENT ============
const Footer = () => {
  return (
    <footer className="w-full bg-[#0a0a0a] text-white pt-16 pb-8 border-t border-white/10">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="text-2xl font-bold text-emerald-400 mb-4">Vediex</div>
            <p className="text-white/50 text-sm leading-relaxed mb-4">
              Your trusted partner for trading Forex, Crypto, and Commodities with confidence.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-white/50 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="text-white/50 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Trading</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#markets" className="text-white/50 hover:text-white transition-colors">Markets</a></li>
              <li><a href="#features" className="text-white/50 hover:text-white transition-colors">Platform</a></li>
              <li><a href="/user/signup" className="text-white/50 hover:text-white transition-colors">Open Account</a></li>
              <li><a href="#download" className="text-white/50 hover:text-white transition-colors">Mobile App</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-white/50 hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="text-white/50 hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="text-white/50 hover:text-white transition-colors">Support</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/privacy-policy" className="text-white/50 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/terms-of-service" className="text-white/50 hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="/account-deletion" className="text-white/50 hover:text-white transition-colors">Account Deletion</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/40 text-sm">© 2024 Vediex. All rights reserved.</p>
            <p className="text-white/40 text-xs text-center md:text-right max-w-[600px]">
              Trading involves significant risk of loss. Past performance is not indicative of future results.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ============ MAIN LANDING PAGE COMPONENT ============
const LandingPage = () => {
  return (
    <main className="relative min-h-screen bg-black text-white">
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
      `}</style>
      <Navbar />
      <Hero />
      <MarketsSection />
      <FeaturesSection />
      <StatsSection />
      <AppDownloadSection />
      <CTASection />
      <Footer />
    </main>
  )
}

export default LandingPage
