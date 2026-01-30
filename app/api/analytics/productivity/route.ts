import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedClient } from "@/lib/supabase";

type PeriodType = "daily" | "weekly" | "monthly";

interface HourlyData {
  hour: number;
  duration: number;
  sessionCount: number;
}

interface CategoryTrendData {
  categoryId: string;
  categoryName: string;
  data: Array<{
    date: string;
    duration: number;
  }>;
}

interface ProductivityData {
  // 平均作業時間
  averageSessionDuration: number; // 1セッションあたりの平均時間（秒）
  averageSessionsPerDay: number; // 1日あたりの平均セッション数
  longestSession: number; // 最長セッション（秒）
  totalSessions: number; // 総セッション数

  // 時間帯別データ（最も集中した時間帯を特定するため）
  hourlyBreakdown: HourlyData[];
  peakHour: { hour: number; duration: number } | null;

  // カテゴリごとの推移
  categoryTrends: CategoryTrendData[];
}

// 期間の開始・終了日を計算
function getPeriodDates(
  periodType: PeriodType,
  offset: number = 0
): { start: Date; end: Date; days: number } {
  const now = new Date();

  switch (periodType) {
    case "daily": {
      const date = new Date(now);
      date.setDate(date.getDate() - offset);
      const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
      const end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
      return { start, end, days: 1 };
    }
    case "weekly": {
      const dayOfWeek = now.getDay();
      const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const monday = new Date(now);
      monday.setDate(now.getDate() - mondayOffset - offset * 7);
      const start = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate(), 0, 0, 0, 0);
      const sunday = new Date(start);
      sunday.setDate(start.getDate() + 6);
      const end = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate(), 23, 59, 59, 999);
      return { start, end, days: 7 };
    }
    case "monthly": {
      const year = now.getFullYear();
      const month = now.getMonth() - offset;
      const start = new Date(year, month, 1, 0, 0, 0, 0);
      const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
      const days = end.getDate();
      return { start, end, days };
    }
  }
}

// 日付文字列をYYYY-MM-DD形式に変換
function formatDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const periodType = (searchParams.get("period") || "weekly") as PeriodType;
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const currentPeriod = getPeriodDates(periodType, offset);
    const supabase = createAuthenticatedClient(userId);

    // 作業ログを取得
    const { data: rawData, error } = await supabase
      .from("work_logs")
      .select(`*, categories(id, name)`)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Productivity data error:", error);
      return NextResponse.json({ error: "データの取得に失敗しました" }, { status: 500 });
    }

    // 期間でフィルタリング
    const filteredData = rawData?.filter((log) => {
      const logDateStr = log.started_at || log.created_at;
      const logTime = new Date(logDateStr).getTime();
      return logTime >= currentPeriod.start.getTime() && logTime <= currentPeriod.end.getTime();
    }) || [];

    // 総セッション数と合計時間
    const totalSessions = filteredData.length;
    const totalDuration = filteredData.reduce((sum, log) => sum + (Number(log.duration) || 0), 0);

    // 平均セッション時間
    const averageSessionDuration = totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0;

    // 最長セッション
    const longestSession = filteredData.reduce((max, log) => {
      const duration = Number(log.duration) || 0;
      return duration > max ? duration : max;
    }, 0);

    // 日別のセッション数をカウント
    const dailySessionMap = new Map<string, number>();
    filteredData.forEach((log) => {
      const logDateStr = log.started_at || log.created_at;
      const dateKey = formatDateKey(new Date(logDateStr));
      dailySessionMap.set(dateKey, (dailySessionMap.get(dateKey) || 0) + 1);
    });

    // 作業があった日数
    const daysWithWork = dailySessionMap.size;
    const averageSessionsPerDay = daysWithWork > 0
      ? Math.round((totalSessions / daysWithWork) * 10) / 10
      : 0;

    // 時間帯別集計（0-23時）
    const hourlyMap = new Map<number, { duration: number; count: number }>();
    for (let i = 0; i < 24; i++) {
      hourlyMap.set(i, { duration: 0, count: 0 });
    }

    filteredData.forEach((log) => {
      const logDateStr = log.started_at || log.created_at;
      const logDate = new Date(logDateStr);
      const hour = logDate.getHours();
      const current = hourlyMap.get(hour)!;
      current.duration += Number(log.duration) || 0;
      current.count += 1;
    });

    const hourlyBreakdown: HourlyData[] = Array.from(hourlyMap.entries())
      .map(([hour, data]) => ({
        hour,
        duration: data.duration,
        sessionCount: data.count,
      }))
      .sort((a, b) => a.hour - b.hour);

    // 最も集中した時間帯（作業時間が最も長い時間）
    const peakHour = hourlyBreakdown.reduce<{ hour: number; duration: number } | null>(
      (max, current) => {
        if (current.duration > (max?.duration || 0)) {
          return { hour: current.hour, duration: current.duration };
        }
        return max;
      },
      null
    );

    // カテゴリごとの推移を計算
    // 期間内のすべての日付を取得
    const allDates: string[] = [];
    const currentDate = new Date(currentPeriod.start);
    while (currentDate <= currentPeriod.end) {
      allDates.push(formatDateKey(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // カテゴリ別・日別の集計
    const categoryDailyMap = new Map<string, Map<string, number>>();
    const categoryNames = new Map<string, string>();

    filteredData.forEach((log) => {
      const categoryId = log.category_id || "uncategorized";
      const categoryName = log.categories?.name || "未分類";
      const logDateStr = log.started_at || log.created_at;
      const dateKey = formatDateKey(new Date(logDateStr));
      const duration = Number(log.duration) || 0;

      categoryNames.set(categoryId, categoryName);

      if (!categoryDailyMap.has(categoryId)) {
        categoryDailyMap.set(categoryId, new Map());
      }
      const dailyMap = categoryDailyMap.get(categoryId)!;
      dailyMap.set(dateKey, (dailyMap.get(dateKey) || 0) + duration);
    });

    // カテゴリごとの推移データを作成
    const categoryTrends: CategoryTrendData[] = Array.from(categoryDailyMap.entries()).map(
      ([categoryId, dailyMap]) => ({
        categoryId,
        categoryName: categoryNames.get(categoryId) || "未分類",
        data: allDates.map((date) => ({
          date,
          duration: dailyMap.get(date) || 0,
        })),
      })
    );

    // 合計時間でソート（降順）
    categoryTrends.sort((a, b) => {
      const totalA = a.data.reduce((sum, d) => sum + d.duration, 0);
      const totalB = b.data.reduce((sum, d) => sum + d.duration, 0);
      return totalB - totalA;
    });

    const productivityData: ProductivityData = {
      averageSessionDuration,
      averageSessionsPerDay,
      longestSession,
      totalSessions,
      hourlyBreakdown,
      peakHour,
      categoryTrends,
    };

    return NextResponse.json({
      data: productivityData,
      period: {
        type: periodType,
        start: currentPeriod.start.toISOString(),
        end: currentPeriod.end.toISOString(),
        days: currentPeriod.days,
      },
    });
  } catch (error) {
    console.error("Productivity error:", error);
    return NextResponse.json({ error: "生産性データの取得に失敗しました" }, { status: 500 });
  }
}
