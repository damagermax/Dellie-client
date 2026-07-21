import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "@/lib/config/apiBaseUrl";

export const TAG_TYPES = {
  PRODUCT: "Product",
  PRODUCTS: "Products",
  TAG: "Tag",
  TAGS: "Tags",
  STORE: "Store",
  STORES: "Stores",
  STORE_SETTINGS: "StoreSettings",
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
  SYSTEM: "SYSTEM",
  INVENTORY: "Inventory",
  TRANSACTION: "TRANSACTION",
  TRANSACTIONS: "TRANSACTIONs",
  TAXES: "TAXES",
  TAX: "TAX",
  PAYMENT_TERMS: "PAYMENT_TERMS",
  PAYMENT_TERM: "PAYMENT_TERM",
  PAYMENT_METHODS: "PAYMENT_METHODS",
  PAYMENT_METHOD: "PAYMENT_METHOD",
  PRICING_GROUPS: "PRICING_GROUPS",
  PRICING_GROUP: "PRICING_GROUP",
  PURCHASE: "PURCHASE",
  PURCHASES: "PURCHASES",
  SALE: "SALE",
  SALES: "SALES",
  AUDIT_LOGS: "AUDIT_LOGS",
  DELIVERY_ZONES: "DELIVERY_ZONES",
  DELIVERY_ZONE: "DELIVERY_ZONE",
} as const;

export const baseApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
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
