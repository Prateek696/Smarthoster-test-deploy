import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Lock, CheckCircle, Mail, ArrowRight, ArrowLeft } from 'lucide-react'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { authAPI } from '../../services/auth.api'

const ResetPassword: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.otp) {
      newErrors.otp = 'OTP is required'
    } else if (formData.otp.length !== 6) {
      newErrors.otp = 'OTP must be 6 digits'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    
    try {
      await authAPI.resetPassword({
        email: formData.email,
        otp: formData.otp,
        password: formData.password
      })
      setIsSuccess(true)
    } catch (error: any) {
      console.error('Error:', error)
      alert(error.response?.data?.message || 'Failed to reset password')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-green-50 to-green-100 flex">
        {/* Left side - Success message */}
        <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            {/* Logo and header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <div className="flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-200">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent mb-3">
                Password reset successful
              </h2>
              <p className="text-base text-gray-600 leading-relaxed">
                Your password has been successfully reset. You can now sign in with your new password.
              </p>
            </div>

            {/* Action button */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 mb-6">
              <Link 
                to="/auth/login" 
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Continue to login
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50 to-green-100 flex">
      {/* Left side - Reset password form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Logo and header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-200">
                <Lock className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent mb-3">
              Reset your password
            </h2>
            <p className="text-base text-gray-600 leading-relaxed">
              Enter your email, OTP code, and new password below.
            </p>
          </div>

          {/* Reset password form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 mb-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-500 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white text-gray-900 placeholder-gray-400 transition-all duration-200 hover:border-gray-300 ${errors.email ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              {/* OTP field */}
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-500 mb-2">
                  OTP Code
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  maxLength={6}
                  value={formData.otp}
                  onChange={handleChange}
                  className={`w-full px-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white text-gray-900 placeholder-gray-400 transition-all duration-200 hover:border-gray-300 ${errors.otp ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                  placeholder="Enter 6-digit OTP"
                />
                {errors.otp && <p className="mt-1 text-sm text-red-600">{errors.otp}</p>}
              </div>

              {/* Password field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-500 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white text-gray-900 placeholder-gray-400 transition-all duration-200 hover:border-gray-300 ${errors.password ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                    placeholder="Enter your new password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>

              {/* Confirm Password field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-500 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white text-gray-900 placeholder-gray-400 transition-all duration-200 hover:border-gray-300 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                    placeholder="Confirm your new password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>

              {/* Submit button */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Resetting password...
                    </>
                  ) : (
                    <>
                      Reset password
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Back to login link */}
          <div className="text-center">
            <Link 
              to="/auth/login" 
              className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors duration-200 flex items-center justify-center"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword



