import { useState } from "react"
import { Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { useCategories } from "@/hooks/useCategories"
import { useCategorySchema } from "@/hooks/useCategorySchema"
import { DynamicForm } from "@/components/forms/DynamicForm"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { Select } from "@/components/ui/Select"
import { Button } from "@/components/ui/Button"
import { PageLoader } from "@/components/ui/Spinner"
import { ErrorState } from "@/components/ui/ErrorState"
import { EmptyState } from "@/components/ui/EmptyState"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/Badge"
import { createListing } from "@/services/listingApi"
import { requestCategory } from "@/services/categoryRequestApi"
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth"
import { CategoryDto, CategorySchema } from "@marketplace/shared"
import { formatAttributeValue } from "@/utils/formatValue"
import { ArrowLeft, ArrowRight, Check, Sparkles, Package, FileText, Layers, Eye, PartyPopper, ShieldCheck } from "lucide-react"

type Step = "category" | "common" | "category-info" | "review" | "success"

const steps: { key: Step; label: string; icon: any; desc: string }[] = [
  { key: "category", label: "Category", icon: Layers, desc: "Choose type" },
  { key: "common", label: "Details", icon: FileText, desc: "Basic info" },
  { key: "category-info", label: "Specs", icon: Package, desc: "Product info" },
  { key: "review", label: "Review", icon: Eye, desc: "Publish" },
]

interface CommonForm {
  title: string
  description: string
  price: number
  condition: string
  location: string
  imageUrl: string
}

const stepIndex: Record<Step, number> = {
  category: 0,
  common: 1,
  "category-info": 2,
  review: 3,
  success: 4,
}

export function SellPage() {
  const { categories, loading, error } = useCategories()
  const [step, setStep] = useState<Step>("category")
  const [category, setCategory] = useState<CategoryDto | null>(null)
  const [attributes, setAttributes] = useState<Record<string, unknown>>({})
  const [common, setCommon] = useState<CommonForm | null>(null)
  const [listingId, setListingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [requestOpen, setRequestOpen] = useState(false)
  const [requestForm, setRequestForm] = useState({ name: "", description: "", reason: "", exampleProducts: "" })
  const [requestMessage, setRequestMessage] = useState<string | null>(null)
  const [requestError, setRequestError] = useState<string | null>(null)
  const [requestSubmitting, setRequestSubmitting] = useState(false)
  const { user } = useUnifiedAuth() as any

  const { schema, loading: schemaLoading, error: schemaError } = useCategorySchema(category ? category.id : null)

  const commonForm = useForm<CommonForm>({
    mode: "onTouched",
    defaultValues: common ?? { title: "", description: "", price: 0, condition: "", location: "", imageUrl: "" },
  })

  const selectCategory = (c: CategoryDto) => {
    setCategory(c)
    setAttributes({})
    setStep("common")
  }

  const onCommonSubmit = (values: CommonForm) => {
    setCommon(values)
    setStep("category-info")
  }

  const onAttributesSubmit = (vals: Record<string, unknown>) => {
    setAttributes(vals)
    setStep("review")
  }

  const onPublish = async () => {
    if (!category || !common) return
    if (!user) { setSubmitError("Please sign in to publish a listing."); return }
    setSubmitting(true)
    setSubmitError(null)
    try {
      const images = common.imageUrl ? [{ url: common.imageUrl, displayOrder: 0 }] : []
      const listing = await createListing({
        categoryId: category.id,
        title: common.title,
        description: common.description,
        price: Number(common.price),
        condition: common.condition,
        location: common.location,
        images,
        attributes,
      })
      setListingId(listing.id)
      setStep("success")
    } catch (e: any) {
      setSubmitError(e.message || "Failed to publish your listing.")
    } finally {
      setSubmitting(false)
    }
  }

  const submitCategoryRequest = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!user) { setRequestError("Please sign in to request a category."); return }
    setRequestSubmitting(true); setRequestError(null)
    try { await requestCategory(requestForm); setRequestMessage("Category request submitted. We'll review it and make it available if approved."); setRequestForm({ name: "", description: "", reason: "", exampleProducts: "" }); setRequestOpen(false) }
    catch (e: any) { setRequestError(e.message || "Something went wrong.") }
    finally { setRequestSubmitting(false) }
  }

  const renderStepper = () => {
    if (step === "success") return null
    const current = stepIndex[step]
    const pct = ((current + 1) / steps.length) * 100
    return (
      <div className="mb-8">
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <ol className="mt-4 grid grid-cols-4 gap-2">
          {steps.map((s, i) => {
            const active = i === current
            const done = i < current
            const Icon = s.icon
            return (
              <li
                key={s.key}
                className={`flex items-center gap-2.5 rounded-xl border p-2.5 transition-colors ${
                  active ? "bg-primary text-primary-foreground border-primary shadow-sm" : done ? "bg-primary/10 border-primary/20 text-primary" : "bg-card text-muted-foreground"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${active ? "bg-white/20" : done ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <div className="hidden sm:block min-w-0">
                  <div className={`text-xs font-semibold leading-none ${active ? "text-white" : done ? "text-primary" : ""}`}>{s.label}</div>
                  <div className={`text-[11px] ${active ? "text-white/80" : "text-muted-foreground"}`}>{s.desc}</div>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    )
  }

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-10"><PageLoader label="Loading categories..." /></div>
  if (error) return <div className="max-w-3xl mx-auto px-4 py-10"><ErrorState message="Something went wrong. Please try again." onRetry={() => window.location.reload()} /></div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {renderStepper()}

      {step === "category" && (
        <section>
          <div className="mb-6">
            <Badge variant="secondary" className="mb-3 gap-1"><Sparkles className="w-3 h-3" /> Step 1 of 4</Badge>
            <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight">What are you selling?</h1>
            <p className="text-muted-foreground mt-1">Choose a category to get a smart form tailored to your item.</p>
          </div>

          {categories.length === 0 ? (
            <EmptyState icon="📦" title="No categories available right now" description="Please try again shortly." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => selectCategory(c)}
                  className="group text-left rounded-2xl border bg-card p-5 hover:border-primary/50 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-start gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-muted group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center text-2xl shrink-0 transition-colors">
                    {c.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold group-hover:text-primary transition-colors flex items-center gap-2">
                      {c.name} <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 translate-x-0 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{c.description}</div>
                    <div className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Ready to list
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
          <div className="mt-6 rounded-2xl border bg-card p-5">
            <h2 className="font-semibold">Can't find what you're selling?</h2>
            <p className="text-sm text-muted-foreground mt-1">Request a category and our team will review it.</p>
            {requestMessage && <p className="text-sm text-emerald-600 mt-3">{requestMessage}</p>}
            {!requestOpen ? <Button variant="outline" className="mt-4 rounded-full" onClick={() => setRequestOpen(true)}>Request a category</Button> : <form onSubmit={submitCategoryRequest} className="mt-4 space-y-3"><Input label="Category name" value={requestForm.name} onChange={(e) => setRequestForm({ ...requestForm, name: e.target.value })} required /><Textarea label="Description" value={requestForm.description} onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })} required /><Textarea label="Why do you need this category?" value={requestForm.reason} onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })} required /><Input label="Example products (optional)" value={requestForm.exampleProducts} onChange={(e) => setRequestForm({ ...requestForm, exampleProducts: e.target.value })} />{requestError && <p className="text-sm text-destructive">{requestError}</p>}<div className="flex gap-2"><Button type="submit" loading={requestSubmitting} className="rounded-full">Request category</Button><Button type="button" variant="ghost" onClick={() => setRequestOpen(false)}>Cancel</Button></div></form>}
          </div>
        </section>
      )}

      {step === "common" && (
        <section>
          <Button variant="ghost" size="sm" onClick={() => setStep("category")} className="mb-4 -ml-2">
            <ArrowLeft className="w-4 h-4" /> Back to categories
          </Button>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> Basic information</CardTitle>
              <CardDescription>These details are shared across all categories and appear on the marketplace card.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={commonForm.handleSubmit(onCommonSubmit)} className="space-y-5">
                <Input
                  label="Title"
                  id="title"
                  placeholder="e.g. iPhone 15 256GB — Excellent condition"
                  error={commonForm.formState.errors.title?.message}
                  {...commonForm.register("title", {
                    required: "Title is required",
                    minLength: { value: 5, message: "Title must be at least 5 characters" },
                  })}
                />
                <Textarea
                  label="Description"
                  id="description"
                  placeholder="Describe condition, reason for selling, defects, accessories included…"
                  error={commonForm.formState.errors.description?.message}
                  {...commonForm.register("description", {
                    required: "Description is required",
                    minLength: { value: 10, message: "Description must be at least 10 characters" },
                  })}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Price (₹)"
                    id="price"
                    type="number"
                    min={1}
                    error={commonForm.formState.errors.price?.message}
                    {...commonForm.register("price", {
                      required: "Price is required",
                      valueAsNumber: true,
                      min: { value: 1, message: "Price must be greater than 0" },
                    })}
                  />
                  <Select
                    label="Condition"
                    id="condition"
                    error={commonForm.formState.errors.condition?.message}
                    {...commonForm.register("condition", { required: "Condition is required" })}
                  >
                    <option value="">Select condition</option>
                    <option value="NEW">New</option>
                    <option value="LIKE_NEW">Like New</option>
                    <option value="GOOD">Good</option>
                    <option value="USED">Used</option>
                    <option value="FAIR">Fair</option>
                  </Select>
                </div>
                <Input
                  label="Location"
                  id="location"
                  placeholder="e.g. Mumbai, Bangalore"
                  error={commonForm.formState.errors.location?.message}
                  {...commonForm.register("location", { required: "Location is required" })}
                />
                <Input
                  label="Image URL"
                  id="imageUrl"
                  placeholder="https://…"
                  hint="Paste a direct image link. Sellers get better views with a clear photo."
                  {...commonForm.register("imageUrl")}
                />

                <div className="flex justify-end pt-2">
                  <Button type="submit" className="rounded-full px-6">
                    Continue <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </section>
      )}

      {step === "category-info" && category && (
        <section>
          <Button variant="ghost" size="sm" onClick={() => setStep("common")} className="mb-4 -ml-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl">{category.icon}</div>
                <div>
                  <CardTitle>Tell us more about your {category.name}</CardTitle>
                  <CardDescription>Fields below are dynamically generated from the published schema.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {schemaLoading && <PageLoader label="Loading category form..." />}
              {schemaError && <ErrorState message={schemaError} />}
              {!schemaLoading && !schemaError && schema && (
                <div className="space-y-6">
                  <DynamicForm
                    key={schema.schemaVersionId}
                    schema={schema}
                    defaultValues={attributes as Record<string, any>}
                    onSubmit={onAttributesSubmit}
                    submitLabel="Review listing"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      )}

      {step === "review" && category && common && (
        <ReviewStep
          category={category}
          schema={schema}
          common={common}
          attributes={attributes}
          submitting={submitting}
          error={submitError}
          onBack={() => setStep("category-info")}
          onPublish={onPublish}
        />
      )}

      {step === "success" && (
        <SuccessStep
          listingId={listingId}
          onSellAnother={() => {
            setStep("category")
            setCategory(null)
            setAttributes({})
            setCommon(null)
            setListingId(null)
          }}
        />
      )}
    </div>
  )
}

function ReviewStep({
  category,
  schema,
  common,
  attributes,
  submitting,
  error,
  onBack,
  onPublish,
}: {
  category: CategoryDto
  schema: CategorySchema | null
  common: CommonForm
  attributes: Record<string, unknown>
  submitting: boolean
  error: string | null
  onBack: () => void
  onPublish: () => void
}) {
  const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex items-start justify-between gap-6 py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  )

  return (
    <section>
      <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>
      <h1 className="text-2xl font-display font-bold tracking-tight">Review your listing</h1>
      <p className="text-muted-foreground mb-6">Make sure everything looks right before publishing.</p>

      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Basic information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            <Row label="Title" value={common.title} />
            <Row label="Price" value={`₹${Number(common.price).toLocaleString()}`} />
            <Row label="Condition" value={<Badge variant="secondary">{common.condition.replace(/_/g, " ")}</Badge>} />
            <Row label="Location" value={common.location} />
            <div className="py-3">
              <span className="text-sm text-muted-foreground block mb-1">Description</span>
              <p className="text-sm leading-relaxed whitespace-pre-line">{common.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {category.icon} {category.name} details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {(schema?.fields ?? []).map((field) => {
              const val = attributes[field.key]
              if (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0)) return null
              return <Row key={field.key} label={field.label} value={formatAttributeValue(field, val)} />
            })}
          </div>
        </CardContent>
      </Card>

      {error && <div className="mb-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3">{error}</div>}

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} disabled={submitting} className="rounded-full">
          Back
        </Button>
        <Button onClick={onPublish} loading={submitting} className="rounded-full px-6 shadow-md">
          {submitting ? "Publishing..." : "Publish Listing"} {!submitting && <Sparkles className="w-4 h-4" />}
        </Button>
      </div>
    </section>
  )
}

function SuccessStep({
  listingId,
  onSellAnother,
}: {
  listingId: string | null
  onSellAnother: () => void
}) {
  return (
    <Card className="text-center py-10 px-6 border-0 shadow-lg bg-gradient-to-b from-emerald-50 to-white">
      <div className="mx-auto w-20 h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg mb-6">
        <PartyPopper className="w-10 h-10" />
      </div>
      <h1 className="text-3xl font-display font-bold">Listing Published!</h1>
      <p className="text-muted-foreground mt-2 max-w-md mx-auto">Your product is now live on the marketplace and visible to buyers.</p>
      <div className="mt-3 inline-flex items-center gap-2 text-xs bg-emerald-100 text-emerald-700 rounded-full px-3 py-1">
        <ShieldCheck className="w-3.5 h-3.5" /> Protected by buyer protection
      </div>
      {listingId && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Link to={`/products/${listingId}`} className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-6 py-2.5 text-sm font-medium hover:bg-primary/90 shadow">
            View Listing
          </Link>
          <Link to="/" className="inline-flex items-center justify-center rounded-full border bg-background px-6 py-2.5 text-sm font-medium hover:bg-accent">
            Back to Marketplace
          </Link>
          <button className="text-sm text-muted-foreground hover:text-foreground px-4 py-2" onClick={onSellAnother}>
            Sell Another Item
          </button>
        </div>
      )}
    </Card>
  )
}
