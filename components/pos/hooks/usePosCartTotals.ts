"use client";

import { useMemo } from "react";
import type { Tax } from "@/types/index";
import type { PosCartItem, PosPaymentEntry } from "../types";
import { getCartTotals } from "../utils";

export function usePosCartTotals(cart: PosCartItem[], payments: PosPaymentEntry[], selectedTax?: Tax) {
  return useMemo(() => getCartTotals(cart, selectedTax, payments), [cart, payments, selectedTax]);
}
