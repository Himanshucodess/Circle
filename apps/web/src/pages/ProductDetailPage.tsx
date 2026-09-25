import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { getListing, recordListingView } from "@/services/listingApi";
import { createOffer, getOfferCompetitiveness } from "@/services/offerApi";
import { ListingDto } from "@marketplace/shared";
import { ProductImages } from "@/components/listings/ProductImages";
import { DynamicProductAttributes } from "@/components/listings/DynamicProductAttributes";
import { ConditionBadge, Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Separator } from "@/components/ui/separator";
import { PricingInsight } from "@/components/listings/PricingInsight";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { Reveal } from "@/components/motion/Reveal";
import { SpotlightCard } from "@/components/motion/Spotlight";
import { ArrowLeft, Clock, Eye, HandCoins, MapPin, MessageCircle, Share2, ShieldCheck, Sparkles, User } from "lucide-react";

type Detail = ListingDto & { schema?: { fields: any[] }; pricingInsight?: any };
type Competitiveness = { rating: "LOW" | "MODERATE" | "COMPETITIVE" | "EXCELLENT"; message: string };

function timeAgo(value: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(value).toLocaleDateString();
}

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useUnifiedAuth() as any;
  const [listing, setListing] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [insight, setInsight] = useState<Competitiveness | null>(null);
  const [offerError, setOfferError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const viewed = useRef<string | null>(null);

  const load = () => {
    if (!id) return;
    setLoading(true); setError(null);
    getListing(id).then((value) => setListing(value as Detail)).catch(() => setError("Something went wrong.")).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [id]);
  useEffect(() => {
    if (!id || viewed.current === id) return;
    viewed.current = id;
    recordListingView(id).then((result) => setListing((current) => current ? { ...current, viewCount: result.viewCount } : current)).catch(() => {});
  }, [id, listing?.id]);
  useEffect(() => {
    if (!listing || !amount || Number(amount) <= 0) { setInsight(null); return; }
    const timer = window.setTimeout(() => getOfferCompetitiveness(listing.id, Number(amount)).then((value) => setInsight(value as Competitiveness)).catch(() => setInsight(null)), 350);
    return () => window.clearTimeout(timer);
  }, [listing?.id, amount]);

  const submitOffer = async () => {
    if (!listing) return;
    if (!user) { setOfferError("Please sign in to make an offer."); return; }
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) { setOfferError("Enter a valid offer amount."); return; }
    setSubmitting(true); setOfferError(null); setSuccess(false);
    try {
      const result: any = await createOffer(listing.id, { amount: value, message: message || undefined });
      setInsight(result.competitiveness); setSuccess(true); setAmount(""); setMessage("");
      setListing((current) => current ? { ...current, offerCount: (current.offerCount ?? 0) + 1 } : current);
    } catch (e: any) { setOfferError(e.message || "Something went wrong."); } finally { setSubmitting(false); }
  };

  if (loading) return <PageLoader label="Opening listing…" />;
  if (error || !listing) return <div className="mx-auto max-w-6xl px-4 py-8"><ErrorState message="Something went wrong." onRetry={load} /></div>;
  const fields = listing.schema?.fields ?? [];
  const sellerName = listing.seller?.name || "CircleStore member";
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <Link to="/" className="mb-5 inline-flex items-center gap-1.5 rounded-full border bg-card px-3.5 py-1.5 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Marketplace</Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="lg:col-span-3">
          <Card className="overflow-hidden p-3 sm:p-4">
            <ProductImages images={listing.images} alt={listing.title} />
          </Card>
          <div className="mt-4 lg:hidden">{listing.pricingInsight && <PricingInsight insight={listing.pricingInsight} />}</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="space-y-4 lg:col-span-2">
          <SpotlightCard>
            <Card className="overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-violet-500 via-fuchsia-400 to-lime" />
              <CardContent className="p-6">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <ConditionBadge condition={listing.condition} />
                  <Badge variant="brand"><Sparkles className="h-3 w-3" />{listing.category.name}</Badge>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard?.writeText(window.location.href).catch(() => {})}
                    className="ml-auto grid h-8 w-8 place-items-center rounded-full border text-muted-foreground transition-colors hover:text-foreground"
                    title="Copy link"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <h1 className="font-display text-[26px] font-bold leading-tight tracking-tight">{listing.title}</h1>
                <p className="mt-2 text-xs font-medium text-muted-foreground">
                  {listing.condition.replace(/_/g, " ").toLowerCase()} · <MapPin className="inline h-3 w-3" /> {listing.location} · Listed {timeAgo(listing.createdAt)}
                </p>
                <div className="mt-2 flex gap-4 text-xs font-medium text-muted-foreground">
                  <span><Eye className="inline h-3 w-3" /> {listing.viewCount} views</span>
                  <span><HandCoins className="inline h-3 w-3" /> {listing.offerCount ?? 0} offers</span>
                </div>
                <div className="mt-4 flex items-end gap-2">
                  <span className="font-display text-4xl font-bold tracking-tight">₹{listing.price.toLocaleString()}</span>
                </div>
                {listing.pricingInsight && <div className="mt-4 hidden lg:block"><PricingInsight insight={listing.pricingInsight} /></div>}
                <Button size="lg" className="mt-5 h-12 w-full rounded-2xl text-[15px]" onClick={() => document.getElementById("offer-section")?.scrollIntoView({ behavior: "smooth" })}>
                  <HandCoins className="h-4 w-4" /> Make an offer
                </Button>
                <div className="mt-3 flex items-center gap-2 rounded-2xl bg-emerald-500/10 p-3 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  <ShieldCheck className="h-4 w-4 shrink-0" /> Meet in a public place and keep payments inside chat.
                </div>
              </CardContent>
            </Card>
          </SpotlightCard>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-display font-semibold"><User className="mr-2 inline h-4 w-4 text-primary" />Seller</h3>
              <div className="mt-3 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 font-display font-bold text-white">{sellerName[0].toUpperCase()}</div>
                <div>
                  <div className="text-sm font-semibold">{sellerName}</div>
                  <div className="text-xs text-muted-foreground">Member since {listing.seller?.memberSince ? new Date(listing.seller.memberSince).getFullYear() : "recently"}</div>
                </div>
                <Button variant="outline" size="sm" className="ml-auto rounded-full"><MessageCircle className="h-4 w-4" /> Chat</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Reveal className="mt-6">
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="font-display font-bold">Product details</h2>
              <Badge variant="outline" className="ml-auto">Schema v{listing.schemaVersion}</Badge>
            </div>
            <Separator className="mb-4" />
            <DynamicProductAttributes fields={fields} attributes={listing.attributes} />
          </CardContent>
        </Card>
      </Reveal>

      <Reveal className="mt-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-display font-bold">Description</h3>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{listing.description}</p>
            <div className="mt-4 text-xs text-muted-foreground"><Clock className="inline h-3 w-3" /> Listed {timeAgo(listing.createdAt)} · {listing.viewCount} views</div>
          </CardContent>
        </Card>
      </Reveal>

      <Reveal className="mt-6">
        <Card id="offer-section" className="scroll-mt-28 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-lime via-emerald-300 to-violet-500" />
          <CardContent className="p-6">
            <h3 className="font-display text-lg font-bold"><HandCoins className="mr-2 inline h-4 w-4 text-primary" />Make an offer</h3>
            <p className="mb-4 mt-1 text-sm text-muted-foreground">Asking ₹{listing.price.toLocaleString()}. Other buyers never see your amount.</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Input placeholder="Offer amount ₹" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <div className="sm:col-span-2"><Textarea placeholder="Message to seller (optional)" value={message} onChange={(e) => setMessage(e.target.value)} /></div>
            </div>
            {insight && <div className="mt-4 rounded-2xl border bg-muted/40 p-4"><div className="flex items-center justify-between"><span className="font-semibold">Offer competitiveness</span><Badge variant="secondary">{insight.rating}</Badge></div><p className="mt-1 text-sm text-muted-foreground">{insight.message}</p></div>}
            {offerError && <p className="mt-3 text-sm font-medium text-destructive">{offerError}</p>}
            {success && <p className="mt-3 text-sm font-medium text-emerald-600">Offer sent to the seller. Good luck!</p>}
            <Button className="mt-4 rounded-2xl px-7" onClick={submitOffer} loading={submitting}>Send offer</Button>
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
