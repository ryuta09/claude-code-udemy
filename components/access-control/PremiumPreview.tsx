"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

interface PremiumPreviewProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

/**
 * プレミアム機能のプレビューコンポーネント
 *
 * 無料ユーザーにはぼかし表示でプレビューを見せ、
 * アップグレードを促します。
 *
 * @example
 * ```tsx
 * <PremiumPreview title="カテゴリ別分析">
 *   <CategoryChart data={data} />
 * </PremiumPreview>
 * ```
 */
export function PremiumPreview({
  children,
  title = "プレミアム機能",
  description = "この機能はプレミアムプランでご利用いただけます",
}: PremiumPreviewProps) {
  const { has, isLoaded } = useAuth();

  // 認証情報が読み込まれるまでローディング表示
  if (!isLoaded) {
    return (
      <div className="animate-pulse">
        <div className="h-64 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  // プレミアムユーザーはそのまま表示
  if (has && has({ plan: "premium" })) {
    return <>{children}</>;
  }

  // 無料ユーザーにはぼかし表示
  return (
    <div className="relative">
      {/* ぼかしコンテンツ */}
      <div className="blur-sm pointer-events-none select-none" aria-hidden="true">
        {children}
      </div>

      {/* オーバーレイ */}
      <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center rounded-xl">
        <div className="text-center p-6 max-w-sm">
          {/* ロックアイコン */}
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          <h4 className="font-bold text-gray-900 mb-1">{title}</h4>
          <p className="text-sm text-gray-600 mb-4">{description}</p>

          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
            アップグレード
          </Link>
        </div>
      </div>
    </div>
  );
}
