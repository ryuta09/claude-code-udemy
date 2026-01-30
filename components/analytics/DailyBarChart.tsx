"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { PeriodType } from "./PeriodTabs";

interface DailyData {
  date: string;
  duration: number;
  categories: Array<{
    categoryId: string;
    categoryName: string;
    duration: number;
  }>;
}

interface DailyBarChartProps {
  data: DailyData[];
  periodType: PeriodType;
  isLoading?: boolean;
}

// 時間をフォーマット（秒 → 時間）
function formatDurationForAxis(seconds: number): string {
  const hours = seconds / 3600;
  if (hours >= 1) {
    return `${hours.toFixed(1)}h`;
  }
  const minutes = seconds / 60;
  return `${Math.round(minutes)}m`;
}

// 詳細な時間フォーマット
function formatDurationDetailed(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}時間${minutes}分`;
  }
  if (minutes > 0) {
    return `${minutes}分${secs}秒`;
  }
  return `${secs}秒`;
}

// カスタムツールチップ
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: DailyData }>;
  label?: string;
}) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white px-4 py-3 shadow-lg rounded-lg border border-gray-200">
        <p className="font-medium text-gray-900 mb-2">{label}</p>
        <p className="text-sm text-blue-600 font-semibold">
          合計: {formatDurationDetailed(data.duration)}
        </p>
        {data.categories.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            {data.categories.slice(0, 3).map((cat, idx) => (
              <p key={idx} className="text-xs text-gray-500">
                {cat.categoryName}: {formatDurationDetailed(cat.duration)}
              </p>
            ))}
            {data.categories.length > 3 && (
              <p className="text-xs text-gray-400">
                +{data.categories.length - 3}件
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
  return null;
}

export function DailyBarChart({
  data,
  periodType,
  isLoading = false,
}: DailyBarChartProps) {
  if (isLoading) {
    return (
      <div className="card">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse" />
        <div className="h-64 bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  // 日付ラベルのフォーマット
  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    switch (periodType) {
      case "daily":
        return date.toLocaleTimeString("ja-JP", {
          hour: "2-digit",
          minute: "2-digit",
        });
      case "weekly":
        return date.toLocaleDateString("ja-JP", { weekday: "short" });
      case "monthly":
        return `${date.getDate()}日`;
    }
  };

  const chartTitle =
    periodType === "daily"
      ? "時間別作業時間"
      : periodType === "weekly"
        ? "日別作業時間"
        : "日別作業時間";

  const chartData = data.map((item) => ({
    ...item,
    name: formatDateLabel(item.date),
  }));

  // 最大値を計算（Y軸の上限設定用）
  const maxDuration = Math.max(...data.map((d) => d.duration), 1);

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{chartTitle}</h3>

      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-500">
          <p>データがありません</p>
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "#6B7280" }}
                tickLine={false}
                axisLine={{ stroke: "#E5E7EB" }}
              />
              <YAxis
                tickFormatter={formatDurationForAxis}
                tick={{ fontSize: 12, fill: "#6B7280" }}
                tickLine={false}
                axisLine={false}
                domain={[0, maxDuration * 1.1]}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#F3F4F6" }} />
              <Bar dataKey="duration" radius={[4, 4, 0, 0]} maxBarSize={50}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.duration > 0 ? "#3B82F6" : "#E5E7EB"}
                    className="transition-opacity hover:opacity-80"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
