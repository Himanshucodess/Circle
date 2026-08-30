import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { getListing } from "@/services/listingApi"
import { createOffer } from "@/services/offerApi"
import { ListingDto } from "@marketplace/shared"
import { ProductImages } from "@/components/listings/ProductImages"
import { DynamicProductAttributes } from "@/components/listings/DynamicProductAttributes"
import { ConditionBadge } from "@/components/ui/Badge"
import { PageLoader } from "@/components/ui/Spinner"
import { ErrorState } from "@/components/ui/ErrorState"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { Separator } from "@/components/ui/separator"
import { PricingInsight } from "@/components/listings/PricingInsight"
import { MapPin, ShieldCheck, MessageCircle, Heart, Share2, ArrowLeft, Sparkles, Eye, HandCoins, Clock, User } from "lucide-react"

type DetailDto = ListingDto & { schema?: { fields: any[] }; pricingInsight?: any; offers?: any[]; viewCount: number; offerCount: number }

function timeAgo(date: string) {
  const d = new Date(date)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (diff < 60) return "just now"
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`
  return d.toLocaleDateString()
}

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [listing, setListing] = useState<DetailDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [offerAmount, setOfferAmount] = useState("")
  const [offerMessage, setOfferMessage] = useState("")
  const [offerError, setOfferError] = useState<string | null>(null)
  const [offerSuccess, setOfferSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const load = () => {
    if (!id) return
    setLoading(true)
    setError(null)
    getListing(id)
      .then((l) => setListing(l as DetailDto))
      .catch((e: any) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [id])

  const handleOffer = async () => {
    if (!listing) return
    setOfferError(null)
    setOfferSuccess(null)
    const amt = Number(offerAmount)
    if (!amt || amt <= 0) {
      setOfferError("Enter a valid amount greater than 0")
      return
    }
    setSubmitting(true)
    try {
      await createOffer(listing.id, { amount: amt, message: offerMessage || undefined })
      setOfferSuccess("Offer sent to seller!")
      setOfferAmount("")
      setOfferMessage("")
      // reload to get new count
      const updated = await getListing(listing.id)
      setListing(updated as DetailDto)
    } catch (e: any) {
      setOfferError(e.message || "Failed to send offer")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <PageLoader label="Loading listing..." />
  if (error || !listing) return <div className="max-w-6xl mx-auto px-4 py-8"><ErrorState message={error ?? "Listing not found"} onRetry={load} /></div>

  const fields = listing.schema?.fields ?? []

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to marketplace
      </Link>

      <nav className="hidden md:flex text-sm text-muted-foreground items-center gap-1.5 mb-6">
        <Link to="/" className="hover:text-primary">Home</Link>
        <span className="opacity-40">/</span>
        <span className="text-foreground font-medium">{listing.category.name}</span>
        <span className="opacity-40">/</span>
        <span className="truncate max-w-[260px]">{listing.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <Card className="overflow-hidden p-0">
            <ProductImages images={listing.images} alt={listing.title} />
          </Card>
          {/* Mobile pricing & offers below gallery on small screens */}
          <div className="lg:hidden mt-4 space-y-4">
            {listing.pricingInsight && <PricingInsight insight={listing.pricingInsight} />}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <ConditionBadge condition={listing.condition} />
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="w-3 h-3" /> {listing.category.icon} {listing.category.name}
                </Badge>
                <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" /> {listing.location}
                </span>
              </div>

              <h1 className="text-2xl font-display font-bold leading-tight">{listing.title}</h1>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <span>{listing.condition.replace(/_/g, " ").toLowerCase()} · {listing.location}</span>
                <span>·</span>
                <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {timeAgo(listing.createdAt)}</span>
              </div>
              <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Eye className="w-3 h-3" /> {listing.viewCount} views</span>
                <span>·</span>
                <span className="inline-flex items-center gap-1"><HandCoins className="w-3 h-3" /> {listing.offerCount ?? 0} offers</span>
              </div>

              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-3xl font-extrabold tracking-tight">₹{listing.price.toLocaleString()}</span>
              </div>

              {listing.pricingInsight && (
                <div className="hidden lg:block mt-4">
                  <PricingInsight insight={listing.pricingInsight} />
                </div>
              )}

              <div className="mt-5 flex gap-2">
                <Button className="flex-1 rounded-full h-11" onClick={() => document.getElementById('offer-section')?.scrollIntoView({ behavior: 'smooth' })}>
                  <HandCoins className="w-4 h-4" /> Make an Offer
                </Button>
                <Button variant="outline" size="icon" className="rounded-full h-11 w-11">
                  <Heart className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full h-11 w-11">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-xl p-3">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Buyer protection — 7-day return for “not as described”
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2"><User className="w-4 h-4" /> Seller</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-bold">S</div>
                <div>
                  <div className="text-sm font-medium">Verified seller</div>
                  <div className="text-xs text-muted-foreground">Usually responds within an hour · Mumbai</div>
                </div>
                <Button variant="outline" size="sm" className="ml-auto rounded-full"><MessageCircle className="w-4 h-4" /> Chat</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-base font-semibold">Product Details</h2>
            <Badge variant="outline" className="ml-auto text-xs">Schema v{listing.schemaVersion}</Badge>
          </div>
          <Separator className="mb-4" />
          <DynamicProductAttributes fields={fields} attributes={listing.attributes} />
          <p className="text-xs text-muted-foreground mt-6 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Attributes are validated against the published schema and pinned to this listing.
          </p>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
            {listing.description}
          </p>
          <div className="mt-4 text-xs text-muted-foreground flex items-center gap-2">
            <Clock className="w-3 h-3" /> Listed {timeAgo(listing.createdAt)} · {listing.viewCount} views · {listing.offerCount ?? 0} offers
          </div>
        </CardContent>
      </Card>

      <Card id="offer-section" className="mt-6">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-1 flex items-center gap-2"><HandCoins className="w-4 h-4 text-primary" /> Make an Offer</h3>
          <p className="text-sm text-muted-foreground mb-4">Propose a price — the seller can accept or counter. No account needed for demo.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input placeholder="Amount (₹)" type="number" value={offerAmount} onChange={(e) => setOfferAmount(e.target.value)} />
            <div className="sm:col-span-2">
              <Input placeholder="Message (optional) — e.g. Can we meet in Bandra?" value={offerMessage} onChange={(e) => setOfferMessage(e.target.value)} />
            </div>
          </div>
          {offerError && <p className="text-sm text-destructive mt-2">{offerError}</p>}
          {offerSuccess && <p className="text-sm text-emerald-600 mt-2">{offerSuccess}</p>}
          <Button className="mt-4 rounded-full" onClick={handleOffer} loading={submitting}>Send Offer</Button>
          <p className="text-xs text-muted-foreground mt-2">{listing.offerCount ?? 0} offers so far · Avg offer would show here</p>
          {listing.offers && listing.offers.length > 0 && (
            <div className="mt-4 border-t pt-4 space-y-2">
              <div className="text-sm font-medium">Recent offers</div>
              {listing.offers.map((o: any) => (
                <div key={o.id} className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/50">
                  <span>₹{o.amount.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">{o.status} · {timeAgo(o.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
