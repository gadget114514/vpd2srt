# VPD to SRT - 字幕変換ツール

VPDファイル（ビデオ編集プロジェクトファイル）からSRT形式の字幕ファイルを生成するツールです。デスクトップ用のElectronアプリと、インストール不要でブラウザからそのまま使えるWeb版（GitHub Pages）の両方を用意しています。

## Web版（GitHub Pages）

インストール不要でブラウザから利用できます：

**https://gadget114514.github.io/vpd2srt/**

`docs/` 以下がWeb版のソースです。VPDファイルの読み込みはファイル選択ダイアログ、保存はブラウザのダウンロードとして動作します（Electron版のディレクトリ指定保存機能はブラウザのサンドボックス制約により省略しています）。

## 機能

- 📁 VPDファイルの読み込み
- 🔍 字幕の検索・フィルタリング
- 📝 SRT形式での字幕生成
- 💾 SRTファイルの保存
- 📋 クリップボードへのコピー
- 📊 リアルタイムプレビュー

## インストール

```bash
npm install
```

## 実行

開発モード：
```bash
npm start
```

## 使い方

1. **VPDファイルを開く** - 「📁 VPDファイルを開く」ボタンをクリック
2. **字幕をプレビュー** - 読み込まれた字幕がリストに表示されます
3. **検索** - 検索ボックスで字幕を絞り込み
4. **SRTを生成** - 「✨ SRTを生成」ボタンをクリック
5. **保存またはコピー** - 「💾 保存」または「📋 コピー」で出力

## VPDファイル形式

VPDファイルはJSON形式で、以下の構造を持ちます：

```json
{
  "timeline": {
    "subitems": [
      {
        "type": "SubtitleTrack",
        "subitems": [
          {
            "type": "TextEffectBlock",
            "tstart": 0.0,
            "tduration": 5000.0,
            "attribute": {
              "text": "字幕テキスト"
            }
          }
        ]
      }
    ]
  }
}
```

## 技術スタック

- Electron - デスクトップアプリケーション
- Node.js - バックエンド処理
- Vanilla JavaScript - UI処理
- CSS3 - スタイリング

## ファイル構成

```
vpd-to-srt/
├── package.json              # プロジェクト設定
├── main.js                   # Electronメインプロセス
├── preload.js                # セキュリティプリロード
├── src/
│   ├── index.html            # UIテンプレート
│   ├── styles.css            # スタイルシート
│   ├── renderer.js           # レンダラープロセス
│   ├── vpd-parser.js         # VPD解析モジュール
│   └── srt-generator.js      # SRT生成モジュール
└── README.md                 # このファイル
```

## 開発

プロジェクト構成：

- **main.js**: Electronメインプロセス、ウィンドウ管理、IPC処理
- **preload.js**: セキュリティコンテキストの設定
- **vpd-parser.js**: VPDファイルをパースし字幕情報を抽出
- **srt-generator.js**: 字幕データをSRT形式に変換
- **renderer.js**: UIの動作ロジック

## ライセンス

MIT

## 注意

- タイムスタンプはミリ秒単位で処理されます
- 複数の字幕トラックがある場合は、最初のトラックを処理します
- SRT形式はUTF-8エンコーディングで保存されます
