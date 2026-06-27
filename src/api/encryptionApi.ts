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

export interface SendEncryptedRecordPayload {
  patient_id: string
  receiver_id: number
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

// GET /api/privacy/encryption/<id>/key/  (one-time use only!)
export async function getEncryptionKey(id: number): Promise<{ encryption_key: string }> {
  const res = await axiosInstance.get<{ encryption_key: string }>(
    `/privacy/encryption/${id}/key/`
  )
  return res.data
}

// POST /api/privacy/encryption/<id>/decrypt/
export async function decryptRecord(
  id: number,
  encryptionKey: string
): Promise<SharedEncryptedRecord> {
  const res = await axiosInstance.post<SharedEncryptedRecord>(
    `/privacy/encryption/${id}/decrypt/`,
    { encryption_key: encryptionKey }
  )
  return res.data
}