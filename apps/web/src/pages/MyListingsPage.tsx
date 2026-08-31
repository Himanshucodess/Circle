import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, HandCoins, Plus, Trash2 } from "lucide-react";
import { ListingDto } from "@marketplace/shared";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { deleteListing, fetchMyListings } from "@/services/listingApi";
import { ProductImage } from "@/components/listings/ProductImage";
import { Button } from "@/components/ui/Button";
import { Badge, ConditionBadge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageLoader } from "@/components/ui/Spinner";

export function MyListingsPage() {
  const { user, loading: authLoading } = useUnifiedAuth() as any;
  const [listings, setListings] = useState<ListingDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const load = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setListings(await fetchMyListings());
    } catch (reason: any) {
      setError(reason?.message || "Could not load your listings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) void load();
  }, [authLoading, user?.id]);

  const remove = async (listing: ListingDto) => {
    if (!window.confirm(`Remove “${listing.title}” from the marketplace? This cannot be undone.`)) return;
    setRemovingId(listing.id);
    setError(null);
    try {
      await deleteListing(listing.id);
      setListings((current) => current.filter((item) => item.id !== listing.id));
    } catch (reason: any) {
      setError(reason?.message || "Could not remove this listing.");
    } finally {
      setRemovingId(null);
    }
  };

  if (authLoading || loading) return <PageLoader label="Loading your listings..." />;

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <Card>
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-display font-bold">Sign in to manage your listings</h1>
            <p className="mt-2 text-sm text-muted-foreground">Your published products will appear here.</p>
            <Link to="/login?next=/my-listings"><Button className="mt-6 rounded-full">Sign in</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-sm font-semibold text-primary">Seller space</p>
          <h1 className="text-3xl font-display font-bold tracking-tight mt-1">My Listings</h1>
          <p className="text-muted-foreground mt-2">Manage the products you have shared with CircleStore.</p>
        </div>
        <Link to="/sell"><Button className="rounded-full"><Plus className="w-4 h-4" /> Sell another item</Button></Link>
      </div>

      {error && <div className="mb-6"><ErrorState message={error} onRetry={() => void load()} /></div>}

      {!error && listings.length === 0 ? (
        <EmptyState title="You have no listings yet" description="Give something you no longer need a second life." action={<Link to="/sell"><Button className="rounded-full">Create your first listing</Button></Link>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.map((listing) => {
            const primary = [...(listing.images ?? [])].sort((a, b) => a.displayOrder - b.displayOrder)[0]?.url;
            const removing = removingId === listing.id;
            return (
              <Card key={listing.id} className="overflow-hidden">
                <Link to={`/products/${listing.id}`} className="block aspect-[4/3] bg-muted">
                  <ProductImage src={primary} alt={listing.title} className="w-full h-full" />
                </Link>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Badge tone="brand" className="mb-2">{listing.category.icon} {listing.category.name}</Badge>
                      <Link to={`/products/${listing.id}`} className="block font-semibold truncate hover:text-primary">{listing.title}</Link>
                    </div>
                    <span className="text-lg font-extrabold shrink-0">₹{listing.price.toLocaleString()}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                    <ConditionBadge condition={listing.condition} />
                    <span className="inline-flex items-center gap-1"><Eye className="w-3 h-3" /> {listing.viewCount}</span>
                    <span className="inline-flex items-center gap-1"><HandCoins className="w-3 h-3" /> {listing.offerCount ?? 0}</span>
                  </div>
                  <Button type="button" variant="outline" className="w-full mt-5 text-destructive hover:text-destructive" loading={removing} disabled={!!removingId && !removing} onClick={() => void remove(listing)}>
                    {!removing && <Trash2 className="w-4 h-4" />} {removing ? "Removing..." : "Remove listing"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
