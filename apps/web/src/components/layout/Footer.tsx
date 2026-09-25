import { Link } from "react-router-dom";
import { Heart, ShieldCheck, Recycle, ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative mt-20 overflow-hidden bg-ink-950 text-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -top-32 left-1/4 h-72 w-72 rounded-full bg-violet-600/30 blur-[100px]" />
        <div className="absolute -bottom-24 right-1/4 h-64 w-64 rounded-full bg-lime/10 blur-[100px]" />
        <div className="absolute inset-0 bg-grid-dark opacity-60 [mask-image:radial-gradient(ellipse_70%_80%_at_50%_100%,black,transparent)]" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="relative grid h-10 w-10 place-items-center rounded-2xl bg-white text-ink-950">
                <span className="font-display text-lg font-bold">C</span>
                <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full bg-lime" />
              </span>
              <span className="font-display text-xl font-bold tracking-tight">CircleStore</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
              The circular marketplace. Every purchase keeps a good thing in use —{" "}
              <span className="font-serif italic text-lime">give it a second life.</span>
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/70">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Buyer protection
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/70">
                <Recycle className="h-3.5 w-3.5 text-lime" /> Circular by design
              </span>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">Marketplace</h4>
            <div className="mt-4 flex flex-col gap-3 text-sm text-white/70">
              <Link to="/" className="group inline-flex w-fit items-center gap-1 hover:text-white">Browse listings <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" /></Link>
              <Link to="/sell" className="group inline-flex w-fit items-center gap-1 hover:text-white">Sell an item <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" /></Link>
              <Link to="/my-listings" className="group inline-flex w-fit items-center gap-1 hover:text-white">My listings <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" /></Link>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">Trust</h4>
            <div className="mt-4 flex flex-col gap-3 text-sm text-white/70">
              <span>Verified sellers</span>
              <span>Private offers</span>
              <Link to="/admin/login" className="opacity-60 transition-opacity hover:opacity-100 hover:text-white">Admin sign in</Link>
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/45 sm:flex-row">
          <span>© {new Date().getFullYear()} CircleStore · Keep things circling</span>
          <span className="flex items-center gap-1">Made with <Heart className="h-3 w-3 fill-rose-500 text-rose-500" /> for secondhand lovers</span>
        </div>
      </div>
    </footer>
  );
}
