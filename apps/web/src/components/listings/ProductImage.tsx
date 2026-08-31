interface ProductImageProps {
  src?: string;
  alt?: string;
  className?: string;
}

export function optimizedImageUrl(src: string, width: number) {
  if (!src.includes("res.cloudinary.com") || !src.includes("/upload/")) return src;
  return src.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
}

export function ProductImage({ src, alt, className }: ProductImageProps) {
  if (!src) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200 text-brand-500 ${className ?? ""}`}
      >
        <span className="text-3xl">🛍️</span>
      </div>
    );
  }
  return <img src={optimizedImageUrl(src, 700)} alt={alt ?? ""} className={`object-cover ${className ?? ""}`} loading="lazy" onError={(event) => { event.currentTarget.style.display = "none"; }} />;
}
