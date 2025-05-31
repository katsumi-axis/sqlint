# SQLint プロジェクト仕様書

## パッケージマネージャー
- **重要**: pnpmを使用（npmは使用しない）
- インストール: `pnpm install`
- 実行: `pnpm run <script>`
- 追加: `pnpm add <package>` / `pnpm add -D <package>`

## 主要コマンド
- `pnpm run build` - TypeScriptコンパイル
- `pnpm run dev` - watchモード
- `pnpm run lint` - ESLint実行
- `pnpm run typecheck` - 型チェック
- `pnpm test` - テスト実行
- `pnpm test --coverage` - カバレッジ計測

## アーキテクチャ概要
```
CLI → Linter → Parser → AST
       ↓        ↓
     Rules   Config
```

### コンポーネント
- **CLI** (`cli.ts`): コマンドライン処理、結果表示
- **Linter** (`linter.ts`): ルール実行、issue集約
- **Parser** (`parser.ts`): SQL→AST変換（node-sql-parser使用）
- **Rules** (`rules/`): 個別ルール実装
- **Config** (`config.ts`): 設定ファイル読み込み

## 現在のルール
1. `no-select-star`: SELECT * を禁止
2. `keyword-case`: SQLキーワードを大文字に統一
3. `table-alias`: テーブルエイリアスを2-30文字に制限

## 設定ファイル
- `.sqlintrc.yml` / `.sqlintrc.json` / `sqlint.config.js`
- 優先順位: CLI引数 > プロジェクト設定 > デフォルト

## テスト
- カバレッジ: 89.54%達成
- 単体テスト: parser, rules, config, linter
- 統合テスト: CLI, E2E

## 技術的詳細
- node-sql-parserの型定義: `src/types/sql-parser.ts`に独自実装
- 動的インポート使用（ESM対応）
- exitコード: error時のみ1、warningは0

## 未実装機能
- `--fix`オプション（自動修正）
- カスタムルールプラグイン
- IDE統合
- 複数SQLダイアレクト対応

## 今後の拡張予定
1. **新規ルール追加**
   - パフォーマンス系（インデックス、暗黙の型変換）
   - セキュリティ系（SQLインジェクション防止）
   - データ整合性系（WHERE句なしUPDATE/DELETE警告）

2. **機能拡張**
   - 自動修正機能
   - 並列ファイル処理
   - watchモード
   - .sqlintignoreサポート

3. **開発体験向上**
   - ルール詳細表示（--explain）
   - デバッグモード
   - プログレスバー
   - エディタプラグイン