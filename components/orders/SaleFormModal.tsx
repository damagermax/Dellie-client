"use client";

import { Button, Form, Input, Select, Switch } from "antd";
import { SearchableContactSelect } from "@/components/contacts/SeachableContactSelect";
import { SearchableLocationSelect } from "@/components/location/SearchableLocationSelect";
import { TaxSelector } from "@/components/settings/TaxSelector";
import { SearchableCurrenciesSelect } from "@/components/system/SearchableCurrencySelect";
import { ExchangeRateFormItem } from "@/components/system/ExchangeRateFormItem";
import { AppModal, ModalProps } from "@/components/ui/AppModal";
import { DatePickerFormItem } from "@/components/ui/AppFormItems";
import AppTable from "@/components/ui/AppTable";
import { Sale } from "@/types/index";
import { ProductVariantSelectorModal } from "@/components/products/ProductVariantSelectorModal";
import { buildSaleFormColumns, SaleProductSearchResults, SaleSummaryPanel } from "./saleFormSections";
import { useSaleFormController } from "./useSaleFormController";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";

interface SaleFormModalProps extends ModalProps {
  sale?: Sale;
  onSaved?: () => void;
}

export default function SaleFormModal({ open, toggle, sale, onSaved }: SaleFormModalProps) {
  const controller = useSaleFormController({ open, toggle, sale, onSaved });
  const quotesEnabled = useSelector((state: RootState) => state.currentUser.storeSettings.features?.quotesEnabled !== false);
  const inputGridClass = controller.multiCurrencyEnabled && controller.paymentTermsEnabled ? "sm:grid-cols-2 xl:grid-cols-4" : "sm:grid-cols-2 xl:grid-cols-3";
  const columns = buildSaleFormColumns({
    currency: controller.currency,
    differentProductTax: controller.differentProductTax,
    formatMoney: controller.formatMoney,
    lineTotal: controller.lineTotal,
    onOpenLineTax: (productId) => {
      controller.setSelectedTaxProductId(productId);
      controller.toggleTaxSelector();
    },
    onRemoveLine: controller.removeLineItem,
    onUpdateLineItem: controller.updateLineItem,
  });

  return (
    <>
      <AppModal
        open={open}
        toggle={toggle}
        title={sale ? (controller.isQuote ? "Edit Quote" : "Edit Sale") : "New Sale"}
        width={1000}
        loading={controller.loading}
        footer={
          <div className="flex flex-col-reverse gap-3 border-t border-gray-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-5">
            <Button className="w-full sm:w-auto" onClick={toggle}>
              Cancel
            </Button>
            {!sale && quotesEnabled && (
              <Button className="w-full sm:w-auto" disabled={controller.loading} onClick={() => controller.submit("quote")}>
                Save as Quote
              </Button>
            )}
            <Button className="w-full sm:w-auto" type="primary" loading={controller.loading} onClick={() => controller.submit(sale && controller.isQuote ? "quote" : "sale")}>
              {sale ? (controller.isQuote ? "Save Quote" : "Save Changes") : "Save Sale"}
            </Button>
          </div>
        }
      >
        <Form form={controller.form} disabled={controller.loading || Boolean(sale?.locked || sale?.receiptStatus === "received")} layout="vertical">
          <Form.Item name="fulfillmentMethod" hidden>
            <Input />
          </Form.Item>
          {controller.pickupEnabled && controller.deliveryEnabled && (
            <div className="px-5 pt-5">
              <div className="flex w-full flex-col gap-4 border border-gray-200 bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-gray-700">Customer will pick up this sale instead of requesting delivery.</span>
                <Switch size="small" checked={controller.fulfillmentMethod === "pickup"} onChange={(checked) => controller.form.setFieldValue("fulfillmentMethod", checked ? "pickup" : "delivery")} />
              </div>
            </div>
          )}
          <div className={`grid grid-cols-1 gap-x-5 gap-y-1 px-5 pb-8 pt-4 ${inputGridClass}`}>
            <Form.Item name="contactId" label="Contact" rules={[{ required: true, message: "Select contact" }]}>
              <SearchableContactSelect onAddContact={() => {}} />
            </Form.Item>
            <DatePickerFormItem label="Date" name="date" placeholder="date" className="" />
            <DatePickerFormItem
              label={controller.fulfillmentMethod === "pickup" ? "Scheduled Pickup Date" : "Expected Delivery Date"}
              name="deliveryDate"
              placeholder={controller.fulfillmentMethod === "pickup" ? "Pickup Date" : "Delivery Date"}
              className=""
            />
            <Form.Item name="location" label={controller.fulfillmentMethod === "pickup" ? "Pickup Location" : "Fulfillment Location"}>
              <SearchableLocationSelect />
            </Form.Item>
            {controller.multiCurrencyEnabled ? (
              <>
                <Form.Item label="Currency" name="currencyId">
                  <SearchableCurrenciesSelect />
                </Form.Item>
                <ExchangeRateFormItem name="rate" className="w-full" />
              </>
            ) : null}
            {controller.paymentTermsEnabled ? (
              <>
                <Form.Item name="paymentTerm" label="Payment Term">
                  <Select options={controller.paymentTermOptions} placeholder="Payment Term" onChange={controller.handlePaymentTermChange} />
                </Form.Item>
                <DatePickerFormItem label="Due Date" name="dueDate" placeholder="Due Date" className="" />
              </>
            ) : null}
          </div>

          <AppTable columns={columns} dataSource={controller.lineItems || []} rowKey="id" />
          <SaleProductSearchResults availableProducts={controller.availableProducts} searchValue={controller.searchValue} onSearchChange={controller.setSearchValue} onSelectProduct={controller.selectProduct} />

          {controller.lineItems.length > 0 ? (
            <SaleSummaryPanel
              currency={controller.currency}
              deliveryFee={controller.deliveryFee}
              differentProductTax={controller.differentProductTax}
              discount={controller.discount}
              discountOptions={controller.discountOptions}
              formatMoney={controller.formatMoney}
              fulfillmentMethod={controller.fulfillmentMethod}
              onChangeDeliveryFee={controller.setDeliveryFee}
              onChangeDiscountType={(value) => controller.setDiscount((current) => ({ ...current, discountType: value }))}
              onChangeDiscountValue={(value) => controller.setDiscount((current) => ({ ...current, discountValue: value }))}
              onOpenTaxSelector={controller.toggleTaxSelector}
              rate={controller.rate}
              storeCurrencyCode={controller.storeCurrencyCode}
              summary={controller.summary}
            />
          ) : null}
        </Form>
      </AppModal>
      <ProductVariantSelectorModal parent={controller.variantParent} onClose={controller.closeVariantSelector} onSelect={(variant) => (controller.addProduct(variant), controller.closeVariantSelector())} />
      <TaxSelector
        handleTaxSelect={controller.handleSelectTax}
        isDeferentProductTax={controller.differentProductTax}
        toggleDeferentProductTax={() => controller.setDifferentProductTax((current) => !current)}
        open={controller.openTaxSelector}
        toggle={() => (controller.toggleTaxSelector(), controller.resetSelectedTaxProduct())}
      />
    </>
  );
}
