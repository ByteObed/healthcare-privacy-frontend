
import { useEffect, useState, useRef } from "react"
import {
  getPatients,
  createPatient,
  updatePatient,
  deletePatient,
  importPatientsFromExcel,
  type Patient,
  type PatientCreatePayload,
  type Gender,
} from "@/api/patientApi"
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
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"

const emptyForm: PatientCreatePayload = {
  patient_id: "",
  name: "",
  age: 0,
  gender: "M",
  phone_number: "",
  diagnosis: "",
  medication: "",
}

export default function PatientsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importMessage, setImportMessage] = useState<string | null>(null)
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)

  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<PatientCreatePayload>(emptyForm)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  function validateForm(data: PatientCreatePayload): Record<string, string> {
    const errors: Record<string, string> = {}

    if (!data.patient_id.trim()) errors.patient_id = "Patient ID is required."
    if (!data.name.trim()) errors.name = "Name is required."
    if (!data.age || data.age <= 0) errors.age = "Enter a valid age."
    if (!data.phone_number.trim()) {
      errors.phone_number = "Phone number is required."
    } else if (!/^\d{10}$/.test(data.phone_number.trim())) {
      errors.phone_number = "Phone number must be exactly 10 digits (e.g. 0244123456)."
    }
    if (!data.diagnosis.trim()) errors.diagnosis = "Diagnosis is required."
    if (!data.medication.trim()) errors.medication = "Medication is required."

    return errors
  }

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    setImportMessage(null)
    setError(null)
    try {
      const res = await importPatientsFromExcel(file)
      setImportMessage(res.message)
      await loadPatients()
    } catch (err: any) {
      const backendError =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        "Import failed. Check the file format and try again."
      setError(backendError)
    } finally {
      setIsImporting(false)
      // reset so selecting the same file again still triggers onChange
      e.target.value = ""
    }
  }

  async function loadPatients() {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getPatients()
      setPatients(data)
    } catch {
      setError("Failed to load patients.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPatients()
  }, [])

  function openAddDialog() {
    setEditingId(null)
    setForm(emptyForm)
    setFormErrors({})
    setDialogOpen(true)
  }

  function openEditDialog(patient: Patient) {
    setEditingId(patient.id)
    setForm({
      patient_id: patient.patient_id,
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      phone_number: patient.phone_number,
      diagnosis: patient.diagnosis,
      medication: patient.medication,
    })
    setFormErrors({})
    setDialogOpen(true)
  }

  async function handleSave() {
    const errors = validateForm(form)
    setFormErrors(errors)
    if (Object.keys(errors).length > 0) return

    setIsSaving(true)
    try {
      if (editingId) {
        await updatePatient(editingId, form)
      } else {
        await createPatient(form)
      }
      setDialogOpen(false)
      await loadPatients()
    } catch {
      setError("Failed to save patient. Check the fields and try again.")
    } finally {
      setIsSaving(false)
    }
  }

  function openDeleteDialog(id: number) {
    setDeleteTargetId(id)
  }

  async function confirmDelete() {
    if (!deleteTargetId) return
    try {
      await deletePatient(deleteTargetId)
      await loadPatients()
    } catch {
      setError("Failed to delete patient.")
    } finally {
      setDeleteTargetId(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Patients</h1>

        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={handleFileSelected}
          />

          <Button
            variant="outline"
            onClick={handleImportClick}
            disabled={isImporting}
          >
            {isImporting ? "Importing..." : "Import Data"}
          </Button>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog}>Add Patient</Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Edit Patient" : "Add Patient"}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-3 py-2">
                <div className="space-y-1">
                  <Label>Patient ID</Label>
                  <Input
                    value={form.patient_id}
                    onChange={(e) =>
                      setForm({ ...form, patient_id: e.target.value })
                    }
                  />
                  {formErrors.patient_id && (
                    <p className="text-sm text-destructive">{formErrors.patient_id}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label>Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                  {formErrors.name && (
                    <p className="text-sm text-destructive">{formErrors.name}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Age</Label>
                    <Input
                      type="number"
                      value={form.age}
                      onChange={(e) =>
                        setForm({ ...form, age: Number(e.target.value) })
                      }
                    />
                    {formErrors.age && (
                      <p className="text-sm text-destructive">{formErrors.age}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label>Gender</Label>
                    <Select
                      value={form.gender}
                      onValueChange={(val) =>
                        setForm({ ...form, gender: val as Gender })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Male</SelectItem>
                        <SelectItem value="F">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Phone Number</Label>
                  <Input
                    value={form.phone_number}
                    onChange={(e) =>
                      setForm({ ...form, phone_number: e.target.value })
                    }
                  />
                  {formErrors.phone_number && (
                    <p className="text-sm text-destructive">{formErrors.phone_number}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label>Diagnosis</Label>
                  <Input
                    value={form.diagnosis}
                    onChange={(e) =>
                      setForm({ ...form, diagnosis: e.target.value })
                    }
                  />
                  {formErrors.diagnosis && (
                    <p className="text-sm text-destructive">{formErrors.diagnosis}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label>Medication</Label>
                  <Input
                    value={form.medication}
                    onChange={(e) =>
                      setForm({ ...form, medication: e.target.value })
                    }
                  />
                  {formErrors.medication && (
                    <p className="text-sm text-destructive">{formErrors.medication}</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <AlertDialog open={deleteTargetId !== null} onOpenChange={(open) => !open && setDeleteTargetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this patient record?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The patient's record will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {error && <p className="text-sm text-destructive mb-4">{error}</p>}

      {importMessage && (
        <p className="text-sm text-green-600 mb-4">{importMessage}</p>
      )}

      {isLoading ? (
        <p className="text-muted-foreground">Loading patients...</p>
      ) : patients.length === 0 ? (
        <p className="text-muted-foreground">No patients yet. Add one to get started.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Diagnosis</TableHead>
              <TableHead>Medication</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell>{patient.patient_id}</TableCell>
                <TableCell>{patient.name}</TableCell>
                <TableCell>{patient.age}</TableCell>
                <TableCell>{patient.gender === "M" ? "Male" : "Female"}</TableCell>
                <TableCell>{patient.diagnosis}</TableCell>
                <TableCell>{patient.medication}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(patient)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => openDeleteDialog(patient.id)}
                  >
                    Delete
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