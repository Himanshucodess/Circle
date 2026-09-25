import { cn } from "@/lib/utils";

/** Aurora backdrop: layered animated blobs + grid + grain (manus/backlit-inspired hero). */
export function Aurora({ className, dark = true }: { className?: string; dark?: boolean }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      {dark ? (
        <>
          <div className="absolute inset-0 bg-ink-950" />
          <div className="absolute inset-0 bg-grid-dark [mask-image:radial-gradient(ellipse_75%_65%_at_50%_35%,black,transparent)]" />
          <div className="absolute -top-40 left-1/2 h-[560px] w-[820px] -translate-x-1/2 rounded-full bg-violet-600/40 blur-[140px] animate-aurora" />
          <div className="absolute top-10 -left-32 h-[420px] w-[420px] rounded-full bg-indigo-500/30 blur-[120px] animate-aurora [animation-delay:-4s]" />
          <div className="absolute top-24 -right-32 h-[460px] w-[460px] rounded-full bg-fuchsia-500/25 blur-[130px] animate-aurora [animation-delay:-8s]" />
          <div className="absolute bottom-0 left-1/3 h-[300px] w-[560px] rounded-full bg-lime/10 blur-[120px]" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-cream" />
          <div className="absolute inset-0 bg-grid-light [mask-image:radial-gradient(ellipse_75%_65%_at_50%_35%,black,transparent)]" />
          <div className="absolute -top-40 left-1/2 h-[520px] w-[780px] -translate-x-1/2 rounded-full bg-violet-300/50 blur-[140px] animate-aurora" />
          <div className="absolute top-10 -left-32 h-[380px] w-[380px] rounded-full bg-indigo-300/40 blur-[120px] animate-aurora [animation-delay:-4s]" />
          <div className="absolute top-24 -right-32 h-[400px] w-[400px] rounded-full bg-amber-200/50 blur-[130px] animate-aurora [animation-delay:-8s]" />
        </>
      )}
    </div>
  );
}
