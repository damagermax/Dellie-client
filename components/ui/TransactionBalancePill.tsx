"use client";

interface TransactionBalancePillProps {
  balance?: number;
  currencyCode?: string;
}

export function TransactionBalancePill({ balance = 0, currencyCode = "" }: TransactionBalancePillProps) {
  const normalizedBalance = Number(balance || 0);
  const isPaid = normalizedBalance === 0;
  const isNegative = normalizedBalance < 0;

  if (isPaid) {
    return <p className="w-fit rounded-full border border-green-600 px-2 font-semibold text-green-600">Paid</p>;
  }

  return (
    <p className={`w-fit rounded-full border px-2 font-semibold ${isNegative ? "border-red-600 text-red-600" : "border-amber-600 text-amber-600"}`}>
      {currencyCode} {normalizedBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
    </p>
  );
}
