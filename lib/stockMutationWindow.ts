type StockMutationEvent = {
  createdAt?: string | Date | null;
  fulfilledAt?: string | Date | null;
  returnedAt?: string | Date | null;
};

const STOCK_MUTATION_WINDOW_MS = 24 * 60 * 60 * 1000;

export function canMutateStockEvent(event?: StockMutationEvent | null, now = Date.now()) {
  const eventTime = event?.createdAt || event?.fulfilledAt || event?.returnedAt;
  const createdAtValue = eventTime ? new Date(eventTime).getTime() : Number.NaN;

  if (!Number.isFinite(createdAtValue)) {
    return false;
  }

  return now - createdAtValue <= STOCK_MUTATION_WINDOW_MS;
}
