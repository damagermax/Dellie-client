export interface PaymentTerm {
  id: string;
  name: string;
  code: string;
  days: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentTermInput {
  name: string;
  days: number;
}

export interface UpdatePaymentTermInput extends Partial<CreatePaymentTermInput> {
  id: string;
}

export interface PaymentTermsQueryParams {
  search?: string;
}
