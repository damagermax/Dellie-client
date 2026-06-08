"use client";

import { Dispatch, RefObject, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PaginatedResponse } from "@/types/shared";

type PageQuery = {
  page?: number;
  limit?: number;
};

interface UseMobileInfiniteListArgs<T extends { id?: string }, Q extends PageQuery> {
  query: Q;
  response?: PaginatedResponse<T>;
  isFetching: boolean;
  setQuery: Dispatch<SetStateAction<Q>>;
  getItemId?: (item: T) => string;
}

const defaultGetItemId = <T extends { id?: string }>(item: T) => String(item.id);

const stableQuerySignature = (query: PageQuery) => {
  const rest = { ...query };
  delete rest.page;
  return JSON.stringify(rest);
};

export function useMobileInfiniteList<T extends { id?: string }, Q extends PageQuery>({ query, response, isFetching, setQuery, getItemId = defaultGetItemId }: UseMobileInfiniteListArgs<T, Q>) {
  const [items, setItems] = useState<T[]>([]);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const requestedPageRef = useRef<number>();
  const signature = useMemo(() => stableQuerySignature(query), [query]);
  const data = useMemo(() => response?.data || [], [response?.data]);
  const page = response?.meta?.page || response?.page || query.page || 1;
  const limit = response?.meta?.limit || response?.limit || query.limit || 20;
  const hasNextPage = response?.meta?.hasNextPage ?? data.length === limit;

  useEffect(() => {
    setItems([]);
    requestedPageRef.current = undefined;
  }, [signature]);

  useEffect(() => {
    if (!response) return;

    setItems((current) => {
      if (page <= 1) return data;

      const existingIds = new Set(current.map(getItemId));
      const nextItems = data.filter((item) => !existingIds.has(getItemId(item)));
      return [...current, ...nextItems];
    });
    requestedPageRef.current = undefined;
  }, [data, getItemId, page, response]);

  const loadNextPage = useCallback(() => {
    if (isFetching || !hasNextPage) return;

    const nextPage = page + 1;
    if (requestedPageRef.current === nextPage) return;

    requestedPageRef.current = nextPage;
    setQuery((current) => ({ ...current, page: nextPage, limit } as Q));
  }, [hasNextPage, isFetching, limit, page, setQuery]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadNextPage();
      },
      { rootMargin: "240px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, loadNextPage]);

  return {
    items,
    hasNextPage,
    loadNextPage,
    sentinelRef: sentinelRef as RefObject<HTMLDivElement>,
  };
}
