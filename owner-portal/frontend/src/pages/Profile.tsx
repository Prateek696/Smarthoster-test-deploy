import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Calendar,
  Edit,
  Save,
  X
} from 'lucide-react'
import { RootState, AppDispatch } from '../store'
import { getCurrentUserAsync } from '../store/auth.slice'
import { settingsAPI } from '../services/settings.api'

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: ''
  })
  
  const { user, token } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    if (user) {
      // Split name into first and last name
      const nameParts = (user.name || '').split(' ')
      setProfile({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user.email || '',
        phone: '', // Phone not available in user object yet
        role: user.role || ''
      })
    }
  }, [user])

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
      setIsEditing(false)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error updating profile' })
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    if (user) {
      const nameParts = (user.name || '').split(' ')
      setProfile({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user.email || '',
        phone: '',
        role: user.role || ''
      })
    }
    setIsEditing(false)
    setMessage(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-slate-400 mt-1">View and manage your profile information</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <Save className="h-5 w-5 mr-2" />
          ) : (
            <X className="h-5 w-5 mr-2" />
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

      {/* Profile Card */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-primary btn-sm"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleCancelEdit}
                  className="btn-secondary btn-sm"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="btn-primary btn-sm"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 inline mr-2" />
                First Name
              </label>
              <input
                type="text"
                value={profile.firstName}
                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                disabled={!isEditing}
                className={`input ${!isEditing ? 'bg-gray-50' : ''}`}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 inline mr-2" />
                Last Name
              </label>
              <input
                type="text"
                value={profile.lastName}
                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                disabled={!isEditing}
                className={`input ${!isEditing ? 'bg-gray-50' : ''}`}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="h-4 w-4 inline mr-2" />
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="input bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="h-4 w-4 inline mr-2" />
                Phone
              </label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                disabled={!isEditing}
                className={`input ${!isEditing ? 'bg-gray-50' : ''}`}
                placeholder="Enter phone number"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Shield className="h-4 w-4 inline mr-2" />
                Role
              </label>
              <input
                type="text"
                value={profile.role}
                disabled
                className="input bg-gray-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-2" />
                Member Since
              </label>
              <input
                type="text"
                value={user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                disabled
                className="input bg-gray-50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Account Status */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Account Status</h3>
        </div>
        <div className="card-content">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${user?.isVerified ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span className="text-sm font-medium text-gray-900">
                {user?.isVerified ? 'Verified Account' : 'Pending Verification'}
              </span>
            </div>
            <div className="flex items-center">
              <Shield className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600 capitalize">{user?.role || 'User'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile

