import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Key,
  Save,
  Eye,
  EyeOff,
  Check,
  X,
  AlertCircle,
  Info
} from 'lucide-react'
import { RootState, AppDispatch } from '../store'
import { getCurrentUserAsync } from '../store/auth.slice'
import { settingsAPI } from '../services/settings.api'

interface UserProfile {
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: string
}

interface NotificationSettings {
  emailNotifications: boolean
  bookingAlerts: boolean
  paymentAlerts: boolean
  maintenanceAlerts: boolean
  weeklyReports: boolean
  monthlyReports: boolean
}

interface SecuritySettings {
  twoFactorEnabled: boolean
  sessionTimeout: number
  loginAlerts: boolean
}

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'api'>('profile')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null)
  
  // Profile state
  const [profile, setProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: ''
  })
  
  // Notification settings
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    bookingAlerts: true,
    paymentAlerts: true,
    maintenanceAlerts: false,
    weeklyReports: true,
    monthlyReports: true
  })
  
  // Security settings
  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    sessionTimeout: 30,
    loginAlerts: true
  })
  
  // Password change
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  // API Keys
  const [apiKeys, setApiKeys] = useState<Array<{
    id: string
    name: string
    key: string
    lastUsed?: string
    createdAt?: string
  }>>([])
  
  const { user, token } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: '',
        role: user.role || ''
      })
    }
  }, [user])

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    if (!token) return
    
    setLoading(true)
    try {
      // Fetch notification settings
      const notificationSettings = await settingsAPI.getNotificationSettings()
      setNotifications(notificationSettings)

      // Fetch security settings
      const securitySettings = await settingsAPI.getSecuritySettings()
      setSecurity(securitySettings)

      // Mock API keys for now
      setApiKeys([
        { id: '1', name: 'Hostaway API', key: 'ha_***', lastUsed: '2024-01-15', createdAt: '2024-01-15' },
        { id: '2', name: 'Hostkit API', key: 'hk_***', lastUsed: '2024-01-14', createdAt: '2024-01-14' }
      ])
    } catch (error) {
      console.error('Error fetching settings:', error)
      setMessage({ type: 'error', text: 'Failed to load settings' })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!token) return
    
    setSaving(true)
    try {
      const response = await settingsAPI.updateUserProfile({
        name: `${profile.firstName} ${profile.lastName}`.trim(),
        phone: profile.phone
      })
      
      setMessage({ type: 'success', text: response.message })
      dispatch(getCurrentUserAsync())
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error updating profile' })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveNotifications = async () => {
    if (!token) return
    
    setSaving(true)
    try {
      const response = await settingsAPI.updateNotificationSettings(notifications)
      setMessage({ type: 'success', text: response.message })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error updating notification settings' })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveSecurity = async () => {
    if (!token) return
    
    setSaving(true)
    try {
      const response = await settingsAPI.updateSecuritySettings(security)
      setMessage({ type: 'success', text: response.message })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error updating security settings' })
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!token) return
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }

    setSaving(true)
    try {
      // Mock API call - TODO: Implement backend endpoint
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
      setMessage({ type: 'success', text: 'Password changed successfully' })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Error changing password' })
    } finally {
      setSaving(false)
    }
  }

  const handleCreateApiKey = async () => {
    if (!token) return
    
    const name = prompt('Enter a name for the API key:')
    if (!name) return

    setSaving(true)
    try {
      // Mock API call - TODO: Implement backend endpoint
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
      const newKey = { id: Date.now().toString(), name, key: 'new_key_***', lastUsed: new Date().toISOString().split('T')[0], createdAt: new Date().toISOString().split('T')[0] }
      setApiKeys([...apiKeys, newKey])
      setMessage({ type: 'success', text: 'API key created successfully' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Error creating API key' })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteApiKey = async (keyId: string) => {
    if (!token) return
    
    if (!confirm('Are you sure you want to delete this API key?')) return

    setSaving(true)
    try {
      // Mock API call - TODO: Implement backend endpoint
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
      setApiKeys(apiKeys.filter(key => key.id !== keyId))
      setMessage({ type: 'success', text: 'API key deleted successfully' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Error deleting API key' })
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <SettingsIcon className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">Manage your account settings and preferences</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center ${
          message.type === 'success' ? 'bg-green-50 text-green-800' :
          message.type === 'error' ? 'bg-red-50 text-red-800' :
          'bg-blue-50 text-blue-800'
        }`}>
          {message.type === 'success' ? (
            <Check className="h-5 w-5 mr-2" />
          ) : message.type === 'error' ? (
            <X className="h-5 w-5 mr-2" />
          ) : (
            <Info className="h-5 w-5 mr-2" />
          )}
          {message.text}
          <button
            onClick={() => setMessage(null)}
            className="ml-auto text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'profile', name: 'Profile', icon: User },
            { id: 'notifications', name: 'Notifications', icon: Bell },
            { id: 'security', name: 'Security', icon: Shield },
            { id: 'api', name: 'API Keys', icon: Key }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
            </div>
            <div className="card-content">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={profile.firstName}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    className="input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={profile.lastName}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    className="input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <input
                    type="text"
                    value={profile.role}
                    disabled
                    className="input bg-gray-50"
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="btn-primary"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="input pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="input"
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  onClick={handleChangePassword}
                  disabled={saving}
                  className="btn-primary"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Email Notifications</h3>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive email notifications' },
                  { key: 'bookingAlerts', label: 'Booking Alerts', description: 'Get notified about new bookings' },
                  { key: 'paymentAlerts', label: 'Payment Alerts', description: 'Get notified about payments' },
                  { key: 'maintenanceAlerts', label: 'Maintenance Alerts', description: 'Get notified about maintenance issues' },
                  { key: 'weeklyReports', label: 'Weekly Reports', description: 'Receive weekly performance reports' },
                  { key: 'monthlyReports', label: 'Monthly Reports', description: 'Receive monthly performance reports' }
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{setting.label}</h4>
                      <p className="text-sm text-gray-500">{setting.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications[setting.key as keyof NotificationSettings]}
                        onChange={(e) => setNotifications({ ...notifications, [setting.key]: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <button
                  onClick={handleSaveNotifications}
                  disabled={saving}
                  className="btn-primary"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
            </div>
            <div className="card-content">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={security.twoFactorEnabled}
                      onChange={(e) => setSecurity({ ...security, twoFactorEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Timeout (minutes)
                  </label>
                  <select
                    value={security.sessionTimeout}
                    onChange={(e) => setSecurity({ ...security, sessionTimeout: parseInt(e.target.value) })}
                    className="input"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={120}>2 hours</option>
                    <option value={480}>8 hours</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Login Alerts</h4>
                    <p className="text-sm text-gray-500">Get notified when someone logs into your account</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={security.loginAlerts}
                      onChange={(e) => setSecurity({ ...security, loginAlerts: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  onClick={handleSaveSecurity}
                  disabled={saving}
                  className="btn-primary"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API Keys Tab */}
      {activeTab === 'api' && (
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">API Keys</h3>
                <button
                  onClick={handleCreateApiKey}
                  disabled={saving}
                  className="btn-primary btn-sm"
                >
                  <Key className="h-4 w-4 mr-2" />
                  Create API Key
                </button>
              </div>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                {apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{apiKey.name}</h4>
                      <p className="text-sm text-gray-500">
                        Created: {apiKey.createdAt ? formatDate(apiKey.createdAt) : 'Unknown'}
                        {apiKey.lastUsed && ` • Last used: ${formatDate(apiKey.lastUsed)}`}
                      </p>
                      <p className="text-xs text-gray-400 font-mono mt-1">
                        {apiKey.key.substring(0, 8)}...{apiKey.key.substring(apiKey.key.length - 8)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteApiKey(apiKey.id)}
                      className="btn-danger btn-sm"
                    >
                      Delete
                    </button>
                  </div>
                ))}
                
                {apiKeys.length === 0 && (
                  <div className="text-center py-8">
                    <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No API Keys</h3>
                    <p className="text-gray-500">Create your first API key to get started.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings