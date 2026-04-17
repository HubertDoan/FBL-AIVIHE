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
  title: "AIVIHE – Nền tảng quản lý thông tin sức khỏe cá nhân | Thong Dong Life",
  description:
    "AIVIHE giúp khách hàng và gia đình quản lý thông tin sức khỏe cá nhân, kết nối Daycare, bác sĩ gia đình và phục hồi chức năng trong một hành trình chăm sóc liên tục, an toàn và dễ hiểu.",
  keywords: [
    "quản lý thông tin sức khỏe cá nhân",
    "trợ lý AI sức khỏe",
    "chăm sóc sức khỏe chủ động",
    "bác sĩ gia đình",
    "phục hồi chức năng",
    "Thong Dong Daycare",
    "Thong Dong Life",
    "theo dõi sức khỏe gia đình",
    "nhật ký sức khỏe cá nhân",
    "AIVIHE",
  ],
  openGraph: {
    title: "AIVIHE – Nền tảng quản lý thông tin sức khỏe cá nhân",
    description:
      "Cùng khách hàng, gia đình, Daycare, bác sĩ gia đình và phục hồi chức năng theo dõi một hành trình sức khỏe liên tục, an toàn và dễ hiểu.",
    type: "website",
    locale: "vi_VN",
    siteName: "AIVIHE",
  },
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
