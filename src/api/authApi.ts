import axiosInstance from "./axios"

export interface LoginPayload {
  username: string
  password: string
}

export type OrganisationType = "hospital" | "clinic" | "research"

export const ORGANISATION_TYPE_OPTIONS: { value: OrganisationType; label: string }[] = [
  { value: "hospital", label: "Hospital" },
  { value: "clinic", label: "Clinic" },
  { value: "research", label: "Research Center" },
]

export interface RegisterPayload {
  username: string
  password: string
  email: string
  name: string
  organisation_type: OrganisationType
  location: string
}

export interface OrganisationResponse {
  id: number
  user: { id: number; username: string; email: string }
  name: string
  organisation_type: string
  location: string
  created_at: string
  patient_count: number
}

export interface TokenResponse {
  access: string
  refresh: string
}

// POST /api/token/  -> returns { access, refresh }
export async function loginRequest(payload: LoginPayload): Promise<TokenResponse> {
  const res = await axiosInstance.post<TokenResponse>("/token/", payload)
  return res.data
}

// POST /api/organisations/register/  -> creates User + Organisation
export async function registerRequest(
  payload: RegisterPayload
): Promise<OrganisationResponse> {
  const res = await axiosInstance.post<OrganisationResponse>(
    "/organisations/register/",
    payload
  )
  return res.data
}

// GET /api/organisations/me/ -> returns the logged-in organisation's details
export async function getCurrentOrganisation(): Promise<OrganisationResponse> {
  const res = await axiosInstance.get<OrganisationResponse>("/organisations/me/")
  return res.data
}

// Clears tokens from storage (does not call backend, since SimpleJWT has no logout endpoint by default)
export function logoutRequest() {
  localStorage.removeItem("access")
  localStorage.removeItem("refresh")
}

// POST /api/organisations/password-reset/request/
export async function requestPasswordReset(email: string): Promise<void> {
  await axiosInstance.post("/organisations/password-reset/request/", { email })
}

// POST /api/organisations/password-reset/confirm/
export async function confirmPasswordReset(
  uid: string,
  token: string,
  new_password: string
): Promise<void> {
  await axiosInstance.post("/organisations/password-reset/confirm/", {
    uid,
    token,
    new_password,
  })
}