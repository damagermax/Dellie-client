import { Tag } from "antd";

type ProductRow = {
  key: string;
  name: string;
  sku: string;
  sales: number;
  revenue: number;
  stock: number;
};

const data: ProductRow[] = [
  {
    key: "1",
    name: "Wireless Earbuds Pro",
    sku: "WEB-001",
    sales: 154,
    revenue: 30799.46,
    stock: 24,
  },
  {
    key: "2",
    name: "Smartphone X",
    sku: "SPX-2023",
    sales: 128,
    revenue: 25600.0,
    stock: 15,
  },
  {
    key: "3",
    name: "Bluetooth Speaker",
    sku: "BTS-022",
    sales: 98,
    revenue: 8819.02,
    stock: 8,
  },
  {
    key: "4",
    name: "Laptop Stand",
    sku: "LS-012",
    sales: 75,
    revenue: 4499.25,
    stock: 32,
  },
  {
    key: "5",
    name: "Wireless Mouse",
    sku: "WM-056",
    sales: 62,
    revenue: 5579.38,
    stock: 0,
  },
];

const maxSales = Math.max(...data.map((item) => item.sales));

function stockColor(stock: number) {
  if (stock <= 0) return "red";
  if (stock <= 10) return "gold";
  return "green";
}

function stockLabel(stock: number) {
  if (stock <= 0) return "Out of stock";
  return `${stock} in stock`;
}

export function TopProducts() {
  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="font-medium text-gray-950">Top Selling Products</p>
          <p className="mt-1 text-xs text-gray-500">Best sellers ranked by units sold and revenue contribution.</p>
        </div>
        <a className="text-sm text-blue-600">View All</a>
      </div>

      <div className="space-y-4">
        {data.map((item, index) => {
          const width = `${Math.max(18, (item.sales / maxSales) * 100)}%`;

          return (
            <div key={item.key} className="rounded-2xl border border-gray-100 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f3f7ff] text-sm font-semibold text-[#2563eb]">
                      #{index + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-950">{item.name}</p>
                      <p className="mt-1 text-xs text-gray-500">{item.sku}</p>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-gray-950">
                    GHS {item.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <Tag color={stockColor(item.stock)} className="!mt-2 !mr-0 !rounded-full !px-2">
                    {stockLabel(item.stock)}
                  </Tag>
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between gap-3 text-xs text-gray-500">
                  <span>{item.sales.toLocaleString()} units sold</span>
                  <span>{Math.round((item.sales / maxSales) * 100)}% of top seller volume</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-[#2563eb]" style={{ width }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
