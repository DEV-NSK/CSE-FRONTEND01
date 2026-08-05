import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Offline detection ─────────────────────────────────────────────────────────
axiosInstance.interceptors.request.use((config) => {
  if (!navigator.onLine) {
    return Promise.reject(
      new Error('You are offline. Please check your internet connection.'),
    ) as never
  }
  return config
})

// ── Refresh queue (prevent parallel refresh storms) ───────────────────────────
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((p) => {
    if (error) p.reject(error)
    else p.resolve(token!)
  })
  failedQueue = []
}

/** Read the current access token from persisted auth storage */
function getStoredAccessToken(): string | null {
  try {
    const raw = localStorage.getItem('auth-storage')
    if (!raw) return null
    return JSON.parse(raw)?.state?.tokens?.accessToken ?? null
  } catch {
    return null
  }
}

/** Read the current refresh token from persisted auth storage */
function getStoredRefreshToken(): string | null {
  try {
    const raw = localStorage.getItem('auth-storage')
    if (!raw) return null
    return JSON.parse(raw)?.state?.tokens?.refreshToken ?? null
  } catch {
    return null
  }
}

/** Persist new tokens into localStorage without touching anything else */
function persistNewTokens(accessToken: string, refreshToken: string) {
  try {
    const raw = localStorage.getItem('auth-storage')
    if (!raw) return
    const parsed = JSON.parse(raw)
    parsed.state.tokens = { accessToken, refreshToken }
    localStorage.setItem('auth-storage', JSON.stringify(parsed))
  } catch {
    // non-critical
  }
}

/** Hard logout — only called when server explicitly rejects the refresh token */
function forceLogout() {
  localStorage.removeItem('auth-storage')
  window.location.href = '/auth/login'
}

// ── Request interceptor — attach Bearer token ─────────────────────────────────
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStoredAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// ── Response interceptor — silent token refresh on 401 ───────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    // Don't retry on auth endpoints themselves — avoids infinite loops
    const url = originalRequest.url ?? ''
    if (url.includes('/auth/refresh') || url.includes('/auth/login')) {
      return Promise.reject(error)
    }

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

    const refreshToken = getStoredRefreshToken()

    if (!refreshToken) {
      isRefreshing = false
      forceLogout()
      return Promise.reject(error)
    }

    try {
      // Use plain axios to avoid interceptor loop
      const response = await axios.post(
        `${BASE_URL}/auth/refresh`,
        { refreshToken },
        { timeout: 10000 },
      )
      const { accessToken, refreshToken: newRefreshToken } = response.data.data

      persistNewTokens(accessToken, newRefreshToken)
      processQueue(null, accessToken)

      originalRequest.headers.Authorization = `Bearer ${accessToken}`
      return axiosInstance(originalRequest)
    } catch (refreshError) {
      const refreshAxiosErr = refreshError as AxiosError
      const refreshStatus = refreshAxiosErr?.response?.status

      processQueue(refreshError, null)

      if (refreshStatus === 401 || refreshStatus === 403) {
        // Server explicitly rejected the refresh token → must log out
        forceLogout()
      }
      // Network errors / 5xx: do NOT log out — user stays in, retry next time

      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export default axiosInstance
