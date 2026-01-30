"use client";

interface AnalyticsSummaryProps {
  totalDuration: number;
  changePercent: number;
  averagePerDay: number;
  topCategory: { name: string; duration: number } | null;
  isLoading?: boolean;
}

// 時間をフォーマット（秒 → "Xh Ym" 形式）
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function AnalyticsSummary({
  totalDuration,
  changePercent,
  averagePerDay,
  topCategory,
  isLoading = false,
}: AnalyticsSummaryProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
            <div className="h-8 bg-gray-200 rounded w-24" />
          </div>
        ))}
      </div>
    );
  }

  const summaryCards = [
    {
      label: "総作業時間",
      value: formatDuration(totalDuration),
      icon: (
        <svg
          className="w-5 h-5"
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
      ),
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "前期間比",
      value: `${changePercent >= 0 ? "+" : ""}${changePercent}%`,
      subValue: changePercent >= 0 ? "増加" : "減少",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={
              changePercent >= 0
                ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
            }
          />
        </svg>
      ),
      iconBg: changePercent >= 0 ? "bg-green-100" : "bg-red-100",
      iconColor: changePercent >= 0 ? "text-green-600" : "text-red-600",
      valueColor: changePercent >= 0 ? "text-green-600" : "text-red-600",
    },
    {
      label: "1日平均",
      value: formatDuration(averagePerDay),
      icon: (
        <svg
          className="w-5 h-5"
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
      ),
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      label: "トップカテゴリ",
      value: topCategory?.name || "-",
      subValue: topCategory ? formatDuration(topCategory.duration) : undefined,
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
      ),
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {summaryCards.map((card, index) => (
        <div
          key={index}
          className="card transition-transform hover:scale-[1.02]"
        >
          <div className="flex items-start justify-between mb-3">
            <p className="text-sm text-gray-500">{card.label}</p>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.iconBg} ${card.iconColor}`}
            >
              {card.icon}
            </div>
          </div>
          <p
            className={`text-2xl font-bold ${card.valueColor || "text-gray-900"}`}
          >
            {card.value}
          </p>
          {card.subValue && (
            <p className="text-xs text-gray-500 mt-1">{card.subValue}</p>
          )}
        </div>
      ))}
    </div>
  );
}
