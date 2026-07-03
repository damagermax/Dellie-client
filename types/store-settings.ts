export type StoreModuleKey = "catalog" | "storefront" | "sales" | "pos" | "purchases" | "expenses" | "contacts";

export type StoreEnabledModules = Record<StoreModuleKey, boolean>;
export type PosCustomerMode = "walk_in_default" | "prompt_before_checkout" | "require_customer";
export type PosFulfillmentDefault = "fulfill_now" | "pending";
export type PosReceiptPaperSize = "compact" | "full_page";
export type StoreDocumentTemplateKey = "modern" | "minimal" | "bold" | "classic";

export interface StorePricingSettings {
  enableTradePrice: boolean;
}

export interface StoreFeatureSettings {
  pickupEnabled: boolean;
  deliveryEnabled: boolean;
  multiCurrencyEnabled: boolean;
  paymentTermsEnabled: boolean;
  expiryEnabled: boolean;
  stockBundleEnabled: boolean;
  nonStockBundleEnabled: boolean;
  salesReturnsEnabled: boolean;
  purchaseReturnsEnabled: boolean;
  refundPaymentsEnabled: boolean;
  writeOffPaymentsEnabled: boolean;
}

export interface StoreDocumentsSettings {
  purchaseOrderTemplate: StoreDocumentTemplateKey;
  salesInvoiceTemplate: StoreDocumentTemplateKey;
  salesReceiptTemplate: StoreDocumentTemplateKey;
  posReceiptTemplate: StoreDocumentTemplateKey;
}

export interface PaystackIntegrationSettings {
  connected: boolean;
  publicKey: string;
  secretKey: string;
  webhookSecret: string;
}

export interface StripeIntegrationSettings {
  connected: boolean;
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
}

export interface StoreIntegrationsSettings {
  paystack: PaystackIntegrationSettings;
  stripe: StripeIntegrationSettings;
}

export interface PosSettings {
  counterName?: string;
  defaultLocationId?: string;
  customerMode: PosCustomerMode;
  defaultTaxId?: string;
  defaultTaxByLocationId: Record<string, string | undefined>;
  applyTaxByDefault: boolean;
  fulfillmentDefault: PosFulfillmentDefault;
  allowFulfillmentChoiceAtCheckout: boolean;
  receiptAutoOpen: boolean;
  receiptPaperSize: PosReceiptPaperSize;
}

export interface StoreSettings {
  enabledModules: StoreEnabledModules;
  pos: PosSettings;
  pricing: StorePricingSettings;
  features: StoreFeatureSettings;
  documents: StoreDocumentsSettings;
  integrations: StoreIntegrationsSettings;
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
};

export const DEFAULT_POS_SETTINGS: PosSettings = {
  counterName: "",
  defaultLocationId: undefined,
  customerMode: "walk_in_default",
  defaultTaxId: undefined,
  defaultTaxByLocationId: {},
  applyTaxByDefault: false,
  fulfillmentDefault: "fulfill_now",
  allowFulfillmentChoiceAtCheckout: false,
  receiptAutoOpen: true,
  receiptPaperSize: "full_page",
};

export const DEFAULT_PRICING_SETTINGS: StorePricingSettings = {
  enableTradePrice: false,
};

export const DEFAULT_FEATURE_SETTINGS: StoreFeatureSettings = {
  pickupEnabled: true,
  deliveryEnabled: true,
  multiCurrencyEnabled: true,
  paymentTermsEnabled: true,
  expiryEnabled: true,
  stockBundleEnabled: true,
  nonStockBundleEnabled: true,
  salesReturnsEnabled: true,
  purchaseReturnsEnabled: true,
  refundPaymentsEnabled: true,
  writeOffPaymentsEnabled: true,
};

export const DEFAULT_DOCUMENTS_SETTINGS: StoreDocumentsSettings = {
  purchaseOrderTemplate: "modern",
  salesInvoiceTemplate: "modern",
  salesReceiptTemplate: "minimal",
  posReceiptTemplate: "minimal",
};

export const DEFAULT_INTEGRATIONS_SETTINGS: StoreIntegrationsSettings = {
  paystack: {
    connected: false,
    publicKey: "",
    secretKey: "",
    webhookSecret: "",
  },
  stripe: {
    connected: false,
    publishableKey: "",
    secretKey: "",
    webhookSecret: "",
  },
};

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  enabledModules: DEFAULT_ENABLED_MODULES,
  pos: DEFAULT_POS_SETTINGS,
  pricing: DEFAULT_PRICING_SETTINGS,
  features: DEFAULT_FEATURE_SETTINGS,
  documents: DEFAULT_DOCUMENTS_SETTINGS,
  integrations: DEFAULT_INTEGRATIONS_SETTINGS,
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
  pricing?: Partial<StorePricingSettings>;
  features?: Partial<StoreFeatureSettings>;
  documents?: Partial<StoreDocumentsSettings>;
  integrations?: Partial<{
    paystack: Partial<PaystackIntegrationSettings>;
    stripe: Partial<StripeIntegrationSettings>;
  }>;
  businessProfile?: Partial<StoreBusinessProfile>;
}
