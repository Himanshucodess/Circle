import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AdminLayout } from "./AdminLayout"
import {
  fetchAdminCategories,
  fetchAdminCategoryFields,
  createCategory,
  archiveCategory,
  CategoryFieldAdmin,
} from "@/services/adminApi"
import { CategoryDto } from "@marketplace/shared"
import { PageLoader } from "@/components/ui/Spinner"
import { ErrorState } from "@/components/ui/ErrorState"
import { EmptyState } from "@/components/ui/EmptyState"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/Badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, Layers, Sparkles, Plus, Trash2, Settings2, Eye, ArrowRight, Package, Grid3X3, List, AlertTriangle, Check } from "lucide-react"

const EMOJI_OPTIONS = ["📱","💻","🛋️","🚲","👟","🎸","📷","⌚","👜","👗","🎮","📚","🏠","🚗","⚽","🎧","🧳","🪑","🔌","💡"]

export function CategoriesPage() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [fieldCounts, setFieldCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [archiveTarget, setArchiveTarget] = useState<CategoryDto | null>(null)
  const [archiving, setArchiving] = useState(false)
  const [view, setView] = useState<"grid" | "table">("grid")
  const [q, setQ] = useState("")

  const load = async () => {
    setLoading(true)
    try {
      const cats = await fetchAdminCategories()
      setCategories(cats)
      const counts: Record<string, number> = {}
      await Promise.all(
        cats.map(async (c) => {
          try {
            const fields = await fetchAdminCategoryFields(c.id)
            counts[c.id] = (fields as CategoryFieldAdmin[]).length
          } catch {
            counts[c.id] = 0
          }
        })
      )
      setFieldCounts(counts)
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

  const onCreate = async (values: { name: string; slug: string; description: string; icon: string }) => {
    setCreating(true)
    setCreateError(null)
    try {
      const cat = await createCategory(values)
      setShowCreate(false)
      navigate(`/admin/categories/${cat.id}`)
    } catch (e: any) {
      setCreateError(e.message)
    } finally {
      setCreating(false)
    }
  }

  const onArchiveConfirmed = async (c: CategoryDto) => {
    setArchiving(true)
    try {
      await archiveCategory(c.id)
      setArchiveTarget(null)
      load()
    } catch (e: any) {
      setCreateError(e.message)
      setArchiveTarget(null)
    } finally {
      setArchiving(false)
    }
  }

  const filtered = categories.filter((c) => !q || c.name.toLowerCase().includes(q.toLowerCase()) || c.slug.includes(q.toLowerCase()))

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight flex items-center gap-2">
            Categories <Badge variant="secondary" className="font-mono">{categories.length}</Badge>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Create categories and curate their dynamic fields. Publishing is instant.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 rounded-full border bg-card p-1">
            <button onClick={() => setView("grid")} className={`w-8 h-8 rounded-full flex items-center justify-center ${view==="grid" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-accent"}`}><Grid3X3 className="w-4 h-4" /></button>
            <button onClick={() => setView("table")} className={`w-8 h-8 rounded-full flex items-center justify-center ${view==="table" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-accent"}`}><List className="w-4 h-4" /></button>
          </div>
          <Button onClick={() => setShowCreate(true)} className="rounded-full shadow-sm"><Plus className="w-4 h-4" /> Create Category</Button>
        </div>
      </div>

      {/* search */}
      <Card className="mb-6">
        <CardContent className="p-3 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search categories…" className="w-full h-9 pl-9 pr-3 rounded-full bg-muted border-0 text-sm focus:ring-2 focus:ring-ring" />
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> {filtered.length} results
          </div>
        </CardContent>
      </Card>

      {showCreate && (
        <CreateCategoryWizard
          onClose={() => { setShowCreate(false); setCreateError(null) }}
          onSubmit={onCreate}
          submitting={creating}
          serverError={createError}
        />
      )}

      {archiveTarget && (
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0"><AlertTriangle className="w-4 h-4" /></div>
              <div>
                <p className="font-medium text-sm">Archive “{archiveTarget.name}”?</p>
                <p className="text-sm text-muted-foreground">It will be hidden from sellers. Existing listings stay intact.</p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" className="rounded-full" onClick={() => setArchiveTarget(null)}>Cancel</Button>
              <Button variant="destructive" className="rounded-full" onClick={() => onArchiveConfirmed(archiveTarget)} loading={archiving}>Archive</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && <PageLoader label="Loading categories..." />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && categories.length === 0 && (
        <EmptyState
          icon={<Layers className="w-6 h-6" />}
          title="No categories yet"
          description="Create your first category — e.g. Bicycle or Sneakers — and attach fields like Brand, Size, Condition."
          action={<Button onClick={() => setShowCreate(true)} className="rounded-full"><Sparkles className="w-4 h-4" /> Create your first category</Button>}
        />
      )}

      {!loading && !error && categories.length > 0 && filtered.length === 0 && (
        <EmptyState icon={<Search className="w-6 h-6" />} title="No matches" description={`No categories match “${q}”.`} />
      )}

      {!loading && !error && filtered.length > 0 && view === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <Card key={c.id} className="group hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center text-xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {c.icon}
                  </div>
                  <Badge variant={c.status === "ACTIVE" ? "green" : "neutral"}>{c.status}</Badge>
                </div>
                <h3 className="font-semibold leading-tight">{c.name}</h3>
                <p className="text-xs text-muted-foreground font-mono">/{c.slug}</p>
                {c.description && <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{c.description}</p>}
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 font-medium"><Package className="w-3 h-3" /> {fieldCounts[c.id] ?? 0} fields</span>
                  <span className="text-muted-foreground">{c.status === "ACTIVE" ? "Live in store" : "Archived"}</span>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" className="flex-1 rounded-full" onClick={() => navigate(`/admin/categories/${c.id}`)}><Settings2 className="w-3.5 h-3.5" /> Manage</Button>
                  <Button size="sm" variant="outline" className="rounded-full" onClick={() => navigate(`/admin/categories/${c.id}`)}><Eye className="w-3.5 h-3.5" /> Preview</Button>
                  <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full" onClick={() => setArchiveTarget(c)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && !error && filtered.length > 0 && view === "table" && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fields</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-lg">{c.icon}</span>
                        <div>
                          <div className="font-medium text-sm">{c.name}</div>
                          <div className="text-xs text-muted-foreground font-mono">{c.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm">{fieldCounts[c.id] ?? 0}</td>
                    <td className="px-5 py-4"><Badge variant={c.status === "ACTIVE" ? "green" : "neutral"}>{c.status}</Badge></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="rounded-full" onClick={() => navigate(`/admin/categories/${c.id}`)}>Edit</Button>
                        <Button variant="ghost" size="sm" className="rounded-full" onClick={() => setArchiveTarget(c)}>Archive</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </AdminLayout>
  )
}

function CreateCategoryWizard({
  onClose,
  onSubmit,
  submitting,
  serverError,
}: {
  onClose: () => void
  onSubmit: (v: { name: string; slug: string; description: string; icon: string }) => void
  submitting: boolean
  serverError?: string | null
}) {
  const [step, setStep] = useState<1 | 2>(1)
  const [form, setForm] = useState({ name: "", slug: "", description: "", icon: "📦" })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")

  const next = () => {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = "Name is required"
    if (!form.slug.trim()) errs.slug = "Slug is required"
    if (form.slug && !/^[a-z0-9-]+$/.test(form.slug)) errs.slug = "Lowercase letters, numbers and dashes only"
    setErrors(errs)
    if (Object.keys(errs).length === 0) setStep(2)
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl p-0 overflow-hidden gap-0" onClose={onClose}>
        <div className="bg-gradient-to-br from-violet-600 to-indigo-600 p-6 text-white relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center mb-3"><Sparkles className="w-5 h-5" /></div>
            <DialogTitle className="text-white text-xl">Create a new category</DialogTitle>
            <DialogDescription className="text-white/80">Build a schema-driven category — no code, instant preview.</DialogDescription>
            <div className="mt-4 flex items-center gap-2">
              <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? "bg-white" : "bg-white/30"}`} />
              <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? "bg-white" : "bg-white/30"}`} />
            </div>
            <div className="mt-2 flex gap-4 text-xs font-medium">
              <span className={step === 1 ? "text-white" : "text-white/60"}>1. Details</span>
              <span className={step === 2 ? "text-white" : "text-white/60"}>2. Review</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {serverError && (
            <div className="mb-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 flex gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {serverError}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <Label>Category name</Label>
                  <Input
                    placeholder="e.g. Bicycle"
                    value={form.name}
                    onChange={(e) => {
                      const name = e.target.value
                      setForm((f) => ({ ...f, name, slug: f.slug === slugify(f.name) || !f.slug ? slugify(name) : f.slug }))
                    }}
                  />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                  <p className="text-xs text-muted-foreground">Keep it short and shopper-friendly.</p>
                </div>

                <div className="space-y-1.5">
                  <Label>URL slug</Label>
                  <div className="flex gap-2">
                    <span className="inline-flex items-center rounded-xl border bg-muted px-3 text-xs text-muted-foreground">/api/categories/</span>
                    <Input placeholder="bicycle" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} className="flex-1" />
                  </div>
                  {errors.slug ? <p className="text-xs text-destructive">{errors.slug}</p> : <p className="text-xs text-muted-foreground">Used in URLs and APIs. Auto-generates from name.</p>}
                </div>

                <div className="space-y-2">
                  <Label>Icon</Label>
                  <div className="grid grid-cols-10 gap-1.5">
                    {EMOJI_OPTIONS.map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, icon: em }))}
                        className={`w-9 h-9 rounded-xl border flex items-center justify-center text-lg hover:border-primary transition-colors ${form.icon === em ? "bg-primary text-primary-foreground border-primary shadow-sm scale-105" : "bg-card"}`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input placeholder="Or paste an emoji" value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} className="max-w-[180px]" />
                    <span className="text-xs text-muted-foreground">Preview: <span className="text-lg">{form.icon}</span> {form.name || "Your category"}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <Textarea placeholder="Short description shown on the seller page and cards." value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
                  <p className="text-xs text-muted-foreground">{form.description.length}/160 — clear descriptions improve conversion.</p>
                </div>
              </div>

              {/* live preview */}
              <div className="rounded-xl border bg-muted/30 p-3">
                <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1"><Eye className="w-3 h-3" /> Live preview</div>
                <div className="flex items-center gap-3 rounded-xl border bg-card p-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl">{form.icon || "📦"}</div>
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate">{form.name || "Category name"}</div>
                    <div className="text-xs text-muted-foreground truncate">/{form.slug || "slug"} • {form.description ? form.description.slice(0,60) : "Description will appear here"}</div>
                  </div>
                  <Badge variant="secondary" className="ml-auto hidden sm:inline-flex">Draft</Badge>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" className="rounded-full" onClick={onClose}>Cancel</Button>
                <Button className="rounded-full" onClick={next}>Continue <ArrowRight className="w-4 h-4" /></Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={submit} className="space-y-5">
              <div className="rounded-xl border bg-card p-4 space-y-3">
                <h4 className="font-semibold flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Review & create</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Name:</span> <span className="font-medium">{form.name}</span></div>
                  <div><span className="text-muted-foreground">Slug:</span> <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">/{form.slug}</span></div>
                  <div><span className="text-muted-foreground">Icon:</span> <span className="text-lg">{form.icon}</span></div>
                  <div><span className="text-muted-foreground">Status:</span> <Badge variant="green">ACTIVE</Badge></div>
                </div>
                {form.description && <p className="text-sm text-muted-foreground leading-relaxed">{form.description}</p>}
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 flex gap-2">
                  <Sparkles className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>After creation you’ll be taken to the field editor — add fields, reorder, set required/conditional rules, then <b>Publish</b> to make it live for sellers.</span>
                </div>
              </div>

              <div className="flex justify-between gap-2">
                <Button type="button" variant="outline" className="rounded-full" onClick={() => setStep(1)}>Back</Button>
                <Button type="submit" loading={submitting} className="rounded-full px-6">Create category</Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
