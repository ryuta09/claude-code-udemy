import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createAuthenticatedClient } from "@/lib/supabase";

// 日付文字列をYYYY-MM-DD形式に変換
function formatDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAuthenticatedClient(userId);

    // 過去28日間（4週間）の期間を計算
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 27); // 28日前から今日まで
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(today);
    endDate.setHours(23, 59, 59, 999);

    // 作業ログを取得
    const { data: rawData, error } = await supabase
      .from("work_logs")
      .select("duration, started_at, created_at")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Heatmap data error:", error);
      return NextResponse.json({ error: "データの取得に失敗しました" }, { status: 500 });
    }

    // 期間でフィルタリング
    const filteredData = rawData?.filter((log) => {
      const logDateStr = log.started_at || log.created_at;
      const logTime = new Date(logDateStr).getTime();
      return logTime >= startDate.getTime() && logTime <= endDate.getTime();
    });

    // 日別に集計
    const dailyMap = new Map<string, number>();

    // 28日間のすべての日付を初期化
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dailyMap.set(formatDateKey(currentDate), 0);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // データを集計
    filteredData?.forEach((log) => {
      const logDateStr = log.started_at || log.created_at;
      const dateKey = formatDateKey(new Date(logDateStr));
      const currentDuration = dailyMap.get(dateKey) || 0;
      dailyMap.set(dateKey, currentDuration + (Number(log.duration) || 0));
    });

    // 配列に変換
    const heatmapData = Array.from(dailyMap.entries())
      .map(([date, duration]) => ({ date, duration }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      data: heatmapData,
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        days: 28,
      },
    });
  } catch (error) {
    console.error("Heatmap error:", error);
    return NextResponse.json({ error: "ヒートマップデータの取得に失敗しました" }, { status: 500 });
  }
}
