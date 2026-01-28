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

// 今日の日付をYYYY-MM-DD形式で取得
function getTodayString(): string {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

export default function TimerPage() {
  // タイマー状態
  const [timerState, setTimerState] = useState<TimerState>("idle");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [timerMemo, setTimerMemo] = useState("");

  // 手動入力用
  const [manualDate, setManualDate] = useState(getTodayString());
  const [manualHours, setManualHours] = useState("");
  const [manualMinutes, setManualMinutes] = useState("");
  const [manualMemo, setManualMemo] = useState("");

  // カテゴリ関連
  const [categories, setCategories] = useState<Category[]>([]);
  const [timerCategoryId, setTimerCategoryId] = useState<string>("");
  const [manualCategoryId, setManualCategoryId] = useState<string>("");
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // 保存状態
  const [isTimerSaving, setIsTimerSaving] = useState(false);
  const [isManualSaving, setIsManualSaving] = useState(false);
  const [timerMessage, setTimerMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [manualMessage, setManualMessage] = useState<{
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
          setTimerCategoryId(data[0].id);
          setManualCategoryId(data[0].id);
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
    if (!timerCategoryId) {
      setTimerMessage({
        type: "error",
        text: "カテゴリを選択してください",
      });
      return;
    }

    setTimerState("running");
    setStartTime(new Date());
    setTimerMessage(null);
  }, [timerCategoryId]);

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
    setTimerMemo("");
  }, []);

  // タイマー記録を保存
  const handleSaveTimer = useCallback(async () => {
    if (elapsedTime === 0) {
      setTimerMessage({
        type: "error",
        text: "記録する時間がありません",
      });
      return;
    }

    if (!timerCategoryId) {
      setTimerMessage({
        type: "error",
        text: "カテゴリを選択してください",
      });
      return;
    }

    setIsTimerSaving(true);
    setTimerMessage(null);

    try {
      const response = await fetch("/api/time-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_id: timerCategoryId,
          duration: elapsedTime,
          memo: timerMemo || null,
          started_at: startTime?.toISOString() || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save time entry");
      }

      setTimerMessage({
        type: "success",
        text: "作業記録を保存しました",
      });

      handleStop();
    } catch (err) {
      console.error("Failed to save time entry:", err);
      setTimerMessage({
        type: "error",
        text: "保存に失敗しました",
      });
    } finally {
      setIsTimerSaving(false);
    }
  }, [elapsedTime, timerCategoryId, timerMemo, startTime, handleStop]);

  // 手動入力を保存
  const handleSaveManual = useCallback(async () => {
    const hours = parseInt(manualHours) || 0;
    const minutes = parseInt(manualMinutes) || 0;
    const totalSeconds = hours * 3600 + minutes * 60;

    if (totalSeconds === 0) {
      setManualMessage({
        type: "error",
        text: "作業時間を入力してください",
      });
      return;
    }

    if (!manualCategoryId) {
      setManualMessage({
        type: "error",
        text: "カテゴリを選択してください",
      });
      return;
    }

    if (!manualDate) {
      setManualMessage({
        type: "error",
        text: "日付を選択してください",
      });
      return;
    }

    setIsManualSaving(true);
    setManualMessage(null);

    try {
      const startedAt = new Date(manualDate);
      startedAt.setHours(9, 0, 0, 0);

      const response = await fetch("/api/time-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_id: manualCategoryId,
          duration: totalSeconds,
          memo: manualMemo || null,
          started_at: startedAt.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save time entry");
      }

      setManualMessage({
        type: "success",
        text: "作業記録を保存しました",
      });

      setManualHours("");
      setManualMinutes("");
      setManualMemo("");
      setManualDate(getTodayString());
    } catch (err) {
      console.error("Failed to save time entry:", err);
      setManualMessage({
        type: "error",
        text: "保存に失敗しました",
      });
    } finally {
      setIsManualSaving(false);
    }
  }, [manualHours, manualMinutes, manualDate, manualCategoryId, manualMemo]);

  // 選択中のカテゴリ名を取得
  const timerCategory = categories.find((c) => c.id === timerCategoryId);

  return (
    <div className="space-y-8">
      {/* ページヘッダー */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">時間記録</h1>
        <p className="text-gray-600">タイマーまたは手動で作業時間を記録できます</p>
      </div>

      {/* 2カラムレイアウト */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左側: タイマー */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-blue-500"
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
            タイマー
          </h2>

          {/* タイマーメッセージ */}
          {timerMessage && (
            <div
              className={`px-4 py-3 rounded-lg text-sm ${
                timerMessage.type === "success"
                  ? "bg-green-50 border border-green-200 text-green-700"
                  : "bg-red-50 border border-red-200 text-red-700"
              }`}
            >
              {timerMessage.text}
              <button
                onClick={() => setTimerMessage(null)}
                className="float-right hover:opacity-70"
              >
                ✕
              </button>
            </div>
          )}

          <div className="card">
            {/* カテゴリ選択 */}
            <div className="mb-4">
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
                  value={timerCategoryId}
                  onChange={(e) => setTimerCategoryId(e.target.value)}
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
            <div className="text-center py-6">
              <div className="text-5xl md:text-6xl font-mono font-bold text-gray-900 mb-2">
                {formatTime(elapsedTime)}
              </div>

              {timerState !== "idle" && timerCategory && (
                <div className="text-gray-500 text-sm">
                  <span className="inline-flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full" />
                    {timerCategory.name}
                  </span>
                </div>
              )}
            </div>

            {/* コントロールボタン */}
            <div className="flex justify-center gap-3 flex-wrap">
              {timerState === "idle" && (
                <button
                  onClick={handleStart}
                  disabled={!timerCategoryId || categories.length === 0}
                  className="btn-primary flex items-center gap-2"
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
                    className="btn-secondary flex items-center gap-2"
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
                        d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    一時停止
                  </button>
                  <button
                    onClick={handleSaveTimer}
                    disabled={isTimerSaving}
                    className="btn-primary flex items-center gap-2"
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {isTimerSaving ? "保存中..." : "保存"}
                  </button>
                </>
              )}

              {timerState === "paused" && (
                <>
                  <button
                    onClick={handleResume}
                    className="btn-primary flex items-center gap-2"
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
                    onClick={handleSaveTimer}
                    disabled={isTimerSaving}
                    className="btn-primary flex items-center gap-2"
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {isTimerSaving ? "保存中..." : "保存"}
                  </button>
                  <button
                    onClick={handleStop}
                    className="btn-danger flex items-center gap-2"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    破棄
                  </button>
                </>
              )}
            </div>

            {/* メモ入力（タイマー動作中のみ表示） */}
            {timerState !== "idle" && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <label className="label">メモ（オプション）</label>
                <textarea
                  value={timerMemo}
                  onChange={(e) => setTimerMemo(e.target.value)}
                  placeholder="作業内容をメモ..."
                  className="input h-20 resize-none text-sm"
                  rows={2}
                />
              </div>
            )}
          </div>

          <p className="text-sm text-gray-500 text-center">
            タイマーを開始して作業時間を記録しましょう
          </p>
        </div>

        {/* 右側: 手動入力 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            手動入力
          </h2>

          {/* 手動入力メッセージ */}
          {manualMessage && (
            <div
              className={`px-4 py-3 rounded-lg text-sm ${
                manualMessage.type === "success"
                  ? "bg-green-50 border border-green-200 text-green-700"
                  : "bg-red-50 border border-red-200 text-red-700"
              }`}
            >
              {manualMessage.text}
              <button
                onClick={() => setManualMessage(null)}
                className="float-right hover:opacity-70"
              >
                ✕
              </button>
            </div>
          )}

          <div className="card">
            <div className="space-y-4">
              {/* 日付選択 */}
              <div>
                <label className="label">日付</label>
                <input
                  type="date"
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  max={getTodayString()}
                  className="input"
                />
              </div>

              {/* カテゴリ選択 */}
              <div>
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
                    value={manualCategoryId}
                    onChange={(e) => setManualCategoryId(e.target.value)}
                    className="input"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* 作業時間入力 */}
              <div>
                <label className="label">作業時間</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={manualHours}
                    onChange={(e) => setManualHours(e.target.value)}
                    placeholder="0"
                    min="0"
                    max="23"
                    className="input w-20 text-center"
                  />
                  <span className="text-gray-600">時間</span>
                  <input
                    type="number"
                    value={manualMinutes}
                    onChange={(e) => setManualMinutes(e.target.value)}
                    placeholder="0"
                    min="0"
                    max="59"
                    className="input w-20 text-center"
                  />
                  <span className="text-gray-600">分</span>
                </div>
              </div>

              {/* メモ入力 */}
              <div>
                <label className="label">メモ（オプション）</label>
                <textarea
                  value={manualMemo}
                  onChange={(e) => setManualMemo(e.target.value)}
                  placeholder="作業内容をメモ..."
                  className="input h-20 resize-none text-sm"
                  rows={2}
                />
              </div>

              {/* 保存ボタン */}
              <button
                onClick={handleSaveManual}
                disabled={isManualSaving || categories.length === 0}
                className="btn-primary w-full flex items-center justify-center gap-2"
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {isManualSaving ? "保存中..." : "作業記録を保存"}
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-500 text-center">
            過去の作業時間を手動で入力できます
          </p>
        </div>
      </div>
    </div>
  );
}
