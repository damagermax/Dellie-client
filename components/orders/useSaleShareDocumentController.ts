"use client";

import { Grid } from "antd";
import { useMemo } from "react";
import { useSelector } from "react-redux";

import { getProductRefId, useResolvedProductNameMap } from "@/components/products/ResolvedProductName";
import { generateSaleDocumentHtml, SaleDocumentPaperSize, SaleDocumentType } from "@/components/settings/documentPreview";
import { getPaymentTermLabel } from "@/lib/payment-terms";
import { useGetPaymentTermsQuery, useGetSaleQuery } from "@/lib/redux/services";
import { RootState } from "@/lib/store";
import { PaymentTerm } from "@/types/payment-term";
import { Sale } from "@/types/sale";

import { documentLabel, resolveTemplateKey } from "./saleShareDocumentShared";

interface UseSaleShareDocumentControllerArgs {
  open: boolean;
  sale: Sale;
  type: SaleDocumentType;
  paperSize: SaleDocumentPaperSize;
}

export function useSaleShareDocumentController({ open, sale, type, paperSize }: UseSaleShareDocumentControllerArgs) {
  const screens = Grid.useBreakpoint();
  const store = useSelector((state: RootState) => state.currentUser.store);
  const storeSettings = useSelector((state: RootState) => state.currentUser.storeSettings);
  const { data: paymentTerms } = useGetPaymentTermsQuery();
  const { data: hydratedSale } = useGetSaleQuery(sale.id, {
    skip: !open || !sale.id,
    refetchOnMountOrArgChange: true,
  });

  const effectiveSale = hydratedSale || sale;
  const resolvedNames = useResolvedProductNameMap(
    effectiveSale.lineItems.map((line: Sale["lineItems"][number]) => ({
      id: getProductRefId(line.productId),
      name: line.productName,
    })),
  );
  const label = documentLabel(type);
  const template = resolveTemplateKey(type, effectiveSale.source, storeSettings?.documents);
  const thermalReceipt = type === "receipt" && effectiveSale.source === "POS";
  const fullscreenPreview = !screens.lg;
  const paymentTermsLabel = getPaymentTermLabel(effectiveSale.paymentTerms, (paymentTerms || []) as PaymentTerm[]);

  const documentHtml = useMemo(
    () =>
      generateSaleDocumentHtml({
        sale: effectiveSale,
        type,
        paperSize,
        template,
        branding: {
          name: store?.name,
          category: store?.category,
          logoUrl: storeSettings?.businessProfile?.logo || store?.logo,
        },
        resolvedNames,
        paymentTermsLabel,
      }),
    [effectiveSale, paperSize, paymentTermsLabel, resolvedNames, store?.category, store?.logo, store?.name, storeSettings?.businessProfile?.logo, template, type],
  );

  return {
    effectiveSale,
    label,
    thermalReceipt,
    fullscreenPreview,
    documentHtml,
    resolvedNames,
    store,
  };
}
