import { useState, useEffect } from "react";
import { getSellerSchema } from "@/services/schemaApi";
import { CategorySchema } from "@marketplace/shared";

interface State {
  schema: CategorySchema | null;
  loading: boolean;
  error: string | null;
}

export function useCategorySchema(categoryId: string | null) {
  const [state, setState] = useState<State>({ schema: null, loading: false, error: null });

  useEffect(() => {
    if (!categoryId) {
      setState({ schema: null, loading: false, error: null });
      return;
    }
    let cancelled = false;
    setState({ schema: null, loading: true, error: null });
    getSellerSchema(categoryId)
      .then((schema) => {
        if (!cancelled) setState({ schema, loading: false, error: null });
      })
      .catch((e: any) => {
        if (!cancelled) setState({ schema: null, loading: false, error: e.message });
      });
    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  return state;
}
