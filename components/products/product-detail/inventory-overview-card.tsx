"use client";

import type { AvailableLocation, InventoryLocation } from "./types";
import { formatQuantity, numberValue } from "./utils";

export function InventoryOverviewCard({ locations, maxQuantity, totalOnHand, totalReserved, totalIncoming }: { locations: InventoryLocation[]; maxQuantity: number; totalOnHand: number; totalReserved: number; totalIncoming: number }) {
  return (
    <section className="bg-[#f3f3f3] px-3 py-5 md:px-5 md:py-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 text-base text-gray-600">
            <span>Quantity</span>
            <span className="inline-flex items-center gap-1 rounded-md bg-[#b7c3dc] px-2.5 py-0.5 text-sm font-medium text-[#1f365f]">
              on hand
              <span className="text-base leading-none">↵</span>
            </span>
            <span>for all locations</span>
          </p>
          <div className="mt-3 flex flex-wrap items-end gap-2">
            <span className="text-2xl font-semibold leading-none tracking-normal text-gray-800">{formatQuantity(totalOnHand)}</span>
            <span className="pb-1 text-lg text-gray-600">unit(s)</span>
            {totalReserved > 0 && <span className="mb-0.5 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">{formatQuantity(totalReserved)} reserved</span>}
            {totalIncoming > 0 && <span className="mb-0.5 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">{formatQuantity(totalIncoming)} incoming</span>}
          </div>
        </div>
      </div>

      <div className="mt-2 border-t border-gray-200" />

      <div className="mt-5 space-y-2.5">
        {locations.length ? (
          locations.map((location) => <InventoryLocationRow key={location.id || location.locationId || location.locationName} location={location} maxQuantity={maxQuantity} />)
        ) : (
          <div className="rounded-md border border-dashed border-gray-300 bg-white/70 px-4 py-6 text-center text-sm text-gray-500">No inventory has been recorded for this stock product yet.</div>
        )}
      </div>
    </section>
  );
}

function InventoryLocationRow({ location, maxQuantity }: { location: InventoryLocation; maxQuantity: number }) {
  const onHand = numberValue(location.onHand);
  const available = numberValue(location.available);
  const reserved = numberValue(location.reserved);
  const incoming = numberValue(location.incoming);
  const onHandWidth = Math.max((onHand / maxQuantity) * 100, onHand > 0 ? 4 : 0);
  const reservedWidth = onHand > 0 ? Math.min((reserved / onHand) * 100, 100) : 0;
  const incomingWidth = Math.max((incoming / maxQuantity) * 100, incoming > 0 ? 4 : 0);

  return (
    <div className="rounded-md py-3">
      <div className="flex flex-wrap items-center gap-2.5 text-base">
        <span className="font-medium text-gray-900">{formatQuantity(onHand)}</span>
        <span className="font-semibold text-gray-700">{location.locationName || "-"}</span>
        <span className="text-gray-500">→</span>
        <span className="text-sm text-gray-500">{formatQuantity(available)} available</span>
        {reserved > 0 && <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">{formatQuantity(reserved)} reserved</span>}
        {incoming > 0 && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">{formatQuantity(incoming)} incoming</span>}
      </div>
      <div className="mt-3 flex h-7 items-center gap-2">
        <div className="relative h-full rounded-md bg-[#176ebe]" style={{ width: `${onHandWidth}%` }}>
          {reserved > 0 && (
            <div className="group absolute inset-y-1 right-1 rounded-md border-2 border-[#176ebe] bg-[#d8edff]" style={{ width: `${reservedWidth}%` }}>
              <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-3 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-700 px-2.5 py-1.5 text-xs font-medium text-white group-hover:block">
                {formatQuantity(reserved)} reserved
                <span className="absolute bottom-full left-1/2 h-3 w-3 -translate-x-1/2 translate-y-1/2 rotate-45 bg-gray-700" />
              </div>
            </div>
          )}
        </div>
        {incoming > 0 && (
          <div className="group relative h-full rounded-md border border-[#a76a35] bg-[repeating-linear-gradient(135deg,#fff7ed_0,#fff7ed_3px,#b47a42_3px,#b47a42_4px)]" style={{ width: `${incomingWidth}%` }}>
            <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-3 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-700 px-2.5 py-1.5 text-xs font-medium text-white group-hover:block">
              {formatQuantity(incoming)} incoming
              <span className="absolute bottom-full left-1/2 h-3 w-3 -translate-x-1/2 translate-y-1/2 rotate-45 bg-gray-700" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function AvailableLocationsCard({ locations }: { locations: AvailableLocation[] }) {
  return (
    <section className="bg-[#f3f3f3] px-4 py-5 md:px-5 md:py-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-base text-gray-600">Available locations</p>
          <div className="mt-3 flex flex-wrap items-end gap-2">
            <span className="text-2xl font-semibold leading-none tracking-normal text-gray-800">{locations.length}</span>
            <span className="pb-1 text-lg text-gray-600">locations available</span>
          </div>
        </div>
      </div>

      <div className="mt-2 border-t border-gray-200" />

      <div className="mt-5 space-y-2.5">
        {locations.length ? (
          locations.map((location) => (
            <div key={location.id || location.locationId || location.locationName} className="rounded-md bg-white/70 px-4 py-3">
              <p className="text-sm font-medium text-gray-900">{location.locationName || "-"}</p>
            </div>
          ))
        ) : (
          <div className="rounded-md border border-dashed border-gray-300 bg-white/70 px-4 py-6 text-center text-sm text-gray-500">This product is not available in any location yet.</div>
        )}
      </div>
    </section>
  );
}
