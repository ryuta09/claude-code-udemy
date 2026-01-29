/**
 * アクセス制御コンポーネント
 *
 * プレミアムプランへのアクセス制御を提供するコンポーネント群です。
 *
 * @example
 * ```tsx
 * import { PlanProtect, PremiumPreview, useUserPlan } from '@/components/access-control';
 *
 * // 方法1: PlanProtectでラップ（プレミアム以外はUpgradePromptを表示）
 * <PlanProtect>
 *   <PremiumFeature />
 * </PlanProtect>
 *
 * // 方法2: PremiumPreviewでラップ（ぼかし表示でプレビュー）
 * <PremiumPreview title="カテゴリ分析">
 *   <CategoryChart />
 * </PremiumPreview>
 *
 * // 方法3: useUserPlanフックで条件分岐
 * const { isPremium } = useUserPlan();
 * if (isPremium) { ... }
 * ```
 */

export { PlanProtect, UpgradePrompt } from "./PlanProtect";
export { ClerkPlanProtect } from "./ClerkPlanProtect";
export { PremiumPreview } from "./PremiumPreview";
export { useUserPlan } from "./useUserPlan";
export type { PlanType } from "./useUserPlan";
