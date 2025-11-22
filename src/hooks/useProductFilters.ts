import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export interface ProductFilters {
  category: string;
  search: string;
  date: string;
  bestSeller: string;
  limitedTimeOffer: string;
  page: string;
}

const DEBOUNCE_DELAY = 500;

export function useProductFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Local state for immediate UI updates
  const [localFilters, setLocalFilters] = useState<ProductFilters>({
    category: "",
    search: "",
    date: "",
    bestSeller: "",
    limitedTimeOffer: "",
    page: "1",
  });

  // Debounced filters for API calls
  const [debouncedFilters, setDebouncedFilters] = useState<ProductFilters>({
    category: "",
    search: "",
    date: "",
    bestSeller: "",
    limitedTimeOffer: "",
    page: "1",
  });

  // Initialize from URL
  useEffect(() => {
    const filters: ProductFilters = {
      category: searchParams.get("category") || "",
      search: searchParams.get("search") || "",
      date: searchParams.get("date") || "",
      bestSeller: searchParams.get("bestSeller") || "",
      limitedTimeOffer: searchParams.get("limitedTimeOffer") || "",
      page: searchParams.get("page") || "1",
    };
    setLocalFilters(filters);
    setDebouncedFilters(filters);
  }, [searchParams]);

  // Debounce effect for all filters except page
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters((prev) => ({
        ...prev,
        category: localFilters.category,
        search: localFilters.search,
        date: localFilters.date,
        bestSeller: localFilters.bestSeller,
        limitedTimeOffer: localFilters.limitedTimeOffer,
      }));
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [
    localFilters.category,
    localFilters.search,
    localFilters.date,
    localFilters.bestSeller,
    localFilters.limitedTimeOffer,
  ]);

  // Update page immediately (no debounce)
  useEffect(() => {
    setDebouncedFilters((prev) => ({
      ...prev,
      page: localFilters.page,
    }));
  }, [localFilters.page]);

  // Update URL params
  const updateURLParams = useCallback(
    (newParams: Partial<ProductFilters>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(newParams).forEach(([key, value]) => {
        if (value && value !== "") {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      // Reset to page 1 when filters change (except when changing page itself)
      if (
        newParams.category !== undefined ||
        newParams.search !== undefined ||
        newParams.date !== undefined ||
        newParams.bestSeller !== undefined ||
        newParams.limitedTimeOffer !== undefined
      ) {
        params.set("page", "1");
        setLocalFilters((prev) => ({ ...prev, page: "1" }));
      }

      const newURL = `${window.location.pathname}?${params.toString()}`;
      router.replace(newURL, { scroll: false });
    },
    [searchParams, router]
  );

  // Update filter handlers
  const updateFilter = useCallback(
    (key: keyof ProductFilters, value: string) => {
      setLocalFilters((prev) => ({ ...prev, [key]: value }));
      updateURLParams({ [key]: value });
    },
    [updateURLParams]
  );

  return {
    localFilters,
    debouncedFilters,
    updateFilter,
    updateURLParams,
  };
}

