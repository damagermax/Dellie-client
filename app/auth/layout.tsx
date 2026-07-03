import AuthHeroIllustration from "@/components/auth/AuthHeroIllustration";

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#102d2b]">
      <AuthHeroIllustration />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-6 sm:px-8 lg:justify-end lg:px-12 xl:px-16">
        <div className="w-full max-w-[520px] lg:mr-[7vw] xl:mr-[9vw]">{children}</div>
      </div>
    </div>
  );
}
