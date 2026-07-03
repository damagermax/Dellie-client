"use client";

import { Divider, Form, message } from "antd";
import { CalendarDays, ChevronDown, Clock3, Package, Truck, WalletCards } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Detail, IdentityPanel } from "@/components/shared/DetailPrimitives";
import { useUpdateSaleMutation } from "@/lib/redux/services";
import { formatDate } from "@/lib/dateUtils";
import { getPaymentTermLabel } from "@/lib/payment-terms";
import type { Sale } from "@/types/index";
import type { PaymentTerm } from "@/types/payment-term";
import { AppModal } from "@/components/ui/AppModal";
import { InputFormItem } from "@/components/ui/AppFormItems";
import type { Address } from "@/types/contact";

import { formatSaleAddress, normalizeSaleAddress } from "./saleFormControllerHelpers";

type SaleOverviewSectionProps = {
  sale: Sale;
  canEdit: boolean;
  isCancelled: boolean;
  isClosed: boolean;
  paymentTerms: PaymentTerm[] | undefined;
  showFulfillmentLocation: boolean;
};

type DeliveryAddressFormValues = {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
};

export function SaleOverviewSection({ sale, canEdit, isCancelled, isClosed, paymentTerms, showFulfillmentLocation }: SaleOverviewSectionProps) {
  const [form] = Form.useForm<DeliveryAddressFormValues>();
  const [deliveryAddressOpen, setDeliveryAddressOpen] = useState(false);
  const [updateSale, { isLoading: isSavingAddress }] = useUpdateSaleMutation();
  const isPickup = sale.fulfillmentMethod === "pickup";
  const customerName = sale.contactId?.name || sale.contactId?.displayName || "Walk-in Customer";
  const customerMeta = [sale.contactId?.email, sale.contactId?.phone].filter(Boolean).join(" · ") || "No contact details provided";
  const locationName = sale.locationId?.name || "Location not set";
  const locationMeta = sale.locationId?.address || "No address provided";
  const deliveryAddress = formatSaleAddress(sale.deliveryAddress);
  const fulfillmentMeta = [locationName, locationMeta !== "No address provided" ? locationMeta : undefined].filter(Boolean).join(" · ");
  const locationLabel = isPickup ? "Pickup Location" : "Delivery Address";
  const locationTitle = isPickup ? locationName : deliveryAddress || "No delivery address provided";
  const locationDescription = isPickup ? locationMeta : showFulfillmentLocation ? locationMeta : `Fulfillment Location: ${fulfillmentMeta || "Location not set"}`;
  const canEditDeliveryAddress = useMemo(() => !isPickup && canEdit && !isCancelled && !isClosed, [canEdit, isCancelled, isClosed, isPickup]);

  useEffect(() => {
    if (!deliveryAddressOpen) return;
    form.setFieldsValue({
      street: sale.deliveryAddress?.street,
      city: sale.deliveryAddress?.city,
      state: sale.deliveryAddress?.state,
      country: sale.deliveryAddress?.country,
      postalCode: sale.deliveryAddress?.postalCode,
    });
  }, [deliveryAddressOpen, form, sale.deliveryAddress]);

  const openDeliveryAddressModal = () => {
    if (!canEditDeliveryAddress) return;
    setDeliveryAddressOpen(true);
  };

  const closeDeliveryAddressModal = () => setDeliveryAddressOpen(false);

  const saveDeliveryAddress = async () => {
    const values = await form.validateFields().catch(() => null);
    if (!values) return;

    const normalizedAddress = normalizeSaleAddress(values as Address);

    try {
      await updateSale({
        id: sale.id,
        deliveryAddress: normalizedAddress || {},
      }).unwrap();
      message.success(normalizedAddress ? "Delivery address updated." : "Delivery address cleared.");
      closeDeliveryAddressModal();
    } catch {
      message.error("Delivery address could not be updated.");
    }
  };

  return (
    <div id="sale-overview" className="scroll-mt-14 pt-5 md:pt-7">
      <div className="md:px-8">
        {isCancelled ? <div className="mb-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">This sale has been cancelled and is currently view-only. Reopen it to make changes.</div> : null}
        {isClosed ? <div className="mb-5 border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">This sale is closed and read-only. Reopen it to make changes.</div> : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <IdentityPanel label="Customer" title={customerName} description={customerMeta} contentClassName="px-3 md:px-0" />
          {canEditDeliveryAddress ? (
            <button
              type="button"
              className="w-full rounded-xl text-left transition hover:bg-gray-50"
              onClick={openDeliveryAddressModal}
            >
              <div className="flex items-start justify-between gap-3 px-3 md:px-0">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-gray-400">{locationLabel}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <p className="truncate text-lg font-medium text-gray-800">{locationTitle}</p>
                    <ChevronDown size={18} className="shrink-0 text-gray-400" />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{locationDescription}</p>
                </div>
              </div>
            </button>
          ) : (
            <IdentityPanel label={locationLabel} title={locationTitle} description={locationDescription} contentClassName="px-3 md:px-0" />
          )}
        </div>
        <Divider className="!md:mt-6" />
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4">
          <Detail className="border-b border-r border-gray-200 pl-3 pb-3 md:pb-0 md:pl-0 md:pr-5 sm:border-b-0 " icon={<CalendarDays size={17} />} label="Sold" value={formatDate(sale.date)} />
          <Detail className="border-b border-gray-200 pl-3 md:pb-0 md:pl-5 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-5" icon={isPickup ? <Package size={17} /> : <Truck size={17} />} label={isPickup ? "Pickup on" : "Deliver by"} value={formatDate(sale.deliveryDate)} />
          <Detail className="border-r border-gray-200 pl-3 pt-3 md:pr-5 md:pt-0 sm:pl-5" icon={<WalletCards size={17} />} label="Terms" value={getPaymentTermLabel(sale.paymentTerms, paymentTerms || [])} />
          <Detail className="pl-3 pt-3 md:pl-5 md:pt-0" icon={<Clock3 size={17} />} label="Payment Due" value={formatDate(sale.dueDate)} />
        </div>
        <Divider className="!my-5" />
      </div>
      {sale.note ? (
        <div className="mx-4 mb-8 sm:mx-8">
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-amber-700">Note</p>
          <p className="text-sm leading-6 text-gray-700">{sale.note}</p>
        </div>
      ) : null}
      <AppModal
        open={deliveryAddressOpen}
        toggle={closeDeliveryAddressModal}
        onOk={saveDeliveryAddress}
        loading={isSavingAddress}
        title="Delivery Address"
        okText="Save Address"
        width={640}
      >
        <Form form={form} layout="vertical" className="grid grid-cols-1 gap-x-5 gap-y-1 p-5 sm:grid-cols-2">
          <InputFormItem className="sm:col-span-2" label="Street Address" name="street" placeholder="Enter street address" />
          <InputFormItem label="City" name="city" placeholder="Enter city" />
          <InputFormItem label="State / Region" name="state" placeholder="Enter state or region" />
          <InputFormItem label="Country" name="country" placeholder="Enter country" />
          <InputFormItem label="Postal Code" name="postalCode" placeholder="Enter postal code" />
        </Form>
      </AppModal>
    </div>
  );
}
