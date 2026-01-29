"use client";

import { PremiumPreview } from "@/components/access-control";

interface PremiumAnalyticsSectionProps {
  weekTotal: number;
  monthTotal: number;
}

// 仮のグラフデータ（プレビュー用）
function PlaceholderChart() {
  return (
    <div className="space-y-6">
      {/* 期間切り替えタブ（プレビュー） */}
      <div className="flex gap-2">
        {["日次", "週次", "月次"].map((tab, i) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              i === 1
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* 円グラフプレビュー */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-4">カテゴリ別時間配分</h4>
          <div className="flex items-center justify-center">
            <div className="relative w-48 h-48">
              {/* 仮の円グラフ */}
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="20"
                  strokeDasharray="100 155"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="20"
                  strokeDasharray="60 195"
                  strokeDashoffset="-100"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#8B5CF6"
                  strokeWidth="20"
                  strokeDasharray="40 215"
                  strokeDashoffset="-160"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="20"
                  strokeDasharray="55 200"
                  strokeDashoffset="-200"
                />
              </svg>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {[
              { color: "bg-blue-500", label: "開発 40%" },
              { color: "bg-green-500", label: "会議 24%" },
              { color: "bg-purple-500", label: "学習 16%" },
              { color: "bg-amber-500", label: "その他 20%" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                <span className="text-sm text-gray-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 棒グラフプレビュー */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-4">週間作業時間</h4>
          <div className="flex items-end justify-between h-40 gap-2">
            {[
              { day: "月", height: "60%" },
              { day: "火", height: "80%" },
              { day: "水", height: "45%" },
              { day: "木", height: "90%" },
              { day: "金", height: "70%" },
              { day: "土", height: "30%" },
              { day: "日", height: "20%" },
            ].map((item) => (
              <div key={item.day} className="flex flex-col items-center flex-1">
                <div
                  className="w-full bg-blue-500 rounded-t-md"
                  style={{ height: item.height }}
                />
                <span className="text-xs text-gray-500 mt-2">{item.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 統計サマリー */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "平均作業時間/日", value: "4h 32m", change: "+12%" },
          { label: "最も集中した時間", value: "14:00-16:00", change: "" },
          { label: "先週比", value: "+2h 15m", change: "+8%" },
          { label: "今月のゴール達成率", value: "78%", change: "" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-4 border border-gray-200"
          >
            <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
            <p className="text-lg font-bold text-gray-900">{stat.value}</p>
            {stat.change && (
              <p className="text-xs text-green-600">{stat.change}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function PremiumAnalyticsSection({}: PremiumAnalyticsSectionProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">高度な分析</h2>
        <span className="px-2 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold rounded-full">
          プレミアム
        </span>
      </div>

      <PremiumPreview
        title="高度な分析機能"
        description="詳細なグラフと統計情報で作業時間を可視化"
      >
        <PlaceholderChart />
      </PremiumPreview>
    </div>
  );
}
