"use client";

import { message } from "antd";

import { SaleDocumentType } from "@/components/settings/documentPreview";
import { Sale } from "@/types/sale";
import { Store } from "@/types/store";

import { documentLabel, saleDocumentText } from "./saleShareDocumentShared";
import { saleDocumentNumber } from "./saleUtils";

export async function shareSaleDocument({
  sale,
  store,
  type,
  resolvedNames,
  label,
  documentHtml,
}: {
  sale: Sale;
  store: Store | null;
  type: SaleDocumentType;
  resolvedNames: Record<string, string>;
  label: string;
  documentHtml: string;
}) {
  const text = saleDocumentText(sale, store, type, resolvedNames);
  const file = new File([documentHtml], `${label.toLowerCase()}-${saleDocumentNumber(sale)}.html`, { type: "text/html" });

  try {
    if (navigator.share) {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: `${label} ${saleDocumentNumber(sale)}`, text, files: [file] });
      } else {
        await navigator.share({ title: `${label} ${saleDocumentNumber(sale)}`, text });
      }
      return;
    }

    await navigator.clipboard.writeText(text);
    message.success(`${label} copied. It is ready to share.`);
  } catch (error) {
    if ((error as Error)?.name !== "AbortError") {
      message.error(`${label} could not be shared.`);
    }
  }
}

export function printSaleDocument(documentHtml: string) {
  const printWindow = window.open("", "_blank", "width=860,height=920");
  if (!printWindow) {
    message.error("Allow pop-ups to print this document.");
    return;
  }

  printWindow.document.write(documentHtml);
  printWindow.document.close();
  printWindow.focus();
  printWindow.addEventListener("load", () => printWindow.print());
}

export { documentLabel };
