import { Address, ContactRole } from "@/types/contact";

export function getContactInitials(name?: string) {
  if (!name) return "";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

export function getContactColor(text?: string) {
  const colors = ["#F44336", "#E91E63", "#9C27B0", "#673AB7", "#3F51B5", "#2196F3", "#03A9F4", "#009688", "#4CAF50", "#8BC34A", "#FF9800", "#FF5722"];
  const source = text || "Contact";
  let hash = 0;

  for (let i = 0; i < source.length; i++) {
    hash = source.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

export function formatContactAddress(address?: Address) {
  if (!address) return "";
  return [address.street, address.city, address.state, address.country, address.postalCode].filter(Boolean).join(", ");
}

export function formatContactRole(role: ContactRole) {
  return role.replaceAll("_", " ");
}
