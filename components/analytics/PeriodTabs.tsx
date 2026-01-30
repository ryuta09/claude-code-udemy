"use client";

export type PeriodType = "daily" | "weekly" | "monthly";

interface PeriodTabsProps {
  activePeriod: PeriodType;
  onChange: (period: PeriodType) => void;
}

const tabs: { value: PeriodType; label: string }[] = [
  { value: "daily", label: "日次" },
  { value: "weekly", label: "週次" },
  { value: "monthly", label: "月次" },
];

export function PeriodTabs({ activePeriod, onChange }: PeriodTabsProps) {
  return (
    <div className="inline-flex bg-gray-100 rounded-xl p-1">
      {tabs.map((tab) => {
        const isActive = activePeriod === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={`
              relative px-6 py-2.5 rounded-lg text-sm font-medium
              transition-all duration-300 ease-out
              ${
                isActive
                  ? "text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }
            `}
          >
            {/* グラデーション背景（アクティブ時） */}
            {isActive && (
              <span
                className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"
                style={{
                  animation: "fadeIn 0.2s ease-out",
                }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
