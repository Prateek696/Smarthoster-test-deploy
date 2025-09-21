import React, { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'

const AuthLayout: React.FC = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  return (
    <div className="min-h-screen bg-gray-50">
      <Outlet />
    </div>
  )
}

export default AuthLayout



