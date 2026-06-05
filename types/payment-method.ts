export interface PaymentMethod {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentMethodInput {
  name: string;
}

export interface UpdatePaymentMethodInput extends Partial<CreatePaymentMethodInput> {
  id: string;
}

export interface PaymentMethodsQueryParams {
  search?: string;
}
