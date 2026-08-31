import { Link } from "react-router-dom"
import { ListingDto } from "@marketplace/shared"
import { ProductImage } from "./ProductImage"
import { Badge, ConditionBadge } from "../ui/Badge"
import { MapPin, Heart, Eye } from "lucide-react"

export function ProductCard({ listing }: { listing: ListingDto }) {
  const image = listing.images && listing.images.length > 0 ? [...listing.images].sort((a, b) => a.displayOrder - b.displayOrder)[0].url : undefined

  return (
    <Link
      to={`/products/${listing.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <ProductImage
          src={image}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {/* top badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <Badge variant="secondary" className="backdrop-blur-md bg-white/90 text-gray-700 border-0 shadow-sm font-medium">
            {listing.category.icon} {listing.category.name}
          </Badge>
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <span className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-md border shadow-sm flex items-center justify-center text-gray-600 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all">
            <Heart className="w-4 h-4" />
          </span>
        </div>
        {/* bottom price */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-sm font-bold text-slate-950 shadow-md">
            ₹{listing.price.toLocaleString()}
          </span>
          <span className="hidden group-hover:inline-flex items-center gap-1 text-xs font-medium text-white bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full">
            <Eye className="w-3 h-3" /> View
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="text-[14px] font-semibold leading-snug line-clamp-1 group-hover:text-primary transition-colors">
          {listing.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-1">{listing.description ?? listing.title}</p>
        <div className="mt-auto flex items-center gap-2 pt-2 border-t border-dashed">
          <ConditionBadge condition={listing.condition} />
          <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            {listing.location}
          </span>
        </div>
        {(listing.viewCount !== undefined || listing.offerCount !== undefined) && (
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Eye className="w-3 h-3" /> {listing.viewCount ?? 0} views</span>
            <span>·</span>
            <span>{listing.offerCount ?? 0} offers</span>
          </div>
        )}
      </div>
    </Link>
  )
}
