"use client";

import { useState, useEffect } from "react";

type Category = {
  id: string;
  name: string;
};

export default function ExportPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // フィルター状態
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [categoryId, setCategoryId] = useState("all");

  // プリセット期間
  const [preset, setPreset] = useState<string>("all");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("カテゴリの取得に失敗しました");
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
      setError("カテゴリの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (presetValue: string) => {
    setPreset(presetValue);
    const today = new Date();

    switch (presetValue) {
      case "today": {
        const dateStr = today.toISOString().split("T")[0];
        setStartDate(dateStr);
        setEndDate(dateStr);
        break;
      }
      case "this-week": {
        const dayOfWeek = today.getDay();
        const monday = new Date(today);
        monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        setStartDate(monday.toISOString().split("T")[0]);
        setEndDate(sunday.toISOString().split("T")[0]);
        break;
      }
      case "this-month": {
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        setStartDate(firstDay.toISOString().split("T")[0]);
        setEndDate(lastDay.toISOString().split("T")[0]);
        break;
      }
      case "last-month": {
        const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth(), 0);
        setStartDate(firstDay.toISOString().split("T")[0]);
        setEndDate(lastDay.toISOString().split("T")[0]);
        break;
      }
      case "this-year": {
        const firstDay = new Date(today.getFullYear(), 0, 1);
        const lastDay = new Date(today.getFullYear(), 11, 31);
        setStartDate(firstDay.toISOString().split("T")[0]);
        setEndDate(lastDay.toISOString().split("T")[0]);
        break;
      }
      case "all":
      default:
        setStartDate("");
        setEndDate("");
        break;
    }
  };

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    setSuccess(null);

    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (categoryId !== "all") params.append("categoryId", categoryId);

      const response = await fetch(`/api/export?${params.toString()}`);

      if (!response.ok) {
        throw new Error("エクスポートに失敗しました");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "work_logs.csv";
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) filename = match[1];
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setSuccess("CSVファイルをダウンロードしました");
    } catch (err) {
      console.error(err);
      setError("エクスポートに失敗しました。もう一度お試しください。");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">データエクスポート</h1>
        <div className="card">
          <div className="space-y-4">
            <div className="h-8 bg-gray-100 rounded animate-pulse" />
            <div className="h-12 bg-gray-100 rounded animate-pulse" />
            <div className="h-12 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">データエクスポート</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">エクスポート設定</h2>

        <div className="space-y-6">
          {/* プリセット期間 */}
          <div>
            <label className="label mb-2 block">期間プリセット</label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "all", label: "すべて" },
                { value: "today", label: "今日" },
                { value: "this-week", label: "今週" },
                { value: "this-month", label: "今月" },
                { value: "last-month", label: "先月" },
                { value: "this-year", label: "今年" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => applyPreset(option.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    preset === option.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* カスタム期間 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="label mb-1 block">
                開始日
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPreset("custom");
                }}
                className="input w-full"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="label mb-1 block">
                終了日
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPreset("custom");
                }}
                className="input w-full"
              />
            </div>
          </div>

          {/* カテゴリフィルター */}
          <div>
            <label htmlFor="category" className="label mb-1 block">
              カテゴリ
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="input w-full"
            >
              <option value="all">すべてのカテゴリ</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* エクスポートボタン */}
          <div className="pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="btn-primary w-full md:w-auto"
            >
              {exporting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  エクスポート中...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  CSVをダウンロード
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* エクスポート形式の説明 */}
      <div className="card bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          エクスポートされるデータ
        </h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• 日付</li>
          <li>• カテゴリ名</li>
          <li>• 作業時間（HH:MM:SS形式）</li>
          <li>• 作業時間（秒）</li>
          <li>• メモ</li>
          <li>• 開始時刻</li>
          <li>• 作成日時</li>
        </ul>
        <p className="text-xs text-gray-500 mt-3">
          ※ CSVファイルはExcelやGoogleスプレッドシートで開くことができます
        </p>
      </div>
    </div>
  );
}
