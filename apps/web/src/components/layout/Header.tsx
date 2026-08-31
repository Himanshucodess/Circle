import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, Store, LogOut, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { useCategories } from "@/hooks/useCategories";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useUnifiedAuth() as any;
  const { categories } = useCategories();
  const [query, setQuery] = useState(new URLSearchParams(location.search).get("q") || "");
  const search = (event: React.FormEvent) => { event.preventDefault(); const value = query.trim(); navigate(value ? `/?q=${encodeURIComponent(value)}` : "/"); };
  return <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[84px] flex items-center gap-5 lg:gap-10">
      <Link to="/" className="flex items-center gap-2.5 shrink-0 group" aria-label="CircleStore home">
        <span className="w-12 h-12 rounded-[16px] bg-primary text-primary-foreground flex items-center justify-center shadow-sm group-hover:rotate-3 transition-transform"><Store className="w-[22px] h-[22px]" /></span>
        <span className="font-display font-extrabold text-[22px] tracking-[-0.04em] hidden sm:block">CircleStore</span>
      </Link>
      <form onSubmit={search} className="flex-1 max-w-[600px] mx-auto hidden md:block"><div className="relative group"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted-foreground group-focus-within:text-primary transition-colors" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search for anything pre-loved" className="w-full h-13 pl-12 pr-4 rounded-2xl border bg-muted/60 hover:bg-muted focus:bg-background focus:border-primary/40 focus:ring-4 focus:ring-primary/10 outline-none text-[15px] transition-all placeholder:text-muted-foreground/70" /></div></form>
      <nav className="ml-auto flex items-center gap-2"><Link to="/" className="hidden lg:inline-flex items-center gap-1 text-[15px] font-medium text-muted-foreground hover:text-foreground px-3 py-2.5 rounded-xl hover:bg-accent transition-colors">Browse</Link>{user && <Link to="/my-listings" className="hidden lg:inline-flex items-center gap-1 text-[15px] font-medium text-muted-foreground hover:text-foreground px-3 py-2.5 rounded-xl hover:bg-accent transition-colors">My listings</Link>}<Link to="/sell"><Button className="rounded-xl h-11 px-5 text-[15px] shadow-sm"><ShoppingBag className="w-4 h-4" /> Sell</Button></Link><ThemeToggle />{user ? <div className="flex items-center gap-2 ml-1"><img src={user.avatar || `https://i.pravatar.cc/150?u=${user.email}`} alt={user.name || "Profile"} className="w-10 h-10 rounded-full border object-cover" /><span className="hidden xl:block text-sm font-semibold max-w-[120px] truncate">{user.name || user.email}</span><button type="button" onClick={logout} title="Sign out" className="h-10 w-10 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent flex items-center justify-center"><LogOut className="w-4 h-4" /></button></div> : <Link to="/login"><Button variant="outline" className="rounded-xl h-11 px-4 text-[15px]"><User className="w-4 h-4" /><span className="hidden sm:inline">Sign in</span></Button></Link>}</nav>
    </div>
    <div className="md:hidden px-4 pb-3"><form onSubmit={search} className="relative"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search for anything pre-loved" className="w-full h-10 pl-10 pr-3 rounded-xl border bg-muted/60 outline-none text-sm focus:border-primary/40" /></form></div>
    <nav className="border-t bg-muted/20"><div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto py-3 scrollbar-none"><Link to="/" className="shrink-0 inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold hover:bg-accent">All</Link>{user && <Link to="/my-listings" className="md:hidden shrink-0 inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold text-primary hover:bg-accent">My listings</Link>}{categories.slice(0, 12).map((category) => <Link key={category.id} to={`/?category=${encodeURIComponent(category.slug)}`} className="shrink-0 inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"><span>{category.icon}</span>{category.name}</Link>)}<span className="hidden lg:inline-flex ml-auto shrink-0 items-center gap-1 text-sm text-muted-foreground px-3"><ChevronDown className="w-3 h-3" /> Explore</span></div></nav>
  </header>;
}
