import { expect, mock, test } from 'claude-code/testing'

import type { Exercise } from '../types'
import { buildLesson } from './engine'

const NOW = 1_700_000_000_000
const SEED = NOW % 1_000_003
const PANE = {
  plugin: 'language-learner',
  component: 'Pane',
  requestId: 'language-learner',
  props: { title: 'LinguaCC', isFocused: true, bodyColumns: 60, placement: 'dock', scroll: { offset: 0, bodyRows: 30 }, view: {} },
} as const

const solve = async (ui: any, x: Exercise) => {
  if (x.kind === 'choice') await ui.press({ key: `opt-${x.answer}` })
  else if (x.kind === 'match') {
    for (const t of x.left) {
      await ui.press({ key: `l-${t}` })
      await ui.press({ key: `r-${x.pairs[t]}` })
    }
  } else {
    const want = x.kind === 'spell' ? [...x.answer] : x.answer.split(' ')
    const taken = new Set<number>()
    for (const w of want) {
      const k = x.bank.findIndex((b, i) => b === w && !taken.has(i))
      taken.add(k)
      await ui.press({ key: `b-${k}` })
    }
    await ui.press({ key: 'check' })
  }
}

const spoken: string[] = []
const withAudio = (on: any) => on('audio.speak', async (_$: any, e: any) => { spoken.push(e.text); return { via: 'system' } })

test('a perfect lesson earns XP and stars, and marks the lesson done', async ($, on) => {
  mock.clock(on, { now: NOW })
  mock.store(on)
  withAudio(on)
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...PANE, surface })
    expect(await ui.find({ text: /A1 · Beginner/ })).toBeDefined()
    expect(await ui.find({ text: /🔒 B1/ })).toBeDefined()
    await ui.press({ key: 'les-A1-0' })

    for (const x of buildLesson('German', 'A1', 0, SEED)) {
      await solve(ui, x)
      expect(await ui.find({ text: /Correct|Matched/ })).toBeDefined()
      await ui.press({ key: 'continue' })
    }
    expect(await ui.find({ text: /LESSON COMPLETE/ })).toBeDefined()
    expect(await ui.find({ text: /⭐⭐⭐/ })).toBeDefined()
    expect(await ui.find({ text: /9\/9 first try/ })).toBeDefined()
    await ui.press({ key: 'map' })
    expect(await ui.find({ text: /✅ Greetings/ })).toBeDefined()
    await ui.unmount()
  }
})

test('five wrong answers lose all hearts and fail the lesson', async ($, on) => {
  mock.clock(on, { now: NOW })
  mock.store(on)
  withAudio(on)
  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  await ui.press({ key: 'les-A1-1' })
  const ex = buildLesson('German', 'A1', 1, SEED).filter(x => x.kind === 'choice' || x.kind === 'build' || x.kind === 'spell')
  expect(ex.length).toBeGreaterThanOrEqual(5)
  // exercise order is fixed: choice, match(skipped by mistakes below), spell, cloze, choice, build, spell
  const all = buildLesson('German', 'A1', 1, SEED)
  let lost = 0
  for (const x of all) {
    if (lost === 5) break
    if (x.kind === 'choice') await ui.press({ key: `opt-${x.options.find(o => o !== x.answer)}` })
    else if (x.kind === 'match') {
      for (let n = 0; n < 5 && lost < 5; n++, lost++) {
        await ui.press({ key: `l-${x.left[0]}` })
        await ui.press({ key: `r-${x.right.find(r => r !== x.pairs[x.left[0]])}` })
      }
      if (lost === 5) break
      continue
    } else {
      for (let k = 0; k < x.bank.length; k++) await ui.press({ key: `b-${k}` })
      await ui.press({ key: 'check' })
    }
    lost++
    if (lost < 5) await ui.press({ key: 'continue' })
  }
  expect(await ui.find({ text: /Out of hearts|Answer:/ })).toBeDefined()
  await ui.press({ key: 'continue' })
  expect(await ui.find({ text: /OUT OF HEARTS/ })).toBeDefined()
  await ui.press({ key: 'retry' })
  expect(await ui.find({ text: /CHOOSE|FILL/ })).toBeDefined()
  await ui.unmount()
})

test('audio: listening puzzles autoplay German, Play repeats, the toggle mutes', async ($, on) => {
  mock.clock(on, { now: NOW })
  mock.store(on)
  withAudio(on)
  spoken.length = 0
  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  await ui.press({ key: 'les-A1-0' })
  const ex = buildLesson('German', 'A1', 0, SEED)
  expect(spoken).toEqual([])
  // 1: "What does hallo mean?" has a Play button; 5th puzzle is a listening puzzle that autoplays
  await ui.press({ key: 'play' })
  expect(spoken).toEqual([ex[0].kind === 'choice' ? ex[0].say : ''])
  for (let n = 0; n < 4; n++) {
    await solve(ui, ex[n])
    await ui.press({ key: 'continue' })
  }
  const heard = ex[4]
  expect(heard.kind === 'choice' && heard.auto).toBe(true)
  expect(spoken.at(-1)).toBe(heard.kind === 'choice' ? heard.say : '')
  expect(await ui.find({ text: /LISTEN/ })).toBeDefined()
  const before = spoken.length
  await ui.press({ key: 'play' })
  expect(spoken.length).toBe(before + 1)
  // answering speaks the German text of fill-the-gap sentences (earlier puzzle) and words
  await ui.press({ key: 'sound' })
  expect(await ui.find({ text: /🔇 off/ })).toBeDefined()
  await solve(ui, heard)
  await ui.press({ key: 'continue' })
  const afterMute = spoken.length
  await solve(ui, ex[5])
  expect(spoken.length).toBe(afterMute)
  await ui.unmount()
})

test('audio failure falls back to showing the German text', async ($, on) => {
  mock.clock(on, { now: NOW })
  mock.store(on)
  on('audio.speak', async () => { throw new Error('no synthesizer') })
  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  await ui.press({ key: 'les-A1-0' })
  const ex = buildLesson('German', 'A1', 0, SEED)
  await ui.press({ key: 'play' })
  expect(await ui.find({ text: /No audio here/ })).toBeDefined()
  await ui.unmount()
  expect(ex.length).toBe(9)
})
