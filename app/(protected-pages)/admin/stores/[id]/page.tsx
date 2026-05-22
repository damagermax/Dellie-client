'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Button, 
  Card, 
  Tabs, 
  Tag, 
  Space, 
  Timeline, 
  List, 
  Avatar, 
  Badge, 
  Row, 
  Col, 
  Statistic,
  Progress
} from 'antd';
import { 
  ArrowLeftOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  CloseCircleOutlined, 
  DollarOutlined, 
  ShoppingOutlined,
  UserOutlined,
  FileTextOutlined,
  SettingOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { fetchStoreById, fetchStoreActivities } from '@/lib/mock/stores';
import { formatDistanceToNow } from 'date-fns';

interface StoreActivity {
  id: string;
  type: string;
  action: string;
  timestamp: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  metadata?: Record<string, any>;
}

interface Store {
  id: string;
  name: string;
  logo?: string;
  domains: string[];
  status: string;
  owner: {
    name: string;
    email: string;
    phone?: string;
  };
  subscription: {
    plan: string;
    status: string;
    billingCycle: string;
    startDate: string;
    endDate?: string;
  };
  metrics: {
    totalRevenue: number;
    totalOrders: number;
    totalSales: number;
    totalProducts: number;
    monthlyGrowth: number;
    conversionRate: number;
    visitors?: number;
    categories?: number;
  };
  settings?: {
    timezone?: string;
    currency?: string;
  };
  createdAt: string;
}

export default function StoreDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [store, setStore] = useState<Store | null>(null);
  const [activities, setActivities] = useState<StoreActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  useEffect(() => {
    const loadStore = async () => {
      try {
        setLoading(true);
        const [storeData, activitiesData] = await Promise.all([
          fetchStoreById(params.id as string),
          fetchStoreActivities(params.id as string, 10)
        ]);
        setStore(storeData);
        setActivities(activitiesData);
      } catch (error) {
        console.error('Failed to load store:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadStore();
    }
  }, [params.id]);

  const loadMoreActivities = async () => {
    try {
      setActivitiesLoading(true);
      const newActivities = await fetchStoreActivities(params.id as string, 5);
      setActivities(prev => [...prev, ...newActivities]);
    } catch (error) {
      console.error('Failed to load more activities:', error);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleOutlined className="text-green-500" />;
      case 'suspended':
        return <CloseCircleOutlined className="text-red-500" />;
      default:
        return <ClockCircleOutlined className="text-yellow-500" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingOutlined className="text-blue-500" />;
      case 'payment':
        return <DollarOutlined className="text-green-500" />;
      case 'user':
        return <UserOutlined className="text-purple-500" />;
      case 'product':
        return <FileTextOutlined className="text-orange-500" />;
      default:
        return <SettingOutlined className="text-gray-500" />;
    }
  };

  // Add missing components
  const ActivityLogTab = ({ 
    activities, 
    loading, 
    onLoadMore 
  }: { 
    activities: StoreActivity[]; 
    loading: boolean; 
    onLoadMore: () => void 
  }) => (
    <Card>
      <List
        itemLayout="horizontal"
        dataSource={activities}
        loading={loading}
        loadMore={
          <div className="text-center mt-4">
            <Button onClick={onLoadMore} loading={loading}>
              Load More
            </Button>
          </div>
        }
        renderItem={(activity) => (
          <List.Item>
            <List.Item.Meta
              avatar={
                <Avatar 
                  className="flex items-center justify-center"
                  style={{ backgroundColor: '#f0f2f5' }}
                  icon={getActivityIcon(activity.type)}
                />
              }
              title={
                <div className="flex justify-between">
                  <span className="font-medium">{activity.action}</span>
                  <span className="text-gray-400 text-sm">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </span>
                </div>
              }
              description={
                <div className="text-gray-600">
                  <div>By {activity.user.name} ({activity.user.email})</div>
                  {activity.metadata && (
                    <div className="mt-1 text-sm">
                      {Object.entries(activity.metadata).map(([key, value]) => (
                        <div key={key}>
                          <span className="text-gray-400">{key}:</span> {String(value)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );

  const SettingsTab = ({ store }: { store: Store }) => (
    <Card>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Store Settings</h3>
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h4 className="font-medium mb-2">General Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-500 text-sm">Store Name</div>
                  <div>{store.name}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-sm">Primary Domain</div>
                  <div>{store.domains[0]}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-sm">Timezone</div>
                  <div>{store.settings?.timezone || 'Not set'}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-sm">Currency</div>
                  <div>{store.settings?.currency || 'USD'}</div>
                </div>
              </div>
            </div>

            <div className="border-b pb-4">
              <h4 className="font-medium mb-2">Subscription</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-500 text-sm">Current Plan</div>
                  <div className="capitalize">{store.subscription.plan}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-sm">Billing Cycle</div>
                  <div className="capitalize">{store.subscription.billingCycle}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-sm">Status</div>
                  <Tag 
                    color={
                      store.subscription.status === 'active' ? 'green' :
                      store.subscription.status === 'suspended' ? 'red' : 'default'
                    }
                    className="capitalize"
                  >
                    {store.subscription.status}
                  </Tag>
                </div>
                <div>
                  <div className="text-gray-500 text-sm">Next Billing Date</div>
                  <div>
                    {store.subscription.endDate ? 
                      new Date(store.subscription.endDate).toLocaleDateString() : 
                      'N/A'}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Danger Zone</h4>
              <div className="p-4 border border-red-100 bg-red-50 rounded">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div>
                    <h5 className="font-medium text-red-700">
                      {store.status === 'suspended' ? 'Reactivate Store' : 'Suspend Store'}
                    </h5>
                    <p className="text-sm text-red-600">
                      {store.status === 'suspended' 
                        ? 'Reactivate this store to make it accessible to customers.'
                        : 'Temporarily suspend this store. Customers will not be able to access it.'}
                    </p>
                  </div>
                  <Button 
                    danger={store.status !== 'suspended'} 
                    type={store.status === 'suspended' ? 'primary' : 'default'}
                    className="mt-2 sm:mt-0"
                  >
                    {store.status === 'suspended' ? 'Reactivate Store' : 'Suspend Store'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!store) {
    return <div>Store not found</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => router.back()}
          className="mr-4"
        >
          Back to Stores
        </Button>
        <h1 className="text-2xl font-bold">{store.name}</h1>
        <Tag 
          color={
            store.status === 'active' ? 'green' :
            store.status === 'suspended' ? 'red' : 'default'
          }
          className="ml-4 capitalize"
        >
          {store.status}
        </Tag>
      </div>

      <Tabs
        defaultActiveKey="overview"
        items={[
          {
            key: 'overview',
            label: (
              <span>
                <BarChartOutlined className="mr-1" />
                Overview
              </span>
            ),
            children: (
              <OverviewTab 
                store={store} 
                activities={activities}
                loadMoreActivities={loadMoreActivities}
                activitiesLoading={activitiesLoading}
              />
            ),
          },
          {
            key: 'activity',
            label: (
              <span>
                <ClockCircleOutlined className="mr-1" />
                Activity Log
                {activities.length > 0 && (
                  <Badge 
                    count={activities.length} 
                    size="small" 
                    className="ml-2"
                    style={{ backgroundColor: '#1890ff' }}
                  />
                )}
              </span>
            ),
            children: (
              <ActivityLogTab 
                activities={activities} 
                loading={activitiesLoading}
                onLoadMore={loadMoreActivities}
              />
            ),
          },
          {
            key: 'settings',
            label: (
              <span>
                <SettingOutlined className="mr-1" />
                Settings
              </span>
            ),
            children: <SettingsTab store={store} />,
          },
        ]}
      />
    </div>
  );
}

const OverviewTab = ({ store, activities, loadMoreActivities, activitiesLoading }: { 
  store: Store; 
  activities: StoreActivity[];
  loadMoreActivities: () => void;
  activitiesLoading: boolean;
}) => {
  return (
    <div className="space-y-6">
      <Row gutter={[16, 16]}>
        <Col span={24} md={8}>
          <Card title="Store Information">
            <div className="space-y-4">
              <div>
                <div className="text-gray-500">Store Name</div>
                <div className="font-medium">{store.name}</div>
              </div>
              <div>
                <div className="text-gray-500">Domain</div>
                <div>{store.domains[0]}</div>
              </div>
              <div>
                <div className="text-gray-500">Created</div>
                <div>{new Date(store.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          </Card>
        </Col>
        
        <Col span={24} md={8}>
          <Card title="Owner Information">
            <div className="space-y-4">
              <div>
                <div className="text-gray-500">Owner Name</div>
                <div className="font-medium">{store.owner.name}</div>
              </div>
              <div>
                <div className="text-gray-500">Email</div>
                <div>{store.owner.email}</div>
              </div>
              {store.owner.phone && (
                <div>
                  <div className="text-gray-500">Phone</div>
                  <div>{store.owner.phone}</div>
                </div>
              )}
            </div>
          </Card>
        </Col>
        
        <Col span={24} md={8}>
          <Card title="Subscription">
            <div className="space-y-4">
              <div>
                <div className="text-gray-500">Plan</div>
                <Tag color="blue" className="capitalize">
                  {store.subscription.plan}
                </Tag>
              </div>
              <div>
                <div className="text-gray-500">Status</div>
                <Tag 
                  color={
                    store.subscription.status === 'active' ? 'green' : 'red'
                  }
                  className="capitalize"
                >
                  {store.subscription.status}
                </Tag>
              </div>
              <div>
                <div className="text-gray-500">Billing Cycle</div>
                <div className="capitalize">{store.subscription.billingCycle}</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]}>
        <Col span={24} md={16}>
          <Card title="Store Metrics" className="h-full">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={12} lg={6}>
                <Card size="small" className="h-full">
                  <Statistic 
                    title="Total Revenue" 
                    value={store.metrics.totalRevenue} 
                    prefix="$" 
                    precision={2}
                    className="text-blue-600"
                  />
                  <div className="mt-2 text-sm text-gray-500">
                    {store.metrics.monthlyGrowth > 0 ? (
                      <span className="text-green-500">
                        ↑ {store.metrics.monthlyGrowth}% this month
                      </span>
                    ) : (
                      <span className="text-red-500">
                        ↓ {Math.abs(store.metrics.monthlyGrowth)}% this month
                      </span>
                    )}
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={12} lg={6}>
                <Card size="small" className="h-full">
                  <Statistic 
                    title="Total Orders" 
                    value={store.metrics.totalOrders}
                    className="text-purple-600"
                  />
                  <div className="mt-2 text-sm text-gray-500">
                    {store.metrics.totalSales} items sold
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={12} lg={6}>
                <Card size="small" className="h-full">
                  <Statistic 
                    title="Total Products" 
                    value={store.metrics.totalProducts}
                    className="text-green-600"
                  />
                  <div className="mt-2 text-sm text-gray-500">
                    in {store.metrics.categories || 5} categories
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={12} lg={6}>
                <Card size="small" className="h-full">
                  <Statistic 
                    title="Conversion Rate" 
                    value={store.metrics.conversionRate}
                    suffix="%"
                    precision={1}
                    className="text-orange-600"
                  />
                  <div className="mt-2 text-sm text-gray-500">
                    from {store.metrics.visitors || 'N/A'} visitors
                  </div>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col span={24} md={8}>
          <Card title="Recent Activity" className="h-full">
            <Timeline
              mode="left"
              items={activities.slice(0, 5).map(activity => ({
                color: 'blue',
                label: formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true }),
                children: (
                  <div className="text-sm">
                    <div className="font-medium">{activity.action}</div>
                    <div className="text-gray-500">
                      {activity.user.name} • {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </div>
                  </div>
                ),
              }))}
            />
            {activities.length > 5 && (
              <div className="text-center mt-4">
                <Button type="link" onClick={loadMoreActivities} loading={activitiesLoading}>
                  View More
                </Button>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
