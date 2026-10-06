import { expect, test } from 'claude-code/testing'

import { LEVELS } from './course'
import type { Course } from './course'
import { COURSES } from './courses'
import { german } from './courses/de'
import { buildLesson, buildPractice, buildTest, lessonInfo, LESSONS_PER_LEVEL, tokens, unitIndex } from './engine'

// Every test below runs once per course, so a new language is checked the moment it is registered.
const courses = Object.values(COURSES)
const allLessons = (c: Course) => LEVELS.flatMap(lv => c.levels[lv].flatMap(u => u.lessons.map(l => ({ lv, l }))))
const NOUN = (c: Course) => c.article?.noun ?? /(?!)/

for (const course of courses) test(`[${course.code}] five levels, four units each, four content lessons plus a review per unit`, () => {
  expect(Object.keys(course.levels)).toEqual([...LEVELS])
  for (const lv of LEVELS) {
    expect(course.levels[lv].length).toBe(4)
    for (const u of course.levels[lv]) {
      expect(u.lessons.length).toBe(4)
      expect(u.tip.length).toBeGreaterThan(20)
    }
    expect(course.levels[lv].length * 5).toBe(LESSONS_PER_LEVEL)
  }
})

for (const course of courses) test(`[${course.code}] every lesson has 5 words and 2 sentences, and the first sentence has a gap in it`, () => {
  for (const { lv, l } of allLessons(course)) {
    expect(l.words.length).toBe(5)
    expect(l.sentences[0][0]).toMatch(/\[.+?\]/)
    for (const [de, en] of l.sentences) {
      expect(de.length).toBeGreaterThan(5)
      expect(en.length).toBeGreaterThan(5)
    }
    expect(lv).toBeTruthy()
  }
})

for (const course of courses) test(`[${course.code}] no target-language word or English gloss is used twice, so no puzzle has two right answers`, () => {
  const seen = new Map<string, string>()
  const dups: string[] = []
  const note = (kind: string, text: string, lv: string) => {
    const k = `${kind}:${text.toLowerCase()}`
    if (seen.has(k)) dups.push(`${kind} "${text}" in ${seen.get(k)} and ${lv}`)
    seen.set(k, lv)
  }
  for (const { lv, l } of allLessons(course)) {
    for (const [d, e] of l.words) {
      note('de', d, lv)
      note('en', e, lv)
    }
    for (const [d, e] of l.sentences) {
      note('sde', d, lv)
      note('sen', e, lv)
    }
  }
  expect(dups).toEqual([])
})

for (const course of courses) test(`[${course.code}] the gap word really occurs in its sentence`, () => {
  for (const { l } of allLessons(course)) {
    for (const [de] of l.sentences) {
      const m = /\[(.+?)\]/.exec(de)
      if (m) expect(de.replace(/[[\]]/g, '')).toContain(m[1])
    }
  }
})

const check = (e: ReturnType<typeof buildLesson>[number], label: string) => {
  if (e.kind === 'choice') {
    expect([label, e.options.length]).toEqual([label, e.options.length < 3 ? 4 : e.options.length])
    expect(e.options).toContain(e.answer)
    expect(new Set(e.options.map(o => o.toLowerCase())).size).toBe(e.options.length)
    expect(e.options.length).toBeGreaterThanOrEqual(3)
  } else if (e.kind === 'match') {
    expect(e.left.length).toBe(5)
    for (const t of e.left) expect(e.right).toContain(e.pairs[t])
  } else {
    const want = e.kind === 'spell' ? [...e.answer] : e.answer.split(' ')
    const bag = [...e.bank]
    for (const w of want) {
      const k = bag.indexOf(w)
      expect([label, w, k >= 0]).toEqual([label, w, true])
      bag.splice(k, 1)
    }
    expect(e.bank.join(e.kind === 'spell' ? '' : ' ')).not.toBe(e.answer)
  }
}

for (const course of courses) test(`[${course.code}] every lesson of every level generates solvable, varied puzzles`, () => {
  for (const lv of LEVELS) {
    for (let idx = 0; idx < LESSONS_PER_LEVEL; idx++) {
      for (const seed of [3, 4242]) {
        const ex = buildLesson(course, lv, idx, seed)
        const label = `${lv} #${idx} seed ${seed}`
        expect([label, ex.length >= 11 && ex.length <= 14]).toEqual([label, true])
        for (const e of ex) check(e, label)
        const kinds = new Set(ex.map(e => `${e.kind}:${e.title}`))
        expect(kinds.size).toBeGreaterThanOrEqual(7)
        expect(ex.filter(e => e.kind === 'choice' && e.auto).length + ex.filter(e => e.kind !== 'match' && 'auto' in e && e.auto).length).toBeGreaterThanOrEqual(2)
      }
    }
  }
})

for (const course of courses) test(`[${course.code}] placement quizzes exist for A2 to C1`, () => {
  for (const lv of LEVELS.slice(1)) {
    const ex = buildTest(course, lv, 7)
    expect(ex.length).toBe(12)
    for (const e of ex) check(e, `test ${lv}`)
  }
})

test('lesson info maps indexes to units, and every fifth lesson is the review (German)', () => {
  expect(lessonInfo(german, 'A1', 0).title).toBe('Greetings')
  expect(lessonInfo(german, 'A1', 4).review).toBe(true)
  expect(lessonInfo(german, 'C1', 19).review).toBe(true)
  expect(lessonInfo(german, 'B2', 7).unit.title).toBe('Umwelt & Zukunft')
  expect(tokens('Guten Morgen, wie geht es dir?')).toEqual(['Guten', 'Morgen', 'wie', 'geht', 'es', 'dir'])
})

for (const course of courses) test(`[${course.code}] options look alike: a noun answer is never given away by bare-word distractors`, () => {
  for (const lv of LEVELS) {
    for (let idx = 0; idx < LESSONS_PER_LEVEL; idx++) {
      for (const e of buildLesson(course, lv, idx, 11)) {
        if (e.kind === 'choice' && e.title === `How do you say this in ${course.name}?` && NOUN(course).test(e.answer)) {
          expect(e.options.every(o => NOUN(course).test(o))).toBe(true)
        }
        if (e.kind === 'choice' && e.title === 'Select the correct meaning' && e.answer.startsWith('to ')) {
          expect(e.options.every(o => o.startsWith('to '))).toBe(true)
        }
      }
    }
  }
})

for (const course of courses) test(`[${course.code}] fill-the-gap never offers a word from the sentence’s own unit as a wrong option`, () => {
  for (const lv of LEVELS) {
    for (let idx = 0; idx < LESSONS_PER_LEVEL; idx++) {
      const theme = new Set(course.levels[lv][unitIndex(idx)].lessons.flatMap(l => l.words.map(w => (course.article ? w[0].replace(course.article.strip, '') : w[0]).toLowerCase())))
      for (const seed of [1, 99]) {
        for (const e of buildLesson(course, lv, idx, seed)) {
          if (e.kind !== 'choice' || e.title !== 'Fill in the missing word') continue
          for (const o of e.options) if (o !== e.answer) expect([lv, idx, o, theme.has(o.toLowerCase())]).toEqual([lv, idx, o, false])
        }
      }
    }
  }
})

for (const course of courses) test(`[${course.code}] practice mixes whatever lessons are finished, even just one`, () => {
  for (const lv of LEVELS) {
    for (const done of [[0], [0, 1], [0, 1, 2, 3, 4, 5]]) {
      const ex = buildPractice(course, lv, done, 5)
      expect(ex.length).toBeGreaterThanOrEqual(9)
      for (const e of ex) check(e, `practice ${lv} ${done.length}`)
    }
  }
})

for (const course of courses) test(`[${course.code}] the article puzzle is only for single nouns, never for idioms`, () => {
  for (const lv of LEVELS) {
    for (let idx = 0; idx < LESSONS_PER_LEVEL; idx++) {
      for (const e of buildLesson(course, lv, idx, 5)) {
        if (e.kind === 'choice' && e.title === 'Choose the correct article') {
          expect(e.prompt.replace('＿＿＿ ', '')).not.toContain(' ')
        }
      }
    }
  }
})

for (const course of courses) test(`[${course.code}] in a unit review the second gap sentence is not shown or spoken by an earlier puzzle`, () => {
  for (const lv of LEVELS) {
    for (const idx of [4, 9, 14, 19]) {
      for (const seed of [1, 7, 33, 500, 9001]) {
        const ex = buildLesson(course, lv, idx, seed)
        const gaps = ex.filter(e => e.kind === 'choice' && e.title === 'Fill in the missing word')
        for (const g of gaps) {
          const at = ex.indexOf(g)
          const full = g.kind === 'choice' ? g.after : ''
          for (const earlier of ex.slice(0, at)) {
            const shown = earlier.kind === 'match' ? '' : [earlier.prompt, earlier.say ?? ''].join(' ')
            expect([lv, idx, seed, full && shown.includes(full)]).toEqual([lv, idx, seed, false])
          }
        }
      }
    }
  }
})

// A language without gendered articles and a different name: nothing may still say "German" or ask for an article.
const articleless: Course = { ...german, code: 'xx', name: 'Testish', voices: ['Nobody'], article: undefined, capitalNouns: false }
test('the engine is language-neutral: a made-up course gets its own name and no article puzzles', () => {
  for (const lv of LEVELS) {
    for (let idx = 0; idx < LESSONS_PER_LEVEL; idx++) {
      const ex = buildLesson(articleless, lv, idx, 3)
      for (const e of ex) {
        check(e, `xx ${lv} ${idx}`)
        expect(e.title).not.toContain('German')
        expect(e.title).not.toBe('Choose the correct article')
      }
      expect(ex.some(e => e.title === 'Spell this word in Testish' || e.title === 'How do you say this in Testish?')).toBe(true)
    }
  }
})
