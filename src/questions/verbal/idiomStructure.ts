import type { Question } from '../../types';

const OPPOSITE = '反対の意味を持つ漢字を重ねる';
const SIMILAR = '似た意味を持つ漢字を重ねる';
const SUBJECT_PREDICATE = '主語と述語の関係';
const VERB_OBJECT = '動詞の後に目的語をおく';
const MODIFIER = '前の漢字が後の漢字を修飾する';

const PROMPT = '次の熟語の成り立ちとして最も適切なものを選びなさい。';
const SAME_PROMPT = '次の熟語と同じ成り立ちのものを選びなさい。';

export const idiomStructureQuestions: Question[] = [
  {
    id: 'verbal-idiom-structure-001',
    category: 'verbal',
    topic: 'idiom_structure',
    subtopic: 'opposite',
    difficulty: 1,
    question: `${PROMPT}\n\n「高低」`,
    choices: [OPPOSITE, SIMILAR, SUBJECT_PREDICATE, VERB_OBJECT],
    correctChoice: 0,
    recommendedTime: 20,
    explanation: `## 解き方

熟語の成り立ちの問題では、二つの漢字をそれぞれ訓読みし、漢字どうしの関係を確かめます。「高」は「高い」、「低」は「低い」で、二つは正反対の意味です。よって「反対の意味を持つ漢字を重ねる」型です。

「似た意味を重ねる」は同じ方向の意味が並ぶ型で、正反対の「高」「低」には当てはまりません。「主語と述語」は「〜が〜する」、「動詞の後に目的語」は「〜を〜する」と読める型ですが、「高」「低」はどちらも動詞ではないので当てはまりません。

答え：反対の意味を持つ漢字を重ねる

## ポイント

まず漢字を訓読みし、「〜い」「〜する」「〜が」「〜を」のどれで結べるかを確かめます。「高低」「上下」「善悪」「増減」のように対になる漢字が並ぶ熟語は、反対の意味型の代表です。`,
    tags: ['熟語の成り立ち', '反対の意味'],
  },
  {
    id: 'verbal-idiom-structure-002',
    category: 'verbal',
    topic: 'idiom_structure',
    subtopic: 'similar',
    difficulty: 2,
    question: `${PROMPT}\n\n「温暖」`,
    choices: [SUBJECT_PREDICATE, SIMILAR, MODIFIER, OPPOSITE],
    correctChoice: 1,
    recommendedTime: 20,
    explanation: `## 解き方

「温」は「あたたかい」、「暖」も「あたたかい」で、二つの漢字はほぼ同じ意味です。よって「似た意味を持つ漢字を重ねる」型です。

「反対の意味を重ねる」は「寒暖」のように対になる漢字が並ぶ型で、「温」と「暖」は対立していません。「前の漢字が後の漢字を修飾する」は「温泉（温かい泉）」のように後ろが名詞になる型ですが、「暖」は名詞ではありません。「主語と述語」は「〜が〜する」と読める型で、「温が暖する」とは読めません。

答え：似た意味を持つ漢字を重ねる

## ポイント

同じ漢字でも「温暖」は似た意味型、「温泉」は修飾型、「寒暖」は反対型と、組み合わせる相手で成り立ちが変わります。一字ずつの意味を訓読みで確かめる習慣をつけましょう。`,
    tags: ['熟語の成り立ち', '似た意味'],
  },
  {
    id: 'verbal-idiom-structure-003',
    category: 'verbal',
    topic: 'idiom_structure',
    subtopic: 'subject_predicate',
    difficulty: 3,
    question: `${PROMPT}\n\n「日没」`,
    choices: [VERB_OBJECT, MODIFIER, SUBJECT_PREDICATE, OPPOSITE],
    correctChoice: 2,
    recommendedTime: 25,
    explanation: `## 解き方

「日没」は「日が没する（太陽が沈む）」と読めます。前の漢字「日」が主語、後ろの漢字「没」が述語になっているので、「主語と述語の関係」型です。

「動詞の後に目的語をおく」は「読書（書を読む）」のように返って読める型ですが、「没を日する」とは読めません。「前の漢字が後の漢字を修飾する」は「日光（日の光）」のように後ろが名詞になる型で、「没」は動詞なので当てはまりません。「反対の意味を重ねる」は、「日」と「没」が対立する意味ではないので誤りです。

答え：主語と述語の関係

## ポイント

主語述語型は「〜が〜する」と上から順に読める熟語です。「日没」「地震」「雷鳴」「国営」「人造」などが代表で、下から上に返って「〜を〜する」と読む目的語型とは読む方向が逆になります。`,
    tags: ['熟語の成り立ち', '主語と述語'],
  },
  {
    id: 'verbal-idiom-structure-004',
    category: 'verbal',
    topic: 'idiom_structure',
    subtopic: 'verb_object',
    difficulty: 1,
    question: `${PROMPT}\n\n「読書」`,
    choices: [SIMILAR, SUBJECT_PREDICATE, MODIFIER, VERB_OBJECT],
    correctChoice: 3,
    recommendedTime: 20,
    explanation: `## 解き方

「読書」は「書を読む」と、後ろの漢字から前の漢字へ返って読めます。前の「読」が動詞、後ろの「書」がその目的語なので、「動詞の後に目的語をおく」型です。

「主語と述語」は「〜が〜する」と上から順に読む型で、「読が書する」とは読めません。「前の漢字が後の漢字を修飾する」は「新書（新しい書）」のように前が後ろを説明する型ですが、「読」は「書」を説明していません。「似た意味を重ねる」は、「読む」と「書物」では意味が異なるので誤りです。

答え：動詞の後に目的語をおく

## ポイント

目的語型は漢文と同じく下から上に返って「〜を〜する」と読める熟語です。「読書」「洗顔」「投票」「登山」などが代表で、前の漢字が動詞になっているのが特徴です。`,
    tags: ['熟語の成り立ち', '目的語'],
  },
  {
    id: 'verbal-idiom-structure-005',
    category: 'verbal',
    topic: 'idiom_structure',
    subtopic: 'modifier',
    difficulty: 1,
    question: `${PROMPT}\n\n「温泉」`,
    choices: [MODIFIER, OPPOSITE, VERB_OBJECT, SUBJECT_PREDICATE],
    correctChoice: 0,
    recommendedTime: 20,
    explanation: `## 解き方

「温泉」は「温かい泉」と読めます。前の漢字「温」が後ろの名詞「泉」の性質を説明しているので、「前の漢字が後の漢字を修飾する」型です。

「反対の意味を重ねる」は「温」と「泉」が対になる意味ではないので誤りです。「動詞の後に目的語をおく」は「泉を温する」とは読めず、「主語と述語」も「温が泉する」とは読めないので、どちらも当てはまりません。後ろの「泉」が名詞である点が決め手です。

答え：前の漢字が後の漢字を修飾する

## ポイント

修飾型は「〜な〇〇」「〜の〇〇」「〜した〇〇」と読める熟語で、後ろの漢字が名詞になります。「温泉」「急流」「曲線」「海底」「新人」などが代表です。後ろが動詞なら主語述語型か目的語型を疑いましょう。`,
    tags: ['熟語の成り立ち', '修飾'],
  },
  {
    id: 'verbal-idiom-structure-006',
    category: 'verbal',
    topic: 'idiom_structure',
    subtopic: 'opposite',
    difficulty: 2,
    question: `${PROMPT}\n\n「増減」`,
    choices: [SIMILAR, OPPOSITE, SUBJECT_PREDICATE, MODIFIER],
    correctChoice: 1,
    recommendedTime: 20,
    explanation: `## 解き方

「増」は「増える」、「減」は「減る」で、二つの漢字は正反対の意味です。よって「反対の意味を持つ漢字を重ねる」型です。

「似た意味を重ねる」は「増加（増える＋加わる）」のように同じ方向の意味が並ぶ型で、対立する「増」「減」には当てはまりません。「主語と述語」は「増が減する」とは読めず、「前の漢字が後の漢字を修飾する」は後ろが名詞になる型ですが「減」は動詞なので、いずれも誤りです。

答え：反対の意味を持つ漢字を重ねる

## ポイント

同じ「増」でも「増減」は反対型、「増加」は似た意味型です。動詞どうしが並ぶ熟語では、二つが同じ方向の動きか逆の動きかで型が決まります。「開閉」「送迎」「売買」「往復」も反対型の代表です。`,
    tags: ['熟語の成り立ち', '反対の意味'],
  },
  {
    id: 'verbal-idiom-structure-007',
    category: 'verbal',
    topic: 'idiom_structure',
    subtopic: 'similar',
    difficulty: 2,
    question: `${PROMPT}\n\n「思考」`,
    choices: [SUBJECT_PREDICATE, VERB_OBJECT, SIMILAR, OPPOSITE],
    correctChoice: 2,
    recommendedTime: 20,
    explanation: `## 解き方

「思」は「思う」、「考」は「考える」で、どちらも頭を働かせるという似た意味の漢字です。よって「似た意味を持つ漢字を重ねる」型です。

「主語と述語」は「思が考する」とは読めず、「動詞の後に目的語をおく」も「考を思う」とは読めないので、どちらも当てはまりません。「反対の意味を重ねる」は、「思う」と「考える」が対立する意味ではないので誤りです。

答え：似た意味を持つ漢字を重ねる

## ポイント

似た意味型は、二つの漢字を入れ替えても意味がほぼ変わらないのが特徴で、「思考」「永久」「豊富」「岩石」「絵画」などが代表です。動詞が二つ並ぶときは、「〜を」「〜が」で結べないことを確かめて目的語型や主語述語型と区別しましょう。`,
    tags: ['熟語の成り立ち', '似た意味'],
  },
  {
    id: 'verbal-idiom-structure-008',
    category: 'verbal',
    topic: 'idiom_structure',
    subtopic: 'verb_object',
    difficulty: 2,
    question: `${PROMPT}\n\n「洗顔」`,
    choices: [OPPOSITE, MODIFIER, SUBJECT_PREDICATE, VERB_OBJECT],
    correctChoice: 3,
    recommendedTime: 20,
    explanation: `## 解き方

「洗顔」は「顔を洗う」と、後ろから前へ返って読めます。前の「洗」が動詞、後ろの「顔」が目的語なので、「動詞の後に目的語をおく」型です。

「主語と述語」は「洗が顔する」とは読めないので誤りです。「前の漢字が後の漢字を修飾する」なら「洗った顔」という物を表すはずですが、「洗顔」は「顔を洗うこと」という動作を表す語なので当てはまりません。「反対の意味を重ねる」は、「洗う」と「顔」が対立していないので誤りです。

答え：動詞の後に目的語をおく

## ポイント

前の漢字が動詞で後ろが名詞のとき、修飾型か目的語型かで迷いやすくなります。熟語全体が「〜すること」という動作を表すなら目的語型（洗顔・読書・投票）、「〜した〇〇」という物を表すなら修飾型（曲線・急流）と区別しましょう。`,
    tags: ['熟語の成り立ち', '目的語'],
  },
  {
    id: 'verbal-idiom-structure-009',
    category: 'verbal',
    topic: 'idiom_structure',
    subtopic: 'same_structure',
    difficulty: 3,
    question: `${SAME_PROMPT}\n\n「急流」`,
    choices: ['曲線', '善悪', '豊富', '市営'],
    correctChoice: 0,
    recommendedTime: 30,
    explanation: `## 解き方

まず「急流」の成り立ちを確かめます。「急流」は「急な流れ」と読め、前の「急」が後ろの名詞「流」を説明しているので、「前の漢字が後の漢字を修飾する」型です。同じ型の熟語を選択肢から探します。

「曲線」は「曲がった線」と読め、前の漢字が後ろの名詞を説明しているので同じ修飾型です。「善悪」は「善い」と「悪い」で反対の意味を重ねる型、「豊富」は「豊か」と「富む」で似た意味を重ねる型、「市営」は「市が営む」と読める主語と述語型で、いずれも成り立ちが異なります。

答え：曲線

## ポイント

「同じ成り立ちのものを選ぶ」形式では、まず問題の熟語の型を決めてから、選択肢を一つずつ分類します。修飾型は後ろの漢字が名詞で、「〜な〇〇」「〜した〇〇」と読めるのが目印です。`,
    tags: ['熟語の成り立ち', '修飾', '同じ成り立ち'],
  },
  {
    id: 'verbal-idiom-structure-010',
    category: 'verbal',
    topic: 'idiom_structure',
    subtopic: 'same_structure',
    difficulty: 3,
    question: `${SAME_PROMPT}\n\n「雷鳴」`,
    choices: ['永久', '開閉', '人造', '投票'],
    correctChoice: 2,
    recommendedTime: 30,
    explanation: `## 解き方

まず「雷鳴」の成り立ちを確かめます。「雷鳴」は「雷が鳴る」と読め、前の「雷」が主語、後ろの「鳴」が述語なので、「主語と述語の関係」型です。

「人造」は「人が造る」と読め、前が主語、後ろが述語になっているので同じ型です。「永久」は「永い」と「久しい」で似た意味を重ねる型、「開閉」は「開く」と「閉じる」で反対の意味を重ねる型です。「投票」は「票を投じる」と後ろから返って読む目的語型で、主語述語型とは読む方向が逆です。

答え：人造

## ポイント

主語述語型は「〜が〜する」と上から順に読める熟語です。「日没」「地震」「国営」「県立」「人造」など、前の漢字が「何が」を表し、後ろが動作を表します。「〜を〜する」と返って読む目的語型と混同しないようにしましょう。`,
    tags: ['熟語の成り立ち', '主語と述語', '同じ成り立ち'],
  },
];
