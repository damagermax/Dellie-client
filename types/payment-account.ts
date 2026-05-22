export enum AccountType {
  CASH = "CASH",
  BANK = "BANK",
  DIGITAL_WALLET = "DIGITAL WALLET",
}

export interface PaymentAccount {
  id: string;
  balance?: number;
  name: string;
  accountNumber?: string;
  accountName?: string;
  type: AccountType;
}

export interface CreatePaymentAccountInput extends Partial<Omit<PaymentAccount, "id">> {}

export interface UpdatePaymentAccountInput extends Partial<CreatePaymentAccountInput> {
  id: string;
}

export interface PaymentAccountQueryParams {
  search?: string | "";
  type?: AccountType;
}
