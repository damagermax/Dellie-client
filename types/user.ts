import { Store } from "@/types/index";
import { StoreAccess, StorePermission } from "./store-access";

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  username?: string;
  imageUrl?: string;
  isActive: boolean;
  role?: string;
}

export interface CurrentUser extends User {
  store: Store;
  stores?: StoreAccess[];
  activeStoreId?: string;
  permissions?: StorePermission[];
  assignedLocationId?: string | null;
  assignedLocation?: { id: string; name: string; address?: string } | null;
}
