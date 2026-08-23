

import axios from "axios"
import { getHospitalServer } from "@/config/hospitals"

// ✅ FIXED: No baseURL here - set dynamically in interceptor
const axiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach access token to every request if present, and always target the current hospital's server
axiosInstance.interceptors.request.use((config) => {
  // ✅ Set baseURL dynamically on EVERY request
  config.baseURL = `${getHospitalServer()}/api`
  const token = localStorage.getItem("access")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// If a request fails with 401, try refreshing the token once, then retry
let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback)
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token))
  refreshSubscribers = []
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem("refresh")

      if (!refreshToken) {
        localStorage.removeItem("access")
        localStorage.removeItem("refresh")
        window.location.href = "/login"
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            resolve(axiosInstance(originalRequest))
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // ✅ Use dynamic baseURL for refresh too
        const res = await axios.post(
          `${getHospitalServer()}/api/token/refresh/`,
          { refresh: refreshToken }
        )
        const newAccess = res.data.access
        localStorage.setItem("access", newAccess)
        isRefreshing = false
        onRefreshed(newAccess)
        originalRequest.headers.Authorization = `Bearer ${newAccess}`
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        isRefreshing = false
        localStorage.removeItem("access")
        localStorage.removeItem("refresh")
        window.location.href = "/login"
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance