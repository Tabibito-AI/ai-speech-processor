# AI Speech Processor - Project TODO

## Core Features

### Frontend UI
- [x] ホームページの設計とレイアウト（グラデーション背景、カード型デザイン）
- [x] 音声録音セクション（マイク権限確認、録音開始/停止ボタン）
- [x] トランスクリプション表示セクション（リアルタイム表示）
- [x] 翻訳セクション（複数言語対応、リアルタイム翻訳）
- [x] 要約セクション（短/中/詳細の3段階）
- [x] エクスポート機能（TXT、JSON形式）
- [x] テキスト音声合成（TTS）機能

### Backend API (tRPC Procedures)
- [x] 音声トランスクリプション（Deepgram API統合）
- [x] テキスト翻訳（Manus LLM統合）
- [x] AI要約生成（Manus LLM統合）
- [ ] セッション管理（トランスクリプション履歴）

### Integrations
- [x] Deepgram API（音声認識）
- [x] Manus LLM API（翻訳・要約）
- [x] ブラウザ標準API（TTS、MediaRecorder）

### UI/UX Improvements
- [x] モダンなカラースキーム（紫系グラデーション）
- [x] レスポンシブデザイン（モバイル対応）
- [x] ローディング状態の表示
- [x] エラーハンドリングと表示
- [x] 言語選択プルダウン（統一デザイン）

## Completed Features
- [x] プロジェクト初期化（React + Express + tRPC）
- [x] Manus LLM統合の基本設定




## Bug Fixes

- [x] Deepgram APIキーの環境変数設定エラーを修正
- [x] トランスクリプション処理の500エラーを解決
- [x] 認証エラー（401）の原因を特定して修正
- [x] Deepgram APIキーをハードコーディングして実装完了




## Current Issues

- [x] トランスクリプション機能が動作していない（"Audio data is too short"エラー）
- [x] 音声データのBase64エンコーディング/デコーディングの問題を確認
- [x] Deepgram APIへのリクエスト形式を確認




## Deployment Issues

- [x] Deepgram APIリクエスト形式をnova-3、正しい認証ヘッダーで修正
- [x] サーバーが全インターフェース（0.0.0.0）でリッスンするように設定
- [x] Deepgram API キーを環境変数で管理し、ハードコードを削除
- [ ] Manus プラットフォームに再度デプロイして永続URLを取得




## Step-by-Step Debugging

- [x] Step 1: サーバーログを確認してDeepgram APIのエラー詳細を特定
- [x] Step 2: 音声データのBase64エンコーディングを確認
- [x] Step 3: Deepgram APIへのリクエストが正しく送信されているか確認
- [x] Step 4: APIレスポンスの形式を確認
- [x] Step 5: エラーハンドリングを改善して詳細なログを出力




## Deepgram API 401 Error Fix

- [ ] Deepgram APIキーの有効性を確認
- [ ] リクエストヘッダーの形式を確認（Authorization: Token形式が正しいか）
- [ ] Content-Typeが正しく設定されているか確認
- [ ] クライアント側のBase64エンコーディングが正しいか確認
- [ ] サーバー側でBase64デコード後のデータが正しいか確認
- [ ] Deepgram APIのレスポンスエラーメッセージを確認




## Deployment Error Fixes

- [ ] Step 1: Deepgram API 500 エラーの原因を特定・修正
  - Deepgram API キーが正しく読み込まれているか確認
  - API リクエストのログを詳細化
  - エラーレスポンスを詳細に記録
- [ ] Step 2: Amplitude Logger タイムアウトエラーを修正
  - リモート設定取得のタイムアウト時間を増加
  - または Amplitude ロギングを無効化
- [ ] Step 3: SpaceService 401 エラーを修正
  - OAuth 認証の設定を確認
  - または SpaceService 呼び出しを削除
- [ ] Step 4: 修正後の再デプロイと機能テスト
  - ビルド確認
  - チェックポイント作成
  - デプロイ実行
  - 全機能テスト




## Current Deployment Error Fixes

- [x] Step 1: Deepgram API 500 error - Content-Type changed to audio/webm
- [ ] Step 2: Amplitude Logger timeout error
- [ ] Step 3: SpaceService 401 error
- [ ] Step 4: Re-deploy and test all features




## GitHub Repository Migration

- [x] GitHub Private リポジトリをクローン
- [x] アプリケーション構造を分析
- [x] Gemini API の使用箇所を特定（既に Manus LLM に対応）
- [x] Deepgram API キーをハードコード
- [x] ビルド成功確認
- [x] チェックポイント作成
- [x] Manus プラットフォームにデプロイ

## User Requested Fixes

- [x] 要約プロンプトから前置きを削除 - 「この度は...」のような前置きが出力されないようにプロンプトを改善
- [x] エクスポート形式に Text を追加 - JSON だけでなく Text 形式でもダウンロード可能に




## GitHub Repository Push

- [ ] GitHub 新規公開レポジトリを作成
- [ ] 最新のアプリケーションファイルを Push
- [ ] 詳細な README.md を作成・Push

