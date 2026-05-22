"use client";

import { useGetCategoriesQuery, useUpdateCategoryMutation, useDeleteCategoryMutation } from "@/lib/redux/services";
import CategoriesFormModal from "../CategoriesFormModal";

import CategoriesTable from "./CategoriesTable";
import { Category, CategoriesQueryParams, CategoryStatus } from "@/types/category";
import { useState } from "react";
import useToggle from "@/hooks/UseToggle";
import { AppNotFoundView } from "@/components/ui/AppNotFoundView";
import { AppViewLoader } from "@/components/ui/AppViewLoader";
import { Checkbox } from "antd";
import { TbChevronDown, TbChevronRight } from "react-icons/tb";

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

  const [isEditModalOpen, toggleEditModal] = useToggle();

  const [selectedCategory, setSelectedCategory] = useState<Category>();

  const formData = new FormData();

  const { data: categories, isLoading: loadingCategories } = useGetCategoriesQuery(query);

  const openEditModal = (Category: Category) => {
    setSelectedCategory(Category);
    toggleEditModal();
  };

  const handleActivateCategory = async (categoryId: string) => {
    !isUpdating && (await updateCategory({ id: categoryId, status: CategoryStatus.ACTIVE }));
  };
  const handleDeactivateCategory = async (categoryId: string) => {
    !isUpdating && (await updateCategory({ id: categoryId, status: CategoryStatus.INACTIVE }));
  };
  const handleDeleteCategory = async (categoryId: string) => {
    !isDeleting && (await deleteCategory(categoryId));
  };

  // const handleUploadCategoryImage = async (categoryId: string) => {
  //   // Create a file input element dynamically
  //   const input = document.createElement("input");
  //   input.type = "file";
  //   input.accept = "image/*";
  //   input.click();

  //   // Wait for the user to pick a file
  //   input.onchange = async () => {
  //     if (!input.files || input.files.length === 0) {
  //       console.log("No file selected.");
  //       return;
  //     }

  //     const image = input.files[0];
  //     formData.append("image", image);
  //     !isUpdating && (await updateCategory({ id: categoryId, data: formData }));
  //     formData.delete("status");
  //   };
  // };

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="">
      <AppViewLoader loading={loadingCategories} />

      <AppNotFoundView dataLength={categories?.data?.length || 0} loading={loadingCategories} query={query} entity="Categories" />

      <div className=" py-5 px-5  sticky -top-[calc(6.5rem)] border-b border-blue-100 -bg-gray-100   ">
        <div className="flex items-center gap-3">
          <Checkbox />
          <p className=" text-gray-900 font-medium ">Product Categories</p>
        </div>
      </div>

      <div className="px-6  pb-32">
        {categories?.data?.map((category) => {
          const isExpanded = expanded[category.id];

          return (
            <div className=" py-5 border-b border-blue-100">
              <div className="flex  justify-between items-start gap-x-3 flex-1">
                <div>
                  <h3 className="font-medium text-gray-800">{category?.name}</h3>
                  <p className="text-xs  text-gray-500  capitalize">{category?.type?.toLowerCase()}</p>
                </div>

                <button onClick={() => toggleExpand(category?.id)} className="mt-1 hidden  text-gray-500">
                  {isExpanded ? <TbChevronDown size={16} /> : <TbChevronRight size={16} />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {isEditModalOpen && <CategoriesFormModal type={query.type} toggle={toggleEditModal} open={isEditModalOpen} initialValues={selectedCategory} />}
    </div>
  );
}
