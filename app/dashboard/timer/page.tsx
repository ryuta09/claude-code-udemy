"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Category } from "@/types/database";

type TimerState = "idle" | "running" | "paused";

// 経過時間を00:00:00形式にフォーマット
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return [hours, minutes, secs].map((v) => v.toString().padStart(2, "0")).join(":");
}

export default function TimerPage() {
  // タイマー状態
  const [timerState, setTimerState] = useState<TimerState>("idle");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);

  // カテゴリ関連
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // メモ
  const [memo, setMemo] = useState("");

  // 保存状態
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // タイマー用のref
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // カテゴリ一覧を取得
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (!response.ok) throw new Error("Failed to fetch categories");
        const data = await response.json();
        setCategories(data);
        if (data.length > 0) {
          setSelectedCategoryId(data[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // タイマーの更新処理
  useEffect(() => {
    if (timerState === "running") {
      intervalRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timerState]);

  // タイマー開始
  const handleStart = useCallback(() => {
    if (!selectedCategoryId) {
      setSaveMessage({
        type: "error",
        text: "カテゴリを選択してください",
      });
      return;
    }

    setTimerState("running");
    setStartTime(new Date());
    setSaveMessage(null);
  }, [selectedCategoryId]);

  // 一時停止
  const handlePause = useCallback(() => {
    setTimerState("paused");
  }, []);

  // 再開
  const handleResume = useCallback(() => {
    setTimerState("running");
  }, []);

  // 停止してリセット
  const handleStop = useCallback(() => {
    setTimerState("idle");
    setElapsedTime(0);
    setStartTime(null);
    setMemo("");
  }, []);

  // 作業記録を保存
  const handleSave = useCallback(async () => {
    if (elapsedTime === 0) {
      setSaveMessage({
        type: "error",
        text: "記録する時間がありません",
      });
      return;
    }

    if (!selectedCategoryId) {
      setSaveMessage({
        type: "error",
        text: "カテゴリを選択してください",
      });
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch("/api/time-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_id: selectedCategoryId,
          duration: elapsedTime,
          memo: memo || null,
          started_at: startTime?.toISOString() || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save time entry");
      }

      setSaveMessage({
        type: "success",
        text: "作業記録を保存しました",
      });

      // リセット
      handleStop();
    } catch (err) {
      console.error("Failed to save time entry:", err);
      setSaveMessage({
        type: "error",
        text: "保存に失敗しました。もう一度お試しください。",
      });
    } finally {
      setIsSaving(false);
    }
  }, [elapsedTime, selectedCategoryId, memo, startTime, handleStop]);

  // 選択中のカテゴリ名を取得
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  return (
    <div className="space-y-8">
      {/* ページヘッダー */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">タイマー</h1>
        <p className="text-gray-600">作業時間を計測できます</p>
      </div>

      {/* メッセージ表示 */}
      {saveMessage && (
        <div
          className={`px-4 py-3 rounded-lg ${
            saveMessage.type === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {saveMessage.text}
          <button
            onClick={() => setSaveMessage(null)}
            className="float-right hover:opacity-70"
          >
            ✕
          </button>
        </div>
      )}

      {/* タイマーカード */}
      <div className="card">
        {/* カテゴリ選択 */}
        <div className="mb-6">
          <label className="label">カテゴリ</label>
          {isLoadingCategories ? (
            <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
          ) : categories.length === 0 ? (
            <div className="text-gray-500 text-sm">
              カテゴリがありません。
              <a href="/dashboard/categories" className="text-blue-600 hover:underline">
                カテゴリを作成
              </a>
              してください。
            </div>
          ) : (
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="input"
              disabled={timerState !== "idle"}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* タイマー表示 */}
        <div className="text-center py-8">
          {/* 経過時間 */}
          <div className="text-6xl md:text-8xl font-mono font-bold text-gray-900 mb-2">
            {formatTime(elapsedTime)}
          </div>

          {/* 現在のカテゴリ */}
          {timerState !== "idle" && selectedCategory && (
            <div className="text-gray-500">
              <span className="inline-flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full" />
                {selectedCategory.name}
              </span>
            </div>
          )}
        </div>

        {/* コントロールボタン */}
        <div className="flex justify-center gap-4">
          {timerState === "idle" && (
            <button
              onClick={handleStart}
              disabled={!selectedCategoryId || categories.length === 0}
              className="btn-primary btn-lg flex items-center gap-2"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              スタート
            </button>
          )}

          {timerState === "running" && (
            <>
              <button
                onClick={handlePause}
                className="btn-secondary btn-lg flex items-center gap-2"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                一時停止
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="btn-primary btn-lg flex items-center gap-2"
              >
                <svg
                  className="w-6 h-6"
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
                {isSaving ? "保存中..." : "保存"}
              </button>
            </>
          )}

          {timerState === "paused" && (
            <>
              <button
                onClick={handleResume}
                className="btn-primary btn-lg flex items-center gap-2"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                再開
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="btn-primary btn-lg flex items-center gap-2"
              >
                <svg
                  className="w-6 h-6"
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
                {isSaving ? "保存中..." : "保存"}
              </button>
              <button
                onClick={handleStop}
                className="btn-danger btn-lg flex items-center gap-2"
              >
                <svg
                  className="w-6 h-6"
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
                破棄
              </button>
            </>
          )}
        </div>
      </div>

      {/* メモ入力 */}
      {timerState !== "idle" && (
        <div className="card">
          <label className="label">メモ（オプション）</label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="作業内容をメモ..."
            className="input h-24 resize-none"
            rows={3}
          />
        </div>
      )}

      {/* ヒント */}
      <div className="text-sm text-gray-500 text-center">
        <p>タイマーを開始して作業時間を記録しましょう。</p>
        <p>一時停止して後から再開することもできます。</p>
      </div>
    </div>
  );
}
