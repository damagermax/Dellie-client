import { AppStatistic } from "../ui/AppStatistic";

import { MdAttachMoney, MdBarChart, MdPeople, MdShoppingCart, MdTrendingUp } from "react-icons/md";

export default function OrdersStatistics() {
    const statistics = [
        {
            title: "Total Orders",
            value: 100,
            icon: <MdShoppingCart size={24} color="#00ACC1" />, // deeper cyan
            bgcolor: "#E0F7FA", // light cyan
        },
        {
            title: "To Be Paid",
            value: 1000,
            icon: <MdAttachMoney size={24} color="#FFB300" />, // deeper orange
            bgcolor: "#FFF3E0", // light orange
        },
        {
            title: "Completed ",
            value: 500,
            icon: <MdPeople size={24} color="#43A047" />, // deeper green
            bgcolor: "#E8F5E9", // light green
        },
        {
            title: "Pending ",
            value: 2000,
            icon: <MdBarChart size={24} color="#1E88E5" />, // deeper blue
            bgcolor: "#E3F2FD", // light blue
        },
        {
            title: "Total Profit",
            value: 500,
            icon: <MdTrendingUp size={24} color="#8E24AA" />, // deeper purple
            bgcolor: "#F3E5F5", // light purple
        },
    ];
    return (
        <section className=" grid grid-cols-5   border border-solid border-x-0 bg-[#fafafa]  border-gray-100">
            {statistics.map((data, key) => (
                <AppStatistic
                    key={key}
                    icon={data.icon}
                    title={data.title}
                    background={data.bgcolor}
                    style={{
                        borderRight: key !== 4 ? "1px solid" : "none",
                    }}
                />
            ))}
        </section>
    );
}
