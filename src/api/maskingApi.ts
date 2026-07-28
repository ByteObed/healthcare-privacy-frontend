import axiosInstance from "./axios"

export interface MaskedPatient {
  patient_id: string
  name: string
  diagnosis: string
  masked_phone?: string
}

interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// GET /api/privacy/masking/view/
export async function getMaskedPatients(): Promise<MaskedPatient[]> {
  const res = await axiosInstance.get<MaskedPatient[] | PaginatedResponse<MaskedPatient>>(
    "/privacy/masking/view/"
  )
  if (Array.isArray(res.data)) {
    return res.data
  }
  return res.data.results
}

export interface ApplyMaskingResponse {
  message: string
}

// POST /api/privacy/masking/apply/
export async function applyMasking(): Promise<ApplyMaskingResponse> {
  const res = await axiosInstance.post<ApplyMaskingResponse>(
    "/privacy/masking/apply/"
  )
  return res.data
}