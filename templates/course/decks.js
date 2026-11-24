/* Practice decks used by the built-in widgets. Reference them in a section with W('bucketGame', 'deckId') etc. */

// Bucket game: sort cards into boxes. items: [en, zh, correctBucketIndex, optional [en, zh] note shown when correct]
DECK.bucket.example = { t: ['Sort each item into its group', '把每一项放进它所属的类别'],
  buckets: [['Group A', 'A 组'], ['Group B', 'B 组']],
  items: [['Item that belongs to A', '属于 A 的项', 0], ['Item that belongs to B', '属于 B 的项', 1, ['why it is B', '为什么是 B']]] };
// code: true → items are code snippets shown in monospace (zh may be '')

// Flashcards: [front en, front zh, back en, back zh]
DECK.flash.ch1 = { t: ['Chapter 1 flashcards', '第 1 章记忆卡'], cards: [
  ['Term', '术语', 'Definition in the lecturer’s words.', '讲师原话的定义。']] };

// Code cloze: blanks are ⟦answer⟧; alternatives ⟦a¦b⟧ (whitespace is ignored when checking). Use String.raw so \n stays literal.
DECK.cloze.example = { t: ['Complete the code', '补全代码'], code: String.raw`
  int square(int x)
  {
     return ⟦x * x¦x*x⟧;
  }`, note: ['Optional hint shown under the code.', '可选：显示在代码下方的提示。'] };

// Judge drill: is this valid? items: [code, 1 = valid / 0 = error, why en, why zh]
DECK.judge.example = { t: ['Valid C++ or compile error?', '合法的 C++ 还是编译错误？'], items: [
  ['int x = 5;', 1, 'A normal declaration.', '普通声明。'],
  ['int = 5;', 0, 'A variable needs a name.', '变量必须有名字。']] };
