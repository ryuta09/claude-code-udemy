"use client";

import Link from "next/link";

const plans = [
  {
    name: "無料プラン",
    price: "$0",
    priceDetail: "永久無料",
    description: "基本的な作業時間計測に最適",
    features: [
      { text: "作業時間記録（無制限）", included: true },
      { text: "タイマー機能", included: true },
      { text: "手動入力機能", included: true },
      { text: "カテゴリ管理", included: true },
      { text: "週次・月次の合計時間表示", included: true },
      { text: "作業履歴閲覧", included: true },
      { text: "CSVエクスポート", included: true },
      { text: "日次の期間切り替え", included: false },
      { text: "過去データとの比較", included: false },
      { text: "カテゴリ別グラフ", included: false },
      { text: "作業時間トレンド", included: false },
    ],
    cta: "無料で始める",
    ctaLink: "/sign-up",
    highlighted: false,
  },
  {
    name: "プレミアムプラン",
    price: "$10",
    priceDetail: "月額",
    description: "高度な分析で生産性を最大化",
    features: [
      { text: "作業時間記録（無制限）", included: true },
      { text: "タイマー機能", included: true },
      { text: "手動入力機能", included: true },
      { text: "カテゴリ管理", included: true },
      { text: "週次・月次の合計時間表示", included: true },
      { text: "作業履歴閲覧", included: true },
      { text: "CSVエクスポート", included: true },
      { text: "日次の期間切り替え", included: true },
      { text: "過去データとの比較", included: true },
      { text: "カテゴリ別グラフ", included: true },
      { text: "作業時間トレンド", included: true },
    ],
    cta: "プレミアムを始める",
    ctaLink: "/sign-up",
    highlighted: true,
  },
];

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

export function PlanComparison() {
  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      {plans.map((plan) => (
        <div
          key={plan.name}
          className={`
            relative rounded-2xl p-8 transition-all duration-300
            ${
              plan.highlighted
                ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-xl scale-[1.02]"
                : "bg-white border border-gray-200 shadow-md"
            }
          `}
        >
          {plan.highlighted && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="bg-yellow-400 text-yellow-900 text-sm font-semibold px-4 py-1 rounded-full">
                おすすめ
              </span>
            </div>
          )}

          <div className="text-center mb-6">
            <h3
              className={`text-xl font-bold mb-2 ${
                plan.highlighted ? "text-white" : "text-gray-900"
              }`}
            >
              {plan.name}
            </h3>
            <p
              className={`text-sm mb-4 ${
                plan.highlighted ? "text-blue-100" : "text-gray-500"
              }`}
            >
              {plan.description}
            </p>
            <div className="flex items-baseline justify-center gap-1">
              <span
                className={`text-4xl font-bold ${
                  plan.highlighted ? "text-white" : "text-gray-900"
                }`}
              >
                {plan.price}
              </span>
              <span
                className={`text-sm ${
                  plan.highlighted ? "text-blue-100" : "text-gray-500"
                }`}
              >
                / {plan.priceDetail}
              </span>
            </div>
          </div>

          <ul className="space-y-3 mb-8">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                {feature.included ? (
                  <CheckIcon
                    className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      plan.highlighted ? "text-green-300" : "text-green-500"
                    }`}
                  />
                ) : (
                  <XIcon
                    className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      plan.highlighted ? "text-blue-300" : "text-gray-300"
                    }`}
                  />
                )}
                <span
                  className={`text-sm ${
                    feature.included
                      ? plan.highlighted
                        ? "text-white"
                        : "text-gray-700"
                      : plan.highlighted
                        ? "text-blue-200"
                        : "text-gray-400"
                  }`}
                >
                  {feature.text}
                </span>
              </li>
            ))}
          </ul>

          <Link
            href={plan.ctaLink}
            className={`
              block w-full py-3 px-6 text-center rounded-xl font-semibold transition-all duration-200
              ${
                plan.highlighted
                  ? "bg-white text-blue-600 hover:bg-gray-100"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }
            `}
          >
            {plan.cta}
          </Link>
        </div>
      ))}
    </div>
  );
}
