import { CategoryScale, ChartData, Chart as ChartJS, ChartOptions, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function SalesChart() {
    const data: ChartData<"line"> = {
        labels: months,
        datasets: [
            {
                label: "Revenue",
                data: [12000, 19000, 15000, 25000, 20000, 28000, 32000],
                borderColor: "rgb(24, 144, 255)",
                backgroundColor: "rgba(24, 144, 255, 0.5)",
                tension: 0.3,
                yAxisID: "y",
            },
            {
                label: "Orders",
                data: [120, 190, 150, 250, 200, 280, 320],
                borderColor: "rgb(82, 196, 26)",
                backgroundColor: "rgba(82, 196, 26, 0.5)",
                tension: 0.3,
                yAxisID: "y1",
            },
        ],
    };

    const options: ChartOptions<"line"> = {
        responsive: true,
        interaction: {
            mode: "index",
            intersect: false,
        },
        plugins: {
            title: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const label = context.dataset.label || "";
                        if (context.parsed.y === null) return "";

                        if (context.datasetIndex === 0) {
                            return `${label}: ${new Intl.NumberFormat("en-GH", {
                                style: "currency",
                                currency: "GHS",
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                            }).format(context.parsed.y)}`;
                        }
                        return `${label}: ${context.parsed.y} orders`;
                    },
                },
            },
        },
        scales: {
            y: {
                type: "linear" as const,
                display: true,
                position: "left" as const,
                title: {
                    display: true,
                    text: "Revenue (GHS)",
                },
                ticks: {
                    callback: function (value: any) {
                        return "GHS " + value.toLocaleString();
                    },
                },
            },
            y1: {
                type: "linear" as const,
                display: true,
                position: "right" as const,
                grid: {
                    drawOnChartArea: false,
                },
                title: {
                    display: true,
                    text: "Orders",
                },
            },
        },
    };

    return (
        <div className="w-full h-80 mt-4">
            <Line 
                options={{
                    ...options,
                    responsive: true,
                    maintainAspectRatio: false,
                }} 
                data={data} 
            />
        </div>
    );
}
