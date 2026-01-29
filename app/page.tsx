import Link from "next/link";
import { Header } from "@/components/Header";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main>
        {/* ヒーローセクション */}
        <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
          <div className="container-main text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              作業時間を
              <span className="text-blue-500">シンプル</span>
              に記録
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
              タイマー機能、カテゴリ分け、ダッシュボード表示で、
              誰でも簡単に継続できる作業時間計測アプリ。
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/sign-up">
                <button className="btn-primary btn-lg">無料で始める</button>
              </Link>
              <Link href="#features">
                <button className="btn-secondary btn-lg">機能を見る</button>
              </Link>
            </div>
          </div>
        </section>

        {/* 機能セクション */}
        <section id="features" className="py-20">
          <div className="container-main">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              シンプルで使いやすい機能
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {/* タイマー機能 */}
              <div className="card text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-blue-500"
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
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  ワンタップタイマー
                </h3>
                <p className="text-gray-600">
                  ボタンひとつで計測開始。
                  シンプルな操作で作業時間を正確に記録できます。
                </p>
              </div>

              {/* カテゴリ分け */}
              <div className="card text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-500"
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
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  カテゴリ分け
                </h3>
                <p className="text-gray-600">
                  プロジェクトや作業種類ごとに分類。
                  何にどれだけ時間を使ったか一目で分かります。
                </p>
              </div>

              {/* ダッシュボード */}
              <div className="card text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-purple-500"
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
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  見やすいダッシュボード
                </h3>
                <p className="text-gray-600">
                  日別・週別・月別で作業時間を可視化。
                  継続のモチベーションを維持できます。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 料金セクション */}
        <section id="pricing" className="py-20 bg-gray-50">
          <div className="container-main">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
              シンプルな料金プラン
            </h2>
            <p className="text-center text-gray-600 mb-12">
              まずは無料で始めて、必要に応じてアップグレード
            </p>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* 無料プラン */}
              <div className="card card-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  無料プラン
                </h3>
                <p className="text-4xl font-bold text-gray-900 mb-6">
                  $0
                  <span className="text-base font-normal text-gray-500">
                    /月
                  </span>
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-gray-600">
                    <svg
                      className="w-5 h-5 text-green-500"
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
                    タイマー機能
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <svg
                      className="w-5 h-5 text-green-500"
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
                    カテゴリ管理（無制限）
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <svg
                      className="w-5 h-5 text-green-500"
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
                    週次・月次の合計時間表示
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <svg
                      className="w-5 h-5 text-green-500"
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
                    CSVエクスポート
                  </li>
                </ul>
                <Link href="/sign-up" className="block">
                  <button className="btn-secondary w-full">無料で始める</button>
                </Link>
              </div>

              {/* プレミアムプラン */}
              <div className="card card-lg border-2 border-blue-500 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-blue-500 text-white text-sm font-semibold px-3 py-1 rounded-full">
                    おすすめ
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  プレミアムプラン
                </h3>
                <p className="text-4xl font-bold text-gray-900 mb-6">
                  $10
                  <span className="text-base font-normal text-gray-500">
                    /月
                  </span>
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-gray-600">
                    <svg
                      className="w-5 h-5 text-green-500"
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
                    無料プランの全機能
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <svg
                      className="w-5 h-5 text-green-500"
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
                    日次・週次・月次の期間切り替え
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <svg
                      className="w-5 h-5 text-green-500"
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
                    過去データとの比較
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <svg
                      className="w-5 h-5 text-green-500"
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
                    カテゴリ別グラフ・トレンド分析
                  </li>
                </ul>
                <Link href="/pricing" className="block">
                  <button className="btn-primary w-full">
                    プランを詳しく見る
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTAセクション */}
        <section className="py-20">
          <div className="container-main text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              今すぐ作業時間の記録を始めましょう
            </h2>
            <p className="text-gray-600 mb-8">
              無料プランで今日から使い始められます
            </p>
            <Link href="/sign-up">
              <button className="btn-primary btn-lg">無料で始める</button>
            </Link>
          </div>
        </section>
      </main>

      {/* フッター */}
      <footer className="py-8 border-t border-gray-200">
        <div className="container-main text-center text-sm text-gray-500">
          <p>&copy; 2026 Project Tracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
