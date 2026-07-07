"use client";

import { GoBack } from "@/components/ui/GoBack";
import { ProductEditModal } from "@/components/products/ProductEditModal";
import { ProductMediaManagerModal } from "@/components/products/ProductMediaManagerModal";
import { ProductDetailShimmer } from "@/components/products/ProductDetailShimmer";
import { ProductVariantEditModal } from "@/components/products/ProductVariantEditModal";
import { ProductMobileMedia } from "@/components/products/ProductMobileMedia";
import { BatchTable } from "@/components/products/product-detail/batch-table";
import { RestockProductModal } from "@/components/products/product-detail/inventory-modals";
import { buildProductDetailTabs } from "@/components/products/product-detail/overview";
import { DetailGrid, TypeBadge } from "@/components/products/product-detail/shared";
import type { ProductDetail } from "@/components/products/product-detail/types";
import { ITEM_TYPE } from "@/components/products/ProductFormModal";
import { useDeleteProductMutation, useGetProductQuery, useRestoreProductMutation } from "@/lib/redux/services";
import { AccessDeniedView } from "@/components/ui/AccessDeniedView";
import EntityAuditTimeline from "@/components/audit/EntityAuditTimeline";
import ProductImagePlaceholder from "@/components/ui/ProductImagePlaceholder";
import { usePermissions } from "@/hooks/usePermissions";
import { ActionDropdown, DropdownItemLabel } from "@/components/ui/ActionDropdown";
import { StorePermission } from "@/types/store-access";
import useToggle from "@/hooks/UseToggle";
import { Button, Empty, Popconfirm, Segmented, Tabs, message } from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { ArrowRightLeft, PackageOpen, SlidersHorizontal } from "lucide-react";
import { hasBundleComponents } from "@/lib/products/type-label";
import React, { useEffect, useMemo, useState } from "react";
import { ImBoxRemove } from "react-icons/im";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { useRouter } from "next/navigation";

dayjs.extend(relativeTime);

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();
  const { ready, hasAnyPermission, hasPermission } = usePermissions();
  const [editOpen, toggleEdit] = useToggle();
  const [mediaOpen, toggleMedia] = useToggle();
  const [restockOpen, toggleRestock] = useToggle();
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [heroImageFailed, setHeroImageFailed] = useState(false);
  const canViewProduct = hasAnyPermission([StorePermission.PRODUCTS_VIEW, StorePermission.PRODUCTS_MANAGE]);
  const canManageProduct = hasPermission(StorePermission.PRODUCTS_MANAGE);
  const canManageInventory = hasPermission(StorePermission.INVENTORY_MANAGE);
  const enableTradePrice = useSelector((state: RootState) => Boolean(state.currentUser.storeSettings.pricing?.enableTradePrice));
  const { data: rawProduct, isLoading, refetch } = useGetProductQuery(id, { skip: !id || !ready || !canViewProduct });
  const [archiveProduct, { isLoading: archiving }] = useDeleteProductMutation();
  const [restoreProduct, { isLoading: restoring }] = useRestoreProductMutation();
  const product = rawProduct as ProductDetail | undefined;
  const imageUrl = product?.media?.[0]?.url || product?.imageUrl;
  const isArchived = product?.status === "archived";
  const canEditProduct = canManageProduct && !isArchived;
  const canMutateInventory = canManageInventory && !isArchived;
  const canManageMedia = canManageProduct && !isArchived;

  const tabs = useMemo(
    () =>
      buildProductDetailTabs(product, {
        canManageProduct: canEditProduct,
        onEditProduct: toggleEdit,
        enableTradePrice,
        renderBatchTable: (currentProduct) => <BatchTable product={currentProduct} batches={currentProduct.inventory?.batches || []} canManageInventory={canMutateInventory} onBatchChanged={refetch} />,
      }),
    [canEditProduct, canMutateInventory, enableTradePrice, product, refetch, toggleEdit],
  );
  const currentTab = tabs.find((tab) => tab.key === activeSection) || tabs[0];

  useEffect(() => {
    if (tabs.length && !tabs.some((tab) => tab.key === activeSection)) {
      setActiveSection(tabs[0].key);
    }
  }, [activeSection, tabs]);

  useEffect(() => {
    setHeroImageFailed(false);
  }, [imageUrl]);

  const handleToggleProductStatus = async () => {
    if (!product) return;
    const entityLabel = product.productId ? "Variant" : "Product";

    try {
      if (product.status === "archived") {
        await restoreProduct(product.id).unwrap();
        await refetch();
        message.success(`${entityLabel} restored.`);
        return;
      }

      await archiveProduct(product.id).unwrap();
      message.success(`${entityLabel} archived.`);
      if (!product.productId) {
        router.push("/products");
      } else {
        await refetch();
      }
    } catch {
      message.error(`The ${entityLabel.toLowerCase()} status could not be changed.`);
    }
  };

  if (!ready || (canViewProduct && isLoading)) {
    return <ProductDetailShimmer />;
  }

  if (!canViewProduct) {
    return <AccessDeniedView title="Products" description="You do not have permission to view this product." />;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <GoBack />
        <div className="mt-8 rounded-sm border border-gray-200 bg-white p-10">
          <Empty description="Product could not be loaded." />
        </div>
      </div>
    );
  }
  const showImagePlaceholder = !imageUrl || heroImageFailed;
  const displayName = product.parentProductName ? `${product.parentProductName} - ${product.name}` : product.name;
  const descriptionText = product.description || "No description has been added for this product.";
  const canToggleDescription = Boolean(product.description && product.description.length > 160);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px]">
        <main className="border-r border-gray-200 bg-white">
          <header className="border-b border-gray-200 p-3 sm:px-5  sm:py-5 md:px-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="md:flex hidden min-w-0 items-start gap-3">
                <GoBack />
                <div className="min-w-0  font-semibold">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="truncate text-xl text-gray-700 md:text-2xl">{displayName}</h1>
                    <TypeBadge product={product} />
                  </div>
                </div>
              </div>

              <div className=" md:hidden w-full flex justify-between items-center">
                <GoBack />

                <TypeBadge product={product} />

                <ActionDropdown
                  menu={{
                    items: [
                      ...(canEditProduct
                        ? [
                            {
                              key: "Edit",
                              label: <DropdownItemLabel icon={<SlidersHorizontal size={15} />} text="Edit" />,
                              onClick: toggleEdit,
                            },
                          ]
                        : []),
                      ...(product.type === ITEM_TYPE.STOCK && !product.hasVariants && canMutateInventory
                        ? [
                            {
                              key: "Restock",
                              label: <DropdownItemLabel icon={<ArrowRightLeft size={15} />} text={hasBundleComponents(product) ? "Production" : "Restock"} />,
                              onClick: toggleRestock,
                            },
                          ]
                        : []),
                      ...(canManageProduct
                        ? [
                            {
                              key: "ToggleStatus",
                              label: <DropdownItemLabel icon={product.status === "archived" ? <PackageOpen size={15} /> : <ImBoxRemove size={15} />} text={product.status === "archived" ? "Restore" : "Archive"} />,
                              onClick: async () => {
                                const confirmed = window.confirm(product.status === "archived" ? `Restore this ${product.productId ? "variant" : "product"}?` : `Archive this ${product.productId ? "variant" : "product"}?`);
                                if (!confirmed) return;
                                await handleToggleProductStatus();
                              },
                            },
                          ]
                        : []),
                    ],
                  }}
                />

                {/* Action icons here */}
              </div>

              <div className="md:flex w-full hidden justify-end gap-2 md:w-auto">
                {canManageProduct && (
                  <Popconfirm
                    title={product.status === "archived" ? `Restore ${product.productId ? "variant" : "product"}?` : `Archive ${product.productId ? "variant" : "product"}?`}
                    description={
                      product.status === "archived"
                        ? `The ${product.productId ? "variant" : "product"} will become available again.`
                        : product.productId
                          ? "The variant will be hidden from new transactions."
                          : "The product and its variants will be hidden from new transactions."
                    }
                    onConfirm={handleToggleProductStatus}
                  >
                    <Button danger loading={archiving || restoring}>
                      {product.status === "archived" ? "Restore" : "Archive"}
                    </Button>
                  </Popconfirm>
                )}

                {product.type === ITEM_TYPE.STOCK && !product.hasVariants && canMutateInventory && (
                  <Button type="default" onClick={toggleRestock}>
                    {hasBundleComponents(product) ? "Production" : "Restock"}
                  </Button>
                )}
                {canEditProduct && (
                  <Button type="default" onClick={toggleEdit}>
                    Edit
                  </Button>
                )}
              </div>
            </div>
          </header>
          <section id="product-overview" className="scroll-mt-14 grid   md:gap-4  sm:gap-6 md:px-5 md:py-6 lg:grid-cols-[200px_minmax(0,1fr)] cursor-pointer">
            <div className="md:hidden">
              <ProductMobileMedia
                imageUrl={imageUrl}
                displayName={displayName}
                showPlaceholder={showImagePlaceholder}
                canManage={canManageMedia}
                onOpenMedia={toggleMedia}
                onImageError={() => setHeroImageFailed(true)}
              />
            </div>

            <button
              type="button"
              onClick={canManageMedia ? toggleMedia : undefined}
              disabled={!canManageMedia}
              className="group relative hidden aspect-square w-full cursor-pointer overflow-hidden border-[#2d837d] text-left outline-none transition disabled:cursor-default disabled:opacity-100 md:block md:rounded-sm md:border"
            >
              {showImagePlaceholder ? <ProductImagePlaceholder label="Product image" /> : <img className="h-full  w-full hover:p-0 transition  object-cover" src={imageUrl} alt={product.name || "Product"} onError={() => setHeroImageFailed(true)} />}
              {canManageMedia && <span className="absolute inset-x-0 bottom-0 bg-[#2d837d] px-3 py-2 text-center text-xs font-medium text-white  transition  ">Manage media</span>}
            </button>

            <div className="p-3 md:hidden">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-gray-400">item</p>
              <p className="mt-1 truncate text-bade  font-medium text-gray-900">{displayName}</p>
            </div>

            <div className="min-w-0">
              <DetailGrid
                items={[
                  { label: "SKU", value: product.sku || "-" },
                  { label: "Barcode", value: product.barcode || "-" },
                  {
                    label: "Category",
                    value: product.categoryName || "Uncategorized",
                  },
                  {
                    label: "Weight",
                    value: product.weight ? `${product.weight}` : "-",
                  },
                ]}
              />

              <div
                className={`md:border-b border-gray-200 px-4 py-4 ${canToggleDescription ? "cursor-pointer" : "cursor-default"}`}
                role={canToggleDescription ? "button" : undefined}
                tabIndex={canToggleDescription ? 0 : undefined}
                aria-expanded={descriptionExpanded}
                onClick={() => canToggleDescription && setDescriptionExpanded((current) => !current)}
                onKeyDown={(event) => {
                  if (!canToggleDescription) return;
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setDescriptionExpanded((current) => !current);
                  }
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-gray-400">Description</p>
                  {canToggleDescription && <p className="text-xs font-medium text-gray-500">{descriptionExpanded ? "Show less" : "Read more"}</p>}
                </div>
                <p
                  className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-600"
                  style={
                    !descriptionExpanded && canToggleDescription
                      ? {
                          display: "-webkit-box",
                          WebkitLineClamp: 4,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }
                      : undefined
                  }
                >
                  {descriptionText}
                </p>
              </div>
            </div>
          </section>

          <section id="product-activity" className="scroll-mt-14 pb-8">
            {product.hasVariants ? (
              <div className="">{currentTab?.children}</div>
            ) : (
              <>
                <div className="mb-6 hidden overflow-x-auto pb-1 md:block">
                  <div className="flex w-max min-w-full justify-center">
                    <Segmented
                      shape="round"
                      options={tabs.map((tab) => ({
                        label: tab.label,
                        value: tab.key,
                      }))}
                      value={currentTab?.key}
                      onChange={(value) => setActiveSection(String(value))}
                      className="[&_.ant-segmented-item-selected]:!bg-[#2d837d] [&_.ant-segmented-item-selected]:!text-white"
                      style={{ backgroundColor: "#ebebeb", padding: "5px" }}
                    />
                  </div>
                </div>

                <div className="border-y border-gray-200 bg-white px-0 md:hidden">
                  <Tabs
                    activeKey={currentTab?.key}
                    items={tabs}
                    onChange={setActiveSection}
                    tabBarGutter={18}
                    className="purchase-mobile-tabs  !mb-0 [&_.ant-tabs-nav]:!mb-0 [&_.ant-tabs-nav:before]:!border-b [&_.ant-tabs-tab]:!ml-4 [&_.ant-tabs-tab]:!py-4 [&_.ant-tabs-tab-btn]:!text-gray-500 [&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:!text-[#2d837d] [&_.ant-tabs-ink-bar]:!bg-[#2d837d]"
                  />
                </div>

                <div className="hidden  md:block">{currentTab?.children}</div>
              </>
            )}
          </section>
        </main>

        <aside className="bg-gray-50 px-5 py-5 md:px-8">
          <div className="sticky top-4 space-y-5">
            <div className="">
              <EntityAuditTimeline entityType="product" entityId={product.id} />
            </div>
          </div>
        </aside>
      </div>

      {editOpen && product && (product.productId ? <ProductVariantEditModal open={editOpen} toggle={toggleEdit} product={product} onSaved={refetch} /> : <ProductEditModal open={editOpen} toggle={toggleEdit} product={product} onSaved={refetch} />)}
      {restockOpen && product && <RestockProductModal open={restockOpen} toggle={toggleRestock} product={product} onSaved={refetch} />}
      {mediaOpen && product && <ProductMediaManagerModal open={mediaOpen} toggle={toggleMedia} productId={product.id} productName={product.name} media={product.media || []} onChanged={refetch} />}
    </div>
  );
}
