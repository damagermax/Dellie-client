"use client";

import { Button, Form, Input, message } from "antd";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LuArrowLeft, LuBadgeCheck, LuChevronDown, LuChevronUp, LuCopy, LuCreditCard } from "react-icons/lu";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";

import { setStoreSettings } from "@/lib/redux/features/userSlice";
import { useGetStoreSettingsQuery, useUpdateStoreSettingsMutation } from "@/lib/redux/services/storeSettingsApi";
import type { AppDispatch, RootState } from "@/lib/redux/store";
import { DEFAULT_INTEGRATIONS_SETTINGS, PaystackIntegrationSettings, StripeIntegrationSettings, UpdateStoreSettingsInput } from "@/types/store-settings";

type IntegrationKey = "paystack" | "stripe";

type PaystackFormValues = {
  publicKey: string;
  secretKey: string;
  webhookSecret: string;
};

type StripeFormValues = {
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
};

const INTEGRATION_COPY: Record<
  IntegrationKey,
  {
    title: string;
    description: string;
    initials: string;
    tone: string;
  }
> = {
  paystack: {
    title: "Paystack",
    description: "Connect your Paystack account for cards, transfers, and local payment methods.",
    initials: "PS",
    tone: "bg-emerald-50 text-emerald-700",
  },
  stripe: {
    title: "Stripe",
    description: "Connect your Stripe account for online card payments and checkout flows.",
    initials: "ST",
    tone: "bg-violet-50 text-violet-700",
  },
};

const WEBHOOK_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4200").replace(/\/+$/, "");

function slugifyStoreName(value?: string) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getWebhookUrl(slug: string, key: IntegrationKey) {
  return `${WEBHOOK_BASE_URL}/stores/${slug}/integrations/${key}/webhook`;
}

function normalizePaystack(values?: Partial<PaystackIntegrationSettings>): PaystackIntegrationSettings {
  return {
    ...DEFAULT_INTEGRATIONS_SETTINGS.paystack,
    ...values,
    publicKey: values?.publicKey || "",
    secretKey: values?.secretKey || "",
    webhookSecret: values?.webhookSecret || "",
  };
}

function normalizeStripe(values?: Partial<StripeIntegrationSettings>): StripeIntegrationSettings {
  return {
    ...DEFAULT_INTEGRATIONS_SETTINGS.stripe,
    ...values,
    publishableKey: values?.publishableKey || "",
    secretKey: values?.secretKey || "",
    webhookSecret: values?.webhookSecret || "",
  };
}

export default function AppsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const currentStore = useSelector((state: RootState) => state.currentUser.store);
  const [expandedKey, setExpandedKey] = useState<IntegrationKey | null>("paystack");
  const [editingKey, setEditingKey] = useState<IntegrationKey | null>(null);
  const [paystackForm] = Form.useForm<PaystackFormValues>();
  const [stripeForm] = Form.useForm<StripeFormValues>();
  const { data, isLoading } = useGetStoreSettingsQuery();
  const [updateStoreSettings, { isLoading: isSaving }] = useUpdateStoreSettingsMutation();

  const paystack = normalizePaystack(data?.integrations?.paystack);
  const stripe = normalizeStripe(data?.integrations?.stripe);
  const activeStoreSlug = currentStore?.slug || slugifyStoreName(currentStore?.name);

  useEffect(() => {
    paystackForm.setFieldsValue({
      publicKey: paystack.publicKey,
      secretKey: paystack.secretKey,
      webhookSecret: paystack.webhookSecret,
    });
    stripeForm.setFieldsValue({
      publishableKey: stripe.publishableKey,
      secretKey: stripe.secretKey,
      webhookSecret: stripe.webhookSecret,
    });
  }, [paystack, paystackForm, stripe, stripeForm]);

  const saveSettings = async (payload: UpdateStoreSettingsInput, successMessage: string) => {
    try {
      const updatedSettings = await updateStoreSettings(payload).unwrap();
      dispatch(setStoreSettings(updatedSettings));
      message.success(successMessage);
    } catch {
      message.error("Integration settings could not be updated.");
    }
  };

  const handleCopyWebhookUrl = async (key: IntegrationKey) => {
    if (!activeStoreSlug) {
      message.error("Store webhook URL is not available.");
      return;
    }

    try {
      await navigator.clipboard.writeText(getWebhookUrl(activeStoreSlug, key));
      message.success(`${INTEGRATION_COPY[key].title} webhook URL copied.`);
    } catch {
      message.error("Webhook URL could not be copied.");
    }
  };

  const handleSavePaystack = async (values: PaystackFormValues) => {
    await saveSettings(
      {
        integrations: {
          paystack: {
            connected: Boolean(values.publicKey && values.secretKey),
            publicKey: values.publicKey,
            secretKey: values.secretKey,
            webhookSecret: values.webhookSecret,
          },
        },
      },
      "Paystack connected.",
    );
    setEditingKey(null);
  };

  const handleSaveStripe = async (values: StripeFormValues) => {
    await saveSettings(
      {
        integrations: {
          stripe: {
            connected: Boolean(values.publishableKey && values.secretKey),
            publishableKey: values.publishableKey,
            secretKey: values.secretKey,
            webhookSecret: values.webhookSecret,
          },
        },
      },
      "Stripe connected.",
    );
    setEditingKey(null);
  };

  const handleDisconnect = async (key: IntegrationKey) => {
    if (key === "paystack") {
      paystackForm.resetFields();
      setEditingKey(null);
      await saveSettings(
        {
          integrations: {
            paystack: {
              connected: false,
              publicKey: "",
              secretKey: "",
              webhookSecret: "",
            },
          },
        },
        "Paystack disconnected.",
      );
      return;
    }

    stripeForm.resetFields();
    setEditingKey(null);
    await saveSettings(
      {
        integrations: {
          stripe: {
            connected: false,
            publishableKey: "",
            secretKey: "",
            webhookSecret: "",
          },
        },
      },
      "Stripe disconnected.",
    );
  };

  const renderIntegrationRow = (key: IntegrationKey) => {
    const copy = INTEGRATION_COPY[key];
    const isExpanded = expandedKey === key;
    const isConnected = key === "paystack" ? paystack.connected : stripe.connected;
    const isEditing = editingKey === key;
    const showCredentialsForm = !isConnected || isEditing;

    return (
      <div key={key} className="border-b border-gray-100 last:border-b-0">
        <button
          type="button"
          className="flex w-full items-start justify-between gap-4 px-4 py-4 text-left"
          onClick={() => setExpandedKey((current) => (current === key ? null : key))}
        >
          <div className="flex min-w-0 items-start gap-3">
            <span className={`flex size-11 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ${copy.tone}`}>{copy.initials}</span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-medium text-gray-900">{copy.title}</h2>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                    isConnected ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {isConnected ? <LuBadgeCheck size={14} /> : <LuCreditCard size={14} />}
                  {isConnected ? "Connected" : "Not connected"}
                </span>
              </div>
              <p className="mt-1 text-sm leading-6 text-gray-500">{copy.description}</p>
            </div>
          </div>
          <span className="mt-1 shrink-0 text-gray-400">{isExpanded ? <LuChevronUp size={18} /> : <LuChevronDown size={18} />}</span>
        </button>

        {isExpanded ? (
          <div className="border-t border-gray-100 px-4 py-4">
            {key === "paystack" ? (
              <Form form={paystackForm} layout="vertical" onFinish={handleSavePaystack} className="grid gap-x-4 md:grid-cols-2">
                <div className="flex flex-wrap items-center gap-2 md:col-span-2">
                  {paystack.connected ? (
                    <>
                      {!isEditing ? (
                        <Button type="primary" onClick={() => setEditingKey("paystack")} loading={isSaving}>
                          Edit
                        </Button>
                      ) : (
                        <>
                          <Button type="primary" htmlType="submit" loading={isSaving}>
                            Save Changes
                          </Button>
                          <Button
                            onClick={() => {
                              paystackForm.setFieldsValue({
                                publicKey: paystack.publicKey,
                                secretKey: paystack.secretKey,
                                webhookSecret: paystack.webhookSecret,
                              });
                              setEditingKey(null);
                            }}
                            loading={isSaving}
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                      <Button onClick={() => handleDisconnect("paystack")} loading={isSaving}>
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <Button type="primary" htmlType="submit" loading={isSaving}>
                      Connect Paystack
                    </Button>
                  )}
                </div>
                {showCredentialsForm ? (
                  <>
                    <Form.Item label="Public Key" name="publicKey" rules={[{ required: true, message: "Enter your Paystack public key" }]}>
                      <Input placeholder="pk_test_..." />
                    </Form.Item>
                    <Form.Item label="Secret Key" name="secretKey" rules={[{ required: true, message: "Enter your Paystack secret key" }]}>
                      <Input.Password placeholder="sk_test_..." />
                    </Form.Item>
                    <Form.Item label="Webhook Secret" name="webhookSecret" className="md:col-span-2">
                      <Input.Password placeholder="Optional webhook secret" />
                    </Form.Item>
                  </>
                ) : null}
                {paystack.connected ? (
                  <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 md:col-span-2">
                    <p className="text-sm font-semibold text-gray-950">Webhook URL</p>
                    <p className="mt-1 text-sm text-gray-600">Paste this into your Paystack dashboard webhook URL field.</p>
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                      <Input readOnly value={activeStoreSlug ? getWebhookUrl(activeStoreSlug, "paystack") : ""} className="!h-10" />
                      <Button type="default" icon={<LuCopy size={16} />} className="!h-10 !shrink-0" disabled={!activeStoreSlug} onClick={() => handleCopyWebhookUrl("paystack")}>
                        Copy
                      </Button>
                    </div>
                  </div>
                ) : null}
              </Form>
            ) : (
              <Form form={stripeForm} layout="vertical" onFinish={handleSaveStripe} className="grid gap-x-4 md:grid-cols-2">
                <div className="flex flex-wrap items-center gap-2 md:col-span-2">
                  {stripe.connected ? (
                    <>
                      {!isEditing ? (
                        <Button type="primary" onClick={() => setEditingKey("stripe")} loading={isSaving}>
                          Edit
                        </Button>
                      ) : (
                        <>
                          <Button type="primary" htmlType="submit" loading={isSaving}>
                            Save Changes
                          </Button>
                          <Button
                            onClick={() => {
                              stripeForm.setFieldsValue({
                                publishableKey: stripe.publishableKey,
                                secretKey: stripe.secretKey,
                                webhookSecret: stripe.webhookSecret,
                              });
                              setEditingKey(null);
                            }}
                            loading={isSaving}
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                      <Button onClick={() => handleDisconnect("stripe")} loading={isSaving}>
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <Button type="primary" htmlType="submit" loading={isSaving}>
                      Connect Stripe
                    </Button>
                  )}
                </div>
                {showCredentialsForm ? (
                  <>
                    <Form.Item label="Publishable Key" name="publishableKey" rules={[{ required: true, message: "Enter your Stripe publishable key" }]}>
                      <Input placeholder="pk_test_..." />
                    </Form.Item>
                    <Form.Item label="Secret Key" name="secretKey" rules={[{ required: true, message: "Enter your Stripe secret key" }]}>
                      <Input.Password placeholder="sk_test_..." />
                    </Form.Item>
                    <Form.Item label="Webhook Secret" name="webhookSecret" className="md:col-span-2">
                      <Input.Password placeholder="whsec_..." />
                    </Form.Item>
                  </>
                ) : null}
                {stripe.connected ? (
                  <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50/60 p-4 md:col-span-2">
                    <p className="text-sm font-semibold text-gray-950">Webhook URL</p>
                    <p className="mt-1 text-sm text-gray-600">Paste this into your Stripe webhook endpoint URL field.</p>
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                      <Input readOnly value={activeStoreSlug ? getWebhookUrl(activeStoreSlug, "stripe") : ""} className="!h-10" />
                      <Button type="default" icon={<LuCopy size={16} />} className="!h-10 !shrink-0" disabled={!activeStoreSlug} onClick={() => handleCopyWebhookUrl("stripe")}>
                        Copy
                      </Button>
                    </div>
                  </div>
                ) : null}
              </Form>
            )}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="mx-auto w-full max-w-4xl bg-white">
      <header className="border-b border-gray-200 px-4 py-5 sm:px-6">
        <div className="flex items-start gap-3">
          <Link
            href="/settings"
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200"
            aria-label="Back to settings"
          >
            <LuArrowLeft size={18} />
          </Link>
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold text-gray-900">Apps & Integrations</h1>
            <p className="mt-1 text-sm text-gray-500">Connect your payment accounts and save the credentials used for checkout.</p>
          </div>
        </div>
      </header>

      <section className="px-4 py-4 sm:px-6">
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          {isLoading ? <div className="px-4 py-6 text-sm text-gray-500">Loading integrations…</div> : null}
          {!isLoading ? ["paystack", "stripe"].map((key) => renderIntegrationRow(key as IntegrationKey)) : null}
        </div>
      </section>
    </div>
  );
}
