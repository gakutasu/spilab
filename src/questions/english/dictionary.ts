import type { Question } from '../../types';

export const engDictionaryQuestions: Question[] = [
  {
    id: 'english-eng-dictionary-001',
    category: 'english',
    topic: 'eng_dictionary',
    subtopic: 'occupation',
    difficulty: 1,
    question: '次の英文の説明に最も合う語を選びなさい。\n\na person who is trained to treat people who are ill',
    choices: ['lawyer', 'doctor', 'pilot', 'farmer'],
    correctChoice: 1,
    recommendedTime: 20,
    explanation: `## 解き方

英英辞典の説明文から語を選ぶ問題です。説明の意味は「病気の人を治療する訓練を受けた人」です。

treat（治療する）と ill（病気の）がキーワードで、これに当てはまる職業は doctor（医師）です。lawyer は「弁護士」で法律を扱う人、pilot は「操縦士」、farmer は「農業従事者」で、いずれも病人の治療とは関係がありません。

答え：doctor

## ポイント

職業を説明する文は a person who 〜 の形で始まることが多く、who の後ろの動詞と目的語がその職業の仕事内容を示します。動詞（treat, defend, fly, grow など）に注目して職業を特定しましょう。`,
    tags: ['英語', '英英辞典'],
  },
  {
    id: 'english-eng-dictionary-002',
    category: 'english',
    topic: 'eng_dictionary',
    subtopic: 'place',
    difficulty: 2,
    question: '次の英文の説明に最も合う語を選びなさい。\n\na large building where goods are stored before they are sold or sent out',
    choices: ['warehouse', 'factory', 'library', 'garage'],
    correctChoice: 0,
    recommendedTime: 25,
    explanation: `## 解き方

説明の意味は「商品が売られたり発送されたりする前に保管される大きな建物」です。

goods（商品）が stored（保管される）建物なので、warehouse（倉庫）が正解です。factory は「工場」で、商品を製造する場所です。library は「図書館」で本を保管・貸し出しする場所、garage は「車庫、自動車修理工場」で、いずれも商品の保管場所ではありません。

答え：warehouse

## ポイント

場所を説明する文は a building / a place where 〜 の形が基本です。where 以下で「そこで何が行われるか」が述べられるので、動詞（store, make, borrow, repair など）を手がかりに絞り込みましょう。`,
    tags: ['英語', '英英辞典'],
  },
  {
    id: 'english-eng-dictionary-003',
    category: 'english',
    topic: 'eng_dictionary',
    subtopic: 'money',
    difficulty: 2,
    question: '次の英文の説明に最も合う語を選びなさい。\n\nthe money that you pay regularly to live in a house or apartment that belongs to someone else',
    choices: ['tax', 'salary', 'loan', 'rent'],
    correctChoice: 3,
    recommendedTime: 25,
    explanation: `## 解き方

説明の意味は「他人の所有する家やアパートに住むために定期的に支払うお金」です。

住居を借りるために払うお金なので、rent（家賃）が正解です。tax は「税金」で国や自治体に納めるお金、salary は「給料」で働いて受け取るお金、loan は「貸付金、ローン」で借りたお金そのものを指し、住居の使用料ではありません。

答え：rent

## ポイント

お金に関する語は「誰が誰に、何のために払うか」で区別します。rent（家賃）、fee（料金・謝礼）、fare（運賃）、tax（税金）、salary / wage（給料）は説明文で問われやすい語です。`,
    tags: ['英語', '英英辞典'],
  },
  {
    id: 'english-eng-dictionary-004',
    category: 'english',
    topic: 'eng_dictionary',
    subtopic: 'verb',
    difficulty: 1,
    question: '次の英文の説明に最も合う語を選びなさい。\n\nto make something smaller in size, amount, or degree',
    choices: ['expand', 'maintain', 'reduce', 'compare'],
    correctChoice: 2,
    recommendedTime: 20,
    explanation: `## 解き方

説明の意味は「何かの大きさ、量、程度を小さくすること」です。

to で始まる説明文なので動詞が問われています。smaller（より小さく）にするという意味を持つのは reduce（減らす、縮小する）です。expand は「拡大する」で反対の意味、maintain は「維持する」で変化させないこと、compare は「比較する」で、大きさを変える意味はありません。

答え：reduce

## ポイント

動詞の説明文は to ＋動詞の原形で始まります。説明の中の形容詞（smaller / larger / better / the same）が語の方向性を示すので、まずそこに注目すると選択肢を絞れます。`,
    tags: ['英語', '英英辞典'],
  },
  {
    id: 'english-eng-dictionary-005',
    category: 'english',
    topic: 'eng_dictionary',
    subtopic: 'person',
    difficulty: 1,
    question: '次の英文の説明に最も合う語を選びなさい。\n\na person who buys goods or services from a shop or company',
    choices: ['customer', 'employee', 'manager', 'supplier'],
    correctChoice: 0,
    recommendedTime: 20,
    explanation: `## 解き方

説明の意味は「店や会社から商品やサービスを買う人」です。

buys（買う）がキーワードで、買う側の人を表す customer（顧客）が正解です。employee は「従業員」で会社に雇われて働く人、manager は「管理職、部長」で組織を運営する人、supplier は「供給業者」で商品を売る側の会社や人です。いずれも買う側ではありません。

答え：customer

## ポイント

ビジネス関連の人物を表す語は、立場で整理しておきましょう。customer / client（顧客）は買う側、supplier / vendor（供給業者）は売る側、employer（雇用主）と employee（従業員）は雇う側と雇われる側です。`,
    tags: ['英語', '英英辞典'],
  },
  {
    id: 'english-eng-dictionary-006',
    category: 'english',
    topic: 'eng_dictionary',
    subtopic: 'adjective',
    difficulty: 2,
    question: '次の英文の説明に最も合う語を選びなさい。\n\nwilling to give money, help, or time freely',
    choices: ['selfish', 'generous', 'curious', 'ambitious'],
    correctChoice: 1,
    recommendedTime: 25,
    explanation: `## 解き方

説明の意味は「お金や助け、時間を惜しみなく与えようとする」です。

willing to（進んで〜する）で始まるので形容詞が問われています。give 〜 freely（惜しみなく与える）に当てはまるのは generous（気前のよい）です。selfish は「利己的な」で反対の性質、curious は「好奇心の強い」、ambitious は「野心的な」で、与えることとは無関係です。

答え：generous

## ポイント

人の性格を表す形容詞は説明文の動詞から判断します。give freely → generous、want to know → curious、want to succeed → ambitious のように、パターンで覚えておくと速く解けます。`,
    tags: ['英語', '英英辞典'],
  },
  {
    id: 'english-eng-dictionary-007',
    category: 'english',
    topic: 'eng_dictionary',
    subtopic: 'verb',
    difficulty: 1,
    question: '次の英文の説明に最も合う語を選びなさい。\n\nto say that you are sorry for something that you have done wrong',
    choices: ['complain', 'admire', 'apologize', 'forgive'],
    correctChoice: 2,
    recommendedTime: 20,
    explanation: `## 解き方

説明の意味は「自分がした悪いことについて、申し訳ないと言うこと」です。

say that you are sorry（謝罪の言葉を言う）に当てはまる動詞は apologize（謝る）です。complain は「不平を言う」、admire は「称賛する」で、どちらも謝罪とは関係がありません。forgive は「許す」で、謝られた側がとる行動なので、謝る側の行為を表す語ではありません。

答え：apologize

## ポイント

apologize（謝る）と forgive（許す）は、行為の主体が逆なので混同しないようにしましょう。apologize to（人）for（事柄）、forgive（人）for（事柄）の形もあわせて覚えておくと、空欄補充問題にも対応できます。`,
    tags: ['英語', '英英辞典'],
  },
  {
    id: 'english-eng-dictionary-008',
    category: 'english',
    topic: 'eng_dictionary',
    subtopic: 'money',
    difficulty: 2,
    question: '次の英文の説明に最も合う語を選びなさい。\n\nthe money that a company earns after paying all of its costs',
    choices: ['budget', 'salary', 'debt', 'profit'],
    correctChoice: 3,
    recommendedTime: 25,
    explanation: `## 解き方

説明の意味は「会社がすべての費用を支払った後に得るお金」です。

earns（稼ぐ）と after paying all of its costs（費用をすべて払った後に）がキーワードで、これは利益を表す profit が正解です。budget は「予算」で使う予定のお金、salary は「給料」で個人が受け取るお金、debt は「負債」で返すべきお金であり、いずれも費用を差し引いた後の儲けではありません。

答え：profit

## ポイント

会社のお金に関する語は、profit（利益）、loss（損失）、revenue / sales（売上）、cost / expense（費用）、budget（予算）、debt（負債）のように、収支のどこを指すかで整理しましょう。`,
    tags: ['英語', '英英辞典'],
  },
];
