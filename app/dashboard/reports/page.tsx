"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { PlanProtect } from "@/components/access-control";

interface ReportData {
  totalDuration: number;
  averagePerDay: number;
  totalSessions: number;
  categoryBreakdown: Array<{
    categoryId: string;
    categoryName: string;
    duration: number;
    percentage: number;
  }>;
  periodStart: string;
  periodEnd: string;
  periodType: "weekly" | "monthly";
}

type PeriodType = "weekly" | "monthly";

// 時間をフォーマット
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}時間${minutes}分`;
  }
  return `${minutes}分`;
}

// 日付をフォーマット
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function ReportsContent() {
  const [periodType, setPeriodType] = useState<PeriodType>("weekly");
  const [offset, setOffset] = useState(0);
  const [data, setData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReportData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/analytics?period=${periodType}&offset=${offset}`
      );

      if (!response.ok) {
        throw new Error("データの取得に失敗しました");
      }

      const result = await response.json();
      setData({
        totalDuration: result.data.totalDuration,
        averagePerDay: result.data.averagePerDay,
        totalSessions: result.data.dailyData.reduce(
          (sum: number, d: { categories: Array<unknown> }) => sum + d.categories.length,
          0
        ),
        categoryBreakdown: result.data.categoryBreakdown,
        periodStart: result.period.start,
        periodEnd: result.period.end,
        periodType,
      });
    } catch (err) {
      console.error("Report data fetch error:", err);
      setError("レポートデータの取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, [periodType, offset]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const generatePDF = async () => {
    if (!data) return;

    setIsGenerating(true);

    try {
      // iframeを作成してCSSを完全に分離
      const iframe = document.createElement("iframe");
      iframe.style.position = "absolute";
      iframe.style.left = "-9999px";
      iframe.style.top = "0";
      iframe.style.width = "850px";
      iframe.style.height = "1200px";
      iframe.style.border = "none";
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        throw new Error("iframeドキュメントにアクセスできません");
      }

      // iframe内にHTMLを書き込む（CSSは完全に独立）
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", sans-serif;
              background: #ffffff;
            }
          </style>
        </head>
        <body>
          <div id="pdf-content" style="width: 800px; background-color: #ffffff; padding: 32px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="font-size: 30px; font-weight: bold; color: #111827; margin: 0 0 8px 0;">
                作業時間レポート
              </h1>
              <p style="font-size: 18px; color: #4B5563; margin: 0;">
                ${periodType === "weekly" ? "週次レポート" : "月次レポート"}
              </p>
              <p style="color: #6B7280; margin-top: 4px; font-size: 14px;">
                ${formatDate(data.periodStart)} 〜 ${formatDate(data.periodEnd)}
              </p>
            </div>

            <div style="border-bottom: 2px solid #E5E7EB; margin-bottom: 32px;"></div>

            <div style="margin-bottom: 32px;">
              <h2 style="font-size: 20px; font-weight: bold; color: #111827; margin: 0 0 16px 0;">
                サマリー
              </h2>
              <div style="display: flex; gap: 16px;">
                <div style="flex: 1; padding: 16px; background-color: #EFF6FF; border-radius: 8px; text-align: center;">
                  <p style="font-size: 14px; color: #2563EB; margin: 0 0 4px 0;">総作業時間</p>
                  <p style="font-size: 24px; font-weight: bold; color: #1E3A8A; margin: 0;">
                    ${formatDuration(data.totalDuration)}
                  </p>
                </div>
                <div style="flex: 1; padding: 16px; background-color: #ECFDF5; border-radius: 8px; text-align: center;">
                  <p style="font-size: 14px; color: #059669; margin: 0 0 4px 0;">1日平均</p>
                  <p style="font-size: 24px; font-weight: bold; color: #064E3B; margin: 0;">
                    ${formatDuration(data.averagePerDay)}
                  </p>
                </div>
                <div style="flex: 1; padding: 16px; background-color: #F5F3FF; border-radius: 8px; text-align: center;">
                  <p style="font-size: 14px; color: #7C3AED; margin: 0 0 4px 0;">セッション数</p>
                  <p style="font-size: 24px; font-weight: bold; color: #4C1D95; margin: 0;">
                    ${data.totalSessions}回
                  </p>
                </div>
              </div>
            </div>

            <div style="margin-bottom: 32px;">
              <h2 style="font-size: 20px; font-weight: bold; color: #111827; margin: 0 0 16px 0;">
                カテゴリ別内訳
              </h2>
              ${
                data.categoryBreakdown.length === 0
                  ? '<p style="color: #6B7280;">データがありません</p>'
                  : `
                    <table style="width: 100%; border-collapse: collapse;">
                      <thead>
                        <tr style="background-color: #F3F4F6;">
                          <th style="text-align: left; padding: 12px; font-weight: 600; color: #374151;">カテゴリ</th>
                          <th style="text-align: right; padding: 12px; font-weight: 600; color: #374151;">作業時間</th>
                          <th style="text-align: right; padding: 12px; font-weight: 600; color: #374151;">割合</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${data.categoryBreakdown
                          .map(
                            (category, index) => `
                          <tr style="background-color: ${index % 2 === 0 ? "#F9FAFB" : "#FFFFFF"};">
                            <td style="padding: 12px; color: #111827; font-weight: 500;">${category.categoryName}</td>
                            <td style="padding: 12px; text-align: right; color: #4B5563;">${formatDuration(category.duration)}</td>
                            <td style="padding: 12px; text-align: right;">
                              <span style="display: inline-block; padding: 4px 8px; background-color: #DBEAFE; color: #1D4ED8; font-size: 14px; font-weight: 600; border-radius: 4px;">
                                ${category.percentage}%
                              </span>
                            </td>
                          </tr>
                        `
                          )
                          .join("")}
                      </tbody>
                    </table>
                  `
              }
            </div>

            <div style="text-align: center; color: #9CA3AF; font-size: 14px; padding-top: 32px; border-top: 1px solid #E5E7EB;">
              Project Tracker で生成 • ${new Date().toLocaleDateString("ja-JP")}
            </div>
          </div>
        </body>
        </html>
      `;

      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();

      // iframeのレンダリングを待つ
      await new Promise((resolve) => setTimeout(resolve, 100));

      const element = iframeDoc.getElementById("pdf-content");
      if (!element) {
        throw new Error("PDF要素が見つかりません");
      }

      // html2canvasでキャプチャ（iframe内で実行）
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 850,
        windowHeight: 1200,
      });

      // iframeを削除
      document.body.removeChild(iframe);

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      pdf.addImage(
        imgData,
        "PNG",
        imgX,
        imgY,
        imgWidth * ratio,
        imgHeight * ratio
      );

      // ダウンロード
      const startDate = new Date(data.periodStart);
      const fileName = `作業レポート-${periodType === "weekly" ? "週次" : "月次"}-${startDate.toISOString().split("T")[0]}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error("PDF generation error:", err);
      setError("PDFの生成に失敗しました");
    } finally {
      setIsGenerating(false);
    }
  };

  // 期間ラベルを取得
  const getPeriodLabel = () => {
    if (!data) return "";
    return `${formatDate(data.periodStart)} 〜 ${formatDate(data.periodEnd)}`;
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">レポート生成</h1>
          <p className="text-gray-600">作業時間のPDFレポートを生成できます</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold rounded-full">
            プレミアム
          </span>
        </div>
      </div>

      {/* 期間選択 */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">レポート設定</h2>

        <div className="space-y-4">
          {/* 期間タイプ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              レポート期間
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setPeriodType("weekly");
                  setOffset(0);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  periodType === "weekly"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                週次
              </button>
              <button
                onClick={() => {
                  setPeriodType("monthly");
                  setOffset(0);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  periodType === "monthly"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                月次
              </button>
            </div>
          </div>

          {/* 期間セレクター */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              対象期間
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setOffset(offset + 1)}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
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
              <span className="text-gray-900 font-medium min-w-[200px] text-center">
                {isLoading ? "読み込み中..." : getPeriodLabel()}
              </span>
              <button
                onClick={() => setOffset(Math.max(0, offset - 1))}
                disabled={offset === 0}
                className={`p-2 rounded-lg transition-colors ${
                  offset === 0
                    ? "bg-gray-50 text-gray-300 cursor-not-allowed"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                }`}
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
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* プレビュー */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">レポートプレビュー</h2>

        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-48" />
            <div className="h-4 bg-gray-200 rounded w-32" />
            <div className="h-4 bg-gray-200 rounded w-40" />
            <div className="h-32 bg-gray-200 rounded" />
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* サマリー */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 mb-1">総作業時間</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatDuration(data.totalDuration)}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600 mb-1">1日平均</p>
                <p className="text-2xl font-bold text-green-900">
                  {formatDuration(data.averagePerDay)}
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-600 mb-1">セッション数</p>
                <p className="text-2xl font-bold text-purple-900">
                  {data.totalSessions}回
                </p>
              </div>
            </div>

            {/* カテゴリ別内訳 */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                カテゴリ別内訳
              </h3>
              {data.categoryBreakdown.length === 0 ? (
                <p className="text-gray-500 text-sm">データがありません</p>
              ) : (
                <div className="space-y-2">
                  {data.categoryBreakdown.map((category) => (
                    <div
                      key={category.categoryId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-gray-900 font-medium">
                        {category.categoryName}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-600">
                          {formatDuration(category.duration)}
                        </span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                          {category.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* PDF生成ボタン */}
      <div className="flex justify-center">
        <button
          onClick={generatePDF}
          disabled={isLoading || isGenerating || !data}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            isLoading || isGenerating || !data
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {isGenerating ? (
            <>
              <svg
                className="w-5 h-5 animate-spin"
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
              生成中...
            </>
          ) : (
            <>
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
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              PDFをダウンロード
            </>
          )}
        </button>
      </div>

      {/* ダッシュボードへのリンク */}
      <div className="text-center pt-4">
        <Link
          href="/dashboard"
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          ← ダッシュボードに戻る
        </Link>
      </div>

    </div>
  );
}

export default function ReportsPage() {
  return (
    <PlanProtect>
      <ReportsContent />
    </PlanProtect>
  );
}
