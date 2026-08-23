
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import axiosInstance from "@/api/axios"
import { getOtherHospitals, type HospitalOption } from "@/config/hospitals"

interface AnonymizedRecord {
  id: number
  anonymized_label: string
  age_range: string
  gender: string
  diagnosis: string
  medication: string
}

interface ReceivedDataset {
  id: number
  sender_name: string
  sender_url: string
  filter_criteria: string
  record_count: number
  created_at: string
  records: AnonymizedRecord[]
}

interface SentDataset {
  id: number
  sent_to: string
  original_record_count: number
  processed_record_count: number
  processing_time_seconds: number
  created_at: string
  records?: AnonymizedRecord[]  // ← ADD THIS - make it optional
}

export default function AnonymizationPage() {
  const [receivedDatasets, setReceivedDatasets] = useState<ReceivedDataset[]>([])
  const [sentDatasets, setSentDatasets] = useState<SentDataset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [selectedReceiverUrl, setSelectedReceiverUrl] = useState("")
  const [diagnosisFilter, setDiagnosisFilter] = useState("")
  const [isExporting, setIsExporting] = useState(false)
  const [otherHospitals] = useState<HospitalOption[]>(getOtherHospitals())

  useEffect(() => {
    fetchAnonymizationData()
  }, [])

  async function fetchAnonymizationData() {
    setIsLoading(true)
    setError(null)
    try {
      const receivedRes = await axiosInstance.get('/privacy/anonymization/received/')
      const receivedData = receivedRes.data
      setReceivedDatasets(
        Array.isArray(receivedData) ? receivedData : receivedData.results || []
      )

      const sentRes = await axiosInstance.get('/privacy/anonymization/sent/')
      const sentData = sentRes.data
      setSentDatasets(
        Array.isArray(sentData) ? sentData : sentData.results || []
      )
    } catch (error: any) {
      console.error('Error fetching anonymization data:', error)
      setError(error.response?.data?.detail || "Failed to load anonymization data.")
      setReceivedDatasets([])
      setSentDatasets([])
    } finally {
      setIsLoading(false)
    }
  }

  async function handleExport() {
    if (!selectedReceiverUrl) {
      setError("Please select a receiving hospital.")
      return
    }
    setIsExporting(true)
    setError(null)
    try {
      await axiosInstance.post('/privacy/anonymization/export/', {
        receiver_url: selectedReceiverUrl,
        diagnosis_filter: diagnosisFilter || undefined,
      })
      setExportDialogOpen(false)
      setSelectedReceiverUrl("")
      setDiagnosisFilter("")
      await fetchAnonymizationData()
    } catch (error: any) {
      console.error('Export error:', error)
      setError(error.response?.data?.detail || "Failed to export dataset. Check your filter and receiver.")
    } finally {
      setIsExporting(false)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading...</div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">Anonymization</h1>
        <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
          <DialogTrigger asChild>
            <Button>Export Dataset</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export Anonymized Dataset</DialogTitle>
              <DialogDescription>
                This strips patient identity (name, patient ID, phone) before
                sending. This action is irreversible — the original identity
                cannot be recovered by the receiver.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
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
              <div className="space-y-1">
                <Label>Diagnosis Filter (optional)</Label>
                <Input
                  placeholder="e.g. Diabetes"
                  value={diagnosisFilter}
                  onChange={(e) => setDiagnosisFilter(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleExport} disabled={isExporting}>
                {isExporting ? "Exporting..." : "Export"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Anonymization is irreversible — identity fields are stripped before the dataset is sent,
        and cannot be recovered.
      </p>

      {error && <p className="text-sm text-destructive mb-4">{error}</p>}

      {/* Received Datasets */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Received Datasets</CardTitle>
        </CardHeader>
        <CardContent>
          {receivedDatasets.length === 0 ? (
            <p className="text-muted-foreground">No anonymized datasets received yet.</p>
          ) : (
            <Accordion type="single" collapsible>
              {receivedDatasets.map((dataset) => (
                <AccordionItem key={dataset.id} value={String(dataset.id)}>
                  <AccordionTrigger>
                    From {dataset.sender_name} — {dataset.record_count} record
                    {dataset.record_count !== 1 ? "s" : ""}
                    {dataset.filter_criteria ? ` (filter: ${dataset.filter_criteria})` : ""}
                  </AccordionTrigger>
                  <AccordionContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Label</TableHead>
                          <TableHead>Age Range</TableHead>
                          <TableHead>Gender</TableHead>
                          <TableHead>Diagnosis</TableHead>
                          <TableHead>Medication</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dataset.records.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>{record.anonymized_label}</TableCell>
                            <TableCell>{record.age_range}</TableCell>
                            <TableCell>{record.gender}</TableCell>
                            <TableCell>{record.diagnosis}</TableCell>
                            <TableCell>{record.medication}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* Sent Datasets */}
      <Card>
        <CardHeader>
          <CardTitle>Sent Datasets</CardTitle>
        </CardHeader>
        <CardContent>
          {sentDatasets.length === 0 ? (
            <p className="text-muted-foreground">No anonymized datasets sent yet.</p>
          ) : (
            <Accordion type="single" collapsible>
              {sentDatasets.map((dataset) => (
                <AccordionItem key={dataset.id} value={`sent-${dataset.id}`}>
                  <AccordionTrigger>
                    To {dataset.sent_to} — {dataset.processed_record_count} record
                    {dataset.processed_record_count !== 1 ? "s" : ""}
                  </AccordionTrigger>
                  <AccordionContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Label</TableHead>
                          <TableHead>Age Range</TableHead>
                          <TableHead>Gender</TableHead>
                          <TableHead>Diagnosis</TableHead>
                          <TableHead>Medication</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dataset.records && dataset.records.length > 0 ? (
                          dataset.records.map((record) => (
                            <TableRow key={record.id}>
                              <TableCell>{record.anonymized_label}</TableCell>
                              <TableCell>{record.age_range}</TableCell>
                              <TableCell>{record.gender}</TableCell>
                              <TableCell>{record.diagnosis}</TableCell>
                              <TableCell>{record.medication}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                              No records available
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  )
}