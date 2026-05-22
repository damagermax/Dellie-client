const AppTag = ({ value }: { value: string }) => {
  const colorMap: Record<string, string> = {
    Expired: "bg-red-400/50",
    unpaid: "bg-red-400/50 text-red-800 border-red-300",
    draft: "bg-gray-100 text-gray-800 border-gray-300",
    inactive: "bg-gray-100 text-gray-800 border-gray-300",
    Locked: "bg-gray-100 text-gray-800 border-gray-300",
    Opened: "bg-green-100 text-green-800 border-green-300",
    paid: "bg-green-100 text-green-800 border-green-300",
    active: "bg-green-100 text-green-800 border-green-300",
    Scheduled: "bg-yellow-400/50 text-yellow-800 border-yellow-300",
    partial: "bg-yellow-400/50 text-yellow-800 border-yellow-300",
    Pending: "bg-orange-400/50",
    Shipped: "bg-blue-400/50",
    Delivered: "bg-green-400/50",
    Canceled: "bg-red-400/50",
  };

  return <span className={`px-2 py-1 border rounded-full text-xs capitalize ${colorMap[value]}`}>{value}</span>;
};

export default AppTag;
