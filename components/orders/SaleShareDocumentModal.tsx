"use client";

import { Button, Modal } from "antd";
import { Printer, Share2 } from "lucide-react";
import { Sale } from "@/types/sale";
import { SaleDocumentPaperSize, SaleDocumentType } from "@/components/settings/documentPreview";
import { SaleDocumentPreviewFrame, printSaleDocument, shareSaleDocument, useSaleShareDocumentController } from "./saleShareDocumentSections";

export type { SaleDocumentPaperSize, SaleDocumentType } from "@/components/settings/documentPreview";

interface SaleShareDocumentModalProps {
  open: boolean;
  toggle: () => void;
  sale: Sale;
  type: SaleDocumentType;
  paperSize?: SaleDocumentPaperSize;
}

export default function SaleShareDocumentModal({ open, toggle, sale, type, paperSize = "full_page" }: SaleShareDocumentModalProps) {
  const { effectiveSale, label, thermalReceipt, fullscreenPreview, documentHtml, resolvedNames, store } = useSaleShareDocumentController({
    open,
    sale,
    type,
    paperSize,
  });

  const handleShare = async () => {
    await shareSaleDocument({ sale: effectiveSale, store, type, resolvedNames, label, documentHtml });
  };

  const handlePrint = () => {
    printSaleDocument(documentHtml);
  };

  return (
    <Modal
      open={open}
      onCancel={toggle}
      title={`Share ${label}`}
      width={fullscreenPreview ? "100vw" : thermalReceipt ? 420 : 980}
      styles={{ body: { padding: 0 } }}
      footer={[
        <Button key="print" icon={<Printer size={15} />} onClick={handlePrint}>
          Print / Save PDF
        </Button>,
        <Button key="share" type="primary" icon={<Share2 size={15} />} onClick={handleShare}>
          Share {label}
        </Button>,
      ]}
    >
      <SaleDocumentPreviewFrame fullscreenPreview={fullscreenPreview} thermalReceipt={thermalReceipt} label={label} documentHtml={documentHtml} />
    </Modal>
  );
}
