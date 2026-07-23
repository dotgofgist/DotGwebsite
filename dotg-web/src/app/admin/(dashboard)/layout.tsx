import type { Metadata } from "next";
import { AdminHeader } from "@/components/layout/admin-header";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { requireContentManager } from "@/features/auth/server";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const managerPromise = requireContentManager();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        className="sr-only z-50 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        href="#admin-main-content"
      >
        관리자 본문 바로가기
      </a>
      <AdminSidebar />
      <div className="min-w-0 lg:pl-64">
        <AdminHeader managerPromise={managerPromise} />
        <main
          className="min-w-0 px-4 py-8 sm:px-6 lg:px-8"
          id="admin-main-content"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
