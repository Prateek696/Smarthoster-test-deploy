import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Logo from '../../components/common/Logo'
import { useLanguage, Language } from '../../contexts/LanguageContext'
import BritainFlag from '../../assets/Britain.png'
import PortugalFlag from '../../assets/Portugal.png'
import FranceFlag from '../../assets/France.png'
import { authAPI } from '../../services/auth.api'

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { t, language, setLanguage } = useLanguage()

  const flags = [
    { code: 'en' as Language, image: BritainFlag, alt: 'English' },
    { code: 'pt' as Language, image: PortugalFlag, alt: 'Português' },
    { code: 'fr' as Language, image: FranceFlag, alt: 'Français' }
  ]

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    const loadingToast = toast.loading('Connecting to server...')
    
    try {
      await authAPI.forgotPassword({ email })
      toast.dismiss(loadingToast)
      toast.success('Password reset OTP sent to your email!')
      setIsSubmitted(true)
    } catch (error: any) {
      toast.dismiss(loadingToast)
      console.error('❌ Forgot Password Error:', error)
      console.error('❌ Error Response:', error.response?.data)
      console.error('❌ Error Status:', error.response?.status)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send reset OTP'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-green-50 to-green-100 flex">
        {/* Left side - Success message */}
        <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            {/* Logo and header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <div className="flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-200">
                  <Mail className="h-10 w-10 text-green-600" />
                </div>
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent mb-3">
                Check your email
              </h2>
              <p className="text-base text-gray-600 leading-relaxed">
                We've sent a password reset OTP to <strong className="text-gray-900">{email}</strong>
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Didn't receive the email? Check your spam folder or contact support.
              </p>
            </div>

            {/* Action buttons */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 mb-6 space-y-4">
              <Link 
                to={`/auth/reset-password?email=${encodeURIComponent(email)}`}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] hover:from-[#1d4ed8] hover:to-[#1e40af] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2563eb] transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Enter OTP to reset password
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link 
                to="/auth/login" 
                className="w-full flex justify-center items-center py-3 px-4 border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('auth.backToLogin')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50 to-green-100 flex">
      {/* Left side - Forgot password form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Logo and header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-200">
                <Logo size="lg" className="rounded-lg" />
              </div>
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent mb-3">
              {t('auth.forgotPasswordTitle')}
            </h2>
            <p className="text-base text-gray-600 leading-relaxed">
              {t('auth.forgotPasswordDescription')}
            </p>
            
            {/* Language Switcher */}
            <div className="flex justify-center mt-4">
              <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-3 py-2 shadow-sm border border-gray-200">
                {flags.map((flag) => (
                  <button
                    key={flag.code}
                    onClick={() => handleLanguageChange(flag.code)}
                    className={`p-1 rounded-md transition-all duration-200 hover:scale-110 ${
                      language === flag.code 
                        ? 'ring-2 ring-green-500 ring-offset-1 bg-green-50' 
                        : 'hover:bg-gray-100'
                    }`}
                    title={flag.alt}
                  >
                    <img
                      src={flag.image}
                      alt={flag.alt}
                      className="w-5 h-4 object-cover rounded-sm"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Forgot password form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 mb-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-500 mb-2">
                  {t('auth.emailAddress')}
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white text-gray-900 placeholder-gray-400 transition-all duration-200 hover:border-gray-300"
                    placeholder={t('auth.enterEmail')}
                  />
                </div>
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
                      Sending reset OTP...
                    </>
                  ) : (
                    <>
                      {t('auth.sendResetOTP')}
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

export default ForgotPassword



