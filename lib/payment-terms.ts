import { PaymentTerm } from "@/types/payment-term";

export const LEGACY_PAYMENT_TERM_OPTIONS = [
  { label: "Due on Receipt", value: "due_on_receipt", days: 0 },
  { label: "Net 7 Days", value: "net_7", days: 7 },
  { label: "Net 15 Days", value: "net_15", days: 15 },
  { label: "Net 30 Days", value: "net_30", days: 30 },
  { label: "Net 45 Days", value: "net_45", days: 45 },
  { label: "Net 60 Days", value: "net_60", days: 60 },
  { label: "End of Month (EOM)", value: "eom", days: 0 },
  { label: "50% Upfront, 50% on Completion", value: "milestone_50_50", days: 0 },
  { label: "100% Upfront", value: "full_advance", days: 0 },
  { label: "Installments", value: "installments", days: 0 },
] as const;

const legacyLabelByCode = new Map(LEGACY_PAYMENT_TERM_OPTIONS.map((option) => [option.value, option.label]));
const legacyDaysByCode = new Map(LEGACY_PAYMENT_TERM_OPTIONS.map((option) => [option.value, option.days]));

export function buildPaymentTermOptions(paymentTerms: PaymentTerm[] = []) {
  const options = new Map<string, { label: string; value: string }>();

  LEGACY_PAYMENT_TERM_OPTIONS.forEach((option) => {
    options.set(option.value, { value: option.value, label: option.label });
  });

  paymentTerms.forEach((term) => {
    options.set(term.code, {
      value: term.code,
      label: `${term.name}${term.days ? ` (${term.days} days)` : ""}`,
    });
  });

  return Array.from(options.values());
}

export function getPaymentTermLabel(code?: string, paymentTerms: PaymentTerm[] = []) {
  if (!code) return "-";

  const dynamic = paymentTerms.find((term) => term.code === code);
  if (dynamic) {
    return `${dynamic.name}${dynamic.days ? ` (${dynamic.days} days)` : ""}`;
  }

  return legacyLabelByCode.get(code) || code;
}

export function getLegacyPaymentTermDays(code?: string) {
  if (!code) return 0;
  return legacyDaysByCode.get(code) || 0;
}
