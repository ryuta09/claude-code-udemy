"use client";

import dynamic from "next/dynamic";
import { UpgradePrompt } from "./PlanProtect";

// ClerkのProtectコンポーネントを動的インポート
const Protect = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.Protect),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse">
        <div className="h-48 bg-gray-100 rounded-xl" />
      </div>
    ),
  }
);

interface ClerkPlanProtectProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requiredPlan?: string;
}

/**
 * ClerkのProtectコンポーネントを使用したアクセス制御
 *
 * Clerkの組み込みコンポーネントを直接使用する方法です。
 * has()関数が動作しない環境では、こちらを使用してください。
 *
 * @example
 * ```tsx
 * <ClerkPlanProtect requiredPlan="premium">
 *   <PremiumFeatureComponent />
 * </ClerkPlanProtect>
 * ```
 */
export function ClerkPlanProtect({
  children,
  fallback,
  requiredPlan = "premium",
}: ClerkPlanProtectProps) {
  return (
    <Protect plan={requiredPlan} fallback={fallback || <UpgradePrompt />}>
      {children}
    </Protect>
  );
}
