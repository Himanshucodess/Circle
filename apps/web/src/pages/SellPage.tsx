import { useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { useCategories } from "@/hooks/useCategories"
import { useCategorySchema } from "@/hooks/useCategorySchema"
import { DynamicForm } from "@/components/forms/DynamicForm"
import { ProductPhotoUploader, ProductPhoto } from "@/components/listings/ProductPhotoUploader"
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
import { ArrowLeft, ArrowRight, Check, Sparkles, Package, FileText, Layers, Eye, PartyPopper, ShieldCheck, ImagePlus } from "lucide-react"
import { Reveal } from "@/components/motion/Reveal"
import { cn } from "@/lib/utils"

type Step = "category" | "common" | "photos" | "category-info" | "review" | "success"

const steps: { key: Step; label: string; icon: any; desc: string }[] = [
  { key: "category", label: "Category", icon: Layers, desc: "Choose type" },
  { key: "common", label: "Details", icon: FileText, desc: "Basic info" },
  { key: "photos", label: "Photos", icon: ImagePlus, desc: "Add photos" },
  { key: "category-info", label: "Specs", icon: Package, desc: "Product info" },
  { key: "review", label: "Review", icon: Eye, desc: "Publish" },
]

interface CommonForm {
  title: string
  description: string
  price: number
  condition: string
  location: string
}

const stepIndex: Record<Step, number> = {
  category: 0,
  common: 1,
  photos: 2,
  "category-info": 3,
  review: 4,
  success: 5,
}

export function SellPage() {
  const { categories, loading, error } = useCategories()
  const [step, setStep] = useState<Step>("category")
  const [category, setCategory] = useState<CategoryDto | null>(null)
  const [attributes, setAttributes] = useState<Record<string, unknown>>({})
  const [common, setCommon] = useState<CommonForm | null>(null)
  const [photos, setPhotos] = useState<ProductPhoto[]>([])
  const [photosUploading, setPhotosUploading] = useState(false)
  const [photosReady, setPhotosReady] = useState(false)
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
    defaultValues: common ?? { title: "", description: "", price: 0, condition: "", location: "" },
  })

  const selectCategory = (c: CategoryDto) => {
    setCategory(c)
    setAttributes({})
    setStep("common")
  }

  const onCommonSubmit = (values: CommonForm) => {
    setCommon(values)
    setStep("photos")
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
      const listing = await createListing({
        categoryId: category.id,
        title: common.title,
        description: common.description,
        price: Number(common.price),
        condition: common.condition,
        location: common.location,
        images: photos.map((photo, displayOrder) => ({ url: photo.url, publicId: photo.publicId, uploadId: photo.id, displayOrder })),
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
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <span>Step {current + 1} of {steps.length}</span>
          <span>{Math.round(pct)}% complete</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-lime" animate={{ width: `${pct}%` }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} />
        </div>
        <ol className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {steps.map((s, i) => {
            const active = i === current
            const done = i < current
            const Icon = s.icon
            return (
              <li
                key={s.key}
                className={cn(
                  "flex items-center gap-2.5 rounded-2xl border p-2.5 transition-all",
                  active ? "border-ink-950 bg-ink-950 text-white shadow-card dark:border-white dark:bg-white dark:text-ink-950" : done ? "border-primary/30 bg-primary/10 text-primary" : "bg-card text-muted-foreground"
                )}
              >
                <div className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-xl", active ? "bg-white/20 dark:bg-ink-950/10" : done ? "bg-primary text-white" : "bg-muted")}>
                  {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <div className="hidden min-w-0 sm:block">
                  <div className="text-xs font-bold leading-none">{s.label}</div>
                  <div className={cn("mt-0.5 text-[11px]", active ? "opacity-70" : "text-muted-foreground")}>{s.desc}</div>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    )
  }

  if (loading) return <div className="mx-auto max-w-3xl px-4 py-10"><PageLoader label="Loading categories..." /></div>
  if (error) return <div className="mx-auto max-w-3xl px-4 py-10"><ErrorState message="Something went wrong. Please try again." onRetry={() => window.location.reload()} /></div>

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* sell hero strip */}
      {step === "category" && (
        <div className="relative mb-8 overflow-hidden rounded-[28px] bg-ink-950 p-7 text-white md:p-9">
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-violet-600/40 blur-[80px] animate-aurora" />
            <div className="absolute -bottom-20 left-1/4 h-48 w-48 rounded-full bg-lime/15 blur-[80px]" />
          </div>
          <div className="relative">
            <Badge variant="glass"><Sparkles className="h-3 w-3" /> List in under 2 minutes</Badge>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
              What are you <span className="font-serif font-normal italic text-lime">selling?</span>
            </h1>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/65">Pick a category and get a smart form tailored to your item — specs, photos, done.</p>
          </div>
        </div>
      )}

      {renderStepper()}

      {step === "category" && (
        <section>
          {categories.length === 0 ? (
            <EmptyState icon="📦" title="No categories available right now" description="Please try again shortly." />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {categories.map((c, i) => (
                <motion.button
                  key={c.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.05, 0.3), duration: 0.5 }}
                  onClick={() => selectCategory(c)}
                  className="group rounded-3xl border bg-card p-5 text-left shadow-card transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-pop"
                >
                  <div className="flex items-start gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet-500/15 to-indigo-500/15 text-2xl transition-all group-hover:from-violet-500 group-hover:to-indigo-500">
                      {c.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 font-display font-semibold transition-colors group-hover:text-primary">
                        {c.name} <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                      </div>
                      <div className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{c.description}</div>
                      <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Ready to list
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
          <Reveal className="mt-6 rounded-3xl border bg-card p-6 shadow-card">
            <h2 className="font-display font-bold">Can't find what you're selling?</h2>
            <p className="mt-1 text-sm text-muted-foreground">Request a category and our team will review it.</p>
            {requestMessage && <p className="mt-3 text-sm font-medium text-emerald-600">{requestMessage}</p>}
            {!requestOpen ? <Button variant="outline" className="mt-4 rounded-2xl" onClick={() => setRequestOpen(true)}>Request a category</Button> : <form onSubmit={submitCategoryRequest} className="mt-4 space-y-3"><Input label="Category name" value={requestForm.name} onChange={(e) => setRequestForm({ ...requestForm, name: e.target.value })} required /><Textarea label="Description" value={requestForm.description} onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })} required /><Textarea label="Why do you need this category?" value={requestForm.reason} onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })} required /><Input label="Example products (optional)" value={requestForm.exampleProducts} onChange={(e) => setRequestForm({ ...requestForm, exampleProducts: e.target.value })} />{requestError && <p className="text-sm font-medium text-destructive">{requestError}</p>}<div className="flex gap-2"><Button type="submit" loading={requestSubmitting} className="rounded-2xl">Request category</Button><Button type="button" variant="ghost" onClick={() => setRequestOpen(false)}>Cancel</Button></div></form>}
          </Reveal>
        </section>
      )}

      {step === "common" && (
        <section>
          <Button variant="ghost" size="sm" onClick={() => setStep("category")} className="mb-4 -ml-2">
            <ArrowLeft className="h-4 w-4" /> Back to categories
          </Button>
          <Card className="overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-violet-500 to-indigo-400" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Basic information</CardTitle>
              <CardDescription>Shared across all categories — this is what buyers see first.</CardDescription>
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
                  placeholder="Condition, reason for selling, defects, accessories included…"
                  error={commonForm.formState.errors.description?.message}
                  {...commonForm.register("description", {
                    required: "Description is required",
                    minLength: { value: 10, message: "Description must be at least 10 characters" },
                  })}
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                <div className="flex justify-end pt-2">
                  <Button type="submit" size="lg" className="rounded-2xl px-7">
                    Continue <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </section>
      )}

      {step === "photos" && (
        <section>
          <Button variant="ghost" size="sm" onClick={() => setStep("common")} className="mb-4 -ml-2" disabled={photosUploading}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <ProductPhotoUploader value={photos} onChange={setPhotos} onUploadingChange={setPhotosUploading} onReadyChange={setPhotosReady} />
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">At least one clear photo is required.</p>
            <Button size="lg" className="rounded-2xl px-7" disabled={!photosReady || photosUploading} onClick={() => setStep("category-info")}>
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </section>
      )}

      {step === "category-info" && category && (
        <section>
          <Button variant="ghost" size="sm" onClick={() => setStep("photos")} className="mb-4 -ml-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Card className="overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-lime to-emerald-300" />
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-xl text-primary">{category.icon}</div>
                <div>
                  <CardTitle>Tell us more about your {category.name}</CardTitle>
                  <CardDescription>Auto-generated from the published schema — no code needed.</CardDescription>
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
          photos={photos}
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
            setPhotos([])
            setPhotosReady(false)
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
  photos,
  attributes,
  submitting,
  error,
  onBack,
  onPublish,
}: {
  category: CategoryDto
  schema: CategorySchema | null
  common: CommonForm
  photos: ProductPhoto[]
  attributes: Record<string, unknown>
  submitting: boolean
  error: string | null
  onBack: () => void
  onPublish: () => void
}) {
  const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex items-start justify-between gap-6 py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-semibold">{value}</span>
    </div>
  )

  return (
    <section>
      <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>
      <h1 className="font-display text-3xl font-bold tracking-tight">Review your <span className="font-serif font-normal italic">listing</span></h1>
      <p className="mb-6 mt-1 text-muted-foreground">Make sure everything looks right before publishing.</p>

      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base"><FileText className="h-4 w-4 text-primary" /> Basic information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-dashed">
            <Row label="Title" value={common.title} />
            <Row label="Price" value={`₹${Number(common.price).toLocaleString()}`} />
            <Row label="Condition" value={<Badge variant="secondary">{common.condition.replace(/_/g, " ")}</Badge>} />
            <Row label="Location" value={common.location} />
            <div className="py-3">
              <span className="mb-1 block text-sm text-muted-foreground">Description</span>
              <p className="whitespace-pre-line text-sm leading-relaxed">{common.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><ImagePlus className="h-4 w-4 text-primary" /> Photos</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2">{photos.map((photo, index) => <div key={photo.id} className="relative aspect-square overflow-hidden rounded-2xl border"><img src={photo.url} alt={`Product photo ${index + 1}`} className="h-full w-full object-cover" />{index === 0 && <span className="absolute bottom-1 left-1 rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] font-bold">Primary</span>}</div>)}</div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {category.icon} {category.name} details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-dashed">
            {(schema?.fields ?? []).map((field) => {
              const val = attributes[field.key]
              if (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0)) return null
              return <Row key={field.key} label={field.label} value={formatAttributeValue(field, val)} />
            })}
          </div>
        </CardContent>
      </Card>

      {error && <div className="mb-4 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} disabled={submitting} className="rounded-2xl">
          Back
        </Button>
        <Button onClick={onPublish} loading={submitting} size="lg" className="rounded-2xl px-7 shadow-glow">
          {submitting ? "Publishing..." : "Publish listing"} {!submitting && <Sparkles className="h-4 w-4" />}
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
    <Card className="overflow-hidden border-0 bg-ink-950 px-6 py-12 text-center text-white shadow-pop">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -top-20 left-1/2 h-56 w-96 -translate-x-1/2 rounded-full bg-violet-600/40 blur-[90px]" />
      </div>
      <div className="relative">
        <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-emerald-400 text-ink-950 shadow-glow">
          <PartyPopper className="h-10 w-10" />
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight">Listing <span className="font-serif font-normal italic text-lime">live!</span></h1>
        <p className="mx-auto mt-2 max-w-md text-white/60">Your product is now on the marketplace and visible to buyers.</p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" /> Protected by buyer protection
        </div>
        {listingId && (
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to={`/products/${listingId}`} className="inline-flex h-12 items-center justify-center rounded-2xl bg-lime px-6 text-sm font-bold text-ink-950 transition-transform hover:scale-[1.03]">
              View listing
            </Link>
            <Link to="/" className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-6 text-sm font-semibold hover:bg-white/20">
              Back to marketplace
            </Link>
            <button className="px-4 py-2 text-sm text-white/60 hover:text-white" onClick={onSellAnother}>
              Sell another item
            </button>
          </div>
        )}
      </div>
    </Card>
  )
}
