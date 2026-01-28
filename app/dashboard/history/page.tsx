"use client";

import { useState, useEffect, useMemo } from "react";
import { WorkLogWithCategory } from "@/types/database";

// カテゴリの色を動的に割り当てるためのカラーパレット
const CATEGORY_COLORS = [
  { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
  { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
  { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
  { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200" },
  { bg: "bg-pink-100", text: "text-pink-700", border: "border-pink-200" },
  { bg: "bg-teal-100", text: "text-teal-700", border: "border-teal-200" },
  { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-200" },
  { bg: "bg-red-100", text: "text-red-700", border: "border-red-200" },
];

// 秒を時:分:秒形式に変換
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}時間${minutes}分${secs}秒`;
  } else if (minutes > 0) {
    return `${minutes}分${secs}秒`;
  } else {
    return `${secs}秒`;
  }
}

// 日付をフォーマット（YYYY年MM月DD日（曜日））
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = weekdays[date.getDay()];

  return `${year}年${month}月${day}日（${weekday}）`;
}

// 日付を取得（YYYY-MM-DD形式）
function getDateKey(dateString: string): string {
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
}

// 今日かどうか
function isToday(dateKey: string): boolean {
  const today = new Date().toISOString().split("T")[0];
  return dateKey === today;
}

// 昨日かどうか
function isYesterday(dateKey: string): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateKey === yesterday.toISOString().split("T")[0];
}

// 日付のラベルを取得
function getDateLabel(dateKey: string): string {
  if (isToday(dateKey)) {
    return "今日";
  } else if (isYesterday(dateKey)) {
    return "昨日";
  }
  return "";
}

type GroupedLogs = {
  [dateKey: string]: WorkLogWithCategory[];
};

export default function HistoryPage() {
  const [workLogs, setWorkLogs] = useState<WorkLogWithCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingMemo, setEditingMemo] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // カテゴリIDと色のマッピング
  const categoryColorMap = useMemo(() => {
    const map = new Map<string, (typeof CATEGORY_COLORS)[0]>();
    const uniqueCategories = [
      ...new Set(workLogs.map((log) => log.category_id)),
    ];
    uniqueCategories.forEach((categoryId, index) => {
      map.set(categoryId, CATEGORY_COLORS[index % CATEGORY_COLORS.length]);
    });
    return map;
  }, [workLogs]);

  // 作業記録を日付ごとにグルーピング
  const groupedLogs = useMemo(() => {
    const groups: GroupedLogs = {};

    workLogs.forEach((log) => {
      // started_atまたはcreated_atを使用
      const dateKey = getDateKey(log.started_at || log.created_at);

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(log);
    });

    // 各グループ内を時間順にソート（新しい順）
    Object.keys(groups).forEach((dateKey) => {
      groups[dateKey].sort((a, b) => {
        const dateA = new Date(a.started_at || a.created_at).getTime();
        const dateB = new Date(b.started_at || b.created_at).getTime();
        return dateB - dateA;
      });
    });

    return groups;
  }, [workLogs]);

  // 日付キーを新しい順にソート
  const sortedDateKeys = useMemo(() => {
    return Object.keys(groupedLogs).sort((a, b) => b.localeCompare(a));
  }, [groupedLogs]);

  // 日付ごとの合計時間を計算
  const dailyTotals = useMemo(() => {
    const totals: { [dateKey: string]: number } = {};
    Object.keys(groupedLogs).forEach((dateKey) => {
      totals[dateKey] = groupedLogs[dateKey].reduce(
        (sum, log) => sum + log.duration,
        0
      );
    });
    return totals;
  }, [groupedLogs]);

  // 作業記録を取得
  const fetchWorkLogs = async () => {
    try {
      const response = await fetch("/api/time-entries");
      if (!response.ok) throw new Error("Failed to fetch work logs");
      const data = await response.json();
      setWorkLogs(data);
    } catch (err) {
      setError("作業記録の取得に失敗しました");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkLogs();
  }, []);

  // メモを更新
  const handleUpdateMemo = async (id: string) => {
    try {
      const response = await fetch(`/api/time-entries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memo: editingMemo || null }),
      });

      if (!response.ok) throw new Error("Failed to update memo");

      const updatedLog = await response.json();
      setWorkLogs(workLogs.map((log) => (log.id === id ? updatedLog : log)));
      setEditingId(null);
      setEditingMemo("");
    } catch (err) {
      setError("メモの更新に失敗しました");
      console.error(err);
    }
  };

  // 作業記録を削除
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/time-entries/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete work log");

      setWorkLogs(workLogs.filter((log) => log.id !== id));
      setDeletingId(null);
    } catch (err) {
      setError("作業記録の削除に失敗しました");
      console.error(err);
    }
  };

  // 編集開始
  const startEditing = (log: WorkLogWithCategory) => {
    setEditingId(log.id);
    setEditingMemo(log.memo || "");
  };

  // 編集キャンセル
  const cancelEditing = () => {
    setEditingId(null);
    setEditingMemo("");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ページヘッダー */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">作業履歴</h1>
        <p className="text-gray-600">過去の作業記録を確認・編集できます</p>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
          <button
            onClick={() => setError(null)}
            className="float-right text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* 作業記録がない場合 */}
      {workLogs.length === 0 ? (
        <div className="card text-center py-12">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-300"
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
          <p className="text-gray-500 text-lg">作業記録がありません</p>
          <p className="text-gray-400 text-sm mt-2">
            タイマーを使って作業を記録しましょう
          </p>
        </div>
      ) : (
        /* 日付ごとにグルーピングされた作業記録 */
        <div className="space-y-6">
          {sortedDateKeys.map((dateKey) => (
            <div key={dateKey} className="card">
              {/* 日付ヘッダー */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {formatDate(dateKey)}
                  </h2>
                  {getDateLabel(dateKey) && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                      {getDateLabel(dateKey)}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  合計:{" "}
                  <span className="font-semibold text-gray-900">
                    {formatDuration(dailyTotals[dateKey])}
                  </span>
                </div>
              </div>

              {/* 作業記録リスト */}
              <ul className="space-y-3">
                {groupedLogs[dateKey].map((log) => {
                  const colors =
                    categoryColorMap.get(log.category_id) || CATEGORY_COLORS[0];

                  return (
                    <li
                      key={log.id}
                      className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {deletingId === log.id ? (
                        // 削除確認モード
                        <div className="flex items-center justify-between">
                          <span className="text-red-600">
                            この作業記録を削除しますか？
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDelete(log.id)}
                              className="btn-danger btn-sm"
                            >
                              削除する
                            </button>
                            <button
                              onClick={() => setDeletingId(null)}
                              className="btn-secondary btn-sm"
                            >
                              キャンセル
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            {/* カテゴリと時間 */}
                            <div className="flex items-center gap-3 mb-2">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${colors.bg} ${colors.text} ${colors.border}`}
                              >
                                {log.categories?.name || "不明なカテゴリ"}
                              </span>
                              <span className="text-lg font-semibold text-gray-900">
                                {formatDuration(log.duration)}
                              </span>
                            </div>

                            {/* メモ */}
                            {editingId === log.id ? (
                              <div className="flex items-center gap-2 mt-2">
                                <input
                                  type="text"
                                  value={editingMemo}
                                  onChange={(e) =>
                                    setEditingMemo(e.target.value)
                                  }
                                  placeholder="メモを入力"
                                  className="input flex-1 text-sm"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleUpdateMemo(log.id)}
                                  className="btn-primary btn-sm"
                                >
                                  保存
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  className="btn-secondary btn-sm"
                                >
                                  キャンセル
                                </button>
                              </div>
                            ) : log.memo ? (
                              <p className="text-gray-600 text-sm mt-1 truncate">
                                {log.memo}
                              </p>
                            ) : (
                              <p className="text-gray-400 text-sm mt-1 italic">
                                メモなし
                              </p>
                            )}

                            {/* 開始時刻 */}
                            {log.started_at && (
                              <p className="text-gray-400 text-xs mt-2">
                                開始:{" "}
                                {new Date(log.started_at).toLocaleTimeString(
                                  "ja-JP",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </p>
                            )}
                          </div>

                          {/* アクションボタン */}
                          {editingId !== log.id && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => startEditing(log)}
                                className="text-gray-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                                title="メモを編集"
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
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => setDeletingId(log.id)}
                                className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                title="削除"
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
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
