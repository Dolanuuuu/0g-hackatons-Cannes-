import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { Providers } from "../../Providers";
import { Navbar } from "../shared/components/layout/Navbar";
import { Sidebar } from "../shared/components/layout/Sidebar";
import { LayoutContent } from "../shared/components/layout/LayoutContent";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "0G DocMind",
  description: "Decentralized AI Document Intelligence powered by 0G",
  icons: {
    icon: "/favicon.svg",
  },
};

const LayoutLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Providers>
          <div className="flex min-h-screen w-full flex-col bg-background">
            <Sidebar />
            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
              <Navbar />
              <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                <Suspense fallback={<LayoutLoader />}>
                  <LayoutContent>{children}</LayoutContent>
                </Suspense>
              </main>
            </div>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
