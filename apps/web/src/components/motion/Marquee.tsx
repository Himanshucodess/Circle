import { cn } from "@/lib/utils";

/** Infinite logo/ticker strip (Origin-kit style). Pure CSS, duplicated list. */
export function Marquee({
  children,
  className,
  speed = 28,
}: {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div
        className="flex w-max animate-marquee items-center gap-10 pr-10"
        style={{ animationDuration: `${speed}s` }}
      >
        {children}
        {children}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent" />
    </div>
  );
}
