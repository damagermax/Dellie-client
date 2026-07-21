"use client";
import { ModalProps } from "../ui/AppModal";
import SaleFormModal from "./SaleFormModal";

export default function OrderFormModal({ open, toggle }: ModalProps) {
  return <SaleFormModal open={open} toggle={toggle} />;
}
