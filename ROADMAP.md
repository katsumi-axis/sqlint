# SQLint Development Roadmap

## 分析概要

### 現状の未実装機能（CLAUDE.mdより抽出）
1. **`--fix`オプション（自動修正）**
2. **カスタムルールプラグイン**
3. **IDE統合**
4. **複数SQLダイアレクト対応**

### 今後の拡張予定項目
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

### Biomeコンセプトの適用戦略

Biomeの統一アーキテクチャをSQLintに適用し、以下の原則に基づいて設計を改善：

#### 統一コンセプト
- **フォーマッター + リンター統合**: BiomeのようにSQLフォーマットとリンティングを単一ツールで提供
- **Zero Configuration**: デフォルト設定で即座に使用可能
- **パフォーマンス最適化**: Rust並みの速度を目指したNode.js最適化
- **Language Server Protocol（LSP）統合**: IDE連携強化

## 開発戦略・実装ロードマップ

## 実装戦略・ロードマップ

### 1次優先: 基盤機能整備

#### 1.1 統一設定アーキテクチャの構築
**目標**: BiomeライクなJSON Schema設定ファイル

**実装手順**:
1. **設定スキーマ設計**
   - [ ] `biome.json`スタイルの`sqlint.json`設計
   - [ ] JSON Schemaファイル作成（`schemas/sqlint.schema.json`）
   - [ ] 既存の`.sqlintrc.yml`から移行パス設計

2. **設定システム刷新**
   - [ ] `src/config.ts`を`src/config/`ディレクトリに分割
   - [ ] `src/config/schema.ts`: 設定バリデーション
   - [ ] `src/config/loader.ts`: 設定読み込み
   - [ ] `src/config/merger.ts`: 設定マージロジック
   - [ ] 階層設定対応（project > user > default）

3. **CLI引数統合**
   - [ ] `src/cli.ts`でBiome風コマンド体系導入
   - [ ] `sqlint check` - lint + format 統合コマンド
   - [ ] `sqlint format` - フォーマットのみ
   - [ ] `sqlint lint` - リントのみ

#### 1.2 フォーマッター統合
**目標**: SQL自動フォーマット機能の追加

**実装手順**:
1. **フォーマッターコア実装**
   - [ ] `src/formatter/`ディレクトリ作成
   - [ ] `src/formatter/sql-formatter.ts`: メインフォーマッター
   - [ ] `sql-formatter`ライブラリ統合検討
   - [ ] カスタムフォーマット設定（インデント、改行、大文字小文字）

2. **リンターとの統合**
   - [ ] `src/linter.ts`をフォーマッター機能と統合
   - [ ] フォーマット可能な問題の自動修正（`--fix`オプション）
   - [ ] コンフリクト解決システム（lint vs format）

3. **--fix オプション実装**
   - [ ] `src/rules/`で修正可能ルールにfixable: trueフラグ
   - [ ] 自動修正ロジック追加
   - [ ] 修正結果のdiff表示機能

#### 1.3 ルールシステム拡張
**目標**: プラガブルルールシステム構築

**実装手順**:
1. **ルールメタデータ拡張**
   - [ ] `src/types/rule.ts`で詳細メタデータ定義
   - [ ] カテゴリ分類（performance, security, style, correctness）
   - [ ] 推奨レベル（recommended, strict, all）
   - [ ] 修正可能フラグ追加

2. **新規ルール実装**
   - [ ] **パフォーマンス系ルール**
     - [ ] `no-implicit-type-conversion`: 暗黙的型変換警告
     - [ ] `require-index-hints`: インデックスヒント推奨
     - [ ] `no-select-without-limit`: LIMIT句なしSELECT警告
   - [ ] **セキュリティ系ルール**
     - [ ] `no-sql-injection-risk`: SQLインジェクション脆弱性検出
     - [ ] `require-parameterized-queries`: パラメータ化クエリ強制
   - [ ] **データ整合性系ルール**
     - [ ] `no-update-without-where`: WHERE句なしUPDATE警告
     - [ ] `no-delete-without-where`: WHERE句なしDELETE警告

3. **ルールグループ機能**
   - [ ] `@sqlint/recommended`: 推奨ルールセット
   - [ ] `@sqlint/security`: セキュリティルールセット
   - [ ] `@sqlint/performance`: パフォーマンスルールセット

#### 1.4 カスタムルールプラグインシステム
**目標**: 外部ルール追加可能にする

**実装手順**:
1. **プラグインAPI設計**
   - [ ] `src/plugin/`ディレクトリ作成
   - [ ] `src/plugin/loader.ts`: プラグイン動的読み込み
   - [ ] `src/plugin/types.ts`: プラグインインターフェース
   - [ ] プラグイン設定の`sqlint.json`統合

2. **プラグイン検索機能**
   - [ ] `node_modules`からの自動検出
   - [ ] `sqlint-plugin-*`命名規則
   - [ ] プラグイン依存関係検証

3. **サンプルプラグイン作成**
   - [ ] `examples/plugin-template/`
   - [ ] プラグイン開発ガイド作成

#### 1.5 パフォーマンス最適化
**目標**: 大規模ファイル処理の高速化

**実装手順**:
1. **並列処理実装**
   - [ ] `src/cli.ts`でWorker Threads活用
   - [ ] ファイル単位の並列リンティング
   - [ ] メモリ使用量監視・制限

2. **キャッシュシステム**
   - [ ] `src/cache/`ディレクトリ作成
   - [ ] ファイルハッシュベースキャッシュ
   - [ ] 設定変更時の自動キャッシュ無効化

3. **Watchモード実装**
   - [ ] `sqlint --watch`コマンド
   - [ ] ファイル変更検知（chokidarライブラリ）
   - [ ] 差分リンティング

#### 1.6 開発体験向上
**目標**: デバッグ・解析機能強化

**実装手順**:
1. **詳細表示機能**
   - [ ] `--explain`オプション: ルール詳細説明
   - [ ] `--debug`オプション: AST表示、処理時間計測
   - [ ] `--stats`オプション: 統計情報表示

2. **UI/UX改善**
   - [ ] プログレスバー（ora ライブラリ）
   - [ ] カラフルな出力（chalk強化）
   - [ ] 修正提案の表示

3. **IDE統合準備**
   - [ ] Language Server Protocol（LSP）基盤
   - [ ] `src/lsp/`ディレクトリ作成
   - [ ] VSCode Extension開発準備

#### 1.7 高度機能
**目標**: 複数SQLダイアレクト対応とファイル除外機能

**実装手順**:
1. **複数SQLダイアレクト対応**
   - [ ] `src/parser/dialect/`ディレクトリ
   - [ ] ダイアレクト別パーサー実装
   - [ ] 共通AST変換レイヤー
   - [ ] `src/rules/dialect/`でダイアレクト特化ルール
   - [ ] 設定での使用ダイアレクト指定

2. **.sqlintignore対応**
   - [ ] `.sqlintignore`ファイル読み込み
   - [ ] globパターンマッチング
   - [ ] 設定ファイルでのignorePatterns統合

## 技術的考慮事項

### アーキテクチャ変更
- **モジュール分割**: 大きくなった`src/`を機能別ディレクトリに分割
- **型安全性強化**: より厳密なTypeScript型定義
- **テスト拡張**: 新機能に対応したテストケース追加

### パフォーマンス目標
- **大規模ファイル対応**: 10MB以上のSQLファイルでも1秒以内
- **並列処理**: CPUコア数に応じた最適化
- **メモリ効率**: 100ファイル同時処理でもメモリ使用量500MB以下

### 互換性維持
- **既存設定移行**: `.sqlintrc.yml`から`sqlint.json`への自動変換
- **CLI後方互換**: 既存コマンド引数の維持
- **NPMパッケージ**: セマンティックバージョニング遵守

この戦略により、SQLintをBiomeのような統合開発ツールに進化させ、SQL開発者の生産性を大幅に向上させることができます。
