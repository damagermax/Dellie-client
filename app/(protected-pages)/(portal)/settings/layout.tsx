import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "More",
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-full bg-white">{children}</div>;
}
