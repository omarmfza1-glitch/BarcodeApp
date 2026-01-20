import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

const geist = Geist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "نظام إدارة الدورات والحضور",
  description: "نظام لإدارة الدورات التدريبية وتسجيل الحضور عبر الباركود",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={geist.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
