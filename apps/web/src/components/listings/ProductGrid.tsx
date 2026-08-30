import { ListingDto } from "@marketplace/shared"
import { ProductCard } from "./ProductCard"
import { EmptyState } from "../ui/EmptyState"
import { Skeleton } from "../ui/skeleton"

interface ProductGridProps {
  listings: ListingDto[]
  loading?: boolean
}

export function ProductGrid({ listings, loading }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-2xl border bg-card overflow-hidden">
            <Skeleton className="aspect-[4/3] w-full" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-6 w-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (listings.length === 0) {
    return (
      <EmptyState
        icon="🛍️"
        title="No listings yet"
        description="Be the first to list something—create a category in admin and start selling in minutes."
        action={<a href="/sell" className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:bg-primary/90 shadow">+ Sell your first item</a>}
      />
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {listings.map((listing) => (
        <ProductCard key={listing.id} listing={listing} />
      ))}
    </div>
  )
}
