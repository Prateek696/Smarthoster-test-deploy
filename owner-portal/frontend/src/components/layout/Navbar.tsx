import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Menu, ChevronDown, LogOut } from 'lucide-react'
import { RootState, AppDispatch } from '../../store'
import { logoutAsync } from '../../store/auth.slice'
import Logo from '../common/Logo'
import { useLanguage, Language } from '../../contexts/LanguageContext'
import BritainFlag from '../../assets/Britain.png'
import PortugalFlag from '../../assets/Portugal.png'
import FranceFlag from '../../assets/France.png'

interface NavbarProps {
  onMenuClick: () => void
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const [showProfile, setShowProfile] = useState(false)
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { t, language, setLanguage } = useLanguage()
  
  const { user } = useSelector((state: RootState) => state.auth)

  const handleLogout = () => {
    dispatch(logoutAsync())
  }

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage)
  }

  const flags = [
    { code: 'en' as Language, image: BritainFlag, alt: 'English' },
    { code: 'pt' as Language, image: PortugalFlag, alt: 'Português' },
    { code: 'fr' as Language, image: FranceFlag, alt: 'Français' }
  ]


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
            {/* Flag Language Switcher */}
            <div className="flex items-center space-x-2">
              {flags.map((flag) => (
                <button
                  key={flag.code}
                  onClick={() => handleLanguageChange(flag.code)}
                  className={`p-1 rounded-md transition-all duration-200 hover:scale-110 ${
                    language === flag.code 
                      ? 'ring-2 ring-blue-500 ring-offset-1 bg-blue-50' 
                      : 'hover:bg-gray-100'
                  }`}
                  title={flag.alt}
                >
                  <img
                    src={flag.image}
                    alt={flag.alt}
                    className="w-6 h-4 object-cover rounded-sm"
                  />
                </button>
              ))}
            </div>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-center w-8 h-8 bg-blue-500/20 rounded-full border border-blue-200">
                  <span className="text-xs font-bold text-gray-900 opacity-70">
                    {(user?.firstName || user?.name || user?.username || user?.email || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-900">{user?.firstName || user?.name || user?.username || 'John'}</p>
                  <p className="text-xs text-blue-600 font-semibold capitalize">{user?.role?.toLowerCase() || 'Owner'}</p>
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