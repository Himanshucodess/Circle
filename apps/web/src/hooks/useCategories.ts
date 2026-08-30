import { useState, useEffect } from "react";
import { fetchCategories } from "@/services/categoryApi";
import { CategoryDto } from "@marketplace/shared";

interface State {
  categories: CategoryDto[];
  loading: boolean;
  error: string | null;
}

export function useCategories() {
  const [state, setState] = useState<State>({ categories: [], loading: true, error: null });

  const load = async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const categories = await fetchCategories();
      setState({ categories, loading: false, error: null });
    } catch (e: any) {
      setState({ categories: [], loading: false, error: e.message });
    }
  };

  useEffect(() => {
    load();
  }, []);

  return { ...state, reload: load };
}
