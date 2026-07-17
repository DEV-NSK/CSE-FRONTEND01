import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Track whether a token refresh is in progress
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token!)
    }
  })
  failedQueue = []
}

/**
 * PRD-08 Request interceptor — attach JWT from auth store.
 * Always reads from the persisted auth-storage key.
 */
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const stored = localStorage.getItem('auth-storage')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        const token = parsed?.state?.tokens?.accessToken
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      } catch {
        // ignore parse errors
      }
    }
    return config
  },
  (error) => Promise.reject(error),
)

/**
 * PRD-08 Response interceptor — handle 401 with token refresh.
 * On expired access token: rotate using refresh token.
 * On refresh failure: clear all auth state and redirect to login.
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue concurrent requests while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return axiosInstance(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      // Read refresh token from persisted auth storage
      const stored = localStorage.getItem('auth-storage')
      let refreshToken: string | null = null
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          refreshToken = parsed?.state?.tokens?.refreshToken ?? null
        } catch {
          // ignore
        }
      }

      if (!refreshToken) {
        isRefreshing = false
        // No refresh token — clear auth and redirect to login
        localStorage.removeItem('auth-storage')
        window.location.href = '/auth/login'
        return Promise.reject(error)
      }

      try {
        // Use plain axios to avoid the interceptor loop
        const response = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken })
        const { accessToken, refreshToken: newRefreshToken } = response.data.data

        // Update stored tokens in localStorage
        const storedRaw = localStorage.getItem('auth-storage')
        if (storedRaw) {
          const parsed = JSON.parse(storedRaw)
          parsed.state.tokens = { accessToken, refreshToken: newRefreshToken }
          localStorage.setItem('auth-storage', JSON.stringify(parsed))
        }

        processQueue(null, accessToken)
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        // PRD-08: Refresh fails → logout completely
        localStorage.removeItem('auth-storage')
        window.location.href = '/auth/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

export default axiosInstance
