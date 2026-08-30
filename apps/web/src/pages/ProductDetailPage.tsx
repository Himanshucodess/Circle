import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { getListing } from "@/services/listingApi"
import { ListingDto } from "@marketplace/shared"
import { ProductImages } from "@/components/listings/ProductImages"
import { DynamicProductAttributes } from "@/components/listings/DynamicProductAttributes"
import { ConditionBadge } from "@/components/ui/Badge"
import { PageLoader } from "@/components/ui/Spinner"
import { ErrorState } from "@/components/ui/ErrorState"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, ShieldCheck, MessageCircle, Heart, Share2, ArrowLeft, Sparkles } from "lucide-react"

type DetailDto = ListingDto & { schema?: { fields: any[] } }

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [listing, setListing] = useState<DetailDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    if (!id) return
    getListing(id)
      .then((l) => {
        if (!cancelled) setListing(l as DetailDto)
      })
      .catch((e: any) => {
        if (!cancelled) setError(e.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) return <PageLoader label="Loading listing..." />
  if (error || !listing) return <div className="max-w-6xl mx-auto px-4 py-8"><ErrorState message={error ?? "Listing not found"} /></div>

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

              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-3xl font-extrabold tracking-tight">₹{listing.price.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground line-through">₹{(listing.price * 1.18).toFixed(0).toLocaleString()}</span>
                <Badge variant="green" className="ml-auto">18% off</Badge>
              </div>

              <div className="mt-5 flex gap-2">
                <Button className="flex-1 rounded-full h-11">
                  <MessageCircle className="w-4 h-4" /> Chat with seller
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
                Buyer protection enabled — 7-day return for “not as described”
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                {listing.description}
              </p>
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
    </div>
  )
}
