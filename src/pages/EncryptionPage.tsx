
import { useEffect, useState } from "react"
import { getPatients, type Patient } from "@/api/patientApi"
import { getOrganisations, type OrganisationListItem } from "@/api/organisationApi"
import {
  sendEncryptedRecord,
  getReceivedEncryptedRecords,
  getSentEncryptedRecords,
  getEncryptionKey,
  decryptRecord,
  regenerateEncryptionKey,
  type SharedEncryptedRecord,
} from "@/api/encryptionApi"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"


export default function EncryptionPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [organisations, setOrganisations] = useState<OrganisationListItem[]>([])
  const [received, setReceived] = useState<SharedEncryptedRecord[]>([])
  const [sent, setSent] = useState<SharedEncryptedRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Send dialog state
  const [sendDialogOpen, setSendDialogOpen] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState("")
  const [selectedReceiverId, setSelectedReceiverId] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)

  // Key retrieval state
  const [keyWarningOpen, setKeyWarningOpen] = useState(false)
  const [keyCopied, setKeyCopied] = useState(false)
  const [activeRecordId, setActiveRecordId] = useState<number | null>(null)
  const [revealedKey, setRevealedKey] = useState<string | null>(null)

  // Decrypt dialog state
  const [decryptDialogOpen, setDecryptDialogOpen] = useState(false)
  const [decryptKeyInput, setDecryptKeyInput] = useState("")
  const [isDecrypting, setIsDecrypting] = useState(false)

  async function loadAll() {
    setIsLoading(true)
    setError(null)
    try {
      const [patientsData, orgsData, receivedData, sentData] = await Promise.all([
        getPatients(),
        getOrganisations(),
        getReceivedEncryptedRecords(),
        getSentEncryptedRecords(),
      ])
      setPatients(patientsData)
      setOrganisations(orgsData)
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
    if (!selectedPatientId || !selectedReceiverId) return
    setIsSending(true)
    setError(null)
    try {
      await sendEncryptedRecord({
        patient_id: selectedPatientId,
        receiver_id: Number(selectedReceiverId),
      })
      setSendDialogOpen(false)
      setSelectedPatientId("")
      setSelectedReceiverId("")
      await loadAll()
    } catch {
      setError("Failed to send encrypted record. Check the patient ID and receiver.")
    } finally {
      setIsSending(false)
    }
  }

 function openKeyWarning(recordId: number) {
  setActiveRecordId(recordId)
  setRevealedKey(null)
  setKeyWarningOpen(true)
}

  async function confirmRevealKey() {
    if (!activeRecordId) return
    try {
      const res = await getEncryptionKey(activeRecordId)
      setRevealedKey(res.encryption_key)
      await loadAll() // refresh key_retrieved flag
    } catch {
      setError("Failed to retrieve key. It may have already been retrieved.")
      setKeyWarningOpen(false)
    }
  }

  function openDecryptDialog(recordId: number) {
    setActiveRecordId(recordId)
    setDecryptKeyInput("")
    setDecryptDialogOpen(true)
  }

  async function handleDecrypt() {
    if (!activeRecordId || !decryptKeyInput) return
    setIsDecrypting(true)
    setError(null)
    try {
      await decryptRecord(activeRecordId, decryptKeyInput)
      setDecryptDialogOpen(false)
      await loadAll()
    } catch {
      setError("Decryption failed. Check that the key is correct.")
    } finally {
      setIsDecrypting(false)
    }
  }

  async function handleRegenerateKey(recordId: number) {
  if (!confirm("Regenerate a new key for this record? The old key will stop working.")) return
  setIsRegenerating(true)
  setError(null)
  try {
    await regenerateEncryptionKey(recordId)
    await loadAll()
  } catch {
    setError("Failed to regenerate key. The record may already be decrypted.")
  } finally {
    setIsRegenerating(false)
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
                Encryption is reversible, the receiving hospital will need a
                one-time key to decrypt this record.
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
                <Select value={selectedReceiverId} onValueChange={setSelectedReceiverId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a hospital" />
                  </SelectTrigger>
                  <SelectContent>
                    {organisations.map((org) => (
                      <SelectItem key={org.id} value={String(org.id)}>
                        {org.name}
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
        receiver using a one-time key.
      </p>

      {error && <p className="text-sm text-destructive mb-4">{error}</p>}

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
              <TableHead>Key Status</TableHead>
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
                  {record.key_retrieved ? "Already retrieved" : "Not retrieved"}
                </TableCell>
                <TableCell>{record.is_decrypted ? "Yes" : "No"}</TableCell>
                <TableCell className="text-right space-x-2">
                  {!record.key_retrieved && !record.is_decrypted && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openKeyWarning(record.id)}
                    >
                      View Key
                    </Button>
                  )}
                  {record.key_retrieved && !record.is_decrypted && (
                    <Button size="sm" onClick={() => openDecryptDialog(record.id)}>
                      Decrypt
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

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
      <TableHead>Patient Ref</TableHead>
      <TableHead>Key Status</TableHead>
      <TableHead>Decrypted by Receiver</TableHead>
      <TableHead className="text-right">Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {sent.map((record) => (
      <TableRow key={record.id}>
        <TableCell>{record.receiver_name}</TableCell>
        <TableCell>{record.patient_id_reference}</TableCell>
        <TableCell>
          {record.key_retrieved ? "Key retrieved by receiver" : "Not yet retrieved"}
        </TableCell>
        <TableCell>{record.is_decrypted ? "Yes" : "No"}</TableCell>
        <TableCell className="text-right">
          {record.key_retrieved && !record.is_decrypted && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleRegenerateKey(record.id)}
              disabled={isRegenerating}
            >
              {isRegenerating ? "Regenerating..." : "Regenerate Key"}
            </Button>
          )}
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
      )}

      {/* One-time key warning + reveal dialog */}
      <Dialog open={keyWarningOpen} onOpenChange={setKeyWarningOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {revealedKey ? "Decryption Key" : "View Decryption Key?"}
            </DialogTitle>
            <DialogDescription>
              {revealedKey
                ? "Copy this key now — it cannot be retrieved again."
                : "This key can only be viewed once. If you navigate away without copying it, you will not be able to retrieve it again."}
            </DialogDescription>
          </DialogHeader>
  {revealedKey ? (
  <div className="flex items-center gap-2 p-3 bg-muted rounded">
    <code className="font-mono text-sm break-all flex-1">{revealedKey}</code>
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={() => {
        navigator.clipboard.writeText(revealedKey)
        setKeyCopied(true)
        setTimeout(() => setKeyCopied(false), 2000)
      }}
    >
      {keyCopied ? "Copied!" : "Copy"}
    </Button>
  </div>
) : null}
<DialogFooter>
  {!revealedKey ? (
    <Button onClick={confirmRevealKey}>I understand, show the key</Button>
  ) : (
    <Button onClick={() => setKeyWarningOpen(false)} disabled={!keyCopied}>
      Done
    </Button>
  )}
</DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Decrypt dialog */}
      <Dialog open={decryptDialogOpen} onOpenChange={setDecryptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decrypt Record</DialogTitle>
            <DialogDescription>
              Enter the encryption key you retrieved to decrypt this record into
              a real patient entry.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1 py-2">
            <Label>Encryption Key</Label>
            <Input
              value={decryptKeyInput}
              onChange={(e) => setDecryptKeyInput(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleDecrypt} disabled={isDecrypting}>
              {isDecrypting ? "Decrypting..." : "Decrypt"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}