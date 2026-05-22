import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Bar, BarChart } from "recharts";

type ChartDataPoint = {
  name: string; // e.g. "6 Nov 2025"
  uv: number;
  pv: number;
  amt: number;
};

export function generateLast30DaysData(): ChartDataPoint[] {
  const today = new Date();
  const data: ChartDataPoint[] = [];

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    const name = date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    data.push({
      name,
      uv: Math.floor(Math.random() * 5000) + 1000, // mock data
      pv: Math.floor(Math.random() * 5000) + 1000,
      amt: Math.floor(Math.random() * 3000) + 500,
    });
  }

  return data;
}

const SimpleAreaChart = () => {
  return (
    <BarChart style={{ width: "100%", maxWidth: "100%", maxHeight: "400px", aspectRatio: 1.618 }} responsive data={generateLast30DaysData()}>
      <Bar dataKey="uv" fill="GREEN" />
      <XAxis dataKey="name" />
      <YAxis width="auto" />
      <Tooltip />
    </BarChart>
  );
};

export function ProductPerformance() {
  return (
    <div className="bg-white rounded-md border border-gray-200 p-5 ">
      <h2>Product Performance</h2>
      <p className="text-xs text-gray-600 mb-5">Last 30 days</p>
      <SimpleAreaChart />
    </div>
  );
}
