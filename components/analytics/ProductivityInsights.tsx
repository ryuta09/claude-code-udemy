"use client";

interface ProductivityInsightsProps {
  averageSessionDuration: number;
  averageSessionsPerDay: number;
  longestSession: number;
  totalSessions: number;
  peakHour: { hour: number; duration: number } | null;
  hourlyBreakdown: Array<{
    hour: number;
    duration: number;
    sessionCount: number;
  }>;
  isLoading?: boolean;
}

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

// 時間帯をフォーマット
function formatHour(hour: number): string {
  return `${hour.toString().padStart(2, "0")}:00`;
}

// 時間帯の説明
function getHourDescription(hour: number): string {
  if (hour >= 5 && hour < 9) return "早朝";
  if (hour >= 9 && hour < 12) return "午前";
  if (hour >= 12 && hour < 14) return "昼";
  if (hour >= 14 && hour < 17) return "午後";
  if (hour >= 17 && hour < 21) return "夕方";
  if (hour >= 21 || hour < 5) return "夜";
  return "";
}

export function ProductivityInsights({
  averageSessionDuration,
  averageSessionsPerDay,
  longestSession,
  totalSessions,
  peakHour,
  hourlyBreakdown,
  isLoading = false,
}: ProductivityInsightsProps) {
  if (isLoading) {
    return (
      <div className="card">
        <div className="h-6 bg-gray-200 rounded w-40 mb-6 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
              <div className="h-8 bg-gray-200 rounded w-24" />
            </div>
          ))}
        </div>
        <div className="h-32 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  // 時間帯別グラフの最大値を計算
  const maxHourlyDuration = Math.max(...hourlyBreakdown.map((h) => h.duration), 1);

  const insightCards = [
    {
      label: "平均セッション時間",
      value: formatDuration(averageSessionDuration),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      label: "1日の平均セッション数",
      value: `${averageSessionsPerDay}回`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      ),
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      label: "最長セッション",
      value: formatDuration(longestSession),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      label: "総セッション数",
      value: `${totalSessions}回`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">生産性指標</h3>

      {/* 指標カード */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {insightCards.map((card, index) => (
          <div key={index} className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.iconBg} ${card.iconColor}`}
              >
                {card.icon}
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-1">{card.label}</p>
            <p className="text-xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      {/* 最も集中した時間帯 */}
      {peakHour && peakHour.duration > 0 && (
        <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">最も集中した時間帯</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatHour(peakHour.hour)} - {formatHour((peakHour.hour + 1) % 24)}
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({getHourDescription(peakHour.hour)})
                </span>
              </p>
              <p className="text-sm text-gray-500">
                この時間帯の総作業時間: {formatDuration(peakHour.duration)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 時間帯別作業時間グラフ */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-4">時間帯別作業時間</h4>
        <div className="flex items-end gap-1 h-32">
          {hourlyBreakdown.map((hourData) => {
            const heightPercent = (hourData.duration / maxHourlyDuration) * 100;
            const isPeak = peakHour?.hour === hourData.hour;

            return (
              <div
                key={hourData.hour}
                className="flex-1 flex flex-col items-center group relative"
              >
                {/* ツールチップ */}
                <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                  <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {formatHour(hourData.hour)}: {formatDuration(hourData.duration)}
                    <br />
                    {hourData.sessionCount}セッション
                  </div>
                </div>
                {/* バー */}
                <div
                  className={`w-full rounded-t transition-all duration-300 ${
                    isPeak
                      ? "bg-gradient-to-t from-blue-500 to-purple-500"
                      : hourData.duration > 0
                      ? "bg-blue-400 hover:bg-blue-500"
                      : "bg-gray-200"
                  }`}
                  style={{
                    height: `${Math.max(heightPercent, hourData.duration > 0 ? 8 : 2)}%`,
                    minHeight: hourData.duration > 0 ? "8px" : "2px",
                  }}
                />
              </div>
            );
          })}
        </div>
        {/* 時間ラベル */}
        <div className="flex gap-1 mt-1">
          {[0, 6, 12, 18, 23].map((hour) => (
            <div
              key={hour}
              className="text-xs text-gray-400"
              style={{
                position: "relative",
                left: `${(hour / 23) * 100}%`,
                transform: "translateX(-50%)",
              }}
            >
              {hour}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0時</span>
          <span>6時</span>
          <span>12時</span>
          <span>18時</span>
          <span>23時</span>
        </div>
      </div>
    </div>
  );
}
