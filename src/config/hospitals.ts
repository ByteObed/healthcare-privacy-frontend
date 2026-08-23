// export interface HospitalOption {
//   id: string
//   label: string
//   url: string
// }

// export const HOSPITAL_SERVERS: HospitalOption[] = [
//   { id: "hospitalA", label: "Hospital A", url: "http://127.0.0.1:8000" },
//   { id: "hospitalB", label: "Hospital B", url: "http://127.0.0.1:8001" },
//   { id: "hospitalC", label: "Hospital C", url: "http://127.0.0.1:8002" },
// ]

// const STORAGE_KEY = "hospital_server"

// // Persist which hospital's server the logged-in user belongs to
// export function setHospitalServer(url: string) {
//   localStorage.setItem(STORAGE_KEY, url)
// }

// export function getHospitalServer(): string {
//   return localStorage.getItem(STORAGE_KEY) || HOSPITAL_SERVERS[0].url
// }

// export function clearHospitalServer() {
//   localStorage.removeItem(STORAGE_KEY)
// }

// // Other hospitals, excluding the one the current user belongs to (used for receiver dropdowns)
// export function getOtherHospitals(): HospitalOption[] {
//   const current = getHospitalServer()
//   return HOSPITAL_SERVERS.filter((h) => h.url !== current)
// }

export interface HospitalOption {
  id: string
  label: string
  url: string
}

export const HOSPITAL_SERVERS: HospitalOption[] = [
  { id: "hospitalA", label: "Hospital A", url: "http://127.0.0.1:8000" },
  { id: "hospitalB", label: "Hospital B", url: "http://127.0.0.1:8001" },
  { id: "hospitalC", label: "Hospital C", url: "http://127.0.0.1:8002" },
]

const STORAGE_KEY = "hospital_server"

// Persist which hospital's server the logged-in user belongs to
export function setHospitalServer(url: string) {
  localStorage.setItem(STORAGE_KEY, url)
}

export function getHospitalServer(): string {
  return localStorage.getItem(STORAGE_KEY) || HOSPITAL_SERVERS[0].url
}

export function clearHospitalServer() {
  localStorage.removeItem(STORAGE_KEY)
}

// Other hospitals, excluding the one the current user belongs to (used for receiver dropdowns)
export function getOtherHospitals(): HospitalOption[] {
  const current = getHospitalServer()
  return HOSPITAL_SERVERS.filter((h) => h.url !== current)
}