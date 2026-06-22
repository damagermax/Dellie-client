export enum ContactStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export interface ContactQueryParams {
  search?: string | "";
  status?: ContactStatus;
  role?: ContactRole;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface Contact {
  id: string;
  name: string;
  displayName?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  addresses?: Address[];
  roles?: ContactRole[];
  employeeAccess?: {
    username?: string;
    role?: string;
    permissions?: string[];
    status?: "pending" | "active" | "disabled";
    isDefault?: boolean;
  };
  transactionSummary?: {
    sales: ContactTransactionSummaryItem;
    purchases: ContactTransactionSummaryItem;
    expenses: ContactTransactionSummaryItem;
    landedCosts: ContactTransactionSummaryItem;
  };
  assignedEmployeeContactId?: string | null;
  assignedEmployee?: ContactAssignmentPreview;
  assignedCustomers?: ContactAssignmentPreview[];
  note?: string;
  paymentTerms?: string;
  currencyId?: string | { id: string; code: string; name?: string };
  createdBy?: { id: string; name: string; email?: string };
  createdAt?: string;
  updatedAt?: string;
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
}

export interface UpdateContactInput extends Partial<CreateContactInput> {
  id: string;
  defaultCurrencyId?: string;
  assignedEmployeeContactId?: string | null;
  assignedCustomerIds?: string[];
}

export interface EmployeeAccessInput {
  role?: string;
  permissions?: string[];
}

export interface EmployeeAccessResponse {
  contact: Contact;
  user?: {
    id: string;
    email: string;
    name: string;
    phone?: string;
    username?: string;
    isActive: boolean;
  };
  message: string;
}

export enum ContactRole {
  CUSTOMER = "customer",
  SUPPLIER = "supplier",
  EMPLOYEE = "employee",
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface ContactAssignmentPreview {
  id: string;
  name: string;
  displayName?: string;
  email?: string;
  phone?: string;
}

export interface ContactTransactionSummaryItem {
  total: number;
  count: number;
  formattedTotal: string;
}
