import type { ReactNode } from "react";

interface AuthPageShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}

export default function AuthPageShell({ eyebrow, title, description, children, className = "" }: AuthPageShellProps) {
  return (
    <section className={`relative overflow-hidden rounded-[28px] border border-white/34 bg-[rgba(255,255,255,0.93)] p-5 shadow-[0_48px_140px_-58px_rgba(2,12,11,0.98)] backdrop-blur-2xl sm:p-7 lg:w-[620px] lg:p-8 ${className}`}>
      <div className="absolute inset-x-0 top-0 h-20 bg-[radial-gradient(circle_at_top,rgba(247,200,85,0.12),transparent_70%)]" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white/8 to-transparent" />

      <div className="relative">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[18px] bg-[#f7c855] text-sm font-semibold text-[#102d2b] shadow-sm">D</div>
          <div>
            <p className="text-sm font-semibold text-[#102d2b]">Dellie</p>
            <p className="text-xs text-gray-500">Business operating system</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#2d837d]/80">{eyebrow}</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gray-950 sm:text-[2rem]">{title}</h1>
          <p className="mt-2.5 max-w-[40ch] text-sm leading-6 text-gray-600">{description}</p>
        </div>

        {children}
      </div>
    </section>
  );
}
