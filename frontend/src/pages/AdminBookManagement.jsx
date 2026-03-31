import { useState, useEffect } from 'react'
import AdminLayout from '../components/AdminLayout'
import { 
  Users,
  BookOpen,
  Search,
  RefreshCw,
  Info,
  CheckCircle,
  Settings,
  Key,
  Link,
  Wifi,
  Eye,
  EyeOff,
  Save,
  XCircle,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  RotateCcw,
  Activity,
  Clock,
  Send,
  Filter
} from 'lucide-react'
import { API_URL } from '../config/api'

const AdminBookManagement = () => {
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({ aBookUsers: 0, bBookUsers: 0, totalUsers: 0 })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBook, setFilterBook] = useState('all')
  const [transferring, setTransferring] = useState(null)
  const [selectedUsers, setSelectedUsers] = useState([])
  const [bulkTransferring, setBulkTransferring] = useState(false)
  
  // LP Connection Settings
  const [showLpSettings, setShowLpSettings] = useState(false)
  const [lpSettings, setLpSettings] = useState({
    lpApiKey: '',
    lpApiSecret: '',
    lpApiUrl: '',
    corecenWsUrl: ''
  })
  const [showSecrets, setShowSecrets] = useState({ key: false, secret: false })
  const [savingLpSettings, setSavingLpSettings] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState(null) // 'success' | 'error' | null
  const [connectionMessage, setConnectionMessage] = useState('')
  const [lpConnected, setLpConnected] = useState(false)
  const [checkingLpStatus, setCheckingLpStatus] = useState(true)
  
  // LP Account Info
  const [lpAccountInfo, setLpAccountInfo] = useState(null)
  const [loadingLpAccount, setLoadingLpAccount] = useState(false)

  // LP Sync Status
  const [showSyncPanel, setShowSyncPanel] = useState(false)
  const [syncTrades, setSyncTrades] = useState([])
  const [syncStats, setSyncStats] = useState({ total: 0, synced: 0, failed: 0, pending: 0, notPushed: 0 })
  const [syncLoading, setSyncLoading] = useState(false)
  const [syncFilter, setSyncFilter] = useState('all')
  const [syncPage, setSyncPage] = useState(1)
  const [syncTotalPages, setSyncTotalPages] = useState(1)
  const [retryingTrade, setRetryingTrade] = useState(null)
  const [retryingAll, setRetryingAll] = useState(false)
  const [pushingUnsent, setPushingUnsent] = useState(false)
  const [syncMessage, setSyncMessage] = useState(null)

  useEffect(() => {
    fetchUsers()
    fetchLpSettings()
    checkLpConnectionStatus()
    fetchLpAccountInfo()
    fetchSyncStatus()
  }, [filterBook])

  useEffect(() => {
    if (showSyncPanel) fetchSyncStatus()
  }, [showSyncPanel, syncFilter, syncPage])

  // Check LP connection status on mount and periodically
  const checkLpConnectionStatus = async () => {
    setCheckingLpStatus(true)
    try {
      const res = await fetch(`${API_URL}/book/lp-status`)
      const data = await res.json()
      setLpConnected(data.connected === true)
    } catch (error) {
      console.error('Error checking LP status:', error)
      setLpConnected(false)
    }
    setCheckingLpStatus(false)
  }

  // Fetch LP account balance and margin info
  const fetchLpAccountInfo = async () => {
    setLoadingLpAccount(true)
    try {
      const adminId = localStorage.getItem('adminId')
      const res = await fetch(`${API_URL}/book/lp/account`, {
        headers: { 'x-admin-id': adminId }
      })
      const data = await res.json()
      if (data.success) {
        setLpAccountInfo(data.account)
      } else {
        setLpAccountInfo(null)
      }
    } catch (error) {
      console.error('Error fetching LP account info:', error)
      setLpAccountInfo(null)
    }
    setLoadingLpAccount(false)
  }

  // Fetch LP Sync Status
  const fetchSyncStatus = async () => {
    setSyncLoading(true)
    try {
      const params = new URLSearchParams({ page: syncPage, limit: 50 })
      if (syncFilter !== 'all') params.append('status', syncFilter)
      const res = await fetch(`${API_URL}/book/lp-sync-status?${params}`)
      const data = await res.json()
      if (data.success) {
        setSyncTrades(data.trades)
        setSyncStats(data.stats)
        setSyncTotalPages(data.totalPages)
      }
    } catch (error) {
      console.error('Error fetching sync status:', error)
    }
    setSyncLoading(false)
  }

  // Retry single trade LP push
  const handleRetryTrade = async (tradeId) => {
    setRetryingTrade(tradeId)
    setSyncMessage(null)
    try {
      const res = await fetch(`${API_URL}/book/lp-retry/${tradeId}`, { method: 'POST' })
      const data = await res.json()
      setSyncMessage({ type: data.success ? 'success' : 'error', text: data.message })
      fetchSyncStatus()
    } catch (error) {
      setSyncMessage({ type: 'error', text: error.message })
    }
    setRetryingTrade(null)
  }

  // Retry all failed LP pushes
  const handleRetryAll = async () => {
    setRetryingAll(true)
    setSyncMessage(null)
    try {
      const res = await fetch(`${API_URL}/book/lp-retry-all`, { method: 'POST' })
      const data = await res.json()
      setSyncMessage({ type: data.succeeded > 0 ? 'success' : 'error', text: data.message })
      fetchSyncStatus()
    } catch (error) {
      setSyncMessage({ type: 'error', text: error.message })
    }
    setRetryingAll(false)
  }

  // Push all unsent A-Book trades
  const handlePushUnsent = async () => {
    setPushingUnsent(true)
    setSyncMessage(null)
    try {
      const res = await fetch(`${API_URL}/book/lp-push-unsent`, { method: 'POST' })
      const data = await res.json()
      setSyncMessage({ type: data.succeeded > 0 ? 'success' : 'error', text: data.message })
      fetchSyncStatus()
    } catch (error) {
      setSyncMessage({ type: 'error', text: error.message })
    }
    setPushingUnsent(false)
  }

  // Fetch LP settings on mount
  const fetchLpSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/book/lp-settings`)
      const data = await res.json()
      if (data.success && data.fullSettings) {
        setLpSettings({
          lpApiKey: data.fullSettings.lpApiKey || '',
          lpApiSecret: data.fullSettings.lpApiSecret || '',
          lpApiUrl: data.fullSettings.lpApiUrl || '',
          corecenWsUrl: data.fullSettings.corecenWsUrl || ''
        })
      }
    } catch (error) {
      console.error('Error fetching LP settings:', error)
    }
  }

  // Save LP settings
  const saveLpSettings = async () => {
    setSavingLpSettings(true)
    setConnectionStatus(null)
    try {
      const res = await fetch(`${API_URL}/book/lp-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lpSettings)
      })
      const data = await res.json()
      if (data.success) {
        setConnectionStatus('success')
        setConnectionMessage('LP settings saved successfully!')
        setTimeout(() => setConnectionStatus(null), 3000)
      } else {
        setConnectionStatus('error')
        setConnectionMessage(data.message || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving LP settings:', error)
      setConnectionStatus('error')
      setConnectionMessage('Error saving settings')
    }
    setSavingLpSettings(false)
  }

  // Test LP connection
  const testLpConnection = async () => {
    setTestingConnection(true)
    setConnectionStatus(null)
    try {
      const res = await fetch(`${API_URL}/book/test-lp-connection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lpSettings)
      })
      const data = await res.json()
      if (data.success) {
        setConnectionStatus('success')
        setConnectionMessage(data.message || 'Connection successful!')
        setLpConnected(true)
      } else {
        setConnectionStatus('error')
        setConnectionMessage(data.message || 'Connection failed')
        setLpConnected(false)
      }
    } catch (error) {
      console.error('Error testing LP connection:', error)
      setConnectionStatus('error')
      setConnectionMessage('Error testing connection')
      setLpConnected(false)
    }
    setTestingConnection(false)
  }

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterBook !== 'all') params.append('bookType', filterBook)
      if (searchTerm) params.append('search', searchTerm)
      
      const res = await fetch(`${API_URL}/book/users?${params}`)
      const data = await res.json()
      if (data.success) {
        setUsers(data.users)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
    setLoading(false)
  }

  const handleTransfer = async (userId, bookType) => {
    setTransferring(userId)
    try {
      const res = await fetch(`${API_URL}/book/users/${userId}/transfer`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookType })
      })
      const data = await res.json()
      if (data.success) {
        fetchUsers()
      } else {
        alert(data.message || 'Failed to transfer user')
      }
    } catch (error) {
      console.error('Error transferring user:', error)
      alert('Error transferring user')
    }
    setTransferring(null)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchUsers()
  }

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map(u => u._id))
    }
  }

  const handleBulkTransfer = async (bookType) => {
    if (selectedUsers.length === 0) {
      alert('Please select users to transfer')
      return
    }
    
    setBulkTransferring(true)
    try {
      const res = await fetch(`${API_URL}/book/users/bulk-transfer`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: selectedUsers, bookType })
      })
      const data = await res.json()
      if (data.success) {
        setSelectedUsers([])
        fetchUsers()
      } else {
        alert(data.message || 'Failed to transfer users')
      }
    } catch (error) {
      console.error('Error bulk transferring users:', error)
      alert('Error transferring users')
    }
    setBulkTransferring(false)
  }

  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true
    return user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const getStatusColor = (user) => {
    if (user.isBanned) return 'bg-red-500/20 text-red-500'
    if (user.isBlocked) return 'bg-yellow-500/20 text-yellow-500'
    return 'bg-green-500/20 text-green-500'
  }

  const getStatusText = (user) => {
    if (user.isBanned) return 'Banned'
    if (user.isBlocked) return 'Blocked'
    return 'Active'
  }

  return (
    <AdminLayout title="Book Management" subtitle="Manage A Book and B Book users">
      {/* LP Connection Status Banner */}
      <div className={`mb-4 p-4 rounded-xl flex items-center justify-between ${
        checkingLpStatus 
          ? 'bg-yellow-500/10 border border-yellow-500/30' 
          : lpConnected 
            ? 'bg-green-500/10 border border-green-500/30' 
            : 'bg-red-500/10 border border-red-500/30'
      }`}>
        <div className="flex items-center gap-3">
          {checkingLpStatus ? (
            <RefreshCw size={20} className="text-yellow-500 animate-spin" />
          ) : lpConnected ? (
            <CheckCircle size={20} className="text-green-500" />
          ) : (
            <XCircle size={20} className="text-red-500" />
          )}
          <div>
            <p className={`font-medium ${checkingLpStatus ? 'text-yellow-400' : lpConnected ? 'text-green-400' : 'text-red-400'}`}>
              {checkingLpStatus ? 'Checking LP Connection...' : lpConnected ? 'LP Connected' : 'LP Not Connected'}
            </p>
            <p className="text-gray-500 text-sm">
              {checkingLpStatus 
                ? 'Verifying connection to Liquidity Provider' 
                : lpConnected 
                  ? 'A-Book trades will be routed to LP automatically' 
                  : 'Configure LP settings below to enable A-Book routing'}
            </p>
          </div>
        </div>
        <button
          onClick={checkLpConnectionStatus}
          disabled={checkingLpStatus}
          className="flex items-center gap-2 px-3 py-1.5 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg text-sm transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={checkingLpStatus ? 'animate-spin' : ''} />
          Check Status
        </button>
      </div>

      {/* Warning if LP not connected */}
      {!checkingLpStatus && !lpConnected && (
        <div className="mb-4 p-3 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center gap-3">
          <Info size={18} className="text-orange-500 flex-shrink-0" />
          <p className="text-orange-400 text-sm">
            <strong>Warning:</strong> Users cannot be moved to A-Book while LP is disconnected. Please configure and test the LP connection first.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowLpSettings(!showLpSettings)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              lpConnected 
                ? 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30' 
                : 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30'
            }`}
          >
            <Settings size={16} />
            LP Connection Settings
            {showLpSettings ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button
            onClick={() => { setShowSyncPanel(!showSyncPanel); if (!showSyncPanel) setShowLpSettings(false) }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showSyncPanel
                ? 'bg-cyan-500/30 text-cyan-400 border border-cyan-500/40'
                : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30'
            }`}
          >
            <Activity size={16} />
            LP Trade Sync
            {syncStats.failed > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">{syncStats.failed}</span>
            )}
            {showSyncPanel ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* LP Connection Settings Panel */}
      {showLpSettings && (
        <div className="bg-dark-800 rounded-xl p-6 border border-purple-500/30 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Wifi size={20} className="text-purple-500" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Liquidity Provider Connection</h3>
              <p className="text-gray-500 text-sm">Configure connection to Corcen LP for A-Book trade routing</p>
            </div>
          </div>

          {/* Connection Status Message */}
          {connectionStatus && (
            <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
              connectionStatus === 'success' 
                ? 'bg-green-500/20 border border-green-500/30 text-green-400' 
                : 'bg-red-500/20 border border-red-500/30 text-red-400'
            }`}>
              {connectionStatus === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
              <span>{connectionMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* LP API URL */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                <Link size={14} className="inline mr-2" />
                LP API URL
              </label>
              <input
                type="text"
                value={lpSettings.lpApiUrl}
                onChange={(e) => setLpSettings({ ...lpSettings, lpApiUrl: e.target.value })}
                placeholder="http://localhost:3001"
                className="w-full bg-dark-700 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* WebSocket URL */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                <Wifi size={14} className="inline mr-2" />
                WebSocket URL
              </label>
              <input
                type="text"
                value={lpSettings.corecenWsUrl}
                onChange={(e) => setLpSettings({ ...lpSettings, corecenWsUrl: e.target.value })}
                placeholder="http://localhost:3001"
                className="w-full bg-dark-700 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* LP API Key */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                <Key size={14} className="inline mr-2" />
                LP API Key
              </label>
              <div className="relative">
                <input
                  type={showSecrets.key ? 'text' : 'password'}
                  value={lpSettings.lpApiKey}
                  onChange={(e) => setLpSettings({ ...lpSettings, lpApiKey: e.target.value })}
                  placeholder="lpk_xxxxxxxxxxxxxxxx"
                  className="w-full bg-dark-700 border border-gray-700 rounded-lg px-4 py-2 pr-10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowSecrets({ ...showSecrets, key: !showSecrets.key })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showSecrets.key ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* LP API Secret */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                <Key size={14} className="inline mr-2" />
                LP API Secret
              </label>
              <div className="relative">
                <input
                  type={showSecrets.secret ? 'text' : 'password'}
                  value={lpSettings.lpApiSecret}
                  onChange={(e) => setLpSettings({ ...lpSettings, lpApiSecret: e.target.value })}
                  placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full bg-dark-700 border border-gray-700 rounded-lg px-4 py-2 pr-10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowSecrets({ ...showSecrets, secret: !showSecrets.secret })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showSecrets.secret ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={testLpConnection}
              disabled={testingConnection || !lpSettings.lpApiUrl}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testingConnection ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Wifi size={16} />
              )}
              Test Connection
            </button>
            <button
              onClick={saveLpSettings}
              disabled={savingLpSettings}
              className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {savingLpSettings ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Save Settings
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-4 p-3 bg-dark-700 rounded-lg">
            <p className="text-gray-500 text-xs">
              <strong className="text-gray-400">Note:</strong> These settings configure the connection to your Corcen Liquidity Provider. 
              A-Book trades will be automatically routed to the LP using these credentials. 
              Make sure to test the connection before saving.
            </p>
          </div>

          {/* LP Account Info */}
          <div className="mt-4 p-4 bg-dark-700 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-semibold flex items-center gap-2">
                <Info size={16} className="text-purple-400" />
                Corecen LP Account Status
              </h4>
              <button
                onClick={fetchLpAccountInfo}
                disabled={loadingLpAccount}
                className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
              >
                <RefreshCw size={14} className={loadingLpAccount ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
            
            {loadingLpAccount ? (
              <div className="text-gray-500 text-sm">Loading LP account info...</div>
            ) : lpAccountInfo ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-dark-800 p-3 rounded-lg">
                  <p className="text-gray-500 text-xs mb-1">Balance</p>
                  <p className={`text-lg font-bold ${lpAccountInfo.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${lpAccountInfo.balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </p>
                </div>
                <div className="bg-dark-800 p-3 rounded-lg">
                  <p className="text-gray-500 text-xs mb-1">Equity</p>
                  <p className={`text-lg font-bold ${lpAccountInfo.equity >= 0 ? 'text-white' : 'text-red-400'}`}>
                    ${lpAccountInfo.equity?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </p>
                </div>
                <div className="bg-dark-800 p-3 rounded-lg">
                  <p className="text-gray-500 text-xs mb-1">Free Margin</p>
                  <p className={`text-lg font-bold ${lpAccountInfo.freeMargin >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                    ${lpAccountInfo.freeMargin?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </p>
                </div>
                <div className="bg-dark-800 p-3 rounded-lg">
                  <p className="text-gray-500 text-xs mb-1">Open Positions</p>
                  <p className="text-lg font-bold text-yellow-400">
                    {lpAccountInfo.openPositions || 0}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-yellow-400 text-sm bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/30">
                ⚠️ Unable to fetch LP account info. Check your API credentials and connection.
              </div>
            )}
            
            {lpAccountInfo && lpAccountInfo.freeMargin < 0 && (
              <div className="mt-3 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm font-semibold">⚠️ INSUFFICIENT MARGIN</p>
                <p className="text-red-300 text-xs mt-1">
                  Your Corecen LP account has negative free margin. A-Book trades cannot be pushed until you deposit funds into your Corecen broker account.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LP Trade Sync Status Panel */}
      {showSyncPanel && (
        <div className="bg-dark-800 rounded-xl p-4 sm:p-6 border border-cyan-500/30 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Activity size={20} className="text-cyan-500" />
              </div>
              <div>
                <h3 className="text-white font-semibold">LP Trade Sync Status</h3>
                <p className="text-gray-500 text-sm">Monitor A-Book trade pushes to Corecen LP</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <button onClick={handlePushUnsent} disabled={pushingUnsent}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 rounded-lg text-sm transition-colors disabled:opacity-50">
                {pushingUnsent ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                Push Unsent
              </button>
              <button onClick={handleRetryAll} disabled={retryingAll || syncStats.failed === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 rounded-lg text-sm transition-colors disabled:opacity-50">
                {retryingAll ? <RefreshCw size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                Retry All Failed
              </button>
              <button onClick={fetchSyncStatus} disabled={syncLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg text-sm transition-colors disabled:opacity-50">
                <RefreshCw size={14} className={syncLoading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {syncMessage && (
            <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${syncMessage.type === 'success' ? 'bg-green-500/20 border border-green-500/30 text-green-400' : 'bg-red-500/20 border border-red-500/30 text-red-400'}`}>
              {syncMessage.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
              <span className="flex-1">{syncMessage.text}</span>
              <button onClick={() => setSyncMessage(null)} className="text-gray-500 hover:text-gray-300"><XCircle size={14} /></button>
            </div>
          )}

          {/* Sync Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 mb-5">
            {[
              { key: 'all', label: 'Total A-Book', value: syncStats.total, color: 'text-white' },
              { key: 'SYNCED', label: 'Synced', value: syncStats.synced, color: 'text-green-400' },
              { key: 'FAILED', label: 'Failed', value: syncStats.failed, color: 'text-red-400' },
              { key: 'PENDING', label: 'Pending', value: syncStats.pending, color: 'text-yellow-400' },
              { key: 'NONE', label: 'Not Pushed', value: syncStats.notPushed, color: 'text-gray-400' },
            ].map(s => (
              <button key={s.key} onClick={() => { setSyncFilter(s.key); setSyncPage(1) }}
                className={`p-3 rounded-lg text-left transition-colors ${syncFilter === s.key ? 'bg-cyan-500/20 border border-cyan-500/40' : 'bg-dark-700 border border-transparent hover:border-gray-600'}`}>
                <p className="text-gray-500 text-xs">{s.label}</p>
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              </button>
            ))}
          </div>

          {/* Trades Table */}
          {syncLoading ? (
            <div className="text-center py-8 text-gray-500">Loading sync data...</div>
          ) : syncTrades.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No A-Book trades found</div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block lg:hidden space-y-3">
                {syncTrades.map((trade) => (
                  <div key={trade._id} className="bg-dark-700 rounded-xl p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-mono text-sm">{trade.tradeId}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        trade.lpSyncStatus === 'SYNCED' ? 'bg-green-500/20 text-green-400' :
                        trade.lpSyncStatus === 'FAILED' ? 'bg-red-500/20 text-red-400' :
                        trade.lpSyncStatus === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                        trade.lpSyncStatus === 'CLOSED_SYNCED' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {trade.lpSyncStatus || 'NONE'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                      <div><span className="text-gray-500">User:</span> <span className="text-gray-300">{trade.userId?.email || 'N/A'}</span></div>
                      <div><span className="text-gray-500">Symbol:</span> <span className="text-white">{trade.symbol}</span></div>
                      <div><span className="text-gray-500">Side:</span> <span className={trade.side === 'BUY' ? 'text-green-400' : 'text-red-400'}>{trade.side}</span></div>
                      <div><span className="text-gray-500">Vol:</span> <span className="text-white">{trade.quantity}</span></div>
                      <div><span className="text-gray-500">Price:</span> <span className="text-white">{trade.openPrice}</span></div>
                      <div><span className="text-gray-500">Attempts:</span> <span className="text-white">{trade.lpSyncAttempts || 0}</span></div>
                    </div>
                    {trade.lpSyncError && (
                      <div className="mb-2 p-2 bg-red-500/10 rounded text-red-400 text-xs break-all">{trade.lpSyncError}</div>
                    )}
                    {(trade.lpSyncStatus === 'FAILED' || !trade.lpSyncStatus || trade.lpSyncStatus === 'NONE') && trade.status === 'OPEN' && (
                      <button onClick={() => handleRetryTrade(trade._id)} disabled={retryingTrade === trade._id}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 rounded-lg text-sm transition-colors disabled:opacity-50">
                        {retryingTrade === trade._id ? <RefreshCw size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                        Retry Push
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left text-gray-500 text-xs font-medium py-2 px-3">Trade ID</th>
                      <th className="text-left text-gray-500 text-xs font-medium py-2 px-3">User</th>
                      <th className="text-left text-gray-500 text-xs font-medium py-2 px-3">Symbol</th>
                      <th className="text-left text-gray-500 text-xs font-medium py-2 px-3">Side</th>
                      <th className="text-left text-gray-500 text-xs font-medium py-2 px-3">Volume</th>
                      <th className="text-left text-gray-500 text-xs font-medium py-2 px-3">Price</th>
                      <th className="text-left text-gray-500 text-xs font-medium py-2 px-3">Status</th>
                      <th className="text-left text-gray-500 text-xs font-medium py-2 px-3">Sync Status</th>
                      <th className="text-left text-gray-500 text-xs font-medium py-2 px-3">Error</th>
                      <th className="text-left text-gray-500 text-xs font-medium py-2 px-3">Attempts</th>
                      <th className="text-left text-gray-500 text-xs font-medium py-2 px-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {syncTrades.map((trade) => (
                      <tr key={trade._id} className="border-b border-gray-800 hover:bg-dark-700/50">
                        <td className="py-2.5 px-3 text-white font-mono text-xs">{trade.tradeId}</td>
                        <td className="py-2.5 px-3">
                          <div className="text-gray-300 text-xs">{trade.userId?.firstName || 'N/A'}</div>
                          <div className="text-gray-500 text-xs">{trade.userId?.email || ''}</div>
                        </td>
                        <td className="py-2.5 px-3 text-white text-sm font-medium">{trade.symbol}</td>
                        <td className="py-2.5 px-3">
                          <span className={`text-xs font-medium ${trade.side === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>{trade.side}</span>
                        </td>
                        <td className="py-2.5 px-3 text-white text-sm">{trade.quantity}</td>
                        <td className="py-2.5 px-3 text-white text-sm">{trade.openPrice}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${trade.status === 'OPEN' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                            {trade.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            trade.lpSyncStatus === 'SYNCED' ? 'bg-green-500/20 text-green-400' :
                            trade.lpSyncStatus === 'FAILED' ? 'bg-red-500/20 text-red-400' :
                            trade.lpSyncStatus === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                            trade.lpSyncStatus === 'CLOSED_SYNCED' ? 'bg-blue-500/20 text-blue-400' :
                            trade.lpSyncStatus === 'CLOSE_FAILED' ? 'bg-red-500/20 text-red-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {trade.lpSyncStatus || 'NONE'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          {trade.lpSyncError ? (
                            <span className="text-red-400 text-xs max-w-[200px] block truncate" title={trade.lpSyncError}>{trade.lpSyncError}</span>
                          ) : (
                            <span className="text-gray-600 text-xs">-</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-gray-400 text-sm">{trade.lpSyncAttempts || 0}</td>
                        <td className="py-2.5 px-3">
                          {(trade.lpSyncStatus === 'FAILED' || !trade.lpSyncStatus || trade.lpSyncStatus === 'NONE') && trade.status === 'OPEN' ? (
                            <button onClick={() => handleRetryTrade(trade._id)} disabled={retryingTrade === trade._id}
                              className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 rounded text-xs transition-colors disabled:opacity-50">
                              {retryingTrade === trade._id ? <RefreshCw size={12} className="animate-spin" /> : <RotateCcw size={12} />}
                              Retry
                            </button>
                          ) : (
                            <span className="text-gray-600 text-xs">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {syncTotalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                  <p className="text-gray-500 text-sm">Page {syncPage} of {syncTotalPages}</p>
                  <div className="flex gap-2">
                    <button onClick={() => setSyncPage(p => Math.max(1, p - 1))} disabled={syncPage <= 1}
                      className="px-3 py-1 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed">Prev</button>
                    <button onClick={() => setSyncPage(p => Math.min(syncTotalPages, p + 1))} disabled={syncPage >= syncTotalPages}
                      className="px-3 py-1 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-dark-800 rounded-xl p-5 border border-gray-800 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
            <BookOpen size={24} className="text-green-500" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">A Book Users</p>
            <p className="text-white text-2xl font-bold">{stats.aBookUsers}</p>
          </div>
        </div>
        <div className="bg-dark-800 rounded-xl p-5 border border-gray-800 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <BookOpen size={24} className="text-blue-500" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">B Book Users</p>
            <p className="text-white text-2xl font-bold">{stats.bBookUsers}</p>
          </div>
        </div>
        <div className="bg-dark-800 rounded-xl p-5 border border-gray-800 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <Users size={24} className="text-purple-500" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Users</p>
            <p className="text-white text-2xl font-bold">{stats.totalUsers}</p>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-dark-800 rounded-xl p-4 border border-gray-800 mb-6">
        <div className="flex items-start gap-3">
          <Info size={20} className="text-yellow-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-yellow-500 font-semibold mb-2">A Book vs B Book</h3>
            <ul className="text-gray-400 text-sm space-y-1">
              <li>• <strong className="text-white">A Book:</strong> Trades go to liquidity provider. Admin cannot modify trades. Only charges are deducted.</li>
              <li>• <strong className="text-white">B Book:</strong> Trades are managed internally. Admin has full control over trades, P&L, and modifications.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-dark-800 rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-dark-700 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-gray-600"
              />
            </div>
          </form>
          <select
            value={filterBook}
            onChange={(e) => setFilterBook(e.target.value)}
            className="bg-dark-700 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gray-600"
          >
            <option value="all">All Books</option>
            <option value="A">A Book</option>
            <option value="B">B Book</option>
          </select>
          {selectedUsers.length > 0 && (
            <>
              <span className="text-gray-400 text-sm whitespace-nowrap">{selectedUsers.length} selected</span>
              <button
                onClick={() => handleBulkTransfer('A')}
                disabled={bulkTransferring || !lpConnected}
                title={!lpConnected ? 'LP must be connected to move users to A-Book' : ''}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${
                  !lpConnected 
                    ? 'bg-gray-500/20 text-gray-500 border border-gray-500/30' 
                    : 'bg-green-500/20 hover:bg-green-500/30 text-green-500 border border-green-500/30'
                }`}
              >
                Move to A Book
              </button>
              <button
                onClick={() => handleBulkTransfer('B')}
                disabled={bulkTransferring}
                className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-500 border border-blue-500/30 rounded-lg text-sm font-medium transition-colors whitespace-nowrap disabled:opacity-50"
              >
                Move to B Book
              </button>
            </>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No users found</div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block lg:hidden p-4 space-y-3">
              {filteredUsers.map((user) => (
                <div key={user._id} className={`bg-dark-700 rounded-xl p-4 border ${selectedUsers.includes(user._id) ? 'border-primary-500' : 'border-gray-700'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => handleSelectUser(user._id)}
                        className="rounded border-gray-600 bg-dark-700 text-primary-500 focus:ring-primary-500 cursor-pointer" 
                      />
                      <div>
                        <p className="text-white font-medium">{user.firstName || 'N/A'}</p>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(user)}`}>
                      {getStatusText(user)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-gray-500 text-xs">Current Book</p>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        user.bookType === 'A' ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-500'
                      }`}>
                        {user.bookType || 'B'} Book
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500 text-xs">Changed At</p>
                      <p className="text-gray-400 text-sm">
                        {user.bookChangedAt ? new Date(user.bookChangedAt).toLocaleDateString() : '-'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTransfer(user._id, 'A')}
                      disabled={user.bookType === 'A' || transferring === user._id || !lpConnected}
                      title={!lpConnected ? 'LP must be connected to move users to A-Book' : ''}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        user.bookType === 'A'
                          ? 'bg-green-500/20 text-green-500 opacity-50 cursor-not-allowed'
                          : !lpConnected
                            ? 'bg-gray-500/20 text-gray-500 opacity-50 cursor-not-allowed'
                            : 'bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/30'
                      }`}
                    >
                      A Book
                    </button>
                    <button
                      onClick={() => handleTransfer(user._id, 'B')}
                      disabled={user.bookType === 'B' || !user.bookType || transferring === user._id}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        user.bookType === 'B' || !user.bookType
                          ? 'bg-blue-500/20 text-blue-500 opacity-50 cursor-not-allowed'
                          : 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/30'
                      }`}
                    >
                      B Book
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-gray-500 text-sm font-medium py-3 px-4">
                      <input 
                        type="checkbox" 
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-600 bg-dark-700 text-primary-500 focus:ring-primary-500 cursor-pointer" 
                      />
                    </th>
                    <th className="text-left text-gray-500 text-sm font-medium py-3 px-4">User</th>
                    <th className="text-left text-gray-500 text-sm font-medium py-3 px-4">Email</th>
                    <th className="text-left text-gray-500 text-sm font-medium py-3 px-4">Current Book</th>
                    <th className="text-left text-gray-500 text-sm font-medium py-3 px-4">Changed At</th>
                    <th className="text-left text-gray-500 text-sm font-medium py-3 px-4">Status</th>
                    <th className="text-left text-gray-500 text-sm font-medium py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className={`border-b border-gray-800 hover:bg-dark-700/50 ${selectedUsers.includes(user._id) ? 'bg-dark-700/30' : ''}`}>
                      <td className="py-4 px-4">
                        <input 
                          type="checkbox" 
                          checked={selectedUsers.includes(user._id)}
                          onChange={() => handleSelectUser(user._id)}
                          className="rounded border-gray-600 bg-dark-700 text-primary-500 focus:ring-primary-500 cursor-pointer" 
                        />
                      </td>
                      <td className="py-4 px-4 text-white font-medium">{user.firstName || 'N/A'}</td>
                      <td className="py-4 px-4 text-gray-400">{user.email}</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.bookType === 'A' ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-500'
                        }`}>
                          {user.bookType || 'B'} Book
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-400">
                        {user.bookChangedAt ? new Date(user.bookChangedAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(user)}`}>
                          {getStatusText(user)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleTransfer(user._id, 'A')}
                            disabled={user.bookType === 'A' || transferring === user._id || !lpConnected}
                            title={!lpConnected ? 'LP must be connected to move users to A-Book' : ''}
                            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                              user.bookType === 'A'
                                ? 'bg-green-500/20 text-green-500 opacity-50 cursor-not-allowed'
                                : !lpConnected
                                  ? 'bg-gray-500/20 text-gray-500 opacity-50 cursor-not-allowed'
                                  : 'bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/30'
                            }`}
                          >
                            A Book
                          </button>
                          <button
                            onClick={() => handleTransfer(user._id, 'B')}
                            disabled={user.bookType === 'B' || !user.bookType || transferring === user._id}
                            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                              user.bookType === 'B' || !user.bookType
                                ? 'bg-blue-500/20 text-blue-500 opacity-50 cursor-not-allowed'
                                : 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/30'
                            }`}
                          >
                            B Book
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminBookManagement
