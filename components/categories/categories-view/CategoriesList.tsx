"use client";

import { useState } from "react";
import { useGetCategoriesQuery } from "@/lib/redux/services";
import { AppNotFoundView } from "@/components/ui/AppNotFoundView";
import { AppViewLoader } from "@/components/ui/AppViewLoader";
import CategoriesFormModal from "../CategoriesFormModal";
import { Category, CategoriesQueryParams, CategoryStatus, CategoryType } from "@/types/category";
import { Tag } from "antd";

interface CategoriesListProps {
  query: CategoriesQueryParams;
}

export default function CategoriesList({ query }: CategoriesListProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>();
  const categoriesQuery = { ...query, limit: query.limit ?? 1000 };
  const { data: categories, isLoading: loadingCategories } = useGetCategoriesQuery(categoriesQuery);

  const openEditModal = (category: Category) => {
    setSelectedCategory(category);
    setIsEditModalOpen(true);
  };

  return (
    <div>
      <AppViewLoader loading={loadingCategories} />
      <AppNotFoundView dataLength={categories?.data?.length || 0} loading={loadingCategories} query={categoriesQuery} entity="Categories" />

      <div className="px-5 pb-32">
        {categories?.data?.map((category, index) => {
          const isProductCategory = category.type === CategoryType.PRODUCT;

          return (
            <div key={category.id} className={`flex items-start justify-between gap-4 py-5 ${index !== categories.data.length - 1 ? "border-b border-blue-100" : ""}`}>
              <button type="button" className="flex min-w-0 flex-1 flex-col items-start text-left" onClick={() => openEditModal(category)}>
                <div className="flex min-w-0 items-start gap-3">
                  {isProductCategory ? (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                      {category.imageUrl ? <img src={category.imageUrl} alt={category.name} className="h-full w-full object-cover" /> : <span className="text-xs font-medium text-gray-400">IMG</span>}
                    </div>
                  ) : null}

                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-2">
                      <h3 className="truncate font-medium text-gray-800">{category.name}</h3>
                      <Tag color={category.status === CategoryStatus.ACTIVE ? "green" : "default"} className="!m-0 !rounded-full !px-1.5 !py-0 !text-[10px] !leading-4">
                        {category.status === CategoryStatus.ACTIVE ? "Active" : "Inactive"}
                      </Tag>
                    </div>

                    {isProductCategory ? (
                      <p className="mt-1 text-xs text-gray-500">
                        {[
                          category.showInStorefront ? "Storefront" : null,
                          category.showInPOS ? "POS" : null,
                        ]
                          .filter(Boolean)
                          .join(" • ") || "Hidden"}
                      </p>
                    ) : (
                      <p className="mt-1 line-clamp-2 text-sm text-gray-500">{category.description || "No description provided."}</p>
                    )}
                  </div>
                </div>
              </button>

            </div>
          );
        })}
      </div>

      {isEditModalOpen && (
        <CategoriesFormModal
          type={query.type}
          toggle={() => {
            setIsEditModalOpen(false);
            setSelectedCategory(undefined);
          }}
          open={isEditModalOpen}
          initialValues={selectedCategory}
        />
      )}
    </div>
  );
}
