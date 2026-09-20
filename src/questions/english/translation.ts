import type { Question } from '../../types';

const INSTRUCTION = '次の日本文の意味を最もよく表している英文を選びなさい。';

export const engTranslationQuestions: Question[] = [
  {
    id: 'english-eng-translation-001',
    category: 'english',
    topic: 'eng_translation',
    subtopic: 'ability',
    difficulty: 1,
    question: `${INSTRUCTION}\n\n彼女は昨日、会議に出席できなかった。`,
    choices: [
      'She was not able to attend the meeting yesterday.',
      'She did not have to attend the meeting yesterday.',
      'She was able to attend the meeting yesterday.',
      'She may not have attended the meeting yesterday.',
    ],
    correctChoice: 0,
    recommendedTime: 40,
    explanation: `## 解き方

和文英訳の問題です。「出席できなかった」は過去の能力の否定なので「was not able to（could not）attend」で表します。

「did not have to attend」は「出席する必要がなかった」、「was able to attend」は「出席できた」で肯定の意味です。「may not have attended」は「出席しなかったかもしれない」という推量で、事実を述べていません。

答え：She was not able to attend the meeting yesterday.

## ポイント

助動詞は否定形で意味が大きく変わります。was not able to は「できなかった」、did not have to は「〜する必要がなかった」、may not have＋過去分詞は「〜しなかったかもしれない」です。`,
    tags: ['和文英訳', '助動詞'],
  },
  {
    id: 'english-eng-translation-002',
    category: 'english',
    topic: 'eng_translation',
    subtopic: 'conditional',
    difficulty: 1,
    question: `${INSTRUCTION}\n\nもし明日雨が降ったら、試合は中止になるだろう。`,
    choices: [
      'Unless it rains tomorrow, the game will be called off.',
      'If it rains tomorrow, the game will be called off.',
      'Even if it rains tomorrow, the game will not be called off.',
      'If it rains tomorrow, the game will be put off.',
    ],
    correctChoice: 1,
    recommendedTime: 40,
    explanation: `## 解き方

条件文の問題です。「雨が降ったら中止になる」は「If it rains ..., the game will be called off.」で、call off は「中止する」の意味です。

「Unless it rains」は「雨が降らなければ」で条件が逆です。「Even if ..., will not be called off」は「雨でも中止にならない」で結論が反対です。「will be put off」は「延期される」で、「中止」とは異なります。

答え：If it rains tomorrow, the game will be called off.

## ポイント

if（もし〜なら）、unless（〜でない限り）、even if（たとえ〜でも）は条件の向きが異なります。call off（中止）と put off（延期）のような似た句動詞も区別しましょう。`,
    tags: ['和文英訳', '条件文', '句動詞'],
  },
  {
    id: 'english-eng-translation-003',
    category: 'english',
    topic: 'eng_translation',
    subtopic: 'passive',
    difficulty: 2,
    question: `${INSTRUCTION}\n\n私は上司から、その書類を今日中に送るように頼まれた。`,
    choices: [
      'My boss asked me whether I had sent the documents today.',
      'I asked my boss to send the documents by the end of the day.',
      'I was asked by my boss to send the documents by the end of the day.',
      'My boss was asked to send me the documents by the end of the day.',
    ],
    correctChoice: 2,
    recommendedTime: 50,
    explanation: `## 解き方

受動態の問題です。頼まれたのは「私」なので「I was asked by my boss to send ...」と表します。「今日中に」は by the end of the day です。

「asked me whether I had sent」は「送ったか尋ねた」で、依頼ではなく質問です。「I asked my boss to send」は「私が上司に頼んだ」、「My boss was asked」は「上司が頼まれた」で、どちらも主客が逆です。

答え：I was asked by my boss to send the documents by the end of the day.

## ポイント

「AはBに〜するよう頼まれた」は「A was asked by B to do」です。能動態「B asked A to do」と混同すると主客が逆になります。`,
    tags: ['和文英訳', '受動態'],
  },
  {
    id: 'english-eng-translation-004',
    category: 'english',
    topic: 'eng_translation',
    subtopic: 'past_habit',
    difficulty: 1,
    question: `${INSTRUCTION}\n\n彼は若い頃、よく釣りに行ったものだ。`,
    choices: [
      'He has often gone fishing since he was young.',
      'He wanted to go fishing when he was young.',
      'He rarely went fishing when he was young.',
      'He would often go fishing when he was young.',
    ],
    correctChoice: 3,
    recommendedTime: 40,
    explanation: `## 解き方

過去の習慣を表す問題です。「若い頃よく〜したものだ」は「would often＋動詞の原形」または「used to＋動詞の原形」で表します。

「has often gone fishing since he was young」は「若い頃から今までよく行っている」で、現在も続く意味です。「wanted to go fishing」は「行きたかった」で、行ったとは言っていません。「rarely went fishing」は「めったに行かなかった」で頻度が反対です。

答え：He would often go fishing when he was young.

## ポイント

過去の習慣は「would often」「used to」で表し、「〜したものだ」に対応します。since を伴う現在完了は過去から現在まで続くことを表します。`,
    tags: ['和文英訳', '過去の習慣'],
  },
  {
    id: 'english-eng-translation-005',
    category: 'english',
    topic: 'eng_translation',
    subtopic: 'negation_focus',
    difficulty: 3,
    question: `${INSTRUCTION}\n\n彼女がその仕事を引き受けたのは、お金のためではなかった。`,
    choices: [
      'It was not for the money that she took the job.',
      'She took the job because she needed the money.',
      'She did not take the job, even though she needed the money.',
      'She took the job only for the money.',
    ],
    correctChoice: 0,
    recommendedTime: 60,
    explanation: `## 解き方

否定の焦点に注意する問題です。「引き受けた」ことは事実で、「お金のため」という理由だけを否定しています。これを表すのが強調構文「It was not for ... that S V」です。

「because she needed the money」は「お金が必要だから引き受けた」で理由を肯定しています。「did not take the job」は引き受けなかったので事実が逆です。「only for the money」は「お金のためだけに」で反対です。

答え：It was not for the money that she took the job.

## ポイント

理由だけを否定する文は、強調構文「It was not for ... that S V」で表すと誤解がありません。否定語が行為と理由のどちらにかかるかを確かめましょう。`,
    tags: ['和文英訳', '強調構文', '否定'],
  },
  {
    id: 'english-eng-translation-006',
    category: 'english',
    topic: 'eng_translation',
    subtopic: 'modal_negation',
    difficulty: 2,
    question: `${INSTRUCTION}\n\nこの薬は食後に飲む必要はありません。`,
    choices: [
      'You must not take this medicine after meals.',
      "You don't have to take this medicine after meals.",
      'You should take this medicine after meals.',
      "You can't take this medicine before meals.",
    ],
    correctChoice: 1,
    recommendedTime: 40,
    explanation: `## 解き方

助動詞の否定の問題です。「〜する必要はありません」は「don't have to（need not）」で表します。

「must not take」は「飲んではいけない」という禁止で、必要がないという意味とは異なります。「should take」は「飲むべきだ」で肯定の助言です。「can't take this medicine before meals」は「食前に飲めない」で、時間も意味も原文と違います。

答え：You don't have to take this medicine after meals.

## ポイント

must not は「〜してはいけない」（禁止）、don't have to は「〜しなくてよい」（不必要）で、否定形にすると意味がまったく異なります。「〜する必要はない」を must not と訳すのは典型的な誤りです。`,
    tags: ['和文英訳', '助動詞', '否定'],
  },
  {
    id: 'english-eng-translation-007',
    category: 'english',
    topic: 'eng_translation',
    subtopic: 'past_perfect',
    difficulty: 2,
    question: `${INSTRUCTION}\n\n私がその知らせを聞いたとき、彼はすでに日本を発っていた。`,
    choices: [
      'When I heard the news, he was about to leave Japan.',
      'When I heard the news, he decided to leave Japan.',
      'When I heard the news, he had already left Japan.',
      'He left Japan after I had heard the news.',
    ],
    correctChoice: 2,
    recommendedTime: 50,
    explanation: `## 解き方

過去完了の問題です。「知らせを聞いた」という過去の時点より前に「日本を発っていた」ので、「he had already left Japan」と過去完了で表します。

「was about to leave」は「まさに発とうとしていた」で、まだ発っていません。「decided to leave」は「発つことを決めた」で、出発したとは言っていません。「He left Japan after I had heard the news」は「聞いた後に発った」で順序が逆です。

答え：When I heard the news, he had already left Japan.

## ポイント

「〜したとき、すでに…していた」は「when＋過去形, S had already＋過去分詞」の形です。過去の二つの出来事の順序を示すときは、先に起きたほうを過去完了にします。`,
    tags: ['和文英訳', '過去完了'],
  },
  {
    id: 'english-eng-translation-008',
    category: 'english',
    topic: 'eng_translation',
    subtopic: 'multiplier',
    difficulty: 2,
    question: `${INSTRUCTION}\n\nこの橋は、あの橋の約2倍の長さがある。`,
    choices: [
      'This bridge is about half as long as that one.',
      'That bridge is about twice as long as this one.',
      'This bridge is about two meters longer than that one.',
      'This bridge is about twice as long as that one.',
    ],
    correctChoice: 3,
    recommendedTime: 50,
    explanation: `## 解き方

倍数表現の問題です。「AはBの2倍の長さがある」は「A is twice as long as B」と表します。主語は「この橋」、比較の対象は「あの橋（that one）」です。

「half as long as」は「半分の長さ」で倍率が逆です。「That bridge is ... this one」は主語と比較対象が入れ替わり、「あの橋がこの橋の2倍」になります。「two meters longer than」は「2メートル長い」で、倍数ではなく差です。

答え：This bridge is about twice as long as that one.

## ポイント

倍数は「X times as＋原級＋as」で表し、2倍は twice、半分は half を使います。「〜倍」と「〜だけ長い（差）」は別の構文なので区別しましょう。`,
    tags: ['和文英訳', '比較', '倍数表現'],
  },
];
