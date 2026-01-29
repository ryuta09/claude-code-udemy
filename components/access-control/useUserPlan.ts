"use client";

import { useAuth } from "@clerk/nextjs";

export type PlanType = "free" | "premium";

interface UseUserPlanReturn {
  /** プラン情報が読み込まれたかどうか */
  isLoaded: boolean;
  /** ユーザーの現在のプラン */
  plan: PlanType;
  /** プレミアムプランかどうか */
  isPremium: boolean;
  /** 無料プランかどうか */
  isFree: boolean;
}

/**
 * ユーザーのプラン情報を取得するカスタムフック
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isPremium, isLoaded } = useUserPlan();
 *
 *   if (!isLoaded) return <Loading />;
 *
 *   return isPremium ? <PremiumContent /> : <FreeContent />;
 * }
 * ```
 */
export function useUserPlan(): UseUserPlanReturn {
  const { has, isLoaded } = useAuth();

  if (!isLoaded || !has) {
    return {
      isLoaded: false,
      plan: "free",
      isPremium: false,
      isFree: true,
    };
  }

  const isPremium = has({ plan: "premium" });

  return {
    isLoaded: true,
    plan: isPremium ? "premium" : "free",
    isPremium,
    isFree: !isPremium,
  };
}
