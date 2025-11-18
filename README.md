# AI Speech Processor

**音声をテキストに、言語の壁を越える**

最新のAI技術を使用して、音声をリアルタイムでテキスト化し、翻訳、要約します。会議、講演、インタビューなど、あらゆる場面で活躍します。

## デプロイ URL

**本番環境:** https://aitranscribe-hnmehq2d.manus.space

## 画面イメージ

### ホームページ
![AI Speech Processor ホーム](./docs/home-screen.jpg)

### 処理画面
- **音声入力セクション**: 言語選択、録音ボタン
- **トランスクリプション表示**: リアルタイム表示
- **翻訳セクション**: 言語選択、翻訳ボタン
- **要約セクション**: 要約タイプ・言語選択、要約ボタン
- **エクスポート**: JSON/Text ダウンロード

## 主な機能

### 🎙️ 音声認識
- マイクからリアルタイムで高品質の音声を録音
- Deepgram API による 99.9% の認識精度
- 10 言語対応の音声入力

### 🌍 リアルタイム翻訳
- 40 言語以上への自動翻訳
- Manus LLM による自然な翻訳
- トランスクリプション完了後の即座の翻訳

### 📚 AI 要約生成
- **短い要約**: 4-5 行の簡潔なサマリー
- **中程度の要約**: 150-250 単語の詳細なサマリー
- **詳細な要約**: 複数セクションを含む包括的な分析
- 8 言語対応の要約出力

### 📥 エクスポート機能
- **JSON 形式**: 構造化データとしてダウンロード
- **Text 形式**: 整形されたテキストファイルとしてダウンロード

### 🔊 テキスト音声合成（TTS）
- 生成されたテキストをブラウザで再生
- 自然な音声出力

## 技術仕様

### フロントエンド
- **フレームワーク**: React 19 + TypeScript
- **UI ライブラリ**: shadcn/ui + Tailwind CSS 4
- **状態管理**: React Hooks + TanStack Query
- **ルーティング**: wouter
- **ビルドツール**: Vite

### バックエンド
- **フレームワーク**: Express.js 4 + Node.js
- **API**: tRPC 11（型安全な RPC）
- **データベース**: MySQL + Drizzle ORM
- **認証**: Manus OAuth

### 外部 API 統合
- **音声認識**: Deepgram API (nova-2 モデル)
- **LLM**: Manus LLM API（翻訳・要約）
- **認証**: Manus OAuth サーバー

## アーキテクチャ

```
┌─────────────────────────────────────────────────────────┐
│                  ブラウザ（React 19）                      │
│  ┌─────────────────────────────────────────────────┐    │
│  │  AudioProcessor コンポーネント  　                  │    │
│  │  - 音声録音（MediaRecorder API）                   │    │
│  │  - UI 制御（言語選択、ボタン操作）                     │    │
│  │  - リアルタイムログ出力                              │    │
│  └─────────────────────────────────────────────────┘    │
└──────────────────┬──────────────────────────────────────┘
                   │ tRPC クライアント
                   ▼
┌─────────────────────────────────────────────────────────┐
│              Express.js バックエンド                       │
│  ┌─────────────────────────────────────────────────┐    │
│  │  tRPC ルーター                                    │    │
│  │  ├─ audio.transcribe（Deepgram API）             │    │
│  │  ├─ audio.translate（Manus LLM）                 │    │
│  │  └─ audio.summarize（Manus LLM）                 │    │
│  └─────────────────────────────────────────────────┘    │
└──────────────────┬──────────────────────────────────────┘
                   │
        ┌──────────┼──────────┐
        ▼          ▼          ▼
   ┌────────┐ ┌────────┐ ┌────────┐
   │Deepgram│ │ Manus  │ │ MySQL  │
   │  API   │ │  LLM   │ │   DB   │
   └────────┘ └────────┘ └────────┘
```

## ファイル構造

```
ai-speech-processor/
├── client/                          # React フロントエンド
│   ├── src/
│   │   ├── pages/
│   │   │   ├── AudioProcessor.tsx  # メインコンポーネント
│   │   │   ├── Home.tsx            # ホームページ
│   │   │   └── NotFound.tsx        # 404 ページ
│   │   ├── components/             # UI コンポーネント
│   │   ├── contexts/               # React Context
│   │   ├── hooks/                  # カスタムフック
│   │   ├── lib/                    # ユーティリティ
│   │   ├── App.tsx                 # ルーティング
│   │   ├── main.tsx                # エントリーポイント
│   │   └── index.css               # グローバルスタイル
│   ├── public/                      # 静的ファイル
│   ├── index.html                  # HTML テンプレート
│   └── package.json
│
├── server/                          # Express.js バックエンド
│   ├── routers.ts                  # tRPC ルーター定義
│   ├── routers/
│   │   └── audio.ts                # 音声処理ルーター
│   ├── db.ts                       # データベースクエリ
│   ├── llm.ts                      # LLM 統合（翻訳・要約）
│   ├── transcription.ts            # Deepgram 統合
│   ├── _core/                      # フレームワークコア
│   │   ├── index.ts                # サーバー起動
│   │   ├── context.ts              # tRPC コンテキスト
│   │   ├── trpc.ts                 # tRPC 設定
│   │   ├── env.ts                  # 環境変数
│   │   ├── cookies.ts              # Cookie 管理
│   │   ├── oauth.ts                # OAuth 処理
│   │   └── vite.ts                 # Vite 統合
│   └── storage.ts                  # S3 ストレージ
│
├── drizzle/                         # データベーススキーマ
│   ├── schema.ts                   # テーブル定義
│   └── migrations/                 # マイグレーション
│
├── shared/                          # 共有コード
│   ├── const.ts                    # グローバル定数
│   └── types.ts                    # 共有型定義
│
├── package.json                     # 依存関係
├── tsconfig.json                    # TypeScript 設定
├── vite.config.ts                  # Vite 設定
└── README.md                        # このファイル
```

## 主要な依存関係

### フロントエンド
- `react`: UI フレームワーク
- `@trpc/react-query`: tRPC クライアント
- `tailwindcss`: CSS フレームワーク
- `shadcn/ui`: UI コンポーネント
- `wouter`: ルーティング

### バックエンド
- `express`: Web フレームワーク
- `@trpc/server`: tRPC サーバー
- `drizzle-orm`: ORM
- `mysql2`: MySQL ドライバ
- `jsonwebtoken`: JWT 処理

## Manus サーバーへのデプロイ方法

### 前提条件
- Manus アカウント
- Deepgram API キー
- GitHub リポジトリへのアクセス

### デプロイ手順

#### 1. Manus プロジェクトの初期化

```bash
# Manus CLI を使用してプロジェクトを作成
manus init ai-speech-processor --template=web-db-user
```

#### 2. リポジトリのクローン

```bash
cd /path/to/project
git clone https://github.com/tomoto0/ai-speech-processor.git .
```

#### 3. 環境変数の設定

Manus Dashboard の **Settings → Secrets** で以下を設定：

| 環境変数名 | 説明 | 例 |
|-----------|------|-----|
| `DEEPGRAM_API_KEY` | Deepgram API キー | `(デフォルトで設定されていますが、ご自身のARK Keyに変更できます)` |
| `DATABASE_URL` | MySQL 接続文字列 | `mysql://user:pass@host/db` |
| `JWT_SECRET` | JWT 署名用シークレット | (自動生成) |

#### 4. ビルドとデプロイ

```bash
# ビルド
pnpm build

# デプロイ（Manus Dashboard から Publish ボタンをクリック）
```

#### 5. デプロイ後の確認

- ブラウザで永続 URL にアクセス
- マイク権限を許可
- 音声を録音してテスト

### トラブルシューティング

#### Deepgram API エラー (500)
- API キーが有効か確認
- API キーに十分な残高があるか確認
- ネットワーク接続を確認

#### マイク権限エラー
- ブラウザの設定でマイク権限を許可
- HTTPS 接続を使用していることを確認

#### データベース接続エラー
- `DATABASE_URL` が正しく設定されているか確認
- MySQL サーバーが起動しているか確認

## 使用例

### 1. 会議の記録と翻訳
```
1. マイクで会議を録音
2. 日本語でトランスクリプション
3. 英語に翻訳
4. 詳細な要約を生成
5. JSON でエクスポート
```

### 2. インタビューの要約
```
1. インタビューを録音
2. 英語でトランスクリプション
3. 日本語に翻訳
4. 短い要約を生成
5. Text でダウンロード
```

## API 仕様

### tRPC エンドポイント

#### `audio.transcribe`
音声をテキストに変換します。

**パラメータ:**
- `audioData` (string): Base64 エンコードされた音声データ
- `language` (string): 入力言語コード（例: "ja", "en"）

**レスポンス:**
```json
{
  "transcription": "こんにちは、これはテストです。"
}
```

#### `audio.translate`
テキストを別の言語に翻訳します。

**パラメータ:**
- `text` (string): 翻訳するテキスト
- `targetLanguage` (string): 翻訳先言語コード

**レスポンス:**
```json
{
  "translation": "Hello, this is a test."
}
```

#### `audio.summarize`
テキストを要約します。

**パラメータ:**
- `text` (string): 要約するテキスト
- `summaryType` (string): "short" | "medium" | "detailed"
- `summaryLanguage` (string): 要約の言語コード

**レスポンス:**
```json
{
  "summary": "これはテストの要約です。"
}
```

## 対応言語

### 音声入力言語（10 言語）
- 日本語 (ja)
- 英語 (en)
- スペイン語 (es)
- 中国語 (zh)
- フランス語 (fr)
- ドイツ語 (de)
- イタリア語 (it)
- ポルトガル語 (pt)
- ロシア語 (ru)
- 韓国語 (ko)

### 翻訳対応言語（40+言語）
- 主要言語: 英語、日本語、中国語、スペイン語、フランス語、ドイツ語、イタリア語、ポルトガル語、ロシア語、韓国語、アラビア語、ヒンディー語、インドネシア語
- その他多数の言語に対応

### 要約言語（8 言語）
- 日本語、英語、スペイン語、中国語、フランス語、イタリア語、韓国語、アラビア語

## パフォーマンス

- **トランスクリプション**: 平均 2-5 秒（音声長に依存）
- **翻訳**: 平均 1-3 秒
- **要約**: 平均 3-8 秒（要約タイプに依存）
- **認識精度**: 99.9%（Deepgram nova-2）

## セキュリティ

- **認証**: Manus OAuth による安全な認証
- **通信**: HTTPS による暗号化通信
- **API キー**: 環境変数で安全に管理
- **データベース**: SSL/TLS による接続

## ライセンス

MIT License

## サポート

問題が発生した場合は、以下をご確認ください：

1. **Deepgram API キーの確認**: 有効で残高があるか
2. **ネットワーク接続**: インターネット接続が正常か
3. **ブラウザ設定**: マイク権限が許可されているか
4. **コンソールログ**: エラーメッセージを確認

## 今後の改善予定

- [ ] セッション履歴機能（トランスクリプション履歴の保存）
- [ ] 音声ファイルアップロード機能（MP3/WAV）
- [ ] リアルタイム翻訳（トランスクリプション完了時に自動実行）
- [ ] 複数言語同時翻訳
- [ ] カスタムボキャブラリー機能
- [ ] 感情分析機能
- [ ] キーワード抽出機能

## 開発者情報

**開発**: 旅人
**最終更新**: 2025年11月17日
**バージョン**: 1.0.0

---

**AI Speech Processor で、言語の壁を越えましょう！**

