import { expect, test } from 'claude-code/testing'

import type { App } from '../types'
import { doneCount, levelOpen, newApp, nextTarget, newLearner, nodeState, placedLevel, primaryKey, placedTested, restore, switchCourse } from './progress'

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

test('the level check places you after the last stage cleared and opens the levels up to it', () => {
  expect(placedLevel(0)).toBe('A1')
  expect(placedLevel(2)).toBe('B1')
  expect(placedLevel(5)).toBe('C1') // cleared everything: stay on the top level
  const a = base({})
  expect(levelOpen({ ...a, tested: placedTested(a, 0) }, 'A2')).toBe(false)
  const b = { ...a, tested: placedTested(a, 2) }
  expect(['A2', 'B1'].every(l => levelOpen(b, l))).toBe(true)
  expect(levelOpen(b, 'B2')).toBe(false)
  expect(Object.keys(placedTested(a, 5)).sort()).toEqual(['de:A2', 'de:B1', 'de:B2', 'de:C1'])
  // another course keeps its own locks
  expect(levelOpen({ ...b, lang: 'fr' }, 'B1')).toBe(false)
})

test('after a test every lesson of the levels below the placed one is playable, the placed level starts at its first lesson', () => {
  const a = base({})
  const b = { ...a, tested: placedTested(a, 2) } // placed at B1
  expect(nodeState(b, 'A1', 7)).toBe('current')
  expect(nodeState(b, 'A2', 13)).toBe('current')
  expect(nodeState(b, 'B1', 0)).toBe('current')
  expect(nodeState(b, 'B1', 3)).toBe('locked')
  expect(nodeState(b, 'B2', 0)).toBe('locked')
  // stars still win, and another course is unaffected
  expect(nodeState({ ...b, stars: done('de', 'A1', 1) }, 'A1', 0)).toBe('done')
  expect(nodeState({ ...b, lang: 'fr' }, 'A1', 7)).toBe('locked')
  // without a test the lessons stay in order
  expect(nodeState(a, 'A1', 7)).toBe('locked')
})

test('Enter always has a button to act on: the primary key follows the screen', () => {
  const a = base({})
  expect(newLearner(a)).toBe(true)
  expect(primaryKey(a)).toBe('check-new')
  const played = base({ stars: done('de', 'A1', 2) })
  expect(newLearner(played)).toBe(false)
  expect(primaryKey(played)).toBe('node-2') // the next lesson to play
  expect(primaryKey({ ...played, unit: 1 })).toBeUndefined() // not in the unit being shown
  expect(primaryKey({ ...played, screen: 'intro' })).toBe('start')
  expect(primaryKey({ ...played, screen: 'result', passed: true, lesson: 2 })).toBe('next')
  expect(primaryKey({ ...played, screen: 'result', lesson: -3 })).toBe('begin')
  expect(primaryKey({ ...played, screen: 'result', lesson: -2 })).toBe('map')
  const ex = [{ kind: 'build' as const, title: 't', prompt: 'p', answer: 'a b', bank: ['a', 'b'] }]
  const play = { ...played, screen: 'play' as const, ex, i: 0 }
  expect(primaryKey(play)).toBeUndefined()
  expect(primaryKey({ ...play, used: [0] })).toBe('check')
  expect(primaryKey({ ...play, status: 'right' as const })).toBe('continue')
})
