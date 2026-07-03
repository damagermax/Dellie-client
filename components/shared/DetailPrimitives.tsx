"use client";

import type { ReactNode } from "react";

export function IdentityPanel({ label, title, description, className = "", contentClassName = "" }: { label: string; title: string; description: string; className?: string; contentClassName?: string }) {
  return (
    <div className={className}>
      <div className={`flex items-start gap-3 ${contentClassName}`}>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-gray-400">{label}</p>
          <p className="mt-1 truncate text-lg font-medium text-gray-800">{title}</p>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </div>
  );
}

export function Detail({ icon, label, value, className = "" }: { icon: ReactNode; label: string; value: string; className?: string }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-gray-400">{label}</p>
      <div className="mt-1 flex items-center gap-2 text-sm font-medium text-gray-900">
        {icon}
        <span>{value}</span>
      </div>
    </div>
  );
}
