import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'

const baseURL = 'http://127.0.0.1:8000/api'

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Request interceptor - Add access token to requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('access_token')
      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle token refresh
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: any) => void
  reject: (reason?: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`
            }
            return apiClient(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null

      if (!refreshToken) {
        // No refresh token, logout user
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          // Redirect to home page
          window.location.href = '/'
        }
        processQueue(error, null)
        isRefreshing = false
        return Promise.reject(error)
      }

      try {
        // Use axios directly for refresh to avoid infinite loop
        const response = await axios.post(`${baseURL}/auth/refresh`, {
          refresh_token: refreshToken,
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        })

        // Handle response format: { success, data: { token } } or { token }
        const responseData = response.data?.data || response.data
        const token = responseData?.token || responseData?.access_token

        if (!token) {
          throw new Error('No token in refresh response')
        }

        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', token)
          // If new refresh token provided, store it
          const newRefreshToken = responseData?.refresh_token || responseData?.refreshToken
          if (newRefreshToken) {
            localStorage.setItem('refresh_token', newRefreshToken)
          }
        }

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`
        }

        processQueue(null, token)
        isRefreshing = false

        return apiClient(originalRequest)
      } catch (refreshError) {
        // Refresh failed, logout user
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          // Redirect to home page
          window.location.href = '/'
        }
        processQueue(refreshError, null)
        isRefreshing = false
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export const useApi = () => {
  return apiClient
}
