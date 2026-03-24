import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DisclaimerBanner } from "@/components/layout/disclaimer-banner";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "AIVIHE - Trợ lý AI sức khỏe cá nhân",
  description:
    "Trợ lý AI sức khỏe cá nhân giúp người dân hiểu và quản lý dữ liệu sức khỏe của mình.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <div className="flex-1">{children}</div>
        <DisclaimerBanner />
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            className: "text-base",
            duration: 4000,
          }}
        />
      </body>
    </html>
  );
}
