import { useEffect, useState } from "react"
import { getPatients, type Patient } from "@/api/patientApi"
import {
  sendEncryptedRecord,
  getReceivedEncryptedRecords,
  getSentEncryptedRecords,
  decryptRecord,
  type SharedEncryptedRecord,
  type SentEncryptedRecordSummary,
} from "@/api/encryptionApi"
import { getOtherHospitals, type HospitalOption } from "@/config/hospitals"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export default function EncryptionPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [otherHospitals] = useState<HospitalOption[]>(getOtherHospitals())
  const [received, setReceived] = useState<SharedEncryptedRecord[]>([])
  const [sent, setSent] = useState<SentEncryptedRecordSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Send dialog state
  const [sendDialogOpen, setSendDialogOpen] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState("")
  const [selectedReceiverUrl, setSelectedReceiverUrl] = useState("")
  const [isSending, setIsSending] = useState(false)

  async function loadAll() {
    setIsLoading(true)
    setError(null)
    try {
      const [patientsData, receivedData, sentData] = await Promise.all([
        getPatients(),
        getReceivedEncryptedRecords(),
        getSentEncryptedRecords(),
      ])
      setPatients(patientsData)
      setReceived(receivedData)
      setSent(sentData)
    } catch {
      setError("Failed to load encryption data.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  async function handleSend() {
    if (!selectedPatientId || !selectedReceiverUrl) return
    setIsSending(true)
    setError(null)
    try {
      await sendEncryptedRecord({
        patient_id: selectedPatientId,
        receiver_url: selectedReceiverUrl,
      })
      setSendDialogOpen(false)
      setSelectedPatientId("")
      setSelectedReceiverUrl("")
      await loadAll()
    } catch {
      setError("Failed to send encrypted record. Check the patient ID and receiver.")
    } finally {
      setIsSending(false)
    }
  }

  async function handleDecrypt(recordId: number) {
    setError(null)
    try {
      const result = await decryptRecord(recordId)
      if (!result.signature_verified) {
        setError("Warning: signature verification failed for this record.")
      }
      await loadAll()
    } catch {
      setError("Decryption failed.")
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-semibold">Encryption</h1>
        <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
          <DialogTrigger asChild>
            <Button>Send Encrypted Record</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Encrypted Record</DialogTitle>
              <DialogDescription>
                Encryption is reversible, the receiving hospital will be able to
                decrypt this record.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1">
                <Label>Patient</Label>
                <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((p) => (
                      <SelectItem key={p.id} value={p.patient_id}>
                        {p.patient_id} - {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Receiving Hospital</Label>
                <Select value={selectedReceiverUrl} onValueChange={setSelectedReceiverUrl}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a hospital" />
                  </SelectTrigger>
                  <SelectContent>
                    {otherHospitals.map((h) => (
                      <SelectItem key={h.id} value={h.url}>
                        {h.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSend} disabled={isSending}>
                {isSending ? "Sending..." : "Send"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Encryption is reversible by design — records can be decrypted by the
        receiver.
      </p>

      {error && <p className="text-sm text-destructive mb-4">{error}</p>}

      {/* Received Records */}
      <h2 className="text-lg font-medium mb-2">Received Records</h2>
      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : received.length === 0 ? (
        <p className="text-muted-foreground">No encrypted records received yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>From</TableHead>
              <TableHead>Patient Ref</TableHead>
              <TableHead>Signature Verified</TableHead>
              <TableHead>Decrypted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {received.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.sender_name}</TableCell>
                <TableCell>{record.patient_id_reference}</TableCell>
                <TableCell>
                  {record.is_decrypted ? (
                    (record as any).signature_verified ? (
                      <span className="text-green-600">✅</span>
                    ) : (
                      <span className="text-red-600">❌</span>
                    )
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>{record.is_decrypted ? "Yes" : "No"}</TableCell>
                <TableCell className="text-right">
                  {!record.is_decrypted && (
                    <Button size="sm" onClick={() => handleDecrypt(record.id)}>
                      Decrypt
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Sent Records */}
      <h2 className="text-lg font-medium mb-2 mt-8">Sent Records</h2>
      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : sent.length === 0 ? (
        <p className="text-muted-foreground">You haven't sent any encrypted records yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>To</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sent.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.sent_to}</TableCell>
                <TableCell>
                  <span className="text-green-600">✅ Sent</span>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" disabled>
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}