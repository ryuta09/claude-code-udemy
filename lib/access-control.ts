import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export type PlanType = "free" | "premium";

/**
 * サーバーサイドでユーザーのプランを取得
 *
 * @example
 * ```ts
 * // API Routeでの使用
 * export async function GET() {
 *   const plan = await getUserPlan();
 *   if (plan !== 'premium') {
 *     return NextResponse.json({ error: 'Premium required' }, { status: 403 });
 *   }
 *   // プレミアム機能の処理
 * }
 * ```
 */
export async function getUserPlan(): Promise<PlanType> {
  const { has } = await auth();

  if (has({ plan: "premium" })) {
    return "premium";
  }

  return "free";
}

/**
 * プレミアムプランが必要なAPIエンドポイントを保護
 *
 * @example
 * ```ts
 * export async function GET() {
 *   const response = await requirePremium();
 *   if (response) return response; // 403エラーレスポンス
 *
 *   // プレミアム機能の処理
 * }
 * ```
 */
export async function requirePremium(): Promise<NextResponse | null> {
  const { userId, has } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!has({ plan: "premium" })) {
    return NextResponse.json(
      {
        error: "Premium plan required",
        message: "この機能はプレミアムプランでご利用いただけます",
        upgradeUrl: "/pricing",
      },
      { status: 403 }
    );
  }

  return null;
}

/**
 * プレミアム機能かどうかをチェック
 *
 * @example
 * ```ts
 * const isPremium = await checkPremium();
 * if (isPremium) {
 *   // プレミアム機能
 * }
 * ```
 */
export async function checkPremium(): Promise<boolean> {
  const { has } = await auth();
  return has({ plan: "premium" });
}
