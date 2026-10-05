import { expect, test } from 'claude-code/testing'

import { buildLesson, buildPractice, buildTest, lessonInfo, LESSONS_PER_LEVEL, tokens, unitIndex } from './engine'
import { LEVELS, UNITS } from './lessons'

const allLessons = () => LEVELS.flatMap(lv => UNITS[lv].flatMap(u => u.lessons.map(l => ({ lv, l }))))

test('five levels, four units each, four content lessons plus a review per unit', () => {
  expect(Object.keys(UNITS)).toEqual([...LEVELS])
  for (const lv of LEVELS) {
    expect(UNITS[lv].length).toBe(4)
    for (const u of UNITS[lv]) {
      expect(u.lessons.length).toBe(4)
      expect(u.tip.length).toBeGreaterThan(20)
    }
    expect(UNITS[lv].length * 5).toBe(LESSONS_PER_LEVEL)
  }
})

test('every lesson has 5 words and 2 sentences, and the first sentence has a gap in it', () => {
  for (const { lv, l } of allLessons()) {
    expect(l.words.length).toBe(5)
    expect(l.sentences[0][0]).toMatch(/\[.+?\]/)
    for (const [de, en] of l.sentences) {
      expect(de.length).toBeGreaterThan(5)
      expect(en.length).toBeGreaterThan(5)
    }
    expect(lv).toBeTruthy()
  }
})

test('no German word or English gloss is used twice, so no puzzle has two right answers', () => {
  const seen = new Map<string, string>()
  const dups: string[] = []
  const note = (kind: string, text: string, lv: string) => {
    const k = `${kind}:${text.toLowerCase()}`
    if (seen.has(k)) dups.push(`${kind} "${text}" in ${seen.get(k)} and ${lv}`)
    seen.set(k, lv)
  }
  for (const { lv, l } of allLessons()) {
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

test('the gap word really occurs in its sentence', () => {
  for (const { l } of allLessons()) {
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

test('every lesson of every level generates solvable, varied puzzles', () => {
  for (const lv of LEVELS) {
    for (let idx = 0; idx < LESSONS_PER_LEVEL; idx++) {
      for (const seed of [3, 4242]) {
        const ex = buildLesson(lv, idx, seed)
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

test('placement quizzes exist for A2 to C1', () => {
  for (const lv of LEVELS.slice(1)) {
    const ex = buildTest(lv, 7)
    expect(ex.length).toBe(12)
    for (const e of ex) check(e, `test ${lv}`)
  }
})

test('lesson info maps indexes to units, and every fifth lesson is the review', () => {
  expect(lessonInfo('A1', 0).title).toBe('Greetings')
  expect(lessonInfo('A1', 4).review).toBe(true)
  expect(lessonInfo('C1', 19).review).toBe(true)
  expect(lessonInfo('B2', 7).unit.title).toBe('Umwelt & Zukunft')
  expect(tokens('Guten Morgen, wie geht es dir?')).toEqual(['Guten', 'Morgen', 'wie', 'geht', 'es', 'dir'])
})

test('options look alike: a noun answer is never given away by bare-word distractors', () => {
  for (const lv of LEVELS) {
    for (let idx = 0; idx < LESSONS_PER_LEVEL; idx++) {
      for (const e of buildLesson(lv, idx, 11)) {
        if (e.kind === 'choice' && e.title === 'How do you say this in German?' && /^(der|die|das) /.test(e.answer)) {
          expect(e.options.every(o => /^(der|die|das) /.test(o))).toBe(true)
        }
        if (e.kind === 'choice' && e.title === 'Select the correct meaning' && e.answer.startsWith('to ')) {
          expect(e.options.every(o => o.startsWith('to '))).toBe(true)
        }
      }
    }
  }
})

test('fill-the-gap never offers a word from the sentence’s own unit as a wrong option', () => {
  for (const lv of LEVELS) {
    for (let idx = 0; idx < LESSONS_PER_LEVEL; idx++) {
      const theme = new Set(UNITS[lv][unitIndex(idx)].lessons.flatMap(l => l.words.map(w => w[0].replace(/^(der|die|das) /, '').toLowerCase())))
      for (const seed of [1, 99]) {
        for (const e of buildLesson(lv, idx, seed)) {
          if (e.kind !== 'choice' || e.title !== 'Fill in the missing word') continue
          for (const o of e.options) if (o !== e.answer) expect([lv, idx, o, theme.has(o.toLowerCase())]).toEqual([lv, idx, o, false])
        }
      }
    }
  }
})

test('practice mixes whatever lessons are finished, even just one', () => {
  for (const lv of LEVELS) {
    for (const done of [[0], [0, 1], [0, 1, 2, 3, 4, 5]]) {
      const ex = buildPractice(lv, done, 5)
      expect(ex.length).toBeGreaterThanOrEqual(9)
      for (const e of ex) check(e, `practice ${lv} ${done.length}`)
    }
  }
})
