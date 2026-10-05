import { expect, test } from 'claude-code/testing'

import { buildLesson } from './engine'
import { COURSES, LEVELS } from './lessons'

test('every language covers A1 to C1 with complete lessons', () => {
  for (const [lang, course] of Object.entries(COURSES)) {
    expect(Object.keys(course)).toEqual([...LEVELS])
    for (const lv of LEVELS) {
      expect(course[lv].length).toBe(2)
      for (const l of course[lv]) {
        expect(l.words.length).toBe(5)
        expect(l.sentences[0][0]).toMatch(/\[.+\]/)
        expect(new Set(l.words.map(w => w[0])).size).toBe(5)
        expect(new Set(l.words.map(w => w[1])).size).toBe(5)
      }
    }
    expect(lang.length).toBeGreaterThan(0)
  }
})

test('every generated exercise is solvable and well formed', () => {
  for (const lang of Object.keys(COURSES)) {
    for (const lv of LEVELS) {
      for (let idx = 0; idx < 2; idx++) {
        for (const seed of [1, 42, 9999]) {
          const ex = buildLesson(lang, lv, idx, seed)
          expect(ex.length).toBe(7)
          expect(new Set(ex.map(e => e.kind)).size).toBeGreaterThanOrEqual(3)
          for (const e of ex) {
            if (e.kind === 'choice') {
              expect(e.options.length).toBe(4)
              expect(new Set(e.options).size).toBe(4)
              expect(new Set(e.options.map(o => o.toLowerCase())).size).toBe(4)
              expect(e.options).toContain(e.answer)
            } else if (e.kind === 'match') {
              expect(e.left.length).toBe(5)
              for (const t of e.left) expect(e.right).toContain(e.pairs[t])
            } else {
              const joined = e.kind === 'spell' ? '' : ' '
              expect([...e.bank].sort()).toEqual([...(e.kind === 'spell' ? [...e.answer] : e.answer.split(' '))].sort())
              expect(e.bank.join(joined)).not.toBe(e.answer)
            }
          }
        }
      }
    }
  }
})
