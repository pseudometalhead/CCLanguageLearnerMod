import { expect, mock, test } from 'claude-code/testing'

import type { Exercise } from '../types'
import { buildLesson, buildPractice, buildTest } from './engine'

const NOW = 1_700_000_000_000
const SEED = NOW % 1_000_003
const PANE = {
  plugin: 'language-learner',
  component: 'Pane',
  requestId: 'language-learner',
  props: { title: 'LinguaCC', isFocused: true, bodyColumns: 56, placement: 'dock', scroll: { offset: 0, bodyRows: 40 }, view: {} },
} as const

const spoken: string[] = []
const world = (on: any) => {
  mock.clock(on, { now: NOW })
  mock.store(on)
  on('audio.speak', async (_$: any, e: any) => {
    spoken.push(e.text)
    return { value: { via: 'system' } }
  })
  on('ui.toast', async () => ({ value: undefined }))
}

const pickBank = async (ui: any, bank: string[], want: string[]) => {
  const taken = new Set<number>()
  for (const w of want) {
    const k = bank.findIndex((b, i) => b === w && !taken.has(i))
    taken.add(k)
    await ui.press({ key: `b-${k}` })
  }
}

// Gives the right answer to one exercise, the way a person would, button by button.
const solve = async (ui: any, x: Exercise) => {
  if (x.kind === 'choice') await ui.press({ key: `opt-${x.answer}` })
  else if (x.kind === 'match') {
    for (const t of x.left) {
      await ui.press({ key: `l-${t}` })
      await ui.press({ key: `r-${x.pairs[t]}` })
    }
  } else {
    await pickBank(ui, x.bank, x.kind === 'spell' ? [...x.answer] : x.answer.split(' '))
    await ui.press({ key: 'check' })
  }
}

// Gives a wrong answer that costs exactly one heart.
const blunder = async (ui: any, x: Exercise) => {
  if (x.kind === 'choice') await ui.press({ key: `opt-${x.options.find(o => o !== x.answer)}` })
  else if (x.kind === 'match') {
    await ui.press({ key: `l-${x.left[0]}` })
    await ui.press({ key: `r-${x.right.find(r => r !== x.pairs[x.left[0]])}` })
    await ui.press({ key: `l-${x.left[0]}` })
    await ui.press({ key: `r-${x.right.find(r => r !== x.pairs[x.left[0]])}` })
    await ui.press({ key: `l-${x.left[0]}` })
    await ui.press({ key: `r-${x.right.find(r => r !== x.pairs[x.left[0]])}` })
    await ui.press({ key: `l-${x.left[0]}` })
    await ui.press({ key: `r-${x.right.find(r => r !== x.pairs[x.left[0]])}` })
    await ui.press({ key: `l-${x.left[0]}` })
    await ui.press({ key: `r-${x.right.find(r => r !== x.pairs[x.left[0]])}` })
  } else {
    await ui.press({ key: 'b-0' })
    await ui.press({ key: 'check' })
  }
}

const playLesson = async (ui: any, level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1', idx: number) => {
  await ui.press({ key: `node-${idx}` })
  await ui.press({ key: 'start' })
  for (const x of buildLesson(level, idx, SEED)) {
    await solve(ui, x)
    await ui.press({ key: 'continue' })
  }
}

test('the map starts at A1 with one open lesson and the rest locked', async ($, on) => {
  world(on)
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...PANE, surface })
    expect(await ui.find({ text: /A1 · Beginner/ })).toBeDefined()
    expect(await ui.find({ text: /UNIT 1 · 👋 Hallo!/ })).toBeDefined()
    expect(await ui.find({ text: /Greetings/ })).toBeDefined()
    expect(await ui.find({ text: /START/ })).toBeDefined()
    expect(await ui.find({ text: /Willkommen/ })).toBeDefined()
    // lesson 2 is locked
    await ui.press({ key: 'node-1' })
    expect(await ui.find({ text: /Finish the lesson before it/ })).toBeDefined()
    // other levels are locked and offer the placement quiz
    await ui.press({ key: 'tab-B1' })
    expect(await ui.find({ text: /Know B1 already/ })).toBeDefined()
    await ui.press({ key: 'tab-A1' })
    await ui.press({ key: 'unit-next' })
    expect(await ui.find({ text: /UNIT 2 · 🍽️ Essen & Trinken/ })).toBeDefined()
    await ui.press({ key: 'unit-prev' })
    await ui.unmount()
  }
})

test('a lesson opens on an intro with the new words, then plays through to 3 stars', async ($, on) => {
  world(on)
  spoken.length = 0
  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  await ui.press({ key: 'node-0' })
  expect(await ui.find({ text: /LESSON 1 · Greetings/ })).toBeDefined()
  expect(await ui.find({ text: /New words/ })).toBeDefined()
  expect(await ui.find({ text: /💡/ })).toBeDefined()
  await ui.press({ key: 'w-0' })
  expect(spoken).toEqual(['hallo'])
  await ui.press({ key: 'start' })
  const ex = buildLesson('A1', 0, SEED)
  for (const x of ex) {
    await solve(ui, x)
    expect(await ui.find({ text: /Super!|Prima!|Genau!|Sehr gut!|Toll!|Perfekt!|Klasse!/ })).toBeDefined()
    await ui.press({ key: 'continue' })
  }
  expect(await ui.find({ text: /LESSON COMPLETE/ })).toBeDefined()
  expect(await ui.find({ text: /⭐⭐⭐/ })).toBeDefined()
  expect(await ui.find({ text: new RegExp(`${ex.length}/${ex.length} first try`) })).toBeDefined()
  await ui.press({ key: 'map' })
  expect(await ui.find({ text: /★★★/ })).toBeDefined()
  // lesson 2 is now open
  await ui.press({ key: 'node-1' })
  expect(await ui.find({ text: /LESSON 2 · About me/ })).toBeDefined()
  await ui.unmount()
})

test('a whole unit unlocks its review, which ends in a crown', async ($, on) => {
  world(on)
  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  for (let idx = 0; idx < 4; idx++) {
    await playLesson(ui, 'A1', idx)
    await ui.press({ key: 'map' })
  }
  await ui.press({ key: 'node-4' })
  expect(await ui.find({ text: /UNIT REVIEW · Hallo!/ })).toBeDefined()
  await ui.press({ key: 'start' })
  for (const x of buildLesson('A1', 4, SEED)) {
    await solve(ui, x)
    await ui.press({ key: 'continue' })
  }
  expect(await ui.find({ text: /LESSON COMPLETE/ })).toBeDefined()
  await ui.press({ key: 'map' })
  // the map moves on to unit 2, with unit 1 marked complete
  expect(await ui.find({ text: /UNIT 2 · 🍽️/ })).toBeDefined()
  expect(await ui.find({ text: /● ◉ ○ ○/ })).toBeDefined()
  await ui.press({ key: 'unit-prev' })
  expect(await ui.find({ text: /👑/ })).toBeDefined()
  await ui.unmount()
})

test('five mistakes lose every heart and fail the lesson', async ($, on) => {
  world(on)
  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  await ui.press({ key: 'node-0' })
  await ui.press({ key: 'start' })
  const ex = buildLesson('A1', 0, SEED)
  let lost = 0
  for (const x of ex) {
    if (lost >= 5) break
    await blunder(ui, x)
    lost = x.kind === 'match' ? 5 : lost + 1
    if (lost < 5) await ui.press({ key: 'continue' })
  }
  expect(await ui.find({ text: /Nicht ganz/ })).toBeDefined()
  await ui.press({ key: 'continue' })
  expect(await ui.find({ text: /OUT OF HEARTS/ })).toBeDefined()
  await ui.press({ key: 'map' })
  expect(await ui.find({ text: /START/ })).toBeDefined()
  await ui.unmount()
})

test('a re-ordered sentence costs no heart and shows the model answer', async ($, on) => {
  world(on)
  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  await ui.press({ key: 'node-0' })
  await ui.press({ key: 'start' })
  for (const x of buildLesson('A1', 0, SEED)) {
    if (x.kind === 'build' && x.answer.split(' ').length > 2) {
      const want = x.answer.split(' ').reverse()
      expect(want.join(' ')).not.toBe(x.answer)
      await pickBank(ui, x.bank, want)
      await ui.press({ key: 'check' })
      expect(await ui.find({ text: /Same words, different order/ })).toBeDefined()
      expect(await ui.find({ text: /Model answer/ })).toBeDefined()
      expect(await ui.find({ text: /❤️❤️❤️❤️❤️/ })).toBeDefined()
      break
    }
    await solve(ui, x)
    await ui.press({ key: 'continue' })
  }
  await ui.unmount()
})

test('audio: listening puzzles autoplay German, Play repeats, the toggle mutes', async ($, on) => {
  world(on)
  spoken.length = 0
  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  await ui.press({ key: 'node-0' })
  await ui.press({ key: 'start' })
  const ex = buildLesson('A1', 0, SEED)
  const first = ex[0]
  expect(first.kind === 'choice' && first.say).toBeTruthy()
  await ui.press({ key: 'play' })
  expect(spoken).toEqual([first.kind === 'choice' ? first.say : ''])
  let muted = false
  for (const x of ex) {
    const listens = x.kind !== 'match' && !!x.auto
    if (listens && !muted) {
      expect(spoken.at(-1)).toBe((x as { say?: string }).say)
      expect(await ui.find({ text: /Listen/ })).toBeDefined()
      const n = spoken.length
      await ui.press({ key: 'play' })
      expect(spoken.length).toBe(n + 1)
      await ui.press({ key: 'sound' })
      muted = true
      expect(await ui.find({ text: /🔇/ })).toBeDefined()
    }
    await solve(ui, x)
    await ui.press({ key: 'continue' })
    if (muted) break
  }
  const quiet = spoken.length
  // everything after the toggle is silent
  const rest = ex.slice(ex.findIndex(x => x.kind !== 'match' && !!x.auto) + 1)
  for (const x of rest) {
    await solve(ui, x)
    await ui.press({ key: 'continue' })
  }
  expect(spoken.length).toBe(quiet)
  await ui.unmount()
})

test('audio failure falls back to showing the German text', async ($, on) => {
  mock.clock(on, { now: NOW })
  mock.store(on)
  on('audio.speak', async () => {
    throw new Error('no synthesizer')
  })
  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  await ui.press({ key: 'node-0' })
  await ui.press({ key: 'start' })
  await ui.press({ key: 'play' })
  expect(await ui.find({ text: /No audio here/ })).toBeDefined()
  await ui.unmount()
})

test('the placement quiz unlocks a level without finishing the one below', async ($, on) => {
  world(on)
  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  await ui.press({ key: 'tab-B1' })
  await ui.press({ key: 'test' })
  expect(await ui.find({ text: /PLACEMENT QUIZ → B1/ })).toBeDefined()
  await ui.press({ key: 'start' })
  for (const x of buildTest('B1', SEED)) {
    await solve(ui, x)
    await ui.press({ key: 'continue' })
  }
  expect(await ui.find({ text: /LEVEL UNLOCKED/ })).toBeDefined()
  await ui.press({ key: 'map' })
  expect(await ui.find({ text: /B1 · Intermediate/ })).toBeDefined()
  expect(await ui.find({ text: /Know B1 already/ })).toBeUndefined()
  await ui.press({ key: 'node-0' })
  expect(await ui.find({ text: /LESSON 1 · Connectors/ })).toBeDefined()
  await ui.unmount()
})

test('a mistake comes back once at the end of the lesson, and earns no XP the second time', async ($, on) => {
  world(on)
  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  await ui.press({ key: 'node-0' })
  await ui.press({ key: 'start' })
  const ex = buildLesson('A1', 0, SEED)
  expect(ex[0].kind).toBe('choice')
  await blunder(ui, ex[0])
  await ui.press({ key: 'continue' })
  for (const x of ex.slice(1)) {
    await solve(ui, x)
    await ui.press({ key: 'continue' })
  }
  // the missed exercise is asked again
  expect(await ui.find({ text: /Try again: / })).toBeDefined()
  expect(await ui.find({ text: /LESSON COMPLETE/ })).toBeUndefined()
  await solve(ui, ex[0])
  expect(await ui.find({ text: /Super!|Prima!|Genau!|Sehr gut!|Toll!|Perfekt!|Klasse!/ })).toBeDefined()
  expect(await ui.find({ text: /\+2 XP|\+3 XP/ })).toBeUndefined()
  await ui.press({ key: 'continue' })
  expect(await ui.find({ text: /LESSON COMPLETE/ })).toBeDefined()
  expect(await ui.find({ text: new RegExp(`${ex.length - 1}/${ex.length} first try`) })).toBeDefined()
  expect(await ui.find({ text: /⭐⭐☆/ })).toBeDefined()
  await ui.unmount()
})

test('practice appears after the first finished lesson, pays 5 XP and leaves the stars alone', async ($, on) => {
  world(on)
  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect(await ui.find({ text: /Practice/ })).toBeUndefined()
  await playLesson(ui, 'A1', 0)
  await ui.press({ key: 'map' })
  expect(await ui.find({ text: /💪 Practice/ })).toBeDefined()
  await ui.press({ key: 'practice' })
  expect(await ui.find({ text: /PRACTICE · A1/ })).toBeDefined()
  await ui.press({ key: 'start' })
  const ex = buildPractice('A1', [0], SEED)
  for (const x of ex) {
    await solve(ui, x)
    await ui.press({ key: 'continue' })
  }
  expect(await ui.find({ text: /PRACTICE COMPLETE/ })).toBeDefined()
  expect(await ui.find({ text: /\+5 XP/ })).toBeDefined()
  expect(await ui.find({ text: /Next:/ })).toBeUndefined()
  await ui.press({ key: 'map' })
  // lesson 2 is still the next one to play, and lesson 1 keeps its stars
  expect(await ui.find({ text: /START/ })).toBeDefined()
  expect(await ui.find({ text: /★★★/ })).toBeDefined()
  await ui.unmount()
})

const DAYMS = 86_400_000
const allA1 = Object.fromEntries(Array.from({ length: 20 }, (_, i) => [`A1:${i}`, 3]))
const restore = async ($: any, on: any, saved: Record<string, unknown>) => {
  mock.clock(on, { now: NOW })
  mock.store(on, { 'app-v3': saved })
  on('command.register', async () => ({ value: undefined }))
  on('session.start', async (_$: any, e: any) => ({ cwd: e.cwd }))
  await $.session.start({ cwd: '/work', surface: 'terminal', isInteractive: true })
}

test('progress saved by an earlier session is restored: level, stars, XP, streak, sound', async ($, on) => {
  const today = Math.floor(NOW / DAYMS)
  await restore($, on, { sound: false, xp: 120, streak: 3, lastDay: today - 1, goalDay: today - 1, dayXp: 25, stars: allA1, tested: {} })
  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect(await ui.find({ text: /A2 · Elementary/ })).toBeDefined() // A1 is done, so the map opens on A2
  expect(await ui.find({ text: /⭐ 120/ })).toBeDefined()
  expect(await ui.find({ text: /🔥 3/ })).toBeDefined() // played yesterday, so the streak survives
  expect(await ui.find({ text: /🔇 off/ })).toBeDefined()
  expect(await ui.find({ text: /0\/30/ })).toBeDefined() // the daily goal restarts on a new day
  await ui.press({ key: 'tab-A1' })
  expect(await ui.find({ text: /20\/20/ })).toBeDefined()
  await ui.unmount()
})

test('a streak lapses after a missed day, and a placement unlock is remembered', async ($, on) => {
  const today = Math.floor(NOW / DAYMS)
  await restore($, on, { xp: 5, streak: 9, lastDay: today - 3, goalDay: today - 3, dayXp: 5, stars: {}, tested: { B1: true } })
  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect(await ui.find({ text: /🔥 0/ })).toBeDefined()
  expect(await ui.find({ text: /B1 · Intermediate/ })).toBeDefined() // opened by the quiz, so it is the level shown
  expect(await ui.find({ text: /Know B1 already/ })).toBeUndefined()
  await ui.unmount()
})

test('a narrow pane still draws every screen', async ($, on) => {
  world(on)
  const ui = await $.ui.mount({ ...PANE, props: { ...PANE.props, bodyColumns: 30 }, surface: 'terminal' })
  expect(await ui.find({ text: /Greetings/ })).toBeDefined()
  await ui.press({ key: 'node-0' })
  await ui.press({ key: 'start' })
  for (const x of buildLesson('A1', 0, SEED)) {
    await solve(ui, x)
    await ui.press({ key: 'continue' })
  }
  expect(await ui.find({ text: /LESSON COMPLETE/ })).toBeDefined()
  await ui.unmount()
})

test('the Words screen lists the words of finished lessons and speaks them', async ($, on) => {
  world(on)
  spoken.length = 0
  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect(await ui.find({ text: /📖 Words/ })).toBeUndefined()
  await playLesson(ui, 'A1', 0)
  await ui.press({ key: 'map' })
  spoken.length = 0 // the lesson itself played audio
  await ui.press({ key: 'words' })
  expect(await ui.find({ text: /UNIT 1 · Hallo!/ })).toBeDefined()
  expect(await ui.find({ text: /1\/4 lessons collected/ })).toBeDefined()
  expect(await ui.find({ text: /guten Morgen/ })).toBeDefined()
  await ui.press({ key: 'say-0-0' })
  expect(spoken).toEqual(['hallo'])
  await ui.press({ key: 'unit-next' })
  expect(await ui.find({ text: /Finish a lesson in this unit/ })).toBeDefined()
  await ui.press({ key: 'back' })
  expect(await ui.find({ text: /A1 · Beginner/ })).toBeDefined()
  await ui.unmount()
})

test('tapping an already matched word does not cost a heart', async ($, on) => {
  world(on)
  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  await ui.press({ key: 'node-0' })
  await ui.press({ key: 'start' })
  const ex = buildLesson('A1', 0, SEED)
  let k = 0
  while (ex[k].kind !== 'match') {
    await solve(ui, ex[k])
    await ui.press({ key: 'continue' })
    k++
  }
  const m = ex[k]
  if (m.kind !== 'match') throw new Error('expected a match puzzle')
  await ui.press({ key: `l-${m.left[0]}` })
  await ui.press({ key: `r-${m.pairs[m.left[0]]}` })
  await ui.press({ key: `l-${m.left[1]}` })
  await ui.press({ key: `r-${m.pairs[m.left[0]]}` }) // already matched: ignored
  expect(await ui.find({ text: /❤️❤️❤️❤️❤️/ })).toBeDefined()
  expect(await ui.find({ text: /Not a match/ })).toBeUndefined()
  await ui.unmount()
})

test('quitting a lesson half way forfeits the XP it earned', async ($, on) => {
  world(on)
  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  await ui.press({ key: 'node-0' })
  await ui.press({ key: 'start' })
  await solve(ui, buildLesson('A1', 0, SEED)[0])
  expect(await ui.find({ text: /\+2 XP/ })).toBeDefined()
  await ui.press({ key: 'quit' })
  expect(await ui.find({ text: /⭐ 0/ })).toBeDefined()
  await ui.unmount()
})
