import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Menu, Bell, ChevronDown, LogOut } from 'lucide-react'
import { RootState, AppDispatch } from '../../store'
import { logoutAsync } from '../../store/auth.slice'
import { markAsRead, markAllAsRead } from '../../store/notifications.slice'
import Logo from '../common/Logo'
import LanguageSwitcher from '../common/LanguageSwitcher'
import { useLanguage } from '../../contexts/LanguageContext'

interface NavbarProps {
  onMenuClick: () => void
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { t } = useLanguage()
  
  const { user } = useSelector((state: RootState) => state.auth)
  const { notifications, unreadCount } = useSelector((state: RootState) => state.notifications)

  const handleLogout = () => {
    dispatch(logoutAsync())
  }

  const handleNotificationClick = (id: string) => {
    dispatch(markAsRead(id))
  }

  const handleMarkAllRead = () => {
    dispatch(markAllAsRead())
  }


  return (
    <header className="bg-white shadow-sm border-b fixed top-0 left-0 right-0 z-30 lg:left-64">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left extreme - Mobile Menu Button */}
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100 mr-2"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

          {/* Right extreme - Language, Notifications and Profile */}
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <LanguageSwitcher showLabel={false} />
            
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">{t('notification.title')}</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-sm text-[#5FFF56] hover:text-[#4FEF46]"
                        >
                          {t('notification.markAllRead')}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        {t('notification.noNotifications')}
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification.id)}
                          className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 ${
                            !notification.read ? 'bg-green-50' : ''
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                              <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-1">{notification.timestamp}</p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-[#5FFF56] rounded-full ml-2 mt-1"></div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-center w-10 h-10 bg-[#5FFF56] rounded-full">
                  <span className="text-sm font-bold text-white">
                    {(user?.firstName || user?.name || user?.username || user?.email || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-base font-bold text-gray-900">{user?.firstName || user?.name || user?.username || 'John'}</p>
                  <p className="text-sm text-[#5FFF56] font-semibold capitalize">{user?.role?.toLowerCase() || 'Owner'}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>

              {/* Profile dropdown */}
              {showProfile && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                  <div className="p-2">
                    <div className="px-3 py-2 border-b border-gray-100 mb-2">
                      <p className="text-sm font-medium text-gray-900">{user?.firstName || user?.name || user?.username || 'User'}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      {t('nav.signOut')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar