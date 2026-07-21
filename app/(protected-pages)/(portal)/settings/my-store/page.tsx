import { redirect } from "next/navigation";

export default function MyStoreSettingsPage() {
  redirect("/settings?section=Business%20Profile");
}
