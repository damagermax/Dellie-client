"use client";

import React from "react";
import { Alert, DatePicker, Form, Input, InputNumber, Select } from "antd";
import { AppModal } from "@/components/ui/AppModal";
import { SearchableContactSelect } from "@/components/contacts/SeachableContactSelect";
import { SearchablePaymentMethodSelect } from "@/components/paymentMethods/SearchablePaymentMethodSelect";
import { SearchableCurrenciesSelect } from "@/components/system/SearchableCurrencySelect";
import { ExchangeRateFormItem } from "@/components/system/ExchangeRateFormItem";
import { Purchase, PurchaseLandedCost } from "@/types/index";
import { buildLandedCostProductColumns, landedCostAllocationOptions, landedCostScopeOptions, LandedCostProductSelector } from "./purchaseLandedCostSections";
import { usePurchaseLandedCostController } from "./usePurchaseLandedCostController";

interface PurchaseOrderLandedCostModalProps {
  open: boolean;
  toggle: () => void;
  purchase: Purchase;
  onSaved: () => void;
  initialValues?: PurchaseLandedCost;
}

export default function PurchaseOrderLandedCostModal({ open, toggle, purchase, onSaved, initialValues }: PurchaseOrderLandedCostModalProps) {
  const controller = usePurchaseLandedCostController({ open, purchase, onSaved, toggle, initialValues });
  const productColumns = React.useMemo(
    () => buildLandedCostProductColumns({ purchase, onUpdateLineWeight: controller.updateLineWeight }),
    [controller.updateLineWeight, purchase],
  );

  return (
    <AppModal
      open={open}
      toggle={toggle}
      title={initialValues ? "Edit Landed Cost" : "Add Landed Cost"}
      onOk={controller.submit}
      width={760}
      loading={controller.isSaving}
      okText={initialValues ? "Save Changes" : "Add Cost"}
    >
      <Form form={controller.form} layout="vertical" className="!px-5 py-4" initialValues={{ allocationMethod: "BUY_VALUE", appliesTo: "ALL_ITEMS" }}>
        <Form.Item className="!mb-3" name="name" label="Cost Name" rules={[{ required: true, message: "Enter a cost name" }]}>
          <Input placeholder="Freight, customs, handling" />
        </Form.Item>

        <div className="grid gap-4 md:grid-cols-2">
          <Form.Item className="!mb-3" name="contactId" label="Contact" rules={[{ required: true, message: "Select the contact paid for this landed cost" }]}>
            <SearchableContactSelect onAddContact={() => {}} />
          </Form.Item>
          <Form.Item className="!mb-3" name="date" label="Payment Date" rules={[{ required: true, message: "Select the payment date" }]}>
            <DatePicker className="!w-full" format="DD MMM YYYY" />
          </Form.Item>
          <Form.Item className="!mb-3" name="currencyId" label="Currency" rules={[{ required: true, message: "Select a currency" }]}>
            <SearchableCurrenciesSelect />
          </Form.Item>
          <ExchangeRateFormItem
            name="exchangeRate"
            className="!mb-3"
            rules={[
              { required: true, message: "Enter an exchange rate" },
              { type: "number", min: 0.000001, message: "Exchange rate must be greater than 0" },
            ]}
          />
          <Form.Item className="!mb-3" name="amount" label={`Amount (${controller.amountCurrencyCode})`} rules={[{ required: true, message: "Enter an amount" }]}>
            <InputNumber className="!w-full" min={0.01} controls={false} />
          </Form.Item>
          <Form.Item className="!mb-3" name="allocationMethod" label="Allocate Cost By" rules={[{ required: true }]}>
            <Select options={landedCostAllocationOptions as unknown as { value: string; label: string }[]} />
          </Form.Item>
          <Form.Item className="!mb-3" name="paymentMethodId" label="Payment Method">
            <SearchablePaymentMethodSelect allowClear />
          </Form.Item>
          <Form.Item className="!mb-3" name="appliesTo" label="Apply Cost To" rules={[{ required: true }]}>
            <Select options={landedCostScopeOptions as unknown as { value: string; label: string }[]} onChange={controller.handleAppliesToChange} />
          </Form.Item>
        </div>

        {controller.appliesTo === "SELECTED_ITEMS" ? (
          <LandedCostProductSelector
            lineItems={controller.filteredLineItems}
            columns={productColumns}
            productSearch={controller.productSearch}
            onSearchChange={controller.setProductSearch}
            selectedLineItemIds={controller.selectedLineItemIds}
            onSelectionChange={controller.handleSelectionChange}
            selectionError={controller.selectionError}
          />
        ) : null}
        {controller.allocationMethod === "WEIGHT" && controller.hasInvalidWeight ? (
          <Alert
            className="mt-3"
            type="warning"
            showIcon
            message="Weight required"
            description="Every product included in this landed cost must have a weight greater than 0 before you can allocate by weight."
          />
        ) : null}
      </Form>
    </AppModal>
  );
}
