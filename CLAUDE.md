# Claude Code Project Notes

## Package Manager
- **IMPORTANT**: このプロジェクトではpnpmを使用します（npmは使用しません）
- パッケージのインストール: `pnpm install`
- スクリプトの実行: `pnpm run <script-name>`
- パッケージの追加: `pnpm add <package-name>`
- 開発依存関係の追加: `pnpm add -D <package-name>`

## Build Commands
- `pnpm run build` - TypeScriptをコンパイル
- `pnpm run dev` - 開発モード（watchモード）

## Lint and Type Check Commands
- `pnpm run lint` - ESLintを実行
- `pnpm run typecheck` - TypeScriptの型チェックを実行

## Test Commands
- `pnpm test` - テストを実行
- `pnpm test --coverage` - カバレッジ付きでテストを実行

## 実施済みの改善
1. **型安全性の向上**: すべてのany型を適切な型に置き換え
2. **エラーハンドリング改善**: 設定ファイル読み込みとパーサーエラー処理を強化
3. **テストカバレッジ向上**: 89.54%のカバレッジを達成
4. **新規テストファイル追加**: config.test.ts, cli.test.ts, table-alias.test.ts

## プロジェクトの注意点
- node-sql-parserの型定義は`src/types/sql-parser.ts`に独自実装
- 設定ファイルは動的インポートを使用（ESM対応）
- CLIはwarningのみでは終了コード0を返す（errorの場合のみ1を返す）