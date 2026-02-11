import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '../components/AdminLayout'
import { 
  BookOpen, 
  ArrowRightLeft, 
  RefreshCw, 
  Search, 
  Filter,
  Eye,
  Send,
  Building2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Check,
  X,
  Clock,
  Activity,
  BarChart3,
  Shield,
  Zap,
  History
} from 'lucide-react'
import { API_URL } from '../config/api'

const AdminBookManagement = () => {
  const [trades, setTrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [bookCounts, setBookCounts] = useState({ UNASSIGNED: 0, A_BOOK: 0, B_BOOK: 0, total: 0 })
  const [selectedTrade, setSelectedTrade] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [lpProviders, setLpProviders] = useState([])
  const [selectedProvider, setSelectedProvider] = useState('')
  const [auditLogs, setAuditLogs] = useState([])
  const [bookStats, setBookStats] = useState(null)
  
  // Filters
  const [filterBookType, setFilterBookType] = useState('ALL')
  const [searchSymbol, setSearchSymbol] = useState('')
  const [activeTab, setActiveTab] = useState('trades') // trades, audit, settings

  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}')

  // Fetch running trades
  const fetchTrades = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filterBookType !== 'ALL') params.append('bookType', filterBookType)
      if (searchSymbol) params.append('symbol', searchSymbol)

      const res = await fetch(`${API_URL}/admin/book/trades/running?${params}`, {
        headers: { 'X-Admin-ID': adminUser._id }
      })
      const data = await res.json()
      
      if (data.success) {
        setTrades(data.trades)
        setBookCounts(data.bookCounts)
      }
    } catch (error) {
      console.error('Fetch trades error:', error)
      setError('Failed to fetch trades')
    } finally {
      setLoading(false)
    }
  }, [filterBookType, searchSymbol, adminUser._id])

  // Fetch LP providers
  const fetchLpProviders = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/book/lp-providers`, {
        headers: { 'X-Admin-ID': adminUser._id }
      })
      const data = await res.json()
      if (data.success) {
        setLpProviders(data.providers)
        if (data.providers.length > 0) {
          setSelectedProvider(data.providers[0].providerCode)
        }
      }
    } catch (error) {
      console.error('Fetch LP providers error:', error)
    }
  }

  // Fetch audit logs
  const fetchAuditLogs = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/book/book-audit-logs?limit=100`, {
        headers: { 'X-Admin-ID': adminUser._id }
      })
      const data = await res.json()
      if (data.success) {
        setAuditLogs(data.logs)
      }
    } catch (error) {
      console.error('Fetch audit logs error:', error)
    }
  }

  // Fetch book stats
  const fetchBookStats = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/book/book-stats`, {
        headers: { 'X-Admin-ID': adminUser._id }
      })
      const data = await res.json()
      if (data.success) {
        setBookStats(data)
      }
    } catch (error) {
      console.error('Fetch book stats error:', error)
    }
  }

  useEffect(() => {
    fetchTrades()
    fetchLpProviders()
    fetchBookStats()
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchTrades, 5000)
    return () => clearInterval(interval)
  }, [fetchTrades])

  useEffect(() => {
    if (activeTab === 'audit') {
      fetchAuditLogs()
    }
  }, [activeTab])

  // Send to A-Book
  const handleSendToABook = async () => {
    if (!selectedTrade) return
    setProcessing(true)
    setError('')

    try {
      const res = await fetch(`${API_URL}/admin/book/trade/send-to-a-book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-ID': adminUser._id
        },
        body: JSON.stringify({
          tradeId: selectedTrade._id,
          lpProvider: selectedProvider
        })
      })
      const data = await res.json()

      if (data.success) {
        setSuccess('Trade sent to A-Book successfully!')
        setShowConfirmModal(false)
        fetchTrades()
        fetchBookStats()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.message || 'Failed to send to A-Book')
      }
    } catch (error) {
      setError('Error sending to A-Book')
    } finally {
      setProcessing(false)
    }
  }

  // Move to B-Book
  const handleMoveToBBook = async () => {
    if (!selectedTrade) return
    setProcessing(true)
    setError('')

    try {
      const res = await fetch(`${API_URL}/admin/book/trade/move-to-b-book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-ID': adminUser._id
        },
        body: JSON.stringify({
          tradeId: selectedTrade._id
        })
      })
      const data = await res.json()

      if (data.success) {
        setSuccess('Trade moved to B-Book successfully!')
        setShowConfirmModal(false)
        fetchTrades()
        fetchBookStats()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.message || 'Failed to move to B-Book')
      }
    } catch (error) {
      setError('Error moving to B-Book')
    } finally {
      setProcessing(false)
    }
  }

  // Open confirm modal
  const openConfirmModal = (trade, action) => {
    setSelectedTrade(trade)
    setConfirmAction(action)
    setShowConfirmModal(true)
    setError('')
  }

  // View trade details
  const viewTradeDetails = async (trade) => {
    try {
      const res = await fetch(`${API_URL}/admin/book/trade/${trade._id}`, {
        headers: { 'X-Admin-ID': adminUser._id }
      })
      const data = await res.json()
      if (data.success) {
        setSelectedTrade({ ...data.trade, lpTrade: data.lpTrade, auditLogs: data.auditLogs })
        setShowDetailModal(true)
      }
    } catch (error) {
      console.error('Fetch trade details error:', error)
    }
  }

  // Get book type badge
  const getBookTypeBadge = (bookType) => {
    switch (bookType) {
      case 'A_BOOK':
        return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium flex items-center gap-1"><Zap size={12} /> A-Book</span>
      case 'B_BOOK':
        return <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium flex items-center gap-1"><Building2 size={12} /> B-Book</span>
      default:
        return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs font-medium flex items-center gap-1"><Clock size={12} /> Unassigned</span>
    }
  }

  // Get LP status badge
  const getLpStatusBadge = (status) => {
    switch (status) {
      case 'HEDGED':
        return <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">Hedged</span>
      case 'PENDING':
        return <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">Pending</span>
      case 'FAILED':
        return <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">Failed</span>
      case 'CLOSED':
        return <span className="px-2 py-0.5 bg-gray-500/20 text-gray-400 rounded text-xs">Closed</span>
      default:
        return null
    }
  }

  return (
    <AdminLayout title="Book Management" subtitle="A-Book / B-Book Trade Routing">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-dark-800 rounded-xl p-4 border border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-500/20 rounded-lg flex items-center justify-center">
              <Clock size={20} className="text-gray-400" />
            </div>
            <div>
              <p className="text-gray-500 text-xs">Unassigned</p>
              <p className="text-white text-xl font-bold">{bookCounts.UNASSIGNED}</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-800 rounded-xl p-4 border border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Zap size={20} className="text-blue-400" />
            </div>
            <div>
              <p className="text-gray-500 text-xs">A-Book (LP)</p>
              <p className="text-blue-400 text-xl font-bold">{bookCounts.A_BOOK}</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-800 rounded-xl p-4 border border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Building2 size={20} className="text-purple-400" />
            </div>
            <div>
              <p className="text-gray-500 text-xs">B-Book (Internal)</p>
              <p className="text-purple-400 text-xl font-bold">{bookCounts.B_BOOK}</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-800 rounded-xl p-4 border border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Activity size={20} className="text-green-400" />
            </div>
            <div>
              <p className="text-gray-500 text-xs">Total Open</p>
              <p className="text-green-400 text-xl font-bold">{bookCounts.total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 flex items-center gap-2">
          <Check size={18} /> {success}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 flex items-center gap-2">
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('trades')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'trades' ? 'bg-blue-500 text-white' : 'bg-dark-700 text-gray-400 hover:text-white'
          }`}
        >
          <BarChart3 size={16} /> Running Trades
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'audit' ? 'bg-blue-500 text-white' : 'bg-dark-700 text-gray-400 hover:text-white'
          }`}
        >
          <History size={16} /> Audit Logs
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'settings' ? 'bg-blue-500 text-white' : 'bg-dark-700 text-gray-400 hover:text-white'
          }`}
        >
          <Shield size={16} /> LP Settings
        </button>
      </div>

      {/* Running Trades Tab */}
      {activeTab === 'trades' && (
        <div className="bg-dark-800 rounded-xl border border-gray-800 overflow-hidden">
          {/* Filters */}
          <div className="p-4 border-b border-gray-800 flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-500" />
              <select
                value={filterBookType}
                onChange={(e) => setFilterBookType(e.target.value)}
                className="bg-dark-700 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="ALL">All Books</option>
                <option value="UNASSIGNED">Unassigned</option>
                <option value="A_BOOK">A-Book</option>
                <option value="B_BOOK">B-Book</option>
              </select>
            </div>
            <div className="flex items-center gap-2 flex-1 max-w-xs">
              <Search size={16} className="text-gray-500" />
              <input
                type="text"
                value={searchSymbol}
                onChange={(e) => setSearchSymbol(e.target.value)}
                placeholder="Search symbol..."
                className="bg-dark-700 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm w-full"
              />
            </div>
            <button
              onClick={fetchTrades}
              className="p-2 bg-dark-700 hover:bg-dark-600 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* Trades Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-700">
                <tr>
                  <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">User</th>
                  <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Symbol</th>
                  <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Side</th>
                  <th className="text-right text-gray-400 text-xs font-medium px-4 py-3">Lot</th>
                  <th className="text-right text-gray-400 text-xs font-medium px-4 py-3">Entry</th>
                  <th className="text-right text-gray-400 text-xs font-medium px-4 py-3">Current</th>
                  <th className="text-right text-gray-400 text-xs font-medium px-4 py-3">P/L</th>
                  <th className="text-center text-gray-400 text-xs font-medium px-4 py-3">Book</th>
                  <th className="text-center text-gray-400 text-xs font-medium px-4 py-3">LP Status</th>
                  <th className="text-center text-gray-400 text-xs font-medium px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && trades.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center py-8 text-gray-500">
                      <RefreshCw size={24} className="animate-spin mx-auto mb-2" />
                      Loading trades...
                    </td>
                  </tr>
                ) : trades.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center py-8 text-gray-500">
                      No open trades found
                    </td>
                  </tr>
                ) : (
                  trades.map((trade) => {
                    const pnl = trade.floatingPnl || 0
                    return (
                      <tr key={trade._id} className="border-t border-gray-800 hover:bg-dark-700/50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-white text-sm">{trade.userId?.name || 'N/A'}</p>
                            <p className="text-gray-500 text-xs">{trade.userId?.email || ''}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-white font-medium">{trade.symbol}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            trade.side === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {trade.side}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-white">{trade.quantity}</td>
                        <td className="px-4 py-3 text-right text-gray-400">{trade.openPrice?.toFixed(5)}</td>
                        <td className="px-4 py-3 text-right text-gray-400">{trade.currentPrice?.toFixed(5) || '-'}</td>
                        <td className={`px-4 py-3 text-right font-medium ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {getBookTypeBadge(trade.bookType)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {getLpStatusBadge(trade.lpStatus)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => viewTradeDetails(trade)}
                              className="p-1.5 bg-gray-500/20 text-gray-400 rounded hover:bg-gray-500/30 hover:text-white transition-colors"
                              title="View Details"
                            >
                              <Eye size={14} />
                            </button>
                            {trade.bookType !== 'A_BOOK' && (
                              <button
                                onClick={() => openConfirmModal(trade, 'A_BOOK')}
                                className="p-1.5 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
                                title="Send to A-Book"
                              >
                                <Zap size={14} />
                              </button>
                            )}
                            {trade.bookType !== 'B_BOOK' && (
                              <button
                                onClick={() => openConfirmModal(trade, 'B_BOOK')}
                                className="p-1.5 bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30 transition-colors"
                                title="Move to B-Book"
                              >
                                <Building2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit Logs Tab */}
      {activeTab === 'audit' && (
        <div className="bg-dark-800 rounded-xl border border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-white font-semibold">Book Assignment Audit Trail</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-700">
                <tr>
                  <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Time</th>
                  <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Trade</th>
                  <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">User</th>
                  <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Action</th>
                  <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">From → To</th>
                  <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Performed By</th>
                  <th className="text-center text-gray-400 text-xs font-medium px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log._id} className="border-t border-gray-800">
                    <td className="px-4 py-3 text-gray-400 text-sm">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-white font-mono text-sm">{log.tradeRef}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">
                      {log.userId?.email || 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        log.action.includes('A_BOOK') ? 'bg-blue-500/20 text-blue-400' :
                        log.action.includes('B_BOOK') ? 'bg-purple-500/20 text-purple-400' :
                        log.action.includes('FAILED') ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">
                      {log.previousBookType} → {log.newBookType}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">
                      {log.performedBy?.email || log.performedByEmail}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {log.success ? (
                        <Check size={16} className="text-green-400 mx-auto" />
                      ) : (
                        <X size={16} className="text-red-400 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LP Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-dark-800 rounded-xl border border-gray-800 p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Shield size={20} /> Liquidity Provider Configuration
          </h3>
          
          {lpProviders.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle size={48} className="text-yellow-500 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No LP providers configured yet.</p>
              <p className="text-gray-500 text-sm">Contact system administrator to configure LP API credentials.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {lpProviders.map((provider) => (
                <div key={provider._id} className="p-4 bg-dark-700 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">{provider.providerName}</h4>
                      <p className="text-gray-500 text-sm">Code: {provider.providerCode}</p>
                      <p className="text-gray-500 text-sm">API: {provider.apiBaseUrl}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {provider.isPrimary && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Primary</span>
                      )}
                      <span className={`px-2 py-1 rounded text-xs ${
                        provider.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {provider.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Total Orders</p>
                      <p className="text-white">{provider.stats?.totalOrders || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Successful</p>
                      <p className="text-green-400">{provider.stats?.successfulOrders || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Failed</p>
                      <p className="text-red-400">{provider.stats?.failedOrders || 0}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirmModal && selectedTrade && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-xl w-full max-w-md border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                {confirmAction === 'A_BOOK' ? (
                  <><Zap size={20} className="text-blue-400" /> Send to A-Book</>
                ) : (
                  <><Building2 size={20} className="text-purple-400" /> Move to B-Book</>
                )}
              </h3>
            </div>
            <div className="p-6">
              <div className="bg-dark-700 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Symbol</p>
                    <p className="text-white font-medium">{selectedTrade.symbol}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Side</p>
                    <p className={selectedTrade.side === 'BUY' ? 'text-green-400' : 'text-red-400'}>
                      {selectedTrade.side}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Lot Size</p>
                    <p className="text-white">{selectedTrade.quantity}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Entry Price</p>
                    <p className="text-white">{selectedTrade.openPrice?.toFixed(5)}</p>
                  </div>
                </div>
              </div>

              {confirmAction === 'A_BOOK' && (
                <div className="mb-4">
                  <label className="block text-gray-400 text-sm mb-2">Select LP Provider</label>
                  <select
                    value={selectedProvider}
                    onChange={(e) => setSelectedProvider(e.target.value)}
                    className="w-full bg-dark-700 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  >
                    {lpProviders.map((p) => (
                      <option key={p.providerCode} value={p.providerCode}>
                        {p.providerName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {confirmAction === 'A_BOOK' ? (
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg mb-4">
                  <p className="text-blue-400 text-sm">
                    This will place a hedge trade on the LP with identical parameters. 
                    The trade will be marked as A-Book.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg mb-4">
                  <p className="text-purple-400 text-sm">
                    This trade will be handled internally. No LP hedge will be placed.
                    Platform will manage P/L exposure.
                  </p>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-2 bg-dark-700 text-white rounded-lg hover:bg-dark-600"
                  disabled={processing}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction === 'A_BOOK' ? handleSendToABook : handleMoveToBBook}
                  disabled={processing}
                  className={`flex-1 py-2 rounded-lg font-medium flex items-center justify-center gap-2 ${
                    confirmAction === 'A_BOOK' 
                      ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                      : 'bg-purple-500 hover:bg-purple-600 text-white'
                  }`}
                >
                  {processing ? (
                    <><RefreshCw size={16} className="animate-spin" /> Processing...</>
                  ) : (
                    <>Confirm</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trade Detail Modal */}
      {showDetailModal && selectedTrade && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-xl w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-white font-semibold text-lg">Trade Details</h3>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Trade Info */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">Trade ID</p>
                  <p className="text-white font-mono">{selectedTrade.tradeId}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Symbol</p>
                  <p className="text-white font-medium">{selectedTrade.symbol}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Side</p>
                  <p className={selectedTrade.side === 'BUY' ? 'text-green-400' : 'text-red-400'}>
                    {selectedTrade.side}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Lot Size</p>
                  <p className="text-white">{selectedTrade.quantity}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Entry Price</p>
                  <p className="text-white">{selectedTrade.openPrice?.toFixed(5)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Book Type</p>
                  {getBookTypeBadge(selectedTrade.bookType)}
                </div>
              </div>

              {/* LP Trade Info */}
              {selectedTrade.lpTrade && (
                <div className="bg-dark-700 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Zap size={16} className="text-blue-400" /> LP Hedge Details
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">LP Provider</p>
                      <p className="text-white">{selectedTrade.lpTrade.lpProvider}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">LP Trade ID</p>
                      <p className="text-white font-mono text-xs">{selectedTrade.lpTrade.lpTradeId}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Status</p>
                      {getLpStatusBadge(selectedTrade.lpTrade.status)}
                    </div>
                    <div>
                      <p className="text-gray-500">LP Open Price</p>
                      <p className="text-white">{selectedTrade.lpTrade.lpOpenPrice?.toFixed(5) || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">LP P/L</p>
                      <p className={selectedTrade.lpTrade.lpPnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {selectedTrade.lpTrade.lpPnl?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Audit History */}
              {selectedTrade.auditLogs && selectedTrade.auditLogs.length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <History size={16} /> Audit History
                  </h4>
                  <div className="space-y-2">
                    {selectedTrade.auditLogs.map((log) => (
                      <div key={log._id} className="p-3 bg-dark-700 rounded-lg text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">{new Date(log.createdAt).toLocaleString()}</span>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            log.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {log.action.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-gray-500 mt-1">By: {log.performedBy?.email}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminBookManagement
