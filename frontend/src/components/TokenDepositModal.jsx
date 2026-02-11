import { useState, useEffect } from 'react'
import { X, Copy, RefreshCw, AlertTriangle, Check, ArrowRight, Coins, Send } from 'lucide-react'
import { API_URL } from '../config/api'

const TokenDepositModal = ({ isOpen, onClose, user, onSuccess, tokenMethod }) => {
  const [inrAmount, setInrAmount] = useState('')
  const [usdAmount, setUsdAmount] = useState('')
  const [exchangeRate, setExchangeRate] = useState(83) // Default INR/USD rate
  const [loadingRate, setLoadingRate] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [copied, setCopied] = useState('')

  const MINIMUM_USD = 500

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
      // Reset form
      setInrAmount('')
      setUsdAmount('')
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

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(''), 2000)
  }

  const isValid = () => {
    const usd = parseFloat(usdAmount)
    return (
      inrAmount &&
      parseFloat(inrAmount) > 0 &&
      usd >= MINIMUM_USD
    )
  }

  const handleSubmit = async () => {
    if (!isValid()) {
      if (parseFloat(usdAmount) < MINIMUM_USD) {
        setError(`Minimum deposit is $${MINIMUM_USD} USD`)
      }
      return
    }

    setSubmitting(true)
    setError('')

    try {
      // Submit deposit request
      const res = await fetch(`${API_URL}/wallet/deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          amount: parseFloat(usdAmount),
          localAmount: parseFloat(inrAmount),
          currency: 'INR',
          currencySymbol: '₹',
          exchangeRate: exchangeRate,
          paymentMethod: 'Token',
          paymentMethodId: tokenMethod?._id,
          transactionRef: ''
        })
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess('Token deposit request submitted successfully!')
        setTimeout(() => {
          onSuccess?.()
          onClose()
        }, 2000)
      } else {
        setError(data.message || 'Failed to submit deposit request')
      }
    } catch (error) {
      setError('Error submitting deposit request')
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
            <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
              <Coins size={20} className="text-yellow-400" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">Token Deposit</h2>
              <p className="text-gray-500 text-xs">Balance: ${user?.wallet?.balance?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Minimum Notice */}
          <div className="p-3 bg-pink-500/10 border border-pink-500/30 rounded-xl">
            <p className="text-pink-400 text-sm font-medium">Note: Minimum {MINIMUM_USD} USD</p>
          </div>

          {/* Token Details */}
          {tokenMethod && (
            <div className="bg-[#252542] rounded-xl p-4 space-y-3">
              {tokenMethod.tokenName && (
                <div 
                  className="flex items-center justify-between p-2 hover:bg-[#1a1a2e] rounded-lg cursor-pointer transition-colors"
                  onClick={() => copyToClipboard(tokenMethod.tokenName, 'token')}
                >
                  <span className="text-gray-400 text-sm">Token:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{tokenMethod.tokenName}</span>
                    {copied === 'token' ? <Check size={14} className="text-green-400" /> : <Copy size={14} className="text-gray-500" />}
                  </div>
                </div>
              )}

              {tokenMethod.tokenNetwork && (
                <div 
                  className="flex items-center justify-between p-2 hover:bg-[#1a1a2e] rounded-lg cursor-pointer transition-colors"
                  onClick={() => copyToClipboard(tokenMethod.tokenNetwork, 'network')}
                >
                  <span className="text-gray-400 text-sm">Network:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{tokenMethod.tokenNetwork}</span>
                    {copied === 'network' ? <Check size={14} className="text-green-400" /> : <Copy size={14} className="text-gray-500" />}
                  </div>
                </div>
              )}

              {tokenMethod.tokenAddress && (
                <div 
                  className="p-2 hover:bg-[#1a1a2e] rounded-lg cursor-pointer transition-colors"
                  onClick={() => copyToClipboard(tokenMethod.tokenAddress, 'address')}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-400 text-sm">Address:</span>
                    {copied === 'address' ? <Check size={14} className="text-green-400" /> : <Copy size={14} className="text-gray-500" />}
                  </div>
                  <p className="text-white text-xs font-mono break-all bg-[#1a1a2e] p-2 rounded">
                    {tokenMethod.tokenAddress}
                  </p>
                </div>
              )}
            </div>
          )}

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

            {/* Conversion Arrow */}
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
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button 
                    onClick={fetchExchangeRate}
                    className="p-1 hover:bg-gray-700 rounded"
                    title="Refresh rate"
                  >
                    <RefreshCw size={14} className={`text-gray-500 ${loadingRate ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
              <p className="text-gray-500 text-xs mt-1">
                Exchange Rate: 1 USD = ₹{exchangeRate.toFixed(2)}
              </p>
            </div>

            {/* Validation Message */}
            {usdAmount && parseFloat(usdAmount) < MINIMUM_USD && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-400" />
                <p className="text-red-400 text-sm">Minimum deposit is ${MINIMUM_USD} USD</p>
              </div>
            )}
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
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {submitting ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Deposit Request'
            )}
          </button>

          {/* Telegram Support Link */}
          <a
            href="https://t.me/rajeshkummarr"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 bg-[#0088cc]/20 hover:bg-[#0088cc]/30 text-[#0088cc] border border-[#0088cc]/30"
          >
            <Send size={18} />
            Contact on Telegram
          </a>
        </div>
      </div>
    </div>
  )
}

export default TokenDepositModal
