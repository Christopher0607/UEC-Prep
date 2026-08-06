import type { Metadata, Viewport } from "next";
import Nav from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "UEC 冲刺系统",
  description: "2026 高中统考 · 倒计时、考点覆盖、错题本、背诵卡、真题记录",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f7f8" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0f13" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground">
        <Nav />
        <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-6">{children}</main>
      </body>
    </html>
  );
}
