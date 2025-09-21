import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { UserRole, hasRole } from '../../utils/roleUtils'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
  fallback?: React.ReactNode
  showAccessDenied?: boolean
}

const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  allowedRoles, 
  fallback = null,
  showAccessDenied = false 
}) => {
  const { user } = useSelector((state: RootState) => state.auth)
  
  if (!user) {
    return <>{fallback}</>
  }

  const hasAccess = hasRole(user.role, allowedRoles)

  if (!hasAccess) {
    if (showAccessDenied) {
      return (
        <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-2V9m0 0V7m0 2h2m-2 0H10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
            <p className="text-sm text-gray-500">
              This feature is only available to {allowedRoles.join(' and ')}s.
            </p>
          </div>
        </div>
      )
    }
    return <>{fallback}</>
  }

  return <>{children}</>
}

export default RoleGuard
