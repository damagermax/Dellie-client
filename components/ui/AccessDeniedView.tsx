"use client";

import { Button } from "antd";
import Link from "next/link";

interface AccessDeniedViewProps {
  title?: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
}

export function AccessDeniedView({
  title = "Access denied",
  description = "You do not have permission to view this page.",
  backHref = "/dashboard",
  backLabel = "Go back",
}: AccessDeniedViewProps) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 text-center">
      <div className="max-w-md rounded-2xl border border-gray-200 bg-white px-8 py-10 shadow-sm">
        <p className="text-lg font-semibold text-gray-950">{title}</p>
        <p className="mt-2 text-sm leading-6 text-gray-500">{description}</p>
        <Link href={backHref}>
          <Button type="primary" className="mt-6">
            {backLabel}
          </Button>
        </Link>
      </div>
    </div>
  );
}
