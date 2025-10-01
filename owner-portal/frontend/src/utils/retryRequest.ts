import { AxiosError, AxiosResponse } from 'axios'

interface RetryConfig {
  maxRetries?: number
  initialDelay?: number
  maxDelay?: number
  backoffFactor?: number
  retryableStatuses?: number[]
  onRetry?: (attempt: number, error: AxiosError) => void
}

const defaultConfig: Required<RetryConfig> = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 5000, // 5 seconds
  backoffFactor: 2,
  retryableStatuses: [400, 500, 502, 503, 504], // Include 400 for cold start issues
  onRetry: () => {},
}

/**
 * Retry a request with exponential backoff
 * Handles serverless cold starts gracefully
 */
export async function retryRequest<T>(
  requestFn: () => Promise<AxiosResponse<T>>,
  config: RetryConfig = {}
): Promise<T> {
  const cfg = { ...defaultConfig, ...config }
  let lastError: AxiosError | null = null
  
  for (let attempt = 0; attempt <= cfg.maxRetries; attempt++) {
    try {
      const response = await requestFn()
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError
      lastError = axiosError
      
      // Check if we should retry
      const status = axiosError.response?.status
      const isRetryable = status && cfg.retryableStatuses.includes(status)
      const isLastAttempt = attempt === cfg.maxRetries
      
      // Don't retry if not retryable or last attempt
      if (!isRetryable || isLastAttempt) {
        throw error
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        cfg.initialDelay * Math.pow(cfg.backoffFactor, attempt),
        cfg.maxDelay
      )
      
      // Notify about retry
      cfg.onRetry(attempt + 1, axiosError)
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  // This should never be reached, but TypeScript needs it
  throw lastError || new Error('Request failed')
}

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

