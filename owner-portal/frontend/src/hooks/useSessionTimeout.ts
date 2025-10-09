import { useEffect, useRef, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { forceLogout } from '../store/auth.slice'
import { useNavigate } from 'react-router-dom'

const SESSION_TIMEOUT = 25 * 60 * 1000 // 25 minutes in milliseconds

export const useSessionTimeout = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const timeoutRef = useRef<number | null>(null)
  const lastActivityRef = useRef<number>(Date.now())

  const resetTimeout = useCallback(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      console.log('🕐 Session timeout reached - auto logging out')
      
      // Dispatch force logout action (clears state and localStorage)
      dispatch(forceLogout())
      
      // Redirect to login
      navigate('/auth/login', { replace: true })
      
      // Show notification
      alert('Your session has expired after 25 minutes of inactivity. Please log in again.')
    }, SESSION_TIMEOUT)

    // Update last activity time
    lastActivityRef.current = Date.now()
  }, [dispatch, navigate])

  const handleUserActivity = useCallback(() => {
    const now = Date.now()
    const timeSinceLastActivity = now - lastActivityRef.current
    
    // Only reset if user has been active (not just page load)
    if (timeSinceLastActivity > 1000) { // 1 second threshold
      resetTimeout()
    }
  }, [resetTimeout])

  useEffect(() => {
    // Set up event listeners for user activity
    const events = [
      'mousedown',
      'mousemove', 
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ]

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, true)
    })

    // Initial timeout setup
    resetTimeout()

    // Cleanup function
    return () => {
      // Remove event listeners
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true)
      })

      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [handleUserActivity, resetTimeout])

  // Return the reset function in case it's needed manually
  return { resetTimeout }
}
