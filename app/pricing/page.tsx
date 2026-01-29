import { Metadata } from "next";
import Link from "next/link";
import { PlanComparison } from "@/components/pricing/PlanComparison";
import { DynamicPricingTable } from "@/components/pricing/DynamicPricingTable";

export const metadata: Metadata = {
  title: "料金プラン | Project Tracker",
  description:
    "Project Trackerの料金プラン。無料プランで基本機能を、プレミアムプランで高度な分析機能をご利用いただけます。",
};

const faqs = [
  {
    question: "無料プランでどこまで使えますか？",
    answer:
      "無料プランでは、タイマー機能、手動入力、カテゴリ管理、作業履歴の閲覧、週次・月次の合計時間表示、CSVエクスポートなど、基本的な機能をすべてご利用いただけます。",
  },
  {
    question: "プレミアムプランの支払い方法は？",
    answer:
      "クレジットカード（Visa、Mastercard、American Express）でのお支払いに対応しています。Stripeを通じた安全な決済システムを採用しています。",
  },
  {
    question: "いつでもプランを変更できますか？",
    answer:
      "はい、いつでもプランのアップグレードやダウングレードが可能です。アップグレードは即時反映され、ダウングレードは次の請求サイクルから適用されます。",
  },
  {
    question: "解約はいつでもできますか？",
    answer:
      "はい、いつでも解約可能です。解約後も、支払い済みの期間終了まではプレミアム機能をご利用いただけます。",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
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
              </div>
              <span className="text-xl font-bold text-gray-900">
                Project Tracker
              </span>
            </Link>
            <nav className="flex items-center gap-4">
              <Link
                href="/sign-in"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ログイン
              </Link>
              <Link href="/sign-up" className="btn-primary">
                無料で始める
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* ヒーローセクション */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            シンプルな料金プラン
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            基本機能は永久無料。より詳しい分析が必要な方には
            <br className="hidden sm:inline" />
            プレミアムプランをご用意しています。
          </p>
        </div>
      </section>

      {/* プラン比較セクション */}
      <section className="py-16 -mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PlanComparison />
        </div>
      </section>

      {/* Clerk PricingTable セクション */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              今すぐ始める
            </h2>
            <p className="text-gray-600">
              クレジットカードで安全にお支払い
            </p>
          </div>
          <DynamicPricingTable />
        </div>
      </section>

      {/* FAQ セクション */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            よくある質問
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA セクション */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            今日から作業時間を記録しよう
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            クレジットカード不要で無料プランをお試しいただけます。
            <br />
            いつでもプレミアムプランにアップグレード可能です。
          </p>
          <Link
            href="/sign-up"
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
          >
            無料で始める
          </Link>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 Project Tracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
