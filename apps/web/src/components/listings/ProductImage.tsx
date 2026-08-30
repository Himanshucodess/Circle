interface ProductImageProps {
  src?: string;
  alt?: string;
  className?: string;
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
  return <img src={src} alt={alt ?? ""} className={`object-cover ${className ?? ""}`} loading="lazy" />;
}
