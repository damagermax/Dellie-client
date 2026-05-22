import { useState } from 'react';
import { Info, Edit, Check, X } from 'lucide-react';
import { QuantityData } from '@/types/product';

interface QuantityCellProps {
  quantity: QuantityData;
  onSave: (newQuantity: QuantityData) => void;
}

export const QuantityCell = ({ quantity, onSave }: QuantityCellProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuantity, setEditedQuantity] = useState<QuantityData>({ ...quantity });

  const handleSave = () => {
    onSave(editedQuantity);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedQuantity({ ...quantity });
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent, type: keyof QuantityData) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const keys = Object.keys(editedQuantity) as (keyof QuantityData)[];
      const currentIndex = keys.indexOf(type);
      const nextIndex = e.shiftKey ? currentIndex - 1 : currentIndex + 1;
      
      if (nextIndex >= 0 && nextIndex < keys.length) {
        const nextInput = document.getElementById(`qty-${keys[nextIndex]}`);
        if (nextInput) nextInput.focus();
      } else {
        handleSave();
      }
    }
  };

  if (!isExpanded) {
    return (
      <div className="flex items-center gap-1">
        <span>{quantity.available}</span>
        <button 
          onClick={() => setIsExpanded(true)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="View all quantities"
        >
          <Info size={16} />
        </button>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="space-y-1 p-1 bg-gray-50 rounded">
        {Object.entries(editedQuantity).map(([key, value]) => (
          <div key={key} className="flex items-center gap-1 text-sm">
            <label className="w-20 capitalize text-gray-500">{key}:</label>
            <input
              id={`qty-${key}`}
              type="number"
              min="0"
              value={value}
              onChange={(e) => 
                setEditedQuantity(prev => ({
                  ...prev,
                  [key]: parseInt(e.target.value) || 0
                }))
              }
              onKeyDown={(e) => handleKeyDown(e, key as keyof QuantityData)}
              className="w-16 px-1 py-0.5 border rounded text-sm"
              autoFocus={key === 'onHand'}
            />
          </div>
        ))}
        <div className="flex justify-end gap-1 mt-1">
          <button
            onClick={handleSave}
            className="p-0.5 text-green-600 hover:bg-green-50 rounded"
            aria-label="Save changes"
          >
            <Check size={16} />
          </button>
          <button
            onClick={handleCancel}
            className="p-0.5 text-red-600 hover:bg-red-50 rounded"
            aria-label="Cancel"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1 p-1 bg-gray-50 rounded">
      {Object.entries(quantity).map(([key, value]) => (
        <div key={key} className="flex items-center justify-between text-sm">
          <span className="capitalize text-gray-500">{key}:</span>
          <span>{value}</span>
        </div>
      ))}
      <div className="flex justify-end gap-1 mt-1">
        <button
          onClick={() => setIsEditing(true)}
          className="p-0.5 text-blue-600 hover:bg-blue-50 rounded"
          aria-label="Edit quantities"
        >
          <Edit size={14} />
        </button>
        <button
          onClick={() => setIsExpanded(false)}
          className="p-0.5 text-gray-600 hover:bg-gray-100 rounded"
          aria-label="Collapse"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
