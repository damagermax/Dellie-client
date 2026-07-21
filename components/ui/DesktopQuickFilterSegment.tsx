"use client";

import { Segmented } from "antd";

type SegmentOption<T extends string> = {
  label: string;
  value: T;
};

interface DesktopQuickFilterSegmentProps<T extends string> {
  value?: T;
  options: SegmentOption<T>[];
  onChange: (value: T) => void;
}

export function DesktopQuickFilterSegment<T extends string>({ value, options, onChange }: DesktopQuickFilterSegmentProps<T>) {
  return (
    <div className="hidden md:flex md:items-center">
      <Segmented
        size="small"
        value={value}
        options={options}
        onChange={(nextValue) => onChange(nextValue as T)}
        className="!rounded-full !border !border-gray-200/80 !bg-[#fafafad6] !p-1 [&_.ant-segmented-item]:!p-0.5 [&_.ant-segmented-item]:!text-sm [&_.ant-segmented-item]:!rounded-full [&_.ant-segmented-item-selected]:!bg-[#2d837d] [&_.ant-segmented-item-selected]:!text-white"
      />
    </div>
  );
}
