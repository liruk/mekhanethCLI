# Mekhaneth CLI 活用ガイド

このプロジェクトでは、キャラクター情報を YAML ファイルで一元管理し、各種ドキュメントを自動生成する仕組みを採用しています。

## 構成

- **`data/characters/*.yaml`**: キャラクター情報の「正解（Source of Truth）」です。
- **`base-settings/characters.md`**: YAML から自動生成される閲覧用のドキュメントです。
- **`base-settings/emotion_matrix.md`**: YAML から自動生成される相関図（感情表）です。

## 基本的な使い方

### 1. キャラクター情報を編集する

`data/characters/` 内にある各キャラクターの `.yaml` ファイルを直接編集してください。背景、外見、性格、他キャラクターへの感情などを記述できます。

### 2. ドキュメントを更新する（同期）

編集した内容を `characters.md` や `emotion_matrix.md` に反映させるには、以下のコマンドを実行します。

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

> [!WARNING] > **手動編集の禁止**: `base-settings/characters.md` や `emotion_matrix.md` を手動で編集しないでください。ビルド時に YAML の内容で上書きされます。必ず `data/characters/` 以下の YAML ファイルを編集してください。
