import { useEffect, useState, useMemo } from "react"
import { Link, useParams } from "react-router-dom"
import { AdminLayout } from "./AdminLayout"
import {
  fetchAdminCategory,
  fetchAdminCategoryFields,
  fetchSchemaVersions,
  fetchFields,
  fetchDraftSchema,
  attachField,
  removeCategoryField,
  updateCategoryField,
  reorderCategoryFields,
  publishCategory,
  saveCategoryDraft,
  updateCategory,
  CategoryFieldAdmin,
  FieldAdmin,
  SchemaVersionAdmin,
} from "@/services/adminApi"
import { CategoryDto, CategorySchema } from "@marketplace/shared"
import { PageLoader } from "@/components/ui/Spinner"
import { ErrorState } from "@/components/ui/ErrorState"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/Input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { DynamicForm } from "@/components/forms/DynamicForm"
import { CreateFieldInline } from "./CreateFieldInline"
import {
  ChevronUp,
  ChevronDown,
  Settings2,
  Eye,
  Save,
  Rocket,
  Search,
  Plus,
  Trash2,
  GripVertical,
  Sparkles,
  AlertTriangle,
  Check,
  Layers,
  Clock,
  BadgeCheck,
  Pencil,
  X,
} from "lucide-react"

export function CategoryEditorPage() {
  const { id } = useParams<{ id: string }>()
  const [category, setCategory] = useState<CategoryDto | null>(null)
  const [categoryFields, setCategoryFields] = useState<CategoryFieldAdmin[]>([])
  const [versions, setVersions] = useState<SchemaVersionAdmin[]>([])
  const [allFields, setAllFields] = useState<FieldAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [previewSchema, setPreviewSchema] = useState<CategorySchema | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [activeField, setActiveField] = useState<CategoryFieldAdmin | null>(null)
  const [editMeta, setEditMeta] = useState(false)
  const [tab, setTab] = useState("fields")
  const [fieldSearch, setFieldSearch] = useState("")
  const [addSearch, setAddSearch] = useState("")

  const load = async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const [cat, fields, vers, allF] = await Promise.all([
        fetchAdminCategory(id),
        fetchAdminCategoryFields(id),
        fetchSchemaVersions(id),
        fetchFields(),
      ])
      setCategory(cat)
      setCategoryFields(fields)
      setVersions(vers)
      setAllFields(allF)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  // fetch preview when tab becomes preview
  useEffect(() => {
    if (tab === "preview" && id) {
      setPreviewLoading(true)
      fetchDraftSchema(id)
        .then((draft: any) => {
          const schema: CategorySchema = {
            category: draft.category,
            schemaVersionId: draft.draftVersion ? `draft-${draft.draftVersion}` : "draft",
            version: draft.draftVersion ?? 0,
            fields: draft.fields ?? [],
          }
          setPreviewSchema(schema)
        })
        .catch((e: any) => setError(e.message))
        .finally(() => setPreviewLoading(false))
    }
  }, [tab, id])

  const availableFields = useMemo(
    () => allFields.filter((f) => !categoryFields.some((cf) => cf.fieldId === f.id)),
    [allFields, categoryFields]
  )

  const filteredAvailable = useMemo(
    () => availableFields.filter((f) => !addSearch || f.label.toLowerCase().includes(addSearch.toLowerCase()) || f.key.includes(addSearch.toLowerCase())),
    [availableFields, addSearch]
  )

  const filteredCategoryFields = useMemo(
    () => categoryFields.filter((cf) => !fieldSearch || cf.field.label.toLowerCase().includes(fieldSearch.toLowerCase()) || cf.field.key.includes(fieldSearch.toLowerCase())),
    [categoryFields, fieldSearch]
  )

  const reorder = async (index: number, dir: -1 | 1) => {
    const target = index + dir
    if (target < 0 || target >= categoryFields.length) return
    const next = categoryFields.slice()
    const [item] = next.splice(index, 1)
    next.splice(target, 0, item)
    setCategoryFields(next)
    try {
      await reorderCategoryFields(id!, next.map((cf) => cf.fieldId))
    } catch (e: any) {
      setNotice(e.message)
      load()
    }
  }

  const toggleRequired = async (cf: CategoryFieldAdmin) => {
    const updated = await updateCategoryField(id!, cf.fieldId, { isRequired: !cf.isRequired })
    setCategoryFields((arr) => arr.map((x) => (x.fieldId === cf.fieldId ? updated : x)))
  }

  const onRemove = async (cf: CategoryFieldAdmin) => {
    await removeCategoryField(id!, cf.fieldId)
    setCategoryFields((arr) => arr.filter((x) => x.fieldId !== cf.fieldId))
    setNotice("Field removed from category.")
  }

  const onAttach = async (fieldId: string) => {
    try {
      const created = await attachField(id!, fieldId)
      setCategoryFields((arr) => [...arr, created])
      setAddOpen(false)
      setNotice("Field added — remember to Save Draft and Publish.")
    } catch (e: any) {
      setError(e.message)
    }
  }

  const onPreviewModal = async () => {
    setPreviewLoading(true)
    try {
      const draft: any = await fetchDraftSchema(id!)
      const schema: CategorySchema = {
        category: draft.category,
        schemaVersionId: draft.draftVersion ? `draft-${draft.draftVersion}` : "draft",
        version: draft.draftVersion ?? 0,
        fields: draft.fields ?? [],
      }
      setPreviewSchema(schema)
      // also open modal via state, but preview tab exists
    } catch (e: any) {
      setError(e.message)
    } finally {
      setPreviewLoading(false)
    }
  }

  const onSaveDraft = async () => {
    setSaving(true)
    try {
      await saveCategoryDraft(id!)
      setNotice("Draft saved — ready to preview or publish.")
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const onPublish = async () => {
    setSaving(true)
    try {
      await publishCategory(id!)
      setNotice("Schema published! Sellers now see the latest version.")
      load()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const onRemoveConditional = async (cf: CategoryFieldAdmin) => {
    await updateCategoryField(id!, cf.fieldId, { conditionalRule: null })
    setCategoryFields((arr) => arr.map((x) => (x.fieldId === cf.fieldId ? { ...x, conditionalRule: null } : x)))
  }

  if (loading)
    return (
      <AdminLayout>
        <PageLoader label="Loading category..." />
      </AdminLayout>
    )
  if (error && !category)
    return (
      <AdminLayout>
        <ErrorState message={error} onRetry={load} />
      </AdminLayout>
    )

  return (
    <AdminLayout>
      <Link to="/admin/categories" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
        ← Back to categories
      </Link>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
        <div className="flex gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white flex items-center justify-center text-2xl shadow-md shrink-0">
            {category?.icon}
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold tracking-tight flex items-center gap-2">
              {category?.name}
              <Badge variant={category?.status === "ACTIVE" ? "green" : "neutral"}>{category?.status}</Badge>
            </h1>
            <p className="text-sm text-muted-foreground font-mono">/{category?.slug}</p>
            {category?.description && <p className="text-sm text-muted-foreground mt-1 max-w-xl">{category.description}</p>}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="rounded-full" onClick={() => setEditMeta(true)}>
            <Pencil className="w-4 h-4" /> Edit
          </Button>
          <Button variant="outline" className="rounded-full" onClick={onPreviewModal} loading={previewLoading}>
            <Eye className="w-4 h-4" /> Preview
          </Button>
          <Button variant="outline" className="rounded-full" onClick={onSaveDraft} loading={saving}>
            <Save className="w-4 h-4" /> Save Draft
          </Button>
          <Button className="rounded-full shadow-md" onClick={onPublish} loading={saving}>
            <Rocket className="w-4 h-4" /> Publish
          </Button>
        </div>
      </div>

      {notice && (
        <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm px-4 py-3 flex items-center justify-between">
          <span className="flex items-center gap-2"><Check className="w-4 h-4" /> {notice}</span>
          <button className="p-1 rounded-full hover:bg-emerald-100" onClick={() => setNotice(null)}><X className="w-4 h-4" /></button>
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 flex gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="fields"><Layers className="w-4 h-4 mr-1.5" /> Fields ({categoryFields.length})</TabsTrigger>
              <TabsTrigger value="preview"><Eye className="w-4 h-4 mr-1.5" /> Preview</TabsTrigger>
              <TabsTrigger value="versions"><Clock className="w-4 h-4 mr-1.5" /> Versions</TabsTrigger>
            </TabsList>

            <TabsContent value="fields">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-base">Fields in this category</CardTitle>
                      <CardDescription className="mt-1">Drag to reorder, mark required, add conditional logic. Sellers see fields in this order.</CardDescription>
                    </div>
                    <Button className="rounded-full shrink-0" onClick={() => setAddOpen(true)}>
                      <Plus className="w-4 h-4" /> Add Field
                    </Button>
                  </div>
                  <div className="relative mt-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      value={fieldSearch}
                      onChange={(e) => setFieldSearch(e.target.value)}
                      placeholder="Search fields by label or key…"
                      className="w-full h-9 pl-9 pr-3 rounded-full bg-muted border-0 text-sm focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {categoryFields.length === 0 ? (
                    <div className="border border-dashed rounded-xl p-10 text-center">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                        <Layers className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold">No fields yet</h3>
                      <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">Every great listing starts with structured fields. Add an existing field or create a new one for this category.</p>
                      <Button className="rounded-full mt-4" onClick={() => setAddOpen(true)}><Plus className="w-4 h-4" /> Add your first field</Button>
                    </div>
                  ) : filteredCategoryFields.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">No fields match “{fieldSearch}”.</p>
                  ) : (
                    <div className="space-y-2">
                      {filteredCategoryFields.map((cf) => {
                        const realIndex = categoryFields.findIndex((x) => x.id === cf.id)
                        return (
                          <div
                            key={cf.id}
                            className="group flex items-center gap-3 rounded-xl border bg-card p-3 hover:border-primary/30 hover:shadow-sm transition-all"
                          >
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => reorder(realIndex, -1)}
                                className="w-6 h-6 rounded-md hover:bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30"
                                disabled={realIndex === 0}
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => reorder(realIndex, 1)}
                                className="w-6 h-6 rounded-md hover:bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30"
                                disabled={realIndex === categoryFields.length - 1}
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="hidden sm:flex w-7 h-7 rounded-lg bg-muted items-center justify-center text-muted-foreground">
                              <GripVertical className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="font-medium text-sm">{cf.field.label}</span>
                                <Badge variant="secondary" className="font-mono text-[11px]">{cf.field.type}</Badge>
                                {cf.isRequired && <Badge variant="red">required</Badge>}
                                {cf.conditionalRule && <Badge variant="amber">conditional</Badge>}
                              </div>
                              <div className="text-xs text-muted-foreground font-mono">key: {cf.field.key}</div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Button variant="ghost" size="sm" className="rounded-full h-7 px-2.5" onClick={() => setActiveField(cf)}>
                                <Settings2 className="w-3.5 h-3.5" /> Edit
                              </Button>
                              <Button
                                variant={cf.isRequired ? "secondary" : "outline"}
                                size="sm"
                                className="rounded-full h-7 px-2.5 hidden sm:inline-flex"
                                onClick={() => toggleRequired(cf)}
                              >
                                {cf.isRequired ? "Required" : "Optional"}
                              </Button>
                              <Button variant="ghost" size="sm" className="rounded-full h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => onRemove(cf)}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Eye className="w-4 h-4 text-primary" /> Seller preview</CardTitle>
                  <CardDescription>This is exactly what sellers will see for {category?.name}. Conditional logic runs live.</CardDescription>
                </CardHeader>
                <CardContent>
                  {previewLoading && <PageLoader label="Loading preview..." />}
                  {!previewLoading && previewSchema && (
                    <div className="rounded-xl border bg-muted/20 p-4">
                      <DynamicForm schema={previewSchema} onSubmit={() => {}} submitLabel="Preview — submit disabled" />
                      <p className="text-xs text-muted-foreground mt-3 text-center">This preview is read-only. Save Draft to update it.</p>
                    </div>
                  )}
                  {!previewLoading && !previewSchema && (
                    <div className="text-sm text-muted-foreground py-8 text-center border border-dashed rounded-xl">No draft yet. Add fields and hit Save Draft.</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="versions">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Clock className="w-4 h-4" /> Schema Versions</CardTitle>
                  <CardDescription>Publish creates an immutable snapshot. Old listings stay pinned to their version.</CardDescription>
                </CardHeader>
                <CardContent>
                  {versions.length === 0 ? (
                    <div className="border border-dashed rounded-xl p-8 text-center">
                      <p className="text-sm text-muted-foreground">No schema versions yet. Publish to create one.</p>
                      <Button className="rounded-full mt-3" onClick={onPublish}><Rocket className="w-4 h-4" /> Publish now</Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {versions.map((v) => (
                        <div key={v.id} className="flex items-center justify-between p-3 rounded-xl border hover:bg-accent/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${v.status === "PUBLISHED" ? "bg-emerald-500 text-white" : v.status === "DRAFT" ? "bg-amber-500 text-white" : "bg-muted text-muted-foreground"}`}>
                              v{v.version}
                            </div>
                            <div>
                              <div className="text-sm font-medium flex items-center gap-2">
                                v{v.version}
                                {v.status === "PUBLISHED" && <BadgeCheck className="w-4 h-4 text-emerald-600" />}
                              </div>
                              <div className="text-xs text-muted-foreground">{v.publishedAt ? new Date(v.publishedAt).toLocaleString() : "Not published"}</div>
                            </div>
                          </div>
                          <Badge variant={v.status === "PUBLISHED" ? "green" : v.status === "DRAFT" ? "amber" : "neutral"}>{v.status}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Category Info</CardTitle>
                <Button variant="ghost" size="sm" className="h-7 rounded-full" onClick={() => setEditMeta(true)}><Pencil className="w-3 h-3" /> Edit</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="font-medium">{category?.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Slug</span><span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">/{category?.slug}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Icon</span><span className="text-lg">{category?.icon}</span></div>
              <div className="flex justify-between items-center"><span className="text-muted-foreground">Status</span><Badge variant={category?.status === "ACTIVE" ? "green" : "neutral"}>{category?.status}</Badge></div>
              {category?.description && (
                <>
                  <Separator />
                  <div><span className="text-muted-foreground text-xs">Description</span><p className="mt-1 leading-relaxed">{category.description}</p></div>
                </>
              )}
              <Separator />
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-xl border bg-muted/30 p-3">
                  <div className="text-lg font-bold">{categoryFields.length}</div>
                  <div className="text-xs text-muted-foreground">Fields</div>
                </div>
                <div className="rounded-xl border bg-muted/30 p-3">
                  <div className="text-lg font-bold">{versions.filter((v) => v.status === "PUBLISHED").length}</div>
                  <div className="text-xs text-muted-foreground">Published</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white border-0">
            <CardContent className="p-5">
              <h3 className="font-semibold flex items-center gap-2"><Sparkles className="w-4 h-4" /> How publishing works</h3>
              <ol className="mt-3 space-y-2 text-sm text-white/85">
                <li className="flex gap-2"><span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs shrink-0">1</span> Add & order fields</li>
                <li className="flex gap-2"><span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs shrink-0">2</span> Save Draft → Preview</li>
                <li className="flex gap-2"><span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs shrink-0">3</span> Publish → live for sellers</li>
              </ol>
              <p className="text-xs text-white/70 mt-3">Old listings keep their snapshot. No breaking changes.</p>
            </CardContent>
          </Card>

          {categoryFields.some((cf) => cf.conditionalRule) && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Conditional fields</CardTitle>
                <CardDescription className="text-xs">These appear only when their rule is met.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {categoryFields.filter((cf) => cf.conditionalRule).map((cf) => (
                  <div key={cf.id} className="text-xs rounded-lg border bg-amber-50 border-amber-200 px-3 py-2">
                    <span className="font-medium">{cf.field.label}</span> shows when <span className="font-mono bg-white px-1 rounded border">{(cf.conditionalRule as any).field}</span> {(cf.conditionalRule as any).operator} <span className="font-medium">{String((cf.conditionalRule as any).value)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Add Field Dialog */}
      {addOpen && (
        <Dialog open onOpenChange={(o) => !o && setAddOpen(false)}>
          <DialogContent className="max-w-2xl p-0 overflow-hidden gap-0" onClose={() => setAddOpen(false)}>
            <DialogHeader className="p-6 pb-3">
              <DialogTitle className="flex items-center gap-2"><Plus className="w-5 h-5 text-primary" /> Add field to {category?.name}</DialogTitle>
              <DialogDescription>Attach an existing reusable field or create a brand-new one.</DialogDescription>
              <div className="relative mt-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={addSearch}
                  onChange={(e) => setAddSearch(e.target.value)}
                  placeholder="Search by label or key…"
                  className="w-full h-9 pl-9 pr-3 rounded-full bg-muted border-0 text-sm focus:ring-2 focus:ring-ring"
                />
              </div>
            </DialogHeader>

            <div className="px-6 pb-3 max-h-[45vh] overflow-auto space-y-2">
              {filteredAvailable.length === 0 ? (
                <div className="text-sm text-muted-foreground py-8 text-center border border-dashed rounded-xl">
                  {availableFields.length === 0 ? "All fields are already in this category." : `No fields match “${addSearch}”.`}
                </div>
              ) : (
                filteredAvailable.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => onAttach(f.id)}
                    className="w-full text-left flex items-center justify-between p-3 rounded-xl border hover:border-primary/40 hover:bg-accent/50 transition-colors"
                  >
                    <div>
                      <div className="font-medium text-sm flex items-center gap-2">
                        {f.label} <Badge variant="secondary" className="text-[11px]">{f.type}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">{f.key} • used in {f.usedBy ?? 0} cats</div>
                    </div>
                    <span className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-primary">Add <Plus className="w-3 h-3" /></span>
                  </button>
                ))
              )}
            </div>

            <div className="p-4 bg-muted/30 border-t flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground hidden sm:block">Can’t find what you need?</span>
              <Button
                variant="secondary"
                className="rounded-full w-full sm:w-auto"
                onClick={() => {
                  setAddOpen(false)
                  setCreateOpen(true)
                }}
              >
                <Sparkles className="w-4 h-4" /> Create New Field
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {createOpen && (
        <CreateFieldInline
          onCancel={() => setCreateOpen(false)}
          onCreated={async (fieldId) => {
            setCreateOpen(false)
            await onAttach(fieldId)
          }}
        />
      )}

      {activeField && (
        <EditCategoryFieldModal
          cf={activeField}
          categoryFields={categoryFields}
          onClose={() => setActiveField(null)}
          onSaved={(updated) => {
            setCategoryFields((arr) => arr.map((x) => (x.id === updated.id ? updated : x)))
            setActiveField(null)
          }}
          onRemoveConditional={onRemoveConditional}
        />
      )}

      {editMeta && category && (
        <EditCategoryMetaModal
          category={category}
          onClose={() => setEditMeta(false)}
          onSaved={async (values) => {
            const updated = await updateCategory(category.id, values)
            setCategory(updated)
            setEditMeta(false)
          }}
        />
      )}

      {previewSchema && tab !== "preview" && (
        <PreviewModal schema={previewSchema} onClose={() => setPreviewSchema(null)} />
      )}
    </AdminLayout>
  )
}

function EditCategoryFieldModal({
  cf,
  categoryFields,
  onClose,
  onSaved,
  onRemoveConditional,
}: {
  cf: CategoryFieldAdmin
  categoryFields: CategoryFieldAdmin[]
  onClose: () => void
  onSaved: (cf: CategoryFieldAdmin) => void
  onRemoveConditional: (cf: CategoryFieldAdmin) => void
}) {
  const { id } = useParams<{ id: string }>()
  const [isRequired, setIsRequired] = useState(cf.isRequired)
  const [condField, setCondField] = useState<string>(cf.conditionalRule?.field ?? "")
  const [condOp, setCondOp] = useState<string>(cf.conditionalRule?.operator ?? "equals")
  const [condValue, setCondValue] = useState<string>(
    cf.conditionalRule?.value !== undefined && cf.conditionalRule?.value !== null ? String(cf.conditionalRule.value) : ""
  )
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const sources = categoryFields.filter((x) => x.fieldId !== cf.fieldId)

  const save = async () => {
    if (!id) return
    setSaving(true)
    setErr(null)
    const hasCond = condField !== ""
    const conditionalRule = hasCond
      ? {
          field: condField,
          operator: condOp as any,
          value: condOp === "in" || condOp === "not_in" ? condValue.split(",").map((s) => s.trim()).filter(Boolean) : condValue,
        }
      : null
    try {
      const updated = await updateCategoryField(id, cf.fieldId, { isRequired, conditionalRule })
      onSaved(updated)
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg" onClose={onClose}>
        <DialogHeader>
          <DialogTitle>Edit “{cf.field.label}”</DialogTitle>
          <DialogDescription>Configure whether it’s required and when it should appear.</DialogDescription>
        </DialogHeader>
        {err && <div className="mb-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-2">{err}</div>}

        <label className="flex items-center gap-2 py-2 rounded-xl border px-3 cursor-pointer hover:bg-accent">
          <input type="checkbox" className="w-4 h-4 accent-primary" checked={isRequired} onChange={(e) => setIsRequired(e.target.checked)} />
          <span className="text-sm font-medium">Required field</span>
          <Badge variant={isRequired ? "red" : "neutral"} className="ml-auto">{isRequired ? "Required" : "Optional"}</Badge>
        </label>

        {cf.conditionalRule && (
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive mt-2" onClick={() => onRemoveConditional(cf)}>
            <Trash2 className="w-3.5 h-3.5" /> Remove conditional rule
          </Button>
        )}

        <div className="space-y-3 mt-4">
          <div>
            <Label>Show this field when…</Label>
            <p className="text-xs text-muted-foreground mb-2">Leave blank to always show. Source must be another field in this category.</p>
            <div className="space-y-2">
              <select className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" value={condField} onChange={(e) => setCondField(e.target.value)}>
                <option value="">Always show (no condition)</option>
                {sources.map((s) => (
                  <option key={s.fieldId} value={s.field.key}>{s.field.label} — {s.field.key}</option>
                ))}
              </select>
              {condField && (
                <div className="grid grid-cols-2 gap-2">
                  <select className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" value={condOp} onChange={(e) => setCondOp(e.target.value)}>
                    <option value="equals">equals</option>
                    <option value="not_equals">not equals</option>
                    <option value="in">is one of</option>
                    <option value="not_in">is not any of</option>
                  </select>
                  <Input placeholder={condOp === "in" || condOp === "not_in" ? "a, b, c" : "value"} value={condValue} onChange={(e) => setCondValue(e.target.value)} />
                </div>
              )}
              {(condOp === "in" || condOp === "not_in") && condField && (
                <p className="text-xs text-muted-foreground">Comma-separate multiple values.</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" className="rounded-full" onClick={onClose}>Cancel</Button>
          <Button onClick={save} loading={saving} className="rounded-full">Save changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function EditCategoryMetaModal({
  category,
  onClose,
  onSaved,
}: {
  category: CategoryDto
  onClose: () => void
  onSaved: (v: { name: string; slug: string; description?: string; icon?: string }) => void
}) {
  const [form, setForm] = useState({
    name: category.name,
    slug: category.slug,
    icon: category.icon ?? "",
    description: category.description ?? "",
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const save = async () => {
    setSaving(true)
    setErr(null)
    try {
      await onSaved(form)
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg" onClose={onClose}>
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription>Update the basic info shown to sellers and buyers.</DialogDescription>
        </DialogHeader>
        {err && <div className="mb-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-2">{err}</div>}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Slug</Label>
            <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Icon</Label>
            <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <textarea value={form.description} onChange={(e: any) => setForm({ ...form, description: e.target.value })} rows={3} className="flex min-h-[80px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" className="rounded-full" onClick={onClose}>Cancel</Button>
          <Button onClick={save} loading={saving} className="rounded-full">Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function PreviewModal({ schema, onClose }: { schema: CategorySchema; onClose: () => void }) {
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-auto" onClose={onClose}>
        <DialogHeader>
          <DialogTitle>Preview Seller Form</DialogTitle>
          <DialogDescription>{schema.category.icon} {schema.category.name} · Exactly what sellers will see.</DialogDescription>
        </DialogHeader>
        <DynamicForm schema={schema} onSubmit={() => {}} submitLabel="Submit (preview)" />
      </DialogContent>
    </Dialog>
  )
}


