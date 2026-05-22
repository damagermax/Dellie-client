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
  status?: CategoryStatus;
  parent?: string;
}

export interface CategoryCreateInput {
  name: string;
  type: CategoryType;
  parentId?: String;
  description?: string;
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
