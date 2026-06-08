"use client";

import { useState } from "react";
import { useDeleteCategoryMutation, useGetCategoriesQuery, useUpdateCategoryMutation } from "@/lib/redux/services";
import { AppNotFoundView } from "@/components/ui/AppNotFoundView";
import { AppViewLoader } from "@/components/ui/AppViewLoader";
import { ActionDropdown } from "@/components/ui/ActionDropdown";
import CategoriesFormModal from "../CategoriesFormModal";
import { Category, CategoriesQueryParams, CategoryStatus, CategoryType } from "@/types/category";
import { Tag } from "antd";

export interface CategoriesListItemAction {
  openEditModal: (category: Category) => void;
  onDelete: (id: string) => void;
  onDeactivate: (id: string) => void;
  onActivate: (id: string) => void;
}

interface CategoriesListProps {
  query: CategoriesQueryParams;
}

export default function CategoriesList({ query }: CategoriesListProps) {
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>();

  const { data: categories, isLoading: loadingCategories } = useGetCategoriesQuery(query);

  const openEditModal = (category: Category) => {
    setSelectedCategory(category);
    setIsEditModalOpen(true);
  };

  const handleActivateCategory = async (categoryId: string) => {
    if (!isUpdating) await updateCategory({ id: categoryId, status: CategoryStatus.ACTIVE });
  };

  const handleDeactivateCategory = async (categoryId: string) => {
    if (!isUpdating) await updateCategory({ id: categoryId, status: CategoryStatus.INACTIVE });
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!isDeleting) await deleteCategory(categoryId);
  };

  const title = query.type === CategoryType.EXPENSE ? "Expense Categories" : "Product Categories";

  return (
    <div>
      <AppViewLoader loading={loadingCategories} />
      <AppNotFoundView dataLength={categories?.data?.length || 0} loading={loadingCategories} query={query} entity="Categories" />

      <div className="sticky -top-[calc(6.5rem)] border-b border-blue-100 bg-gray-50 px-5 py-5">
        <div>
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          <p className="text-xs text-gray-500">{query.type === CategoryType.EXPENSE ? "Expense-related labels and statuses" : "Product labels with storefront and POS visibility"}</p>
        </div>
      </div>

      <div className="px-5 pb-32">
        {categories?.data?.map((category, index) => {
          const isProductCategory = category.type === CategoryType.PRODUCT;

          return (
            <div key={category.id} className={`flex items-start justify-between gap-4 py-5 ${index !== categories.data.length - 1 ? "border-b border-blue-100" : ""}`}>
              <button type="button" className="flex min-w-0 flex-1 flex-col items-start text-left" onClick={() => openEditModal(category)}>
                <div className="flex min-w-0 items-center gap-2">
                  <h3 className="truncate font-medium text-gray-800">{category.name}</h3>
                  <Tag color={category.status === CategoryStatus.ACTIVE ? "green" : "default"} className="!m-0 !rounded-full !px-2">
                    {category.status === CategoryStatus.ACTIVE ? "Active" : "Inactive"}
                  </Tag>
                </div>

                <p className="mt-1 line-clamp-2 text-sm text-gray-500">{category.description || "No description provided."}</p>

                {isProductCategory && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Tag color={category.showInStorefront ? "blue" : "default"} className="!m-0 !rounded-full !px-2">
                      {category.showInStorefront ? "Storefront" : "Hidden from Storefront"}
                    </Tag>
                    <Tag color={category.showInPOS ? "purple" : "default"} className="!m-0 !rounded-full !px-2">
                      {category.showInPOS ? "POS" : "Hidden from POS"}
                    </Tag>
                  </div>
                )}
              </button>

              <ActionDropdown
                openEditModal={() => openEditModal(category)}
                onDelete={() => handleDeleteCategory(category.id)}
                onActivate={() => handleActivateCategory(category.id)}
                onDeactivate={() => handleDeactivateCategory(category.id)}
                status={category.status}
              />
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
