"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/redux/store";
import { productsApi } from "@/lib/redux/services/productsApi";

type ProductRefLike =
  | string
  | {
      id?: string;
      _id?: string;
      name?: string;
      parentProductName?: string;
    }
  | undefined
  | null;

type ProductNameLookupItem = {
  id?: string;
  name?: string;
  parentName?: string;
};

type ProductQueryResult = {
  name?: string;
  parentProductName?: string;
};

export function getProductRefId(product: ProductRefLike) {
  if (!product || typeof product === "string") {
    return typeof product === "string" ? product : undefined;
  }

  return product.id || product._id;
}

export function getProductRefName(product: ProductRefLike) {
  if (!product || typeof product === "string") {
    return undefined;
  }

  return product.name;
}

export function getProductParentName(product: ProductRefLike) {
  if (!product || typeof product === "string") {
    return undefined;
  }

  return product.parentProductName;
}

export function resolveVariantProductName(name?: string | null, parentName?: string | null) {
  const trimmedName = name?.trim();
  const trimmedParentName = parentName?.trim();

  if (!trimmedName) {
    return "-";
  }

  if (!trimmedParentName || trimmedParentName === trimmedName) {
    return trimmedName;
  }

  return trimmedName.startsWith(`${trimmedParentName} -`) ? trimmedName : `${trimmedParentName} - ${trimmedName}`;
}

export function useResolvedProductNameMap(items: ProductNameLookupItem[]) {
  const dispatch = useDispatch<AppDispatch>();
  const [parentNamesById, setParentNamesById] = useState<Record<string, string>>({});

  const normalizedItems = useMemo(
    () =>
      items.map((item) => ({
        id: item.id,
        name: item.name,
        parentName: item.parentName,
      })),
    [items],
  );

  useEffect(() => {
    const idsToFetch = Array.from(
      new Set(
        normalizedItems
          .filter((item) => item.id && !item.parentName)
          .map((item) => item.id as string)
          .filter((id) => !parentNamesById[id]),
      ),
    );

    if (!idsToFetch.length) {
      return;
    }

    let active = true;
    const subscriptions = idsToFetch.map((id) => dispatch(productsApi.endpoints.getProduct.initiate(id)));

    Promise.all(
      subscriptions.map(async (subscription, index) => {
        try {
          const result = (await subscription.unwrap()) as ProductQueryResult;
          return { id: idsToFetch[index], parentName: result.parentProductName || "" };
        } catch {
          return { id: idsToFetch[index], parentName: "" };
        }
      }),
    ).then((results) => {
      if (!active) {
        return;
      }

      const nextEntries = results.filter((item) => item.parentName);
      if (!nextEntries.length) {
        return;
      }

      setParentNamesById((current) => ({
        ...current,
        ...Object.fromEntries(nextEntries.map((item) => [item.id, item.parentName])),
      }));
    });

    return () => {
      active = false;
      subscriptions.forEach((subscription) => subscription.unsubscribe());
    };
  }, [dispatch, normalizedItems, parentNamesById]);

  return useMemo(
    () =>
      Object.fromEntries(
        normalizedItems.map((item) => [
          item.id || item.name || "",
          resolveVariantProductName(item.name, item.parentName || (item.id ? parentNamesById[item.id] : undefined)),
        ]),
      ),
    [normalizedItems, parentNamesById],
  );
}

export function ResolvedProductName({
  name,
  product,
  productId,
  className,
  fallback = "-",
}: {
  name?: string;
  product?: ProductRefLike;
  productId?: string;
  className?: string;
  fallback?: string;
}) {
  const id = productId || getProductRefId(product);
  const baseName = name || getProductRefName(product);
  const parentName = getProductParentName(product);
  const resolvedNames = useResolvedProductNameMap([{ id, name: baseName, parentName }]);
  const resolvedName = resolvedNames[id || baseName || ""] || resolveVariantProductName(baseName, parentName);

  return <span className={className}>{resolvedName || fallback}</span>;
}
