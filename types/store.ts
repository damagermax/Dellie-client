import { PosSettings, StoreEnabledModules, StoreFeatureSettings, StoreIntegrationsSettings, StorePricingSettings } from "./store-settings";

export interface StoreOwner {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface StoreSubscription {
  plan: "basic" | "pro" | "enterprise";
  status: "active" | "suspended" | "canceled" | "trial";
  startDate: string;
  endDate?: string;
  billingCycle: "monthly" | "yearly";
}

export interface StoreMetrics {
  totalSales: number;
  totalRevenue: number;
  totalProducts: number;
  totalOrders: number;
  conversionRate: number;
  monthlyGrowth: number;
}

export interface Store {
  id: string;
  name: string;
  currencyId?: string;
  storeLink?: string;
  category?: string;
  instagramUsername?: string;
  tiktokUsername?: string;
  facebookPage?: string;
  whatsappNumber?: string;
  isActive: boolean;

  slug: string;
  logo?: string;
  banner?: string;

  description?: string;
  owner: StoreOwner;
  subscription: StoreSubscription;
  metrics: StoreMetrics;
  createdAt: string;
  updatedAt: string;
  status: "active" | "inactive" | "suspended" | "banned";
  domains: string[];
  settings: {
    currency?: string;
    timezone?: string;
    language?: string;
    enabledModules?: StoreEnabledModules;
    pos?: PosSettings;
    pricing?: StorePricingSettings;
    features?: StoreFeatureSettings;
    integrations?: StoreIntegrationsSettings;
  };
}

export interface StoreActivity {
  id: string;
  type: "order" | "product" | "settings" | "user" | "payment";
  action: string;
  timestamp: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  metadata?: Record<string, unknown>;
}

export interface StoreStats {
  totalStores: number;
  activeStores: number;
  newStores: number;
  totalRevenue: number;
  averageRevenue: number;
  storesByPlan: {
    basic: number;
    pro: number;
    enterprise: number;
  };
  storesByStatus: {
    active: number;
    inactive: number;
    suspended: number;
    banned: number;
  };
  recentStores: Pick<Store, "id" | "name" | "createdAt" | "metrics" | "status">[];
}
