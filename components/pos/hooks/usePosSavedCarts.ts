"use client";

import { useCallback, useEffect, useState } from "react";
import type { SavedPosCart } from "../types";
import { SAVED_CARTS_KEY } from "../utils";

type UsePosSavedCartsParams = {
  currentUserId: string;
  dayKey: string;
};

export function usePosSavedCarts({ currentUserId, dayKey }: UsePosSavedCartsParams) {
  const [savedCarts, setSavedCarts] = useState<SavedPosCart[]>([]);

  const readSavedCarts = useCallback(() => {
    if (!currentUserId) return [] as SavedPosCart[];
    const raw = localStorage.getItem(SAVED_CARTS_KEY);
    if (!raw) return [] as SavedPosCart[];

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [] as SavedPosCart[];
      return parsed.filter((entry: SavedPosCart) => entry?.userId === currentUserId && entry?.dayKey === dayKey);
    } catch {
      return [] as SavedPosCart[];
    }
  }, [currentUserId, dayKey]);

  const writeSavedCarts = useCallback(
    (nextEntries: SavedPosCart[]) => {
      const raw = localStorage.getItem(SAVED_CARTS_KEY);
      let otherEntries: SavedPosCart[] = [];

      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            otherEntries = parsed.filter((entry: SavedPosCart) => !(entry?.userId === currentUserId && entry?.dayKey === dayKey));
          }
        } catch {
          otherEntries = [];
        }
      }

      localStorage.setItem(SAVED_CARTS_KEY, JSON.stringify([...otherEntries, ...nextEntries]));
      setSavedCarts(nextEntries);
    },
    [currentUserId, dayKey],
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
    removeSavedCart,
  };
}
