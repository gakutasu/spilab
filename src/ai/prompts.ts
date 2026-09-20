import type { Category, Question } from '../types';
import { CATEGORY_LABEL, TOPICS, type TopicId } from '../questions/topics';

const TOPIC_GUIDE: Record<TopicId, string> = {
  vocabulary: '同意語・反意語・語の使い分け。一般的な語彙のみ。',
  word_relation: '二語関係（包含・同義・対義・用途・原材料・役割・並列）。関係の種類と左右の向きを問う。',
  idiom: '四字熟語・慣用句・ことわざの意味や用法。',
  word_meaning: '語句の意味として最も適切なものを選ぶ。',
  sentence_order: 'ア〜エ（またはア〜オ）の文の断片を意味が通るように並べ替える。選択肢は「ア → ウ → イ → エ」の形式。',
  reading: '250〜400字の自作の日本語文章（著作物の引用禁止）を passage に置き、主旨・空欄補充・内容一致を問う。',
  ratio: '百分率・増減率・濃度などの割合計算。',
  profit_loss: '原価・定価・割引・利益率の損益計算。',
  speed: '速さ・時間・距離、出会い算、追いつき算、往復の平均速度。単位換算に注意。',
  work_rate: '全体の仕事量を1とおく仕事算。途中交代・複数人の協働。',
  permutation: '順列。役割や並び順を区別する場合の数。PとCの判断を問うものを含める。',
  combination: '組合せ。選ぶだけの場合の数。「少なくとも」の余事象や男女からの選出を含める。',
  probability: 'サイコロ・くじ・カード等の確率。場合の数／全事象の構造を明示。余事象も扱う。',
  inference: '順序・位置・対応・発言の真偽の推論。条件を passage に置き、確実に言えるものを1つだけ正解にする。',
  set: 'ベン図で解く2集合の問題。「少なくとも一方」「どちらも」「どちらでもない」。',
  table_reading: '3〜5行の小さな表を passage に置き（「商品 | 単価 | 数量」のような形式）、合計・割合・比較を問う。',
  data_reading: '構成比・増加率・実数の算出。資料は passage に文字で表現し、スマートフォンでも読める大きさにする。',
  idiom_structure: '二字熟語の成り立ち（反対の意味・似た意味・主語と述語・動詞と目的語・前が後を修飾）を分類する。',
  word_usage: '多義語について、下線部と同じ意味で使われている文を選ぶ。',
  fill_blank: '文中の空欄に入る接続詞・副詞・語句を選ぶ。',
  discount_settlement: '団体割引・分割払い・複数人の立て替えと精算。',
  logic: '命題（AならばB）・逆裏対偶・発言の真偽から確実に言えることを選ぶ。',
  integer: '約数倍数・余り・n進法・数列の規則性。',
  equation: '条件から方程式・不等式を立てて数を求める（年齢算・鶴亀算・過不足算）。',
  geometry: '面積・角度・長さ・図形の分割。図は passage に文字で説明する。',
  flow_ratio: 'ペーパーテストの「物の流れと比率」。分岐と合流の比率から量を求める。',
  graph_region: 'ペーパーテストの「グラフの領域」。不等式で表される領域の判定。',
  eng_synonym: '英単語の同意語・反意語。',
  eng_fill_blank: '英文の空欄補充（文法・語法・語彙）。',
  eng_dictionary: '英語の定義文に合う単語を選ぶ。',
  eng_error: '英文の下線部から文法的に誤っている箇所を選ぶ。',
  eng_translation: '日本語の文に最も近い意味の英文を選ぶ。',
  eng_reading: '英語の長文（120〜200語）を passage に置き、内容一致や主旨を問う。',
};

export const SYSTEM_PROMPT = `あなたはSPI（総合適性検査）対策問題の作成者です。転職活動中の学習者が1問ずつ解いて詳しい解説を読むアプリ向けに、正確で良質な問題を作成します。

必ず守ること:
- 正確さが最優先。数値問題は答えを出したあと、別の方法で再計算して一致を確認し、その記録を selfCheck に書く。一致しない場合は問題の数値を直す。
- 選択肢は4つ。正解はちょうど1つ。誤答は「典型的なミスをするとその値になる」ものにする（例: PとCの取り違え、単位換算忘れ、余事象の取り忘れ）。
- 正解のインデックス（correctChoice）は問題ごとにばらつかせる。
- 推論問題は、条件から確実に言える選択肢が1つだけになるよう、全ての場合を列挙して確認する。
- 解説（explanation）は次の形式。見出しは「## 解き方」「## ポイント」の2つ。段落は空行で区切る。箇条書きは「- 」で始める。
  「## 解き方」には、何の問題か → どう考え始めるか → なぜその式になるか → 式 → 途中計算 → 「答え：◯◯」を順に書く。
  「## ポイント」には、一般化できる考え方と、誤答選択肢が表す典型的なミスを書く。
  解説は200〜450文字程度。
- 出力はJSONのみ。指定されたスキーマに厳密に従う。passage が不要な場合は空文字にする。
- 既出の問題と設定・数値が同じ問題は作らない。`;

export interface GenerationPromptInput {
  topic: TopicId;
  count: number;
  difficulty: 1 | 2 | 3 | null;
  examples: Question[];
  existingStems: string[];
}

function formatExample(q: Question): string {
  const lines = [
    `【例】難易度${q.difficulty} / 目安${q.recommendedTime}秒`,
    q.passage ? `passage: ${q.passage}` : '',
    `question: ${q.question}`,
    `choices: ${q.choices.map((c, i) => `${i}: ${c}`).join(' / ')}`,
    `correctChoice: ${q.correctChoice}`,
    `explanation:\n${q.explanation}`,
  ];
  return lines.filter(Boolean).join('\n');
}

export function buildGenerationPrompt(input: GenerationPromptInput): string {
  const info = TOPICS[input.topic];
  const category: Category = info.category;
  const parts: string[] = [];
  parts.push(`分野: ${CATEGORY_LABEL[category]} / ${info.label}（topic id: ${input.topic}）`);
  parts.push(`分野の説明: ${TOPIC_GUIDE[input.topic]}`);
  parts.push(`作成数: ${input.count}問`);
  parts.push(input.difficulty ? `難易度: ${input.difficulty}（1=易しい, 3=難しい）` : '難易度: 1〜3を混ぜる');
  if (input.examples.length) {
    parts.push('この分野の既存問題の例（形式と解説の詳しさの参考。同じ問題は作らない）:');
    parts.push(input.examples.map(formatExample).join('\n\n'));
  }
  if (input.existingStems.length) {
    parts.push('既出の問題文（冒頭）。これらと重複しない問題にする:');
    parts.push(input.existingStems.map((s) => `- ${s}`).join('\n'));
  }
  parts.push('上記の条件で問題を作成し、JSONで出力してください。');
  return parts.join('\n\n');
}

export const VERIFY_SYSTEM_PROMPT = `あなたはSPI問題の検算者です。与えられた問題を、解説を見ずに自力で解き、正解の選択肢を選びます。
数値問題は計算過程を確認し、推論問題は全ての場合を検討します。
問題文や選択肢に不備（正解が複数ある、正解がない、条件不足、曖昧）があれば issues に書きます。
出力はJSONのみ。`;

export function buildVerifyPrompt(q: Pick<Question, 'question' | 'passage' | 'choices'>): string {
  const lines = [];
  if (q.passage) lines.push(`【資料・条件】\n${q.passage}`);
  lines.push(`【問題】\n${q.question}`);
  lines.push(`【選択肢】\n${q.choices.map((c, i) => `${i}: ${c}`).join('\n')}`);
  lines.push('この問題を解き、answerIndex に正解のインデックスを入れてください。');
  return lines.join('\n\n');
}
