import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
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

  if (loading) return <PageLoader label="Loading listing..." />;
  if (error || !listing) return <div className="max-w-6xl mx-auto px-4 py-8"><ErrorState message="Something went wrong." onRetry={load} /></div>;
  const fields = listing.schema?.fields ?? [];
  const sellerName = listing.seller?.name || "CircleStore member";
  return <div className="max-w-6xl mx-auto px-4 py-6">
    <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5"><ArrowLeft className="w-4 h-4" /> Back to marketplace</Link>
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3"><Card className="overflow-hidden p-0"><ProductImages images={listing.images} alt={listing.title} /></Card><div className="lg:hidden mt-4">{listing.pricingInsight && <PricingInsight insight={listing.pricingInsight} />}</div></div>
      <div className="lg:col-span-2 space-y-4">
        <Card><CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-2 mb-3"><ConditionBadge condition={listing.condition} /><Badge variant="secondary"><Sparkles className="w-3 h-3 inline mr-1" />{listing.category.name}</Badge><span className="ml-auto text-xs text-muted-foreground"><MapPin className="w-3 h-3 inline" /> {listing.location}</span></div>
          <h1 className="text-2xl font-display font-bold leading-tight">{listing.title}</h1>
          <p className="mt-2 text-xs text-muted-foreground">{listing.condition.replace(/_/g, " ").toLowerCase()} · {listing.location} · Listed {timeAgo(listing.createdAt)}</p>
          <div className="mt-2 flex gap-4 text-xs text-muted-foreground"><span><Eye className="w-3 h-3 inline" /> {listing.viewCount} views</span><span><HandCoins className="w-3 h-3 inline" /> {listing.offerCount ?? 0} active offers</span></div>
          <div className="mt-4 text-3xl font-extrabold">₹{listing.price.toLocaleString()}</div>
          {listing.pricingInsight && <div className="hidden lg:block mt-4"><PricingInsight insight={listing.pricingInsight} /></div>}
          <Button className="mt-5 w-full rounded-full h-11" onClick={() => document.getElementById("offer-section")?.scrollIntoView({ behavior: "smooth" })}><HandCoins className="w-4 h-4" /> Make an Offer</Button>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-xl p-3"><ShieldCheck className="w-4 h-4 text-emerald-600" /> Keep conversations and payments safe.</div>
        </CardContent></Card>
        <Card><CardContent className="p-6"><h3 className="font-semibold mb-3"><User className="w-4 h-4 inline mr-2" />Seller</h3><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">{sellerName[0].toUpperCase()}</div><div><div className="text-sm font-medium">{sellerName}</div><div className="text-xs text-muted-foreground">Member since {listing.seller?.memberSince ? new Date(listing.seller.memberSince).getFullYear() : "recently"}</div></div><Button variant="outline" size="sm" className="ml-auto rounded-full"><MessageCircle className="w-4 h-4" /> Chat</Button></div></CardContent></Card>
      </div>
    </div>
    <Card className="mt-6"><CardContent className="p-6"><div className="flex items-center gap-2 mb-4"><Sparkles className="w-4 h-4 text-primary" /><h2 className="font-semibold">Product Details</h2><Badge variant="outline" className="ml-auto">Schema v{listing.schemaVersion}</Badge></div><Separator className="mb-4" /><DynamicProductAttributes fields={fields} attributes={listing.attributes} /></CardContent></Card>
    <Card className="mt-6"><CardContent className="p-6"><h3 className="font-semibold mb-2">Description</h3><p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{listing.description}</p><div className="mt-4 text-xs text-muted-foreground"><Clock className="w-3 h-3 inline" /> Listed {timeAgo(listing.createdAt)} · {listing.viewCount} views</div></CardContent></Card>
    <Card id="offer-section" className="mt-6"><CardContent className="p-6"><h3 className="font-semibold mb-1"><HandCoins className="w-4 h-4 inline mr-2 text-primary" />Make an Offer</h3><p className="text-sm text-muted-foreground mb-4">Asking ₹{listing.price.toLocaleString()}. Offer amounts from other buyers are never revealed.</p><div className="grid grid-cols-1 sm:grid-cols-3 gap-3"><Input placeholder="Offer amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} /><div className="sm:col-span-2"><Textarea placeholder="Message (optional)" value={message} onChange={(e) => setMessage(e.target.value)} /></div></div>{insight && <div className="mt-4 rounded-xl border bg-muted/40 p-4"><div className="flex items-center justify-between"><span className="font-medium">Offer competitiveness</span><Badge variant="secondary">{insight.rating}</Badge></div><p className="text-sm text-muted-foreground mt-1">{insight.message}</p></div>}{offerError && <p className="text-sm text-destructive mt-3">{offerError}</p>}{success && <p className="text-sm text-emerald-600 mt-3">Offer sent to the seller.</p>}<Button className="mt-4 rounded-full" onClick={submitOffer} loading={submitting}>Send offer</Button></CardContent></Card>
  </div>;
}
