import { useState, useEffect } from "react";
import { fetchListings } from "@/services/listingApi";
import { ListingDto } from "@marketplace/shared";

interface State {
  listings: ListingDto[];
  loading: boolean;
  error: string | null;
}

export function useListings(limit?: number, options?: { search?: string; category?: string }) {
  const [state, setState] = useState<State>({ listings: [], loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    setState({ listings: [], loading: true, error: null });
    fetchListings(limit, options)
      .then((listings) => {
        if (!cancelled) setState({ listings, loading: false, error: null });
      })
      .catch((e: any) => {
        if (!cancelled) setState({ listings: [], loading: false, error: e.message });
      });
    return () => {
      cancelled = true;
    };
  }, [limit, options?.search, options?.category]);

  return state;
}
