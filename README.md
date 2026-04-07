# JLPT 真題練習

日本語能力試験（JLPT）N1・N2 過去問題の練習アプリケーション。2010年〜2024年の全29回分の試験問題を収録。

## 機能

- **N1・N2 対応** — 全29回分 × 2レベル = 58セットの過去問題
- **4つの出題カテゴリ**
  - Type 1: 言語知識（文字・語彙） — 漢字の読み方、語彙問題
  - Type 2: 言語知識（文法） — 文法、文の組み立て問題
  - Type 3: 読解 — 長文読解問題（画像付き）
  - Type 4: 聴解 — リスニング問題（音声付き）
- **即時フィードバック** — 選択後に正解・不正解と中国語の解説を表示
- **進捗表示** — 回答済み問題数の表示、問題番号ナビゲーション
- **モバイル対応** — レスポンシブデザイン

## 技術スタック

| 技術 | 用途 |
|------|------|
| Vue 3 | UIフレームワーク |
| Vue Router 4 | SPA ルーティング |
| Vite | ビルドツール |
| Nginx | 本番サーバー |
| Docker | コンテナ化 |
| GCP Cloud Build | CI/CD |
| GCP Cloud Run | ホスティング |
| GCP Cloud Storage | 音声・画像ファイル配信 |

## プロジェクト構成

```
jlpt/
├── index.html                 # エントリーHTML
├── package.json
├── vite.config.js
├── Dockerfile                 # マルチステージビルド (Node → Nginx)
├── cloudbuild.yaml            # Cloud Build → Cloud Run デプロイ
├── nginx.conf                 # SPA対応 + 静的ファイルキャッシュ
└── src/
    ├── main.js                # アプリエントリーポイント
    ├── App.vue                # ルートコンポーネント
    ├── config/
    │   └── index.js           # GCP Bucket URL設定、カテゴリラベル
    ├── data/
    │   ├── index.js           # import.meta.glob による動的インポート
    │   ├── n1_201007.json     # N1 2010年7月
    │   ├── n1_201012.json     # N1 2010年12月
    │   ├── ...                # (全58ファイル)
    │   └── n2_202412.json     # N2 2024年12月
    ├── router/
    │   └── index.js           # / と /exam/:level/:time
    ├── composables/
    │   └── useExam.js         # 試験状態管理 (問題、回答、ナビゲーション)
    ├── views/
    │   ├── HomeView.vue       # ホーム画面：レベル・年月選択
    │   └── ExamView.vue       # 試験画面：カテゴリタブ + 問題表示
    ├── components/
    │   ├── TypeTabs.vue       # カテゴリ切替タブ (文字語彙/文法/読解/聴解)
    │   ├── QuestionNav.vue    # 問題番号ナビゲーション (正誤色分け)
    │   ├── QuestionCard.vue   # 問題カード (題文/選択肢/解説)
    │   └── AudioPlayer.vue    # 音声プレーヤー (聴解用)
    └── styles/
        └── main.css           # グローバルCSS、CSS変数
```

## データ構造

各JSONファイル (`{level}_{YYYYMM}.json`) の構造:

```json
{
  "type_1": [ /* 文字・語彙の問題配列 */ ],
  "type_2": [ /* 文法の問題配列 */ ],
  "type_3": [ /* 読解の問題配列 */ ],
  "type_4": [ /* 聴解の問題配列 */ ]
}
```

各問題のフィールド:

| フィールド | 型 | 説明 |
|-----------|------|------|
| `id` | number | 一意のID |
| `questionId` | number | 問題番号 |
| `type` | number | カテゴリ (1-4) |
| `bigTitle` | string (HTML) | セクション見出し（問題1、問題2...） |
| `question` | string (HTML) | 問題文 |
| `littleQuestion` | string / null | 補足問題文 |
| `article` | string / null | 読解用の長文 |
| `picture` | string / null | 画像パス (例: `pic/120241265.jpg`) |
| `audio` | string / null | 音声パス (例: `audio/202412n1/1.mp3`) |
| `option1` ~ `option4` | string | 選択肢 |
| `answer` | number | 正解 (1-4) |
| `assistant` | string (HTML) | 解説（中国語） |
| `assistantNew` | string (HTML) | 更新された解説 |
| `extending` | array | 組み合わせ問題の子問題 |
| `parentId` | number / null | 共通文章を持つ問題のグループID |

## 収録データ

| レベル | 期間 | 回数 | 問題数/回 |
|--------|------|------|-----------|
| N1 | 2010/07 〜 2024/12 | 29回 | 82〜88題 |
| N2 | 2010/07 〜 2024/12 | 29回 | 88〜92題 |

**合計: 58セット、約5,000問**

メディアリソース:
- 音声ファイル: 1,850個 (MP3, 約519MB)
- 画像ファイル: 77個 (JPG, 約14MB)

## セットアップ

### 前提条件

- Node.js 18+
- npm

### インストール

```bash
git clone <repository-url>
cd jlpt
npm install
```

### ローカル開発

```bash
npm run dev
```

ブラウザで http://localhost:5173/ を開く。

> **注意**: 聴解の音声と読解の一部画像はGCP Cloud Storageから配信されます。
> ローカル開発時に音声を再生するには、GCSバケットの設定が必要です。

### ビルド

```bash
npm run build
```

ビルド結果は `dist/` に出力されます。

### プレビュー

```bash
npm run preview
```

## GCPへのデプロイ

### 1. Cloud Storage（音声・画像）

```bash
# バケット作成
gsutil mb -l asia-northeast1 gs://YOUR_BUCKET_NAME

# 音声・画像をアップロード (jlpt-easy ディレクトリから)
gsutil -m cp -r audio/ gs://YOUR_BUCKET_NAME/audio/
gsutil -m cp -r pic/ gs://YOUR_BUCKET_NAME/pic/

# 公開アクセスを許可
gsutil iam ch allUsers:objectViewer gs://YOUR_BUCKET_NAME

# CORS設定 (ブラウザからの音声再生に必要)
cat > cors.json << 'EOF'
[
  {
    "origin": ["*"],
    "method": ["GET"],
    "responseHeader": ["Content-Type", "Content-Range"],
    "maxAgeSeconds": 3600
  }
]
EOF
gsutil cors set cors.json gs://YOUR_BUCKET_NAME
```

### 2. 環境変数の設定

ビルド時にバケットURLを指定:

```bash
VITE_GCP_BUCKET_URL=https://storage.googleapis.com/YOUR_BUCKET_NAME npm run build
```

または `cloudbuild.yaml` の Docker build に追加:

```yaml
- name: 'gcr.io/cloud-builders/docker'
  args:
    - 'build'
    - '--build-arg'
    - 'VITE_GCP_BUCKET_URL=https://storage.googleapis.com/YOUR_BUCKET_NAME'
    - '-t'
    - 'gcr.io/$PROJECT_ID/jlpt-app'
    - '.'
```

その場合、`Dockerfile` にも `ARG` を追加:

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
ARG VITE_GCP_BUCKET_URL
ENV VITE_GCP_BUCKET_URL=$VITE_GCP_BUCKET_URL
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
```

### 3. Cloud Build でデプロイ

```bash
gcloud builds submit --config cloudbuild.yaml
```

これにより:
1. Docker イメージをビルド
2. Container Registry にプッシュ
3. Cloud Run にデプロイ（asia-northeast1、未認証アクセス許可）

デプロイ後、Cloud Run が発行するURLでアクセス可能。

## ルーティング

| パス | 画面 | 説明 |
|------|------|------|
| `/` | ホーム | レベル (N1/N2) と年月の選択 |
| `/exam/:level/:time` | 試験 | 例: `/exam/n1/202412` → N1 2024年12月 |

## 設定

`src/config/index.js`:

```js
// GCSバケットURL (環境変数 VITE_GCP_BUCKET_URL で上書き可能)
export const GCP_BUCKET_URL = import.meta.env.VITE_GCP_BUCKET_URL
  || 'https://storage.googleapis.com/jlpt-assets'

// カテゴリラベル
export const TYPE_LABELS = {
  type_1: '文字・語彙',
  type_2: '文法',
  type_3: '読解',
  type_4: '聴解',
}
```

## データの取得方法

問題データは [easy-jlpt.com](https://easy-jlpt.com) のAPIから取得。

- **API**: `GET /api/practice?level={n1|n2}&time={YYYYMM}&type={1-4}`
- **レスポンス**: `{ code: 1, msg: "success", data: "<Base64 AES暗号文>" }`
- **復号方式**: AES-128-CBC + PKCS7パディング
  - Key (16 bytes): `j5x1z2xz2x3zz11`
  - IV (16 bytes): `aoxsa153xsd1ad51`
- **復号後**: JSON配列（問題リスト）

復号コード (Python):

```python
import base64, json
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding

KEY = b'j5x1z2xz2x3zz11'
IV  = b'aoxsa153xsd1ad51'

def decrypt(enc_b64):
    enc = base64.b64decode(enc_b64)
    cipher = Cipher(algorithms.AES(KEY), modes.CBC(IV))
    d = cipher.decryptor()
    result = d.update(enc) + d.finalize()
    unpadder = padding.PKCS7(128).unpadder()
    result = unpadder.update(result) + unpadder.finalize()
    return json.loads(result.decode('utf-8'))
```

音声・画像ファイルは `https://easy-jlpt.com/{path}` からダウンロード可能。

## ライセンス

このプロジェクトは学習目的で作成されています。JLPT試験問題の著作権は日本国際教育支援協会(JEES)および国際交流基金に帰属します。
