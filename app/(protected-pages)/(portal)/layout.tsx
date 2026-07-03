import Sidebar from "@/components/Sidebar";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto lg:border-l lg:border-gray-200">
          <div className="bg-white h-full ">{children}</div>
        </main>
      </div>
    </>
  );
}
