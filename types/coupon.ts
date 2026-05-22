export interface Coupon {
    id: string;
    code: string;
    discountType: string;
    value: number;
    usageLimit: number;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
}

export interface CreateCouponInput {
    code: string;
    discountType: string;
    value: number;
    usageLimit: number;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
}

export interface UpdateCouponInput {
    id: string;
    code?: string;
    discountType?: string;
    value?: number;
    usageLimit?: number;
    startDate?: Date;
    endDate?: Date;
    isActive?: boolean;
}
