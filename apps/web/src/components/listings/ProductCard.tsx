import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ListingDto } from "@marketplace/shared"
import { ProductImage } from "./ProductImage"
import { Badge, ConditionBadge } from "../ui/Badge"
import { MapPin, Heart, Eye, ArrowUpRight } from "lucide-react"
import { SpotlightCard } from "../motion/Spotlight"

export function ProductCard({ listing, index = 0 }: { listing: ListingDto; index?: number }) {
  const image =
    listing.images && listing.images.length > 0
      ? [...listing.images].sort((a, b) => a.displayOrder - b.displayOrder)[0].url
      : undefined

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: Math.min(index * 0.06, 0.4), ease: [0.22, 1, 0.36, 1] }}
    >
      <SpotlightCard className="h-full">
        <Link
          to={`/products/${listing.id}`}
          className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/70 bg-card shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-pop"
        >
          <div className="relative aspect-[4/3] overflow-hidden bg-muted">
            <ProductImage
              src={image}
              alt={listing.title}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-transparent opacity-60 transition-opacity group-hover:opacity-90" />
            <div className="absolute left-3 top-3 flex items-center gap-1.5">
              <Badge variant="secondary" className="border-0 bg-white/90 shadow-sm backdrop-blur-md">
                {listing.category.icon} {listing.category.name}
              </Badge>
            </div>
            <div className="absolute right-3 top-3">
              <span className="grid h-9 w-9 translate-y-1 place-items-center rounded-full border bg-white/90 text-gray-600 opacity-0 shadow-sm backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <Heart className="h-4 w-4" />
              </span>
            </div>
            <div className="absolute inset-x-3 bottom-3 flex items-end justify-between">
              <span className="inline-flex items-center rounded-full bg-white px-3.5 py-1.5 font-display text-[15px] font-bold text-ink-950 shadow-md">
                ₹{listing.price.toLocaleString()}
              </span>
              <span className="inline-flex translate-y-1 items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <Eye className="h-3 w-3" /> View <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-1.5 p-4">
            <h3 className="line-clamp-1 font-display text-[15px] font-semibold leading-snug tracking-tight transition-colors group-hover:text-primary">
              {listing.title}
            </h3>
            <p className="line-clamp-1 text-xs text-muted-foreground">{listing.description ?? listing.title}</p>
            <div className="mt-auto flex items-center gap-2 border-t border-dashed pt-3">
              <ConditionBadge condition={listing.condition} />
              <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {listing.location}
              </span>
            </div>
            {(listing.viewCount !== undefined || listing.offerCount !== undefined) && (
              <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" /> {listing.viewCount ?? 0}</span>
                <span>·</span>
                <span>{listing.offerCount ?? 0} offers</span>
              </div>
            )}
          </div>
        </Link>
      </SpotlightCard>
    </motion.div>
  )
}
