import { Link, useSearchParams } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowRight, ArrowUpRight, SearchX, Sparkles, Recycle, ShieldCheck, Zap } from "lucide-react"
import { useListings } from "@/hooks/useListings"
import { ProductGrid } from "@/components/listings/ProductGrid"
import { PageLoader } from "@/components/ui/Spinner"
import { ErrorState } from "@/components/ui/ErrorState"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { useCategories } from "@/hooks/useCategories"
import { Aurora } from "@/components/motion/Aurora"
import { Marquee } from "@/components/motion/Marquee"
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal"

const ease = [0.22, 1, 0.36, 1] as const

export function HomePage() {
  const [searchParams] = useSearchParams()
  const query = (searchParams.get("q") ?? "").trim()
  const activeCategory = (searchParams.get("category") ?? "").trim()
  const { listings, loading, error } = useListings(40, { search: query, category: activeCategory })
  const { categories } = useCategories()

  return (
    <div>
      {/* ===== HERO — dark aurora, awwwards-style typography ===== */}
      <section className="relative overflow-hidden">
        <Aurora dark />
        <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-14 sm:px-6 md:pb-20 md:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease }}
                className="flex flex-wrap items-center gap-2"
              >
                <Badge variant="glass"><Sparkles className="h-3 w-3" /> Circular marketplace</Badge>
                <Badge variant="glass"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> {listings.length || "Live"} finds nearby</Badge>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.9, delay: 0.08, ease }}
                className="mt-6 font-display text-[44px] font-bold leading-[0.98] tracking-[-0.04em] text-white sm:text-6xl lg:text-[76px]"
              >
                Good things
                <span className="block">
                  deserve a{" "}
                  <span className="font-serif font-normal italic tracking-normal text-lime">second life.</span>
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.22, ease }}
                className="mt-5 max-w-xl text-base leading-relaxed text-white/65 md:text-lg"
              >
                Buy and sell pre-loved phones, laptops, furniture and cycles — directly from people around you.
                No landfill, just great deals.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.32, ease }}
                className="mt-8 flex flex-wrap items-center gap-3"
              >
                <Link to="/sell">
                  <Button size="lg" className="rounded-2xl">
                    Sell something <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <a
                  href="#listings"
                  className="inline-flex h-12 items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 text-[15px] font-semibold text-white backdrop-blur transition-all hover:bg-white/20"
                >
                  Browse listings <ArrowUpRight className="h-4 w-4" />
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.45 }}
                className="mt-10 flex flex-wrap gap-x-8 gap-y-3"
              >
                {[
                  { icon: ShieldCheck, label: "Buyer protection" },
                  { icon: Recycle, label: "Circular by design" },
                  { icon: Zap, label: "Live local inventory" },
                ].map(({ icon: Icon, label }) => (
                  <span key={label} className="inline-flex items-center gap-2 text-[13px] font-medium text-white/55">
                    <Icon className="h-4 w-4 text-lime" /> {label}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* floating collage */}
            <div className="relative hidden lg:block">
              <motion.div
                initial={{ opacity: 0, scale: 0.94, rotate: 2 }}
                animate={{ opacity: 1, scale: 1, rotate: 1.5 }}
                transition={{ duration: 1, delay: 0.25, ease }}
                className="relative overflow-hidden rounded-[28px] border border-white/15 shadow-pop"
              >
                <img
                  src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=900&q=80&auto=format&fit=crop"
                  alt="Pre-loved marketplace finds"
                  className="aspect-[4/5] w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent" />
                <div className="absolute inset-x-4 bottom-4 flex items-center justify-between">
                  <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-ink-950 shadow">Fresh finds daily</span>
                  <span className="rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">Near you</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.5, ease }}
                className="absolute -left-10 top-8 animate-float rounded-2xl border border-white/15 bg-white/10 p-3 pr-5 backdrop-blur-xl"
              >
                <div className="flex items-center gap-3">
                  <img src="https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&q=60&auto=format&fit=crop" alt="" className="h-12 w-12 rounded-xl object-cover" />
                  <div>
                    <div className="text-sm font-bold text-white">iPhone 15 · ₹58,000</div>
                    <div className="text-xs text-white/60">Like new · Mumbai</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.65, ease }}
                className="absolute -bottom-6 -left-6 animate-float-slow rounded-2xl border border-white/15 bg-ink-950/80 p-4 backdrop-blur-xl"
              >
                <div className="font-display text-2xl font-bold text-lime">−38%</div>
                <div className="text-xs text-white/60">avg. vs new price</div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* ticker */}
        <div className="relative border-t border-white/10 bg-black/20 py-3.5 backdrop-blur">
          <Marquee speed={30} className="text-[13px] font-semibold uppercase tracking-[0.2em] text-white/50">
            {["Phones", "Laptops", "Sofas", "Cycles", "Cameras", "Audio", "Furniture", "Watches"].map((w) => (
              <span key={w} className="mx-6 inline-flex items-center gap-6">
                {w} <span className="text-lime">✦</span>
              </span>
            ))}
          </Marquee>
        </div>
      </section>

      {/* ===== LISTINGS ===== */}
      <section id="listings" className="mx-auto max-w-7xl scroll-mt-28 px-4 py-10 sm:px-6 md:py-14">
        {(query || activeCategory) && (
          <Reveal className="mb-6 flex items-center justify-between rounded-2xl border bg-card p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary">
                <SearchX className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">
                  {query ? `Results for “${query}”` : `${activeCategory} listings`}
                </h2>
                <p className="text-xs text-muted-foreground">{listings.length} listings found</p>
              </div>
            </div>
            <Link to="/" className="text-sm font-semibold text-primary hover:underline">Clear</Link>
          </Reveal>
        )}

        {categories.length > 0 && (
          <Reveal className="mb-8">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-sm font-bold uppercase tracking-[0.14em] text-muted-foreground">Popular categories</h3>
              <Link to="/sell" className="text-xs font-semibold text-primary hover:underline">Sell something →</Link>
            </div>
            <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
              <Link
                to="/"
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${!activeCategory ? "border-ink-950 bg-ink-950 text-white dark:border-white dark:bg-white dark:text-ink-950" : "bg-card hover:border-primary/40"}`}
              >
                All
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  to={`/?category=${encodeURIComponent(c.slug)}`}
                  className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-all ${activeCategory === c.slug ? "border-ink-950 bg-ink-950 text-white dark:border-white dark:bg-white dark:text-ink-950" : "bg-card hover:border-primary/40"}`}
                >
                  {c.icon && <span className="mr-1.5">{c.icon}</span>}{c.name}
                </Link>
              ))}
            </div>
          </Reveal>
        )}

        <Reveal className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Fresh drops</p>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-tight md:text-3xl">
              {query || activeCategory ? "Search results" : <>Latest <span className="font-serif font-normal italic">listings</span></>}
            </h2>
          </div>
          <div className="hidden items-center gap-2 text-xs font-medium text-muted-foreground sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live inventory
          </div>
        </Reveal>

        {loading && <PageLoader label="Curating fresh finds…" />}
        {!loading && error && <ErrorState message="Something went wrong. Please try again." onRetry={() => window.location.reload()} />}
        {!loading && !error && <ProductGrid listings={listings} />}

        {!loading && !error && listings.length > 0 && (
          <Reveal className="relative mt-12 overflow-hidden rounded-[28px] bg-ink-950 p-8 text-white md:p-10">
            <div className="pointer-events-none absolute inset-0" aria-hidden>
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-600/40 blur-[90px] animate-aurora" />
              <div className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-lime/15 blur-[90px]" />
            </div>
            <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-lime">Turn clutter into cash</p>
                <h3 className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl">
                  Got something to sell? <span className="font-serif font-normal italic text-white/80">List it in 2 minutes.</span>
                </h3>
                <p className="mt-2 max-w-md text-sm text-white/60">Smart category forms, photo uploads and instant publishing — no fees to start.</p>
              </div>
              <Stagger className="flex shrink-0 flex-wrap gap-3">
                <StaggerItem>
                  <Link to="/sell" className="inline-flex h-12 items-center gap-2 rounded-2xl bg-lime px-6 text-[15px] font-bold text-ink-950 transition-transform hover:scale-[1.03]">
                    Start selling <ArrowRight className="h-4 w-4" />
                  </Link>
                </StaggerItem>
              </Stagger>
            </div>
          </Reveal>
        )}
      </section>
    </div>
  )
}
