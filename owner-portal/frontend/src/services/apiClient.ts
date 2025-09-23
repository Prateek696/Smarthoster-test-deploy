import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response
      },
      (error) => {
        const { response } = error

        // Handle network errors
        if (!response) {
          console.error('Network error. Please check your connection.')
          return Promise.reject(error)
        }

        // Handle different status codes
        switch (response.status) {
          case 401:
            // Unauthorized - clear token and redirect to login
            localStorage.removeItem('token')
            window.location.href = '/auth/login'
            console.error('Session expired. Please login again.')
            break
          case 403:
            console.error('You do not have permission to perform this action.')
            break
          case 404:
            console.error('Resource not found.')
            break
          case 422:
            // Validation errors
            if (response.data?.errors) {
              const errors = response.data.errors
              console.error('Validation errors:', errors)
            } else {
              console.error(response.data?.message || 'Validation error.')
            }
            break
          case 429:
            console.error('Too many requests. Please try again later.')
            break
          case 500:
            console.error('Server error. Please try again later.')
            break
          default:
            console.error(response.data?.message || 'An unexpected error occurred.')
        }

        return Promise.reject(error)
      }
    )
  }

  // Generic request methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config)
    return response.data
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config)
    return response.data
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config)
    return response.data
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config)
    return response.data
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config)
    return response.data
  }

  // File upload helper
  async uploadFile<T = any>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    }

    const response = await this.client.post<T>(url, formData, config)
    return response.data
  }

  // Download file helper
  async downloadFile(url: string, filename?: string): Promise<void> {
    const response = await this.client.get(url, {
      responseType: 'blob',
    })

    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  }
}

export const apiClient = new ApiClient()
export default apiClient
