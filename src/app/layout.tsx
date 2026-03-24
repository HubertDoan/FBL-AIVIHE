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
  title: "AIVIHE - Tr\u1EE3 l\u00FD AI s\u1EE9c kh\u1ECFe c\u00E1 nh\u00E2n",
  description:
    "Tr\u1EE3 l\u00FD AI s\u1EE9c kh\u1ECFe c\u00E1 nh\u00E2n gi\u00FAp ng\u01B0\u1EDDi d\u00E2n hi\u1EC3u v\u00E0 qu\u1EA3n l\u00FD d\u1EEF li\u1EC7u s\u1EE9c kh\u1ECFe c\u1EE7a m\u00ECnh.",
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
