import { useEffect, useState } from "react"
import { getOrganisations, type OrganisationListItem } from "@/api/organisationApi"
import {
  runDifferentialPrivacyQuery,
  type DPQueryType,
  type DPQueryResult,
} from "@/api/differentialPrivacyApi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card"

const QUERY_TYPE_OPTIONS: { value: DPQueryType; label: string }[] = [
  { value: "count_by_diagnosis", label: "Count by Diagnosis" },
  { value: "count_by_gender", label: "Count by Gender" },
  { value: "average_age", label: "Average Age" },
]

export default function DifferentialPrivacyPage() {
  const [organisations, setOrganisations] = useState<OrganisationListItem[]>([])
  const [targetOrgId, setTargetOrgId] = useState("")
  const [queryType, setQueryType] = useState<DPQueryType | "">("")
  const [diagnosis, setDiagnosis] = useState("")

  const [result, setResult] = useState<DPQueryResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const orgs = await getOrganisations()
        setOrganisations(orgs)
      } catch {
        setError("Failed to load hospitals list.")
      }
    }
    load()
  }, [])

  async function handleRunQuery() {
    if (!targetOrgId || !queryType) {
      setError("Select a target hospital and query type.")
      return
    }
    setIsRunning(true)
    setError(null)
    try {
      const res = await runDifferentialPrivacyQuery({
        target_organisation_id: Number(targetOrgId),
        query_type: queryType,
        diagnosis: queryType === "count_by_diagnosis" ? diagnosis || undefined : undefined,
      })
      setResult(res)
    } catch {
      setError("Query failed. Check your selections and try again.")
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">Differential Privacy</h1>
      <p className="text-sm text-muted-foreground mb-4">
        Query another hospital's aggregate statistics. A small amount of
        random noise (controlled by the privacy budget, epsilon) is added to
        protect individual patients, running the same query again will give a
        slightly different result each time. This is expected behavior, not a
        bug.
      </p>

      <Card className="max-w-md mb-6">
        <CardHeader>
          <CardTitle>Run a Query</CardTitle>
          <CardDescription>
            Choose a target hospital and the type of aggregate you want.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label>Target Hospital</Label>
            <Select value={targetOrgId} onValueChange={setTargetOrgId}>
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
            <Label>Query Type</Label>
            <Select
              value={queryType}
              onValueChange={(val) => setQueryType(val as DPQueryType)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a query type" />
              </SelectTrigger>
              <SelectContent>
                {QUERY_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {queryType === "count_by_diagnosis" && (
            <div className="space-y-1">
              <Label>Diagnosis</Label>
              <Input
                placeholder="e.g. Hypertension"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
              />
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button onClick={handleRunQuery} disabled={isRunning} className="w-full">
            {isRunning ? "Running..." : result ? "Run Again" : "Run Query"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-3xl font-semibold">{result.noisy_result}</p>
            <p className="text-sm text-muted-foreground">
              Epsilon (privacy budget): <strong>{result.epsilon}</strong>
            </p>
            <p className="text-sm text-muted-foreground">{result.note}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}