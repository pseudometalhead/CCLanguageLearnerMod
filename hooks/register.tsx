import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { App, Question } from '../types'
import { COURSES } from './lessons'

const PANE = 'language-learner'
const MAX_HEARTS = 5
const DAY = 86_400_000

const initial: App = {
  screen: 'home',
  lang: 'Spanish',
  lesson: 0,
  qIdx: 0,
  questions: [],
  picked: null,
  hearts: MAX_HEARTS,
  xp: 0,
  streak: 0,
  lastDay: 0,
  correct: 0,
  done: {},
}

const app = atom({ plugin: 'language-learner', key: 'app' } as const, initial)

const shuffle = <T,>(items: T[], seed: number): T[] => {
  const out = [...items]
  let s = seed || 1
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) % 2147483648
    const j = s % (i + 1)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

const buildQuestions = (lang: string, lesson: number, seed: number): Question[] => {
  const words = COURSES[lang][lesson].words
  const all = COURSES[lang].flatMap(l => l.words)
  return shuffle(words, seed).map(([target, english], i) => {
    const toEnglish = i % 2 === 0
    const answer = toEnglish ? english : target
    const pool = all.map(w => (toEnglish ? w[1] : w[0])).filter(w => w !== answer)
    const distractors = shuffle([...new Set(pool)], seed + i + 7).slice(0, 3)
    return {
      prompt: toEnglish ? `What does "${target}" mean?` : `How do you say "${english}" in ${lang}?`,
      answer,
      options: shuffle([answer, ...distractors], seed + i + 13),
    }
  })
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'learn', description: 'Open the language learning pane' })
    const saved = (await $.store.get('app')) as App | undefined
    if (saved) {
      const today = Math.floor((await $.clock.now()) / DAY)
      const streak = saved.lastDay >= today - 1 ? saved.streak : 0
      await update($, app, () => ({ ...initial, ...saved, screen: 'home', hearts: MAX_HEARTS, streak }))
    }
    return next(e)
  })

  on('command.run', { command: 'learn' }, async $ => {
    await $.ui.open({ id: PANE, title: 'Language Learner' })
    return { text: 'Language Learner opened. Pick a language and a lesson.' }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e)
    const s = await read($, app)
    const stats = (
      <Text>
        {'🔥 '}{s.streak}{'   ⭐ '}{s.xp} XP{'   ❤️ '}{s.hearts}
      </Text>
    )

    const start = (lesson: number) =>
      update($, app, a => ({
        ...a,
        screen: 'quiz',
        lesson,
        qIdx: 0,
        picked: null,
        correct: 0,
        hearts: MAX_HEARTS,
        questions: buildQuestions(a.lang, lesson, Date.now() % 100000),
      }))

    if (s.screen === 'home') {
      const done = s.done[s.lang] ?? []
      return (
        <Box flexDirection="column">
          {stats}
          <Text bold>Language: {s.lang}</Text>
          <Box>
            {Object.keys(COURSES).map(l => (
              <Button key={l} label={l === s.lang ? `[${l}]` : l} onPress={() => update($, app, a => ({ ...a, lang: l }))} />
            ))}
          </Box>
          <Text bold>Lessons</Text>
          {COURSES[s.lang].map((l, i) => (
            <Button key={l.title} label={`${done.includes(i) ? '✅' : '▶'} ${i + 1}. ${l.title}`} onPress={() => start(i)} />
          ))}
        </Box>
      )
    }

    if (s.screen === 'result') {
      const passed = s.hearts > 0
      return (
        <Box flexDirection="column">
          {stats}
          <Text bold>{passed ? '🎉 Lesson complete!' : '💔 Out of hearts'}</Text>
          <Text>{s.correct}/{s.questions.length} correct</Text>
          <Button label="Back to lessons" onPress={() => update($, app, a => ({ ...a, screen: 'home' }))} />
          <Button label="Try again" onPress={() => start(s.lesson)} />
        </Box>
      )
    }

    const q = s.questions[s.qIdx]
    const finish = async () => {
      const today = Math.floor((await $.clock.now()) / DAY)
      await update($, app, a => {
        const passed = a.hearts > 0
        const prior = a.done[a.lang] ?? []
        const newDay = a.lastDay !== today
        return {
          ...a,
          screen: 'result',
          xp: a.xp + (passed ? 10 : 0),
          streak: passed && newDay ? (a.lastDay === today - 1 ? a.streak + 1 : 1) : a.streak,
          lastDay: passed ? today : a.lastDay,
          done: passed && !prior.includes(a.lesson) ? { ...a.done, [a.lang]: [...prior, a.lesson] } : a.done,
        }
      })
      await $.store.set('app', await read($, app))
    }
    const pick = async (opt: string) => {
      if (s.picked !== null) return
      const ok = opt === q.answer
      await update($, app, a => ({
        ...a,
        picked: opt,
        correct: a.correct + (ok ? 1 : 0),
        hearts: a.hearts - (ok ? 0 : 1),
        xp: a.xp + (ok ? 2 : 0),
      }))
    }
    const next = async () => {
      const cur = await read($, app)
      if (cur.hearts <= 0 || cur.qIdx + 1 >= cur.questions.length) return finish()
      await update($, app, a => ({ ...a, qIdx: a.qIdx + 1, picked: null }))
    }

    return (
      <Box flexDirection="column">
        {stats}
        <Text dimColor>Question {s.qIdx + 1}/{s.questions.length}</Text>
        <Text bold>{q.prompt}</Text>
        {q.options.map(o => {
          const mark = s.picked === null ? '○' : o === q.answer ? '✅' : o === s.picked ? '❌' : '○'
          return <Button key={o} label={`${mark} ${o}`} onPress={() => pick(o)} />
        })}
        {s.picked !== null && (
          <Box flexDirection="column">
            <Text>{s.picked === q.answer ? 'Correct! +2 XP' : `Not quite. Answer: ${q.answer}`}</Text>
            <Button label="Continue ▶" onPress={next} />
          </Box>
        )}
      </Box>
    )
  })
}
