# AI Protocol Viewer Walkthrough

AI Protocol Viewer の独立したプロジェクト化、および `nanobot` との連携ブリッジの実装を完了しました。

## 達成したこと
AI Protocol Viewer を Void Editor から完全に切り離し、MIT ライセンスの独立したツールとして利用・配布できる基盤を構築しました。また、`nanobot` の AI 通信をリアルタイムに観察できるブリッジを実装しました。

### 1. プロジェクトの独立化と MIT 移行
- **独立プロジェクトの創設**: `ai-protocol-viewer` としてディレクトリを整理し、MIT ライセンス下で管理。
- **メタデータの更新**: `package.json`、`LICENSE`、`README.md` を standalone 向けに刷新。
- **Zero-Touch アーキテクチャ**: Void Editor 本体に依存しない React/Vite プロジェクトとして構築。

### 2. Nanobot Interception Bridge
- **LiteLLM コールバック**: `nanobot` 内部の LiteLLM を利用し、コード改変なしで通信を傍受する `ProxyHandler` (`bridge/bridge.py`) を実装。
- **WebSocket 配信**: Python ブリッジから受け取ったログを UI へ配信する Node.js サーバー (`server/server.js`) を構築。
- **インジェクション**: `LITELLM_CALLBACKS` 環境変数を利用して、既存の `nanobot` に非侵入的に割り込む仕組みを確立。

## 検証結果
- **ビルド確認**: `npm run build` による本番用バイナリの生成が正常に完了。
- **ブリッジ通信**: テストスクリプト (`test_litellm.py`) を用いて、AI リクエスト/レスポンスが正しく WebSocket 経由で UI へ転送されることを確認。
- **データ整合性**: Usage (トークン使用量) やツール実行リクエストなどの非 JSON 標準オブジェクトのシリアライズ問題を解消。

## 使い方

1. **ビューアとサーバーの起動**:
   ```bash
   npm run dev     # UI (5174)
   npm run server  # Log Server (5175)
   ```
2. **Nanobot の実行（ブリッジ付き）**:
   ```bash
   ./bridge/inject_bridge.sh agent
   ```

これによって、どのような AI 実行ツールであっても、LiteLLM を介していればその通信プロトコルを透過的に観察・分析できる環境が整いました。
