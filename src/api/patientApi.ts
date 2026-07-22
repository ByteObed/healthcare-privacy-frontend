
import axiosInstance from "./axios"

export type Gender = "M" | "F"

export interface Patient {
  id: number
  patient_id: string
  name: string
  age: number
  gender: Gender
  phone_number: string
  diagnosis: string
  medication: string
  organisation_name: string
  created_at: string
}

export interface PatientCreatePayload {
  patient_id: string
  name: string
  age: number
  gender: Gender
  phone_number: string
  diagnosis: string
  medication: string
}

interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// GET /api/patients/  -> list patients (scoped to logged-in org)
export async function getPatients(): Promise<Patient[]> {
  const res = await axiosInstance.get<Patient[] | PaginatedResponse<Patient>>("/patients/")
  // Handle both paginated and non-paginated DRF responses
  if (Array.isArray(res.data)) {
    return res.data
  }
  return res.data.results
}

// POST /api/patients/  -> create a patient
export async function createPatient(payload: PatientCreatePayload): Promise<Patient> {
  const res = await axiosInstance.post<Patient>("/patients/", payload)
  return res.data
}

// PATCH /api/patients/<id>/  -> update a patient
export async function updatePatient(
  id: number,
  payload: Partial<PatientCreatePayload>
): Promise<Patient> {
  const res = await axiosInstance.patch<Patient>(`/patients/${id}/`, payload)
  return res.data
}

// DELETE /api/patients/<id>/
export async function deletePatient(id: number): Promise<void> {
  await axiosInstance.delete(`/patients/${id}/`)
}

export interface ImportPatientsResponse {
  message: string
}

// POST /api/patients/import-excel/  -> bulk import patients from an .xlsx file
export async function importPatientsFromExcel(
  file: File
): Promise<ImportPatientsResponse> {
  const formData = new FormData()
  formData.append("file", file)

  const res = await axiosInstance.post<ImportPatientsResponse>(
    "/patients/import-excel/",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  )
  return res.data
}