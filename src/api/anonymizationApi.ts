
import axiosInstance from "./axios"

export interface AnonymizedRecord {
  id: number
  anonymized_label: string
  age_range: string
  gender: string
  diagnosis: string
  medication: string
}

// Interface for RECEIVED datasets (contains patient records)
export interface ReceivedAnonymizedDataset {
  id: number
  sender_name: string
  sent_to?: string
  record_count: number
  created_at: string
  records: AnonymizedRecord[]  // Required - has patient data
}

// Interface for SENT datasets (contains processing metrics)
export interface SentAnonymizedDataset {
  id: number
  sent_to: string
  original_record_count: number
  processed_record_count: number
  processing_time_seconds: number
  created_at: string
  // No records field - this is for metrics only
}

export interface ExportAnonymizedDatasetPayload {
  receiver_url: string
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
): Promise<SentAnonymizedDataset> {
  const res = await axiosInstance.post<SentAnonymizedDataset>(
    "/privacy/anonymization/export/",
    payload
  )
  return res.data
}

// GET /api/privacy/anonymization/received/
export async function getReceivedAnonymizedDatasets(): Promise<ReceivedAnonymizedDataset[]> {
  const res = await axiosInstance.get<
    ReceivedAnonymizedDataset[] | PaginatedResponse<ReceivedAnonymizedDataset>
  >("/privacy/anonymization/received/")
  if (Array.isArray(res.data)) {
    return res.data
  }
  return res.data.results
}

// GET /api/privacy/anonymization/sent/
export async function getSentAnonymizedDatasets(): Promise<SentAnonymizedDataset[]> {
  const res = await axiosInstance.get<
    SentAnonymizedDataset[] | PaginatedResponse<SentAnonymizedDataset>
  >("/privacy/anonymization/sent/")
  if (Array.isArray(res.data)) {
    return res.data
  }
  return res.data.results
}