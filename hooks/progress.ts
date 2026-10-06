import type { App, Level } from '../types'
import { LEVELS } from './course'
import { LESSONS_PER_LEVEL, unitIndex } from './engine'

export const MAX_HEARTS = 5
export const GOAL = 30
export const DAY = 86_400_000

/** The fields that belong to one exercise, reset whenever the learner moves on. */
export const fresh = {
  picked: null,
  used: [] as number[],
  sel: null,
  matched: [] as string[],
  status: 'idle' as const,
  slip: false,
  note: '',
  gain: 0,
}

export const newApp = (lang: string): App => ({
  lang,
  screen: 'home' as const,
  level: 'A1',
  unit: 0,
  lesson: 0,
  ex: [],
  i: 0,
  ...fresh,
  hearts: MAX_HEARTS,
  sound: true,
  combo: 0,
  best: 0,
  xp: 0,
  dayXp: 0,
  goalDay: 0,
  streak: 0,
  lastDay: 0,
  correct: 0,
  dhits: 0,
  dpass: 0,
  gained: 0,
  lastStars: 0,
  passed: false,
  stars: {},
  tested: {},
})

// ---- progress rules: stars and unlocks are kept per course --------------------------------------
export const sk = (lang: string, level: string, idx: number) => `${lang}:${level}:${idx}`
export const starsOf = (a: App, level: string, idx: number) => a.stars[sk(a.lang, level, idx)] ?? 0
export const doneCount = (a: App, level: string) => Array.from({ length: LESSONS_PER_LEVEL }, (_, i) => starsOf(a, level, i)).filter(n => n > 0).length

export const levelOpen = (a: App, level: string) => {
  const k = LEVELS.indexOf(level as Level)
  return k <= 0 || !!a.tested[`${a.lang}:${level}`] || doneCount(a, LEVELS[k - 1]) >= LESSONS_PER_LEVEL
}

/** True for a level below one the learner opened by a test: the test showed they know it, so every lesson is playable. */
export const clearedByTest = (a: App, level: string) =>
  LEVELS.slice(LEVELS.indexOf(level as Level) + 1).some(l => !!a.tested[`${a.lang}:${l}`])

export const nodeState = (a: App, level: string, idx: number): 'done' | 'current' | 'locked' =>
  starsOf(a, level, idx) > 0
    ? 'done'
    : levelOpen(a, level) && (idx === 0 || starsOf(a, level, idx - 1) > 0 || clearedByTest(a, level))
      ? 'current'
      : 'locked'

export const firstOpen = (a: App, level: string) => {
  for (let i = 0; i < LESSONS_PER_LEVEL; i++) if (starsOf(a, level, i) === 0) return i
  return LESSONS_PER_LEVEL - 1
}

/** True until the learner has played, finished or placed anything in the current course. */
export const newLearner = (a: App) =>
  LEVELS.every(l => doneCount(a, l) === 0) && Object.keys(a.tested).every(k => !k.startsWith(`${a.lang}:`))

/** The `key` of the button Enter should act on for what is showing, so the keyboard never has to leave the pane. */
export const primaryKey = (a: App): string | undefined => {
  if (a.screen === 'intro') return 'start'
  if (a.screen === 'result') return nextTarget(a) ? 'next' : a.lesson === -3 ? 'begin' : 'map'
  if (a.screen === 'play') {
    const x = a.ex[a.i]
    if (a.status !== 'idle') return 'continue'
    return x && (x.kind === 'build' || x.kind === 'spell') && a.used.length > 0 ? 'check' : undefined
  }
  if (a.screen === 'home') {
    if (newLearner(a)) return 'check-new'
    for (let i = 0; i < LESSONS_PER_LEVEL; i++) if (unitIndex(i) === a.unit && nodeState(a, a.level, i) === 'current') return `node-${i}`
  }
  return undefined
}

/** The level a learner starts at after clearing `stages` stages of the level check. */
export const placedLevel = (stages: number): Level => LEVELS[Math.min(stages, LEVELS.length - 1)]

/** Opens every level up to the placed one, so the learner can start there and still browse below. */
export const placedTested = (a: App, stages: number): Record<string, boolean> => {
  const opened = LEVELS.slice(1, LEVELS.indexOf(placedLevel(stages)) + 1)
  return { ...a.tested, ...Object.fromEntries(opened.map(l => [`${a.lang}:${l}`, true])) }
}

export const nextTarget = (a: App): [Level, number] | null => {
  if (!a.passed || a.lesson < 0) return null
  if (a.lesson + 1 < LESSONS_PER_LEVEL) return [a.level, a.lesson + 1]
  const nl = LEVELS[LEVELS.indexOf(a.level) + 1]
  return nl && levelOpen(a, nl) ? [nl, 0] : null
}

/** The highest level the learner has open in the current course, with the unit to show for it. */
const resumeAt = (a: App): Pick<App, 'level' | 'unit'> => {
  const level = [...LEVELS].reverse().find(l => levelOpen(a, l)) ?? 'A1'
  return { level, unit: unitIndex(firstOpen(a, level)) }
}

/** Moves to another course: its own map, stars and unlocks; XP, streak and the daily goal are shared. */
export const switchCourse = (a: App, lang: string): App => {
  const next = { ...a, ...fresh, screen: 'home' as const, lang }
  return { ...next, ...resumeAt(next) }
}

/**
 * Rebuilds the app from what was saved. Progress saved before there were several courses has keys like
 * "A1:3" and "B1", which were German: the first course in `courses` is the default and adopts them.
 */
export const restore = (saved: Partial<App>, today: number, courses: string[]): App => {
  const fallback = courses[0]
  const prefixed = <T,>(m: Record<string, T> | undefined, bare: RegExp) =>
    Object.fromEntries(Object.entries(m ?? {}).map(([k, v]) => [bare.test(k) ? `${fallback}:${k}` : k, v]))
  const loaded: App = {
    ...newApp(saved.lang && courses.includes(saved.lang) ? saved.lang : fallback),
    sound: saved.sound ?? true,
    xp: saved.xp ?? 0,
    lastDay: saved.lastDay ?? 0,
    goalDay: saved.goalDay ?? 0,
    dayXp: saved.goalDay === today ? (saved.dayXp ?? 0) : 0,
    stars: prefixed(saved.stars, /^[A-C]\d:\d+$/),
    tested: prefixed(saved.tested, /^[A-C]\d$/),
    streak: (saved.lastDay ?? 0) >= today - 1 ? (saved.streak ?? 0) : 0,
  }
  return { ...loaded, ...resumeAt(loaded) }
}
