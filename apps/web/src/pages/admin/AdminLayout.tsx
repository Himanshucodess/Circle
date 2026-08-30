import { Link, NavLink, useNavigate, useLocation } from "react-router-dom"
import { LayoutDashboard, Layers, Puzzle, Store, ArrowLeft, Sparkles, Search, Bell, ClipboardList, LogOut } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Separator } from "@/components/ui/separator"
import { adminLogout } from "@/services/adminApi"

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()

  const nav = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/admin/categories", label: "Categories", icon: Layers },
    { to: "/admin/fields", label: "Fields", icon: Puzzle },
    { to: "/admin/requests", label: "Requests", icon: ClipboardList },
  ]

  const isActive = (to: string, exact?: boolean) => {
    if (exact) return location.pathname === to
    return location.pathname.startsWith(to)
  }

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b">
        <div className="max-w-7xl mx-auto px-4 h-[64px] flex items-center gap-4">
          <Link to="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
            <span className="font-bold tracking-tight">Admin</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-xs bg-violet-100 text-violet-700 rounded-full px-2 py-0.5 font-medium">
              <Sparkles className="w-3 h-3" /> CircleStore
            </span>
          </Link>

          <nav className="ml-6 hidden md:flex items-center gap-1">
            {nav.map((item) => {
              const active = isActive(item.to, item.exact)
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                    active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full hidden sm:inline-flex">
              <Search className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full hidden sm:inline-flex">
              <Bell className="w-4 h-4" />
            </Button>
            <Separator orientation="vertical" className="h-6 hidden sm:block" />
            <Button variant="outline" size="sm" className="rounded-full" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4" /> View site
            </Button>
            <Button variant="ghost" size="sm" className="rounded-full" onClick={async () => { await adminLogout(); navigate("/admin/login", { replace: true }); }}><LogOut className="w-4 h-4" /> Logout</Button>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden border-t bg-white px-2 py-2 flex items-center gap-1 overflow-x-auto">
          {nav.map((item) => {
            const active = isActive(item.to, item.exact)
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap ${
                  active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                <item.icon className="w-4 h-4" /> {item.label}
              </NavLink>
            )
          })}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 md:py-8">{children}</main>
    </div>
  )
}
