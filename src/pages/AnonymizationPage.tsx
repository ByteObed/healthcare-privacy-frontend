import { useEffect, useState } from "react"
import { getOrganisations, type OrganisationListItem } from "@/api/organisationApi"
import {
  exportAnonymizedDataset,
  getReceivedAnonymizedDatasets,
  type AnonymizedDataset,
} from "@/api/anonymizationApi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

export default function AnonymizationPage() {
  const [organisations, setOrganisations] = useState<OrganisationListItem[]>([])
  const [datasets, setDatasets] = useState<AnonymizedDataset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [selectedReceiverId, setSelectedReceiverId] = useState("")
  const [diagnosisFilter, setDiagnosisFilter] = useState("")
  const [isExporting, setIsExporting] = useState(false)

  async function loadAll() {
    setIsLoading(true)
    setError(null)
    try {
      const [orgsData, datasetsData] = await Promise.all([
        getOrganisations(),
        getReceivedAnonymizedDatasets(),
      ])
      setOrganisations(orgsData)
      setDatasets(datasetsData)
    } catch {
      setError("Failed to load anonymization data.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  async function handleExport() {
    if (!selectedReceiverId) return
    setIsExporting(true)
    setError(null)
    try {
      await exportAnonymizedDataset({
        receiver_id: Number(selectedReceiverId),
        diagnosis_filter: diagnosisFilter || undefined,
      })
      setExportDialogOpen(false)
      setSelectedReceiverId("")
      setDiagnosisFilter("")
      await loadAll()
    } catch {
      setError("Failed to export dataset. Check your filter and receiver.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-semibold">Anonymization</h1>
        <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
          <DialogTrigger asChild>
            <Button>Export Dataset</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export Anonymized Dataset</DialogTitle>
              <DialogDescription>
                This strips patient identity (name, patient ID, phone) before
                sending. This action is irreversible, the original identity
                cannot be recovered by the receiver.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
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
        Anonymization is irreversible — identity fields are stripped before the
        dataset is sent, and cannot be recovered.
      </p>

      {error && <p className="text-sm text-destructive mb-4">{error}</p>}

      <h2 className="text-lg font-medium mb-2">Received Datasets</h2>
      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : datasets.length === 0 ? (
        <p className="text-muted-foreground">No anonymized datasets received yet.</p>
      ) : (
        <Accordion type="single" collapsible>
          {datasets.map((dataset) => (
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
    </div>
  )
}