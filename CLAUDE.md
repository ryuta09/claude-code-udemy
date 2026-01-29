# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Project Tracker** - シンプルな作業時間計測アプリ

- タイマー機能、カテゴリ分け、ダッシュボード表示
- 無料版（基本機能）とプレミアム版（高度な分析機能）の2プラン構成
- 詳細な要件は`.claude/requirements.md`を参照
- 開発ロードマップは`.claude/development_roadmap.md`を参照

## Commands

```bash
npm run dev      # 開発サーバー起動 (http://localhost:3000)
npm run build    # 本番ビルド
npm run start    # 本番サーバー起動
npm run lint     # ESLint実行
```

## Architecture

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** でスタイリング（`@import "tailwindcss"` 構文）
- **Supabase** (PostgreSQL) でデータ管理
- **Clerk** で認証、**Clerk Billing** (Stripe) で課金
- パスエイリアス: `@/*` → プロジェクトルート

## Data Model

```
categories: id, user_id (TEXT), name, sort_order, created_at, updated_at
work_logs: id, user_id (TEXT), category_id, duration (秒), memo, started_at, created_at, updated_at
```

- `user_id`はClerkのユーザーID（UUID形式ではなくTEXT型）
- RLSポリシーで`get_clerk_user_id()`関数を使用
- 型定義: `types/database.ts`（`npx supabase gen types typescript`で生成可能）

## API Routes

すべてのAPI Routesは`app/api/`に配置。共通パターン：

```typescript
import { auth } from "@clerk/nextjs/server";
import { createAuthenticatedClient } from "@/lib/supabase";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAuthenticatedClient(userId);
  // RLSが自動的にユーザーのデータのみ返す
}
```

現在のエンドポイント:
- `/api/categories` - GET/POST
- `/api/categories/[id]` - PATCH/DELETE
- `/api/time-entries` - GET/POST
- `/api/time-entries/[id]` - PUT/DELETE
- `/api/export` - GET (CSVエクスポート)

## Page Structure

- `app/page.tsx` - ランディングページ（Server Component）
- `app/dashboard/` - 認証必須エリア（すべてClient Component）
  - `page.tsx` - 統計表示
  - `timer/page.tsx` - タイマー・手動入力
  - `categories/page.tsx` - カテゴリ管理
  - `history/page.tsx` - 作業履歴
  - `export/page.tsx` - データエクスポート

## Key Conventions

- App Routerのファイルベースルーティング（`app/`ディレクトリ）
- Server Componentsがデフォルト（Client Componentsには`"use client"`が必要）
- ESLintはNext.js推奨設定（core-web-vitals + typescript）を使用

## Tailwind CSS v4

Tailwind CSSのセットアップ・設定方法は`.claude/tailwind_document.md`を参照すること。

- **ゼロコンフィグ**: `tailwind.config.js/ts`は不要（v4の特徴）
- `@import "tailwindcss"`でインポート（v3の`@tailwind`は使用しない）
- カスタマイズは`@theme inline`ディレクティブで行う
- Shadcn UIとの統合時も設定ファイルは作成しない

## Design System

UIコンポーネントやスタイリングを行う際は、`.claude/design_system.md`のデザインシステムに従うこと。

- 配色はTailwind CSSユーティリティクラスのみを使用
- WCAG 2.1準拠のコントラスト比を確保
- 最小タッチターゲットサイズ44px x 44pxを確保
- 8pxベースの余白システムを使用

## Supabase

Supabaseの使用方法は`.claude/supabase_document.md`を参照すること。

- **クラウドベース（方法1）を使用**（Docker不使用）
- 開発環境と本番環境で別プロジェクトを作成
- マイグレーションファイルでスキーマ管理
- TypeScript型定義は`npx supabase gen types typescript`で生成

## Authentication & Billing (Clerk)

認証、サブスクリプション、課金機能の実装は`.claude/clerk_document.md`を参照すること。

- **Clerk**で認証（サインアップ/サインイン）を実装
- **Clerk Billing**（Stripeベース）で課金・サブスクリプション管理
- プラン別アクセス制御には`has()`関数または`Protect`コンポーネントを使用
- ClerkコンポーネントはSSR無効化で動的インポート推奨

## Clerk + Supabase Integration

ClerkとSupabaseのRLS連携については`.claude/clerk_supabase_integration_document.md`を参照すること。

- **カスタムヘッダー方式（API Routes経由）を推奨**（環境非依存）
- ClerkのユーザーIDはTEXT型で保存（UUIDではない）
- `get_clerk_user_id()`関数でRLSポリシーを実装
- すべてのデータアクセスはサーバーサイド経由で行う
