import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { App, Level } from '../types'
import { bar, buildLesson, buildPractice, buildTest, heartsRow, isReview, lessonInfo, LESSONS_PER_LEVEL, unitIndex } from './engine'
import { LEVELS, LEVEL_INFO, UNITS } from './lessons'

const PANE = 'language-learner'
const STORE = 'app-v3'
const MAX_HEARTS = 5
const GOAL = 30
const DAY = 86_400_000
const PRAISE = ['Super!', 'Prima!', 'Genau!', 'Sehr gut!', 'Toll!', 'Perfekt!', 'Klasse!']
// How far each node of a unit sits from the left edge, so the path winds like a river.
const WIND = [4, 9, 12, 9, 4]
const WIND_NARROW = [0, 2, 4, 2, 0]

const fresh = {
  picked: null,
  used: [] as number[],
  sel: null,
  matched: [] as string[],
  status: 'idle' as const,
  slip: false,
  note: '',
  gain: 0,
}

const initial: App = {
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
  gained: 0,
  lastStars: 0,
  passed: false,
  stars: {},
  tested: {},
}

const app = atom({ plugin: 'language-learner', key: 'app' } as const, initial)

// ---- progress rules -----------------------------------------------------------------------
const sk = (level: string, idx: number) => `${level}:${idx}`
const starsOf = (a: App, level: string, idx: number) => a.stars[sk(level, idx)] ?? 0
const doneCount = (a: App, level: string) => Array.from({ length: LESSONS_PER_LEVEL }, (_, i) => starsOf(a, level, i)).filter(n => n > 0).length

const levelOpen = (a: App, level: string) => {
  const k = LEVELS.indexOf(level as Level)
  return k <= 0 || !!a.tested[level] || doneCount(a, LEVELS[k - 1]) >= LESSONS_PER_LEVEL
}

const nodeState = (a: App, level: string, idx: number): 'done' | 'current' | 'locked' =>
  starsOf(a, level, idx) > 0 ? 'done' : levelOpen(a, level) && (idx === 0 || starsOf(a, level, idx - 1) > 0) ? 'current' : 'locked'

const firstOpen = (a: App, level: string) => {
  for (let i = 0; i < LESSONS_PER_LEVEL; i++) if (starsOf(a, level, i) === 0) return i
  return LESSONS_PER_LEVEL - 1
}

const nextTarget = (a: App): [Level, number] | null => {
  if (!a.passed || a.lesson < 0) return null
  if (a.lesson + 1 < LESSONS_PER_LEVEL) return [a.level, a.lesson + 1]
  const nl = LEVELS[LEVELS.indexOf(a.level) + 1]
  return nl && levelOpen(a, nl) ? [nl, 0] : null
}

// ---- scoring ------------------------------------------------------------------------------
const right = (a: App): App => {
  // A repeat of an earlier mistake earns nothing and does not count towards the combo.
  if (a.ex[a.i].again) return { ...a, status: 'right', gain: 0 }
  const first = !a.slip
  const combo = first ? a.combo + 1 : 0
  // Practice pays a flat bonus at the end, so it cannot be farmed puzzle by puzzle.
  const gain = first && a.lesson !== -2 ? 2 + (combo >= 3 ? 1 : 0) : 0
  return { ...a, status: 'right', combo, best: Math.max(a.best, combo), gain, correct: a.correct + (first ? 1 : 0), xp: a.xp + gain, gained: a.gained + gain }
}
const wrong = (a: App, isSoft = false): App => ({ ...a, status: 'wrong', combo: 0, slip: true, gain: 0, hearts: isSoft ? a.hearts : a.hearts - 1 })

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'learn', description: 'Open the German course (A1 to C1)' })
    const saved = (await $.store.get(STORE)) as Partial<App> | undefined
    if (saved) {
      const today = Math.floor((await $.clock.now()) / DAY)
      const streak = (saved.lastDay ?? 0) >= today - 1 ? (saved.streak ?? 0) : 0
      const stars = saved.stars ?? {}
      const loaded: App = {
        ...initial,
        sound: saved.sound ?? true,
        xp: saved.xp ?? 0,
        lastDay: saved.lastDay ?? 0,
        goalDay: saved.goalDay ?? 0,
        dayXp: saved.goalDay === today ? (saved.dayXp ?? 0) : 0,
        stars,
        tested: saved.tested ?? {},
        streak,
      }
      const lv = [...LEVELS].reverse().find(l => levelOpen(loaded, l)) ?? 'A1'
      await update($, app, () => ({ ...loaded, level: lv, unit: unitIndex(firstOpen(loaded, lv)) }))
    }
    return next(e)
  })

  on('command.run', { command: 'learn' }, async $ => {
    await $.ui.open({ id: PANE, title: 'LinguaCC' })
    return { text: 'LinguaCC opened. Pick a lesson on the map.' }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e)
    const s = await read($, app)
    const info = LEVEL_INFO[s.level]
    const x = s.ex[s.i]
    // The pane can be narrow: tighten the winding path and stack wide columns.
    const cols = e.props.bodyColumns || 56
    const narrow = cols < 46

    // ---- audio ----------------------------------------------------------------------------
    const say = async (text: string) => {
      try {
        await $.audio.speak(text, { voice: 'Anna' })
      } catch {
        await update($, app, a => ({ ...a, note: `🔇 No audio here (needs macOS + German voice "Anna"). It says: “${text}”` }))
      }
    }
    // Speaks what the exercise now showing asks to hear when it opens.
    const opened = async () => {
      const a = await read($, app)
      const q = a.ex[a.i]
      if (a.sound && q && q.kind !== 'match' && q.auto && q.say) await say(q.say)
    }
    // Runs an answer; once it settles the exercise, speaks the German text it carries.
    const answered = async (run: () => Promise<unknown>) => {
      const before = await read($, app)
      await run()
      const a = await read($, app)
      const q = a.ex[a.i]
      if (before.status === 'idle' && a.status !== 'idle' && a.sound && q && q.kind !== 'match' && q.after) await say(q.after)
    }

    // ---- navigation -----------------------------------------------------------------------
    const goLevel = (lv: Level) =>
      update($, app, a => ({ ...a, ...fresh, level: lv, unit: unitIndex(firstOpen(a, lv)) }))
    const goUnit = (d: number) => update($, app, a => ({ ...a, note: '', unit: Math.max(0, Math.min(3, a.unit + d)) }))
    const openLesson = (level: Level, idx: number) =>
      update($, app, a => {
        const target = { ...a, level }
        if (nodeState(target, level, idx) === 'locked') return { ...a, note: 'Finish the lesson before it to unlock this one.' }
        return { ...a, ...fresh, level, screen: 'intro' as const, lesson: idx, unit: unitIndex(idx) }
      })
    const openWords = () => update($, app, a => ({ ...a, ...fresh, screen: 'words' as const }))
    const openPractice = () => update($, app, a => ({ ...a, ...fresh, screen: 'intro' as const, lesson: -2 }))
    const openTest = () => update($, app, a => ({ ...a, ...fresh, screen: 'intro' as const, lesson: -1 }))
    // Leaving a lesson half way forfeits the XP it earned so far, so it cannot be farmed by quitting.
    const toMap = () =>
      update($, app, a => ({
        ...a,
        ...fresh,
        screen: 'home' as const,
        xp: a.screen === 'play' ? a.xp - a.gained : a.xp,
        unit: unitIndex(firstOpen(a, a.level)),
      }))

    const begin = async () => {
      const seed = (await $.clock.now()) % 1_000_003
      await update($, app, a => ({
        ...a,
        ...fresh,
        screen: 'play' as const,
        i: 0,
        correct: 0,
        gained: 0,
        hearts: MAX_HEARTS,
        combo: 0,
        best: 0,
        ex:
          a.lesson === -1
            ? buildTest(a.level, seed)
            : a.lesson === -2
              ? buildPractice(a.level, Array.from({ length: LESSONS_PER_LEVEL }, (_, i) => i).filter(i => starsOf(a, a.level, i) > 0), seed)
              : buildLesson(a.level, a.lesson, seed),
      }))
      await opened()
    }

    // ---- answering ------------------------------------------------------------------------
    const pick = (opt: string) =>
      answered(() =>
        update($, app, a => {
          const q = a.ex[a.i]
          if (a.status !== 'idle' || q.kind !== 'choice') return a
          return { ...(opt === q.answer ? right(a) : wrong(a)), picked: opt }
        }),
      )

    const tapLeft = (t: string) =>
      update($, app, a => (a.status === 'idle' && !a.matched.includes(t) ? { ...a, sel: t, note: '' } : a))

    const tapRight = (r: string) =>
      answered(() =>
        update($, app, a => {
          const q = a.ex[a.i]
          if (a.status !== 'idle' || q.kind !== 'match') return a
          if (a.matched.some(t => q.pairs[t] === r)) return a
          if (a.sel === null) return { ...a, note: 'Tap a word on the left first.' }
          if (q.pairs[a.sel] === r) {
            const matched = [...a.matched, a.sel]
            const stepped = { ...a, matched, sel: null, note: '' }
            return matched.length === q.left.length ? right(stepped) : stepped
          }
          const hit = { ...a, sel: null, slip: true, combo: 0, note: 'Not a match, try again.', hearts: a.hearts - 1 }
          return hit.hearts <= 0 ? { ...hit, status: 'wrong' as const } : hit
        }),
      )

    const tapBank = (k: number) =>
      update($, app, a => (a.status === 'idle' && !a.used.includes(k) ? { ...a, used: [...a.used, k] } : a))
    const undo = () => update($, app, a => (a.status === 'idle' ? { ...a, used: a.used.slice(0, -1) } : a))
    const check = () =>
      answered(() =>
        update($, app, a => {
          const q = a.ex[a.i]
          if (a.status !== 'idle' || (q.kind !== 'spell' && q.kind !== 'build') || a.used.length === 0) return a
          const parts = a.used.map(k => q.bank[k])
          if (parts.join(q.kind === 'spell' ? '' : ' ') === q.answer) return right(a)
          const sameWords = q.kind === 'build' && [...parts].sort().join(' ') === q.answer.split(' ').sort().join(' ')
          // Word order is often free in German and English, so a reshuffle costs no heart.
          return sameWords
            ? { ...wrong(a, true), note: `Same words, different order. Yours may work too, no heart lost. You will see it once more at the end. Model answer: ${q.answer}` }
            : wrong(a)
        }),
      )

    const cont = async () => {
      const cur = await read($, app)
      if (cur.status === 'idle') return
      // Duolingo-style: a mistake comes back once at the end of the lesson.
      const missed = cur.status === 'wrong' && !cur.ex[cur.i].again && cur.hearts > 0
      if (cur.hearts > 0 && (cur.i + 1 < cur.ex.length || missed)) {
        await update($, app, a => ({ ...a, ...fresh, ex: missed ? [...a.ex, { ...a.ex[a.i], again: true }] : a.ex, i: a.i + 1 }))
        await opened()
        return
      }
      const today = Math.floor((await $.clock.now()) / DAY)
      const before = starsOf(cur, cur.level, cur.lesson)
      await update($, app, a => {
        const isTest = a.lesson === -1
        const isPractice = a.lesson === -2
        const passed = isTest ? a.hearts >= 3 : a.hearts > 0
        const stars = !passed ? 0 : isTest ? 3 : a.hearts >= MAX_HEARTS ? 3 : a.hearts >= 3 ? 2 : 1
        const bonus = !passed ? 0 : isTest ? 20 : isPractice ? 5 : 10 + (a.hearts === MAX_HEARTS ? 5 : 0)
        const total = a.gained + bonus
        const streak = passed && a.lastDay !== today ? (a.lastDay === today - 1 ? a.streak + 1 : 1) : a.streak
        const key = sk(a.level, a.lesson)
        return {
          ...a,
          screen: 'result' as const,
          passed,
          lastStars: stars,
          xp: a.xp + bonus,
          gained: total,
          dayXp: (a.goalDay === today ? a.dayXp : 0) + total,
          goalDay: today,
          streak,
          lastDay: passed ? today : a.lastDay,
          stars: !isTest && !isPractice && passed ? { ...a.stars, [key]: Math.max(a.stars[key] ?? 0, stars) } : a.stars,
          tested: isTest && passed ? { ...a.tested, [a.level]: true } : a.tested,
        }
      })
      const a = await read($, app)
      await $.store.set(STORE, { sound: a.sound, xp: a.xp, streak: a.streak, lastDay: a.lastDay, dayXp: a.dayXp, goalDay: a.goalDay, stars: a.stars, tested: a.tested })
      if (a.passed && a.lesson === -1) $.ui.toast(`🚀 ${a.level} ${LEVEL_INFO[a.level].name} unlocked!`)
      else if (a.passed && a.lesson >= 0 && before === 0) {
        const u = unitIndex(a.lesson)
        if ([0, 1, 2, 3, 4].every(p => starsOf(a, a.level, u * 5 + p) > 0)) $.ui.toast(`🏆 Unit complete: ${UNITS[a.level][u].title}`)
        if (doneCount(a, a.level) >= LESSONS_PER_LEVEL) $.ui.toast(`🎉 ${a.level} ${LEVEL_INFO[a.level].name} complete!`)
      }
    }

    // ---- shared pieces --------------------------------------------------------------------
    const header = (
      <Box borderStyle="round" borderColor="cyan" paddingX={1} flexDirection="column">
        <Box>
          <Text bold color="cyan">🌍 LinguaCC <Text dimColor>· German </Text></Text>
          <Button key="sound" label={s.sound ? '🔊 on' : '🔇 off'} onPress={() => update($, app, a => ({ ...a, sound: !a.sound }))} />
        </Box>
        <Text>🔥 {s.streak}   ⭐ {s.xp}   🎯 {Math.min(s.dayXp, GOAL)}/{GOAL} <Text color="green">{bar(Math.min(s.dayXp, GOAL), GOAL, 8)}</Text></Text>
      </Box>
    )

    // ================================ MAP ====================================================
    if (s.screen === 'home') {
      const open = levelOpen(s, s.level)
      const n = doneCount(s, s.level)
      const unit = UNITS[s.level][s.unit]
      const cur = firstOpen(s, s.level)
      const base = narrow ? WIND_NARROW : WIND
      const wind = s.unit % 2 === 0 ? base : [...base].reverse()
      const fresh0 = doneCount(s, 'A1') === 0 && s.xp === 0
      const coach = !open
        ? 'This level is locked. Finish the one before, or jump ahead!'
        : fresh0
          ? 'Willkommen! Tap the ▶️ to start your first lesson.'
          : n >= LESSONS_PER_LEVEL
            ? 'Alles geschafft. Sehr gut!'
            : s.dayXp >= GOAL
              ? `Tagesziel erreicht! Next up: ${lessonInfo(s.level, cur).title}.`
              : `Auf geht’s: ${lessonInfo(s.level, cur).title}!`
      return (
        <Box flexDirection="column">
          {header}
          <Box>
            {LEVELS.map(lv => (
              <Button key={`tab-${lv}`} label={`${lv === s.level ? '▣' : levelOpen(s, lv) ? '□' : '🔒'} ${lv}  `} onPress={() => goLevel(lv)} />
            ))}
          </Box>
          <Text color={info.color} bold>{s.level} · {info.name}  {bar(n, LESSONS_PER_LEVEL, 10)} {n}/{LESSONS_PER_LEVEL}</Text>
          <Text dimColor>💬 “{coach}”</Text>
          <Box borderStyle="round" borderColor={open ? info.color : 'gray'} paddingX={1} flexDirection="column">
            <Box>
              <Button key="unit-prev" label={s.unit > 0 ? '◀ ' : '   '} onPress={() => goUnit(-1)} />
              <Text bold color={open ? info.color : 'gray'}>UNIT {s.unit + 1} · {unit.emoji} {unit.title}</Text>
              <Button key="unit-next" label={s.unit < 3 ? ' ▶' : '  '} onPress={() => goUnit(1)} />
            </Box>
            <Text dimColor>{unit.sub}   {[0, 1, 2, 3].map(u => ([0, 1, 2, 3, 4].every(p => starsOf(s, s.level, u * 5 + p) > 0) ? '●' : u === s.unit ? '◉' : '○')).join(' ')}</Text>
          </Box>
          {[0, 1, 2, 3, 4].map(p => {
            const idx = s.unit * 5 + p
            const st = nodeState(s, s.level, idx)
            const rev = isReview(idx)
            const title = lessonInfo(s.level, idx).title
            const color = st === 'locked' ? 'gray' : st === 'done' ? 'yellow' : rev ? 'magenta' : info.color
            const face = st === 'locked' ? '🔒' : st === 'done' ? (rev ? '👑' : '⭐') : rev ? '🏆' : '▶️'
            const got = starsOf(s, s.level, idx)
            return (
              <Box key={`row-${idx}`} flexDirection="column">
                {p > 0 && (
                  <Box marginLeft={Math.round((wind[p - 1] + wind[p]) / 2) + 3}>
                    <Text dimColor>┊</Text>
                  </Box>
                )}
                <Box marginLeft={wind[p]}>
                  <Box borderStyle={st === 'current' ? 'double' : 'round'} borderColor={color} paddingX={1}>
                    <Button key={`node-${idx}`} label={face} onPress={() => openLesson(s.level, idx)} />
                  </Box>
                  <Box flexDirection="column" marginLeft={1}>
                    <Text bold={st !== 'locked'} color={color}>{title}</Text>
                    <Text dimColor={st !== 'current'} color={st === 'current' ? info.color : undefined}>
                      {st === 'done' ? `${'★'.repeat(got)}${'☆'.repeat(3 - got)}` : st === 'current' ? 'START' : rev ? 'review' : 'locked'}
                    </Text>
                  </Box>
                </Box>
              </Box>
            )
          })}
          {s.note && <Text color="red">{s.note}</Text>}
          {open && n > 0 && (
            <Box>
              <Box borderStyle="round" borderColor="gray" paddingX={1} marginRight={1}>
                <Button key="practice" hotkey="x" label="💪 Practice" onPress={openPractice} />
              </Box>
              <Box borderStyle="round" borderColor="gray" paddingX={1}>
                <Button key="words" hotkey="w" label="📖 Words" onPress={openWords} />
              </Box>
            </Box>
          )}
          {!open && (
            <Box borderStyle="round" borderColor="yellow" paddingX={1} flexDirection="column">
              <Text bold color="yellow">🚀 Know {s.level} already?</Text>
              <Text dimColor>Pass a 12-question placement quiz on {LEVELS[LEVELS.indexOf(s.level) - 1]} (two mistakes allowed).</Text>
              <Button key="test" label="Take the placement quiz ▶" onPress={openTest} />
            </Box>
          )}
        </Box>
      )
    }

    // ================================ WORDS ==================================================
    if (s.screen === 'words') {
      const unit = UNITS[s.level][s.unit]
      const got = unit.lessons.map((l, p) => ({ l, p })).filter(({ p }) => starsOf(s, s.level, s.unit * 5 + p) > 0)
      return (
        <Box flexDirection="column">
          {header}
          <Box borderStyle="round" borderColor={info.color} paddingX={1} flexDirection="column">
            <Box>
              <Button key="unit-prev" label={s.unit > 0 ? '◀ ' : '   '} onPress={() => goUnit(-1)} />
              <Text bold color={info.color}>📖 {s.level} · UNIT {s.unit + 1} · {unit.title}</Text>
              <Button key="unit-next" label={s.unit < 3 ? ' ▶' : '  '} onPress={() => goUnit(1)} />
            </Box>
            <Text dimColor>{got.length}/4 lessons collected · tap 🔊 to hear a word</Text>
          </Box>
          {got.length === 0 && <Text dimColor>Finish a lesson in this unit to collect its words.</Text>}
          {got.map(({ l, p }) => (
            <Box key={`wl-${p}`} flexDirection="column">
              <Text bold>{l.title}</Text>
              {l.words.map((w, k) => (
                <Box key={`ww-${p}-${k}`}>
                  <Button key={`say-${p}-${k}`} label="🔊 " onPress={() => say(w[0])} />
                  <Text bold color={info.color}>{w[0]}</Text>
                  <Text dimColor>  {w[1]}</Text>
                </Box>
              ))}
            </Box>
          ))}
          <Box borderStyle="round" borderColor="gray" paddingX={1}>
            <Button key="back" hotkey="m" label="← Map" onPress={toMap} />
          </Box>
        </Box>
      )
    }

    // ================================ INTRO ==================================================
    if (s.screen === 'intro') {
      const isTest = s.lesson === -1
      const isPractice = s.lesson === -2
      const { unit, review: isRev, lesson } = lessonInfo(s.level, Math.max(0, s.lesson))
      return (
        <Box flexDirection="column">
          {header}
          <Box borderStyle="double" borderColor={isTest || isPractice ? 'yellow' : isRev ? 'magenta' : info.color} paddingX={1} flexDirection="column">
            <Text bold color={isTest || isPractice ? 'yellow' : isRev ? 'magenta' : info.color}>
              {isPractice ? `💪 PRACTICE · ${s.level}` : isTest ? `🚀 PLACEMENT QUIZ → ${s.level}` : isRev ? `🏆 UNIT REVIEW · ${unit.title}` : `${unit.emoji} LESSON ${s.lesson + 1} · ${lesson!.title}`}
            </Text>
            <Text dimColor>
              {isPractice
                ? '10 mixed puzzles from the lessons you have finished. Earns 5 XP, no stars.'
                : isTest
                ? `12 questions from ${LEVELS[LEVELS.indexOf(s.level) - 1]}. Make at most 2 mistakes to unlock ${s.level}.`
                : isRev
                  ? `14 mixed puzzles on the words and sentences of this unit.`
                  : `${unit.sub} · ${s.level}`}
            </Text>
          </Box>
          {!isTest && !isPractice && !isRev && (
            <Box flexDirection="column">
              <Text bold>New words <Text dimColor>(tap 🔊 to hear)</Text></Text>
              {lesson!.words.map((w, k) => (
                <Box key={`wrow-${k}`}>
                  <Button key={`w-${k}`} label="🔊 " onPress={() => say(w[0])} />
                  <Text bold color={info.color}>{w[0]}</Text>
                  <Text dimColor>  {w[1]}</Text>
                </Box>
              ))}
            </Box>
          )}
          {isRev && (
            <Box flexDirection="column">
              {unit.lessons.map(l => <Text key={`rv-${l.title}`} dimColor>• {l.title}</Text>)}
            </Box>
          )}
          {!isTest && !isPractice && (
            <Box borderStyle="round" borderColor="yellow" paddingX={1}>
              <Text>💡 <Text dimColor>{unit.tip}</Text></Text>
            </Box>
          )}
          {s.note && <Text color="red">{s.note}</Text>}
          <Box>
            <Box borderStyle="round" borderColor="green" paddingX={1} marginRight={1}>
              <Button key="start" hotkey="s" label="▶ Start" onPress={begin} />
            </Box>
            <Box borderStyle="round" borderColor="gray" paddingX={1}>
              <Button key="back" hotkey="m" label="← Map" onPress={toMap} />
            </Box>
          </Box>
        </Box>
      )
    }

    // ================================ RESULT =================================================
    if (s.screen === 'result') {
      const isTest = s.lesson === -1
      const isPractice = s.lesson === -2
      const target = nextTarget(s)
      const goal = Math.min(s.dayXp, GOAL)
      return (
        <Box flexDirection="column">
          {header}
          <Box borderStyle="double" borderColor={s.passed ? 'green' : 'red'} paddingX={1} flexDirection="column">
            <Text bold color={s.passed ? 'green' : 'red'}>
              {s.passed ? (isTest ? '🚀 LEVEL UNLOCKED' : isPractice ? '💪 PRACTICE COMPLETE' : '🏆 LESSON COMPLETE') : isTest ? '😕 NOT QUITE, TRY AGAIN' : '💔 OUT OF HEARTS'}
            </Text>
            {!isTest && !isPractice && <Text>{'⭐'.repeat(s.lastStars)}{'☆'.repeat(3 - s.lastStars)}</Text>}
            <Text>🎯 {s.correct}/{s.ex.filter(q => !q.again).length} first try   ⭐ +{s.gained} XP   🔥 best combo {s.best}</Text>
            <Text dimColor>Daily goal {goal}/{GOAL} <Text color="green">{bar(goal, GOAL, 10)}</Text>{goal >= GOAL ? ' ✅' : ''}</Text>
          </Box>
          {target && (
            <Box borderStyle="round" borderColor="green" paddingX={1}>
              <Button key="next" hotkey="n" label={`Next: ${lessonInfo(target[0], target[1]).title} ▶`} onPress={() => openLesson(target[0], target[1])} />
            </Box>
          )}
          <Box>
            <Box borderStyle="round" borderColor="gray" paddingX={1} marginRight={1}>
              <Button key="retry" hotkey="r" label="↻ Again" onPress={() => update($, app, a => ({ ...a, ...fresh, screen: 'intro' as const }))} />
            </Box>
            <Box borderStyle="round" borderColor="gray" paddingX={1}>
              <Button key="map" hotkey="m" label="🗺 Map" onPress={toMap} />
            </Box>
          </Box>
        </Box>
      )
    }

    // ================================ LESSON =================================================
    const answered1 = s.status !== 'idle'
    const ok = s.status === 'right'
    const answerText = x.kind === 'match' ? '' : x.answer
    const isLast = (s.i + 1 >= s.ex.length && !(s.status === 'wrong' && !x.again)) || s.hearts <= 0
    const shortOpts = x.kind === 'choice' && x.options.every(o => o.length <= 18)

    let body
    if (x.kind === 'choice') {
      body = (
        <Box flexDirection="column">
          <Box borderStyle="round" borderColor="gray" paddingX={1}>
            {x.say && <Button key="play" hotkey="p" label="🔊 " onPress={() => say(x.say as string)} />}
            <Text bold>{x.prompt}</Text>
          </Box>
          {x.context && <Text dimColor>{x.context}</Text>}
          <Box flexDirection={shortOpts ? 'row' : 'column'} flexWrap="wrap">
            {x.options.map((o, n) => {
              const bc = !answered1 ? 'gray' : o === x.answer ? 'green' : o === s.picked ? 'red' : 'gray'
              const mark = !answered1 ? '' : o === x.answer ? '✅ ' : o === s.picked ? '❌ ' : ''
              return (
                <Box key={`ob-${o}`} borderStyle="round" borderColor={bc} paddingX={1} marginRight={1}>
                  <Button key={`opt-${o}`} hotkey={String(n + 1)} label={`${mark || `${n + 1} `}${o}`} onPress={() => pick(o)} />
                </Box>
              )
            })}
          </Box>
        </Box>
      )
    } else if (x.kind === 'match') {
      const doneRight = s.matched.map(t => x.pairs[t])
      // Long labels (idioms) would overflow two columns, so they stack instead.
      const stacked = Math.max(...x.left.map(t => t.length)) + Math.max(...x.right.map(t => t.length)) > cols - 16
      body = (
        <Box flexDirection={stacked ? 'column' : 'row'}>
          <Box flexDirection="column" marginRight={1}>
            {x.left.map((t, n) => (
              <Box key={`lb-${t}`} borderStyle="round" borderColor={s.matched.includes(t) ? 'green' : s.sel === t ? 'cyan' : 'gray'} paddingX={1}>
                <Button key={`l-${t}`} hotkey={String(n + 1)} label={s.matched.includes(t) ? `✅ ${t}` : `${n + 1} ${t}`} onPress={() => tapLeft(t)} />
              </Box>
            ))}
          </Box>
          <Box flexDirection="column">
            {x.right.map((r, n) => (
              <Box key={`rb-${r}`} borderStyle="round" borderColor={doneRight.includes(r) ? 'green' : 'gray'} paddingX={1}>
                <Button key={`r-${r}`} hotkey={'qwert'[n]} label={doneRight.includes(r) ? `✅ ${r}` : `${'qwert'[n]} ${r}`} onPress={() => tapRight(r)} />
              </Box>
            ))}
          </Box>
        </Box>
      )
    } else {
      const built = s.used.map(k => x.bank[k])
      body = (
        <Box flexDirection="column">
          <Box borderStyle="round" borderColor="gray" paddingX={1}>
            {x.say && <Button key="play" hotkey="p" label="🔊 " onPress={() => say(x.say as string)} />}
            <Text bold>{x.prompt}</Text>
          </Box>
          <Box borderStyle="round" borderColor={ok ? 'green' : answered1 ? 'red' : 'cyan'} paddingX={1} minHeight={3}>
            <Text>{built.length ? built.join(' ') : x.kind === 'spell' ? '_ _ _' : '…'}</Text>
          </Box>
          <Box flexWrap="wrap">
            {x.bank.map((w, k) =>
              s.used.includes(k) ? null : (
                <Box key={`cb-${k}`} borderStyle="round" borderColor="gray" paddingX={1} marginRight={1}>
                  <Button key={`b-${k}`} hotkey={k < 9 ? String(k + 1) : undefined} label={k < 9 ? `${k + 1} ${w}` : w} onPress={() => tapBank(k)} />
                </Box>
              ),
            )}
          </Box>
          {!answered1 && (
            <Box>
              <Box borderStyle="round" borderColor="gray" paddingX={1} marginRight={1}>
                <Button key="undo" hotkey="u" label="↩ Undo" onPress={undo} />
              </Box>
              {s.used.length > 0 && (
                <Box borderStyle="round" borderColor="green" paddingX={1}>
                  <Button key="check" hotkey="c" label="✔ Check" onPress={check} />
                </Box>
              )}
            </Box>
          )}
        </Box>
      )
    }

    return (
      <Box flexDirection="column">
        <Box>
          <Button key="quit" label="✕ " onPress={toMap} />
          <Text color={info.color}>{bar(s.i + (answered1 && ok ? 1 : 0), s.ex.length, 16)}</Text>
          <Text>  {heartsRow(s.hearts, MAX_HEARTS)} </Text>
          <Button key="sound" label={s.sound ? '🔊' : '🔇'} onPress={() => update($, app, a => ({ ...a, sound: !a.sound }))} />
        </Box>
        <Text bold color="magenta">{x.again ? '↻ Try again: ' : ''}{x.title}</Text>
        {body}
        {!answered1 && s.note && <Text color="red">{s.note}</Text>}
        {answered1 && (
          <Box borderStyle="round" borderColor={ok ? 'green' : 'red'} paddingX={1} flexDirection="column">
            <Text bold color={ok ? 'green' : 'red'}>
              {ok ? '✅' : '❌'} {ok ? PRAISE[s.i % PRAISE.length] : 'Nicht ganz.'}
              {ok && s.gain > 0 ? `  +${s.gain} XP` : ''}
              {ok && s.combo >= 3 ? `  🔥 ${s.combo} in a row` : ''}
            </Text>
            {!ok && answerText !== '' && <Text>Correct answer: <Text bold>{answerText}</Text></Text>}
            {s.note !== '' && <Text dimColor>{s.note}</Text>}
            <Button key="continue" hotkey="c" label={isLast ? '▶ Finish' : '▶ Continue'} onPress={cont} />
          </Box>
        )}
      </Box>
    )
  })
}
