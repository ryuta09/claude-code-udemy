"use client";

import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { UserMenu } from "./UserMenu";

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="container-main">
        <div className="flex items-center justify-between h-16">
          {/* ロゴ */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">
              Project Tracker
            </span>
          </Link>

          {/* ナビゲーション */}
          <nav className="hidden md:flex items-center gap-6">
            <SignedIn>
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ダッシュボード
              </Link>
            </SignedIn>
            <SignedOut>
              <Link
                href="#features"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                機能
              </Link>
              <Link
                href="#pricing"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                料金
              </Link>
            </SignedOut>
          </nav>

          {/* ユーザーメニュー */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
