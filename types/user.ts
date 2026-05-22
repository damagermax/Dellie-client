import { Store } from "@/types/index";

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
}
