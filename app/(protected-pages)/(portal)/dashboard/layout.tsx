export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            {/* Layout UI */}
            {/* Place children where you want to render a page or nested layout */}
            <main>{children}</main>
        </div>
    );
}
