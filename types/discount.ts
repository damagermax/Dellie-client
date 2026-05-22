export enum DiscountStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SCHEDULED = "scheduled",
  EXPIRED = "expired",
}

export enum DiscountType {
  FIXED = "fixed amount",
  PERCENT = "percentage",
}

export enum DiscountMethod {
  CODE = "code",
  AUTO = "automatic",
}

export interface Discount {
  id: string;
  name: string;
  value?: number;
  status?: DiscountStatus;
  startDate: Date;
  endDate: Date;
  type: DiscountType;
  bannerUrl: string;
  method: DiscountMethod;
  usageLimit: number;
  minAmount: number;
  promoteDiscount: boolean;
}

export interface DiscountCreateInput extends Partial<Omit<Discount, "id">> {
  name: string;
  image?: File;
}

export interface DiscountUpdateInput extends Partial<DiscountCreateInput> {
  id: string;
}

export interface DiscountsQueryParams {
  search?: string | "";
  status?: DiscountStatus;
  type?: DiscountType;
  method?: DiscountMethod;
}
