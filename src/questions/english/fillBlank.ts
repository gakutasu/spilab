import type { Question } from '../../types';

export const engFillBlankQuestions: Question[] = [
  {
    id: 'english-eng-fill-blank-001',
    category: 'english',
    topic: 'eng_fill_blank',
    subtopic: 'tense',
    difficulty: 1,
    question: '次の文の空欄に入る最も適切な語句を選びなさい。\n\nBy the time we arrived at the station, the train (　) already left.',
    choices: ['has', 'had', 'was', 'is'],
    correctChoice: 1,
    recommendedTime: 25,
    explanation: `## 解き方

時制を問う問題です。文の意味は「私たちが駅に着いたときには、電車はすでに出発していた」です。

「駅に着いた」（arrived）という過去の時点よりも前に「電車が出発した」ので、過去完了 had left を使います。has left は現在完了で、過去の基準点より前を表せません。was left は受動態になり「置き去りにされた」という意味になってしまいます。is は現在形で時制が合いません。

答え：had

## ポイント

by the time 〜（〜するまでには）は過去完了と相性のよい表現です。過去のある時点を基準にして、それより前に完了した出来事は had + 過去分詞で表します。`,
    tags: ['英語', '空欄補充', '時制'],
  },
  {
    id: 'english-eng-fill-blank-002',
    category: 'english',
    topic: 'eng_fill_blank',
    subtopic: 'preposition',
    difficulty: 1,
    question: '次の文の空欄に入る最も適切な語を選びなさい。\n\nShe is responsible (　) managing the new project.',
    choices: ['for', 'of', 'to', 'with'],
    correctChoice: 0,
    recommendedTime: 20,
    explanation: `## 解き方

前置詞を問う問題です。文の意味は「彼女は新しいプロジェクトの管理を担当している」です。

be responsible for 〜 で「〜に責任がある、〜を担当している」という決まった形なので、for が正解です。of / with は responsible と結びつきません。to は be responsible to（人）「（人）に対して責任を負う」の形はありますが、動作（managing）を続けることはできません。

答え：for

## ポイント

形容詞と前置詞の組み合わせは丸ごと覚えるのが基本です。responsible for、capable of、familiar with、similar to など頻出のセットを確認しておきましょう。`,
    tags: ['英語', '空欄補充', '前置詞'],
  },
  {
    id: 'english-eng-fill-blank-003',
    category: 'english',
    topic: 'eng_fill_blank',
    subtopic: 'conjunction',
    difficulty: 2,
    question: '次の文の空欄に入る最も適切な語を選びなさい。\n\n(　) it was raining heavily, the game was not cancelled.',
    choices: ['Because', 'Despite', 'Although', 'However'],
    correctChoice: 2,
    recommendedTime: 25,
    explanation: `## 解き方

接続詞を問う問題です。「激しい雨が降っていた」と「試合は中止されなかった」は逆の関係なので、「〜だけれども」を表す語が入ります。

Although は接続詞で、後ろに主語＋動詞を続けられます。Despite も「〜にもかかわらず」ですが前置詞なので、後ろには名詞しか置けません。However は副詞で、二つの節を直接つなげません。Because は「〜なので」で、理由と結果の関係が成り立ちません。

答え：Although

## ポイント

「〜にもかかわらず」は品詞で使い分けます。although / though は接続詞（＋主語＋動詞）、despite / in spite of は前置詞（＋名詞）、however は副詞です。`,
    tags: ['英語', '空欄補充', '接続詞'],
  },
  {
    id: 'english-eng-fill-blank-004',
    category: 'english',
    topic: 'eng_fill_blank',
    subtopic: 'relative_pronoun',
    difficulty: 1,
    question: '次の文の空欄に入る最も適切な語を選びなさい。\n\nThe engineer (　) designed this bridge received an award.',
    choices: ['which', 'whom', 'whose', 'who'],
    correctChoice: 3,
    recommendedTime: 20,
    explanation: `## 解き方

関係代名詞を問う問題です。文の意味は「この橋を設計した技術者は賞を受けた」です。

先行詞は the engineer（人）で、空欄の直後に動詞 designed が続いているので、主格の関係代名詞 who が入ります。which は先行詞が物のときに使います。whom は目的格なので、後ろに主語＋動詞が続く場合に使います。whose は所有格で、後ろに名詞が必要です。

答え：who

## ポイント

関係代名詞は「先行詞が人か物か」と「空欄の後ろに何が続くか」の二点で判断します。後ろが動詞なら主格（who / which）、主語＋動詞なら目的格（whom / which）、名詞なら所有格（whose）です。`,
    tags: ['英語', '空欄補充', '関係詞'],
  },
  {
    id: 'english-eng-fill-blank-005',
    category: 'english',
    topic: 'eng_fill_blank',
    subtopic: 'word_form',
    difficulty: 2,
    question: '次の文の空欄に入る最も適切な語を選びなさい。\n\nThe company announced a (　) increase in sales last quarter.',
    choices: ['significant', 'significance', 'significantly', 'signify'],
    correctChoice: 0,
    recommendedTime: 25,
    explanation: `## 解き方

品詞を問う問題です。文の意味は「その会社は前四半期の売上の大幅な増加を発表した」です。

空欄は冠詞 a と名詞 increase の間にあるので、名詞を修飾する形容詞 significant（重要な、かなりの）が入ります。significance は名詞（重要性）、significantly は副詞（著しく）、signify は動詞（意味する）で、いずれも名詞の前に置いて修飾することはできません。

答え：significant

## ポイント

品詞問題は空欄の前後を見て判断します。「冠詞＋（　）＋名詞」なら形容詞、「動詞の後ろ」や「文頭で文全体を修飾」なら副詞が入ります。語尾（-ant, -ance, -ly, -fy）から品詞を見分けられるようにしておきましょう。`,
    tags: ['英語', '空欄補充', '品詞'],
  },
  {
    id: 'english-eng-fill-blank-006',
    category: 'english',
    topic: 'eng_fill_blank',
    subtopic: 'gerund',
    difficulty: 2,
    question: '次の文の空欄に入る最も適切な語句を選びなさい。\n\nThe manager suggested (　) the meeting until next week.',
    choices: ['to postpone', 'postponing', 'postpone', 'postponed'],
    correctChoice: 1,
    recommendedTime: 25,
    explanation: `## 解き方

動詞の目的語の形を問う問題です。意味は「部長は会議を来週まで延期することを提案した」です。

suggest は目的語に動名詞（-ing 形）をとる動詞なので、postponing が正解です。suggest は不定詞を目的語にとらないので to postpone は誤りです。原形の postpone、過去分詞の postponed は目的語の位置に置けません。

答え：postponing

## ポイント

動名詞のみを目的語にとる動詞は suggest / consider / avoid / finish / enjoy / mind など、不定詞のみをとる動詞は want / hope / decide / promise などです。グループで覚えておきましょう。`,
    tags: ['英語', '空欄補充', '動名詞'],
  },
  {
    id: 'english-eng-fill-blank-007',
    category: 'english',
    topic: 'eng_fill_blank',
    subtopic: 'idiom',
    difficulty: 2,
    question: '次の文の空欄に入る最も適切な語句を選びなさい。\n\nWe are looking forward (　) you again soon.',
    choices: ['to see', 'seeing', 'to seeing', 'see'],
    correctChoice: 2,
    recommendedTime: 25,
    explanation: `## 解き方

熟語の形を問う問題です。文の意味は「近いうちにまたお会いできるのを楽しみにしています」です。

look forward to 〜 で「〜を楽しみに待つ」という意味ですが、この to は不定詞ではなく前置詞なので、後ろには名詞または動名詞が来ます。したがって to seeing が正解です。to see は不定詞にした誤り、seeing は to が抜けており、see は原形なので誤りです。

答え：to seeing

## ポイント

to の後ろに動名詞が来る熟語は、look forward to -ing、be used to -ing（〜に慣れている）、object to -ing（〜に反対する）などです。これらの to は前置詞だと覚えておきましょう。`,
    tags: ['英語', '空欄補充', '熟語'],
  },
  {
    id: 'english-eng-fill-blank-008',
    category: 'english',
    topic: 'eng_fill_blank',
    subtopic: 'conditional',
    difficulty: 2,
    question: '次の文の空欄に入る最も適切な語句を選びなさい。\n\nIf I (　) more time, I would travel around the world.',
    choices: ['have', 'will have', 'would have', 'had'],
    correctChoice: 3,
    recommendedTime: 25,
    explanation: `## 解き方

仮定法を問う問題です。文の意味は「もっと時間があれば、世界一周旅行をするのに」で、現在の事実に反する願望を表しています。

主節が would travel（would＋動詞の原形）なので、仮定法過去の文です。if 節の動詞は過去形にするため、had が正解です。have は現在形で、主節が will travel となる直説法の条件文で使う形です。will have / would have は if 節の中で使うことができません。

答え：had

## ポイント

仮定法過去は「If＋主語＋過去形, 主語＋would／could＋動詞の原形」の形で、現在の事実に反することを表します。「主節の would を見たら if 節は過去形」とセットで判断しましょう。`,
    tags: ['英語', '空欄補充', '仮定法'],
  },
  {
    id: 'english-eng-fill-blank-009',
    category: 'english',
    topic: 'eng_fill_blank',
    subtopic: 'agreement',
    difficulty: 2,
    question: '次の文の空欄に入る最も適切な語を選びなさい。\n\nThe number of applicants (　) increased sharply this year.',
    choices: ['has', 'have', 'are', 'were'],
    correctChoice: 0,
    recommendedTime: 25,
    explanation: `## 解き方

主語と動詞の一致を問う問題です。文の意味は「今年は応募者の数が急増した」です。

主語は the number（数）という単数名詞で、of applicants は修飾語です。動詞は単数形の has を使い、has increased（現在完了）で「増加した」を表します。have は複数主語用なので誤りです。are / were は be 動詞で、後ろの increased と組み合わせると受動態になり、「数が増やされる」という不自然な意味になります。

答え：has

## ポイント

the number of ＋複数名詞は「〜の数」で単数扱い、a number of ＋複数名詞は「多くの〜」で複数扱いです。主語の中心となる名詞を見極めて動詞の形を決めましょう。`,
    tags: ['英語', '空欄補充', '主語と動詞の一致'],
  },
  {
    id: 'english-eng-fill-blank-010',
    category: 'english',
    topic: 'eng_fill_blank',
    subtopic: 'conjunction',
    difficulty: 1,
    question: '次の文の空欄に入る最も適切な語を選びなさい。\n\nYou cannot enter the building (　) you show your ID card.',
    choices: ['if', 'unless', 'because', 'while'],
    correctChoice: 1,
    recommendedTime: 20,
    explanation: `## 解き方

接続詞の意味を問う問題です。文の意味は「身分証を提示しなければ、建物に入ることはできない」です。

unless は「〜しない限り」という意味で、if 〜 not に相当します。「提示しなければ入れない」という条件が自然に成り立ちます。if を入れると「提示すれば入れない」となり、意味が逆になります。because は「〜なので」、while は「〜する間に」で、どちらも文脈に合いません。

答え：unless

## ポイント

unless は否定の条件「〜しない限り」を表し、それ自体に否定の意味が含まれているので not を重ねません。if / unless / as long as（〜する限り）は、条件を表す接続詞として意味の違いを整理しておきましょう。`,
    tags: ['英語', '空欄補充', '接続詞'],
  },
];
