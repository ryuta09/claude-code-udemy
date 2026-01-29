import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ensureUserExists } from "@/lib/user";
import { createAuthenticatedClient } from "@/lib/supabase";
import { WorkLogWithCategory } from "@/types/database";

// 時間を表示用にフォーマット（秒 → "Xh Ym" 形式）
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

// 時間を詳細フォーマット（秒 → "X時間Y分Z秒" 形式）
function formatDurationDetailed(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}時間${minutes}分${secs}秒`;
  } else if (minutes > 0) {
    return `${minutes}分${secs}秒`;
  } else {
    return `${secs}秒`;
  }
}

// 今日の開始時刻を取得（ローカルタイムの00:00:00）
function getTodayStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
}

// 今週の開始時刻を取得（月曜日の00:00:00）
function getWeekStart(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 月曜日を週の始まりとする
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff, 0, 0, 0, 0);
}

// 今月の開始時刻を取得（1日の00:00:00）
function getMonthStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
}

// 統計を計算する関数
async function getStats(userId: string) {
  const supabase = createAuthenticatedClient(userId);

  const todayStartTime = getTodayStart().getTime();
  const weekStartTime = getWeekStart().getTime();
  const monthStartTime = getMonthStart().getTime();

  // すべての作業記録を取得
  const { data: workLogs, error } = await supabase
    .from("work_logs")
    .select("duration, started_at, created_at");

  if (error) {
    console.error("Failed to fetch work logs:", error);
    return { today: 0, week: 0, month: 0 };
  }

  let today = 0;
  let week = 0;
  let month = 0;

  workLogs?.forEach((log) => {
    // started_at または created_at を使用してタイムスタンプを取得
    const logDateStr = log.started_at || log.created_at;
    const logTime = new Date(logDateStr).getTime();

    // 今月の範囲内かチェック
    if (logTime >= monthStartTime) {
      month += log.duration;
    }

    // 今週の範囲内かチェック
    if (logTime >= weekStartTime) {
      week += log.duration;
    }

    // 今日の範囲内かチェック
    if (logTime >= todayStartTime) {
      today += log.duration;
    }
  });

  return { today, week, month };
}

// 最近の作業記録を取得する関数
async function getRecentWorkLogs(userId: string): Promise<WorkLogWithCategory[]> {
  const supabase = createAuthenticatedClient(userId);

  const { data, error } = await supabase
    .from("work_logs")
    .select(`
      *,
      categories (
        id,
        name
      )
    `)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Failed to fetch recent work logs:", error);
    return [];
  }

  return data as WorkLogWithCategory[];
}

// カテゴリの色を取得
const CATEGORY_COLORS = [
  { bg: "bg-blue-100", text: "text-blue-700" },
  { bg: "bg-green-100", text: "text-green-700" },
  { bg: "bg-purple-100", text: "text-purple-700" },
  { bg: "bg-orange-100", text: "text-orange-700" },
  { bg: "bg-pink-100", text: "text-pink-700" },
  { bg: "bg-teal-100", text: "text-teal-700" },
  { bg: "bg-indigo-100", text: "text-indigo-700" },
  { bg: "bg-red-100", text: "text-red-700" },
];

function getCategoryColor(categoryId: string, allCategoryIds: string[]) {
  const index = allCategoryIds.indexOf(categoryId);
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
}

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Clerkユーザー情報を取得してSupabaseに登録
  // APIエラーが発生してもページは表示されるようにする
  try {
    const user = await currentUser();
    if (user) {
      const email = user.emailAddresses[0]?.emailAddress || "";
      await ensureUserExists({ userId, email });
    }
  } catch (error) {
    // Clerk APIエラー（Bad Gateway等）が発生しても続行
    console.error("Failed to fetch user from Clerk:", error);
  }

  // 統計データと最近の作業記録を取得
  const [stats, recentWorkLogs] = await Promise.all([
    getStats(userId),
    getRecentWorkLogs(userId),
  ]);

  // カテゴリIDのリストを取得（色の割り当て用）
  const allCategoryIds = [...new Set(recentWorkLogs.map((log) => log.category_id))];

  return (
    <div className="space-y-8">
      {/* ページヘッダー */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="text-gray-600">作業時間の概要を確認できます</p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 今日の作業時間 */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">今日</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatDuration(stats.today)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-500"
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
          </div>
        </div>

        {/* 今週の作業時間 */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">今週</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatDuration(stats.week)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* 今月の作業時間 */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">今月</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatDuration(stats.month)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-purple-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* クイックアクション */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          クイックアクション
        </h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/dashboard/timer" className="btn-primary">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            タイマーを開始
          </Link>
          <Link href="/dashboard/categories" className="btn-secondary">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            カテゴリを追加
          </Link>
        </div>
      </div>

      {/* 最近の作業 */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">最近の作業</h2>
          {recentWorkLogs.length > 0 && (
            <Link
              href="/dashboard/history"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              すべて見る →
            </Link>
          )}
        </div>

        {recentWorkLogs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg
              className="w-12 h-12 mx-auto mb-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p>まだ作業記録がありません</p>
            <p className="text-sm mt-1">タイマーを開始して作業を記録しましょう</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {recentWorkLogs.map((log) => {
              const colors = getCategoryColor(log.category_id, allCategoryIds);
              const logDate = new Date(log.started_at || log.created_at);

              return (
                <li
                  key={log.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text}`}
                    >
                      {log.categories?.name || "不明"}
                    </span>
                    <span className="text-gray-900 font-medium">
                      {formatDurationDetailed(log.duration)}
                    </span>
                    {log.memo && (
                      <span className="text-gray-500 text-sm truncate max-w-[200px]">
                        {log.memo}
                      </span>
                    )}
                  </div>
                  <span className="text-gray-400 text-sm">
                    {logDate.toLocaleDateString("ja-JP", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
