"use client";

import { useMemo, useState } from "react";
import { Button, Grid, Modal, Segmented, Skeleton, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { LuCheck, LuEye, LuFileSpreadsheet, LuReceipt, LuScrollText, LuStore } from "react-icons/lu";

import { setStoreSettings } from "@/lib/redux/features/userSlice";
import { RootState } from "@/lib/store";
import { useGetStoreSettingsQuery, useUpdateStoreSettingsMutation } from "@/lib/redux/services/storeSettingsApi";
import { DEFAULT_DOCUMENTS_SETTINGS, StoreDocumentTemplateKey, StoreDocumentsSettings } from "@/types/store-settings";
import { generateDocumentPreviewHtml } from "./documentPreview";

type DocumentModuleKey = keyof StoreDocumentsSettings;

type DocumentModuleOption = {
  key: DocumentModuleKey;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

type TemplateOption = {
  key: StoreDocumentTemplateKey;
  label: string;
  description: string;
  accentClass: string;
  chipClass: string;
  headerClass: string;
  lineClass: string;
};

function SegmentLabel({ icon: Icon, label }: { icon: DocumentModuleOption["icon"]; label: string }) {
  return (
    <span className="flex items-center gap-2 px-1">
      <Icon size={15} />
      <span>{label}</span>
    </span>
  );
}

const DOCUMENT_MODULES: DocumentModuleOption[] = [
  {
    key: "purchaseOrderTemplate",
    label: "Purchase Order",
    description: "Default layout used when preparing purchase order documents.",
    icon: LuScrollText,
  },
  {
    key: "salesInvoiceTemplate",
    label: "Sales Invoice",
    description: "Default invoice layout for sales and customer billing.",
    icon: LuFileSpreadsheet,
  },
  {
    key: "salesReceiptTemplate",
    label: "Sales Receipt",
    description: "Default receipt layout for completed sales outside POS.",
    icon: LuReceipt,
  },
  {
    key: "posReceiptTemplate",
    label: "POS Receipt",
    description: "Default thermal-style receipt for counter sales.",
    icon: LuStore,
  },
];

const TEMPLATE_OPTIONS: TemplateOption[] = [
  {
    key: "modern",
    label: "Modern",
    description: "Balanced spacing with a polished business look.",
    accentClass: "border-[#2d837d] bg-[#2d837d]/5",
    chipClass: "bg-[#2d837d] text-white",
    headerClass: "bg-slate-900",
    lineClass: "bg-slate-200",
  },
  {
    key: "minimal",
    label: "Minimal",
    description: "Clean and light with reduced visual weight.",
    accentClass: "border-gray-300 bg-gray-50",
    chipClass: "bg-gray-900 text-white",
    headerClass: "bg-white border border-gray-200",
    lineClass: "bg-gray-200",
  },
  {
    key: "bold",
    label: "Bold",
    description: "Stronger contrast with clear totals and headers.",
    accentClass: "border-green-300 bg-green-50",
    chipClass: "bg-green-600 text-white",
    headerClass: "bg-green-600",
    lineClass: "bg-green-100",
  },
  {
    key: "classic",
    label: "Classic",
    description: "Traditional document feel with formal structure.",
    accentClass: "border-amber-300 bg-amber-50",
    chipClass: "bg-amber-700 text-white",
    headerClass: "bg-amber-700",
    lineClass: "bg-amber-100",
  },
];

function TemplatePreview({ template }: { template: TemplateOption }) {
  if (template.key === "minimal") {
    return (
      <div className="border border-gray-200 bg-white p-3">
        <div className="flex items-center justify-between">
          <div className="h-3 w-24 bg-gray-900" />
          <div className="h-2.5 w-12 bg-gray-200" />
        </div>
        <div className="mt-3 border-t border-gray-200 pt-3">
          <div className="grid grid-cols-[1.25fr_0.9fr] gap-3">
            <div className="space-y-2">
              <div className="h-2 w-14 bg-gray-300" />
              <div className="h-3 w-24 bg-gray-900" />
              <div className="h-2.5 w-28 bg-gray-200" />
            </div>
            <div className="space-y-2 text-right">
              <div className="ml-auto h-2 w-12 bg-gray-300" />
              <div className="ml-auto h-3 w-16 bg-gray-900" />
              <div className="ml-auto h-2.5 w-20 bg-gray-200" />
            </div>
          </div>
          <div className="mt-3 border border-gray-200">
            <div className="grid grid-cols-[1.4fr_0.35fr_0.6fr_0.7fr] border-b border-gray-200 px-2 py-1.5">
              <div className="h-2 bg-gray-300" />
              <div className="h-2 bg-gray-200" />
              <div className="h-2 bg-gray-200" />
              <div className="h-2 bg-gray-200" />
            </div>
            <div className="space-y-2 px-2 py-2">
              <div className="grid grid-cols-[1.4fr_0.35fr_0.6fr_0.7fr] gap-2">
                <div className="h-2.5 bg-gray-900" />
                <div className="h-2.5 bg-gray-200" />
                <div className="h-2.5 bg-gray-200" />
                <div className="h-2.5 bg-gray-200" />
              </div>
              <div className="grid grid-cols-[1.4fr_0.35fr_0.6fr_0.7fr] gap-2">
                <div className="h-2.5 bg-gray-300" />
                <div className="h-2.5 bg-gray-200" />
                <div className="h-2.5 bg-gray-200" />
                <div className="h-2.5 bg-gray-200" />
              </div>
            </div>
          </div>
          <div className="mt-3 ml-auto w-24 border-t border-gray-300 pt-2">
            <div className="space-y-2">
              <div className="h-2.5 w-full bg-gray-300" />
              <div className="h-3 w-full bg-gray-900" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (template.key === "bold") {
    return (
      <div className="overflow-hidden border border-indigo-200 bg-white">
        <div className="bg-indigo-600 px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="h-3 w-24 bg-white/90" />
            <div className="h-8 w-8 bg-white/85" />
          </div>
        </div>
        <div className="p-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-indigo-50 p-2">
              <div className="h-2.5 w-16 bg-indigo-200" />
              <div className="mt-2 h-2.5 w-20 bg-indigo-300" />
            </div>
            <div className="bg-indigo-50 p-2">
              <div className="h-2.5 w-14 bg-indigo-200" />
              <div className="mt-2 h-2.5 w-[4.5rem] bg-indigo-300" />
            </div>
          </div>
          <div className="mt-3 space-y-2">
            <div className="h-2.5 w-full bg-indigo-100" />
            <div className="h-2.5 w-full bg-indigo-100" />
          </div>
          <div className="mt-3 bg-indigo-950 px-3 py-2">
            <div className="h-2.5 w-16 bg-white/80" />
          </div>
        </div>
      </div>
    );
  }

  if (template.key === "classic") {
    return (
      <div className="border border-amber-200 bg-amber-50/50 p-3">
        <div className="mx-auto h-8 w-8 bg-amber-200" />
        <div className="mx-auto mt-2 h-3 w-28 bg-amber-700" />
        <div className="mx-auto mt-2 h-px w-full bg-amber-200" />
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-2.5 w-16 bg-amber-200" />
            <div className="h-2.5 w-24 bg-amber-200" />
          </div>
          <div className="space-y-2">
            <div className="ml-auto h-2.5 w-14 bg-amber-200" />
            <div className="ml-auto h-2.5 w-20 bg-amber-200" />
          </div>
        </div>
        <div className="mt-4 space-y-2 border border-amber-200 p-2.5">
          <div className="h-2.5 w-full bg-amber-100" />
          <div className="h-2.5 w-full bg-amber-100" />
        </div>
        <div className="mt-4 ml-auto w-20 space-y-2">
          <div className="h-2.5 w-full bg-amber-200" />
          <div className="h-2.5 w-3/4 bg-amber-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="border border-slate-300 bg-white p-3">
      <div className="flex items-center justify-between border-b border-slate-300 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center border border-slate-400 bg-slate-100">
            <div className="size-5 bg-slate-800" />
          </div>
          <div>
            <div className="h-3 w-24 bg-slate-900" />
            <div className="mt-2 h-2.5 w-[4.5rem] bg-slate-200" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1">
          <div className="h-3 w-3 bg-slate-900" />
          <div className="h-3 w-3 bg-slate-300" />
          <div className="h-3 w-3 bg-slate-300" />
          <div className="h-3 w-3 bg-slate-900" />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-[1.15fr_0.95fr] gap-3">
        <div className="space-y-2 border border-slate-300 p-2.5">
          <div className="h-2.5 w-full bg-slate-800" />
          <div className="h-2.5 w-5/6 bg-slate-300" />
          <div className="h-2.5 w-2/3 bg-slate-300" />
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="h-10 border border-slate-300 bg-slate-50" />
            <div className="h-10 border border-slate-300 bg-white" />
            <div className="h-10 border border-slate-300 bg-slate-50" />
          </div>
        </div>
        <div className="border border-slate-300 bg-slate-50 p-2.5">
          <div className="border-b border-slate-300 pb-2">
            <div className="h-2.5 w-full bg-slate-300" />
          </div>
          <div className="mt-3 space-y-2">
            <div className="h-2.5 w-3/4 bg-slate-800" />
            <div className="h-2.5 w-full bg-slate-300" />
            <div className="h-2.5 w-2/3 bg-slate-300" />
          </div>
          <div className="mt-4 border-t border-slate-300 pt-2">
            <div className="ml-auto h-6 w-20 bg-slate-900" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DocumentsSettings() {
  const screens = Grid.useBreakpoint();
  const dispatch = useDispatch();
  const store = useSelector((state: RootState) => state.currentUser.store);
  const { data, isLoading, isError } = useGetStoreSettingsQuery();
  const [updateStoreSettings, { isLoading: isSaving }] = useUpdateStoreSettingsMutation();
  const [activeModuleKey, setActiveModuleKey] = useState<DocumentModuleKey>("purchaseOrderTemplate");
  const [previewTemplateKey, setPreviewTemplateKey] = useState<StoreDocumentTemplateKey | null>(null);

  const documentSettings = useMemo(
    () => ({
      ...DEFAULT_DOCUMENTS_SETTINGS,
      ...(data?.documents || {}),
    }),
    [data?.documents],
  );

  const activeModule = DOCUMENT_MODULES.find((module) => module.key === activeModuleKey) || DOCUMENT_MODULES[0];
  const previewHtml = previewTemplateKey
    ? generateDocumentPreviewHtml(activeModule.key, previewTemplateKey, {
        name: store?.name,
        category: store?.category,
        logoUrl: data?.businessProfile?.logo || store?.logo,
      })
    : "";
  const fullscreenPreview = !screens.lg;

  const updateTemplate = async (templateKey: StoreDocumentTemplateKey) => {
    if (documentSettings[activeModule.key] === templateKey) {
      return;
    }

    const nextDocuments: StoreDocumentsSettings = {
      ...documentSettings,
      [activeModule.key]: templateKey,
    };

    try {
      const updatedSettings = await updateStoreSettings({ documents: nextDocuments }).unwrap();
      dispatch(setStoreSettings(updatedSettings));
      message.success(`${activeModule.label} template updated.`);
    } catch {
      message.error("Document template could not be updated.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 px-4 py-6 sm:px-6">
        <Skeleton active paragraph={{ rows: 10 }} title={false} />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <div className="rounded-lg border border-red-200 px-4 py-4 text-sm text-red-600">Document settings could not be loaded right now.</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6">
      <section className="">
        <div className="mb-4 overflow-x-auto pb-1">
          <div className="flex w-max min-w-full justify-center">
            <Segmented
              shape="round"
              options={DOCUMENT_MODULES.map((module) => ({
                value: module.key,
                label: <SegmentLabel icon={module.icon} label={module.label} />,
              }))}
              value={activeModule.key}
              onChange={(value) => setActiveModuleKey(value as DocumentModuleKey)}
              className="[&_.ant-segmented-item-selected]:!bg-[#2d837d] [&_.ant-segmented-item-selected]:!text-white"
              style={{ backgroundColor: "#ebebeb", padding: "5px" }}
            />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {TEMPLATE_OPTIONS.map((template) => {
            const selected = documentSettings[activeModule.key] === template.key;

            return (
              <div key={template.key} className={`border p-3 text-left transition ${selected ? template.accentClass : "border-gray-200 bg-white hover:border-gray-300"}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-950">{template.label}</p>
                      {selected && (
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${template.chipClass}`}>
                          <LuCheck size={12} /> Default
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm leading-5 text-gray-500">{template.description}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPreviewTemplateKey(template.key)}
                      className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:border-gray-300 hover:text-gray-900"
                    >
                      <LuEye size={13} />
                      Preview sample
                    </button>
                    {!selected && (
                      <button
                        type="button"
                        onClick={() => updateTemplate(template.key)}
                        disabled={isSaving}
                        className="inline-flex rounded-full border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:border-gray-300 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Set default
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-3">
                  <TemplatePreview template={template} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Modal
        open={previewTemplateKey !== null}
        onCancel={() => setPreviewTemplateKey(null)}
        width={fullscreenPreview ? "100vw" : activeModule.key === "posReceiptTemplate" ? 400 : 920}
        title={`${activeModule.label} preview`}
        styles={{ body: { padding: 0 } }}
        footer={[
          <Button key="close" onClick={() => setPreviewTemplateKey(null)}>
            Close
          </Button>,
        ]}
      >
        <div className={`overflow-hidden ${fullscreenPreview ? "h-[calc(100dvh-136px)]" : "mt-3 border border-gray-200 bg-gray-50"}`}>
          <iframe title={`${activeModule.label} sample preview`} srcDoc={previewHtml} className={`w-full bg-white ${fullscreenPreview ? "h-full" : "h-[540px]"}`} />
        </div>
      </Modal>
    </div>
  );
}
