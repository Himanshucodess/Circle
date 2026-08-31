import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ListingDto } from "@marketplace/shared";
import { optimizedImageUrl } from "./ProductImage";

interface ProductImagesProps {
  images: ListingDto["images"];
  alt?: string;
}

export function ProductImages({ images, alt }: ProductImagesProps) {
  const ordered = [...(images ?? [])].sort((a, b) => a.displayOrder - b.displayOrder);
  const [selected, setSelected] = useState(0);
  const [failed, setFailed] = useState(false);

  if (ordered.length === 0 || failed) {
    return <div className="h-72 md:h-96 rounded-xl bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center text-brand-400"><span className="text-5xl">🛍️</span></div>;
  }

  const current = ordered[Math.min(selected, ordered.length - 1)];
  const move = (direction: -1 | 1) => setSelected((index) => (index + direction + ordered.length) % ordered.length);
  return (
    <div className="p-2 sm:p-3">
      <div className="relative overflow-hidden rounded-xl border bg-muted aspect-[4/3]">
        <img src={optimizedImageUrl(current.url, 1400)} alt={alt ?? "Product image"} className="w-full h-full object-cover" onError={() => setFailed(true)} />
        {ordered.length > 1 && <>
          <button type="button" aria-label="Previous image" onClick={() => move(-1)} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white"><ChevronLeft className="w-5 h-5" /></button>
          <button type="button" aria-label="Next image" onClick={() => move(1)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white"><ChevronRight className="w-5 h-5" /></button>
        </>}
      </div>
      {ordered.length > 1 && <div className="mt-3 flex gap-2 overflow-x-auto pb-1">{ordered.map((image, index) => <button type="button" key={image.id} aria-label={`Show image ${index + 1}`} onClick={() => { setSelected(index); setFailed(false); }} className={`w-16 h-16 shrink-0 overflow-hidden rounded-lg border-2 ${index === selected ? "border-primary" : "border-transparent"}`}><img src={optimizedImageUrl(image.url, 180)} alt="" className="w-full h-full object-cover" onError={(event) => { event.currentTarget.style.visibility = "hidden"; }} /></button>)}</div>}
    </div>
  );
}
