"use client";

type PosSummaryRowProps = {
  label: string;
  value: string;
  strong?: boolean;
};

export default function PosSummaryRow({ label, value, strong = false }: PosSummaryRowProps) {
  return (
    <div className={`flex items-center justify-between gap-4 text-sm ${strong ? "font-semibold text-stone-950" : "text-stone-700"}`}>
      <span className={strong ? "text-stone-900" : "text-stone-500"}>{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
