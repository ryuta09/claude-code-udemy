"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

interface PlanProtectProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requiredPlan?: "premium";
}

/**
 * プラン別アクセス制御コンポーネント
 *
 * useAuthフックのhas()関数を使用してプランを確認します。
 * プレミアムプランが必要な機能をラップして使用します。
 *
 * @example
 * ```tsx
 * <PlanProtect>
 *   <PremiumFeatureComponent />
 * </PlanProtect>
 * ```
 */
export function PlanProtect({
  children,
  fallback,
  requiredPlan = "premium",
}: PlanProtectProps) {
  const { has, isLoaded } = useAuth();

  // 認証情報が読み込まれるまでローディング表示
  if (!isLoaded) {
    return (
      <div className="animate-pulse">
        <div className="h-48 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  // has関数が利用できない場合（未認証など）
  if (!has) {
    return fallback ? <>{fallback}</> : <UpgradePrompt />;
  }

  // プランをチェック
  const hasAccess = has({ plan: requiredPlan });

  if (!hasAccess) {
    return fallback ? <>{fallback}</> : <UpgradePrompt />;
  }

  return <>{children}</>;
}

/**
 * アップグレード促進UI（デフォルトのフォールバック）
 */
export function UpgradePrompt() {
  return (
    <div className="card bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
      <div className="text-center py-8 px-6">
        {/* ロックアイコン */}
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-blue-600"
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

        <h3 className="text-xl font-bold text-gray-900 mb-2">
          プレミアム機能
        </h3>

        <p className="text-gray-600 mb-6">
          この機能はプレミアムプランでご利用いただけます。
        </p>

        {/* 特典リスト */}
        <div className="bg-white rounded-xl p-4 mb-6 text-left">
          <p className="font-semibold text-gray-900 mb-3 text-sm">
            プレミアムプランの特典
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-green-500 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              日次・週次・月次の期間切り替え
            </li>
            <li className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-green-500 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              過去データとの比較（昨日/先週/先月）
            </li>
            <li className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-green-500 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              カテゴリ別の詳細グラフ
            </li>
            <li className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-green-500 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              作業時間トレンドの可視化
            </li>
          </ul>
        </div>

        {/* 価格と CTA */}
        <div className="space-y-3">
          <p className="text-2xl font-bold text-gray-900">
            $10
            <span className="text-sm font-normal text-gray-500">/月</span>
          </p>
          <Link href="/pricing" className="btn-primary inline-block w-full">
            プレミアムにアップグレード
          </Link>
        </div>
      </div>
    </div>
  );
}
