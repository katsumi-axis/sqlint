# SQLint ルール一覧

このドキュメントは、SQLintで利用可能なすべてのルールについて説明します。

## 目次
- [実装済みルール](#実装済みルール)
  - [no-select-star](#no-select-star)
  - [keyword-case](#keyword-case)
  - [table-alias](#table-alias)
- [設定方法](#設定方法)
- [ルールの重要度](#ルールの重要度)

## 実装済みルール

### no-select-star

**目的**: `SELECT *` の使用を禁止し、明示的なカラム指定を推奨します。

**検出対象**:
- `SELECT *` のすべての使用
- `SELECT table.*` 形式（例: `SELECT u.*`）
- メインクエリ、サブクエリ、CTE、UNION内での使用

**理由**:
- パフォーマンスの最適化（必要なカラムのみ取得）
- コードの可読性向上（使用カラムが明確）
- スキーマ変更への耐性（カラム追加時の予期しない動作を防止）

**設定例**:
```yaml
rules:
  no-select-star: error    # エラーとして扱う
  no-select-star: warning  # 警告として扱う（デフォルト）
  no-select-star: false    # ルールを無効化
```

**違反例**:
```sql
-- ❌ 悪い例
SELECT * FROM users;
SELECT u.* FROM users u;
SELECT * FROM orders WHERE status = 'active';
```

**正しい例**:
```sql
-- ✅ 良い例
SELECT id, name, email FROM users;
SELECT u.id, u.name FROM users u;
SELECT order_id, total FROM orders WHERE status = 'active';
```

### keyword-case

**目的**: SQLキーワードの大文字表記を統一します。

**検出対象**:
- 小文字または混在した大文字小文字のSQLキーワード
- 対象キーワード: SELECT, FROM, WHERE, JOIN, LEFT, RIGHT, INNER, OUTER, ON, AND, OR, NOT, IN, EXISTS, BETWEEN, LIKE, IS, NULL, ORDER, BY, GROUP, HAVING, LIMIT, OFFSET, UNION, INSERT, INTO, VALUES, UPDATE, SET, DELETE, CREATE, TABLE, ALTER, DROP, INDEX, VIEW, AS

**理由**:
- コードの一貫性維持
- SQLキーワードと識別子の視覚的区別
- チーム内でのコーディング規約統一

**設定例**:
```yaml
rules:
  keyword-case: error    # エラーとして扱う
  keyword-case: warning  # 警告として扱う（デフォルト）
  keyword-case: false    # ルールを無効化
```

**違反例**:
```sql
-- ❌ 悪い例
select * from users;
Select id From users Where active = true;
SELECT id FROM users where active = true;
```

**正しい例**:
```sql
-- ✅ 良い例
SELECT * FROM users;
SELECT id FROM users WHERE active = true;
INSERT INTO users (name, email) VALUES ('John', 'john@example.com');
```

**注意**: 文字列内のキーワードは無視されます
```sql
-- これはOK（文字列内なので）
SELECT 'select this text' FROM users;
```

### table-alias

**目的**: テーブルエイリアスが意味のある長さであることを保証します。

**検出対象**:
- 1文字のテーブルエイリアス（短すぎる）
- 30文字を超えるテーブルエイリアス（長すぎる）
- FROM句およびJOIN句のテーブルに適用

**理由**:
- 可読性の向上（`u` より `usr` や `users` の方が明確）
- 保守性の向上（エイリアスから元のテーブルを推測しやすい）
- 複雑なクエリでの混乱を防止

**設定例**:
```yaml
rules:
  table-alias: error    # エラーとして扱う
  table-alias: warning  # 警告として扱う
  table-alias: info     # 情報として扱う（デフォルト）
  table-alias: false    # ルールを無効化
```

**違反例**:
```sql
-- ❌ 悪い例
SELECT u.id FROM users u;  -- 1文字エイリアス
SELECT o.id FROM orders o JOIN users u ON o.user_id = u.id;  -- 両方とも1文字
SELECT long.id FROM users very_long_table_alias_that_exceeds_thirty_chars;  -- 30文字超
```

**正しい例**:
```sql
-- ✅ 良い例
SELECT usr.id FROM users usr;  -- 3文字エイリアス
SELECT usr.id FROM users usr;  -- 意味のあるエイリアス
SELECT ord.id FROM orders ord JOIN users usr ON ord.user_id = usr.id;
SELECT cust.id FROM customers cust;  -- 略語だが意味が明確
```

## 設定方法

### 設定ファイルの作成

```bash
pnpm run sqlint --init
```

これにより `.sqlintrc.yml` が作成されます。

### 設定ファイルフォーマット

**YAML形式** (`.sqlintrc.yml`):
```yaml
rules:
  no-select-star: warning
  keyword-case: error
  table-alias: info
```

**JSON形式** (`.sqlintrc.json`):
```json
{
  "rules": {
    "no-select-star": "warning",
    "keyword-case": "error",
    "table-alias": "info"
  }
}
```

**JavaScript形式** (`sqlint.config.js`):
```javascript
module.exports = {
  rules: {
    'no-select-star': 'warning',
    'keyword-case': 'error',
    'table-alias': 'info'
  }
};
```

### ルールの設定形式

各ルールは以下の形式で設定できます：

```yaml
# ブール値
rule-name: true   # デフォルトの重要度で有効化
rule-name: false  # 無効化

# 文字列（重要度のみ）
rule-name: error
rule-name: warning
rule-name: info

# 配列（将来の拡張用）
rule-name: [error]  # 重要度のみ
# rule-name: [warning, { option: value }]  # 将来的にオプション対応時
```

## ルールの重要度

### error（エラー）
- 修正が必須の問題
- CLIの終了コードが1になる
- CI/CDでビルドを失敗させる

### warning（警告）
- 修正を推奨する問題
- CLIの終了コードは0のまま
- 開発者への注意喚起

### info（情報）
- 参考情報として表示
- CLIの終了コードは0のまま
- コード品質向上のための提案

## デフォルト設定

すべてのルールのデフォルト設定：

```yaml
rules:
  no-select-star: warning
  keyword-case: warning
  table-alias: info
```

## カスタム設定例

### 厳格な設定
```yaml
rules:
  no-select-star: error    # SELECT * を完全に禁止
  keyword-case: error      # キーワードの大文字化を強制
  table-alias: warning     # エイリアスの長さを警告レベルで
```

### 緩い設定
```yaml
rules:
  no-select-star: info     # SELECT * を情報として表示
  keyword-case: warning    # キーワードは警告のみ
  table-alias: false       # エイリアスチェックを無効化
```

### 特定ルールのみ有効化
```yaml
rules:
  no-select-star: error
  keyword-case: false
  table-alias: false
```