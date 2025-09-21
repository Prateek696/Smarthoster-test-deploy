import React, { useState, useRef, useEffect } from 'react'

interface OTPInputProps {
  length?: number
  onComplete: (otp: string) => void
  disabled?: boolean
  className?: string
}

const OTPInput: React.FC<OTPInputProps> = ({ 
  length = 6, 
  onComplete, 
  disabled = false,
  className = '' 
}) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  const handleChange = (index: number, value: string) => {
    if (disabled) return

    // Only allow single digit
    if (value.length > 1) {
      value = value.slice(-1)
    }

    // Only allow numbers
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Move to next input if current input is filled
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    // Check if all inputs are filled
    const otpString = newOtp.join('')
    if (otpString.length === length && !otpString.includes('')) {
      onComplete(otpString)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return

    // Handle backspace
    if (e.key === 'Backspace') {
      if (otp[index]) {
        // Clear current input
        const newOtp = [...otp]
        newOtp[index] = ''
        setOtp(newOtp)
      } else if (index > 0) {
        // Move to previous input
        inputRefs.current[index - 1]?.focus()
      }
    }

    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    if (disabled) return

    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    
    if (pastedData.length > 0) {
      const newOtp = [...otp]
      for (let i = 0; i < pastedData.length && i < length; i++) {
        newOtp[i] = pastedData[i]
      }
      setOtp(newOtp)
      
      // Focus the next empty input or the last input
      const nextIndex = Math.min(pastedData.length, length - 1)
      inputRefs.current[nextIndex]?.focus()
      
      // Check if all inputs are filled
      const otpString = newOtp.join('')
      if (otpString.length === length && !otpString.includes('')) {
        onComplete(otpString)
      }
    }
  }

  return (
    <div className={`flex justify-center space-x-3 ${className}`}>
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={`
            w-12 h-12 text-center text-xl font-semibold border-2 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500
            transition-all duration-200
            ${disabled 
              ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
              : 'bg-white border-gray-200 text-gray-900 hover:border-gray-300'
            }
          `}
        />
      ))}
    </div>
  )
}

export default OTPInput

