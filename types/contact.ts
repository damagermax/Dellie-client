export enum ContactStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export interface ContactQueryParams {
  search?: string | "";
  status?: ContactStatus;
}

export interface Contact {
  id: string;
  name: string;
  displayName?: string;
  email?: string;
  phone?: string;
  addresses?: Address[];
  status: ContactStatus;
}

export interface CreateContactInput {
  name: string;
  displayName?: string;
  email?: string;
  phone?: string;
  roles?: ContactRole[];
  status: ContactStatus;
  currencyId: string;
  balanceAmount?: number;
  balanceRate: number;
}

export interface UpdateContactInput extends Partial<CreateContactInput> {
  id: string;
  defaultCurrencyId?: string;
}

export enum ContactRole {
  CUSTOMER = "customer",
  SUPPLIER = "supplier",
  WHOLESALER = "wholesaler",
  EMPLOYEE = "employee",
  DISTRIBUTOR = "distributor",
  RETAILER = "retailer",
  PARTNER = "partner",
  CONTRACTOR = "contractor",
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}
