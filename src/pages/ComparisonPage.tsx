import { useEffect, useMemo, useState } from "react"
import { getComparisonResults, type PrivacyResultSummary } from "@/api/comparisonApi"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface TechniqueAverage {
  technique: string
  utility_score: number
  privacy_score: number
  processing_time_seconds: number
  count: number
}

export default function ComparisonPage() {
  const [results, setResults] = useState<PrivacyResultSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getComparisonResults()
        setResults(data)
      } catch {
        setError("Failed to load comparison data.")
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const chartData: TechniqueAverage[] = useMemo(() => {
    const grouped = new Map<string, PrivacyResultSummary[]>()
    for (const r of results) {
      const label = r.technique_display
      if (!grouped.has(label)) grouped.set(label, [])
      grouped.get(label)!.push(r)
    }

    return Array.from(grouped.entries()).map(([technique, rows]) => {
      const avg = (key: keyof PrivacyResultSummary) =>
        rows.reduce((sum, r) => sum + Number(r[key]), 0) / rows.length

      return {
        technique,
        utility_score: Number(avg("utility_score").toFixed(2)),
        privacy_score: Number(avg("privacy_score").toFixed(2)),
        processing_time_seconds: Number(avg("processing_time_seconds").toFixed(4)),
        count: rows.length,
      }
    })
  }, [results])

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">Comparison Dashboard</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Average utility, privacy, and processing time across all hospitals,
        grouped by privacy technique.
      </p>

      {error && <p className="text-sm text-destructive mb-4">{error}</p>}

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : results.length === 0 ? (
        <p className="text-muted-foreground">
          No privacy results logged yet. Use the technique pages to generate
          some data first.
        </p>
      ) : (
        <>
          <div className="h-80 w-full mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="technique" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="utility_score" fill="var(--chart-1)" name="Utility Score" />
                <Bar dataKey="privacy_score" fill="var(--chart-2)" name="Privacy Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <h2 className="text-lg font-medium mb-2">Average Processing Time</h2>
          <div className="h-64 w-full mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="technique" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="processing_time_seconds"
                  fill="var(--chart-3)"
                  name="Processing Time (s)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <h2 className="text-lg font-medium mb-2">Raw Results</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Technique</TableHead>
                <TableHead>Utility Score</TableHead>
                <TableHead>Privacy Score</TableHead>
                <TableHead>Processing Time (s)</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.technique_display}</TableCell>
                  <TableCell>{r.utility_score}</TableCell>
                  <TableCell>{r.privacy_score}</TableCell>
                  <TableCell>{r.processing_time_seconds}</TableCell>
                  <TableCell>{new Date(r.created_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </div>
  )
}