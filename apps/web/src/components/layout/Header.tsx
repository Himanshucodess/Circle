import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Plus, LogOut, ChevronDown, Command } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { useCategories } from "@/hooks/useCategories";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useUnifiedAuth() as any;
  const { categories } = useCategories();
  const [query, setQuery] = useState(new URLSearchParams(location.search).get("q") || "");
  const [focused, setFocused] = useState(false);
  const search = (event: React.FormEvent) => {
    event.preventDefault();
    const value = query.trim();
    navigate(value ? `/?q=${encodeURIComponent(value)}` : "/");
  };

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* floating glass bar */}
      <div className="border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center gap-3 px-4 sm:px-6 lg:gap-6">
          <Link to="/" className="group flex shrink-0 items-center gap-2.5" aria-label="CircleStore home">
            <span className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-2xl bg-ink-950 text-white shadow-card transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105 dark:bg-white dark:text-ink-950">
              <span className="font-display text-xl font-bold">C</span>
              <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-lime" />
            </span>
            <span className="hidden flex-col leading-none sm:flex">
              <span className="font-display text-[20px] font-bold tracking-[-0.03em]">CircleStore</span>
              <span className="text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase">Pre-loved · Re-circulated</span>
            </span>
          </Link>

          <form onSubmit={search} className="mx-auto hidden w-full max-w-[520px] flex-1 md:block">
            <div
              className={cn(
                "group relative flex items-center rounded-2xl border bg-muted/50 transition-all duration-300",
                focused ? "border-primary/50 bg-background shadow-glow" : "border-border/70 hover:border-border hover:bg-muted"
              )}
            >
              <Search className={cn("ml-4 h-[18px] w-[18px] shrink-0 transition-colors", focused ? "text-primary" : "text-muted-foreground")} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Search phones, sofas, cycles…"
                className="h-12 w-full bg-transparent px-3 text-[15px] outline-none placeholder:text-muted-foreground/70"
              />
              <kbd className="mr-3 hidden shrink-0 items-center gap-1 rounded-lg border bg-background px-2 py-1 text-[11px] font-medium text-muted-foreground lg:inline-flex">
                <Command className="h-3 w-3" /> K
              </kbd>
            </div>
          </form>

          <nav className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
            <Link
              to="/"
              className="hidden rounded-xl px-3 py-2.5 text-[14px] font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:inline-flex"
            >
              Browse
            </Link>
            {user && (
              <Link
                to="/my-listings"
                className="hidden rounded-xl px-3 py-2.5 text-[14px] font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:inline-flex"
              >
                My listings
              </Link>
            )}
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-2">
                <img
                  src={user.avatar || `https://i.pravatar.cc/150?u=${user.email}`}
                  alt={user.name || "Profile"}
                  className="h-10 w-10 rounded-full border-2 border-primary/30 object-cover"
                />
                <button
                  type="button"
                  onClick={logout}
                  title="Sign out"
                  className="grid h-10 w-10 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                </button>
                <Link to="/sell">
                  <Button className="hidden rounded-2xl sm:inline-flex">
                    <Plus className="h-4 w-4" /> Sell
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="hidden sm:inline-flex">Sign in</Button>
                </Link>
                <Link to="/sell">
                  <Button className="rounded-2xl">
                    <Plus className="h-4 w-4" /> Sell
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="px-4 pb-3 md:hidden">
          <form onSubmit={search} className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pre-loved finds…"
              className="h-11 w-full rounded-xl border bg-muted/60 pl-10 pr-3 text-sm outline-none focus:border-primary/50 focus:bg-background"
            />
          </form>
        </div>
      </div>

      {/* category rail */}
      <div className="border-b border-border/50 bg-background/60 backdrop-blur-lg">
        <div className="scrollbar-none mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-2.5 sm:px-6">
          <CategoryPill to="/" label="All" active={!new URLSearchParams(location.search).get("category")} />
          {user && (
            <Link
              to="/my-listings"
              className="shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold text-primary hover:bg-accent md:hidden"
            >
              My listings
            </Link>
          )}
          <AnimatePresence initial={false}>
            {categories.slice(0, 12).map((category) => (
              <motion.span key={category.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}>
                <CategoryPill
                  to={`/?category=${encodeURIComponent(category.slug)}`}
                  label={`${category.icon ? `${category.icon} ` : ""}${category.name}`}
                  active={new URLSearchParams(location.search).get("category") === category.slug}
                />
              </motion.span>
            ))}
          </AnimatePresence>
          <span className="ml-auto hidden shrink-0 items-center gap-1 pl-3 text-xs font-medium text-muted-foreground lg:inline-flex">
            <ChevronDown className="h-3 w-3" /> Curated circular finds
          </span>
        </div>
      </div>
    </header>
  );
}

function CategoryPill({ to, label, active }: { to: string; label: string; active?: boolean }) {
  return (
    <Link
      to={to}
      className={cn(
        "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-200",
        active
          ? "border-ink-950 bg-ink-950 text-white shadow-card dark:border-white dark:bg-white dark:text-ink-950"
          : "border-border/60 bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
      )}
    >
      {label}
    </Link>
  );
}
