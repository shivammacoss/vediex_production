import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Trophy, Shield, Target, CheckCircle, Clock, ArrowLeft, ChevronRight } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'https://trade.vediex.com'
const TRADE_URL = 'https://trade.vediex.com'

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const PropFundingPage = () => {
  const [challenges, setChallenges] = useState([])
  const [selectedChallenge, setSelectedChallenge] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch challenges from API
  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const res = await fetch(`${API_URL}/api/prop/challenges`)
        const data = await res.json()
        if (data.success && data.challenges?.length > 0) {
          setChallenges(data.challenges)
          setSelectedChallenge(data.challenges[0])
        }
      } catch (err) {
        console.error('Failed to fetch challenges:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchChallenges()
  }, [])

  // Challenge types
  const challengeTypes = [
    { id: 0, name: 'Instant Fund', desc: 'Skip the evaluation, get funded immediately' },
    { id: 1, name: 'One Step', desc: 'Pass one evaluation phase to get funded' },
    { id: 2, name: 'Two Step', desc: 'Pass two evaluation phases for higher profit split' },
  ]

  // Get unique fund sizes from challenges
  const accountSizes = [...new Set(challenges.map(c => c.fundSize))].sort((a, b) => a - b)

  // Get selected challenge type (stepsCount)
  const selectedType = selectedChallenge?.stepsCount ?? 1

  // Filter challenges by selected type
  const filteredChallenges = challenges.filter(c => c.stepsCount === selectedType)

  // Get current challenge details
  const currentDetails = selectedChallenge ? {
    price: `$${selectedChallenge.challengeFee || selectedChallenge.price || 0}`,
    profitSplit: `${selectedChallenge.profitSplitPercent || 80}%`,
    dailyDrawdown: `${selectedChallenge.rules?.maxDailyDrawdownPercent || 5}%`,
    maxDrawdown: `${selectedChallenge.rules?.maxOverallDrawdownPercent || 10}%`,
    profitTarget: selectedChallenge.stepsCount === 0 ? 'None' : 
      selectedChallenge.stepsCount === 2 
        ? `Phase 1: ${selectedChallenge.rules?.profitTargetPhase1Percent || 8}%, Phase 2: ${selectedChallenge.rules?.profitTargetPhase2Percent || 5}%`
        : `${selectedChallenge.rules?.profitTargetPhase1Percent || 8}%`,
    leverage: `1:${selectedChallenge.rules?.maxLeverage || 100}`,
    minDays: selectedChallenge.stepsCount === 2 ? `${selectedChallenge.rules?.minTradingDays || 5} per phase` : `${selectedChallenge.rules?.minTradingDays || 5}`,
    payoutFreq: selectedChallenge.stepsCount === 0 ? 'Weekly' : 'Bi-Weekly',
    timeLimit: `${selectedChallenge.rules?.challengeExpiryDays || 30} days`,
    minLot: selectedChallenge.rules?.minLotSize || 0.01,
    maxLot: selectedChallenge.rules?.maxLotSize || 100,
    stopLossRequired: selectedChallenge.rules?.stopLossMandatory || false,
    weekendHolding: selectedChallenge.rules?.allowWeekendHolding ?? true,
    newsTrading: selectedChallenge.rules?.allowNewsTrading ?? true,
    minHoldTime: selectedChallenge.rules?.minTradeHoldTimeSeconds || 60,
  } : null

  return (
    <div className="min-h-screen bg-[#0B0D17]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0B0D17]/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 text-white hover:text-[#6C5CE7] transition-colors">
              <ArrowLeft size={20} />
              <span className="font-medium">Back to Home</span>
            </Link>
            <div className="flex items-center gap-2">
              <Trophy size={24} className="text-[#FDCB6E]" />
              <span className="text-white font-bold text-lg">Prop Funding</span>
            </div>
            <a
              href={`${TRADE_URL}/user/login`}
              className="px-4 py-2 rounded-lg bg-[#6C5CE7] hover:bg-[#5B4BD5] text-white font-medium text-sm transition-colors"
            >
              Login
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative py-12 sm:py-16">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-[#FDCB6E]/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-[#6C5CE7]/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={staggerContainer} 
            className="text-center mb-12"
          >
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-[#FDCB6E] bg-[#FDCB6E]/10 rounded-full border border-[#FDCB6E]/20 mb-6">
              <Trophy size={14} />
              Prop Funding Challenge
            </motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
              Get Funded Up To <span className="text-[#FDCB6E]">$100,000</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-[#8892B0] max-w-2xl mx-auto">
              Choose your challenge type and account size. Prove your trading skills and get funded with our capital.
            </motion.p>
          </motion.div>

          {loading ? (
            <div className="text-center py-20">
              <div className="w-12 h-12 border-4 border-[#6C5CE7] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[#8892B0]">Loading challenges...</p>
            </div>
          ) : (
            <>
              {/* Challenge Selection Card */}
              <motion.div 
                initial="hidden" 
                animate="visible" 
                variants={fadeUp} 
                className="grid lg:grid-cols-3 gap-6 mb-12"
              >
                {/* Left: Challenge Type & Account Size */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Challenge Type */}
                  <div className="rounded-2xl bg-[#1A1D35] border border-[rgba(108,92,231,0.15)] p-6">
                    <h3 className="text-white font-bold text-lg mb-2">Challenge Type</h3>
                    <p className="text-sm text-[#8892B0] mb-4">Choose the type of challenge you want to take</p>
                    <div className="grid sm:grid-cols-3 gap-3">
                      {challengeTypes.map((type) => {
                        const hasType = challenges.some(c => c.stepsCount === type.id)
                        return (
                          <button
                            key={type.id}
                            onClick={() => {
                              const firstOfType = challenges.find(c => c.stepsCount === type.id)
                              if (firstOfType) setSelectedChallenge(firstOfType)
                            }}
                            disabled={!hasType}
                            className={`p-4 rounded-xl text-left transition-all duration-200 border ${
                              selectedType === type.id
                                ? 'bg-[#6C5CE7]/20 border-[#6C5CE7] ring-2 ring-[#6C5CE7]/30'
                                : hasType ? 'bg-white/5 border-white/10 hover:border-white/20' : 'bg-white/5 border-white/10 opacity-50 cursor-not-allowed'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                selectedType === type.id ? 'border-[#6C5CE7]' : 'border-[#8892B0]'
                              }`}>
                                {selectedType === type.id && <div className="w-2 h-2 rounded-full bg-[#6C5CE7]" />}
                              </div>
                              <span className="text-white font-semibold text-sm">{type.name}</span>
                            </div>
                            <p className="text-xs text-[#8892B0] ml-6">{type.desc}</p>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Account Size */}
                  <div className="rounded-2xl bg-[#1A1D35] border border-[rgba(108,92,231,0.15)] p-6">
                    <h3 className="text-white font-bold text-lg mb-2">Account Size</h3>
                    <p className="text-sm text-[#8892B0] mb-4">Choose your preferred account size</p>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                      {filteredChallenges.map((challenge) => (
                        <button
                          key={challenge._id}
                          onClick={() => setSelectedChallenge(challenge)}
                          className={`p-3 rounded-xl text-center transition-all duration-200 border ${
                            selectedChallenge?._id === challenge._id
                              ? 'bg-[#6C5CE7]/20 border-[#6C5CE7] ring-2 ring-[#6C5CE7]/30'
                              : 'bg-white/5 border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                              selectedChallenge?._id === challenge._id ? 'border-[#6C5CE7]' : 'border-[#8892B0]'
                            }`}>
                              {selectedChallenge?._id === challenge._id && <div className="w-1.5 h-1.5 rounded-full bg-[#6C5CE7]" />}
                            </div>
                          </div>
                          <span className="text-white font-semibold text-sm">${challenge.fundSize?.toLocaleString()}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Order Summary */}
                <div className="rounded-2xl bg-[#1A1D35] border border-[rgba(108,92,231,0.15)] p-6">
                  <h3 className="text-white font-bold text-lg mb-4">Order Summary</h3>
                  
                  {currentDetails ? (
                    <>
                      <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center pb-3 border-b border-white/10">
                          <span className="text-[#8892B0]">Challenge Type</span>
                          <span className="text-white font-medium">{challengeTypes.find(t => t.id === selectedType)?.name}</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-white/10">
                          <span className="text-[#8892B0]">Account Size</span>
                          <span className="text-[#FDCB6E] font-bold text-lg">${selectedChallenge?.fundSize?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-white/10">
                          <span className="text-[#8892B0]">Profit Split</span>
                          <span className="text-[#00B894] font-medium">{currentDetails.profitSplit}</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-white/10">
                          <span className="text-[#8892B0]">Daily Drawdown</span>
                          <span className="text-white font-medium">{currentDetails.dailyDrawdown}</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-white/10">
                          <span className="text-[#8892B0]">Max Drawdown</span>
                          <span className="text-white font-medium">{currentDetails.maxDrawdown}</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-white/10">
                          <span className="text-[#8892B0]">Profit Target</span>
                          <span className="text-white font-medium text-right text-sm">{currentDetails.profitTarget}</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-white/10">
                          <span className="text-[#8892B0]">Leverage</span>
                          <span className="text-white font-medium">{currentDetails.leverage}</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-white/10">
                          <span className="text-[#8892B0]">Min Trading Days</span>
                          <span className="text-white font-medium">{currentDetails.minDays}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#8892B0]">Payout Frequency</span>
                          <span className="text-white font-medium">{currentDetails.payoutFreq}</span>
                        </div>
                      </div>

                      <div className="bg-[#6C5CE7]/10 rounded-xl p-4 mb-4">
                        <div className="flex justify-between items-center">
                          <span className="text-white font-medium">One-time Fee</span>
                          <span className="text-2xl font-bold text-white">{currentDetails.price}</span>
                        </div>
                      </div>

                      <a
                        href={`${TRADE_URL}/user/login`}
                        className="w-full block text-center py-4 rounded-xl font-semibold bg-[#6C5CE7] hover:bg-[#5B4BD5] text-white transition-all duration-200"
                      >
                        Continue to Payment →
                      </a>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-[#8892B0]">Select a challenge to see details</p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Trading Rules */}
              <motion.div 
                initial="hidden" 
                animate="visible" 
                variants={fadeUp} 
                className="rounded-2xl bg-[#1A1D35] border border-[rgba(108,92,231,0.15)] p-8 mb-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#00B894]/20 flex items-center justify-center">
                    <Shield size={20} className="text-[#00B894]" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xl">Trading Rules</h3>
                    <p className="text-[#8892B0] text-sm">Challenge parameters you must follow</p>
                  </div>
                </div>

                {/* Rules Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <p className="text-[#8892B0] text-xs mb-1">Daily Drawdown</p>
                    <p className="text-red-400 font-bold text-xl">{currentDetails?.dailyDrawdown || '5%'}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <p className="text-[#8892B0] text-xs mb-1">Max Drawdown</p>
                    <p className="text-red-400 font-bold text-xl">{currentDetails?.maxDrawdown || '10%'}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <p className="text-[#8892B0] text-xs mb-1">Profit Target</p>
                    <p className="text-[#00B894] font-bold text-xl">{currentDetails?.profitTarget || '8%'}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <p className="text-[#8892B0] text-xs mb-1">Time Limit</p>
                    <p className="text-white font-bold text-xl">{currentDetails?.timeLimit || '30 days'}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <p className="text-[#8892B0] text-xs mb-1">Min Lot Size</p>
                    <p className="text-white font-bold text-xl">{currentDetails?.minLot || 0.01}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <p className="text-[#8892B0] text-xs mb-1">Max Lot Size</p>
                    <p className="text-white font-bold text-xl">{currentDetails?.maxLot || 100}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <p className="text-[#8892B0] text-xs mb-1">Max Leverage</p>
                    <p className="text-white font-bold text-xl">{currentDetails?.leverage || '1:100'}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <p className="text-[#8892B0] text-xs mb-1">Profit Split</p>
                    <p className="text-[#FDCB6E] font-bold text-xl">{currentDetails?.profitSplit || '80%'}</p>
                  </div>
                </div>

                {/* Rule Toggles */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${currentDetails?.stopLossRequired ? 'bg-yellow-500/10 text-yellow-400' : 'bg-[#00B894]/10 text-[#00B894]'}`}>
                    <CheckCircle size={16} />
                    <span className="text-sm">Stop Loss {currentDetails?.stopLossRequired ? 'Required' : 'Optional'}</span>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${currentDetails?.weekendHolding ? 'bg-[#00B894]/10 text-[#00B894]' : 'bg-red-500/10 text-red-400'}`}>
                    <CheckCircle size={16} />
                    <span className="text-sm">Weekend Holding {currentDetails?.weekendHolding ? 'Allowed' : 'Not Allowed'}</span>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${currentDetails?.newsTrading ? 'bg-[#00B894]/10 text-[#00B894]' : 'bg-red-500/10 text-red-400'}`}>
                    <CheckCircle size={16} />
                    <span className="text-sm">News Trading {currentDetails?.newsTrading ? 'Allowed' : 'Not Allowed'}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#6C5CE7]/10 text-[#A29BFE]">
                    <Clock size={16} />
                    <span className="text-sm">Min Hold: {currentDetails?.minHoldTime || 60}s</span>
                  </div>
                </div>

                {/* Warning */}
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3">
                  <Target size={20} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-400 font-medium">Important Rules</p>
                    <p className="text-[#8892B0] text-sm mt-1">
                      Breaking any rule will result in immediate account failure. All trades must follow the challenge rules. 
                      Make sure to review all trading parameters before starting.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* How It Works */}
              <motion.div 
                initial="hidden" 
                animate="visible" 
                variants={staggerContainer} 
                className="rounded-2xl bg-[#1A1D35] border border-[rgba(108,92,231,0.15)] p-8 mb-8"
              >
                <h3 className="text-white font-bold text-2xl text-center mb-8">How It Works</h3>
                <div className="grid sm:grid-cols-3 gap-8">
                  {[
                    { num: '1', title: 'Buy Challenge', desc: 'Choose your account size and pay the one-time fee.', color: '#6C5CE7' },
                    { num: '2', title: 'Pass Evaluation', desc: 'Trade within the rules and hit your profit target.', color: '#00B894' },
                    { num: '3', title: 'Get Funded', desc: 'Receive your funded account and start earning.', color: '#FDCB6E' },
                  ].map((step) => (
                    <div key={step.num} className="text-center">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: step.color }}>
                        <span className="text-white font-bold text-lg">{step.num}</span>
                      </div>
                      <h4 className="text-white font-bold text-lg mb-2">{step.title}</h4>
                      <p className="text-sm text-[#8892B0]">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* FAQ Section */}
              <motion.div 
                initial="hidden" 
                animate="visible" 
                variants={fadeUp} 
                className="rounded-2xl bg-[#1A1D35] border border-[rgba(108,92,231,0.15)] p-8"
              >
                <h3 className="text-white font-bold text-2xl text-center mb-8">Frequently Asked Questions</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    { q: 'What is a prop trading challenge?', a: 'A prop trading challenge is an evaluation program where you prove your trading skills. Once you pass, you get access to a funded trading account.' },
                    { q: 'How long do I have to pass the challenge?', a: 'The time limit depends on your challenge type. Most challenges have a 30-day limit, but there are no minimum trading days required.' },
                    { q: 'What happens if I fail the challenge?', a: 'If you violate any trading rules or hit the maximum drawdown, the challenge ends. You can purchase a new challenge to try again.' },
                    { q: 'How do I receive my profits?', a: 'Once funded, you can request payouts based on your profit split percentage. Payouts are processed within 24-48 hours.' },
                  ].map((faq, i) => (
                    <div key={i} className="bg-white/5 rounded-xl p-5">
                      <h4 className="text-white font-semibold mb-2">{faq.q}</h4>
                      <p className="text-[#8892B0] text-sm">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <p className="text-center text-sm text-[#8892B0]/60 mt-10">
                * Challenge rules and profit splits may vary. Please review full terms before purchasing.
              </p>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[#8892B0] text-sm">© 2024 Vediex. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link to="/terms" className="text-[#8892B0] hover:text-white text-sm transition-colors">Terms</Link>
              <Link to="/privacy" className="text-[#8892B0] hover:text-white text-sm transition-colors">Privacy</Link>
              <a href={`${TRADE_URL}/user/login`} className="text-[#8892B0] hover:text-white text-sm transition-colors">Login</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default PropFundingPage
