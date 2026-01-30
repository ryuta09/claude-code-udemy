"use client";

import { useMemo } from "react";

interface DailyData {
  date: string;
  duration: number;
}

interface ActivityHeatmapProps {
  data: DailyData[];
  isLoading?: boolean;
}

// 時間をフォーマット
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m`;
  }
  return `${seconds}s`;
}

// 色の強度を計算（0-4の5段階）
function getIntensityLevel(duration: number, maxDuration: number): number {
  if (duration === 0) return 0;
  if (maxDuration === 0) return 0;
  const ratio = duration / maxDuration;
  if (ratio >= 0.75) return 4;
  if (ratio >= 0.5) return 3;
  if (ratio >= 0.25) return 2;
  return 1;
}

// 強度に基づく色クラス
const intensityColors = [
  "bg-gray-100", // 0: なし
  "bg-blue-200", // 1: 低
  "bg-blue-300", // 2: 中低
  "bg-blue-400", // 3: 中高
  "bg-blue-600", // 4: 高
];

export function ActivityHeatmap({ data, isLoading = false }: ActivityHeatmapProps) {
  // 過去4週間のデータを生成
  const heatmapData = useMemo(() => {
    const today = new Date();
    const weeks: Array<Array<{ date: Date; duration: number; dateKey: string }>> = [];

    // 過去28日間（4週間）のデータを生成
    const dataMap = new Map(
      data.map((d) => [d.date, d.duration])
    );

    // 4週間分のデータを週ごとに整理
    for (let week = 3; week >= 0; week--) {
      const weekData: Array<{ date: Date; duration: number; dateKey: string }> = [];
      for (let day = 0; day < 7; day++) {
        const date = new Date(today);
        date.setDate(today.getDate() - (week * 7 + (6 - day)));
        const dateKey = date.toISOString().split("T")[0];
        weekData.push({
          date,
          dateKey,
          duration: dataMap.get(dateKey) || 0,
        });
      }
      weeks.push(weekData);
    }

    return weeks;
  }, [data]);

  // 最大作業時間を計算
  const maxDuration = useMemo(() => {
    return Math.max(...data.map((d) => d.duration), 1);
  }, [data]);

  // 合計作業時間
  const totalDuration = useMemo(() => {
    return data.reduce((sum, d) => sum + d.duration, 0);
  }, [data]);

  // アクティブな日数
  const activeDays = useMemo(() => {
    return data.filter((d) => d.duration > 0).length;
  }, [data]);

  const weekDays = ["月", "火", "水", "木", "金", "土", "日"];

  if (isLoading) {
    return (
      <div className="card">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse" />
        <div className="h-40 bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">作業密度</h3>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>アクティブ: {activeDays}日</span>
          <span>合計: {formatDuration(totalDuration)}</span>
        </div>
      </div>

      {/* ヒートマップグリッド */}
      <div className="overflow-x-auto">
        <div className="min-w-fit">
          {/* 曜日ラベル */}
          <div className="flex gap-1 mb-1">
            <div className="w-8" /> {/* スペーサー */}
            {weekDays.map((day) => (
              <div
                key={day}
                className="w-8 h-4 flex items-center justify-center text-xs text-gray-400"
              >
                {day}
              </div>
            ))}
          </div>

          {/* ヒートマップセル */}
          {heatmapData.map((week, weekIndex) => (
            <div key={weekIndex} className="flex gap-1 mb-1">
              {/* 週ラベル */}
              <div className="w-8 h-8 flex items-center justify-center text-xs text-gray-400">
                {weekIndex === 0 ? "4週前" : weekIndex === 3 ? "今週" : ""}
              </div>

              {week.map((day, dayIndex) => {
                const intensity = getIntensityLevel(day.duration, maxDuration);
                const isToday = day.dateKey === new Date().toISOString().split("T")[0];

                return (
                  <div
                    key={dayIndex}
                    className={`
                      w-8 h-8 rounded-md transition-all cursor-pointer
                      ${intensityColors[intensity]}
                      ${isToday ? "ring-2 ring-blue-500 ring-offset-1" : ""}
                      hover:scale-110 hover:shadow-md
                    `}
                    title={`${day.date.toLocaleDateString("ja-JP", {
                      month: "short",
                      day: "numeric",
                    })}: ${day.duration > 0 ? formatDuration(day.duration) : "記録なし"}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* 凡例 */}
      <div className="flex items-center justify-end gap-2 mt-4 text-xs text-gray-500">
        <span>少</span>
        {intensityColors.map((color, index) => (
          <div
            key={index}
            className={`w-4 h-4 rounded-sm ${color}`}
          />
        ))}
        <span>多</span>
      </div>
    </div>
  );
}
