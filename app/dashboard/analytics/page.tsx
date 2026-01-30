"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  PeriodTabs,
  PeriodSelector,
  AnalyticsSummary,
  PeriodType,
  CategoryPieChart,
  DailyBarChart,
  ActivityHeatmap,
} from "@/components/analytics";
import { PlanProtect } from "@/components/access-control";

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

interface HeatmapData {
  date: string;
  duration: number;
}

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

// カテゴリの色
const CATEGORY_COLORS = [
  { bg: "bg-blue-500", light: "bg-blue-100", text: "text-blue-700" },
  { bg: "bg-green-500", light: "bg-green-100", text: "text-green-700" },
  { bg: "bg-purple-500", light: "bg-purple-100", text: "text-purple-700" },
  { bg: "bg-amber-500", light: "bg-amber-100", text: "text-amber-700" },
  { bg: "bg-pink-500", light: "bg-pink-100", text: "text-pink-700" },
  { bg: "bg-teal-500", light: "bg-teal-100", text: "text-teal-700" },
  { bg: "bg-indigo-500", light: "bg-indigo-100", text: "text-indigo-700" },
  { bg: "bg-red-500", light: "bg-red-100", text: "text-red-700" },
];

function getCategoryColor(index: number) {
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
}

// カテゴリ別分布コンポーネント（リスト表示）
function CategoryBreakdownList({
  data,
  isLoading,
}: {
  data: AnalyticsData["categoryBreakdown"];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="card">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          カテゴリ別詳細
        </h3>
        <div className="text-center py-8 text-gray-500">
          <p>データがありません</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        カテゴリ別詳細
      </h3>

      {/* プログレスバー */}
      <div className="h-3 rounded-full overflow-hidden flex mb-6">
        {data.map((category, index) => (
          <div
            key={category.categoryId}
            className={`${getCategoryColor(index).bg} transition-all duration-500`}
            style={{ width: `${Math.max(category.percentage, 2)}%` }}
            title={`${category.categoryName}: ${category.percentage}%`}
          />
        ))}
      </div>

      {/* カテゴリリスト */}
      <div className="space-y-3">
        {data.map((category, index) => {
          const color = getCategoryColor(index);
          return (
            <div
              key={category.categoryId}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${color.bg}`} />
                <span className="text-gray-900 font-medium text-sm">{category.categoryName}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-900 font-semibold text-sm">
                  {formatDuration(category.duration)}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-xs font-semibold ${color.light} ${color.text}`}
                >
                  {category.percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// メインコンポーネント
function AnalyticsContent() {
  const [periodType, setPeriodType] = useState<PeriodType>("weekly");
  const [offset, setOffset] = useState(0);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHeatmapLoading, setIsHeatmapLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/analytics?period=${periodType}&offset=${offset}`
      );

      if (!response.ok) {
        throw new Error("データの取得に失敗しました");
      }

      const result = await response.json();
      setData(result.data);
    } catch (err) {
      console.error("Analytics fetch error:", err);
      setError("分析データの取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, [periodType, offset]);

  // ヒートマップ用のデータを取得（過去4週間）
  const fetchHeatmapData = useCallback(async () => {
    setIsHeatmapLoading(true);

    try {
      const response = await fetch("/api/analytics/heatmap");

      if (!response.ok) {
        throw new Error("ヒートマップデータの取得に失敗しました");
      }

      const result = await response.json();
      setHeatmapData(result.data);
    } catch (err) {
      console.error("Heatmap fetch error:", err);
      // ヒートマップのエラーは致命的ではないのでエラー表示しない
    } finally {
      setIsHeatmapLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  useEffect(() => {
    fetchHeatmapData();
  }, [fetchHeatmapData]);

  // 期間タイプが変わったらオフセットをリセット
  const handlePeriodTypeChange = (newPeriod: PeriodType) => {
    setPeriodType(newPeriod);
    setOffset(0);
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">高度な分析</h1>
          <p className="text-gray-600">作業時間の詳細な分析を確認できます</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold rounded-full">
            プレミアム
          </span>
        </div>
      </div>

      {/* 期間切り替えタブ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PeriodTabs
          activePeriod={periodType}
          onChange={handlePeriodTypeChange}
        />
        <PeriodSelector
          periodType={periodType}
          offset={offset}
          onChange={setOffset}
        />
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* サマリーカード */}
      <AnalyticsSummary
        totalDuration={data?.totalDuration || 0}
        changePercent={data?.changePercent || 0}
        averagePerDay={data?.averagePerDay || 0}
        topCategory={data?.topCategory || null}
        isLoading={isLoading}
      />

      {/* グラフセクション - 円グラフと棒グラフ */}
      <div className="grid md:grid-cols-2 gap-6">
        <CategoryPieChart
          data={data?.categoryBreakdown || []}
          isLoading={isLoading}
        />
        <DailyBarChart
          data={data?.dailyData || []}
          periodType={periodType}
          isLoading={isLoading}
        />
      </div>

      {/* ヒートマップとカテゴリ詳細 */}
      <div className="grid md:grid-cols-2 gap-6">
        <ActivityHeatmap
          data={heatmapData}
          isLoading={isHeatmapLoading}
        />
        <CategoryBreakdownList
          data={data?.categoryBreakdown || []}
          isLoading={isLoading}
        />
      </div>

      {/* ダッシュボードへのリンク */}
      <div className="text-center pt-4">
        <Link
          href="/dashboard"
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          ← ダッシュボードに戻る
        </Link>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <PlanProtect>
      <AnalyticsContent />
    </PlanProtect>
  );
}
