import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ListingDto } from "@marketplace/shared";
import { optimizedImageUrl } from "./ProductImage";
import { cn } from "@/lib/utils";

interface ProductImagesProps {
  images: ListingDto["images"];
  alt?: string;
}

export function ProductImages({ images, alt }: ProductImagesProps) {
  const ordered = [...(images ?? [])].sort((a, b) => a.displayOrder - b.displayOrder);
  const [selected, setSelected] = useState(0);
  const [failed, setFailed] = useState(false);

  if (ordered.length === 0 || failed) {
    return (
      <div className="grid aspect-[4/3] place-items-center rounded-3xl bg-gradient-to-br from-violet-200 via-indigo-100 to-amber-100 text-6xl">
        <span>🛍️</span>
      </div>
    );
  }

  const current = ordered[Math.min(selected, ordered.length - 1)];
  const move = (direction: -1 | 1) => setSelected((index) => (index + direction + ordered.length) % ordered.length);
  return (
    <div>
      <div className="group relative aspect-[4/3] overflow-hidden rounded-3xl bg-muted">
        <img
          key={current.url}
          src={optimizedImageUrl(current.url, 1400)}
          alt={alt ?? "Product image"}
          className="h-full w-full object-cover animate-fade-in"
          onError={() => setFailed(true)}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
        {ordered.length > 1 && (
          <>
            <button type="button" aria-label="Previous image" onClick={() => move(-1)} className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-black/45 text-white opacity-0 backdrop-blur transition-all hover:bg-black/65 group-hover:opacity-100"><ChevronLeft className="h-5 w-5" /></button>
            <button type="button" aria-label="Next image" onClick={() => move(1)} className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-black/45 text-white opacity-0 backdrop-blur transition-all hover:bg-black/65 group-hover:opacity-100"><ChevronRight className="h-5 w-5" /></button>
            <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
              {Math.min(selected + 1, ordered.length)} / {ordered.length}
            </span>
          </>
        )}
      </div>
      {ordered.length > 1 && (
        <div className="scrollbar-none mt-3 flex gap-2 overflow-x-auto pb-1">
          {ordered.map((image, index) => (
            <button
              type="button"
              key={image.id}
              aria-label={`Show image ${index + 1}`}
              onClick={() => { setSelected(index); setFailed(false); }}
              className={cn(
                "h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 transition-all",
                index === selected ? "border-primary shadow-glow" : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              <img src={optimizedImageUrl(image.url, 180)} alt="" className="h-full w-full object-cover" onError={(event) => { event.currentTarget.style.visibility = "hidden"; }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
