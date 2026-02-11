import { useState, useEffect } from 'react'
import { X, RefreshCw, AlertTriangle, Check, ArrowRight, Coins, Wallet } from 'lucide-react'
import { API_URL } from '../config/api'

const TokenWithdrawModal = ({ isOpen, onClose, user, wallet, onSuccess }) => {
  const [inrAmount, setInrAmount] = useState('')
  const [usdAmount, setUsdAmount] = useState('')
  const [exchangeRate, setExchangeRate] = useState(83)
  const [loadingRate, setLoadingRate] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [network, setNetwork] = useState('')
  const [note, setNote] = useState('')
  const [twoFACode, setTwoFACode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const MINIMUM_USD = 500
  const availableBalance = wallet?.balance || 0

  // Fetch live exchange rate
  const fetchExchangeRate = async () => {
    setLoadingRate(true)
    try {
      const res = await fetch(`${API_URL}/prices/exchange-rate/usd-inr`)
      const data = await res.json()
      if (data.success && data.rate) {
        setExchangeRate(data.rate)
      }
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error)
    } finally {
      setLoadingRate(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchExchangeRate()
      setInrAmount('')
      setUsdAmount('')
      setWalletAddress('')
      setNetwork('')
      setNote('')
      setTwoFACode('')
      setError('')
      setSuccess('')
    }
  }, [isOpen])

  // Auto-calculate USD when INR changes
  useEffect(() => {
    if (inrAmount && parseFloat(inrAmount) > 0) {
      const usd = parseFloat(inrAmount) / exchangeRate
      setUsdAmount(usd.toFixed(2))
    } else {
      setUsdAmount('')
    }
  }, [inrAmount, exchangeRate])

  const isValid = () => {
    const usd = parseFloat(usdAmount)
    return (
      inrAmount &&
      parseFloat(inrAmount) > 0 &&
      usd >= MINIMUM_USD &&
      usd <= availableBalance &&
      walletAddress.trim() !== '' &&
      network.trim() !== ''
    )
  }

  const getValidationError = () => {
    const usd = parseFloat(usdAmount) || 0
    if (!inrAmount || parseFloat(inrAmount) <= 0) return null
    if (usd < MINIMUM_USD) return `Minimum withdrawal is $${MINIMUM_USD} USD`
    if (usd > availableBalance) return `Insufficient balance. Available: $${availableBalance.toFixed(2)}`
    if (!walletAddress.trim()) return 'Wallet address is required'
    if (!network.trim()) return 'Network is required'
    return null
  }

  const handleSubmit = async () => {
    const validationError = getValidationError()
    if (validationError) {
      setError(validationError)
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch(`${API_URL}/wallet/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          amount: parseFloat(usdAmount),
          localAmount: parseFloat(inrAmount),
          currency: 'INR',
          exchangeRate: exchangeRate,
          withdrawMethod: 'Token',
          walletAddress: walletAddress,
          network: network,
          note: note,
          twoFACode: twoFACode || null
        })
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess('Token withdrawal request submitted successfully!')
        setTimeout(() => {
          onSuccess?.()
          onClose()
        }, 2000)
      } else {
        setError(data.message || 'Failed to submit withdrawal request')
      }
    } catch (error) {
      setError('Error submitting withdrawal request')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a2e] rounded-2xl w-full max-w-md border border-gray-800 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
              <Coins size={20} className="text-orange-400" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">Token Withdraw</h2>
              <p className="text-gray-500 text-xs flex items-center gap-1">
                <Wallet size={12} /> Balance: ${availableBalance.toFixed(2)}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Balance Card */}
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-4 border border-blue-500/30">
            <p className="text-gray-400 text-sm mb-1">Available Balance</p>
            <p className="text-white text-2xl font-bold">${availableBalance.toFixed(2)}</p>
            <p className="text-gray-500 text-xs mt-1">≈ ₹{(availableBalance * exchangeRate).toLocaleString()}</p>
          </div>

          {/* Minimum Notice */}
          <div className="p-3 bg-pink-500/10 border border-pink-500/30 rounded-xl">
            <p className="text-pink-400 text-sm font-medium">Note: Minimum {MINIMUM_USD} USD</p>
          </div>

          {/* Amount Input Section */}
          <div className="space-y-4">
            {/* INR Input */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">Amount (INR) *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                <input
                  type="number"
                  value={inrAmount}
                  onChange={(e) => setInrAmount(e.target.value)}
                  placeholder="Enter amount in INR"
                  className="w-full bg-[#252542] border border-gray-700 rounded-xl px-4 py-3 pl-8 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Conversion Display */}
            {inrAmount && parseFloat(inrAmount) > 0 && (
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-3 px-4 py-2 bg-[#252542] rounded-full">
                  <span className="text-gray-400 text-sm">₹{parseFloat(inrAmount).toLocaleString()}</span>
                  <ArrowRight size={16} className="text-blue-400" />
                  <span className="text-green-400 font-semibold">${usdAmount}</span>
                </div>
              </div>
            )}

            {/* USD Display (Read-only) */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">Amount (USD) - Auto Calculated</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="text"
                  value={usdAmount}
                  readOnly
                  placeholder="0.00"
                  className="w-full bg-[#1a1a2e] border border-gray-700 rounded-xl px-4 py-3 pl-8 text-green-400 font-semibold cursor-not-allowed"
                />
                <button 
                  onClick={fetchExchangeRate}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-700 rounded"
                  title="Refresh rate"
                >
                  <RefreshCw size={14} className={`text-gray-500 ${loadingRate ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <p className="text-gray-500 text-xs mt-1">
                Exchange Rate: 1 USD = ₹{exchangeRate.toFixed(2)}
              </p>
            </div>

            {/* Validation Messages */}
            {getValidationError() && usdAmount && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{getValidationError()}</p>
              </div>
            )}
          </div>

          {/* Wallet Address */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">Your Wallet Address *</label>
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="Enter your wallet address"
              className="w-full bg-[#252542] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono text-sm"
            />
          </div>

          {/* Network */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">Network *</label>
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              className="w-full bg-[#252542] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Select Network</option>
              <option value="TRC20">TRC20 (Tron)</option>
              <option value="ERC20">ERC20 (Ethereum)</option>
              <option value="BEP20">BEP20 (BSC)</option>
              <option value="Polygon">Polygon</option>
              <option value="Solana">Solana</option>
            </select>
          </div>

          {/* Note */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">Note (Optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note"
              className="w-full bg-[#252542] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* 2FA Code (Optional) */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">Google 2FA Code (if enabled)</label>
            <input
              type="text"
              value={twoFACode}
              onChange={(e) => setTwoFACode(e.target.value)}
              placeholder="Enter 6-digit code"
              maxLength={6}
              className="w-full bg-[#252542] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-center tracking-widest"
            />
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-2">
              <Check size={16} className="text-green-400" />
              <p className="text-green-400 text-sm">{success}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!isValid() || submitting}
            className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              isValid() && !submitting
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {submitting ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Withdrawal Request'
            )}
          </button>

          <p className="text-gray-500 text-xs text-center">
            Withdrawal requests are processed within 24-48 hours after admin approval.
          </p>
        </div>
      </div>
    </div>
  )
}

export default TokenWithdrawModal
