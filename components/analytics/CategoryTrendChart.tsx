"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { PeriodType } from "./PeriodTabs";

interface CategoryTrendData {
  categoryId: string;
  categoryName: string;
  data: Array<{
    date: string;
    duration: number;
  }>;
}

interface CategoryTrendChartProps {
  data: CategoryTrendData[];
  periodType: PeriodType;
  isLoading?: boolean;
}

// カテゴリの色
const CATEGORY_COLORS = [
  "#3B82F6", // blue-500
  "#10B981", // green-500
  "#8B5CF6", // purple-500
  "#F59E0B", // amber-500
  "#EC4899", // pink-500
  "#14B8A6", // teal-500
  "#6366F1", // indigo-500
  "#EF4444", // red-500
];

// 時間をフォーマット（秒 → "Xh Ym" 形式）
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

// 日付をフォーマット
function formatDate(dateStr: string, periodType: PeriodType): string {
  const date = new Date(dateStr);

  if (periodType === "daily") {
    return `${date.getHours()}:00`;
  }

  if (periodType === "weekly") {
    const dayNames = ["日", "月", "火", "水", "木", "金", "土"];
    return dayNames[date.getDay()];
  }

  return `${date.getMonth() + 1}/${date.getDate()}`;
}

// カスタムツールチップ
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
      <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-600">{entry.name}:</span>
            <span className="font-medium text-gray-900">
              {formatDuration(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CategoryTrendChart({
  data,
  periodType,
  isLoading = false,
}: CategoryTrendChartProps) {
  if (isLoading) {
    return (
      <div className="card">
        <div className="h-6 bg-gray-200 rounded w-40 mb-4 animate-pulse" />
        <div className="h-64 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          カテゴリ別推移
        </h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <svg
              className="w-12 h-12 mx-auto mb-2 text-gray-300"
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
            <p>データがありません</p>
          </div>
        </div>
      </div>
    );
  }

  // データを変換してRechartsで使える形式に
  // すべての日付を取得
  const allDates = data[0]?.data.map((d) => d.date) || [];

  // 日付ごとにカテゴリのデータをまとめる
  const chartData = allDates.map((date) => {
    const entry: Record<string, string | number> = {
      date: formatDate(date, periodType),
      rawDate: date,
    };
    data.forEach((category) => {
      const dayData = category.data.find((d) => d.date === date);
      entry[category.categoryName] = dayData?.duration || 0;
    });
    return entry;
  });

  // 上位5カテゴリのみ表示
  const topCategories = data.slice(0, 5);

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        カテゴリ別推移
      </h3>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: "#6B7280" }}
              tickLine={{ stroke: "#E5E7EB" }}
              axisLine={{ stroke: "#E5E7EB" }}
            />
            <YAxis
              tickFormatter={(value) => {
                if (value >= 3600) {
                  return `${Math.round(value / 3600)}h`;
                }
                if (value >= 60) {
                  return `${Math.round(value / 60)}m`;
                }
                return `${value}s`;
              }}
              tick={{ fontSize: 12, fill: "#6B7280" }}
              tickLine={{ stroke: "#E5E7EB" }}
              axisLine={{ stroke: "#E5E7EB" }}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: "16px" }}
              iconType="circle"
              iconSize={8}
            />
            {topCategories.map((category, index) => (
              <Line
                key={category.categoryId}
                type="monotone"
                dataKey={category.categoryName}
                stroke={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3, fill: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 凡例（色の説明） */}
      {data.length > 5 && (
        <p className="text-xs text-gray-500 mt-4 text-center">
          ※ 作業時間が多い上位5カテゴリを表示しています
        </p>
      )}
    </div>
  );
}
