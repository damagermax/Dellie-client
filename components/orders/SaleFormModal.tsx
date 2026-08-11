"use client";

import { Button, Form, Input, Switch } from "antd";
import { SearchableContactSelect } from "@/components/contacts/SeachableContactSelect";
import ContactsFormModal from "@/components/contacts/ContactsFormModal";
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
import useToggle from "@/hooks/UseToggle";
import { ContactRole } from "@/types/contact";
import PaymentTermsForm from "@/components/settings/PaymentTermsForm";
import { SearchablePaymentTermSelect } from "@/components/settings/SearchablePaymentTermSelect";

interface SaleFormModalProps extends ModalProps {
  sale?: Sale;
  onSaved?: () => void;
}

export default function SaleFormModal({ open, toggle, sale, onSaved }: SaleFormModalProps) {
  const controller = useSaleFormController({ open, toggle, sale, onSaved });
  const [contactOpen, toggleContactOpen] = useToggle();
  const [paymentTermOpen, togglePaymentTermOpen] = useToggle();
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
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-white px-4 py-4 sm:px-5">
            <Button onClick={toggle}>
              Cancel
            </Button>
            {!sale && quotesEnabled && (
              <Button disabled={controller.loading} onClick={() => controller.submit("quote")}>
                Save as Quote
              </Button>
            )}
            <Button type="primary" loading={controller.loading} onClick={() => controller.submit(sale && controller.isQuote ? "quote" : "sale")}>
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
              <div className="flex w-full items-start justify-between gap-4 border border-gray-200 bg-gray-50 px-4 py-3">
                <span className="text-sm text-gray-700">Customer will pick up this sale instead of requesting delivery.</span>
                <div className="flex shrink-0 items-center">
                  <Switch size="small" checked={controller.fulfillmentMethod === "pickup"} onChange={(checked) => controller.form.setFieldValue("fulfillmentMethod", checked ? "pickup" : "delivery")} />
                </div>
              </div>
            </div>
          )}
          <div className={`grid grid-cols-1 gap-x-5 gap-y-1 px-5 pb-8 pt-4 ${inputGridClass}`}>
            <Form.Item name="contactId" label="Contact">
              <SearchableContactSelect role={ContactRole.CUSTOMER} onAddContact={toggleContactOpen} />
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
                  <SearchablePaymentTermSelect onAddPaymentTerm={togglePaymentTermOpen} onChange={controller.handlePaymentTermChange} />
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
      {contactOpen ? (
        <ContactsFormModal
          open={contactOpen}
          toggle={toggleContactOpen}
          hideRoles
          defaultRoles={[ContactRole.CUSTOMER]}
          onSaved={(contact) => {
            if (contact?.id) {
              controller.form.setFieldValue("contactId", contact.id);
            }
          }}
        />
      ) : null}
      {paymentTermOpen ? (
        <PaymentTermsForm
          open={paymentTermOpen}
          toggle={togglePaymentTermOpen}
          onSaved={(paymentTerm) => {
            if (paymentTerm?.code) {
              controller.form.setFieldValue("paymentTerm", paymentTerm.code);
              controller.handlePaymentTermChange(paymentTerm.code);
            }
          }}
        />
      ) : null}
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
