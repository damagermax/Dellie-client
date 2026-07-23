export function paymentStatusLabel(status?: string | null) {
  if (status === "partial") return "Partial Payment";
  if (!status) return "unpaid";
  return status;
}
