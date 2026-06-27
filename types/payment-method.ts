export interface PaymentMethod {
  id: string;
  name: string;
  status: "active" | "inactive";
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentMethodInput {
  name: string;
  status?: "active" | "inactive";
  isDefault?: boolean;
}

export interface UpdatePaymentMethodInput extends Partial<CreatePaymentMethodInput> {
  id: string;
}

export interface PaymentMethodsQueryParams {
  search?: string;
  status?: "active" | "inactive";
}
