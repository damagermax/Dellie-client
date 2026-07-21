export enum CategoryStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export enum CategoryType {
  PRODUCT = "PRODUCT",
  SERVICE = "SERVICE",
  EXPENSE = "EXPENSE",
}

export interface Category {
  id: string;
  type: CategoryType;
  name: string;
  description?: string;
  imageUrl?: string;
  imageKey?: string;
  status?: CategoryStatus;
  showInStorefront?: boolean;
  showInPOS?: boolean;
  parent?: string;
}

export interface CategoryCreateInput {
  name: string;
  type: CategoryType;
  parentId?: string;
  description?: string;
  image?: File;
  removeImage?: boolean;
  status?: CategoryStatus;
  showInStorefront?: boolean;
  showInPOS?: boolean;
}

export interface CategoryUpdateInput extends Partial<CategoryCreateInput> {
  id: string;
  status?: CategoryStatus;
}

export interface CategoriesQueryParams {
  search?: string | "";
  type?: CategoryType;
  status?: CategoryStatus;
}
