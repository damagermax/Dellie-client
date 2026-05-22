export interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  sameAsShipping?: boolean;
}

export interface Customer {
  name: string;
  email: string;
  phone: string;
}

export interface Order {
  id: string;
  date: string;
  customer: Customer;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: Address;
  billingAddress?: Address;
  notes?: string;
}
