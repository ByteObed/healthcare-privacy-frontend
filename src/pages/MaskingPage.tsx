import { useEffect, useState } from "react"
import { getMaskedPatients, type MaskedPatient } from "@/api/maskingApi"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function MaskingPage() {
  const [patients, setPatients] = useState<MaskedPatient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getMaskedPatients()
        setPatients(data)
      } catch {
        setError("Failed to load masked patient view.")
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">Masking</h1>
      <p className="text-sm text-muted-foreground mb-4">
        This is a display-layer view only, your own patient records are shown
        here with identifying fields partially hidden. No data is sent or
        transferred; masking is just a protective view, not a transfer action.
      </p>

      {error && <p className="text-sm text-destructive mb-4">{error}</p>}

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : patients.length === 0 ? (
        <p className="text-muted-foreground">No patients to display.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Diagnosis</TableHead>
              <TableHead>Phone</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((p, idx) => (
              <TableRow key={idx}>
                <TableCell>{p.patient_id}</TableCell>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.diagnosis}</TableCell>
                <TableCell>{p.masked_phone ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}