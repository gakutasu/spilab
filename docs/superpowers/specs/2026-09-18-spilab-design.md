# SPILAB 設計書（MVP）

作成日: 2026-09-18

要件はユーザー提供の仕様書（48章）に従う。本書はその仕様を満たすための技術設計と、仕様が委ねている判断の確定内容を記す。

## 1. 技術構成

- React 19 + TypeScript + Vite
- ルーティング: react-router-dom の `HashRouter`（GitHub Pages で SPA の 404 を回避）
- スタイル: 通常 CSS（CSS 変数 + メディアクエリ、Tailwind 不使用）
- 永続化: IndexedDB（`idb` ラッパー）。進行中セッションのみ localStorage
- テスト: Vitest（コアロジック）
- デプロイ: GitHub Actions → GitHub Pages（`actions/deploy-pages`）
- バックエンド・外部 API・解析ツールなし

## 2. ディレクトリ構成

```
src/
  main.tsx                 エントリ
  App.tsx                  ルーティング
  types.ts                 共有型（Question, AnswerRecord, ...）
  questions/
    index.ts               全問題を集約・エクスポート
    topics.ts              category / topic 定義と日本語ラベル
    verbal/*.ts            言語問題（topic 別ファイル）
    nonverbal/*.ts         非言語問題（topic 別ファイル）
    validate.ts            問題データのバリデーション関数
  core/                    純粋ロジック（React 非依存、テスト対象）
    mastery.ts             Mastery Score 計算
    stats.ts               問題別・分野別・全体集計
    evaluation.ts          得意/普通/苦手/未評価 判定
    selection.ts           出題アルゴリズム
    timeRatio.ts           解答時間評価
    session.ts             1 日のセッション状態の遷移
  storage/
    db.ts                  IndexedDB スキーマとアクセス
    sessionStore.ts        localStorage による進行中セッション保存
    exportImport.ts        JSON エクスポート/インポート
  hooks/
    useElapsed.ts          タイマー表示
    useHistory.ts          履歴の読み込み・購読
  pages/
    HomePage.tsx
    SessionPage.tsx        出題〜採点〜解説
    SummaryPage.tsx        今日の結果
    HistoryPage.tsx        学習履歴（全体・分野別）
    QuestionDetailPage.tsx 問題別履歴
    SettingsPage.tsx       設定・export/import/reset
  components/
    Explanation.tsx        解説の簡易レンダリング
    ...
  styles.css
scripts/                   （なし。バリデーションは vitest で実行）
.github/workflows/deploy.yml
```

## 3. データモデル

### Question

```ts
type Category = 'verbal' | 'nonverbal';

interface Question {
  id: string;                 // 一意。公開後は変更しない
  category: Category;
  topic: TopicId;             // topics.ts で定義
  subtopic?: string;
  difficulty: 1 | 2 | 3;
  question: string;           // 本文。長文読解は passage を含める
  passage?: string;           // 長文読解などの参照文
  choices: [string, string, string, string];
  correctChoice: 0 | 1 | 2 | 3;
  recommendedTime: number;    // 秒
  explanation: string;        // 簡易マークダウン（"## " 見出し、空行段落）
  tags: string[];
}
```

### AnswerRecord（学習履歴の最小単位）

```ts
type AnswerResult = 'correct' | 'incorrect' | 'unknown';

interface AnswerRecord {
  id?: number;                // IndexedDB autoIncrement
  questionId: string;
  timestamp: string;          // ISO 8601
  selectedChoice: number | null; // unknown のとき null
  result: AnswerResult;
  answerTimeMs: number;
}
```

派生値（masteryScore、正答率など）は保存せず、レコード列から常に再計算する。
これにより import / 問題データ更新の際に整合性が壊れない。

### Settings

```ts
interface Settings {
  questionsPerDay: number;    // 既定 7（5/7/10/15）
}
```

### ActiveSession（localStorage）

```ts
interface ActiveSession {
  date: string;               // YYYY-MM-DD（ローカル）
  questionIds: string[];
  currentIndex: number;
  phase: 'ready' | 'answering' | 'answered';
  startedAt: number | null;   // Date.now()。answering 時に必須
  lastResult?: { selectedChoice: number | null; result: AnswerResult; answerTimeMs: number };
  recordIds: number[];        // このセッションで保存した AnswerRecord の id
}
```

リロード時は ActiveSession を復元する。`answering` なら `startedAt` から経過時間を継続する。

### Export JSON

```ts
interface ExportData {
  app: 'spilab';
  version: 1;
  exportedAt: string;
  settings: Settings;
  answers: AnswerRecord[];
}
```

インポート時は `version` を確認し、既存レコードと **マージ**（同一 questionId + timestamp のレコードは重複追加しない）。

## 4. コアロジック

### 4.1 Mastery Score（問題単位・分野単位）

初期値 50。レコードを時系列順に適用し、0〜100 にクランプ。

| 状況 | 変化 |
| --- | ---: |
| 正解 & timeRatio ≤ 1.0 | +8 |
| 正解 & 1.0 < timeRatio ≤ 1.5 | +5 |
| 正解 & timeRatio > 1.5 | +2 |
| 不正解 | −7 |
| わからない | −10 |

`timeRatio = answerTimeMs / 1000 / recommendedTime`。

分野（topic）スコアは、その topic に属する全レコードを時系列順に同じ規則で適用したもの。
逐次適用のため直近の成績が強く反映される。

### 4.2 評価（得意/普通/苦手/未評価）

問題単位・分野単位とも同じ規則:

- 回答数 < 3 → `unrated`（未評価）
- score ≥ 75 → `strong`（得意）
- score < 45 → `weak`（苦手）
- それ以外 → `normal`（普通）

### 4.3 集計（stats.ts）

- 問題別: attemptCount / correctCount / incorrectCount / unknownCount / correctRate / averageAnswerTimeMs / lastAnsweredAt / consecutiveCorrect / consecutiveIncorrect / masteryScore / evaluation
- 分野別: 回答数 / 正解 / 不正解 / わからない / 正答率 / わからない率 / 平均解答時間 / 目安平均 / score / evaluation
- 全体: 総回答数 / 総正解数 / 正答率 / わからない率 / 平均解答時間 / 学習日数（timestamp のローカル日付のユニーク数）

問題データに存在しない questionId のレコードは集計から除外する（削除された問題への耐性）。

### 4.4 出題アルゴリズム（selection.ts）

入力: 全問題、全レコード、出題数 N、乱数生成器、現在時刻。

1. **カテゴリ配分**: N を言語/非言語に分ける。`floor(N/2)` と `ceil(N/2)` をその日の乱数でどちらに割り当てるか決める。
2. **クールダウン**: 各問題の最終回答日時を見て除外。
   - 基本: 3 日未満なら除外
   - 最終結果が `unknown`、または直近 2 回連続不正解: 1 日未満なら除外
   - 候補が不足する場合はクールダウンを解除して補充する
3. **バケット分け**: 問題が属する topic の評価で `weak / normal / unrated / strong` に分類。ただし未回答の問題は topic 評価に関係なく `unrated` に入れる。
4. **重み付き抽選**: バケット重みは 40 / 30 / 20 / 10。空のバケットは除外して重みを再正規化。
5. **バケット内優先度**: 問題ごとの優先度 = `1 + unknownCount*3 + incorrectCount*2 + (直近が遅い正解 ? 1 : 0)` を重みとした乱数抽選。
6. 同一問題は 1 セッション内で重複しない。同一 topic の連続をなるべく避ける（並び替え時に単純なシャッフル後、隣接同 topic を入れ替える程度）。

`selection.ts` は RNG を引数で受け取り、テストで決定的に検証する。

### 4.5 解答時間評価（timeRatio.ts）

- ≤ 1.0: 「速い / 適正」
- 1.0〜1.5: 「やや時間がかかっている」
- > 1.5: 「時間面でも要復習」

### 4.6 採点後フィードバック文

- 正解 & ≤1.0: 「正解！」+ 分野評価
- 正解 & >1.5: 「正解していますが、目安時間の N 倍かかっています。理解はできていますが、処理速度に改善余地があります。」
- 不正解: 「不正解」+ 正解表示 + 分野評価
- わからない: 「この問題は「解法未習得」として記録しました。今後、この分野を優先的に出題します。」

## 5. 画面

- `/` ホーム: 「今日のSPIを始める」（進行中なら「続きから」）、直近サマリ、ローカル保存の注意書き
- `/session` 出題〜採点〜解説（1 問ずつ、STEP 1: 問題をはじめる → STEP 2: 回答 → 採点/解説 → 次へ）
- `/summary` 今日の結果（正解/不正解/わからない、平均時間、得意/要復習/未評価）
- `/history` 学習履歴（全体 + 分野別テーブル + 問題別一覧）
- `/history/:questionId` 問題別詳細
- `/settings` 出題数、export、import、全削除（確認ダイアログ）

問題画面ではタイマー開始前に選択肢を操作不能にする（表示はする）。
「わからない」は選択肢と分離した独立ボタン。

## 6. タイマー

`startedAt = Date.now()` を ActiveSession に保存し、表示は `Date.now() - startedAt` を 250ms 間隔で再計算。
タブがバックグラウンドでも実時間が進む。「解答する」押下時に `answerTimeMs = Date.now() - startedAt` を確定。

## 7. 問題データのバリデーション

`src/questions/validate.ts` に純関数を置き、vitest（`questions.test.ts`）で全問題を検証:

- ID 重複なし、ID 形式 `^[a-z0-9-]+$`
- category が `verbal | nonverbal`、topic が topics.ts に存在し category と整合
- choices が 4 つ、空文字なし、重複なし
- correctChoice が 0〜3
- explanation が 40 文字以上
- recommendedTime > 0

開発モード起動時にも同関数を実行し、問題があれば `console.error` に出す。

## 8. デプロイ

`.github/workflows/deploy.yml`: `main` への push で `npm ci` → `npm test` → `npm run build`（`BASE_PATH=/<repo名>/`）→ Pages へデプロイ。
`vite.config.ts` は `process.env.BASE_PATH ?? '/spilab/'` を `base` に使う。

## 9. テスト方針

- core/ は全て純関数。Vitest で TDD。
- storage/ は薄いラッパーで、fake-indexeddb を使った最小テスト。
- UI は手動確認（dev server）。

## 10. 将来拡張への配慮

- AnswerRecord は最小構成で追記のみ。派生値は再計算 → スキーマ変更に強い
- Export に version → マイグレーション可能
- storage/ を差し替えればクラウド同期に移行可能
- topics.ts に追加すれば分野追加可能

## 11. AI 問題生成（追加仕様・2026-09-18）

ユーザー自身の Anthropic API キーで、ブラウザから直接 Claude を呼び出して問題を生成する。バックエンドは置かない。

- キーは IndexedDB の `secrets` ストアにのみ保存。export に含めない。
- `@anthropic-ai/sdk` を `dangerouslyAllowBrowser: true` で使用。既定モデル `claude-opus-5`（`claude-sonnet-5` / `claude-haiku-4-5` を選択可）。
- 生成: `client.beta.messages.create` + `output_config.format`（JSON Schema）。Opus 5 では `fallbacks: 'default'`（beta `server-side-fallback-2026-07-01`）を付ける。
- プロンプトには分野説明、既存問題の例（最大 2 問）、既出問題文の冒頭一覧（重複回避）、解説形式の規約を含める。
- 応答は `parseGeneratedPayload` で `Question` に変換し `validateQuestions` を通す。ID は `ai-<topic>-<base36 time>-<rand>`。
- 検算（任意・既定 ON）: 別呼び出しで解説なしに問題を解かせ、`answerIndex` が `correctChoice` と一致するか確認。不一致は UI で警告。
- 保存先は IndexedDB `generatedQuestions` ストア。実行時の問題バンクは `QuestionBankProvider` が組み込み + 生成をマージして提供する。
- export/import は `generatedQuestions` を含む（version は 1 のまま、フィールドは任意）。

## 12. クラウド同期（追加仕様・2026-09-19）

Supabase（Auth + Postgres + RLS）で複数端末の同期を提供する。未設定ビルドでは機能自体を表示しない。

- 認証: `signInWithOAuth`（google / github、PKCE）。redirect 先は `origin + BASE_URL`。HashRouter と共存させるため `?code=` を使う PKCE を採用し、セッション確立後に URL から `code` を除去
- テーブル: `answers`（unique: user_id, question_id, answered_at）、`generated_questions`（pk: user_id, id）、`settings`（pk: user_id）。すべて RLS で `auth.uid() = user_id`
- 同期（`storage/sync.ts` の `syncAll`）: ①`created_at > lastSyncAt` の回答を pull → `importAnswers` で重複除外、②生成問題を pull → `addGeneratedQuestions`、③初回同期のみ remote settings を適用、④ローカル全回答・生成問題・設定を upsert（`ignoreDuplicates`）、⑤watermark を localStorage に保存
- 即時 push: 回答保存・生成問題保存/削除・設定変更のたびに `SyncProvider` の after-hook が push。失敗は画面上のエラー表示のみで、次回 `syncAll` が補完
- 「学習履歴をすべて削除」はログイン中ならクラウド側も削除（確認文に明記）
- API キーはローカルの `secrets` ストアのみ。同期・export とも対象外
