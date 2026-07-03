export interface PaymentMethod {
  id: string;
  name: string;
  isSystem?: boolean;
  status: "active" | "inactive";
  isDefault: boolean;
  showInPOS?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentMethodInput {
  name: string;
  status?: "active" | "inactive";
  isDefault?: boolean;
  showInPOS?: boolean;
}

export interface UpdatePaymentMethodInput extends Partial<CreatePaymentMethodInput> {
  id: string;
}

export interface PaymentMethodsQueryParams {
  search?: string;
  status?: "active" | "inactive";
  showInPOS?: boolean;
}
