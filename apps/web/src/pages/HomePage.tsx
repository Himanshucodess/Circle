import { useMemo } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { useListings } from "@/hooks/useListings"
import { ProductGrid } from "@/components/listings/ProductGrid"
import { PageLoader } from "@/components/ui/Spinner"
import { ErrorState } from "@/components/ui/ErrorState"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { ArrowRight, Sparkles, ShieldCheck, Zap, SearchX } from "lucide-react"
import { Card } from "@/components/ui/card"

export function HomePage() {
  const [searchParams] = useSearchParams()
  const query = (searchParams.get("q") ?? "").toLowerCase().trim()
  const { listings, loading, error } = useListings(40)

  const filtered = useMemo(() => {
    if (!query) return listings
    return listings.filter(
      (l) =>
        l.title.toLowerCase().includes(query) ||
        l.category.name.toLowerCase().includes(query)
    )
  }, [listings, query])

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-violet-600 via-indigo-600 to-brand-600 text-white">
        {/* decorative */}
        <div className="absolute inset-0 bg-grid-white/[0.07] bg-[size:24px_24px]" />
        <div className="absolute -top-24 -right-24 w-[520px] h-[520px] bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[520px] h-[520px] bg-violet-300/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 py-14 md:py-20">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <Badge variant="secondary" className="bg-white/15 text-white border-white/20 backdrop-blur hover:bg-white/20 mb-4">
                <Sparkles className="w-3 h-3 mr-1" /> Schema-driven marketplace
              </Badge>
              <h1 className="text-4xl md:text-5xl font-display font-extrabold leading-[1.05] tracking-tight">
                Buy and sell
                <span className="block bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">things you love.</span>
              </h1>
              <p className="mt-4 text-white/80 text-base md:text-lg max-w-xl leading-relaxed">
                Secondhand made simple. Category-smart forms adapt instantly — add a Bicycle, Sneakers or Vinyl category without shipping a line of frontend code.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link to="/sell">
                  <Button size="lg" className="rounded-full bg-white text-brand-700 hover:bg-white/90 shadow-lg hover:shadow-xl">
                    Sell something <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/admin" className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 backdrop-blur px-5 py-2.5 text-sm font-medium hover:bg-white/15 transition-colors">
                  <ShieldCheck className="w-4 h-4" /> Admin panel
                </Link>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
                {[
                  { k: `${listings.length}+`, v: "Active listings" },
                  { k: "14+", v: "Reusable fields" },
                  { k: "100%", v: "Dynamic forms" },
                ].map((s) => (
                  <div key={s.v} className="rounded-2xl bg-white/10 backdrop-blur border border-white/10 p-3 text-center">
                    <div className="text-lg font-bold">{s.k}</div>
                    <div className="text-xs text-white/70">{s.v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden lg:block">
              <Card className="p-3 rotate-1 hover:rotate-0 transition-transform duration-500 shadow-2xl">
                <div className="rounded-xl overflow-hidden bg-muted aspect-[4/3] relative">
                  <img
                    src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=900&q=80&auto=format&fit=crop"
                    alt="marketplace"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className="bg-white rounded-full px-3 py-1.5 text-sm font-semibold shadow">From ₹1,999</span>
                    <span className="bg-black/70 backdrop-blur text-white rounded-full px-3 py-1 text-xs flex items-center gap-1"><Zap className="w-3 h-3" /> Instant publish</span>
                  </div>
                </div>
                <div className="p-3 pt-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500" />
                  <div>
                    <div className="text-sm font-semibold">Verified sellers</div>
                    <div className="text-xs text-muted-foreground">Trust & safety built-in</div>
                  </div>
                  <Badge className="ml-auto bg-emerald-100 text-emerald-700 border-0">Live</Badge>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-8 md:py-10">
        {query && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <SearchX className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">Results for “{query}”</h2>
                <p className="text-xs text-muted-foreground">{filtered.length} listings found</p>
              </div>
            </div>
            <Link to="/" className="text-sm font-medium text-primary hover:underline">Clear search</Link>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-display font-bold tracking-tight">
            {query ? "Search results" : "Latest Listings"}
          </h2>
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live inventory
          </div>
        </div>

        {loading && <ProductGrid listings={[]} loading />}
        {!loading && error && <ErrorState message={error} />}
        {!loading && !error && <ProductGrid listings={filtered} />}

        {!loading && !error && filtered.length > 0 && (
          <div className="mt-10 rounded-2xl border bg-gradient-to-r from-indigo-50 to-violet-50 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold">Got something to sell?</h3>
              <p className="text-sm text-muted-foreground">Turn your unused items into cash in under 2 minutes.</p>
            </div>
            <Link to="/sell" className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-6 py-2.5 text-sm font-medium hover:bg-primary/90 shadow">
              Start selling <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}
