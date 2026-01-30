import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedClient } from "@/lib/supabase";

type PeriodType = "daily" | "weekly" | "monthly";

interface AnalyticsData {
  totalDuration: number;
  previousPeriodDuration: number;
  changePercent: number;
  averagePerDay: number;
  topCategory: { name: string; duration: number } | null;
  categoryBreakdown: Array<{
    categoryId: string;
    categoryName: string;
    duration: number;
    percentage: number;
  }>;
  dailyData: Array<{
    date: string;
    duration: number;
    categories: Array<{
      categoryId: string;
      categoryName: string;
      duration: number;
    }>;
  }>;
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

    // 現在の期間と前期間の日付を取得
    const currentPeriod = getPeriodDates(periodType, offset);
    const previousPeriod = getPeriodDates(periodType, offset + 1);

    const supabase = createAuthenticatedClient(userId);

    // 現在期間のデータを取得（started_atまたはcreated_atでフィルタリング）
    // 広い期間でデータを取得し、JavaScriptでフィルタリング
    const { data: rawCurrentData, error: currentError } = await supabase
      .from("work_logs")
      .select(`*, categories(id, name)`)
      .order("created_at", { ascending: true });

    // 期間でフィルタリング（started_atを優先、なければcreated_atを使用）
    const currentData = rawCurrentData?.filter((log) => {
      const logDateStr = log.started_at || log.created_at;
      const logTime = new Date(logDateStr).getTime();
      return logTime >= currentPeriod.start.getTime() && logTime <= currentPeriod.end.getTime();
    });

    if (currentError) {
      console.error("Current period error:", currentError);
      return NextResponse.json({ error: "データの取得に失敗しました" }, { status: 500 });
    }

    // 前期間のデータを取得（同じデータを再利用してフィルタリング）
    const previousData = rawCurrentData?.filter((log) => {
      const logDateStr = log.started_at || log.created_at;
      const logTime = new Date(logDateStr).getTime();
      return logTime >= previousPeriod.start.getTime() && logTime <= previousPeriod.end.getTime();
    });

    // 合計時間を計算（durationを数値として確実に処理）
    const totalDuration = currentData?.reduce((sum, log) => sum + (Number(log.duration) || 0), 0) || 0;
    const previousPeriodDuration = previousData?.reduce((sum, log) => sum + (Number(log.duration) || 0), 0) || 0;

    // 変化率を計算
    const changePercent = previousPeriodDuration > 0
      ? Math.round(((totalDuration - previousPeriodDuration) / previousPeriodDuration) * 100)
      : totalDuration > 0 ? 100 : 0;

    // 1日平均を計算
    const averagePerDay = Math.round(totalDuration / currentPeriod.days);

    // カテゴリ別集計
    const categoryMap = new Map<string, { name: string; duration: number }>();
    currentData?.forEach((log) => {
      // category_idがnullの場合は"uncategorized"をキーとして使用
      const categoryId = log.category_id || "uncategorized";
      const categoryName = log.categories?.name || "未分類";
      // durationを数値として確実に処理
      const logDuration = Number(log.duration) || 0;
      const existing = categoryMap.get(categoryId);
      if (existing) {
        existing.duration += logDuration;
      } else {
        categoryMap.set(categoryId, { name: categoryName, duration: logDuration });
      }
    });

    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([categoryId, { name, duration }]) => ({
        categoryId,
        categoryName: name,
        duration,
        percentage: totalDuration > 0 ? Math.round((duration / totalDuration) * 100) : 0,
      }))
      .sort((a, b) => b.duration - a.duration);

    // トップカテゴリを取得
    const topCategory = categoryBreakdown.length > 0
      ? { name: categoryBreakdown[0].categoryName, duration: categoryBreakdown[0].duration }
      : null;

    // 日別データを集計
    const dailyMap = new Map<string, Map<string, { categoryName: string; duration: number }>>();

    // 期間内のすべての日付を初期化
    const currentDate = new Date(currentPeriod.start);
    while (currentDate <= currentPeriod.end) {
      dailyMap.set(formatDateKey(currentDate), new Map());
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // データを日別に集計（started_atを優先）
    currentData?.forEach((log) => {
      const logDateStr = log.started_at || log.created_at;
      const dateKey = formatDateKey(new Date(logDateStr));
      const dayData = dailyMap.get(dateKey);
      if (dayData) {
        // category_idがnullの場合は"uncategorized"をキーとして使用
        const categoryId = log.category_id || "uncategorized";
        const categoryName = log.categories?.name || "未分類";
        const logDuration = Number(log.duration) || 0;
        const existing = dayData.get(categoryId);
        if (existing) {
          existing.duration += logDuration;
        } else {
          dayData.set(categoryId, { categoryName, duration: logDuration });
        }
      }
    });

    const dailyData = Array.from(dailyMap.entries())
      .map(([date, categories]) => ({
        date,
        duration: Array.from(categories.values()).reduce((sum, cat) => sum + cat.duration, 0),
        categories: Array.from(categories.entries()).map(([categoryId, { categoryName, duration }]) => ({
          categoryId,
          categoryName,
          duration,
        })),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const analyticsData: AnalyticsData = {
      totalDuration,
      previousPeriodDuration,
      changePercent,
      averagePerDay,
      topCategory,
      categoryBreakdown,
      dailyData,
    };

    return NextResponse.json({
      data: analyticsData,
      period: {
        type: periodType,
        start: currentPeriod.start.toISOString(),
        end: currentPeriod.end.toISOString(),
        days: currentPeriod.days,
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "分析データの取得に失敗しました" }, { status: 500 });
  }
}
