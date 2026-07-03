import { Payment } from "@/types/transaction";

const PAYMENT_EDIT_WINDOW_MS = 5 * 60 * 1000;

export function canMutatePayment(payment?: Pick<Payment, "createdAt"> | null, now = Date.now()) {
  const createdAtValue = payment?.createdAt ? new Date(payment.createdAt).getTime() : Number.NaN;

  if (!Number.isFinite(createdAtValue)) {
    return false;
  }

  return now - createdAtValue <= PAYMENT_EDIT_WINDOW_MS;
}
