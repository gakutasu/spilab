# セットアップ手順

README に収まらない詳細手順をまとめています。

## 1. GitHub Pages で公開する

1. GitHub でリポジトリを作成し、`main` に push する
2. リポジトリの **Settings → Pages → Build and deployment → Source** を **GitHub Actions** にする
3. `main` への push で `.github/workflows/deploy.yml` が `npm ci → npm test → npm run build → deploy` を実行する
4. `https://<ユーザー名>.github.io/<リポジトリ名>/` で公開される

`BASE_PATH` はリポジトリ名から自動設定されます。ローカルで別のサブパスにしたい場合は `BASE_PATH=/my-repo/ npm run build`。

## 2. AI 問題生成（Anthropic API）

1. [Anthropic Console](https://console.anthropic.com/) で API キーを発行する
2. アプリの **設定 → AI問題生成** に API キーを保存し、モデルを選ぶ（既定は Claude Opus 5）
3. **AI作成** 画面で分野・作成数・難易度を選び「生成する」
4. 生成結果を確認し、問題ごとに「保存」または「破棄」

- API キーはこのブラウザの IndexedDB にのみ保存され、Anthropic API 以外には送信されません。書き出し JSON・クラウド同期にも含まれません
- 生成は JSON Schema の構造化出力を使い、アプリ側でも問題データを検証します
- 「検算」を有効にすると、解説を見せずにもう一度解かせて正解の一致を確認します。不一致には警告が付きます
- 保存した問題は通常の出題・履歴・評価の対象になります（ID は `ai-<分野>-…`）
- API 利用料金はキーの持ち主に課金されます

## 3. クラウド同期（Supabase）

未設定でも動きます。複数端末で履歴を共有したい場合のみ設定します。

1. [Supabase](https://supabase.com/) でプロジェクトを作成（無料枠で可）
2. **SQL Editor** で [supabase/schema.sql](../supabase/schema.sql) を実行（3 テーブル + Row Level Security）
3. **Authentication → Providers** で Google / GitHub を有効化。各プロバイダの OAuth アプリのコールバック URL に Supabase が表示する `https://<project>.supabase.co/auth/v1/callback` を登録
4. **Authentication → URL Configuration → Redirect URLs** に公開 URL（例 `https://<user>.github.io/spilab/`）と `http://localhost:5173/spilab/` を追加
5. **Project Settings → API** の Project URL と anon key を設定
   - ローカル：`.env.local` に `VITE_SUPABASE_URL` と `VITE_SUPABASE_ANON_KEY`（[.env.example](../.env.example)）
   - GitHub Pages：**Settings → Secrets and variables → Actions → Variables** に `SUPABASE_URL` と `SUPABASE_ANON_KEY`
6. デプロイ後、**設定 → クラウド同期** からログイン

仕組み：

- ログインは Supabase Auth の OAuth（PKCE）。パスワードは扱いません
- 回答は追記のみのレコードなので、ローカルとクラウドを「重複を除いた和集合」でマージします。競合は起きません
- 同期対象は回答履歴・AI 生成問題・設定。Anthropic API キーは同期しません
- 「学習履歴をすべて削除」はログイン中ならクラウド側も削除します

## 4. 問題を追加する

問題は `src/questions/` 配下の TypeScript データファイルです。

```
src/questions/
  topics.ts      分野の定義と日本語ラベル
  index.ts       全問題の集約
  verbal/        言語
  nonverbal/     非言語
```

既存分野に追加する場合は該当ファイルの配列に要素を足します。

```ts
{
  id: 'nonverbal-probability-012',   // 一意。公開後は変更しない
  category: 'nonverbal',
  topic: 'probability',
  subtopic: 'dice',
  difficulty: 2,                      // 1〜3
  question: '2個のサイコロを同時に振るとき、出た目の和が7になる確率は？',
  choices: ['1/6', '1/9', '1/12', '5/36'],
  correctChoice: 0,                   // 0〜3（A〜D）
  recommendedTime: 60,                // 目安時間（秒）
  explanation: `## 解き方

...考え方・式・途中計算・答え...

## ポイント

...間違えやすい点...`,
  tags: ['確率', 'サイコロ'],
}
```

解説は `## ` 見出し、空行区切りの段落、`- ` 箇条書きが使えます。「何の問題か → 考え方 → 式 → 途中計算 → 答え → ポイント」の順で書いてください。

新しい分野は `topics.ts` の `TopicId` / `TOPICS` に追加し、ファイルを作って `index.ts` に登録します。

`npm test` で以下を検証します（開発サーバー起動時にも実行し、問題があればコンソールに出力）。

- ID の重複なし・形式 `^[a-z0-9-]+$`
- 選択肢がちょうど 4 つ、空・重複なし
- `correctChoice` が 0〜3
- 解説が 40 文字以上
- `recommendedTime` が正の数
- `category` と `topic` が定義済みで整合
- 各分野 8 問以上

## 5. 学習ロジック

- **Mastery Score**：初期 50。正解（目安時間以内）+8、正解（1〜1.5 倍）+5、正解（1.5 倍超）+2、不正解 −7、わからない −10。0〜100
- **評価**：回答 3 回未満は未評価。75 以上で得意、45 未満で苦手、それ以外は普通
- **再出題間隔**：同じ問題は原則 3 日空ける。「わからない」や 2 回連続不正解は 1 日で再出題可
- **出題配分の目安**：苦手 40％ / 普通 30％ / 未評価 20％ / 得意 10％。言語・非言語を偏らせず、1 回の中で同じ分野を避ける

詳細は [superpowers/specs/](superpowers/specs/) の設計書を参照。
