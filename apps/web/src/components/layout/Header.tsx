import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Search, ShoppingBag, Store, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth"

export function Header() {
  const navigate = useNavigate()
  const { user, logout } = useUnifiedAuth()
  const [query, setQuery] = useState("")

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (q) navigate(`/?q=${encodeURIComponent(q)}`)
    else navigate("/")
  }

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 h-[64px] flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-[15px] shadow-sm group-hover:shadow-md transition-shadow">
              <Store className="w-5 h-5" />
            </div>
            <span className="absolute -right-1 -top-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background" />
          </div>
          <span className="font-display font-bold text-[18px] tracking-tight hidden sm:block">
            CircleStore
          </span>
          <span className="text-[11px] font-medium bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded-md hidden lg:inline-flex">BETA</span>
        </Link>

        <form onSubmit={onSearch} className="flex-1 max-w-xl hidden md:block">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search mobiles, sofas, bicycles…"
              className="w-full h-10 pl-9 pr-4 rounded-full bg-muted/60 border border-transparent hover:bg-muted focus:bg-background focus:border-input focus:ring-2 focus:ring-ring focus:ring-offset-0 text-sm transition-all placeholder:text-muted-foreground/70"
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden xl:inline-flex h-6 items-center rounded-md border bg-background px-1.5 text-[10px] font-medium text-muted-foreground">⌘ K</kbd>
          </div>
        </form>

        <div className="ml-auto flex items-center gap-2">
          <Link to="/" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 rounded-full hover:bg-accent transition-colors">
            Browse
          </Link>
          <Link to="/sell">
            <Button className="rounded-full shadow-sm hover:shadow-md transition-shadow">
              <ShoppingBag className="w-4 h-4" />
              Sell
            </Button>
          </Link>
          {user ? (
            <div className="flex items-center gap-2 ml-1">
              <img src={user.avatar || `https://i.pravatar.cc/150?u=${user.email}`} alt={user.name || "user"} className="w-8 h-8 rounded-full border object-cover" />
              <span className="hidden lg:block text-sm font-medium max-w-[120px] truncate">{user.name || user.email}</span>
              <Button variant="ghost" size="icon" className="rounded-full w-8 h-8" onClick={logout} title="Sign out">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button variant="outline" className="rounded-full hidden sm:inline-flex">
                <User className="w-4 h-4" /> Sign in
              </Button>
              <Button variant="outline" size="icon" className="rounded-full sm:hidden">
                <User className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* mobile search */}
      <div className="md:hidden border-t bg-background px-4 py-3">
        <form onSubmit={onSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full h-10 pl-9 pr-4 rounded-full bg-muted border-0 text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          />
        </form>
      </div>
    </header>
  )
}
