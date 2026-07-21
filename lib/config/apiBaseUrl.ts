const PRODUCTION_API_URL = "https://dellie-server-production.up.railway.app";
const DEVELOPMENT_API_URL = "http://localhost:4200";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "production" ? PRODUCTION_API_URL : DEVELOPMENT_API_URL);

export const API_BASE_URL_NO_TRAILING_SLASH = API_BASE_URL.replace(/\/+$/, "");
