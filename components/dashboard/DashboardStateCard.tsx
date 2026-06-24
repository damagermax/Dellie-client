"use client";

import { DashboardCard } from "./DashboardCard";

interface DashboardStateCardProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function DashboardStateCard({ title, description, actionLabel, onAction }: DashboardStateCardProps) {
  return (
    <DashboardCard className="text-center" contentClassName="px-6 py-16">
      <p className="font-medium text-gray-950">{title}</p>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
      {actionLabel && onAction ? (
        <button type="button" className="mt-5 rounded-sm bg-gray-950 px-4 py-2 text-sm font-medium text-white" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </DashboardCard>
  );
}
