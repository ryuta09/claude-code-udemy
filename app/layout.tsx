import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Project Tracker",
    template: "%s | Project Tracker",
  },
  description:
    "シンプルに作業時間を記録・分析できるアプリ。タイマー機能、カテゴリ分け、ダッシュボード表示で、誰でも簡単に継続できる作業時間計測アプリ。",
  keywords: [
    "作業時間",
    "タイムトラッカー",
    "時間管理",
    "生産性",
    "フリーランス",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
