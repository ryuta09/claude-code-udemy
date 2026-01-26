export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <main className="container-main py-16">
        {/* ヘッダーセクション */}
        <section className="space-y-6 text-center mb-16">
          <h1>Project Tracker</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            シンプルに作業時間を記録・分析できるアプリ。
            タイマー機能、カテゴリ分け、ダッシュボード表示で、
            誰でも簡単に継続できる作業時間計測アプリ。
          </p>
        </section>

        {/* スタイルプレビューセクション */}
        <section className="space-y-12">
          {/* ボタンプレビュー */}
          <div className="card">
            <h2 className="mb-6">ボタンスタイル</h2>
            <div className="flex flex-wrap gap-4">
              <button className="btn-primary">プライマリ</button>
              <button className="btn-secondary">セカンダリ</button>
              <button className="btn-danger">危険</button>
              <button className="btn-primary" disabled>
                無効化
              </button>
            </div>
            <div className="flex flex-wrap gap-4 mt-4">
              <button className="btn-primary btn-sm">小さい</button>
              <button className="btn-primary">標準</button>
              <button className="btn-primary btn-lg">大きい</button>
            </div>
          </div>

          {/* タイポグラフィプレビュー */}
          <div className="card">
            <h2 className="mb-6">タイポグラフィ</h2>
            <div className="space-y-4">
              <h1>見出し1 - text-4xl font-bold</h1>
              <h2>見出し2 - text-3xl font-semibold</h2>
              <h3>見出し3 - text-2xl font-semibold</h3>
              <h4>見出し4 - text-xl font-semibold</h4>
              <h5>見出し5 - text-lg font-semibold</h5>
              <h6>見出し6 - text-base font-semibold</h6>
              <p className="text-base text-gray-900">
                本文テキスト - text-base (16px)
              </p>
              <p className="text-sm text-gray-700">
                補助テキスト - text-sm (14px) text-gray-700
              </p>
              <p className="text-xs text-gray-600">
                キャプション - text-xs (12px) text-gray-600
              </p>
            </div>
          </div>

          {/* カラーパレットプレビュー */}
          <div className="card">
            <h2 className="mb-6">カラーパレット</h2>
            <div className="space-y-6">
              {/* プライマリカラー */}
              <div>
                <h4 className="mb-3">プライマリ（ブルー）</h4>
                <div className="flex flex-wrap gap-2">
                  <div className="w-20 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-xs">
                    50
                  </div>
                  <div className="w-20 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-xs">
                    100
                  </div>
                  <div className="w-20 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-xs text-white">
                    500
                  </div>
                  <div className="w-20 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-xs text-white">
                    600
                  </div>
                  <div className="w-20 h-12 bg-blue-700 rounded-lg flex items-center justify-center text-xs text-white">
                    700
                  </div>
                  <div className="w-20 h-12 bg-blue-800 rounded-lg flex items-center justify-center text-xs text-white">
                    800
                  </div>
                </div>
              </div>

              {/* グレースケール */}
              <div>
                <h4 className="mb-3">グレースケール</h4>
                <div className="flex flex-wrap gap-2">
                  <div className="w-20 h-12 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center text-xs">
                    50
                  </div>
                  <div className="w-20 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-xs">
                    200
                  </div>
                  <div className="w-20 h-12 bg-gray-300 rounded-lg flex items-center justify-center text-xs">
                    300
                  </div>
                  <div className="w-20 h-12 bg-gray-500 rounded-lg flex items-center justify-center text-xs text-white">
                    500
                  </div>
                  <div className="w-20 h-12 bg-gray-700 rounded-lg flex items-center justify-center text-xs text-white">
                    700
                  </div>
                  <div className="w-20 h-12 bg-gray-900 rounded-lg flex items-center justify-center text-xs text-white">
                    900
                  </div>
                </div>
              </div>

              {/* システムカラー */}
              <div>
                <h4 className="mb-3">システムカラー</h4>
                <div className="flex flex-wrap gap-2">
                  <div className="w-24 h-12 bg-green-600 rounded-lg flex items-center justify-center text-xs text-white">
                    成功
                  </div>
                  <div className="w-24 h-12 bg-amber-600 rounded-lg flex items-center justify-center text-xs text-white">
                    警告
                  </div>
                  <div className="w-24 h-12 bg-red-600 rounded-lg flex items-center justify-center text-xs text-white">
                    エラー
                  </div>
                  <div className="w-24 h-12 bg-blue-700 rounded-lg flex items-center justify-center text-xs text-white">
                    情報
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* フォームプレビュー */}
          <div className="card">
            <h2 className="mb-6">フォーム要素</h2>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="label">カテゴリ名</label>
                <input
                  type="text"
                  className="input"
                  placeholder="例: 開発作業"
                />
              </div>
              <div>
                <label className="label">メモ</label>
                <textarea
                  className="input min-h-[100px] py-3"
                  placeholder="作業内容を入力..."
                />
              </div>
              <div>
                <label className="label">エラー状態の入力</label>
                <input
                  type="text"
                  className="input input-error"
                  placeholder="エラーがあります"
                />
                <p className="text-sm text-red-600 mt-1">
                  このフィールドは必須です
                </p>
              </div>
            </div>
          </div>

          {/* バッジプレビュー */}
          <div className="card">
            <h2 className="mb-6">バッジ</h2>
            <div className="flex flex-wrap gap-3">
              <span className="badge border-blue-300 bg-blue-50 text-blue-700">
                開発
              </span>
              <span className="badge border-green-300 bg-green-50 text-green-700">
                完了
              </span>
              <span className="badge border-amber-300 bg-amber-50 text-amber-700">
                進行中
              </span>
              <span className="badge border-gray-300 bg-gray-50 text-gray-700">
                デフォルト
              </span>
            </div>
          </div>

          {/* カードプレビュー */}
          <div className="space-y-4">
            <h2>カードバリエーション</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card card-sm">
                <h4 className="mb-2">小さいカード</h4>
                <p className="text-sm text-gray-600">p-4 の内余白</p>
              </div>
              <div className="card">
                <h4 className="mb-2">標準カード</h4>
                <p className="text-sm text-gray-600">p-5 の内余白</p>
              </div>
              <div className="card card-lg">
                <h4 className="mb-2">大きいカード</h4>
                <p className="text-sm text-gray-600">p-6 の内余白</p>
              </div>
            </div>
          </div>
        </section>

        {/* フッター */}
        <footer className="mt-16 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            デザインシステムプレビュー - フェーズ1.1完了
          </p>
        </footer>
      </main>
    </div>
  );
}
