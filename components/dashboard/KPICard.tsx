interface KPICardProps {
  title: string;
  value: number;
  tooltip?: string;
}

export function KPICard({ title, value, tooltip }: KPICardProps) {
  return (
    <div className="h-full rounded-sm border border-gray-200 bg-white p-4">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center text-gray-500 text-sm mb-1">
            <span>{title}</span>
            {tooltip ? <span className="ml-1 cursor-help text-xs text-gray-400" title={tooltip}>i</span> : null}
          </div>
          <div className="text-2xl font-semibold">{value.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}
