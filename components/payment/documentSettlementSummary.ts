"use client";

import type { Payment } from "@/types/transaction";
import { TransactionType } from "@/types/transaction";

function roundMoney(value: number) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
}

export function buildDocumentSettlementSummary(document?: { payments?: Payment[] }) {
  const summary = (document?.payments || []).reduce(
    (totals, payment) => {
      const amount = Number(payment.amount || 0);

      if (payment.type === TransactionType.PAYMENT) {
        totals.paidAmount += amount;
      } else if (payment.type === TransactionType.REFUND) {
        totals.refundAmount += amount;
      } else if (payment.type === TransactionType.WRITE_OFF) {
        totals.writeOffAmount += amount;
      }

      return totals;
    },
    { paidAmount: 0, refundAmount: 0, writeOffAmount: 0 },
  );

  const paidAmount = roundMoney(summary.paidAmount);
  const refundAmount = roundMoney(summary.refundAmount);
  const writeOffAmount = roundMoney(summary.writeOffAmount);

  return {
    paidAmount,
    refundAmount,
    writeOffAmount,
    hasRefundAmount: refundAmount > 0,
    hasWriteOffAmount: writeOffAmount > 0,
  };
}
