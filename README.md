# SPILAB

転職活動向けの SPI 対策を目的とした、個人学習用 Web アプリです。

1 問ずつ出題し、「正解した／間違えた／わからなかった／解答に何秒かかったか」を記録します。
その履歴から分野ごとの得意・不得意を推定し、次回以降は苦手分野を優先して出題します。

## URL

GitHub Pages で公開します。

```
https://<GitHubユーザー名>.github.io/<リポジトリ名>/
```

リポジトリ名が `spilab` の場合は `https://<GitHubユーザー名>.github.io/spilab/` です。

## 特徴

- **1 問ごとに採点**：「問題をはじめる」でタイマー開始 → 回答 → 「解答する」で採点・詳細解説
- **「わからない」ボタン**：当てずっぽうの正解を学習データに混ぜないため、不正解とは別に「解法未習得」として記録
- **解答時間の記録**：各問題の目安時間と比較し、「正解したが遅い」を区別
- **習熟度（Mastery Score）**：問題ごと・分野ごとに 0〜100 で管理し、得意／普通／苦手／未評価を判定
- **苦手優先の出題**：苦手 40％ / 普通 30％ / 未評価 20％ / 得意 10％ を目安に、言語・非言語を偏らせず出題
- **学習履歴画面**：全体・分野別・問題別の統計
- **JSON エクスポート／インポート**：別の端末やブラウザへ学習履歴と AI 生成問題を移行
- **AI 問題生成（任意）**：自分の Anthropic API キーを設定すると、ブラウザから直接 Claude に新しい問題を作らせて問題バンクに追加できる
- **完全ローカル**：バックエンドなし、解析ツールなし。学習履歴はブラウザ内にのみ保存

## 学習履歴の保存場所

**学習履歴はこのブラウザに保存されます。** サーバーには送信されません。

ブラウザのデータを消去したり、別の端末・ブラウザを使ったりすると履歴は引き継がれません。
設定画面の「学習データを書き出す」で JSON を保存し、「学習データを読み込む」で復元してください。

## AI で問題を作る（任意機能）

「AI作成」画面から、Claude に SPI 問題を生成させて問題バンクに追加できます。

1. [Anthropic Console](https://console.anthropic.com/) で API キーを発行する
2. アプリの **設定 → AI問題生成** に API キーを保存し、モデルを選ぶ（既定は Claude Opus 5）
3. **AI作成** 画面で分野・作成数・難易度を選び「生成する」を押す
4. 生成結果を確認し、問題ごとに「保存」または「破棄」を選ぶ

仕組みと注意点：

- API キーはこのブラウザの IndexedDB にのみ保存され、Anthropic API 以外には送信されません。書き出し JSON にも含まれません。
- 生成には構造化出力（JSON Schema）を使い、アプリ側でも問題データのバリデーションを行います。
- 「検算」を有効にすると、生成とは別の呼び出しで解説を見せずに問題を解かせ、正解が一致するかを確認します。不一致の問題には警告が付くので、保存前に内容を確認してください。
- 保存した問題は通常の出題・履歴・得意不得意判定の対象になります（問題 ID は `ai-<分野>-…`）。削除は AI作成画面または設定画面から行えます。
- API 利用料金はキーの持ち主に課金されます。1 回の生成でモデルに応じた費用が発生します。

## 開発環境

- Node.js 22 以上（開発時は 24 で確認）
- npm
- React 19 / TypeScript 5 / Vite 8 / Vitest 5
- react-router-dom（HashRouter）/ idb（IndexedDB）/ @anthropic-ai/sdk（AI 問題生成）

## 起動方法

```bash
npm install
npm run dev
```

`http://localhost:5173/spilab/` で開きます。

## テスト・型チェック

```bash
npm test            # Vitest（ロジックと問題データの検証）
npm run typecheck   # tsc --noEmit
npm run validate    # 問題データのバリデーションのみ
```

## build 方法

```bash
npm run build       # 型チェック + vite build → dist/
npm run preview     # dist/ をローカル確認
```

公開先のサブパスは環境変数 `BASE_PATH` で指定します（既定は `/spilab/`）。

```bash
BASE_PATH=/my-repo/ npm run build
```

## GitHub Pages へのデプロイ

`.github/workflows/deploy.yml` により、`main` ブランチへ push すると自動で build と deploy が行われます。
`BASE_PATH` はリポジトリ名から自動で設定されます。

初回のみ、GitHub リポジトリの設定が必要です。

1. リポジトリの **Settings → Pages** を開く
2. **Build and deployment → Source** を **GitHub Actions** にする
3. `main` に push する（または Actions タブから `Deploy to GitHub Pages` を手動実行）

## 問題の追加方法

問題は `src/questions/` 配下の TypeScript データファイルで管理しています。アプリのロジックとは分離されています。

```
src/questions/
  topics.ts            分野（topic）の定義と日本語ラベル
  index.ts             全問題を集約
  verbal/              言語（語彙・二語関係・熟語・語句の意味・文の並べ替え・長文読解）
  nonverbal/           非言語（割合・損益・速度・仕事算・順列・組合せ・確率・推論・集合・表の読み取り・資料読み取り）
```

### 既存の分野に問題を追加する

該当する分野のファイル（例：`src/questions/nonverbal/probability.ts`）の配列に要素を追加します。

```ts
{
  id: 'nonverbal-probability-006',      // 一意。公開後は変更しない
  category: 'nonverbal',
  topic: 'probability',
  subtopic: 'dice',
  difficulty: 2,                         // 1〜3
  question: '2個のサイコロを同時に振るとき、出た目の和が7になる確率は？',
  choices: ['1/6', '1/9', '1/12', '5/36'],
  correctChoice: 0,                      // 0〜3（A〜D）
  recommendedTime: 60,                   // 目安時間（秒）
  explanation: `## 解き方

...考え方・式・途中計算・答え...

## ポイント

...間違えやすい点...`,
  tags: ['確率', 'サイコロ'],
}
```

解説は `## ` で始まる見出し、空行区切りの段落、`- ` で始まる箇条書きが使えます。
「何の問題か → 考え方 → 式 → 途中計算 → 答え → ポイント」の順で、十分に詳しく書いてください。

### 新しい分野を追加する

1. `src/questions/topics.ts` の `TopicId` と `TOPICS` に分野を追加する
2. `src/questions/verbal/` または `nonverbal/` にファイルを作り、`Question[]` をエクスポートする
3. `src/questions/index.ts` の配列に追加する

### バリデーション

`npm test`（または `npm run validate`）で以下を検証します。開発サーバー起動時にも同じ検証を行い、問題があればブラウザのコンソールに出力します。

- ID の重複がない・形式が `^[a-z0-9-]+$` である
- 選択肢がちょうど 4 つで、空・重複がない
- `correctChoice` が 0〜3 である
- 解説が 40 文字以上ある
- `recommendedTime` が正の数である
- `category` と `topic` が定義済みで整合している

## 学習ロジックの概要

- **Mastery Score**：初期値 50。正解（目安時間以内）+8、正解（1〜1.5 倍）+5、正解（1.5 倍超）+2、不正解 −7、わからない −10。0〜100 に収める
- **評価**：回答数 3 未満は未評価。75 以上で得意、45 未満で苦手、それ以外は普通
- **再出題の間隔**：同じ問題は原則 3 日空ける。「わからない」や 2 回連続不正解の問題は 1 日で再出題可
- **出題優先度**：わからない回数 → 不正解回数 → 遅い正解 → 未評価 → 得意 の順に高い

詳細は `docs/superpowers/specs/` の設計書を参照してください。

## ライセンス

MIT License。詳細は [LICENSE](LICENSE) を参照してください。
