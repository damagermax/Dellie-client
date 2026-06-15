export type StoreModuleKey = "catalog" | "storefront" | "sales" | "pos" | "purchases" | "expenses" | "contacts" | "cashBook";

export type StoreEnabledModules = Record<StoreModuleKey, boolean>;
export type PosCustomerMode = "walk_in_default" | "prompt_before_checkout" | "require_customer";
export type PosFulfillmentDefault = "fulfill_now" | "pending";
export type PosReceiptPaperSize = "compact" | "full_page";

export interface PosSettings {
  counterName?: string;
  defaultLocationId?: string;
  customerMode: PosCustomerMode;
  defaultTaxId?: string;
  applyTaxByDefault: boolean;
  fulfillmentDefault: PosFulfillmentDefault;
  allowFulfillmentChoiceAtCheckout: boolean;
  receiptAutoOpen: boolean;
  receiptPaperSize: PosReceiptPaperSize;
}

export interface StoreSettings {
  enabledModules: StoreEnabledModules;
  pos: PosSettings;
  businessProfile: StoreBusinessProfile;
  canChangeCurrency: boolean;
}

export interface StoreBusinessProfile {
  logo: string;
  name: string;
  category: string;
  storeLink: string;
  description: string;
  currencyId: string;
  whatsappNumber: string;
  instagramUsername: string;
  facebookPage: string;
  tiktokUsername: string;
}

export const DEFAULT_ENABLED_MODULES: StoreEnabledModules = {
  catalog: true,
  storefront: true,
  sales: true,
  pos: true,
  purchases: true,
  expenses: true,
  contacts: true,
  cashBook: true,
};

export const DEFAULT_POS_SETTINGS: PosSettings = {
  counterName: "",
  defaultLocationId: undefined,
  customerMode: "walk_in_default",
  defaultTaxId: undefined,
  applyTaxByDefault: false,
  fulfillmentDefault: "fulfill_now",
  allowFulfillmentChoiceAtCheckout: false,
  receiptAutoOpen: true,
  receiptPaperSize: "full_page",
};

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  enabledModules: DEFAULT_ENABLED_MODULES,
  pos: DEFAULT_POS_SETTINGS,
  businessProfile: {
    logo: "",
    name: "",
    category: "",
    storeLink: "",
    description: "",
    currencyId: "",
    whatsappNumber: "",
    instagramUsername: "",
    facebookPage: "",
    tiktokUsername: "",
  },
  canChangeCurrency: true,
};

export interface UpdateStoreSettingsInput {
  enabledModules?: Partial<StoreEnabledModules>;
  pos?: Partial<PosSettings>;
  businessProfile?: Partial<StoreBusinessProfile>;
}
