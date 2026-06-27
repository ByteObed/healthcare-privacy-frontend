import axios from "axios"

const axiosInstance = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
})

// Attach access token to every request if present
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("access")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// If a request fails with 401, try refreshing the token once, then retry
let isRefreshing = false

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshing
    ) {
      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem("refresh")

      if (refreshToken) {
        try {
          const res = await axios.post(
            "http://127.0.0.1:8000/api/token/refresh/",
            { refresh: refreshToken }
          )
          localStorage.setItem("access", res.data.access)
          isRefreshing = false
          originalRequest.headers.Authorization = `Bearer ${res.data.access}`
          return axiosInstance(originalRequest)
        } catch (refreshError) {
          isRefreshing = false
          localStorage.removeItem("access")
          localStorage.removeItem("refresh")
          window.location.href = "/login"
          return Promise.reject(refreshError)
        }
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
