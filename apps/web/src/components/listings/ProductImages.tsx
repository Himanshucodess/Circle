import { ListingDto } from "@marketplace/shared";

interface ProductImagesProps {
  images: ListingDto["images"];
  alt?: string;
}

export function ProductImages({ images, alt }: ProductImagesProps) {
  const urls = images && images.length > 0 ? images.map((i) => i.url) : [];

  if (urls.length === 0) {
    return (
      <div className="h-72 md:h-96 rounded-xl bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center text-brand-400">
        <span className="text-5xl">🛍️</span>
      </div>
    );
  }

  const [main, ...rest] = urls;

  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <img src={main} alt={alt ?? "Product image"} className="w-full h-72 md:h-96 object-cover" />
      </div>
      {rest.length > 0 && (
        <div className="flex gap-3 mt-3">
          {urls.map((url, i) => (
            <div key={i} className="w-20 h-20 overflow-hidden rounded-lg border border-gray-200">
              <img src={url} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
