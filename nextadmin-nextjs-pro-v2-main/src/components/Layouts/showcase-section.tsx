"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Layouts/sidebar";
import { Header } from "@/components/Layouts/header";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideLayout = pathname === "/auth/signin";

  return (
    <html lang="en">
    <body className="min-h-screen bg-gray-50 dark:bg-gray-dark">
    {hideLayout ? (
      // Layout limpio
      <div className="flex min-h-screen items-center justify-center">
        {children}
      </div>
    ) : (
      // Layout con sidebar + header
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <main>{children}</main>
        </div>
      </div>
    )}
    </body>
    </html>
  );
}
