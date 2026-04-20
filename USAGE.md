# Mekhaneth CLI 活用ガイド

このプロジェクトでは、キャラクター情報を YAML ファイルで一元管理し、各種ドキュメントを自動生成する仕組みを採用しています。

## 構成

- **`data/<world>/**/*.yaml`**: キャラクター情報の「正解（Source of Truth）」です。
- **`data/mekhaneth/`** と **`data/chaimsphere/`**: 世界観ごとのキャラクターデータ置き場です。
- **`data/vocal_cords/<world>/`**: 世界観ごとの音声リファレンス置き場です。
- **`base-settings/<world>/`**: 世界観ごとの設定資料・生成ドキュメント置き場です。
- **`base-settings/<world>/characters.md`**: YAML から自動生成される閲覧用のドキュメントです。
- **`base-settings/<world>/emotion_matrix.md`**: YAML から自動生成される相関図（感情表）です。

## 基本的な使い方

### 1. キャラクター情報を編集する

`data/<world>/` 配下にある各キャラクターの `.yaml` ファイルを直接編集してください。背景、外見、性格、他キャラクターへの感情などを記述できます。

現在は `mekhaneth` と `chaimsphere` を同列の世界観ディレクトリとして扱います。

### 2. ドキュメントを更新する（同期）

編集した内容を各世界観の `base-settings/<world>/characters.md` や `base-settings/<world>/emotion_matrix.md` に反映させるには、以下のコマンドを実行します。

```powershell
# CLIディレクトリへ移動
cd mekhaneth-cli

# ドキュメントをビルド
uv run python main.py build
```

## 技術的な詳細

- **環境管理**: [uv](https://github.com/astral-sh/uv) を使用しています。
- **言語**: Python 3.12+
- **依存ライブラリ**:
  - `ruamel.yaml`: コメントや順序を保持したまま YAML を操作します。
  - `jinja2`: Markdown のテンプレートエンジンとして使用しています。
  - `pandas`: 表形式データの処理に使用しています。

## 注意事項

> [!WARNING] > **手動編集の禁止**: `base-settings/<world>/characters.md` や `emotion_matrix.md` を手動で編集しないでください。ビルド時に YAML の内容で上書きされます。必ず `data/<world>/` 以下の YAML ファイルを編集してください。
