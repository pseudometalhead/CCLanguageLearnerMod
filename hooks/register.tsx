import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { App, Level } from '../types'
import { APP_NAME, LEVELS, LEVEL_INFO } from './course'
import { COURSES, DEFAULT_COURSE, courseOf } from './courses'
import { DAY, doneCount, firstOpen, fresh, GOAL, levelOpen, MAX_HEARTS, newApp, newLearner, nextTarget, nodeState, placedLevel, placedTested, primaryKey, restore, sk, starsOf, switchCourse } from './progress'
import { BEEP_WAV } from './beep'
import { bar, buildDiagnostic, buildLesson, buildPractice, buildTest, DIAG_PASS, DIAG_STAGE, heartsRow, isReview, lessonInfo, LESSONS_PER_LEVEL, unitIndex } from './engine'

const PANE = 'language-learner'
const STORE = 'app-v3'
// How far each node of a unit sits from the left edge, so the path winds like a river.
const WIND = [4, 9, 12, 9, 4]
const WIND_NARROW = [0, 2, 4, 2, 0]

const initial = newApp(DEFAULT_COURSE)
const app = atom({ plugin: 'language-learner', key: 'app' } as const, initial)

// ---- scoring ------------------------------------------------------------------------------
const isCheck = (a: App) => a.lesson === -3
const right = (a: App): App => {
  // A repeat of an earlier mistake earns nothing and does not count towards the combo.
  if (a.ex[a.i].again) return { ...a, status: 'right', gain: 0 }
  const first = !a.slip
  const combo = first ? a.combo + 1 : 0
  // Practice pays a flat bonus at the end, so it cannot be farmed puzzle by puzzle.
  const gain = first && a.lesson !== -2 ? 2 + (combo >= 3 ? 1 : 0) : 0
  return { ...a, status: 'right', combo, best: Math.max(a.best, combo), gain, correct: a.correct + (first ? 1 : 0), dhits: a.dhits + (first && isCheck(a) ? 1 : 0), xp: a.xp + gain, gained: a.gained + gain }
}
const wrong = (a: App, isSoft = false): App => ({ ...a, status: 'wrong', combo: 0, slip: true, gain: 0, hearts: isSoft || isCheck(a) ? a.hearts : a.hearts - 1 })

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'babel-learning', description: 'Open Babel Learning, the language course (A1 to C1)' })
    await $.command.register({ name: 'learn', description: 'Shortcut for /babel-learning' })
    const saved = (await $.store.get(STORE)) as Partial<App> | undefined
    if (saved) {
      const today = Math.floor((await $.clock.now()) / DAY)
      await update($, app, () => restore(saved, today, Object.keys(COURSES)))
    }
    return next(e)
  })

  // The keyboard drifts back to the prompt when the button that held the focus ring is redrawn away (Continue,
  // Start...). After every press, ask for the keys again and put the ring on the button Enter should act on.
  on('ui.press', { plugin: 'language-learner' }, async ($, e, next) => {
    const pressed = await next(e)
    try {
      const key = primaryKey(await read($, app))
      await $.ui.open({ id: PANE, title: APP_NAME, focus: true })
      if (key) await $.ui.focus({ requestId: PANE, key })
    } catch {
      // the pane may already hold the keys, or the surface refuses focus: nothing to do
    }
    return pressed
  })

  // Hotkeys only work while the pane holds the keyboard, so open it focused (Escape hands the keys back;
  // ctrl+x tab or a click takes them again).
  for (const command of ['babel-learning', 'learn']) {
    on('command.run', { command }, async $ => {
      await $.ui.open({ id: PANE, title: APP_NAME, focus: true })
      return { text: `${APP_NAME} opened. Pick a lesson on the map. Keys not responding? Click the pane, or press ctrl+x then tab.` }
    })
  }

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e)
    const s = await read($, app)
    const info = LEVEL_INFO[s.level]
    const x = s.ex[s.i]
    const course = courseOf(s.lang)
    // The pane can be narrow: tighten the winding path and stack wide columns.
    const cols = e.props.bodyColumns || 56
    const narrow = cols < 46

    // ---- audio ----------------------------------------------------------------------------
    const say = async (text: string) => {
      // Try each installed-voice name in turn (names differ per platform), then the platform default.
      let why = ''
      for (const voice of [...course.voices, undefined]) {
        try {
          await $.audio.speak(text, voice ? { voice } : undefined)
          return
        } catch (err) {
          why = err instanceof Error ? err.message : String(err)
        }
      }
      await update($, app, a => ({ ...a, note: `🔇 No speech here (${why.slice(0, 160) || 'no reason given'}). It says: “${text}”` }))
    }
    // Says in the pane whether speech and clip playback work here, with the engine's own error if not.
    const testAudio = async () => {
      const report: string[] = []
      try {
        await $.audio.speak('Hallo, das ist ein Test.')
        report.push('speech: works')
      } catch (err) {
        report.push(`speech: ${(err instanceof Error ? err.message : String(err)).slice(0, 140)}`)
      }
      try {
        await $.audio.play({ base64: BEEP_WAV, mime: 'audio/wav' })
        report.push('beep: played (did you hear it?)')
      } catch (err) {
        report.push(`beep: ${(err instanceof Error ? err.message : String(err)).slice(0, 140)}`)
      }
      await update($, app, a => ({ ...a, note: `🔧 Audio test: ${report.join(' · ')}` }))
    }
    // Speaks what the exercise now showing asks to hear when it opens.
    const opened = async () => {
      const a = await read($, app)
      const q = a.ex[a.i]
      if (a.sound && q && q.kind !== 'match' && q.auto && q.say) await say(q.say)
    }
    // Runs an answer; once it settles the exercise, speaks the text it carries.
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
    const openCheck = () => update($, app, a => ({ ...a, ...fresh, screen: 'intro' as const, lesson: -3 }))
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
        dhits: 0,
        dpass: 0,
        ex:
          a.lesson === -3
            ? buildDiagnostic(courseOf(a.lang), seed)
            : a.lesson === -1
            ? buildTest(courseOf(a.lang), a.level, seed)
            : a.lesson === -2
              ? buildPractice(courseOf(a.lang), a.level, Array.from({ length: LESSONS_PER_LEVEL }, (_, i) => i).filter(i => starsOf(a, a.level, i) > 0), seed)
              : buildLesson(courseOf(a.lang), a.level, a.lesson, seed),
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
          const hit = { ...a, sel: null, slip: true, combo: 0, note: 'Not a match, try again.', hearts: isCheck(a) ? a.hearts : a.hearts - 1 }
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
          // Word order is often free in both languages, so a reshuffle costs no heart.
          return sameWords
            ? { ...wrong(a, true), note: `Same words, different order. Yours may work too, no heart lost. You will see it once more at the end. Model answer: ${q.answer}` }
            : wrong(a)
        }),
      )

    const cont = async () => {
      const cur = await read($, app)
      if (cur.status === 'idle') return
      const diag = isCheck(cur)
      if (diag) {
        // Stages of DIAG_STAGE questions, A1 up: clear one with DIAG_PASS right to go on, miss it and the check ends.
        const stageEnd = (cur.i + 1) % DIAG_STAGE === 0
        const cleared = stageEnd && cur.dhits >= DIAG_PASS
        if (!stageEnd || (cleared && cur.i + 1 < cur.ex.length)) {
          await update($, app, a => ({ ...a, ...fresh, i: a.i + 1, dhits: stageEnd ? 0 : a.dhits, dpass: cleared ? a.dpass + 1 : a.dpass }))
          await opened()
          return
        }
      }
      // Duolingo-style: a mistake comes back once at the end of the lesson.
      const missed = cur.status === 'wrong' && !cur.ex[cur.i].again && cur.hearts > 0
      if (!diag && cur.hearts > 0 && (cur.i + 1 < cur.ex.length || missed)) {
        await update($, app, a => ({ ...a, ...fresh, ex: missed ? [...a.ex, { ...a.ex[a.i], again: true }] : a.ex, i: a.i + 1 }))
        await opened()
        return
      }
      const today = Math.floor((await $.clock.now()) / DAY)
      const before = starsOf(cur, cur.level, cur.lesson)
      await update($, app, a => {
        const isTest = a.lesson === -1
        const isPractice = a.lesson === -2
        const cleared = a.dpass + (diag && a.dhits >= DIAG_PASS ? 1 : 0)
        const passed = diag || (isTest ? a.hearts >= 3 : a.hearts > 0)
        const stars = !passed ? 0 : isTest ? 3 : a.hearts >= MAX_HEARTS ? 3 : a.hearts >= 3 ? 2 : 1
        const bonus = !passed ? 0 : diag ? 10 : isTest ? 20 : isPractice ? 5 : 10 + (a.hearts === MAX_HEARTS ? 5 : 0)
        const total = a.gained + bonus
        const streak = passed && a.lastDay !== today ? (a.lastDay === today - 1 ? a.streak + 1 : 1) : a.streak
        const key = sk(a.lang, a.level, a.lesson)
        return {
          ...a,
          screen: 'result' as const,
          level: diag ? placedLevel(cleared) : a.level,
          unit: diag ? 0 : a.unit,
          dpass: diag ? cleared : a.dpass,
          passed,
          lastStars: stars,
          xp: a.xp + bonus,
          gained: total,
          dayXp: (a.goalDay === today ? a.dayXp : 0) + total,
          goalDay: today,
          streak,
          lastDay: passed ? today : a.lastDay,
          stars: !isTest && !isPractice && passed ? { ...a.stars, [key]: Math.max(a.stars[key] ?? 0, stars) } : a.stars,
          tested: diag ? placedTested(a, cleared) : isTest && passed ? { ...a.tested, [`${a.lang}:${a.level}`]: true } : a.tested,
        }
      })
      const a = await read($, app)
      await $.store.set(STORE, { lang: a.lang, sound: a.sound, xp: a.xp, streak: a.streak, lastDay: a.lastDay, dayXp: a.dayXp, goalDay: a.goalDay, stars: a.stars, tested: a.tested })
      if (diag) $.ui.toast(`🎯 Start at ${a.level} ${LEVEL_INFO[a.level].name}`)
      else if (a.passed && a.lesson === -1) $.ui.toast(`🚀 ${a.level} ${LEVEL_INFO[a.level].name} unlocked!`)
      else if (a.passed && a.lesson >= 0 && before === 0) {
        const u = unitIndex(a.lesson)
        if ([0, 1, 2, 3, 4].every(p => starsOf(a, a.level, u * 5 + p) > 0)) $.ui.toast(`🏆 Unit complete: ${courseOf(a.lang).levels[a.level][u].title}`)
        if (doneCount(a, a.level) >= LESSONS_PER_LEVEL) $.ui.toast(`🎉 ${a.level} ${LEVEL_INFO[a.level].name} complete!`)
      }
    }

    // ---- shared pieces --------------------------------------------------------------------
    const header = (
      <Box borderStyle="round" borderColor="cyan" paddingX={1} flexDirection="column">
        <Box>
          <Text bold color="cyan">🌍 {APP_NAME} <Text dimColor>· {course.flag} {course.name} </Text></Text>
          <Button key="sound" label={s.sound ? '🔊 on' : '🔇 off'} onPress={() => update($, app, a => ({ ...a, sound: !a.sound }))} />
        </Box>
        <Text>🔥 {s.streak}   ⭐ {s.xp}   🎯 {Math.min(s.dayXp, GOAL)}/{GOAL} <Text color="green">{bar(Math.min(s.dayXp, GOAL), GOAL, 8)}</Text></Text>
      </Box>
    )

    // ================================ MAP ====================================================
    if (s.screen === 'home') {
      const open = levelOpen(s, s.level)
      const n = doneCount(s, s.level)
      const unit = course.levels[s.level][s.unit]
      const cur = firstOpen(s, s.level)
      const base = narrow ? WIND_NARROW : WIND
      const wind = s.unit % 2 === 0 ? base : [...base].reverse()
      const fresh0 = LEVELS.every(l => doneCount(s, l) === 0)
      // Enter acts on the focus ring's start: the level check for a new learner, else the lesson to play next.
      const showCheck = fresh0 && newLearner(s)
      const coach = !open
        ? 'This level is locked. Finish the one before, or jump ahead!'
        : fresh0
          ? course.coach.welcome
          : n >= LESSONS_PER_LEVEL
            ? course.coach.done
            : s.dayXp >= GOAL
              ? course.coach.goal.replace('{title}', lessonInfo(course, s.level, cur).title)
              : course.coach.next.replace('{title}', lessonInfo(course, s.level, cur).title)
      return (
        <Box flexDirection="column">
          {header}
          {Object.keys(COURSES).length > 1 && (
            <Box marginBottom={1}>
              {Object.values(COURSES).map(c => (
                <Button key={`lang-${c.code}`} label={`${c.code === s.lang ? '●' : '○'} ${c.flag} ${c.name}  `} onPress={() => update($, app, a => switchCourse(a, c.code))} />
              ))}
            </Box>
          )}
          {showCheck && (
            <Box borderStyle="round" borderColor="yellow" paddingX={1} flexDirection="column" marginBottom={1}>
              <Text bold color="yellow">🎯 New here? Find your level</Text>
              <Box marginBottom={1}>
                <Text dimColor>20 questions, A1 upwards. We stop when it gets too hard and start you at the right level. No hearts to lose.</Text>
              </Box>
              <Box>
                <Box borderStyle="round" borderColor="yellow" paddingX={1}>
                  <Button key="check-new" hotkey="l" autoFocus label="🎯 Take the level check" onPress={openCheck} />
                </Box>
              </Box>
            </Box>
          )}
          <Box marginBottom={1}>
            {LEVELS.map(lv => (
              <Button key={`tab-${lv}`} label={`${lv === s.level ? '▣' : levelOpen(s, lv) ? '□' : '🔒'} ${lv}  `} onPress={() => goLevel(lv)} />
            ))}
          </Box>
          <Text color={info.color} bold>{s.level} · {info.name}  {bar(n, LESSONS_PER_LEVEL, 10)} {n}/{LESSONS_PER_LEVEL}</Text>
          <Box marginBottom={1}>
            <Text dimColor>💬 “{coach}”</Text>
          </Box>
          <Box borderStyle="round" borderColor={open ? info.color : 'gray'} paddingX={1} flexDirection="column" marginBottom={1}>
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
            const title = lessonInfo(course, s.level, idx).title
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
                    <Button key={`node-${idx}`} label={face} autoFocus={st === 'current' && !showCheck ? true : undefined} onPress={() => openLesson(s.level, idx)} />
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
          {s.note && (
            <Box marginTop={1}>
              <Text color="red">{s.note}</Text>
            </Box>
          )}
          <Box marginTop={1}>
            <Box borderStyle="round" borderColor="gray" paddingX={1}>
              <Button key="audiotest" hotkey="a" label="🔧 Audio test" onPress={testAudio} />
            </Box>
          </Box>
          {open && n > 0 && (
            <Box marginTop={1}>
              <Box borderStyle="round" borderColor="gray" paddingX={1} marginRight={1}>
                <Button key="practice" hotkey="x" label="💪 Practice" onPress={openPractice} />
              </Box>
              <Box borderStyle="round" borderColor="gray" paddingX={1} marginRight={1}>
                <Button key="words" hotkey="w" label="📖 Words" onPress={openWords} />
              </Box>
              <Box borderStyle="round" borderColor="gray" paddingX={1}>
                <Button key="check" hotkey="l" label="🎯 Level check" onPress={openCheck} />
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
      const unit = course.levels[s.level][s.unit]
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
      const isDiag = s.lesson === -3
      const { unit, review: isRev, lesson } = lessonInfo(course, s.level, Math.max(0, s.lesson))
      return (
        <Box flexDirection="column">
          {header}
          <Box borderStyle="double" borderColor={isTest || isPractice || isDiag ? 'yellow' : isRev ? 'magenta' : info.color} paddingX={1} flexDirection="column" marginBottom={1}>
            <Text bold color={isTest || isPractice || isDiag ? 'yellow' : isRev ? 'magenta' : info.color}>
              {isDiag ? '🎯 LEVEL CHECK' : isPractice ? `💪 PRACTICE · ${s.level}` : isTest ? `🚀 PLACEMENT QUIZ → ${s.level}` : isRev ? `🏆 UNIT REVIEW · ${unit.title}` : `${unit.emoji} LESSON ${s.lesson + 1} · ${lesson!.title}`}
            </Text>
            <Text dimColor>
              {isDiag
                ? `${DIAG_STAGE * LEVELS.length} questions, ${DIAG_STAGE} per level from A1 up. Get ${DIAG_PASS} of ${DIAG_STAGE} right to move on; it stops when a level is too hard. No hearts, no stars, and you start at the level it finds.`
                : isPractice
                ? '10 mixed puzzles from the lessons you have finished. Earns 5 XP, no stars.'
                : isTest
                ? `12 questions from ${LEVELS[LEVELS.indexOf(s.level) - 1]}. Make at most 2 mistakes to unlock ${s.level}.`
                : isRev
                  ? `14 mixed puzzles on the words and sentences of this unit.`
                  : `${unit.sub} · ${s.level}`}
            </Text>
          </Box>
          {!isTest && !isPractice && !isDiag && !isRev && (
            <Box flexDirection="column" marginBottom={1}>
              <Text bold>New words <Text dimColor>(tap 🔊 to hear)</Text></Text>
              {lesson!.words.map((w, k) => (
                <Box key={`wrow-${k}`}>
                  <Box marginRight={1}>
                    <Button key={`w-${k}`} label="🔊 " onPress={() => say(w[0])} />
                  </Box>
                  <Text bold color={info.color}>{w[0]}</Text>
                  <Text dimColor>  {w[1]}</Text>
                </Box>
              ))}
            </Box>
          )}
          {isRev && (
            <Box flexDirection="column" marginBottom={1}>
              {unit.lessons.map(l => <Text key={`rv-${l.title}`} dimColor>• {l.title}</Text>)}
            </Box>
          )}
          {!isTest && !isPractice && !isDiag && (
            <Box borderStyle="round" borderColor="yellow" paddingX={1} marginBottom={1}>
              <Text>💡 <Text dimColor>{unit.tip}</Text></Text>
            </Box>
          )}
          {s.note && (
            <Box marginBottom={1}>
              <Text color="red">{s.note}</Text>
            </Box>
          )}
          <Box>
            <Box borderStyle="round" borderColor="green" paddingX={1} marginRight={1}>
              <Button key="start" hotkey="s" autoFocus label="▶ Start" onPress={begin} />
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
      const isDiag = s.lesson === -3
      const target = nextTarget(s)
      const goal = Math.min(s.dayXp, GOAL)
      return (
        <Box flexDirection="column">
          {header}
          <Box borderStyle="double" borderColor={s.passed ? 'green' : 'red'} paddingX={1} flexDirection="column" marginBottom={1}>
            <Text bold color={s.passed ? 'green' : 'red'}>
              {isDiag ? `🎯 YOUR LEVEL: ${s.level} · ${LEVEL_INFO[s.level].name}` : s.passed ? (isTest ? '🚀 LEVEL UNLOCKED' : isPractice ? '💪 PRACTICE COMPLETE' : '🏆 LESSON COMPLETE') : isTest ? '😕 NOT QUITE, TRY AGAIN' : '💔 OUT OF HEARTS'}
            </Text>
            {isDiag && <Text>You cleared {s.dpass} of {LEVELS.length} levels{s.dpass > 0 ? `, up to ${LEVELS[Math.min(s.dpass, LEVELS.length) - 1]}` : ''}. {s.level} is where new material starts; the levels below stay open to browse.</Text>}
            {!isTest && !isPractice && !isDiag && <Text>{'⭐'.repeat(s.lastStars)}{'☆'.repeat(3 - s.lastStars)}</Text>}
            {isDiag ? <Text>⭐ +{s.gained} XP</Text> : <Text>🎯 {s.correct}/{s.ex.filter(q => !q.again).length} first try   ⭐ +{s.gained} XP   🔥 best combo {s.best}</Text>}
            <Text dimColor>Daily goal {goal}/{GOAL} <Text color="green">{bar(goal, GOAL, 10)}</Text>{goal >= GOAL ? ' ✅' : ''}</Text>
          </Box>
          {isDiag && (
            <Box borderStyle="round" borderColor="green" paddingX={1} marginBottom={1}>
              <Button key="begin" hotkey="n" autoFocus label={`Start ${s.level} ▶`} onPress={toMap} />
            </Box>
          )}
          {target && (
            <Box borderStyle="round" borderColor="green" paddingX={1} marginBottom={1}>
              <Button key="next" hotkey="n" autoFocus label={`Next: ${lessonInfo(course, target[0], target[1]).title} ▶`} onPress={() => openLesson(target[0], target[1])} />
            </Box>
          )}
          <Box>
            <Box borderStyle="round" borderColor="gray" paddingX={1} marginRight={1}>
              <Button key="retry" hotkey="r" label="↻ Again" onPress={() => update($, app, a => ({ ...a, ...fresh, screen: 'intro' as const }))} />
            </Box>
            <Box borderStyle="round" borderColor="gray" paddingX={1}>
              <Button key="map" hotkey="m" autoFocus={!target && !isDiag ? true : undefined} label="🗺 Map" onPress={toMap} />
            </Box>
          </Box>
        </Box>
      )
    }

    // ================================ LESSON =================================================
    const answered1 = s.status !== 'idle'
    const ok = s.status === 'right'
    const answerText = x.kind === 'match' ? '' : x.answer
    const isDiag = s.lesson === -3
    const isLast = isDiag
      ? (s.i + 1) % DIAG_STAGE === 0 && (s.dhits < DIAG_PASS || s.i + 1 >= s.ex.length)
      : (s.i + 1 >= s.ex.length && !(s.status === 'wrong' && !x.again)) || s.hearts <= 0
    const shortOpts = x.kind === 'choice' && x.options.every(o => o.length <= 18)

    let body
    if (x.kind === 'choice') {
      body = (
        <Box flexDirection="column">
          <Box borderStyle="round" borderColor="gray" paddingX={1} marginBottom={1}>
            {x.say && (
              <Box marginRight={1}>
                <Button key="play" hotkey="p" label="🔊 " onPress={() => say(x.say as string)} />
              </Box>
            )}
            <Text bold>{x.prompt}</Text>
          </Box>
          {x.context && (
            <Box marginBottom={1}>
              <Text dimColor>{x.context}</Text>
            </Box>
          )}
          <Box flexDirection={shortOpts ? 'row' : 'column'} flexWrap="wrap">
            {x.options.map((o, n) => {
              const bc = !answered1 ? 'gray' : o === x.answer ? 'green' : o === s.picked ? 'red' : 'gray'
              const mark = !answered1 ? '' : o === x.answer ? '✅ ' : o === s.picked ? '❌ ' : ''
              return (
                <Box key={`ob-${o}`} borderStyle="round" borderColor={bc} paddingX={1} marginRight={1} marginBottom={1}>
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
              <Box key={`lb-${t}`} borderStyle="round" borderColor={s.matched.includes(t) ? 'green' : s.sel === t ? 'cyan' : 'gray'} paddingX={1} marginBottom={1}>
                <Button key={`l-${t}`} hotkey={String(n + 1)} label={s.matched.includes(t) ? `✅ ${t}` : `${n + 1} ${t}`} onPress={() => tapLeft(t)} />
              </Box>
            ))}
          </Box>
          <Box flexDirection="column">
            {x.right.map((r, n) => (
              <Box key={`rb-${r}`} borderStyle="round" borderColor={doneRight.includes(r) ? 'green' : 'gray'} paddingX={1} marginBottom={1}>
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
          <Box borderStyle="round" borderColor="gray" paddingX={1} marginBottom={1}>
            {x.say && (
              <Box marginRight={1}>
                <Button key="play" hotkey="p" label="🔊 " onPress={() => say(x.say as string)} />
              </Box>
            )}
            <Text bold>{x.prompt}</Text>
          </Box>
          <Box borderStyle="round" borderColor={ok ? 'green' : answered1 ? 'red' : 'cyan'} paddingX={1} minHeight={3} marginBottom={1}>
            <Text>{built.length ? built.join(' ') : x.kind === 'spell' ? '_ _ _' : '…'}</Text>
          </Box>
          <Box flexWrap="wrap">
            {x.bank.map((w, k) =>
              s.used.includes(k) ? null : (
                <Box key={`cb-${k}`} borderStyle="round" borderColor="gray" paddingX={1} marginRight={1} marginBottom={1}>
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
                  <Button key="check" hotkey="c" autoFocus label="✔ Check" onPress={check} />
                </Box>
              )}
            </Box>
          )}
        </Box>
      )
    }

    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Box marginRight={1}>
            <Button key="quit" label="✕ " onPress={toMap} />
          </Box>
          <Box marginRight={1}>
            <Text color={info.color}>{bar(s.i + (answered1 && ok ? 1 : 0), s.ex.length, 16)}</Text>
          </Box>
          <Box marginRight={1}>
            <Text>{isDiag ? `${s.i + 1}/${s.ex.length}` : heartsRow(s.hearts, MAX_HEARTS)}</Text>
          </Box>
          <Button key="sound" label={s.sound ? '🔊' : '🔇'} onPress={() => update($, app, a => ({ ...a, sound: !a.sound }))} />
        </Box>
        <Box marginBottom={1}>
          <Text bold color="magenta">{x.again ? '↻ Try again: ' : ''}{x.title}</Text>
        </Box>
        {body}
        {!answered1 && s.note && (
          <Box marginTop={1}>
            <Text color="red">{s.note}</Text>
          </Box>
        )}
        {!answered1 && (
          <Box marginTop={1}>
            <Text dimColor>
              {x.kind === 'choice'
                ? `Press 1–${x.options.length} to answer${x.say ? ', p to hear it again' : ''}.`
                : x.kind === 'match'
                  ? 'Press a number for a word on the left, then a letter (q w e r t) for its match.'
                  : 'Press a number to pick a word, u to undo, then Enter to check.'}
            </Text>
          </Box>
        )}
        {answered1 && (
          <Box borderStyle="round" borderColor={ok ? 'green' : 'red'} paddingX={1} flexDirection="column" marginTop={1}>
            <Text bold color={ok ? 'green' : 'red'}>
              {ok ? '✅' : '❌'} {ok ? course.praise[s.i % course.praise.length] : course.oops}
              {ok && s.gain > 0 ? `  +${s.gain} XP` : ''}
              {ok && s.combo >= 3 ? `  🔥 ${s.combo} in a row` : ''}
            </Text>
            {!ok && answerText !== '' && <Text>Correct answer: <Text bold>{answerText}</Text></Text>}
            {s.note !== '' && <Text dimColor>{s.note}</Text>}
            <Text dimColor>Press Enter to continue.</Text>
            <Button key="continue" hotkey="c" autoFocus label={isLast ? '▶ Finish' : '▶ Continue'} onPress={cont} />
          </Box>
        )}
      </Box>
    )
  })
}
