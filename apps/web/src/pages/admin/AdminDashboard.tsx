import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { AdminLayout } from "./AdminLayout"
import { fetchStats, fetchAdminCategories } from "@/services/adminApi"
import { CategoryDto } from "@marketplace/shared"
import { PageLoader } from "@/components/ui/Spinner"
import { ErrorState } from "@/components/ui/ErrorState"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { ArrowRight, Layers, Sparkles, Puzzle, ShoppingBag, TrendingUp, Plus, Eye, Activity } from "lucide-react"

interface Stats {
  categories: number
  activeCategories: number
  fields: number
  listings: number
  publishedSchemas: number
  pendingRequests: number
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recent, setRecent] = useState<CategoryDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([fetchStats(), fetchAdminCategories()])
      .then(([s, cats]) => {
        if (!cancelled) {
          setStats(s)
          setRecent(cats.slice(0, 4))
        }
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
  }, [])

  const cards = [
    { label: "Total categories", value: stats?.categories ?? 0, icon: Layers, gradient: "from-violet-500 to-indigo-500", sub: `${stats?.activeCategories ?? 0} active` },
    { label: "Active categories", value: stats?.activeCategories ?? 0, icon: Activity, gradient: "from-emerald-500 to-teal-500", sub: "Live in seller flow" },
    { label: "Reusable fields", value: stats?.fields ?? 0, icon: Puzzle, gradient: "from-amber-500 to-orange-500", sub: "Attach anywhere" },
    { label: "Listings", value: stats?.listings ?? 0, icon: ShoppingBag, gradient: "from-pink-500 to-rose-500", sub: "Marketplace items" },
    { label: "Published schemas", value: stats?.publishedSchemas ?? 0, icon: ShoppingBag, gradient: "from-blue-500 to-cyan-500", sub: `${stats?.pendingRequests ?? 0} pending requests` },
  ]

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Welcome back — manage categories, fields and schemas without code.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/fields/new">
            <Button variant="outline" className="rounded-full"><Puzzle className="w-4 h-4" /> New field</Button>
          </Link>
          <Link to="/admin/categories">
            <Button className="rounded-full shadow-sm"><Plus className="w-4 h-4" /> Create Category</Button>
          </Link>
        </div>
      </div>

      {loading && <PageLoader label="Loading dashboard..." />}
      {!loading && error && <ErrorState message="Something went wrong. Please try again." onRetry={() => window.location.reload()} />}
      {!loading && !error && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {cards.map((c) => (
              <Card key={c.label} className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className={`h-1 w-full bg-gradient-to-r ${c.gradient}`} />
                  <div className="p-5">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${c.gradient} text-white flex items-center justify-center mb-3`}>
                      <c.icon className="w-4 h-4" />
                    </div>
                    <div className="text-2xl font-bold tracking-tight">{c.value}</div>
                    <div className="text-sm font-medium">{c.label}</div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {c.sub}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Recent Categories</CardTitle>
                <Link to="/admin/categories" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </CardHeader>
              <CardContent>
                {recent.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-8 text-center border border-dashed rounded-xl">No categories yet. Create your first to get started.</div>
                ) : (
                  <div className="space-y-2">
                    {recent.map((c) => (
                      <Link key={c.id} to={`/admin/categories/${c.id}`} className="flex items-center justify-between p-3 rounded-xl border hover:border-primary/30 hover:bg-accent/50 transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            {c.icon}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{c.name}</div>
                            <div className="text-xs text-muted-foreground">/{c.slug} · {c.status}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={c.status === "ACTIVE" ? "green" : "neutral"} className="hidden sm:inline-flex">{c.status}</Badge>
                          <span className="w-7 h-7 rounded-full bg-background border flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white border-0 overflow-hidden relative">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <CardContent className="p-6 relative">
                  <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center mb-3">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold">Ship a new category in 60 seconds</h3>
                  <p className="text-sm text-white/80 mt-1 leading-relaxed">No code. Pick an icon, add fields, publish — sellers see it instantly.</p>
                  <Link to="/admin/categories" className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white text-violet-700 px-4 py-2 text-sm font-medium hover:bg-white/90">
                    Start building <ArrowRight className="w-4 h-4" />
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Quick Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link to="/admin/categories" className="flex items-center justify-between p-3 rounded-xl border hover:bg-accent transition-colors">
                    <span className="flex items-center gap-2 text-sm font-medium"><Layers className="w-4 h-4" /> Manage categories</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                  <Link to="/admin/fields" className="flex items-center justify-between p-3 rounded-xl border hover:bg-accent transition-colors">
                    <span className="flex items-center gap-2 text-sm font-medium"><Puzzle className="w-4 h-4" /> Manage fields</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                  <Link to="/sell" className="flex items-center justify-between p-3 rounded-xl border hover:bg-accent transition-colors">
                    <span className="flex items-center gap-2 text-sm font-medium"><Eye className="w-4 h-4" /> Preview seller flow</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  )
}
