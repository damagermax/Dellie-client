"use client";

import { Drawer, Input, Button, Spin } from "antd";
import { RiSearchLine, RiCloseLine } from "react-icons/ri";
import { useState } from "react";

import PreviewImage from "@/components/ui/PreviewImage";
import { useGetProductsQuery } from "@/lib/redux/services";
import useDebouncedValue from "@/hooks/useDebouncedValue";

interface ProductItem {
  id: string;
  name: string;
  imageUrl?: string | null;
  sku?: string;
}

interface ProductPickerProps {
  value?: string[];
  onChange?: (value: string[]) => void;
}

export default function ProductPicker({ value = [], onChange }: ProductPickerProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);

  const { data, isLoading } = useGetProductsQuery({ search: debouncedSearch, limit: 50 }, { skip: !open });

  const products: ProductItem[] = data?.data || [];

  const handleOpen = () => {
    setDraft([...value]);
    setSearch("");
    setOpen(true);
  };

  const handleToggle = (id: string) => {
    setDraft((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  const handleApply = () => {
    onChange?.(draft);
    setOpen(false);
  };

  const handleRemove = (id: string) => {
    onChange?.((value || []).filter((p) => p !== id));
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-gray-300 p-3 min-h-[48px]">
        {value.length > 0 ? (
          value.map((id) => {
            const product = products.find((p) => p.id === id);
            return (
              <span key={id} className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-sm">
                <PreviewImage width={20} height={20} src={product?.imageUrl} />
                {product?.name || id}
                <RiCloseLine className="cursor-pointer text-gray-400 hover:text-gray-700" size={14} onClick={() => handleRemove(id)} />
              </span>
            );
          })
        ) : (
          <span className="text-sm text-gray-400">No products selected — applies to all products</span>
        )}
        <Button type="dashed" size="small" className="ml-auto" onClick={handleOpen}>
          {value.length > 0 ? "Edit products" : "Select products"}
        </Button>
      </div>

      <Drawer
        title="Select products"
        placement="right"
        width={480}
        open={open}
        onClose={() => setOpen(false)}
        footer={
          <Button type="primary" onClick={handleApply} block>
            Apply ({draft.length} product{draft.length !== 1 ? "s" : ""} selected)
          </Button>
        }
      >
        <Input
          prefix={<RiSearchLine />}
          placeholder="Search products..."
          className="mb-4"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />

        {isLoading ? (
          <div className="flex justify-center py-12"><Spin /></div>
        ) : (
          <div className="grid grid-cols-2 gap-3 max-h-[calc(100vh-280px)] overflow-y-auto">
            {products.map((product) => {
              const isSelected = draft.includes(product.id);
              return (
                <div
                  key={product.id}
                  className={`relative flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                    isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleToggle(product.id)}
                >
                  <PreviewImage width={48} height={48} src={product.imageUrl} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{product.name}</p>
                    <p className="truncate text-xs text-gray-400">{product.sku}</p>
                  </div>
                  {isSelected && (
                    <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                  )}
                </div>
              );
            })}
            {!isLoading && products.length === 0 && (
              <p className="col-span-2 py-8 text-center text-gray-400">No products found</p>
            )}
          </div>
        )}
      </Drawer>
    </>
  );
}
