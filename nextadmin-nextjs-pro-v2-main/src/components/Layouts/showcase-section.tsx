"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Layouts/sidebar";
import { Header } from "@/components/Layouts/header";
import React from "react";
type ShowcaseSectionProps = {
  title?: string;
  description?: string;
  children?: React.ReactNode;
};

const ShowcaseSection = ({ title, description, children }: ShowcaseSectionProps) => (
  <section className="space-y-4">
    {title && <h2 className="text-xl font-semibold">{title}</h2>}
    {description && <p className="text-sm text-muted-foreground">{description}</p>}
    <div>{children}</div>
  </section>
);

export default ShowcaseSection;
export { ShowcaseSection }; // ← clave: también exporta nombrado
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

export { ShowcaseSection }; 
