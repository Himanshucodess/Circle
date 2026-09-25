import { ListingDto } from "@marketplace/shared";
import { ProductCard } from "./ProductCard";
import { EmptyState } from "../ui/EmptyState";
import { Skeleton } from "../ui/skeleton";
import { Reveal } from "../motion/Reveal";

export function ProductGrid({ listings, loading }: { listings: ListingDto[]; loading?: boolean }) {
  if (loading)
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-3xl border bg-card">
            <Skeleton className="aspect-[4/3] w-full animate-pulse" />
            <div className="space-y-3 p-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-9 w-full rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  if (!listings.length)
    return (
      <Reveal className="overflow-hidden rounded-[28px] border border-dashed bg-card p-10 text-center">
        <EmptyState
          icon="🛍️"
          title="No listings found"
          description="Try another search — or be the first to circulate something useful."
          action={
            <a
              href="/sell"
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-ink-950 px-6 text-sm font-bold text-white transition-transform hover:scale-[1.03] dark:bg-white dark:text-ink-950"
            >
              Sell your first item
            </a>
          }
        />
      </Reveal>
    );
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {listings.map((listing, i) => (
        <ProductCard key={listing.id} listing={listing} index={i} />
      ))}
    </div>
  );
}
