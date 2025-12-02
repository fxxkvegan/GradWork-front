# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

React 19 + TypeScript + Viteで構築されたフロントエンドアプリケーション。Material-UI v7を使用したモダンなUIと、トークンベース認証を実装。

## 開発コマンド

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動 (ポート5173)
npm run dev

# 型チェック + プロダクションビルド
npm run build

# 型チェックのみ実行
npx tsc --noEmit

# Lint実行
npm run lint

# ビルド済みアプリのプレビュー
npm run preview
```

## 技術スタック

- **React 19** + **TypeScript 5.8**
- **Vite 6** (ビルドツール、HMR対応)
- **React Router v7** (クライアントサイドルーティング)
- **Material-UI v7** (@mui/material, @mui/icons-material)
- **Emotion** (CSS-in-JS)
- **Axios** (HTTP通信)
- **date-fns** (日付処理)
- **Splide/Swiper** (カルーセルコンポーネント)

## ディレクトリ構造

```
src/
├── components/          # 再利用可能なコンポーネント
│   ├── Layout.tsx      # アプリ全体のレイアウトコンポーネント
│   ├── AppHeader.tsx   # ヘッダーコンポーネント
│   ├── AppHeaderWithAuth.tsx  # 認証状態を含むヘッダー
│   ├── UserMenu.tsx    # ユーザーメニュー
│   └── layout/         # レイアウト関連コンポーネント
├── pages/              # ページコンポーネント
│   ├── HomePage.tsx    # ホームページ
│   ├── ItemDetailPage.tsx   # アイテム詳細ページ
│   ├── ItemFormPage.tsx     # アイテム作成・編集フォーム
│   ├── ItemDemoPage.tsx     # デモページ
│   ├── Legal.tsx       # 法的情報ページ
│   └── auth/           # 認証関連ページ
│       ├── LoginPage.tsx
│       ├── RegisterPage.tsx
├── context/            # Reactコンテキスト
│   └── AuthContext.tsx # 認証状態管理
├── services/           # APIクライアント・サービス層
│   └── userApi.ts      # ユーザー・認証API
├── types/              # TypeScript型定義
│   └── user.ts         # User型、認証関連型
├── constants/          # 定数定義
│   └── api.ts          # API設定、エンドポイント、エラーメッセージ
├── utils/              # ユーティリティ関数
├── hooks/              # カスタムフック
│   └── useScrollDirection.ts
├── assets/             # 静的アセット
└── main.tsx            # アプリケーションエントリーポイント
```

## 認証システム

### AuthContext (`src/context/AuthContext.tsx`)

グローバル認証状態を管理するReactコンテキスト:

- **認証方式**: Bearer Token (JWT)
- **永続化**: localStorage (remember=true) または sessionStorage (remember=false)
- **自動リフレッシュ**: トークン有効期限切れ時に自動更新
- **提供API**:
  - `login(user, remember)`: ログイン処理
  - `logout()`: ログアウト処理
  - `refreshUser()`: ユーザー情報の再取得
  - `isLoggedIn`: ログイン状態
  - `user`: 現在のユーザー情報

### API通信 (`src/services/userApi.ts`)

AxiosベースのAPIクライアント:

- **Base URL**: `https://app.nice-dig.com/api` (本番環境)
- **リクエストインターセプター**: 自動でBearerトークンを付与
- **レスポンスインターセプター**: 401エラー時に自動トークンリフレッシュ & リトライ
- **詳細ログ**: すべてのAPI通信をコンソールにログ出力 (デバッグ用)

## ルーティング (`src/main.tsx`)

| パス | コンポーネント | 説明 |
|------|---------------|------|
| `/` | HomePage | ホームページ |
| `/home` | HomePage | ホームページ (リダイレクト) |
| `/login` | LoginPage | ログインページ |
| `/register` | RegisterPage | ユーザー登録ページ |
| `/legal` | Legal | 法的情報ページ |
| `/item` | ItemDemoPage | アイテムデモページ |
| `/item/:id` | ItemDetailPage | アイテム詳細ページ |
| `/create` | ItemFormPage | アイテム作成ページ |
| `/edit/:itemId` | ItemFormPage | アイテム編集ページ |
| `*` | 404ページ | ページが見つかりません |

すべてのルート(Legal以外)は`Layout`コンポーネントでラップされている。

## コンポーネントパス規則

- **正**: `import AppHeader from '../components/AppHeader'`
- **誤**: `import AppHeader from '../component/AppHeader'` (componentsではなくcomponentと書くとエラー)

すべてのコンポーネントは`src/components/`ディレクトリに配置されています。

## 開発時の注意事項

1. **型安全性**: any/as/unknown の使用は禁止。すべての値に適切な型を付与する
2. **関数型プログラミング**: map/filter/reduceを優先し、for/whileループを避ける
3. **イミュータビリティ**: スプレッド演算子を使い、push/spliceなどの破壊的メソッドを避ける
4. **useEffectの依存配列**: 本当に監視が必要な値のみを含める
5. **React 19対応**: 最新のReact APIとベストプラクティスに従う
6. **CSS Modules**: コンポーネント固有のスタイルには`.module.css`を使用
7. **テストログイン**: `TestLogin.tsx`は開発環境でのみ表示される (PROD環境では非表示)

## API定数 (`src/constants/api.ts`)

すべてのAPI関連定数は`src/constants/api.ts`に集約:

- `API_CONFIG`: Base URL、タイムアウト
- `STORAGE_KEYS`: localStorage/sessionStorageのキー名
- `API_ENDPOINTS`: 各エンドポイントのパス
- `ERROR_MESSAGES`: エラーメッセージ定数

新しいAPIエンドポイントやエラーメッセージを追加する際は、必ずこのファイルに定数として定義してください。

## バックエンド連携

- バックエンドは別リポジトリ(`GradWork-back/`)のLaravel 12アプリケーション
- Laravel Sanctumを使用したトークンベース認証
- OpenAPI仕様: `GradWork-back/swagger.yml`参照
- 主要エンドポイント:
  - `/api/auth/*`: 認証 (login, signup, logout, refresh)
  - `/api/users/me`: ユーザープロフィール
  - `/api/products`: プロダクト管理
  - `/api/reviews`: レビュー管理
  - `/api/home`: ホームページデータ
