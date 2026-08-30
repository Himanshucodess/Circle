import { Link } from "react-router-dom"
import { Store, Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-card mt-12">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                <Store className="w-4 h-4" />
              </div>
              <span className="font-bold">CircleStore</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              Schema-driven secondhand marketplace. Categories and fields are data, not code — spin up a new category in minutes, no deploy needed.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">Marketplace</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-foreground transition-colors">Browse listings</Link>
              <Link to="/sell" className="hover:text-foreground transition-colors">Sell an item</Link>
              <Link to="/admin" className="hover:text-foreground transition-colors">Admin panel</Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">Developers</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">API docs</a>
              <a href="#" className="hover:text-foreground transition-colors">Schema versioning</a>
              <a href="#" className="hover:text-foreground transition-colors">GitHub</a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <span>© {new Date().getFullYear()} CircleStore</span>
            <span className="mx-1">·</span>
            <span className="flex items-center gap-1">Made with <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" /> for secondhand lovers</span>
          </div>
          <div className="flex items-center gap-2">
            <a href="#" className="w-8 h-8 rounded-full border bg-background flex items-center justify-center hover:bg-accent transition-colors text-xs font-bold">𝕏</a>
            <a href="#" className="w-8 h-8 rounded-full border bg-background flex items-center justify-center hover:bg-accent transition-colors text-xs font-bold">GH</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
