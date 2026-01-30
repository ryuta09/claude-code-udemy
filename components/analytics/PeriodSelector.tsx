"use client";

import { PeriodType } from "./PeriodTabs";

interface PeriodSelectorProps {
  periodType: PeriodType;
  offset: number;
  onChange: (offset: number) => void;
}

// 期間のラベルを取得
function getPeriodLabel(periodType: PeriodType, offset: number): string {
  const now = new Date();

  switch (periodType) {
    case "daily": {
      const date = new Date(now);
      date.setDate(date.getDate() - offset);
      return date.toLocaleDateString("ja-JP", {
        month: "long",
        day: "numeric",
        weekday: "short",
      });
    }
    case "weekly": {
      const dayOfWeek = now.getDay();
      const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const monday = new Date(now);
      monday.setDate(now.getDate() - mondayOffset - offset * 7);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      const startStr = monday.toLocaleDateString("ja-JP", {
        month: "short",
        day: "numeric",
      });
      const endStr = sunday.toLocaleDateString("ja-JP", {
        month: "short",
        day: "numeric",
      });
      return `${startStr} - ${endStr}`;
    }
    case "monthly": {
      const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      return date.toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
      });
    }
  }
}

// プリセットオプションを取得
function getPresetOptions(periodType: PeriodType): { offset: number; label: string }[] {
  switch (periodType) {
    case "daily":
      return [
        { offset: 0, label: "今日" },
        { offset: 1, label: "昨日" },
      ];
    case "weekly":
      return [
        { offset: 0, label: "今週" },
        { offset: 1, label: "先週" },
      ];
    case "monthly":
      return [
        { offset: 0, label: "今月" },
        { offset: 1, label: "先月" },
      ];
  }
}

export function PeriodSelector({
  periodType,
  offset,
  onChange,
}: PeriodSelectorProps) {
  const presets = getPresetOptions(periodType);
  const periodLabel = getPeriodLabel(periodType, offset);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      {/* プリセットボタン */}
      <div className="flex gap-2">
        {presets.map((preset) => (
          <button
            key={preset.offset}
            onClick={() => onChange(preset.offset)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${
                offset === preset.offset
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }
            `}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* ナビゲーション */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(offset + 1)}
          className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          aria-label="前の期間"
        >
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <span className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-900 min-w-[180px] text-center">
          {periodLabel}
        </span>

        <button
          onClick={() => onChange(Math.max(0, offset - 1))}
          disabled={offset === 0}
          className={`
            p-2 rounded-lg transition-colors
            ${
              offset === 0
                ? "bg-gray-50 text-gray-300 cursor-not-allowed"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }
          `}
          aria-label="次の期間"
        >
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
