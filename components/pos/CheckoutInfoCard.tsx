"use client";

type CheckoutInfoCardProps = {
  label: string;
  value: string;
};

export default function CheckoutInfoCard({ label, value }: CheckoutInfoCardProps) {
  return (
    <div className="rounded-xl bg-stone-100 px-3 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">{label}</p>
      <p className="mt-1 truncate text-sm font-medium text-stone-900">{value}</p>
    </div>
  );
}
