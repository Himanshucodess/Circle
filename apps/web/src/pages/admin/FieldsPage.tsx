import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AdminLayout } from "./AdminLayout"
import { fetchFields, FieldAdmin } from "@/services/adminApi"
import { PageLoader } from "@/components/ui/Spinner"
import { ErrorState } from "@/components/ui/ErrorState"
import { EmptyState } from "@/components/ui/EmptyState"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Puzzle, Plus, Pencil, Sparkles, Hash, Type, List, Calendar } from "lucide-react"

const typeIcon: Record<string, any> = {
  TEXT: Type,
  TEXTAREA: Type,
  NUMBER: Hash,
  SELECT: List,
  RADIO: List,
  MULTI_SELECT: List,
  CHECKBOX: List,
  DATE: Calendar,
}

export function FieldsPage() {
  const navigate = useNavigate()
  const [fields, setFields] = useState<FieldAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")

  const load = async () => {
    setLoading(true)
    try {
      setFields(await fetchFields())
      setError(null)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = fields.filter((f) => {
    const matchesQ = !q || f.label.toLowerCase().includes(q.toLowerCase()) || f.key.includes(q.toLowerCase())
    const matchesType = typeFilter === "all" || f.type === typeFilter
    return matchesQ && matchesType
  })

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight flex items-center gap-2">
            <Puzzle className="w-6 h-6 text-primary" /> Fields
            <Badge variant="secondary" className="font-mono">{fields.length}</Badge>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Reusable field definitions — one field, many categories.</p>
        </div>
        <Button onClick={() => navigate("/admin/fields/new")} className="rounded-full shadow-sm"><Plus className="w-4 h-4" /> Create Field</Button>
      </div>

      <Card className="mb-6">
        <CardContent className="p-3 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search fields…" className="w-full h-9 pl-9 pr-3 rounded-full bg-muted border-0 text-sm focus:ring-2 focus:ring-ring" />
          </div>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="h-9 rounded-full border bg-background px-3 text-sm">
            <option value="all">All types</option>
            {["TEXT","TEXTAREA","NUMBER","SELECT","RADIO","CHECKBOX","MULTI_SELECT","DATE"].map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </CardContent>
      </Card>

      {loading && <PageLoader label="Loading fields..." />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && fields.length === 0 && (
        <EmptyState icon="🧩" title="No fields yet" description="Create reusable fields like Brand, Storage, RAM — attach them to any category." action={<Button onClick={() => navigate("/admin/fields/new")} className="rounded-full"><Sparkles className="w-4 h-4" /> Create first field</Button>} />
      )}

      {!loading && !error && fields.length > 0 && filtered.length === 0 && (
        <EmptyState icon={<Search className="w-6 h-6" />} title="No matches" description={`No fields match “${q}”.`} />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((f) => {
            const Icon = typeIcon[f.type] ?? Puzzle
            return (
              <Card key={f.id} className="group hover:shadow-md hover:-translate-y-0.5 transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-muted group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <Badge variant="secondary" className="font-mono text-[11px]">{f.type}</Badge>
                  </div>
                  <h3 className="font-semibold text-sm leading-tight">{f.label}</h3>
                  <p className="text-xs text-muted-foreground font-mono">key: {f.key}</p>
                  {f.description && <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{f.description}</p>}
                  <div className="mt-3 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs rounded-full bg-secondary px-2.5 py-1 font-medium">{f.usedBy} categories</span>
                    {f.config?.options && <span className="text-xs text-muted-foreground">{(f.config.options as any[]).length} options</span>}
                  </div>
                  <Button variant="outline" size="sm" className="w-full rounded-full mt-4" onClick={() => navigate(`/admin/fields/${f.id}`)}>
                    <Pencil className="w-3.5 h-3.5" /> Edit field
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </AdminLayout>
  )
}
