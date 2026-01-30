"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface CategoryData {
  categoryId: string;
  categoryName: string;
  duration: number;
  percentage: number;
}

interface CategoryPieChartProps {
  data: CategoryData[];
  isLoading?: boolean;
}

// カテゴリの色
const COLORS = [
  "#3B82F6", // blue-500
  "#22C55E", // green-500
  "#A855F7", // purple-500
  "#F59E0B", // amber-500
  "#EC4899", // pink-500
  "#14B8A6", // teal-500
  "#6366F1", // indigo-500
  "#EF4444", // red-500
];

// 時間をフォーマット
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

// カスタムツールチップ
function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: CategoryData }> }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white px-3 py-2 shadow-lg rounded-lg border border-gray-200">
        <p className="font-medium text-gray-900">{data.categoryName}</p>
        <p className="text-sm text-gray-600">{formatDuration(data.duration)}</p>
        <p className="text-sm text-gray-500">{data.percentage}%</p>
      </div>
    );
  }
  return null;
}

// カスタム凡例
function CustomLegend({ payload }: { payload?: Array<{ value: string; color: string }> }) {
  if (!payload) return null;

  return (
    <ul className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry, index) => (
        <li key={index} className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-gray-600">{entry.value}</span>
        </li>
      ))}
    </ul>
  );
}

export function CategoryPieChart({ data, isLoading = false }: CategoryPieChartProps) {
  if (isLoading) {
    return (
      <div className="card">
        <div className="h-6 bg-gray-200 rounded w-40 mb-4 animate-pulse" />
        <div className="h-64 bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          カテゴリ別時間配分
        </h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          <p>データがありません</p>
        </div>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    ...item,
    name: item.categoryName,
    value: item.duration,
  }));

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        カテゴリ別時間配分
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  className="transition-opacity hover:opacity-80"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
