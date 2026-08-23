
// import axiosInstance from "./axios"

// export interface SharedEncryptedRecord {
//   id: number
//   sender_name: string
//   receiver_name: string
//   patient_id_reference: string
//   encrypted_payload: string
//   key_retrieved: boolean
//   is_decrypted: boolean
//   decrypted_at: string | null
//   decrypted_payload: string | null
//   created_at: string
// }

// export interface SendEncryptedRecordPayload {
//   patient_id: string
//   receiver_url: string  // Changed from receiver_id: number
// }

// interface PaginatedResponse<T> {
//   count: number
//   next: string | null
//   previous: string | null
//   results: T[]
// }

// // POST /api/privacy/encryption/send/
// export async function sendEncryptedRecord(
//   payload: SendEncryptedRecordPayload
// ): Promise<SharedEncryptedRecord> {
//   const res = await axiosInstance.post<SharedEncryptedRecord>(
//     "/privacy/encryption/send/",
//     payload
//   )
//   return res.data
// }

// // GET /api/privacy/encryption/received/
// export async function getReceivedEncryptedRecords(): Promise<SharedEncryptedRecord[]> {
//   const res = await axiosInstance.get<
//     SharedEncryptedRecord[] | PaginatedResponse<SharedEncryptedRecord>
//   >("/privacy/encryption/received/")
//   if (Array.isArray(res.data)) {
//     return res.data
//   }
//   return res.data.results
// }

// // POST /api/privacy/encryption/<id>/decrypt/ (no body needed anymore)
// export async function decryptRecord(
//   id: number
// ): Promise<SharedEncryptedRecord & { signature_verified: boolean }> {
//   const res = await axiosInstance.post<SharedEncryptedRecord & { signature_verified: boolean }>(
//     `/privacy/encryption/${id}/decrypt/`
//   )
//   return res.data
// }

// // GET /api/privacy/encryption/sent/
// export async function getSentEncryptedRecords(): Promise<SharedEncryptedRecord[]> {
//   const res = await axiosInstance.get<
//     SharedEncryptedRecord[] | PaginatedResponse<SharedEncryptedRecord>
//   >("/privacy/encryption/sent/")
//   if (Array.isArray(res.data)) {
//     return res.data
//   }
//   return res.data.results
// }

// // NOTE: getEncryptionKey and regenerateEncryptionKey have been removed
// // as they are no longer needed with the RSA encryption flow

import axiosInstance from "./axios"

export interface SharedEncryptedRecord {
  id: number
  sender_name: string
  receiver_name: string
  patient_id_reference: string
  encrypted_payload: string
  key_retrieved: boolean
  is_decrypted: boolean
  decrypted_at: string | null
  decrypted_payload: string | null
  created_at: string
}

export interface SentEncryptedRecordSummary {
  id: number
  sent_to: string
  processing_time_seconds: number
  created_at: string
}

export interface SendEncryptedRecordPayload {
  patient_id: string
  receiver_url: string  // Changed from receiver_id: number
}

interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// POST /api/privacy/encryption/send/
export async function sendEncryptedRecord(
  payload: SendEncryptedRecordPayload
): Promise<SharedEncryptedRecord> {
  const res = await axiosInstance.post<SharedEncryptedRecord>(
    "/privacy/encryption/send/",
    payload
  )
  return res.data
}

// GET /api/privacy/encryption/received/
export async function getReceivedEncryptedRecords(): Promise<SharedEncryptedRecord[]> {
  const res = await axiosInstance.get<
    SharedEncryptedRecord[] | PaginatedResponse<SharedEncryptedRecord>
  >("/privacy/encryption/received/")
  if (Array.isArray(res.data)) {
    return res.data
  }
  return res.data.results
}

// POST /api/privacy/encryption/<id>/decrypt/ (no body needed anymore)
export async function decryptRecord(
  id: number
): Promise<SharedEncryptedRecord & { signature_verified: boolean }> {
  const res = await axiosInstance.post<SharedEncryptedRecord & { signature_verified: boolean }>(
    `/privacy/encryption/${id}/decrypt/`
  )
  return res.data
}

// GET /api/privacy/encryption/sent/
export async function getSentEncryptedRecords(): Promise<SentEncryptedRecordSummary[]> {
  const res = await axiosInstance.get<
    SentEncryptedRecordSummary[] | PaginatedResponse<SentEncryptedRecordSummary>
  >("/privacy/encryption/sent/")
  if (Array.isArray(res.data)) {
    return res.data
  }
  return res.data.results
}

// NOTE: getEncryptionKey and regenerateEncryptionKey have been removed
// as they are no longer needed with the RSA encryption flow