import { ArrowDownOutlined, ArrowUpOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { Card, Tooltip } from "antd";

interface KPICardProps {
    title: string;
    value: number;
    change: number;
    data: number[];
    prefix?: string;
    suffix?: string;
    tooltip?: string;
}

export function KPICard({ title, value, change, data, prefix = "", suffix = "", tooltip }: KPICardProps) {
    const isPositive = change >= 0;

    return (
        <Card className="h-full" bodyStyle={{ padding: "16px" }}>
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center text-gray-500 text-sm mb-1">
                        {title}
                        {tooltip && (
                            <Tooltip title={tooltip}>
                                <InfoCircleOutlined className="ml-1" />
                            </Tooltip>
                        )}
                    </div>
                    <div className="text-2xl font-semibold">
                        {prefix}
                        {value.toLocaleString()}
                        {suffix}
                    </div>
                    <div className={`flex items-center mt-1 text-sm ${isPositive ? "text-green-500" : "text-red-500"}`}>
                        {isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                        <span className="ml-1">{Math.abs(change)}% vs last period</span>
                    </div>
                </div>
            </div>
        </Card>
    );
}
