"use client";

import { useState, useEffect } from "react";
import { Category } from "@/types/database";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // カテゴリ作成用
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // 編集用
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  // 削除確認用
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // カテゴリ一覧を取得
  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError("カテゴリの取得に失敗しました");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // カテゴリ作成
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName }),
      });

      if (!response.ok) throw new Error("Failed to create category");

      const newCategory = await response.json();
      setCategories([...categories, newCategory]);
      setNewCategoryName("");
    } catch (err) {
      setError("カテゴリの作成に失敗しました");
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  // カテゴリ更新
  const handleUpdate = async (id: string) => {
    if (!editingName.trim()) return;

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingName }),
      });

      if (!response.ok) throw new Error("Failed to update category");

      const updatedCategory = await response.json();
      setCategories(
        categories.map((cat) => (cat.id === id ? updatedCategory : cat))
      );
      setEditingId(null);
      setEditingName("");
    } catch (err) {
      setError("カテゴリの更新に失敗しました");
      console.error(err);
    }
  };

  // カテゴリ削除
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete category");

      setCategories(categories.filter((cat) => cat.id !== id));
      setDeletingId(null);
    } catch (err) {
      setError("カテゴリの削除に失敗しました");
      console.error(err);
    }
  };

  // 編集開始
  const startEditing = (category: Category) => {
    setEditingId(category.id);
    setEditingName(category.name);
  };

  // 編集キャンセル
  const cancelEditing = () => {
    setEditingId(null);
    setEditingName("");
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
        <h1 className="text-2xl font-bold text-gray-900">カテゴリ管理</h1>
        <p className="text-gray-600">作業時間を分類するカテゴリを管理します</p>
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

      {/* カテゴリ作成フォーム */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          新しいカテゴリを作成
        </h2>
        <form onSubmit={handleCreate} className="flex gap-4">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="カテゴリ名を入力"
            className="input flex-1"
            disabled={isCreating}
          />
          <button
            type="submit"
            disabled={isCreating || !newCategoryName.trim()}
            className="btn-primary"
          >
            {isCreating ? "作成中..." : "作成"}
          </button>
        </form>
      </div>

      {/* カテゴリ一覧 */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          カテゴリ一覧
        </h2>

        {categories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg
              className="w-12 h-12 mx-auto mb-4 text-gray-300"
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
            <p>カテゴリがありません</p>
            <p className="text-sm mt-1">
              上のフォームから新しいカテゴリを作成してください
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {categories.map((category) => (
              <li key={category.id} className="py-4">
                {editingId === category.id ? (
                  // 編集モード
                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="input flex-1"
                      autoFocus
                    />
                    <button
                      onClick={() => handleUpdate(category.id)}
                      disabled={!editingName.trim()}
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
                ) : deletingId === category.id ? (
                  // 削除確認モード
                  <div className="flex items-center justify-between">
                    <span className="text-red-600">
                      「{category.name}」を削除しますか？
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(category.id)}
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
                  // 通常表示
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900 font-medium">
                      {category.name}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditing(category)}
                        className="text-gray-500 hover:text-blue-600 p-2"
                        title="編集"
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
                        onClick={() => setDeletingId(category.id)}
                        className="text-gray-500 hover:text-red-600 p-2"
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
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
