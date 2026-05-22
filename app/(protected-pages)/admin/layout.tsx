import AdminSidebar from "@/components/admin/AdminSidebar";
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen">
            <AdminSidebar />
            <main className="flex-1 bg-gray-50 border-l border-gray-200 overflow-auto">
                <div className="bg-white h-full ">{children}</div>
            </main>
        </div>
    );
}
