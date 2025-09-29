import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Menu, ChevronDown, LogOut } from 'lucide-react'
import { RootState, AppDispatch } from '../../store'
import { logoutAsync } from '../../store/auth.slice'
import Logo from '../common/Logo'
import LanguageSwitcher from '../common/LanguageSwitcher'
import { useLanguage } from '../../contexts/LanguageContext'

interface NavbarProps {
  onMenuClick: () => void
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const [showProfile, setShowProfile] = useState(false)
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { t } = useLanguage()
  
  const { user } = useSelector((state: RootState) => state.auth)

  const handleLogout = () => {
    dispatch(logoutAsync())
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

          {/* Right extreme - Language and Profile */}
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <LanguageSwitcher showLabel={false} />

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-[#0ea5e9] to-[#0284c7] rounded-full">
                  <span className="text-xs font-bold text-white">
                    {(user?.firstName || user?.name || user?.username || user?.email || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-900">{user?.firstName || user?.name || user?.username || 'John'}</p>
                  <p className="text-xs text-[#0ea5e9] font-semibold capitalize">{user?.role?.toLowerCase() || 'Owner'}</p>
                </div>
                <ChevronDown className="h-3 w-3 text-gray-500" />
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