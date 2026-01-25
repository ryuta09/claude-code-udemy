# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
- パスエイリアス: `@/*` → プロジェクトルート

## Project Structure

```
app/
├── layout.tsx    # ルートレイアウト（Geistフォント設定含む）
├── page.tsx      # ホームページ
└── globals.css   # グローバルスタイル（Tailwind + CSS変数）
```

## Key Conventions

- App Routerのファイルベースルーティング（`app/`ディレクトリ）
- Server Componentsがデフォルト（Client Componentsには`"use client"`が必要）
- ESLintはNext.js推奨設定（core-web-vitals + typescript）を使用

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
