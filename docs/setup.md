# セットアップ手順

README に収まらない詳細手順をまとめています。

## 1. GitHub Pages で公開する

1. GitHub でリポジトリを作成し、`main` に push する
2. リポジトリの **Settings → Pages → Build and deployment → Source** を **GitHub Actions** にする
3. `main` への push で `.github/workflows/deploy.yml` が `npm ci → npm test → npm run build → deploy` を実行する
4. `https://<ユーザー名>.github.io/<リポジトリ名>/` で公開される

`BASE_PATH` はリポジトリ名から自動設定されます。ローカルで別のサブパスにしたい場合は `BASE_PATH=/my-repo/ npm run build`。

## 2. Claude で問題案を作る（開発者用 CLI）

アプリ内には AI 機能はありません。問題は開発者がリポジトリに追加し、全ユーザーに配信されます。その下書きを Claude に作らせる CLI です。

```bash
export ANTHROPIC_API_KEY=sk-ant-...
npm run generate -- --topic probability --count 5            # 難易度混合
npm run generate -- --topic permutation --count 3 --difficulty 3
npm run generate -- --topic reading --count 2 --model claude-sonnet-5 --no-verify
```

- 既存問題の例と既出問題文を渡して重複を避け、JSON Schema で構造化出力させ、アプリと同じバリデーションを通します
- 既定で「検算」を行います。解説を見せずにもう一度解かせ、正解が一致するかを各問に記録します（`// verify: OK` / `MISMATCH`）
- 出力先は `src/questions/drafts/<topic>-<日時>.ts`（git 管理外）。ID は該当分野の連番を自動採番します
- 内容を確認し、採用する問題を `src/questions/<category>/<topic>.ts` の配列へ移して `npm test` を通してからコミットしてください。MISMATCH の問題はそのまま採用しないこと

## 2.5 AI に質問する（Claude / OpenAI）

採点後の画面で、解説で足りない点を AI に質問できます（任意機能）。

1. **設定 → AIに質問** で使うサービス（Claude / OpenAI）を選ぶ
2. 「発行ページ」リンクから API キーを作成し、貼り付けて「キーを保存」
3. 「モデル一覧を取得」でキーを検証し、使いたいモデルを選ぶ（既定：Claude Opus 5 / GPT-5.4）
4. 問題に答えたあと、「AIに質問する」の定型ボタンか自由入力で質問。回答はストリーミング表示され、同じ問題内で会話を続けられます

仕組みと注意：

- キーはこのブラウザの IndexedDB にのみ保存されます。同期・書き出しの対象外で、各社の API 以外には送信されません
- 質問には問題文・選択肢・正解・解説・あなたの回答が文脈として渡されます。会話は保存されません
- 料金はキーの持ち主に課金されます
- **OAuth（ログインで連携）には対応していません。** Anthropic・OpenAI とも、第三者の Web アプリに API 利用を委譲する OAuth を公開していないためです。キーはブラウザごとに 1 回貼り付けてください

## 3. クラウド同期（Supabase）

未設定でも動きます。複数端末で履歴を共有したい場合のみ設定します。

1. [Supabase](https://supabase.com/) でプロジェクトを作成（無料枠で可）
2. **SQL Editor** で [supabase/schema.sql](../supabase/schema.sql) を実行（2 テーブル + Row Level Security）。以前の版で作成済みの場合は [supabase/migrations/](../supabase/migrations/) の SQL も実行
3. **Authentication → Providers** で Google / GitHub を有効化。各プロバイダの OAuth アプリのコールバック URL に Supabase が表示する `https://<project>.supabase.co/auth/v1/callback` を登録
4. **Authentication → URL Configuration → Redirect URLs** に公開 URL（例 `https://<user>.github.io/spilab/`）と `http://localhost:5173/spilab/` を追加
5. **Project Settings → API** の Project URL と anon key を設定
   - ローカル：`.env.local` に `VITE_SUPABASE_URL` と `VITE_SUPABASE_ANON_KEY`（[.env.example](../.env.example)）
   - GitHub Pages：**Settings → Secrets and variables → Actions → Variables** に `SUPABASE_URL` と `SUPABASE_ANON_KEY`
   - 有効にしたプロバイダだけボタンを出すには `VITE_AUTH_PROVIDERS`（Actions では `AUTH_PROVIDERS`）に `github` や `google,github` を設定（未設定なら両方表示）
6. デプロイ後、**設定 → クラウド同期** からログイン

仕組み：

- ログインは Supabase Auth の OAuth（PKCE）。パスワードは扱いません
- 回答は追記のみのレコードなので、ローカルとクラウドを「重複を除いた和集合」でマージします。競合は起きません
- 同期対象は回答履歴と設定
- 「学習履歴をすべて削除」はログイン中ならクラウド側も削除します

## 3.5 受検形式と英語

設定 → 出題 の「受検形式」で出題範囲を切り替えます。分野ごとに出題形式の属性（`formats`）を持ち、有効な形式に含まれる分野だけが出題されます。

- **テストセンター / WEBテスティング**（既定 ON）：熟語の成り立ち・語句の用法・空欄補充・整数・方程式 などテストセンター特有の分野を含む
- **ペーパーテスト**（既定 OFF）：物の流れと比率・グラフの領域を追加
- **英語（ENG）を含める**（既定 OFF）：同意語・反意語 / 空欄補充 / 英英辞典 / 誤文訂正 / 和文英訳 / 長文読解。ON のとき 1 回の出題のおよそ 6 分の 1 を英語に割り当て

分野と形式の対応は `src/questions/topics.ts` の `TOPICS` を参照。

## 4. 問題を追加する

問題は `src/questions/` 配下の TypeScript データファイルです。

```
src/questions/
  topics.ts      分野の定義と日本語ラベル
  index.ts       全問題の集約
  verbal/        言語
  nonverbal/     非言語
  english/       英語（ENG）
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
