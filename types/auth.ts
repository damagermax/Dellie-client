import { CurrentUser } from "./user";
import { StoreAccess } from "./store-access";

export interface RegisterUserInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginUserInput {
  identifier: string;
  password: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface RestPasswordInput {
  token: string;
  newPassword: string;
}

export interface ForgotPasswordInput {
  username: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: CurrentUser;
  stores?: StoreAccess[];
  activeStore?: StoreAccess;
}
