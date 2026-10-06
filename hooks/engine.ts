import type { Exercise, Level } from '../types'
import { LEVELS, UNITS } from './lessons'
import type { Lesson, Pair, Unit } from './lessons'

export const shuffle = <T,>(items: readonly T[], seed: number): T[] => {
  const out = [...items]
  let s = (Math.abs(seed) % 2147483646) + 1
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 48271) % 2147483647
    const j = s % (i + 1)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

// Only "article + one word" is a noun: idioms like "die Nase voll haben" start with an article too.
const ARTICLE = /^(der|die|das) /
const NOUN = /^(der|die|das) \S+$/
export const hasArticle = (w: string) => NOUN.test(w)
export const stripArt = (w: string) => (NOUN.test(w) ? w.replace(ARTICLE, '') : w)
export const plain = (s: string) => s.replace(/[[\]]/g, '')
// Word tokens of a sentence: punctuation does not count, as in Duolingo.
export const tokens = (s: string) => plain(s).replace(/[,.!?;:]/g, '').split(/\s+/).filter(Boolean)
const isCap = (w: string) => /^[A-ZÄÖÜ]/.test(w)
const hasGap = (p: Pair) => /\[.+?\]/.test(p[0])

const wordsOf = (units: Unit[]): Pair[] => units.flatMap(u => u.lessons.flatMap(l => l.words))
const sentencesOf = (units: Unit[]): Pair[] => units.flatMap(u => u.lessons.flatMap(l => [...l.sentences]))
const levelWords = (level: string) => wordsOf(UNITS[level])
const levelSentences = (level: string) => sentencesOf(UNITS[level])
const courseWords = LEVELS.flatMap(levelWords)

const unique = (items: string[]) => [...new Map(items.map(i => [i.toLowerCase(), i])).values()]

// Options that look alike give nothing away: nouns with nouns, verbs with verbs.
const shapeDe = (w: string) => (hasArticle(w) ? 'noun' : w.includes(' ') ? 'phrase' : 'word')
const shapeEn = (w: string) => (w.startsWith('to ') ? 'verb' : w.includes(' ') ? 'phrase' : 'word')

// Three wrong options for `answer`: the same shape and level first, then anything from the course.
const wrongs = (pool: string[], fallback: string[], answer: string, seed: number, shape: (w: string) => string): string[] => {
  const ok = (w: string) => w.toLowerCase() !== answer.toLowerCase()
  const alike = (w: string) => shape(w) === shape(answer)
  const near = shuffle(unique(pool).filter(w => ok(w) && alike(w)), seed)
  const far = shuffle(unique(fallback).filter(w => ok(w) && alike(w) && !near.includes(w)), seed + 5)
  const rest = shuffle(unique([...pool, ...fallback]).filter(w => ok(w) && !near.includes(w) && !far.includes(w)), seed + 9)
  return [...near, ...far, ...rest].slice(0, 3)
}

type Ctx = { level: string; seed: number }

const chooseDe = ({ level, seed }: Ctx, [t, e]: Pair): Exercise => ({
  kind: 'choice',
  title: 'Select the correct meaning',
  prompt: `“${t}”`,
  say: t,
  answer: e,
  options: shuffle([e, ...wrongs(levelWords(level).map(w => w[1]), courseWords.map(w => w[1]), e, seed, shapeEn)], seed + 3),
})

const chooseEn = ({ level, seed }: Ctx, [t, e]: Pair): Exercise => ({
  kind: 'choice',
  title: 'How do you say this in German?',
  prompt: `“${e}”`,
  after: t,
  answer: t,
  options: shuffle([t, ...wrongs(levelWords(level).map(w => w[0]), courseWords.map(w => w[0]), t, seed, shapeDe)], seed + 3),
})

const listenWord = ({ level, seed }: Ctx, [t, e]: Pair): Exercise => ({
  kind: 'choice',
  title: 'What did you hear?',
  prompt: 'Listen carefully…',
  say: t,
  auto: true,
  answer: e,
  options: shuffle([e, ...wrongs(levelWords(level).map(w => w[1]), courseWords.map(w => w[1]), e, seed, shapeEn)], seed + 3),
})

const article = (_: Ctx, [t, e]: Pair): Exercise => ({
  kind: 'choice',
  title: 'Choose the correct article',
  prompt: `＿＿＿ ${stripArt(t)}`,
  context: e,
  after: t,
  answer: ARTICLE.exec(t)![1],
  options: ['der', 'die', 'das'],
})

const spellable = (w: string) => !stripArt(w).includes(' ') && stripArt(w).length <= 12

const spell = ({ seed }: Ctx, [t, e]: Pair, hear: boolean): Exercise => {
  const word = stripArt(t)
  const letters = [...word]
  let bank = shuffle(letters, seed)
  for (let k = 1; bank.join('') === word && k < 20; k++) bank = shuffle(letters, seed + k * 101)
  return {
    kind: 'spell',
    title: hear ? 'Type what you hear' : 'Spell this word in German',
    prompt: hear ? 'Listen and spell the word' : `“${e}”`,
    say: hear ? word : undefined,
    auto: hear,
    after: t,
    answer: word,
    bank,
  }
}

const cloze = ({ level, seed }: Ctx, [t, e]: Pair): Exercise => {
  const m = /\[(.+?)\]/.exec(t)
  const answer = m ? m[1] : tokens(t)[0]
  const multi = answer.includes(' ')
  const atStart = t.startsWith('[')
  const cap = isCap(answer)
  // Words from the sentence's own unit are off limits as wrong options: "Wasser" and "Milch" both fit "ein Glas ＿＿＿".
  const theme = new Set(wordsOf(UNITS[level].filter(u => sentencesOf([u]).some(p => p[0] === t))).map(w => stripArt(w[0]).toLowerCase()))
  const fresh = (w: string) => !theme.has(w.toLowerCase()) && w.toLowerCase() !== answer.toLowerCase()
  const pool = unique(levelWords(level).map(w => stripArt(w[0]))).filter(w => w.includes(' ') === multi)
  const more = unique(courseWords.map(w => stripArt(w[0]))).filter(w => w.includes(' ') === multi)
  const same = (list: string[]) => (atStart ? list : list.filter(w => isCap(w) === cap))
  const near = shuffle(same(pool).filter(fresh), seed)
  const far = shuffle(same(more).filter(w => fresh(w) && !near.includes(w)), seed + 5)
  const fix = atStart ? (w: string) => w.charAt(0).toUpperCase() + w.slice(1) : (w: string) => w
  // Idiom blanks may find too few look-alikes: relax capitalisation, then phrase length.
  const spare = shuffle(more.filter(w => fresh(w) && !near.includes(w) && !far.includes(w)), seed + 6)
  const anyWord = shuffle(unique(courseWords.map(w => stripArt(w[0]))).filter(w => fresh(w) && !near.includes(w) && !far.includes(w) && !spare.includes(w)), seed + 7)
  const wrong = [...near, ...far, ...spare, ...anyWord].slice(0, 3).map(fix)
  return {
    kind: 'choice',
    title: 'Fill in the missing word',
    prompt: plain(t.replace(/\[.+?\]/, '＿＿＿')),
    context: e,
    after: plain(t),
    answer,
    options: shuffle([answer, ...wrong], seed + 9),
  }
}

const translateChoice = ({ level, seed }: Ctx, [t, e]: Pair, hear: boolean): Exercise => ({
  kind: 'choice',
  title: hear ? 'What does the speaker say?' : 'Select the correct translation',
  prompt: hear ? 'Listen carefully…' : plain(t),
  say: plain(t),
  auto: hear,
  answer: e,
  options: shuffle([e, ...wrongs(levelSentences(level).map(s => s[1]), levelSentences(level).map(s => s[1]), e, seed, () => '')], seed + 11),
})

const decoysFor = (level: string, words: string[], n: number, seed: number): string[] => {
  const have = new Set(words.map(w => w.toLowerCase()))
  const pool = unique(levelSentences(level).flatMap(s => tokens(s[0]))).filter(w => !have.has(w.toLowerCase()) && w.length > 1)
  return shuffle(pool, seed).slice(0, n)
}

const orderedBank = (words: string[], seed: number) => {
  let bank = shuffle(words, seed)
  for (let k = 1; bank.join(' ') === words.join(' ') && k < 20 && words.length > 1; k++) bank = shuffle(words, seed + k * 101)
  return bank
}

const buildEnDe = ({ level, seed }: Ctx, [t, e]: Pair, decoys: number): Exercise => {
  const words = tokens(t)
  return { kind: 'build', title: 'Translate this sentence', prompt: e, after: words.join(' '), answer: words.join(' '), bank: orderedBank([...words, ...decoysFor(level, words, decoys, seed)], seed) }
}

const buildDeEn = ({ seed }: Ctx, [t, e]: Pair): Exercise => {
  const words = tokens(e)
  return { kind: 'build', title: 'Translate into English', prompt: plain(t), say: plain(t), answer: words.join(' '), bank: orderedBank(words, seed) }
}

const listenBuild = ({ level, seed }: Ctx, [t]: Pair, decoys: number): Exercise => {
  const words = tokens(t)
  return {
    kind: 'build',
    title: 'Type what you hear',
    prompt: 'Listen and build the sentence',
    say: plain(t),
    auto: true,
    answer: words.join(' '),
    bank: orderedBank([...words, ...decoysFor(level, words, decoys, seed)], seed),
  }
}

const match = ({ seed }: Ctx, pairs: Pair[]): Exercise => ({
  kind: 'match',
  title: 'Tap the matching pairs',
  left: shuffle(pairs.map(p => p[0]), seed),
  right: shuffle(pairs.map(p => p[1]), seed + 17),
  pairs: Object.fromEntries(pairs),
})

const compact = (list: (Exercise | undefined)[]) => list.filter((x): x is Exercise => x !== undefined)

/** A lesson of five words and two sentences, with the puzzles ramping up as the unit goes on. */
const contentLesson = (level: string, l: Lesson, p: number, seed: number): Exercise[] => {
  const c = (n: number): Ctx => ({ level, seed: seed + n * 7 })
  const w = l.words
  const [s0, s1] = l.sentences
  const noun = w.find(x => hasArticle(x[0]))
  const spellW = w.filter(x => spellable(x[0]))
  const hearSpell = p >= 2
  return compact([
    chooseDe(c(1), w[0]),
    chooseEn(c(2), w[1]),
    match(c(3), w),
    listenWord(c(4), w[2]),
    noun ? article(c(5), noun) : chooseEn(c(5), w[3]),
    spellW[0] ? spell(c(6), spellW[0], hearSpell) : chooseDe(c(6), w[3]),
    cloze(c(7), s0),
    translateChoice(c(8), s1, false),
    buildEnDe(c(9), s0, p),
    p >= 2 ? listenBuild(c(10), s0, 1) : translateChoice(c(10), s0, true),
    buildDeEn(c(11), s1),
    p >= 1 ? (spellW[1] ? spell(c(12), spellW[1], true) : listenWord(c(12), w[4])) : chooseDe(c(12), w[4]),
    p >= 3 ? buildEnDe(c(13), s1, 2) : undefined,
  ])
}

/** The unit review: a mix of everything taught in the unit, hard puzzles first. */
const review = (level: string, unit: Unit, seed: number): Exercise[] => {
  const c = (n: number): Ctx => ({ level, seed: seed + n * 7 })
  const words = shuffle(wordsOf([unit]), seed)
  const all = shuffle(sentencesOf([unit]), seed + 1)
  // The two gap sentences are kept apart from the five others, so a gap is never filled in by an earlier puzzle.
  const gaps = all.filter(hasGap).slice(0, 2)
  const rest = all.filter(p => !gaps.includes(p))
  const nouns = words.filter(x => hasArticle(x[0]))
  const spellW = words.filter(x => spellable(x[0]))
  return compact([
    match(c(1), words.slice(0, 5)),
    chooseDe(c(2), words[5]),
    listenWord(c(3), words[6]),
    nouns[0] ? article(c(4), nouns[0]) : chooseEn(c(4), words[7]),
    cloze(c(5), gaps[0]),
    spellW[0] ? spell(c(6), spellW[0], true) : chooseEn(c(6), words[8]),
    translateChoice(c(7), rest[0], false),
    buildEnDe(c(8), rest[1], 2),
    listenBuild(c(9), rest[2], 1),
    match(c(10), words.slice(10, 15)),
    buildDeEn(c(11), rest[3]),
    translateChoice(c(12), rest[4], true),
    gaps[1] ? cloze(c(13), gaps[1]) : undefined,
    buildEnDe(c(14), rest[5], 2),
  ])
}

/** Ten mixed puzzles on whichever lessons the learner has finished. */
export const buildPractice = (level: Level, done: number[], seed: number): Exercise[] => {
  const lessons = done.filter(i => !isReview(i)).map(i => lessonInfo(level, i).lesson!)
  const c = (n: number): Ctx => ({ level, seed: seed + n * 7 })
  const words = shuffle(lessons.flatMap(l => l.words), seed)
  const sents = shuffle(lessons.flatMap(l => [...l.sentences]), seed + 1)
  const gaps = sents.filter(hasGap)
  const nouns = words.filter(x => hasArticle(x[0]))
  const w = (n: number) => words[n % words.length]
  const sn = (n: number) => sents[n % sents.length]
  return compact([
    chooseDe(c(1), w(0)),
    chooseEn(c(2), w(1)),
    match(c(3), words.slice(0, 5)),
    listenWord(c(4), w(5)),
    nouns[0] ? article(c(5), nouns[0]) : chooseEn(c(5), w(6)),
    cloze(c(6), gaps[0]),
    translateChoice(c(7), sn(0), false),
    buildEnDe(c(8), sn(1), 1),
    translateChoice(c(9), sn(2), true),
    chooseDe(c(10), w(7)),
  ])
}

/** The placement quiz that opens `level` by testing the one below it. */
export const buildTest = (level: Level, seed: number): Exercise[] => {
  const src = LEVELS[Math.max(0, LEVELS.indexOf(level) - 1)]
  const c = (n: number): Ctx => ({ level: src, seed: seed + n * 7 })
  const words = shuffle(levelWords(src), seed)
  const all = shuffle(levelSentences(src), seed + 1)
  const gaps = all.filter(hasGap).slice(0, 2)
  const sents = all.filter(p => !gaps.includes(p))
  const nouns = words.filter(x => hasArticle(x[0]))
  return compact([
    chooseDe(c(1), words[0]),
    chooseEn(c(2), words[1]),
    match(c(3), words.slice(2, 7)),
    listenWord(c(4), words[7]),
    nouns[0] ? article(c(5), nouns[0]) : chooseEn(c(5), words[8]),
    cloze(c(6), gaps[0]),
    translateChoice(c(7), sents[0], false),
    buildEnDe(c(8), sents[1], 2),
    listenBuild(c(9), sents[2], 1),
    translateChoice(c(10), sents[3], true),
    buildDeEn(c(11), sents[4]),
    cloze(c(12), gaps[1]),
  ])
}

export const LESSONS_PER_LEVEL = 20
export const isReview = (idx: number) => idx % 5 === 4
export const unitIndex = (idx: number) => Math.floor(idx / 5)

export const lessonInfo = (level: string, idx: number) => {
  const unit = UNITS[level][unitIndex(idx)]
  const review = isReview(idx)
  return { unit, review, lesson: review ? undefined : unit.lessons[idx % 5], title: review ? 'Unit review' : unit.lessons[idx % 5].title }
}

export const buildLesson = (level: string, idx: number, seed: number): Exercise[] => {
  const { unit, review: isRev, lesson } = lessonInfo(level, idx)
  return isRev ? review(level, unit, seed) : contentLesson(level, lesson!, idx % 5, seed)
}

export const bar = (n: number, of: number, width = 12) => {
  const full = of === 0 ? 0 : Math.min(width, Math.round((n / of) * width))
  return '█'.repeat(full) + '░'.repeat(width - full)
}

export const heartsRow = (n: number, max: number) => '❤️'.repeat(Math.max(0, n)) + '🤍'.repeat(Math.max(0, max - n))
