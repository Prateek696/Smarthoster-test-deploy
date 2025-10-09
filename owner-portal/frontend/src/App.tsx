import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from './store'
import { getCurrentUserAsync } from './store/auth.slice'
import { LanguageProvider } from './contexts/LanguageContext'
import { useSessionTimeout } from './hooks/useSessionTimeout'

// Layout Components
import DashboardLayout from './components/layout/DashboardLayout'
import AuthLayout from './components/layout/AuthLayout'

// Auth Pages
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'

// Dashboard Pages
import OwnerDashboard from './pages/dashboard/OwnerDashboard'
import Bookings from './pages/Bookings'
import BookingDetail from './pages/BookingDetail'
import Invoices from './pages/Invoices'
import TouristTax from './pages/TouristTax'
// import CityTaxDashboard from './pages/CityTaxDashboard'
import SIBA from './pages/SIBA'
import SibaManagerDashboard from './pages/SibaManagerDashboard'
import PropertyManagementPage from './pages/PropertyManagement'
import PropertyManagement from './components/property/PropertyManagement'
import Calendar from './pages/Calendar'
import Performance from './pages/Performance'
import Portfolio from './pages/Portfolio'
import CreditNotes from './pages/CreditNotes'
import Expenses from './pages/Expenses'
import Reviews from './pages/Reviews'
import OwnerStatements from './pages/OwnerStatements'
import FinancialDetails from './pages/FinancialDetails'
import Profile from './pages/Profile'
import AdvancedCalendar from './pages/AdvancedCalendar'
import Automations from './pages/Automations'
import SAFT from './pages/SAFT'
import PropertyDetails from './pages/PropertyDetails'
import AdminDashboard from './pages/admin/AdminDashboard'
import OwnerManagement from './pages/admin/OwnerManagement'

// Components
import LoadingSpinner from './components/common/LoadingSpinner'
import ProtectedRoute from './components/auth/ProtectedRoute'

function App() {
  const dispatch = useDispatch<AppDispatch>()
  const { isAuthenticated, isLoading, user } = useSelector((state: RootState) => state.auth)
  
  // Initialize session timeout (only when authenticated)
  useSessionTimeout()

  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(getCurrentUserAsync())
    }
  }, [dispatch, isAuthenticated, user])

  if (isLoading && isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <LanguageProvider>
      <Routes>
        {/* Auth Routes */}
        <Route path="/auth/*" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route index element={<Navigate to="/auth/login" replace />} />
        </Route>

        {/* Dashboard Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
        {/* Dashboard Home - Everyone goes to OwnerDashboard */}
        <Route
          index
          element={<Navigate to="/dashboard/owner" replace />}
        />
        
        {/* Redirect /dashboard to /dashboard/owner */}
        <Route path="dashboard" element={<Navigate to="/dashboard/owner" replace />} />
        
        {/* Role-specific dashboards */}
        <Route path="dashboard/owner" element={<OwnerDashboard />} />
        <Route path="dashboard/accountant" element={<OwnerDashboard />} />
        
        {/* Admin Routes */}
        <Route path="admin/dashboard" element={<AdminDashboard />} />
        <Route path="admin/owners" element={<OwnerManagement />} />
        
        {/* Feature Pages */}
        <Route path="bookings" element={<Bookings />} />
        <Route path="bookings/:bookingId" element={<BookingDetail />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="tourist-tax" element={<TouristTax />} />
        {/* <Route path="city-tax-dashboard" element={<CityTaxDashboard />} /> */}
        <Route path="tourist-tax/booking/:reservationId" element={<BookingDetail />} />
        <Route path="siba" element={<SIBA />} />
        <Route path="siba-manager" element={<SibaManagerDashboard />} />
        <Route path="saft" element={<SAFT />} />
        <Route path="property/:propertyId" element={<PropertyDetails />} />
        <Route path="property-management" element={<PropertyManagementPage />} />
        
        {/* Feature Pages */}
        <Route path="calendar" element={<Calendar />} />
        <Route path="performance/:propertyId?" element={<Performance />} />
        
        {/* Week 3-4 Enhanced Features */}
        <Route path="portfolio" element={<Portfolio />} />
        <Route path="credit-notes" element={<CreditNotes />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="owner-statements" element={<OwnerStatements />} />
        <Route path="financial-details" element={<FinancialDetails />} />
        <Route path="profile" element={<Profile />} />
        <Route path="advanced-calendar" element={<AdvancedCalendar />} />
        <Route path="automations" element={<Automations />} />
        
        {/* Legacy/Coming Soon */}
        <Route path="properties" element={<div className="p-6"><h1 className="text-2xl font-bold">Properties</h1><p>Coming soon...</p></div>} />
      </Route>

      {/* Redirect root to dashboard */}
      <Route path="/" element={
        isAuthenticated && user ? (
          <Navigate to="/dashboard/owner" replace />
        ) : (
          <Navigate to="/auth/login" replace />
        )
      } />
      
      {/* Catch all - redirect to login if not authenticated, dashboard if authenticated */}
      <Route
        path="*"
        element={
          isAuthenticated && user ? (
            <Navigate to="/dashboard/owner" replace />
          ) : (
            <Navigate to="/auth/login" replace />
          )
        }
      />
    </Routes>
    </LanguageProvider>
  )
}

export default App
