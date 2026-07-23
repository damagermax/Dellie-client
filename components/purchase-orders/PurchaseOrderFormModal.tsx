"use client";

import { AppModal, ModalProps } from "../ui/AppModal";
import { Button, Form, Select } from "antd";
import { DatePickerFormItem } from "../ui/AppFormItems";
import { SearchableContactSelect } from "../contacts/SeachableContactSelect";
import { Purchase } from "@/types/index";
import { SearchableCurrenciesSelect } from "../system/SearchableCurrencySelect";
import AppTable from "../ui/AppTable";
import { SearchableLocationSelect } from "../location/SearchableLocationSelect";
import dayjs from "dayjs";
import { ExchangeRateFormItem } from "../system/ExchangeRateFormItem";

import { TaxSelector } from "../settings/TaxSelector";
import { ProductVariantSelectorModal } from "../products/ProductVariantSelectorModal";
import { buildPurchaseFormColumns, ProductLineItem, PurchaseProductSearchResults, PurchaseSummaryPanel } from "./purchaseFormSections";
import { usePurchaseOrderFormController } from "./usePurchaseOrderFormController";

interface PurchaseOrderFormModalProps extends ModalProps {
  purchase?: Purchase;
  onSaved?: () => void;
}

export function PurchaseOrderFormModal({ open, toggle, purchase, onSaved }: PurchaseOrderFormModalProps) {
  const controller = usePurchaseOrderFormController({ open, toggle, purchase, onSaved });
  const inputGridClass = controller.multiCurrencyEnabled && controller.paymentTermsEnabled ? "sm:grid-cols-2 xl:grid-cols-4" : "sm:grid-cols-2 xl:grid-cols-3";

  const productColumns = buildPurchaseFormColumns({
    currency: controller.currency,
    formatMoney: controller.formatMoney,
    isDifferentProductTax: controller.isDeferentProductTax,
    onOpenLineTax: (productId) => {
      controller.setSelectedTaxProductId(productId);
      controller.toggleTaxSelector();
    },
    onRemoveLine: controller.removeLineItem,
    onUpdateLineItem: controller.updateLineItem,
    calculateLineTotal: controller.calculateLineTotal,
  });

  return (
    <>
      <AppModal
        open={open}
        toggle={toggle}
        title={purchase ? "Edit Purchase" : "New Purchase"}
        width={1000}
        loading={controller.loading}
        footer={
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-white px-4 py-4 sm:px-5">
            <Button onClick={toggle}>
              Cancel
            </Button>
            <Button type="primary" loading={controller.loading} onClick={controller.handleSubmit}>
              {purchase ? "Save Changes" : "Save Purchase"}
            </Button>
          </div>
        }
      >
        <Form form={controller.form} disabled={controller.cannotEdit || controller.loading} layout="vertical" initialValues={{ date: dayjs(), dueDate: dayjs() }}>
          <div className={`grid grid-cols-1 gap-x-5 gap-y-1 p-5 pb-8 ${inputGridClass}`}>
            <Form.Item name="contactId" label="Contact">
              <SearchableContactSelect onAddContact={() => {}} />
            </Form.Item>
            <DatePickerFormItem label="Date" name="date" placeholder="date" className="" />
            <DatePickerFormItem label="Expected Delivery Date" name="deliveryDate" placeholder="Delivery Date" className="" />
            <Form.Item name="location" label="Location">
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

          <AppTable columns={productColumns} dataSource={controller.lineItems || []} rowKey={(record: ProductLineItem) => record.id} />
          <PurchaseProductSearchResults products={controller.products} searchValue={controller.searchValue} onSearchChange={controller.setSearchValue} onSelectProduct={controller.selectProduct} />

          <PurchaseSummaryPanel
            currency={controller.currency}
            discount={controller.discount}
            discountOptions={controller.discountOptions}
            formatMoney={controller.formatMoney}
            isDifferentProductTax={controller.isDeferentProductTax}
            onChangeDiscountType={(value) => controller.setDiscount((current) => ({ ...current, discountType: value }))}
            onChangeDiscountValue={(value) => controller.setDiscount((current) => ({ ...current, discountValue: value }))}
            onOpenTaxSelector={controller.toggleTaxSelector}
            rate={controller.rate}
            storeCurrencyCode={controller.storeCurrencyCode}
            summary={controller.summary}
          />
        </Form>
      </AppModal>
      <ProductVariantSelectorModal parent={controller.variantParent} onClose={controller.closeVariantSelector} onSelect={(variant) => (controller.addLineItem(variant), controller.closeVariantSelector())} />

      <TaxSelector
        handleTaxSelect={controller.handleTaxSelect}
        isDeferentProductTax={controller.isDeferentProductTax}
        toggleDeferentProductTax={controller.toggleDeferentProductTax}
        open={controller.openTaxSelector}
        toggle={() => (controller.toggleTaxSelector(), controller.clearSelectedTaxProduct())}
      />
    </>
  );
}

export default PurchaseOrderFormModal;
