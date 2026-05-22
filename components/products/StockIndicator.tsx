'use client';

interface StockIndicatorProps {
  quantity: number;
  onChange?: (quantity: number) => void;
}

export function StockIndicator({ quantity, onChange }: StockIndicatorProps) {
  const getStockColor = (qty: number) => {
    if (qty > 10) return 'bg-green-100 text-green-800';
    if (qty > 0) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (onChange) {
    return (
      <input
        type="number"
        min="0"
        value={quantity}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className={`w-20 px-2 py-1 text-sm rounded border ${
          quantity > 10 
            ? 'border-green-200' 
            : quantity > 0 
              ? 'border-yellow-200' 
              : 'border-red-200'
        } focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500`}
      />
    );
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStockColor(quantity)}`}>
      {quantity} in stock
    </span>
  );
}
