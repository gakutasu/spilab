import type { Question } from '../../types';

const PASSAGE_REMOTE_WORK =
  "Many companies have started to offer employees the option of working from home several days a week. Supporters argue that this flexibility saves commuting time, reduces office costs, and helps people balance work and family life. Some studies suggest that employees who work remotely are at least as productive as those in the office, partly because they face fewer interruptions. However, managers have also noticed some drawbacks. New employees, in particular, find it harder to learn from colleagues when they rarely meet them in person. Informal conversations in the hallway, which often lead to new ideas, do not happen as easily online. As a result, a growing number of firms have adopted a 'hybrid' model, in which staff come to the office on fixed days and work from home on the others. Whether this compromise will last is still uncertain, but it seems clear that the traditional five-day office week is unlikely to return for most desk workers.";

const PASSAGE_SLEEP =
  'For a long time, scientists believed that sleep was simply a period of rest during which the brain did very little. Research over the past few decades has changed this view. It is now understood that the sleeping brain is highly active, and that one of its main tasks is to organize what we learned during the day. In a typical experiment, volunteers are asked to memorize a list of words or practice a simple skill. Half of them then sleep, while the others stay awake for the same number of hours. When both groups are tested later, those who slept almost always remember more. Interestingly, the benefit appears to depend on the quality of sleep rather than on its length alone. Volunteers whose sleep is repeatedly interrupted gain little, even if they spend eight hours in bed. These findings have practical implications for students. Staying up all night before an exam may actually reduce the amount of information the brain is able to retain.';

const PASSAGE_FESTIVAL =
  "Every autumn, the small town where I grew up holds a lantern festival that dates back more than three hundred years. When I was a child, almost everyone who attended lived within a few kilometers of the town. Today the situation is quite different. Photographs of the festival have spread on social media, and last year more than forty thousand visitors arrived over a single weekend, ten times the town's population. Local shops and hotels have welcomed the extra income, and some young people who had left for the city have come back to open cafes and guesthouses. At the same time, residents complain about traffic, litter, and visitors who climb onto private property to get a better picture. Some elderly neighbors told me they now stay indoors during the festival they once looked forward to all year. I do not think the answer is to keep visitors away. But a festival exists first of all for the people who live there, and if they stop taking part, what remains is only a performance for cameras.";

export const engReadingQuestions: Question[] = [
  {
    id: 'english-eng-reading-001',
    category: 'english',
    topic: 'eng_reading',
    subtopic: 'main_idea',
    difficulty: 2,
    passage: PASSAGE_REMOTE_WORK,
    question: 'What is the main point of the passage?',
    choices: [
      'Working from home is always more productive than working in the office.',
      'Companies are trying mixed arrangements because remote work has both benefits and drawbacks.',
      'New employees should not be allowed to work from home.',
      'Most companies will soon return to the traditional five-day office week.',
    ],
    correctChoice: 1,
    recommendedTime: 150,
    explanation: `## 解き方

主旨を問う問題です。本文は在宅勤務の利点と欠点を順に述べたあと、「As a result, a growing number of firms have adopted a 'hybrid' model」と、両方をふまえた折衷案が広がっていると結論づけています。

「always more productive」は本文の「at least as productive」より強すぎます。「should not be allowed」は本文にない主張です。「return to the five-day office week」は「is unlikely to return」と矛盾します。

答え：Companies are trying mixed arrangements because remote work has both benefits and drawbacks.

## ポイント

主旨は However や As a result の後にまとめられることが多いので、そこを重点的に読みましょう。`,
    tags: ['長文読解', '主旨', 'ビジネス'],
  },
  {
    id: 'english-eng-reading-002',
    category: 'english',
    topic: 'eng_reading',
    subtopic: 'detail',
    difficulty: 1,
    passage: PASSAGE_REMOTE_WORK,
    question: 'According to the passage, why do new employees have difficulty with remote work?',
    choices: [
      'They are given fewer days at the office than experienced staff.',
      'They are more likely to be interrupted at home.',
      'They have fewer chances to learn from colleagues face to face.',
      'They are not familiar with the online tools used by the company.',
    ],
    correctChoice: 2,
    recommendedTime: 120,
    explanation: `## 解き方

詳細を問う問題です。本文に「New employees, in particular, find it harder to learn from colleagues when they rarely meet them in person.」とあり、新入社員は同僚と直接会う機会が少ないため学びにくいと述べています。

「fewer days at the office」は本文にありません。「more likely to be interrupted」は、在宅勤務者は「fewer interruptions」に直面するという記述と反対です。「online tools」も本文にありません。

答え：They have fewer chances to learn from colleagues face to face.

## ポイント

詳細問題では、設問のキーワード（new employees）を本文から探し、その文を言い換えた選択肢を選びます。`,
    tags: ['長文読解', '内容一致', 'ビジネス'],
  },
  {
    id: 'english-eng-reading-003',
    category: 'english',
    topic: 'eng_reading',
    subtopic: 'detail',
    difficulty: 2,
    passage: PASSAGE_SLEEP,
    question: 'Which of the following is true about the experiments described in the passage?',
    choices: [
      'Volunteers who stayed awake usually performed better on the later test.',
      'Only volunteers who practiced a physical skill showed improvement after sleep.',
      'Volunteers who slept for eight hours always remembered the most.',
      'Volunteers whose sleep was interrupted showed little benefit even after a long time in bed.',
    ],
    correctChoice: 3,
    recommendedTime: 150,
    explanation: `## 解き方

内容一致の問題です。本文に「Volunteers whose sleep is repeatedly interrupted gain little, even if they spend eight hours in bed.」とあり、睡眠が中断されると長くベッドにいても効果が小さいと述べています。

「stayed awake ... performed better」は「those who slept almost always remember more」と反対です。「Only ... physical skill」は本文になく、単語の記憶でも効果があります。「eight hours always」は、効果は長さより質によるという記述と矛盾します。

答え：Volunteers whose sleep was interrupted showed little benefit even after a long time in bed.

## ポイント

内容一致では only や always のような限定・強調の語が本文にあるかを確認します。`,
    tags: ['長文読解', '内容一致', '科学'],
  },
  {
    id: 'english-eng-reading-004',
    category: 'english',
    topic: 'eng_reading',
    subtopic: 'vocabulary',
    difficulty: 1,
    passage: PASSAGE_SLEEP,
    question: "The word 'retain' in the last sentence is closest in meaning to which of the following?",
    choices: ['keep', 'forget', 'collect', 'explain'],
    correctChoice: 0,
    recommendedTime: 120,
    explanation: `## 解き方

文脈から語の意味を推測する問題です。最終文「Staying up all night ... may actually reduce the amount of information the brain is able to retain.」は、徹夜をすると脳が保持できる情報量が減るという内容です。本文全体が睡眠は記憶を定着させると述べているので、retain は「保持する」、つまり keep です。

「forget」は反対の意味で本文の警告と矛盾します。「collect」は集めることで、保つ意味ではありません。「explain」は文脈に合いません。

答え：keep

## ポイント

知らない単語は、その文が前の内容を支持しているか反対しているかを手がかりに推測します。`,
    tags: ['長文読解', '語彙', '科学'],
  },
  {
    id: 'english-eng-reading-005',
    category: 'english',
    topic: 'eng_reading',
    subtopic: 'opinion',
    difficulty: 2,
    passage: PASSAGE_FESTIVAL,
    question: "Which of the following best describes the writer's opinion?",
    choices: [
      'Visitors should be banned from the festival to protect the residents.',
      'The festival must remain meaningful to local residents even as it attracts visitors.',
      'The festival should be turned into a professional show for tourists.',
      "Social media has done more harm than good to the town's economy.",
    ],
    correctChoice: 1,
    recommendedTime: 150,
    explanation: `## 解き方

筆者の意見を問う問題です。筆者は「I do not think the answer is to keep visitors away.」と観光客の排除を否定したうえで、「a festival exists first of all for the people who live there」と、祭りは第一に住民のためのものだと述べています。

「should be banned」は上の文と反対です。「professional show」は、最終文の「only a performance for cameras」が否定的なので誤りです。「more harm than good」は、商店やホテルの収入増という記述と矛盾します。

答え：The festival must remain meaningful to local residents even as it attracts visitors.

## ポイント

筆者の意見は「I do not think ...」「But ...」のように、反対の立場を否定してから示されることがよくあります。`,
    tags: ['長文読解', '筆者の意見', '文化'],
  },
  {
    id: 'english-eng-reading-006',
    category: 'english',
    topic: 'eng_reading',
    subtopic: 'inference',
    difficulty: 3,
    passage: PASSAGE_FESTIVAL,
    question: 'What can be inferred about the town from the passage?',
    choices: [
      'Its population is roughly four thousand.',
      'Most of its residents now work in tourism.',
      'The festival was originally started to attract tourists.',
      'All of its young people have moved to the city.',
    ],
    correctChoice: 0,
    recommendedTime: 150,
    explanation: `## 解き方

推論の問題です。本文に「more than forty thousand visitors arrived over a single weekend, ten times the town's population」とあります。4万人が人口の10倍なので、町の人口は約4千人です。

「Most ... work in tourism」は、商店やホテルが収入を得たとあるだけで住民の大半の職業は不明です。「started to attract tourists」は、300年以上前から続くという記述と合いません。「All of its young people」は「some young people ... have come back」と矛盾します。

答え：Its population is roughly four thousand.

## ポイント

推論問題では、本文の数字や事実から導ける内容だけが正解です。most、all のような強い語を含む選択肢は、本文の some では裏付けられません。`,
    tags: ['長文読解', '推論', '文化'],
  },
];
