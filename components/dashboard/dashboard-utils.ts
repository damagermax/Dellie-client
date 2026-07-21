export function formatDashboardMoney(currencyCode: string, value: number) {
  return `${currencyCode} ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatChange(changePercent: number | null) {
  if (changePercent === null) return null;
  return `${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(1)}%`;
}

export function getTrendTone(changePercent: number | null, inverse = false) {
  if (changePercent === null) return null;
  const favorable = inverse ? changePercent <= 0 : changePercent >= 0;
  return favorable ? "positive" : "negative";
}
