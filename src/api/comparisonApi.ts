import axiosInstance from "./axios"

export interface PrivacyResultSummary {
  id: number
  technique: string
  technique_display: string
  processing_time_seconds: number
  utility_score: number
  privacy_score: number
  created_at: string
}

interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// GET /api/privacy/comparison/  -> all orgs' results, for charting
export async function getComparisonResults(): Promise<PrivacyResultSummary[]> {
  const res = await axiosInstance.get<
    PrivacyResultSummary[] | PaginatedResponse<PrivacyResultSummary>
  >("/privacy/comparison/")
  if (Array.isArray(res.data)) {
    return res.data
  }
  return res.data.results
}