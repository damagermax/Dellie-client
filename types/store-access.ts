export const StorePermission = {
  CONTACTS_VIEW: "contacts.view",
  CONTACTS_MANAGE: "contacts.manage",
  PRODUCTS_VIEW: "products.view",
  PRODUCTS_MANAGE: "products.manage",
  SALES_VIEW: "sales.view",
  SALES_MANAGE: "sales.manage",
  PURCHASES_VIEW: "purchases.view",
  PURCHASES_MANAGE: "purchases.manage",
  EXPENSES_VIEW: "expenses.view",
  EXPENSES_MANAGE: "expenses.manage",
  INVENTORY_VIEW: "inventory.view",
  INVENTORY_MANAGE: "inventory.manage",
  PAYMENTS_VIEW: "payments.view",
  PAYMENTS_MANAGE: "payments.manage",
  SETTINGS_VIEW: "settings.view",
  SETTINGS_MANAGE: "settings.manage",
  REPORTS_VIEW: "reports.view",
} as const;

export type StorePermission = (typeof StorePermission)[keyof typeof StorePermission];

export interface StoreAccess {
  id: string;
  name: string;
  slug?: string;
  isActive?: boolean;
  currencyId?: string;
  role?: string;
  permissions?: StorePermission[];
  status?: "pending" | "active" | "disabled";
  isDefault?: boolean;
}
