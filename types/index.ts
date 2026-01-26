/**
 * Project Tracker - 型定義ファイル
 *
 * データモデル定義（.claude/requirements.md 準拠）
 */

// =============================================
// カテゴリ関連
// =============================================

/**
 * カテゴリ
 * ユーザーが作業時間を分類するためのカテゴリ
 */
export interface Category {
  id: string; // UUID
  user_id: string; // Clerk ユーザーID (TEXT)
  name: string; // カテゴリ名
  sort_order: number; // 並び順
  created_at: string; // ISO 8601 形式
  updated_at: string; // ISO 8601 形式
}

/**
 * カテゴリ作成用の入力データ
 */
export interface CategoryCreateInput {
  name: string;
  sort_order?: number;
}

/**
 * カテゴリ更新用の入力データ
 */
export interface CategoryUpdateInput {
  name?: string;
  sort_order?: number;
}

// =============================================
// 作業ログ関連
// =============================================

/**
 * 作業ログ
 * ユーザーの作業時間記録
 */
export interface WorkLog {
  id: string; // UUID
  user_id: string; // Clerk ユーザーID (TEXT)
  category_id: string; // カテゴリID（外部キー）
  duration: number; // 作業時間（秒単位）
  memo: string | null; // メモ（任意）
  started_at: string | null; // タイマー開始時刻（タイマー使用時）
  created_at: string; // ISO 8601 形式
  updated_at: string; // ISO 8601 形式
}

/**
 * カテゴリ情報を含む作業ログ（結合クエリ用）
 */
export interface WorkLogWithCategory extends WorkLog {
  category: Category;
}

/**
 * 作業ログ作成用の入力データ
 */
export interface WorkLogCreateInput {
  category_id: string;
  duration: number; // 秒単位
  memo?: string | null;
  started_at?: string | null;
}

/**
 * 作業ログ更新用の入力データ
 */
export interface WorkLogUpdateInput {
  category_id?: string;
  duration?: number;
  memo?: string | null;
}

// =============================================
// タイマー関連
// =============================================

/**
 * タイマーの状態
 * idle: 初期状態
 * running: 計測中
 * paused: 一時停止中
 */
export type TimerStatus = "idle" | "running" | "paused";

/**
 * タイマーの状態管理用インターフェース
 */
export interface TimerState {
  status: TimerStatus;
  elapsedSeconds: number; // 経過時間（秒）
  startedAt: string | null; // 開始時刻（ISO 8601）
  pausedAt: string | null; // 一時停止時刻（ISO 8601）
}

// =============================================
// API レスポンス関連
// =============================================

/**
 * API レスポンスの基本形式
 */
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

/**
 * ページネーション情報
 */
export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

/**
 * ページネーション付きAPIレスポンス
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
  error: string | null;
}

// =============================================
// 統計・分析関連
// =============================================

/**
 * 期間タイプ
 */
export type PeriodType = "daily" | "weekly" | "monthly";

/**
 * 期間の選択肢
 */
export type PeriodOption =
  | "today"
  | "yesterday"
  | "this_week"
  | "last_week"
  | "this_month"
  | "last_month";

/**
 * 基本統計サマリー（無料版）
 */
export interface BasicStats {
  todayTotal: number; // 秒
  weekTotal: number; // 秒
  monthTotal: number; // 秒
}

/**
 * カテゴリ別作業時間
 */
export interface CategoryStat {
  categoryId: string;
  categoryName: string;
  totalDuration: number; // 秒
  percentage: number; // パーセンテージ
}

/**
 * 期間別統計サマリー（プレミアム版）
 */
export interface PeriodStats {
  period: PeriodType;
  totalDuration: number; // 秒
  previousPeriodDuration: number; // 前期間の合計（秒）
  changeRate: number; // 増減率（%）
  averageDailyDuration: number; // 1日平均（秒）
  topCategory: CategoryStat | null;
  categoryBreakdown: CategoryStat[];
}

// =============================================
// ユーザー関連
// =============================================

/**
 * ユーザープラン
 */
export type UserPlan = "free" | "premium";

/**
 * ユーザー情報（Clerkから取得）
 */
export interface UserInfo {
  id: string; // Clerk ユーザーID
  email: string;
  plan: UserPlan;
}

// =============================================
// フォーム関連
// =============================================

/**
 * フォームのエラー状態
 */
export interface FormErrors {
  [field: string]: string | undefined;
}

/**
 * フォームの送信状態
 */
export type FormStatus = "idle" | "submitting" | "success" | "error";
