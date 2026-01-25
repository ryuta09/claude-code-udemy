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
