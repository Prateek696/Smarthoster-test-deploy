import React, { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useLanguage } from '../../contexts/LanguageContext'
import { 
  Building2,
  LayoutDashboard,
  Calendar,
  BookOpen,
  FileText,
  MapPin,
  AlertTriangle,
  TrendingUp,
  Home,
  X,
  ChevronRight,
  Star,
  BarChart3,
  LogOut,
  Shield,
  Receipt,
  Users,
  Crown
} from 'lucide-react'
import { RootState, AppDispatch } from '../../store'
import { logoutAsync } from '../../store/auth.slice'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles?: string[]
  badge?: string
  badgeColor?: 'success' | 'warning' | 'danger' | 'info'
}


const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation()
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((state: RootState) => state.auth)
  const { t } = useLanguage()

  const navigation: NavItem[] = [
    { 
      name: t('nav.dashboard'), 
      href: '/dashboard/owner', 
      icon: LayoutDashboard 
    },
    { 
      name: t('nav.adminPanel'), 
      href: '/admin/dashboard', 
      icon: Crown,
      roles: ['admin']
    },
    { 
      name: t('nav.ownerManagement'), 
      href: '/admin/owners', 
      icon: Users,
      roles: ['admin']
    },
    { 
      name: t('nav.bookings'), 
      href: '/bookings', 
      icon: BookOpen
    },
    { 
      name: t('nav.invoices'), 
      href: '/invoices', 
      icon: FileText 
    },
    { 
      name: t('nav.sibaManager'), 
      href: '/siba-manager', 
      icon: Shield
    },
    { 
      name: t('nav.saft'), 
      href: '/saft', 
      icon: Receipt
    },
    { 
      name: t('nav.properties'), 
      href: '/property-management', 
      icon: Building2
    },
    { 
      name: t('nav.calendar'), 
      href: '/calendar', 
      icon: Calendar 
    },
    { 
      name: t('nav.ownerStatements'), 
      href: '/owner-statements', 
      icon: FileText 
    },
    { 
      name: t('nav.reviews'), 
      href: '/reviews', 
      icon: Star,
      roles: ['owner']
    },
  ]

  useEffect(() => {
    // Close sidebar on route change (mobile)
    onClose()
  }, [location.pathname, onClose])

  const handleLogout = () => {
    dispatch(logoutAsync())
  }

  const filteredNavigation = navigation.filter(item => 
    !item.roles || (user && item.roles.includes(user.role))
  )

  const isActiveRoute = (href: string) => {
    if (href === '/dashboard/owner') {
      return location.pathname === '/' || location.pathname === '/dashboard' || location.pathname.startsWith('/dashboard/owner')
    }
    return location.pathname === href || location.pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose} />
        </div>
      )}

      {/* Sidebar */}
      <nav className={`w-64 bg-white shadow-sm min-h-screen ${
        isOpen ? 'fixed inset-y-0 left-0 z-50 translate-x-0' : 'hidden lg:block'
      }`}>
        <div className="p-4 space-y-2">
          {/* Navigation */}
          <div className="space-y-2">
            {filteredNavigation.map((item) => {
              const Icon = item.icon
              const active = isActiveRoute(item.href)
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    active
                      ? 'bg-[#5FFF56] bg-opacity-20 text-gray-900 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <LogOut className="mr-3 h-5 w-5 text-gray-500" />
              {t('nav.signOut')}
            </button>
          </div>
        </div>
      </nav>
    </>
  )
}

export default Sidebar
