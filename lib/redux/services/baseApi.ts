import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4200";

export const TAG_TYPES = {
  PRODUCT: "Product",
  PRODUCTS: "Products",
  TAG: "Tag",
  TAGS: "Tags",
  STORE: "Store",
  STORES: "Stores",
  DISCOUNT: "Discount",
  DISCOUNTS: "Discounts",
  ORDER: "Order",
  ORDERS: "Orders",
  CATEGORY: "Category",
  CATEGORIES: "Categories",
  LOCATION: "Location",
  LOCATIONS: "Locations",
  CONTACT: "Contact",
  CONTACTS: "Contacts",
  COUPON: "Coupon",
  COUPONS: "Coupons",
  AUTH: "Auth",
  USER: "User",
  USERS: "Users",
  PAYMENT_ACCOUNT: "PAYMENT_ACCOUNT",
  PAYMENT_ACCOUNTS: "PAYMENT_ACCOUNTS",
  SYSTEM: "SYSTEM",
  INVENTORY: "Inventory",
  TRANSACTION: "TRANSACTION",
  TRANSACTIONS: "TRANSACTIONs",
  TAXES: "TAXES",
  TAX: "TAX",
} as const;

export const baseApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      // Add  auth headers here
      //const token = (getState() as RootState).auth.accessToken || localStorage.getItem("accessToken");
      const token = localStorage.getItem("accessToken");

      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: Object.values(TAG_TYPES),
  endpoints: () => ({}),
});
