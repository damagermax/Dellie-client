import { Store } from "@/types/index";
import { StoreAccess, StorePermission } from "./store-access";

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  bio?: string;
  imageUrl?: string;
  isActive: boolean;
}

export interface CurrentUser extends User {
  store: Store;
  stores?: StoreAccess[];
  activeStoreId?: string;
  permissions?: StorePermission[];
}
