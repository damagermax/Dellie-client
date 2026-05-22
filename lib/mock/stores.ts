import { Store, StoreStats, StoreActivity } from '@/types/store';
import { faker } from '@faker-js/faker';

const generateStore = (): Store => {
  const plan = faker.helpers.arrayElement(['basic', 'pro', 'enterprise']) as 'basic' | 'pro' | 'enterprise';
  const status = faker.helpers.arrayElement(['active', 'inactive', 'suspended', 'banned']) as 'active' | 'inactive' | 'suspended' | 'banned';
  const billingCycle = faker.helpers.arrayElement(['monthly', 'yearly']) as 'monthly' | 'yearly';
  
  return {
    id: faker.string.uuid(),
    name: `${faker.company.name()} Store`,
    slug: faker.helpers.slugify(faker.company.name().toLowerCase()),
    logo: faker.image.urlLoremFlickr({ category: 'business' }),
    banner: faker.image.urlLoremFlickr({ width: 1200, height: 400, category: 'business' }),
    description: faker.company.catchPhrase(),
    owner: {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
    },
    subscription: {
      plan,
      status: status === 'active' ? 'active' : 'suspended',
      startDate: faker.date.past().toISOString(),
      endDate: faker.date.future().toISOString(),
      billingCycle,
    },
    metrics: {
      totalSales: faker.number.int({ min: 0, max: 10000 }),
      totalRevenue: faker.number.float({ min: 100, max: 100000, precision: 0.01 }),
      totalProducts: faker.number.int({ min: 1, max: 500 }),
      totalOrders: faker.number.int({ min: 0, max: 5000 }),
      conversionRate: faker.number.float({ min: 0.1, max: 5, precision: 0.1 }),
      monthlyGrowth: faker.number.float({ min: -10, max: 30, precision: 0.1 }),
    },
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    status,
    domains: [faker.internet.domainName()],
    settings: {
      currency: faker.finance.currencyCode(),
      timezone: faker.location.timeZone(),
      language: faker.helpers.arrayElement(['en', 'fr', 'es', 'de', 'it']),
    },
  };
};

export const generateStores = (count: number): Store[] => {
  return Array.from({ length: count }, () => generateStore());
};

export const generateStoreActivities = (storeId: string, count: number): StoreActivity[] => {
  const activityTypes = ['order', 'product', 'settings', 'user', 'payment'] as const;
  const actions = {
    order: ['created', 'updated', 'cancelled', 'completed', 'refunded'],
    product: ['created', 'updated', 'deleted', 'stock_updated'],
    settings: ['updated', 'billing_updated', 'plan_changed'],
    user: ['logged_in', 'logged_out', 'created', 'updated', 'deleted'],
    payment: ['succeeded', 'failed', 'refunded', 'disputed'],
  };

  return Array.from({ length: count }, (_, i) => {
    const type = faker.helpers.arrayElement(activityTypes);
    const action = faker.helpers.arrayElement(actions[type]);
    
    return {
      id: faker.string.uuid(),
      storeId,
      type,
      action,
      timestamp: faker.date.recent(30).toISOString(),
      user: {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
      },
      metadata: {
        ip: faker.internet.ip(),
        userAgent: faker.internet.userAgent(),
      },
    };
  });
};

export const generateStoreStats = (): StoreStats => {
  const totalStores = faker.number.int({ min: 100, max: 1000 });
  const activeStores = Math.floor(totalStores * 0.7);
  const newStores = faker.number.int({ min: 5, max: 50 });
  const totalRevenue = faker.number.float({ min: 10000, max: 1000000, precision: 0.01 });
  
  return {
    totalStores,
    activeStores,
    newStores,
    totalRevenue,
    averageRevenue: totalRevenue / totalStores,
    storesByPlan: {
      basic: Math.floor(totalStores * 0.5),
      pro: Math.floor(totalStores * 0.35),
      enterprise: totalStores - Math.floor(totalStores * 0.85),
    },
    storesByStatus: {
      active: activeStores,
      inactive: Math.floor(totalStores * 0.2),
      suspended: Math.floor(totalStores * 0.08),
      banned: Math.floor(totalStores * 0.02),
    },
    recentStores: generateStores(5).map(store => ({
      id: store.id,
      name: store.name,
      createdAt: store.createdAt,
      metrics: store.metrics,
      status: store.status,
    })),
  };
};

// Mock API functions
export const fetchStores = async (page: number = 1, pageSize: number = 10): Promise<{ data: Store[]; total: number }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const allStores = generateStores(100);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  
  return {
    data: allStores.slice(start, end),
    total: allStores.length,
  };
};

export const fetchStoreById = async (id: string): Promise<Store> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const store = generateStore();
  return {
    ...store,
    id, // Ensure the requested ID is used
  };
};

export const fetchStoreStats = async (): Promise<StoreStats> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return generateStoreStats();
};

export const fetchStoreActivities = async (storeId: string, limit: number = 10): Promise<StoreActivity[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return generateStoreActivities(storeId, limit);
};
