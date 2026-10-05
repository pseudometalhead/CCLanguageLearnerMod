import type { Exercise } from '../types'
import { COURSES } from './lessons'
import type { Pair } from './lessons'

export const shuffle = <T,>(items: readonly T[], seed: number): T[] => {
  const out = [...items]
  let s = (seed % 2147483647) + 1
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 48271) % 2147483647
    const j = s % (i + 1)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

const differs = <T,>(items: T[], seed: number, same: (a: T[]) => boolean): T[] => {
  let out = shuffle(items, seed)
  for (let k = 1; same(out) && k < 20 && items.length > 1; k++) out = shuffle(items, seed + k * 101)
  return out
}

const spellable = (w: string) => w.replace(/ /g, '').length <= 12

// Three wrong options for `answer`: same level first, then the rest of the course.
const distract = (lang: string, level: string, answer: string, side: 0 | 1, seed: number): string[] => {
  const course = COURSES[lang]
  const near = course[level].flatMap(l => l.words.map(w => w[side]))
  const far = Object.values(course).flatMap(ls => ls.flatMap(l => l.words.map(w => w[side])))
  const pick = (pool: string[]) => [...new Set(pool)].filter(w => w.toLowerCase() !== answer.toLowerCase())
  const first = shuffle(pick(near), seed)
  const rest = shuffle(pick(far).filter(w => !first.includes(w)), seed + 5)
  return [...first, ...rest].slice(0, 3)
}

const choice = (lang: string, level: string, [t, e]: Pair, toEnglish: boolean, seed: number): Exercise => {
  const answer = toEnglish ? e : t
  return {
    kind: 'choice',
    prompt: toEnglish ? `What does “${t}” mean?` : `How do you say “${e}” in ${lang}?`,
    answer,
    options: shuffle([answer, ...distract(lang, level, answer, toEnglish ? 1 : 0, seed)], seed + 3),
  }
}

const spell = ([t, e]: Pair, seed: number): Exercise => {
  const letters = [...t.replace(/ /g, '')]
  return { kind: 'spell', prompt: `Spell “${e}”`, answer: letters.join(''), bank: differs(letters, seed, a => a.join('') === letters.join('')) }
}

const cloze = (lang: string, level: string, [t, e]: Pair, seed: number): Exercise => {
  const m = /\[(.+?)\]/.exec(t)
  const answer = m ? m[1] : t.split(' ')[0]
  // A blank at the start of the sentence is capitalised: capitalise the options too, so case gives nothing away.
  const cap = t.startsWith('[') ? (w: string) => w.charAt(0).toUpperCase() + w.slice(1) : (w: string) => w
  return {
    kind: 'choice',
    prompt: 'Fill in the blank',
    context: `${t.replace(/\[.+?\]/, '＿＿＿＿')}\n${e}`,
    answer,
    options: shuffle([answer, ...distract(lang, level, answer, 0, seed).map(cap)], seed + 9),
  }
}

const build = ([t, e]: Pair, seed: number): Exercise => {
  const words = t.replace(/[[\]]/g, '').split(' ')
  return { kind: 'build', prompt: e, answer: words.join(' '), bank: differs(words, seed, a => a.join(' ') === words.join(' ')) }
}

const match = (lesson: Pair[], seed: number): Exercise => ({
  kind: 'match',
  left: shuffle(lesson.map(w => w[0]), seed),
  right: shuffle(lesson.map(w => w[1]), seed + 17),
  pairs: Object.fromEntries(lesson),
})

export const buildLesson = (lang: string, level: string, idx: number, seed: number): Exercise[] => {
  const l = COURSES[lang][level][idx]
  const w = l.words
  const short = w.filter(p => spellable(p[0]))
  const out: Exercise[] = [
    choice(lang, level, w[0], true, seed),
    match(w, seed + 1),
    short[0] ? spell(short[0], seed + 2) : choice(lang, level, w[1], false, seed + 2),
    cloze(lang, level, l.sentences[0], seed + 3),
    choice(lang, level, w[2], false, seed + 4),
    build(l.sentences[1], seed + 5),
    short[1] ? spell(short[1], seed + 6) : choice(lang, level, w[3], true, seed + 6),
  ]
  return out
}

export const bar = (n: number, of: number, width = 12) => {
  const full = of === 0 ? 0 : Math.round((n / of) * width)
  return '█'.repeat(full) + '░'.repeat(width - full)
}

export const heartsRow = (n: number, max: number) => '❤️'.repeat(Math.max(0, n)) + '🤍'.repeat(Math.max(0, max - n))
