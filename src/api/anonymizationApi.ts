import axiosInstance from "./axios"

export interface AnonymizedRecord {
  id: number
  anonymized_label: string
  age_range: string
  gender: string
  diagnosis: string
  medication: string
}

export interface AnonymizedDataset {
  id: number
  sender_name: string
  receiver_name: string
  filter_criteria: string
  record_count: number
  created_at: string
  records: AnonymizedRecord[]
}

export interface ExportAnonymizedDatasetPayload {
  receiver_id: number
  diagnosis_filter?: string
}

interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// POST /api/privacy/anonymization/export/
export async function exportAnonymizedDataset(
  payload: ExportAnonymizedDatasetPayload
): Promise<AnonymizedDataset> {
  const res = await axiosInstance.post<AnonymizedDataset>(
    "/privacy/anonymization/export/",
    payload
  )
  return res.data
}

// GET /api/privacy/anonymization/received/
export async function getReceivedAnonymizedDatasets(): Promise<AnonymizedDataset[]> {
  const res = await axiosInstance.get<
    AnonymizedDataset[] | PaginatedResponse<AnonymizedDataset>
  >("/privacy/anonymization/received/")
  if (Array.isArray(res.data)) {
    return res.data
  }
  return res.data.results
}