import { expect, test } from 'claude-code/testing'

import type { App } from '../types'
import { doneCount, levelOpen, newApp, nextTarget, nodeState, restore, switchCourse } from './progress'

const done = (lang: string, level: string, n: number) => Object.fromEntries(Array.from({ length: n }, (_, i) => [`${lang}:${level}:${i}`, 3]))
const base = (over: Partial<App>): App => ({ ...newApp('de'), ...over })

test('stars and unlocks are kept per course', () => {
  const a = base({ stars: { ...done('de', 'A1', 20), ...done('fr', 'A1', 2) } })
  expect(doneCount(a, 'A1')).toBe(20)
  expect(levelOpen(a, 'A2')).toBe(true)
  const fr = { ...a, lang: 'fr' }
  expect(doneCount(fr, 'A1')).toBe(2)
  expect(levelOpen(fr, 'A2')).toBe(false)
  expect(nodeState(fr, 'A1', 2)).toBe('current')
  expect(nodeState(fr, 'A1', 3)).toBe('locked')
})

test('a placement unlock only opens the level in its own course', () => {
  const a = base({ tested: { 'de:B1': true } })
  expect(levelOpen(a, 'B1')).toBe(true)
  expect(levelOpen({ ...a, lang: 'fr' }, 'B1')).toBe(false)
})

test('switching course shows that course’s own place and keeps XP, streak and sound', () => {
  const a = base({ xp: 90, streak: 4, sound: false, stars: { ...done('de', 'A1', 20), ...done('fr', 'A1', 7) }, screen: 'words', level: 'A2' })
  const fr = switchCourse(a, 'fr')
  expect([fr.lang, fr.screen, fr.level, fr.unit]).toEqual(['fr', 'home', 'A1', 1])
  expect([fr.xp, fr.streak, fr.sound]).toEqual([90, 4, false])
  const back = switchCourse(fr, 'de')
  expect([back.lang, back.level]).toEqual(['de', 'A2'])
  // a course with no progress starts at the top of A1
  const fresh = switchCourse(a, 'es')
  expect([fresh.level, fresh.unit]).toEqual(['A1', 0])
})

test('progress saved before there were several courses is adopted by the first course', () => {
  const old = { xp: 50, streak: 2, lastDay: 100, goalDay: 100, dayXp: 12, stars: { 'A1:0': 3, 'A1:1': 2 }, tested: { B1: true } }
  const a = restore(old, 100, ['de', 'fr'])
  expect(a.lang).toBe('de')
  expect(a.stars).toEqual({ 'de:A1:0': 3, 'de:A1:1': 2 })
  expect(a.tested).toEqual({ 'de:B1': true })
  expect(a.dayXp).toBe(12)
  expect(a.level).toBe('B1')
})

test('saved progress keeps its course prefix, and an unknown saved course falls back to the first', () => {
  const a = restore({ lang: 'fr', stars: { 'fr:A1:0': 1, 'de:A1:0': 3 } }, 5, ['de', 'fr'])
  expect(a.lang).toBe('fr')
  expect(a.stars).toEqual({ 'fr:A1:0': 1, 'de:A1:0': 3 })
  expect(restore({ lang: 'zz' }, 5, ['de', 'fr']).lang).toBe('de')
})

test('streak and daily goal roll over with the day', () => {
  expect(restore({ streak: 3, lastDay: 9, goalDay: 9, dayXp: 20 }, 10, ['de']).streak).toBe(3)
  expect(restore({ streak: 3, lastDay: 9, goalDay: 9, dayXp: 20 }, 10, ['de']).dayXp).toBe(0)
  expect(restore({ streak: 3, lastDay: 7, goalDay: 7, dayXp: 20 }, 10, ['de']).streak).toBe(0)
  expect(restore({ streak: 3, lastDay: 10, goalDay: 10, dayXp: 20 }, 10, ['de']).dayXp).toBe(20)
})

test('next lesson follows the lesson, then the next level once it is open', () => {
  const a = base({ passed: true, level: 'A1', lesson: 3, stars: done('de', 'A1', 4) })
  expect(nextTarget(a)).toEqual(['A1', 4])
  const last = base({ passed: true, level: 'A1', lesson: 19, stars: done('de', 'A1', 20) })
  expect(nextTarget(last)).toEqual(['A2', 0])
  expect(nextTarget({ ...last, lesson: -1 })).toBeNull()
  expect(nextTarget({ ...last, passed: false })).toBeNull()
})
