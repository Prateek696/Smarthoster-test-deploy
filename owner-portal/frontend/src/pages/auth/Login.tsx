import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { Mail, ArrowRight, Building2, Shield, Lock, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

import { RootState, AppDispatch } from '../../store'
import { sendLoginOTPAsync, verifyLoginOTPAsync, clearError } from '../../store/auth.slice'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Logo from '../../components/common/Logo'
import OTPInput from '../../components/auth/OTPInput'

interface LoginFormData {
  email: string
  password: string
}

const Login: React.FC = () => {
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { isLoading, error, isAuthenticated, user } = useSelector((state: RootState) => state.auth)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/dashboard/owner')
    }
  }, [isAuthenticated, user, navigate])

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  const onSubmit = async (data: LoginFormData) => {
    try {
      await dispatch(sendLoginOTPAsync({ email: data.email, password: data.password })).unwrap()
      setEmail(data.email)
      setPassword(data.password)
      setStep('otp')
      setOtpSent(true)
      toast.success('OTP sent to your email!')
    } catch (error) {
      // Error handled by Redux slice and displayed via useEffect
    }
  }

  const handleOTPComplete = async (otp: string) => {
    try {
      const result = await dispatch(verifyLoginOTPAsync({ email, otp })).unwrap()
      toast.success('Welcome back!')
      
      // Redirect based on user role
      if (result.user?.role === 'admin') {
        navigate('/admin/dashboard')
      } else {
        navigate('/dashboard/owner')
      }
    } catch (error) {
      // Error handled by Redux slice and displayed via useEffect
    }
  }

  const handleResendOTP = async () => {
    try {
      await dispatch(sendLoginOTPAsync({ email, password })).unwrap()
      toast.success('OTP resent to your email!')
    } catch (error) {
      // Error handled by Redux slice and displayed via useEffect
    }
  }

  const handleBackToEmail = () => {
    setStep('email')
    setOtpSent(false)
    setEmail('')
    setPassword('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50 to-green-100 flex">
      {/* Left side - Login form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Logo and header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-200">
                <Logo size="lg" className="text-green-600" />
              </div>
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent mb-3">
              Welcome back
            </h2>
            <p className="text-base text-gray-600 leading-relaxed">
              Sign in to your property management dashboard
            </p>
          </div>

          {/* Login form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 mb-6">
            {step === 'email' ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      })}
                      type="email"
                      className={`w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white text-gray-900 placeholder-gray-400 transition-all duration-200 hover:border-gray-300 ${errors.email ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                      placeholder="Enter your email"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
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
                      {...register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters',
                        },
                      })}
                      type={showPassword ? 'text' : 'password'}
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
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center px-6 py-4 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl group"
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <>
                      Send OTP
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                {/* Forgot Password Link */}
                <div className="text-center">
                  <Link
                    to="/auth/forgot-password"
                    className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors duration-200"
                  >
                    Forgot your password?
                  </Link>
                </div>
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
                    Enter Verification Code
                  </h3>
                  <p className="text-sm text-gray-600">
                    We've sent a 6-digit code to <span className="font-medium text-gray-900">{email}</span>
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
                        Verify Code
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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

                  {/* Back to email */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleBackToEmail}
                      disabled={isLoading}
                      className="text-sm text-gray-500 hover:text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ← Back to email
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sign up link */}
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <Link
                to="/auth/signup"
                className="font-semibold text-green-600 hover:text-green-500 transition-colors duration-200"
              >
                Sign up for free
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
              Manage your properties with confidence
            </h3>
            <p className="text-lg text-white/90 mb-8 leading-relaxed">
              Track bookings, monitor performance, handle compliance, and maximize your rental income with our comprehensive property management platform.
            </p>
            <div className="space-y-5">
              <div className="flex items-center group">
                <div className="w-3 h-3 bg-white/30 rounded-full mr-4 group-hover:bg-white/50 transition-colors duration-200"></div>
                <span className="text-white/90 group-hover:text-white transition-colors duration-200">Real-time booking management</span>
              </div>
              <div className="flex items-center group">
                <div className="w-3 h-3 bg-white/30 rounded-full mr-4 group-hover:bg-white/50 transition-colors duration-200"></div>
                <span className="text-white/90 group-hover:text-white transition-colors duration-200">Financial performance tracking</span>
              </div>
              <div className="flex items-center group">
                <div className="w-3 h-3 bg-white/30 rounded-full mr-4 group-hover:bg-white/50 transition-colors duration-200"></div>
                <span className="text-white/90 group-hover:text-white transition-colors duration-200">Automated compliance reporting</span>
              </div>
              <div className="flex items-center group">
                <div className="w-3 h-3 bg-white/30 rounded-full mr-4 group-hover:bg-white/50 transition-colors duration-200"></div>
                <span className="text-white/90 group-hover:text-white transition-colors duration-200">Multi-property dashboard</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login



