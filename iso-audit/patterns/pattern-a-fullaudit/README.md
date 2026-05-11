# Pattern A: Full Audit (audit_logs + revisions + history)

ISO 9001 対応の履歴機能を実装する1つのパターン。

## 構成
- `audit_logs` (トップレベル): 全変更の索引（誰が・いつ・どこを）
- `{collection}/{id}/revisions` (サブコレクション): 変更前スナップショット
- `records/{id}/history` (サブコレクション): 業務記録専用の時系列タイムライン

3系統を組み合わせた最も網羅的なパターン。

## このパターンが向く案件
- ISO 9001 / 27001 認証取得を目指す
- 監査時に「期間×ユーザー×コレクション」の横断検索が必要
- フルデジタル運用前提

## 向かない案件
- 紙運用ハイブリッド
- 履歴の量より「直近1〜2版が見えれば十分」な案件
- Firestore 書き込みコストを抑えたい案件（全更新で2〜3書き込み増える）

## トレードオフ
- 完全な変更履歴と復元が可能
- ただし `revisions` (before) と `history` (after) は本質的に冗長
- シンプル化するなら `audit_logs + revisions` の2系統で十分

## 既知の課題（参考実装から引き継ぐべき改善点）
- `reason`（変更理由）フィールド未実装 → ISO 9001 8.5.6 観点で追加必須
- 承認ワークフロー未実装 → ISO 9001 7.5.2 観点で重要文書には必須
- 書き込み失敗時のリトライ・DLQ 未実装 → 完全性保証のため要検討
- `audit_logs` と `revisions` 書き込みが分離 → アトミック化推奨

## ファイル一覧
- `record.ts.example` - audit_logs / revisions への書き込みロジック
- `get-audit-logs.ts.example` - audit_logs 検索 Callable
- `config.ts.example` - 有効化フラグ + 機密フィールド除外設定
- `records-config.ts.example` - history 有効化フラグ
- `on-record-update.ts.example` - records/{id}/history 書き込み trigger
- `RecordHistoryPage.tsx.example` - 履歴一覧 UI（444行）
- `types.ts.example` - AuditLogData / RevisionData 型定義
- `indexes.example.json` - Firestore インデックス設定
- `excluded-fields.md` - 機密フィールド除外の考え方

## 使い方
**コピペでは使わない**。案件の事情に合わせて再設計する前提。
本実装は「3系統揃えるとこうなる」の参照点として扱う。

## 補足
本実装は EmulsiaBuildTemplate の標準実装を抽出したもの。
2026年5月の方針変更でテンプレ標準から分離した。
