import { createContext, useState, useEffect } from "react"
import type { ReactNode } from "react"
import {
  loginRequest,
  registerRequest,
  logoutRequest,
  getCurrentOrganisation,
  type LoginPayload,
  type RegisterPayload,
  type OrganisationResponse,
} from "@/api/authApi"

interface AuthContextType {
  organisation: OrganisationResponse | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [organisation, setOrganisation] = useState<OrganisationResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // On app load, check if tokens exist in localStorage.
  // If so, fetch the logged-in organisation's details from /me/.
  useEffect(() => {
    const access = localStorage.getItem("access")
    if (access) {
      getCurrentOrganisation()
        .then((org) => setOrganisation(org))
        .catch(() => {
          // token invalid/expired and refresh failed -> clear it
          localStorage.removeItem("access")
          localStorage.removeItem("refresh")
          setOrganisation(null)
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  async function login(payload: LoginPayload) {
    const tokens = await loginRequest(payload)
    localStorage.setItem("access", tokens.access)
    localStorage.setItem("refresh", tokens.refresh)
    const org = await getCurrentOrganisation()
    setOrganisation(org)
  }

  async function register(payload: RegisterPayload) {
    const org = await registerRequest(payload)
    setOrganisation(org)
    // Note: register does NOT log the user in automatically (no tokens returned).
    // After registering, redirect them to the login page.
  }

  function logout() {
    logoutRequest()
    setOrganisation(null)
  }

  const isAuthenticated = !!localStorage.getItem("access")

  return (
    <AuthContext.Provider
      value={{ organisation, isAuthenticated, isLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}