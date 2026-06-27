import axiosInstance from "./axios"

export type DPQueryType = "count_by_diagnosis" | "count_by_gender" | "average_age"

export interface DPQueryPayload {
  target_organisation_id: number
  query_type: DPQueryType
  diagnosis?: string
}

export interface DPQueryResult {
  noisy_result: number
  epsilon: number
  note: string
}

// POST /api/privacy/differential-privacy/query/
export async function runDifferentialPrivacyQuery(
  payload: DPQueryPayload
): Promise<DPQueryResult> {
  const res = await axiosInstance.post<DPQueryResult>(
    "/privacy/differential-privacy/query/",
    payload
  )
  return res.data
}