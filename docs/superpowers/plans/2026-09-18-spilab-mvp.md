# SPILAB MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** SPI 対策用の学習 Web アプリ（1 問ずつ出題・個別採点・履歴保存・苦手優先出題）を GitHub Pages で動く形で完成させる。

**Architecture:** React + TypeScript の SPA。`src/core/` に React 非依存の純粋ロジック（mastery / stats / evaluation / selection）を置き Vitest で TDD。`src/storage/` が IndexedDB（idb）と localStorage を隠蔽。`src/questions/` は問題データのみ。ページは HashRouter で切替。

**Tech Stack:** Vite 7 / React 19 / TypeScript 5 / react-router-dom 7 / idb 8 / Vitest 3 / fake-indexeddb（テスト）

**Spec:** `docs/superpowers/specs/2026-09-18-spilab-design.md`（設計）、`docs/superpowers/specs/2026-09-18-spilab-requirements.md`（要件原文）

## Global Constraints

- バックエンド・外部 API・解析ツール・有料サービスなし
- 学習履歴はブラウザローカルのみ。アプリ内と README に「学習履歴はこのブラウザに保存されます」を表示
- 問題 ID は一意、公開後は変更しない
- 「わからない」は独立ボタン。`result: 'unknown'` として不正解と区別
- 解答時間はミリ秒保存、UI は秒表示
- Mastery Score: 初期 50、+8 / +5 / +2 / −7 / −10、0〜100 クランプ
- 評価: 回答数 < 3 → 未評価、≥75 → 得意、<45 → 苦手、それ以外 → 普通
- 出題比率目安: 苦手 40 / 通常 30 / 未評価 20 / 得意 10
- クールダウン: 基本 3 日、わからない・連続不正解は 1 日
- タイマーは `Date.now()` の差分。リロード時に復元
- レスポンシブ（PC / スマホ）
- コード内コメントは英語、最小限
- `vite build` はこのセッションでは実行しない（ユーザーのグローバル設定）。検証は `tsc --noEmit` + `vitest` + dev server

---

### Task 1: プロジェクト雛形

**Files:**
- Create: `package.json`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `vite.config.ts`, `vitest.config.ts`, `index.html`, `.gitignore`, `src/main.tsx`, `src/App.tsx`, `src/styles.css`, `src/vite-env.d.ts`

**Interfaces:**
- Produces: `npm run dev`, `npm test`（vitest run）, `npm run typecheck`（tsc --noEmit -p tsconfig.app.json）, `npm run build`
- `vite.config.ts` は `base: process.env.BASE_PATH ?? '/spilab/'`

- [ ] **Step 1:** `npm create vite@latest . -- --template react-ts` 相当の構成を手書き（対話回避）。依存: react, react-dom, react-router-dom, idb。dev: typescript, vite, @vitejs/plugin-react, vitest, fake-indexeddb, @types/react, @types/react-dom
- [ ] **Step 2:** `npm install`
- [ ] **Step 3:** `src/App.tsx` に HashRouter と `<h1>SPILAB</h1>` のみ。`npm run typecheck` が通ることを確認
- [ ] **Step 4:** `src/core/smoke.test.ts`（`expect(1+1).toBe(2)`）で `npm test` が動くことを確認し、確認後に削除
- [ ] **Step 5:** Commit `chore: scaffold vite react ts project`

### Task 2: 型・分野定義・問題スキーマ・バリデーション

**Files:**
- Create: `src/types.ts`, `src/questions/topics.ts`, `src/questions/validate.ts`, `src/questions/index.ts`, `src/questions/verbal/wordRelation.ts`（サンプル 1 問）, `src/questions/nonverbal/permutation.ts`（サンプル 1 問）
- Test: `src/questions/validate.test.ts`, `src/questions/questions.test.ts`

**Interfaces:**
```ts
// types.ts
export type Category = 'verbal' | 'nonverbal';
export type AnswerResult = 'correct' | 'incorrect' | 'unknown';
export type Evaluation = 'strong' | 'normal' | 'weak' | 'unrated';
export interface Question { id; category; topic: TopicId; subtopic?; difficulty: 1|2|3; question; passage?; choices: [string,string,string,string]; correctChoice: 0|1|2|3; recommendedTime; explanation; tags: string[] }
export interface AnswerRecord { id?: number; questionId; timestamp: string; selectedChoice: number|null; result: AnswerResult; answerTimeMs: number }
export interface Settings { questionsPerDay: number }
// topics.ts
export const TOPICS: Record<TopicId, { category: Category; label: string }>
export type TopicId = 'vocabulary'|'word_relation'|'idiom'|'word_meaning'|'sentence_order'|'reading'|'ratio'|'profit_loss'|'speed'|'work_rate'|'permutation'|'combination'|'probability'|'inference'|'set'|'table_reading'|'data_reading'
export const CATEGORY_LABEL: Record<Category, string> // 言語 / 非言語
// validate.ts
export function validateQuestions(questions: Question[]): string[] // 空配列なら OK
// index.ts
export const questions: Question[]; export const questionMap: Map<string, Question>
```

- [ ] **Step 1:** `validate.test.ts` を書く: 重複 ID / 選択肢 3 つ / correctChoice 4 / 短い解説 / recommendedTime 0 / 不正 topic / category と topic 不整合 のそれぞれでエラー文字列が返る、正常データで `[]`
- [ ] **Step 2:** 失敗を確認 → `validate.ts` 実装 → 通過
- [ ] **Step 3:** `questions.test.ts`: `validateQuestions(questions)` が `[]`、各 topic に 1 問以上（この時点では skip 可、Task 10 で有効化）
- [ ] **Step 4:** Commit `feat: add question schema, topics and validation`

### Task 3: Mastery Score と時間評価

**Files:**
- Create: `src/core/timeRatio.ts`, `src/core/mastery.ts`
- Test: `src/core/timeRatio.test.ts`, `src/core/mastery.test.ts`

**Interfaces:**
```ts
export type TimeBand = 'fast' | 'slow' | 'very_slow';
export function timeRatio(answerTimeMs: number, recommendedTimeSec: number): number
export function timeBand(ratio: number): TimeBand // <=1 fast, <=1.5 slow, else very_slow
export const INITIAL_MASTERY = 50;
export function masteryDelta(result: AnswerResult, ratio: number): number // +8/+5/+2/-7/-10
export function applyMastery(score: number, result: AnswerResult, ratio: number): number // clamp 0..100
export function computeMastery(records: {result: AnswerResult; answerTimeMs: number; recommendedTime: number}[]): number // 時系列順に適用
```

- [ ] **Step 1:** テスト: ratio 境界（1.0 は fast、1.5 は slow、1.51 は very_slow）、各デルタ、クランプ（100 で +8 → 100、0 で −10 → 0）、`computeMastery([])` が 50
- [ ] **Step 2:** 実装 → 通過 → Commit `feat: add mastery score and time ratio logic`

### Task 4: 集計と評価

**Files:**
- Create: `src/core/evaluation.ts`, `src/core/stats.ts`
- Test: `src/core/evaluation.test.ts`, `src/core/stats.test.ts`

**Interfaces:**
```ts
export function evaluate(score: number, attempts: number): Evaluation
export const EVALUATION_LABEL: Record<Evaluation, string> // 得意 / 普通 / 苦手 / 未評価
export interface QuestionStats { questionId; attemptCount; correctCount; incorrectCount; unknownCount; correctRate; averageAnswerTimeMs; lastAnsweredAt: string|null; lastResult: AnswerResult|null; consecutiveCorrect; consecutiveIncorrect; masteryScore; evaluation }
export interface TopicStats { topic: TopicId; category; attemptCount; correctCount; incorrectCount; unknownCount; correctRate; unknownRate; averageAnswerTimeMs; averageRecommendedTimeMs; score; evaluation }
export interface OverallStats { attemptCount; correctCount; correctRate; unknownRate; averageAnswerTimeMs; studyDays }
export function sortRecords(records: AnswerRecord[]): AnswerRecord[] // timestamp 昇順（安定）
export function computeQuestionStats(question: Question, records: AnswerRecord[]): QuestionStats
export function computeAllQuestionStats(questions: Question[], records: AnswerRecord[]): Map<string, QuestionStats>
export function computeTopicStats(questions: Question[], records: AnswerRecord[]): Map<TopicId, TopicStats> // 全 topic 分（0 件も含む）
export function computeOverallStats(questions: Question[], records: AnswerRecord[]): OverallStats
export function localDateKey(iso: string): string // YYYY-MM-DD ローカル
```

- [ ] **Step 1:** evaluation テスト: (80,3)=strong, (80,2)=unrated, (44,5)=weak, (45,5)=normal, (74,5)=normal, (75,5)=strong
- [ ] **Step 2:** stats テスト: 3 レコード（correct fast / incorrect / unknown）で count・rate・平均・連続数・mastery（50+8−7−10=41）を検証。存在しない questionId は無視。topic 集計で unknownRate と averageRecommendedTimeMs。overall の studyDays（同日 2 件は 1 日）
- [ ] **Step 3:** 実装 → 通過 → Commit `feat: add question/topic/overall stats and evaluation`

### Task 5: 出題アルゴリズム

**Files:**
- Create: `src/core/rng.ts`, `src/core/selection.ts`
- Test: `src/core/selection.test.ts`

**Interfaces:**
```ts
export type Rng = () => number; // [0,1)
export function mulberry32(seed: number): Rng
export interface SelectionInput { questions: Question[]; records: AnswerRecord[]; count: number; now: Date; rng: Rng }
export function selectQuestions(input: SelectionInput): Question[]
export function categorySplit(count: number, rng: Rng): { verbal: number; nonverbal: number }
export function isInCooldown(stats: QuestionStats, now: Date): boolean
export function bucketOf(qStats: QuestionStats, topicEval: Evaluation): Evaluation // 未回答なら 'unrated'
export function priorityWeight(qStats: QuestionStats): number
```

- [ ] **Step 1:** テスト: `categorySplit(7)` は {3,4} か {4,3}; 選択数 = count; 重複なし; 履歴なしで両カテゴリ含む; 2 日前に正解した問題は除外されるが候補不足なら復活; 昨日 unknown の問題は含まれ得る（cooldown 1 日）; 苦手 topic を作った履歴を与え、固定 seed で 1000 回選ぶと苦手 topic の出現率が 得意 topic より高い
- [ ] **Step 2:** 実装 → 通過 → Commit `feat: add weakness-first question selection`

### Task 6: ストレージ

**Files:**
- Create: `src/storage/db.ts`, `src/storage/sessionStore.ts`, `src/storage/exportImport.ts`
- Test: `src/storage/db.test.ts`（fake-indexeddb）, `src/storage/exportImport.test.ts`, `src/storage/sessionStore.test.ts`

**Interfaces:**
```ts
// db.ts
export async function addAnswer(record: Omit<AnswerRecord,'id'>): Promise<number>
export async function getAllAnswers(): Promise<AnswerRecord[]>
export async function getAnswersByQuestion(questionId: string): Promise<AnswerRecord[]>
export async function clearAnswers(): Promise<void>
export async function getSettings(): Promise<Settings> // 既定 {questionsPerDay: 7}
export async function saveSettings(s: Settings): Promise<void>
export async function importAnswers(records: AnswerRecord[]): Promise<number> // 追加件数。questionId+timestamp で重複除外
// sessionStore.ts
export interface ActiveSession { date: string; questionIds: string[]; currentIndex: number; phase: 'ready'|'answering'|'answered'; startedAt: number|null; selectedChoice: number|null; lastResult: {selectedChoice:number|null; result:AnswerResult; answerTimeMs:number}|null; results: {questionId:string; result:AnswerResult; answerTimeMs:number}[] }
export function loadSession(): ActiveSession|null
export function saveSession(s: ActiveSession): void
export function clearSession(): void
// exportImport.ts
export interface ExportData { app:'spilab'; version:1; exportedAt:string; settings:Settings; answers:AnswerRecord[] }
export function buildExport(settings, answers): ExportData
export function parseImport(json: string): ExportData // 不正なら throw Error(日本語メッセージ)
```

- [ ] **Step 1:** テスト: add → getAll 順序、importAnswers の重複除外、settings 既定値、parseImport の異常系（JSON でない / app 不一致 / answers 配列でない / レコードの必須欠落）、sessionStore の round-trip と壊れた JSON で null
- [ ] **Step 2:** 実装 → 通過 → Commit `feat: add IndexedDB storage, session store and export/import`

### Task 7: 学習フロー UI（ホーム・出題・採点・解説・今日の結果）

**Files:**
- Create: `src/hooks/useElapsed.ts`, `src/hooks/useAnswers.ts`, `src/components/Layout.tsx`, `src/components/Explanation.tsx`, `src/components/Feedback.tsx`, `src/pages/HomePage.tsx`, `src/pages/SessionPage.tsx`, `src/pages/SummaryPage.tsx`, `src/core/feedback.ts`
- Modify: `src/App.tsx`, `src/styles.css`
- Test: `src/core/feedback.test.ts`, `src/components/Explanation.test.ts`（パース関数のみ）

**Interfaces:**
```ts
// feedback.ts
export interface FeedbackInput { result: AnswerResult; answerTimeMs: number; recommendedTime: number; topicLabel: string; topicEvalBefore: Evaluation; topicEvalAfter: Evaluation; topicScoreBefore: number; topicScoreAfter: number }
export function buildFeedback(i: FeedbackInput): { headline: string; lines: string[] }
// Explanation.tsx
export function parseExplanation(text: string): Array<{type:'heading'|'paragraph'; text:string}>
// useElapsed.ts
export function useElapsed(startedAt: number|null): number // ms, 250ms 間隔更新
// useAnswers.ts
export function useAnswers(): { answers: AnswerRecord[]; loading: boolean; reload: () => Promise<void> }
```

フロー（SessionPage）:
1. 起動時 `loadSession()`。今日の date と一致し未完了なら復元。なければ `selectQuestions` で作成して `saveSession`
2. phase `ready`: 問題番号「問題 n / N」、【分野】、問題文、選択肢（disabled）、「問題をはじめる」
3. phase `answering`: 経過時間 mm:ss、選択肢ラジオ、独立「わからない」ボタン（押した瞬間確定）、「解答する」（未選択時 disabled）
4. 解答確定: `answerTimeMs = Date.now() - startedAt`、`addAnswer`、session を `answered` に更新、Feedback + 正解 + 解説 + 「次の問題」/最終問なら「結果を見る」
5. 全問完了で `/summary` へ。SummaryPage は session.results から集計し `clearSession()` は「ホームへ戻る」時に実施

- [ ] **Step 1:** feedback / parseExplanation のテストを書き実装
- [ ] **Step 2:** ページ実装、`npm run typecheck` 通過、dev server で手動確認（開始 → 回答 → 採点 → 次へ → 結果）
- [ ] **Step 3:** Commit `feat: add study session flow UI`

### Task 8: 履歴・問題詳細・設定 UI

**Files:**
- Create: `src/pages/HistoryPage.tsx`, `src/pages/QuestionDetailPage.tsx`, `src/pages/SettingsPage.tsx`, `src/components/StatTable.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1:** HistoryPage: 全体 6 指標、分野別テーブル（分野 / 回答数 / 正答率 / わからない率 / 平均時間 / 評価）、問題別一覧（回答済みのみ、mastery 順）→ `/history/:questionId`
- [ ] **Step 2:** QuestionDetailPage: 問題文、回答回数、正答率、わからない回数、平均時間、masteryScore、過去の回答リスト（日時 / 結果 / 選択 / 時間）
- [ ] **Step 3:** SettingsPage: 出題数 select（5/7/10/15）、「学習データを書き出す」（Blob ダウンロード `spilab-export-YYYYMMDD.json`）、「学習データを読み込む」（file input → parseImport → importAnswers、件数表示）、「学習履歴をすべて削除」（`window.confirm` → clearAnswers + clearSession）
- [ ] **Step 4:** typecheck 通過、手動確認 → Commit `feat: add history, question detail and settings pages`

### Task 9: スタイルとレスポンシブ

**Files:**
- Modify: `src/styles.css`, `src/components/Layout.tsx`, `index.html`

- [ ] **Step 1:** CSS 変数（色・余白）、最大幅 640px 中央、ボタン 44px 以上、選択肢は縦積み、テーブルは横スクロール。`prefers-color-scheme: dark` 対応（最小）
- [ ] **Step 2:** Layout フッターに「学習履歴はこのブラウザに保存されます。サーバーには送信されません。」
- [ ] **Step 3:** Commit `style: responsive layout and theme`

### Task 10: 問題データ（各分野 3〜5 問、合計 50 問以上）

**Files:**
- Create: `src/questions/verbal/{vocabulary,wordRelation,idiom,wordMeaning,sentenceOrder,reading}.ts`, `src/questions/nonverbal/{ratio,profitLoss,speed,workRate,permutation,combination,probability,inference,set,tableReading,dataReading}.ts`
- Modify: `src/questions/index.ts`, `src/questions/questions.test.ts`（各 topic 3 問以上のアサーションを有効化）

品質基準:
- 数値問題は解説内の計算で正解が導けること（第三者が再計算して一致）
- 解説は「何の問題か → 考え方 → 式 → 途中計算 → 答え → ポイント」の構成、`## 解き方` `## ポイント` 見出し
- 誤答選択肢は典型的な誤りに基づく（P と C の取り違え等）
- 言語問題は一般的な語彙・慣用表現。出典に依存する長文は自作

- [ ] **Step 1:** 言語 / 非言語 A（割合・損益・速度・仕事算・集合・表）/ 非言語 B（順列・組合せ・確率・推論・資料）を並列サブエージェントで作成
- [ ] **Step 2:** 独立の検証パスで全数値問題を再計算し、誤りを修正
- [ ] **Step 3:** `npm test` で validate 通過 → Commit `feat: add initial question bank`

### Task 11: README・LICENSE・GitHub Actions

**Files:**
- Create: `README.md`, `LICENSE`（MIT）, `.github/workflows/deploy.yml`

- [ ] **Step 1:** deploy.yml: on push main + workflow_dispatch、permissions pages/id-token、`npm ci` → `npm test` → `BASE_PATH=/${{ github.event.repository.name }}/ npm run build` → `actions/upload-pages-artifact` → `actions/deploy-pages`
- [ ] **Step 2:** README: 概要 / URL（`https://<user>.github.io/<repo>/` の形で記載し設定手順） / 開発環境 / 起動 / build / 問題追加方法 / ローカル保存の注意 / ライセンス
- [ ] **Step 3:** Commit `docs: add README, license and pages deploy workflow`

### Task 12: 最終検証

- [ ] `npm run typecheck` / `npm test` 全通過
- [ ] dev server 起動し `curl` でトップが返ることを確認
- [ ] 設計書との突合（完成条件 47 章）を README または最終報告に記載
