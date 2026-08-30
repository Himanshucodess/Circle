import { useState, useEffect } from "react";
import { fetchListings } from "@/services/listingApi";
import { ListingDto } from "@marketplace/shared";

interface State {
  listings: ListingDto[];
  loading: boolean;
  error: string | null;
}

export function useListings(limit?: number) {
  const [state, setState] = useState<State>({ listings: [], loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    setState({ listings: [], loading: true, error: null });
    fetchListings(limit)
      .then((listings) => {
        if (!cancelled) setState({ listings, loading: false, error: null });
      })
      .catch((e: any) => {
        if (!cancelled) setState({ listings: [], loading: false, error: e.message });
      });
    return () => {
      cancelled = true;
    };
  }, [limit]);

  return state;
}
