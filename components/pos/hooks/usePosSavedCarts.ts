"use client";

import { useCallback, useEffect, useState } from "react";
import type { SavedPosCart } from "../types";
import { SAVED_CARTS_KEY, createSavedCartId } from "../utils";

type UsePosSavedCartsParams = {
  currentUserId: string;
  dayKey: string;
};

export function usePosSavedCarts({ currentUserId, dayKey }: UsePosSavedCartsParams) {
  const [savedCarts, setSavedCarts] = useState<SavedPosCart[]>([]);

  const cloneSavedCart = useCallback(
    (entry: SavedPosCart): SavedPosCart => ({
      ...entry,
      cart: Array.isArray(entry?.cart) ? entry.cart.map((item) => ({ ...item })) : [],
      payments: Array.isArray(entry?.payments) ? entry.payments.map((payment) => ({ ...payment })) : [],
      selectedTax: entry?.selectedTax
        ? {
            ...entry.selectedTax,
            items: Array.isArray(entry.selectedTax.items) ? entry.selectedTax.items.map((item) => ({ ...item })) : [],
          }
        : undefined,
      selectedContact: entry?.selectedContact ? { ...entry.selectedContact } : entry?.selectedContact ?? null,
      formValues: entry?.formValues ? { ...entry.formValues } : undefined,
    }),
    [],
  );

  const normalizeSavedCarts = useCallback(
    (entries: SavedPosCart[]) => {
      const seenIds = new Set<string>();
      const normalized = [...entries]
        .sort((left, right) => new Date(right?.savedAt || 0).getTime() - new Date(left?.savedAt || 0).getTime())
        .map((entry) => {
          const nextEntry = cloneSavedCart(entry);
          let nextId = typeof nextEntry?.id === "string" ? nextEntry.id.trim() : "";
          if (!nextId || seenIds.has(nextId)) {
            nextId = createSavedCartId();
          }
          seenIds.add(nextId);
          return {
            ...nextEntry,
            id: nextId,
            savedAt: typeof nextEntry?.savedAt === "string" && nextEntry.savedAt ? nextEntry.savedAt : new Date().toISOString(),
          };
        });

      return normalized;
    },
    [cloneSavedCart],
  );

  const readSavedCarts = useCallback(() => {
    if (!currentUserId) return [] as SavedPosCart[];
    const raw = localStorage.getItem(SAVED_CARTS_KEY);
    if (!raw) return [] as SavedPosCart[];

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [] as SavedPosCart[];
      const normalized = normalizeSavedCarts(parsed);
      localStorage.setItem(SAVED_CARTS_KEY, JSON.stringify(normalized));
      return normalized
        .filter((entry: SavedPosCart) => entry?.userId === currentUserId && entry?.dayKey === dayKey)
        .map(cloneSavedCart);
    } catch {
      return [] as SavedPosCart[];
    }
  }, [cloneSavedCart, currentUserId, dayKey, normalizeSavedCarts]);

  const writeSavedCarts = useCallback(
    (nextEntries: SavedPosCart[]) => {
      const raw = localStorage.getItem(SAVED_CARTS_KEY);
      let otherEntries: SavedPosCart[] = [];

      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            otherEntries = normalizeSavedCarts(parsed).filter((entry: SavedPosCart) => !(entry?.userId === currentUserId && entry?.dayKey === dayKey));
          }
        } catch {
          otherEntries = [];
        }
      }

      const normalizedNextEntries = normalizeSavedCarts(nextEntries);
      const mergedEntries = normalizeSavedCarts([...otherEntries, ...normalizedNextEntries]);
      localStorage.setItem(SAVED_CARTS_KEY, JSON.stringify(mergedEntries));
      setSavedCarts(normalizedNextEntries.map(cloneSavedCart));
    },
    [cloneSavedCart, currentUserId, dayKey, normalizeSavedCarts],
  );

  const upsertSavedCart = useCallback(
    (entry: SavedPosCart) => {
      const normalizedEntry = normalizeSavedCarts([entry])[0];
      const nextEntries = [normalizedEntry, ...savedCarts.filter((savedCart) => savedCart.id !== normalizedEntry.id)];
      writeSavedCarts(nextEntries);
      return normalizedEntry;
    },
    [normalizeSavedCarts, savedCarts, writeSavedCarts],
  );

  const removeSavedCart = useCallback(
    (savedCartId: string) => {
      writeSavedCarts(savedCarts.filter((entry) => entry.id !== savedCartId));
    },
    [savedCarts, writeSavedCarts],
  );

  useEffect(() => {
    setSavedCarts(readSavedCarts());
  }, [readSavedCarts]);

  return {
    savedCarts,
    setSavedCarts,
    readSavedCarts,
    writeSavedCarts,
    upsertSavedCart,
    normalizeSavedCarts,
    removeSavedCart,
  };
}
