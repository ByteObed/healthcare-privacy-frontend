import axiosInstance from "./axios"

export interface OrganisationListItem {
  id: number
  user: { id: number; username: string; email: string }
  name: string
  organisation_type: string
  location: string
  created_at: string
  patient_count: number
}

interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// GET /api/organisations/  -> list all hospitals (any authenticated user)
export async function getOrganisations(): Promise<OrganisationListItem[]> {
  const res = await axiosInstance.get<OrganisationListItem[] | PaginatedResponse<OrganisationListItem>>(
    "/organisations/"
  )
  if (Array.isArray(res.data)) {
    return res.data
  }
  return res.data.results
}