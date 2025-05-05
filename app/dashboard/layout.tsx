"use client";
import type React from "react";
import { MobileSidebar, Sidebar } from "@/components/dashboard-sidebar";
import { EstablishmentProvider } from "@/components/establishment-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryClientProvider client={queryClient}>
      <EstablishmentProvider>
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex flex-col flex-1">
            <header className="h-16 border-b px-4 flex items-center md:justify-end">
              <MobileSidebar />
            </header>
            <main className="flex-1 p-4 md:p-6">{children}</main>
          </div>
        </div>
      </EstablishmentProvider>
    </QueryClientProvider>
  );
}
