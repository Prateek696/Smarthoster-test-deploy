import React, { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { UserPlus, Mail, User, Shield, Phone, Building2, Calculator, Lock, Eye, EyeOff } from 'lucide-react'
import { AppDispatch, RootState } from '../../store'
import { sendSignupOTPAsync, verifySignupOTPAsync } from '../../store/auth.slice'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import OTPInput from '../../components/auth/OTPInput'
import { checkAdminExists } from '../../services/admin.api'

const Signup: React.FC = () => {
  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'admin' as 'admin' | 'owner' | 'accountant' | 'user',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [adminExists, setAdminExists] = useState(false)

  const dispatch = useDispatch<AppDispatch>()
  const { isLoading, isAuthenticated, error } = useSelector((state: RootState) => state.auth)

  const validateForm = (): Record<string, string> => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    return newErrors
  }

  // Check if admin already exists
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        console.log('🔍 Checking admin existence...')
        const exists = await checkAdminExists()
        console.log('🔍 Admin exists:', exists)
        setAdminExists(exists)
      } catch (error) {
        console.error('❌ Error checking admin existence:', error)
        // Default to assuming admin exists if API call fails (safer approach)
        setAdminExists(true)
      }
    }
    checkAdmin()
  }, [])

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // If admin exists, show alert
    if (adminExists) {
      alert('Account creation is disabled. Please contact your administrator to request an account.')
      return
    }
    
    // Validate form
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    // Clear previous errors
    setErrors({})
    
    // Send OTP for signup
    try {
      await dispatch(sendSignupOTPAsync({
        email: formData.email,
        name: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone,
        password: formData.password,
        role: formData.role
      })).unwrap()
      
      setStep('otp')
    } catch (err) {
      // Error is handled by the slice
    }
  }

  const handleOTPComplete = async (otp: string) => {
    try {
      await dispatch(verifySignupOTPAsync({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        otp,
        role: formData.role
      })).unwrap()
    } catch (err) {
      // Error is handled by the slice
    }
  }

  const handleResendOTP = async () => {
    try {
      await dispatch(sendSignupOTPAsync({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role
      })).unwrap()
    } catch (err) {
      // Error is handled by the slice
    }
  }

  const handleBackToForm = () => {
    setStep('form')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50 to-green-100 flex">
      {/* Left side - Signup form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Logo and header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-500 rounded-3xl shadow-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent mb-3">
              Account Creation
            </h2>
            <p className="text-base text-gray-600 leading-relaxed">
              Contact your administrator to request account creation
            </p>
          </div>

          {/* Signup form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 mb-6">
            {step === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-5">
                  {/* First Name field */}
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-500 mb-2">
                      First Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white text-gray-900 placeholder-gray-400 transition-all duration-200 hover:border-gray-300 ${errors.firstName ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                        placeholder="Enter your first name"
                      />
                    </div>
                    {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
                  </div>

                  {/* Last Name field */}
            <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-500 mb-2">
                      Last Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                        id="lastName"
                        name="lastName"
                  type="text"
                  required
                        value={formData.lastName}
                  onChange={handleChange}
                        className={`w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white text-gray-900 placeholder-gray-400 transition-all duration-200 hover:border-gray-300 ${errors.lastName ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                        placeholder="Enter your last name"
                />
              </div>
                    {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
            </div>

            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-500 mb-2">
                Email address
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

                  {/* Phone field */}
            <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-500 mb-2">
                      Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                        id="phone"
                        name="phone"
                        type="tel"
                  required
                        value={formData.phone}
                  onChange={handleChange}
                        className={`w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white text-gray-900 placeholder-gray-400 transition-all duration-200 hover:border-gray-300 ${errors.phone ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                        placeholder="Enter your phone number"
                      />
              </div>
                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>

                  {/* Password field */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-500 mb-2">
                      Password
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
                        className={`w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white text-gray-900 placeholder-gray-400 transition-all duration-200 hover:border-gray-300 ${errors.password ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                        placeholder="Enter your password"
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
                      Confirm Password
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
                        className={`w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white text-gray-900 placeholder-gray-400 transition-all duration-200 hover:border-gray-300 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                        placeholder="Confirm your password"
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

                  {/* Role Selection */}
            <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                      Account Type
              </label>
                    
                    
                    {adminExists ? (
                      <>
                        {/* Admin Contact Message */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-4">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              <Shield className="h-6 w-6 text-blue-600 mt-0.5" />
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-blue-900 mb-2">
                                Account Creation by Administrator
                              </h4>
                              <p className="text-sm text-blue-700 mb-3">
                                All user accounts are created by the system administrator. Please contact your administrator to request account creation.
                              </p>
                              <div className="bg-white border border-blue-200 rounded-lg p-3">
                                <p className="text-sm text-blue-800 font-medium mb-1">To request an account:</p>
                                <ul className="text-sm text-blue-700 space-y-1">
                                  <li>• Contact your system administrator</li>
                                  <li>• Provide your email address and role requirements</li>
                                  <li>• Administrator will create your account and send login credentials</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Admin Option (Disabled) */}
                        <div className="flex items-center justify-center px-4 py-3 border-2 border-gray-300 bg-gray-100 rounded-xl">
                          <Shield className="h-5 w-5 mr-2 text-gray-400" />
                          <span className="font-medium text-gray-400">Admin Account (Unavailable)</span>
                          <span className="ml-2 text-xs text-gray-400">(Already exists)</span>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* First Admin Creation Message */}
                        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-4">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              <Shield className="h-6 w-6 text-green-600 mt-0.5" />
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-green-900 mb-2">
                                Create First Administrator Account
                              </h4>
                              <p className="text-sm text-green-700 mb-3">
                                You are creating the first administrator account for this system. The administrator will be responsible for creating all other user accounts.
                              </p>
                              <div className="bg-white border border-green-200 rounded-lg p-3">
                                <p className="text-sm text-green-800 font-medium mb-1">Administrator privileges include:</p>
                                <ul className="text-sm text-green-700 space-y-1">
                                  <li>• Create and manage owner accounts</li>
                                  <li>• Create and manage accountant accounts</li>
                                  <li>• Manage properties and bookings</li>
                                  <li>• Access system settings and reports</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Admin Role Selection (Auto-selected) */}
                        <div className="flex items-center justify-center px-4 py-3 border-2 border-green-300 bg-green-50 rounded-xl">
                          <Shield className="h-5 w-5 mr-2 text-green-600" />
                          <span className="font-medium text-green-800">Administrator Account</span>
                          <span className="ml-2 text-xs text-green-600">(System Administrator)</span>
                        </div>
                      </>
                    )}
            </div>
          </div>

            {/* Submit button */}
            {adminExists ? (
              <button
                type="button"
                disabled={true}
                className="w-full flex justify-center items-center px-6 py-4 border border-transparent rounded-xl shadow-lg text-base font-semibold text-gray-400 bg-gray-200 cursor-not-allowed transition-all duration-300"
              >
                <Shield className="mr-2 h-4 w-4" />
                Contact Administrator for Account Creation
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center px-6 py-4 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Creating Administrator Account...</span>
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Create Administrator Account
                  </>
                )}
              </button>
            )}
            </form>
            ) : (
              <div className="space-y-6">
                {/* OTP Header */}
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <Shield className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Verify Your Account
                  </h3>
                  <p className="text-sm text-gray-600">
                    We've sent a 6-digit code to <span className="font-medium text-gray-900">{formData.email}</span>
                  </p>
                </div>

                {/* OTP Input */}
                <div className="space-y-4">
                  <OTPInput
                    onComplete={handleOTPComplete}
                    disabled={isLoading}
                    length={6}
                  />
                  
                  {/* Verify Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const otpInputs = document.querySelectorAll('input[type="text"]');
                      const otp = Array.from(otpInputs).map(input => (input as HTMLInputElement).value).join('');
                      if (otp.length === 6) {
                        handleOTPComplete(otp);
                      }
                    }}
                    disabled={isLoading}
                    className="w-full flex justify-center items-center px-6 py-4 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl group"
                  >
                    {isLoading ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : (
                      <>
                        Verify & Create Account
                        <UserPlus className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                      </>
                    )}
                  </button>
                  
                  {/* Resend OTP */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={isLoading}
                      className="text-sm text-green-600 hover:text-green-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Didn't receive the code? Resend
                    </button>
                  </div>

                  {/* Back to form */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleBackToForm}
                      disabled={isLoading}
                      className="text-sm text-gray-500 hover:text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ← Back to form
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="rounded-xl bg-red-50 p-4 mb-6">
              <p className="text-sm text-red-800">{error}</p>
              <p className="text-xs text-red-600 mt-2">
                💡 Make sure the backend server is running on port 5000
              </p>
            </div>
          )}

          {/* Login link */}
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link
                to="/auth/login"
                className="font-semibold text-green-600 hover:text-green-500 transition-colors duration-200"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Hero image/illustration */}
      <div className="hidden lg:block relative flex-1 bg-gradient-to-br from-green-500 via-green-600 to-green-700 overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-5"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-48 translate-x-48"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full translate-y-40 -translate-x-40"></div>
        <div className="relative h-full flex flex-col justify-center px-12 xl:px-16">
          <div className="max-w-md">
            <h3 className="text-4xl font-bold text-white mb-6 leading-tight">
              Join thousands of property owners
            </h3>
            <p className="text-lg text-white/90 mb-8 leading-relaxed">
              Start your property management journey with our comprehensive platform designed to maximize your rental income and streamline operations.
            </p>
            <div className="space-y-5">
              <div className="flex items-center group">
                <div className="w-3 h-3 bg-white/30 rounded-full mr-4 group-hover:bg-white/50 transition-colors duration-200"></div>
                <span className="text-white/90 group-hover:text-white transition-colors duration-200">Easy property onboarding</span>
              </div>
              <div className="flex items-center group">
                <div className="w-3 h-3 bg-white/30 rounded-full mr-4 group-hover:bg-white/50 transition-colors duration-200"></div>
                <span className="text-white/90 group-hover:text-white transition-colors duration-200">Automated booking management</span>
              </div>
              <div className="flex items-center group">
                <div className="w-3 h-3 bg-white/30 rounded-full mr-4 group-hover:bg-white/50 transition-colors duration-200"></div>
                <span className="text-white/90 group-hover:text-white transition-colors duration-200">Financial reporting & analytics</span>
              </div>
              <div className="flex items-center group">
                <div className="w-3 h-3 bg-white/30 rounded-full mr-4 group-hover:bg-white/50 transition-colors duration-200"></div>
                <span className="text-white/90 group-hover:text-white transition-colors duration-200">24/7 customer support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup
