import { useState, useEffect } from 'react'
import { X, TrendingUp, TrendingDown, AlertCircle, Check, Loader2 } from 'lucide-react'

const CloseTradeModal = ({ 
  isOpen, 
  onClose, 
  trade, 
  currentPrice, 
  onPartialClose, 
  onFullClose,
  onModifyLot 
}) => {
  const [closeLot, setCloseLot] = useState('')
  const [activeTab, setActiveTab] = useState('partial') // 'partial', 'full', 'modify'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Calculate live P/L
  const calculatePnL = (lots = null) => {
    if (!trade || !currentPrice) return 0
    const quantity = lots || trade.quantity
    const contractSize = trade.contractSize || 100000
    const entryPrice = trade.openPrice
    const exitPrice = trade.side === 'BUY' ? currentPrice.bid : currentPrice.ask
    
    let pnl = 0
    if (trade.side === 'BUY') {
      pnl = (exitPrice - entryPrice) * quantity * contractSize
    } else {
      pnl = (entryPrice - exitPrice) * quantity * contractSize
    }
    return pnl
  }

  const totalPnL = calculatePnL()
  const partialPnL = closeLot ? calculatePnL(parseFloat(closeLot)) : 0

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCloseLot('')
      setActiveTab('partial')
      setError('')
      setSuccess('')
      setLoading(false)
    }
  }, [isOpen])

  // Quick lot buttons
  const quickLots = trade ? [
    { label: '25%', value: (trade.quantity * 0.25).toFixed(2) },
    { label: '50%', value: (trade.quantity * 0.50).toFixed(2) },
    { label: '75%', value: (trade.quantity * 0.75).toFixed(2) },
  ] : []

  const handlePartialClose = async () => {
    if (!closeLot || parseFloat(closeLot) <= 0) {
      setError('Please enter a valid lot size')
      return
    }
    if (parseFloat(closeLot) >= trade.quantity) {
      setError('Use Full Close for entire position')
      return
    }

    setLoading(true)
    setError('')
    try {
      await onPartialClose(trade, parseFloat(closeLot), currentPrice)
      setSuccess(`Closed ${closeLot} lots successfully`)
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err) {
      setError(err.message || 'Failed to close trade')
    } finally {
      setLoading(false)
    }
  }

  const handleFullClose = async () => {
    setLoading(true)
    setError('')
    try {
      await onFullClose(trade, currentPrice)
      setSuccess('Trade closed successfully')
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err) {
      setError(err.message || 'Failed to close trade')
    } finally {
      setLoading(false)
    }
  }

  const handleModifyLot = async () => {
    if (!closeLot || parseFloat(closeLot) <= 0) {
      setError('Please enter lot size to reduce')
      return
    }
    if (parseFloat(closeLot) >= trade.quantity) {
      setError('Cannot reduce to zero or negative')
      return
    }

    setLoading(true)
    setError('')
    try {
      // Modify is same as partial close - reduces lot size
      await onPartialClose(trade, parseFloat(closeLot), currentPrice)
      setSuccess(`Reduced position by ${closeLot} lots`)
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err) {
      setError(err.message || 'Failed to modify trade')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !trade) return null

  const exitPrice = trade.side === 'BUY' ? currentPrice?.bid : currentPrice?.ask

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-dark-800 rounded-2xl w-full max-w-md mx-4 border border-gray-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              trade.side === 'BUY' ? 'bg-green-500/20' : 'bg-red-500/20'
            }`}>
              {trade.side === 'BUY' ? (
                <TrendingUp className="text-green-500" size={20} />
              ) : (
                <TrendingDown className="text-red-500" size={20} />
              )}
            </div>
            <div>
              <h3 className="text-white font-semibold">{trade.symbol}</h3>
              <p className="text-gray-400 text-sm">
                {trade.side} • {trade.quantity} lots
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
          >
            <X className="text-gray-400" size={20} />
          </button>
        </div>

        {/* Trade Info */}
        <div className="p-4 bg-dark-900/50">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-gray-500 text-xs mb-1">Entry Price</p>
              <p className="text-white font-medium">{trade.openPrice?.toFixed(5)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">Current Price</p>
              <p className="text-white font-medium">{exitPrice?.toFixed(5) || '-'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">Live P/L</p>
              <p className={`font-bold ${totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('partial')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'partial' 
                ? 'text-blue-500 border-b-2 border-blue-500 bg-blue-500/5' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Partial Close
          </button>
          <button
            onClick={() => setActiveTab('full')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'full' 
                ? 'text-red-500 border-b-2 border-red-500 bg-red-500/5' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Full Close
          </button>
          <button
            onClick={() => setActiveTab('modify')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'modify' 
                ? 'text-yellow-500 border-b-2 border-yellow-500 bg-yellow-500/5' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Modify
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
              <AlertCircle className="text-red-500" size={18} />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2">
              <Check className="text-green-500" size={18} />
              <span className="text-green-400 text-sm">{success}</span>
            </div>
          )}

          {/* Partial Close Tab */}
          {activeTab === 'partial' && (
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm mb-2 block">
                  Lots to Close (Max: {trade.quantity})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={trade.quantity - 0.01}
                  value={closeLot}
                  onChange={(e) => {
                    setCloseLot(e.target.value)
                    setError('')
                  }}
                  placeholder="Enter lot size"
                  className="w-full bg-dark-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Quick Lot Buttons */}
              <div className="flex gap-2">
                {quickLots.map((q) => (
                  <button
                    key={q.label}
                    onClick={() => setCloseLot(q.value)}
                    className="flex-1 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg text-sm transition-colors"
                  >
                    {q.label}
                  </button>
                ))}
              </div>

              {/* Partial P/L Preview */}
              {closeLot && parseFloat(closeLot) > 0 && (
                <div className="p-3 bg-dark-700 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Estimated P/L for {closeLot} lots</span>
                    <span className={`font-bold ${partialPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {partialPnL >= 0 ? '+' : ''}${partialPnL.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={handlePartialClose}
                disabled={loading || !closeLot}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Processing...
                  </>
                ) : (
                  'Partial Close'
                )}
              </button>
            </div>
          )}

          {/* Full Close Tab */}
          {activeTab === 'full' && (
            <div className="space-y-4">
              <div className="p-4 bg-dark-700 rounded-lg text-center">
                <p className="text-gray-400 text-sm mb-2">You are about to close</p>
                <p className="text-white text-2xl font-bold mb-2">{trade.quantity} lots</p>
                <p className="text-gray-400 text-sm">This action cannot be undone</p>
              </div>

              <div className="p-3 bg-dark-700 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Total P/L</span>
                  <span className={`font-bold text-lg ${totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleFullClose}
                disabled={loading}
                className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Closing...
                  </>
                ) : (
                  'Close Trade'
                )}
              </button>
            </div>
          )}

          {/* Modify Tab */}
          {activeTab === 'modify' && (
            <div className="space-y-4">
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-400 text-sm">
                  Reduce your position size. The reduced portion will be closed at current market price.
                </p>
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">
                  Lots to Reduce (Current: {trade.quantity})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={trade.quantity - 0.01}
                  value={closeLot}
                  onChange={(e) => {
                    setCloseLot(e.target.value)
                    setError('')
                  }}
                  placeholder="Enter lot size to reduce"
                  className="w-full bg-dark-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-yellow-500 focus:outline-none"
                />
              </div>

              {closeLot && parseFloat(closeLot) > 0 && (
                <div className="p-3 bg-dark-700 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">New Position Size</span>
                    <span className="text-white font-medium">
                      {(trade.quantity - parseFloat(closeLot)).toFixed(2)} lots
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">P/L for Reduced Portion</span>
                    <span className={`font-bold ${partialPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {partialPnL >= 0 ? '+' : ''}${partialPnL.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={handleModifyLot}
                disabled={loading || !closeLot}
                className="w-full py-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Modifying...
                  </>
                ) : (
                  'Reduce Position'
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-dark-900/50">
          <button
            onClick={onClose}
            className="w-full py-2 text-gray-400 hover:text-white transition-colors text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default CloseTradeModal
