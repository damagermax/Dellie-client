export interface RegisterUserInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginUserInput {
  email: string;
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
  email: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {};
}
