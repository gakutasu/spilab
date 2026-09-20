import type { Question } from '../../types';

const INSTRUCTION = '次の英文の [A]〜[D] のうち、文法的に誤っているものを1つ選びなさい。';

export const engErrorQuestions: Question[] = [
  {
    id: 'english-eng-error-001',
    category: 'english',
    topic: 'eng_error',
    subtopic: 'agreement',
    difficulty: 2,
    question: `${INSTRUCTION}\n\nThe number of students [A: who] [B: want] to study abroad [C: have] increased [D: in recent years].`,
    choices: ['who', 'want', 'have', 'in recent years'],
    correctChoice: 2,
    recommendedTime: 50,
    explanation: `## 解き方

誤文訂正の問題です。主語と動詞の一致に注目します。文の主語は「The number of students」で、中心となる名詞は単数の「number」です。したがって動詞は「has increased」でなければならず、C の「have」が誤りです。

A の「who」は students を先行詞とする主格の関係代名詞で正しく、B の「want」は複数の students に一致しているので問題ありません。D の「in recent years」は現在完了と相性のよい表現です。

答え：have

## ポイント

「the number of＋複数名詞」は「〜の数」という意味で単数扱い、「a number of＋複数名詞」は「多くの〜」という意味で複数扱いです。主語に修飾語が付いているときは、中心の名詞を見つけてから動詞の形を判断しましょう。`,
    tags: ['誤文訂正', '主語と動詞の一致'],
  },
  {
    id: 'english-eng-error-002',
    category: 'english',
    topic: 'eng_error',
    subtopic: 'preposition',
    difficulty: 1,
    question: `${INSTRUCTION}\n\nMy sister [A: is married] [B: with] a doctor [C: who works] [D: at] a large hospital.`,
    choices: ['is married', 'with', 'who works', 'at'],
    correctChoice: 1,
    recommendedTime: 40,
    explanation: `## 解き方

前置詞の問題です。「〜と結婚している」は「be married to 〜」と表し、「with」は使いません。したがって B が誤りで、正しくは「is married to a doctor」です。

A の「is married」は結婚している状態を表す形で正しく、C の「who works」は a doctor を先行詞とする関係代名詞節、D の「at a large hospital」は勤務先を表す前置詞として自然です。

答え：with

## ポイント

日本語の「〜と」につられて with を選びやすい表現には注意が必要です。be married to、be familiar with（〜をよく知っている）と be familiar to（〜によく知られている）など、前置詞で意味が変わる表現は組み合わせごとに覚えましょう。`,
    tags: ['誤文訂正', '前置詞'],
  },
  {
    id: 'english-eng-error-003',
    category: 'english',
    topic: 'eng_error',
    subtopic: 'article',
    difficulty: 1,
    question: `${INSTRUCTION}\n\nI need [A: an advice] [B: from] someone [C: who] [D: knows] the law.`,
    choices: ['an advice', 'from', 'who', 'knows'],
    correctChoice: 0,
    recommendedTime: 40,
    explanation: `## 解き方

冠詞と名詞の可算・不可算に関する問題です。「advice（助言）」は不可算名詞なので不定冠詞「an」を付けられません。A が誤りで、「I need (some) advice」が正しい形です。数えたいときは「a piece of advice」と言います。

B の「from」は助言の出所を表す前置詞として適切です。C の「who」は先行詞 someone を受ける主格の関係代名詞、D の「knows」は先行詞 someone に一致した三人称単数の形で、いずれも正しい形です。

答え：an advice

## ポイント

information、advice、furniture、homework、news などは日本語では数えられそうでも英語では不可算名詞です。a / an を付けたり複数形にしたりせず、量は some、much、a piece of で示します。`,
    tags: ['誤文訂正', '冠詞', '不可算名詞'],
  },
  {
    id: 'english-eng-error-004',
    category: 'english',
    topic: 'eng_error',
    subtopic: 'superlative',
    difficulty: 2,
    question: `${INSTRUCTION}\n\nThis is [A: the most] [B: interesting] book [C: that] I have [D: never] read.`,
    choices: ['the most', 'interesting', 'that', 'never'],
    correctChoice: 3,
    recommendedTime: 50,
    explanation: `## 解き方

最上級と経験を表す現在完了の組み合わせに関する問題です。「これまでに読んだ中で最も面白い本」は「the most interesting book that I have ever read」と表します。D の「never」では「一度も読んだことのない本の中で最も面白い」という矛盾した意味になり誤りです。正しくは「ever」です。

A の「the most」は長い形容詞 interesting の最上級として正しく、C の「that」は最上級の付いた先行詞に用いる関係代名詞として自然です。

答え：never

## ポイント

「最上級＋名詞＋(that) S have ever＋過去分詞」は「Sがこれまで〜した中で最も…」を表す頻出パターンです。ever は「これまでに」、never は「一度も〜ない」で、never は最上級の文と意味が合いません。`,
    tags: ['誤文訂正', '最上級', '現在完了'],
  },
  {
    id: 'english-eng-error-005',
    category: 'english',
    topic: 'eng_error',
    subtopic: 'relative',
    difficulty: 2,
    question: `${INSTRUCTION}\n\nTokyo is the city [A: which] I [B: was born], [C: but] I [D: grew up] in Osaka.`,
    choices: ['which', 'was born', 'but', 'grew up'],
    correctChoice: 0,
    recommendedTime: 50,
    explanation: `## 解き方

関係詞の問題です。「私が生まれた都市」の「生まれた」は「I was born in the city」のように前置詞 in を必要とします。関係代名詞なら「in which I was born」、前置詞なしで場所を表すなら関係副詞「where」を使います。A の「which」だけでは in が欠けて文が成り立たないため誤りです。

B の「was born」は受動態の正しい形、C の「but」は対比の接続詞、D の「grew up in Osaka」は「大阪で育った」を正しく表しています。

答え：which

## ポイント

関係詞の後ろを見て、名詞が欠けていれば関係代名詞（which / that）、欠けていなければ関係副詞（where / when / why）を選びます。「I was born」は完全な文なので where（または in which）が入ります。`,
    tags: ['誤文訂正', '関係詞'],
  },
  {
    id: 'english-eng-error-006',
    category: 'english',
    topic: 'eng_error',
    subtopic: 'tense',
    difficulty: 3,
    question: `${INSTRUCTION}\n\nI [A: will call] you [B: as soon as] I [C: will get] to the office [D: tomorrow morning].`,
    choices: ['will call', 'as soon as', 'will get', 'tomorrow morning'],
    correctChoice: 2,
    recommendedTime: 50,
    explanation: `## 解き方

時制の問題です。「as soon as（〜するとすぐに）」や when、if などが導く時や条件の副詞節では、未来のことでも現在形で表します。したがって C の「will get」が誤りで、正しくは「I get to the office」です。

A の「will call」は主節の未来を表す形として正しく、B の「as soon as」は接続詞として適切です。D の「tomorrow morning」は時を示す副詞句で問題ありません。

答え：will get

## ポイント

時・条件を表す副詞節（when、as soon as、if、until など）の中では will を使わず現在形にします。ただし名詞節では will を使えるので、「I don't know when he will come.」のような文とは区別しましょう。`,
    tags: ['誤文訂正', '時制', '副詞節'],
  },
  {
    id: 'english-eng-error-007',
    category: 'english',
    topic: 'eng_error',
    subtopic: 'tense',
    difficulty: 2,
    question: `${INSTRUCTION}\n\nWhen I [A: got] home, I [B: realized] [C: that] I [D: have left] my keys at the office.`,
    choices: ['got', 'realized', 'that', 'have left'],
    correctChoice: 3,
    recommendedTime: 50,
    explanation: `## 解き方

時制の問題です。「家に着いた（got）」「気づいた（realized）」という過去の時点よりも前に「鍵を置き忘れた」ので、それより前の出来事は過去完了「had left」で表します。D の「have left」は現在完了で、過去の時点を基準にした文には使えません。

A の「got」と B の「realized」は過去形として正しく、C の「that」は realized の目的語となる名詞節を導く接続詞として適切です。

答え：have left

## ポイント

過去のある時点を基準に「その時までに〜していた」と述べるときは過去完了（had＋過去分詞）を使います。realized、found、noticed などの過去形の後の that 節で、それより前の出来事を述べるときが典型的な場面です。`,
    tags: ['誤文訂正', '時制', '過去完了'],
  },
  {
    id: 'english-eng-error-008',
    category: 'english',
    topic: 'eng_error',
    subtopic: 'comparative',
    difficulty: 1,
    question: `${INSTRUCTION}\n\nThis laptop is [A: much] [B: more lighter] [C: than] [D: the one] I used to have.`,
    choices: ['much', 'more lighter', 'than', 'the one'],
    correctChoice: 1,
    recommendedTime: 40,
    explanation: `## 解き方

比較級の問題です。light のような1音節の形容詞は語尾に -er を付けて比較級を作るので、「more lighter」は比較級を二重に作っており誤りです。正しくは「much lighter」です。

A の「much」は比較級を強調する副詞として正しく、C の「than」は比較の対象を導きます。D の「the one」は「the laptop」の代わりに使われる代名詞で、「私が以前持っていたもの」を自然に表しています。

答え：more lighter

## ポイント

比較級は「-er」か「more」のどちらか一方だけを使います。more を付けるのは interesting、difficult のような長い形容詞や -ly の副詞です。比較級の強調は very ではなく much、far、a lot を使う点も合わせて覚えましょう。`,
    tags: ['誤文訂正', '比較級'],
  },
];
