import React, { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { UserPlus, Mail, User, Shield, Phone, Building2, Calculator, Lock, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { AppDispatch, RootState } from '../../store'
import { sendSignupOTPAsync, verifySignupOTPAsync } from '../../store/auth.slice'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Logo from '../../components/common/Logo'
import OTPInput from '../../components/auth/OTPInput'
import { checkAdminExists } from '../../services/admin.api'
import { useLanguage, Language } from '../../contexts/LanguageContext'
import BritainFlag from '../../assets/Britain.png'
import PortugalFlag from '../../assets/Portugal.png'
import FranceFlag from '../../assets/France.png'

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
  const { t, language, setLanguage } = useLanguage()

  const flags = [
    { code: 'en' as Language, image: BritainFlag, alt: 'English' },
    { code: 'pt' as Language, image: PortugalFlag, alt: 'Português' },
    { code: 'fr' as Language, image: FranceFlag, alt: 'Français' }
  ]

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage)
  }

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
    const loadingToast = toast.loading('Connecting to server...')
    
    try {
      await dispatch(sendSignupOTPAsync({
        email: formData.email,
        name: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone,
        password: formData.password,
        role: formData.role
      })).unwrap()
      
      toast.dismiss(loadingToast)
      setStep('otp')
    } catch (err) {
      toast.dismiss(loadingToast)
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
              <div className="flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-200">
                <Logo size="lg" className="rounded-lg" />
              </div>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent mb-3">
              {t('auth.accountCreation')}
            </h2>
            <p className="text-base text-gray-600 leading-relaxed">
              {t('auth.contactAdmin')}
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

          {/* Signup disabled - informational block only */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 mb-6">
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Shield className="h-6 w-6 text-blue-600 mt-0.5" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-blue-900 mb-2">
                      {t('auth.accountCreationByAdmin')}
                    </h4>
                    <p className="text-sm text-blue-700 mb-3">
                      {t('auth.allAccountsCreatedByAdmin')}
                    </p>
                    <div className="bg-white border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800 font-medium mb-1">{t('auth.toRequestAccount')}</p>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• {t('auth.contactSystemAdmin')}</li>
                        <li>• {t('auth.provideEmailAndRole')}</li>
                        <li>• {t('auth.adminWillCreateAccount')}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
              {t('auth.alreadyHaveAccount')}{' '}
              <Link
                to="/auth/login"
                className="font-semibold text-green-600 hover:text-green-500 transition-colors duration-200"
              >
                {t('auth.signInHere')}
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
            <h3 className="text-2xl lg:text-3xl font-bold text-white mb-6 leading-tight">
              {t('marketing.joinOwners')}
            </h3>
            <p className="text-lg text-white/90 mb-8 leading-relaxed">
              {t('marketing.journeyDescription')}
            </p>
            <div className="space-y-5">
              <div className="flex items-center group">
                <div className="w-3 h-3 bg-white/30 rounded-full mr-4 group-hover:bg-white/50 transition-colors duration-200"></div>
                <span className="text-white/90 group-hover:text-white transition-colors duration-200">{t('marketing.easyOnboarding')}</span>
              </div>
              <div className="flex items-center group">
                <div className="w-3 h-3 bg-white/30 rounded-full mr-4 group-hover:bg-white/50 transition-colors duration-200"></div>
                <span className="text-white/90 group-hover:text-white transition-colors duration-200">{t('marketing.automatedBookings')}</span>
              </div>
              <div className="flex items-center group">
                <div className="w-3 h-3 bg-white/30 rounded-full mr-4 group-hover:bg-white/50 transition-colors duration-200"></div>
                <span className="text-white/90 group-hover:text-white transition-colors duration-200">{t('marketing.financialReporting')}</span>
              </div>
              <div className="flex items-center group">
                <div className="w-3 h-3 bg-white/30 rounded-full mr-4 group-hover:bg-white/50 transition-colors duration-200"></div>
                <span className="text-white/90 group-hover:text-white transition-colors duration-200">{t('marketing.customerSupport')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup
