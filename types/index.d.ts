export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1'

export type Exercise =
  | {
      kind: 'choice'
      title: string
      /** A repeat of an exercise answered wrongly, queued at the end of the lesson. */
      again?: boolean
      prompt: string
      context?: string
      answer: string
      options: string[]
      /** Text in the language being learned that a 🔊 button speaks while the exercise is open. */
      say?: string
      /** Speak `say` as soon as the exercise opens (a listening puzzle). */
      auto?: boolean
      /** Text in the language being learned, spoken once the exercise is answered. */
      after?: string
    }
  | { kind: 'match'; title: string; again?: boolean; left: string[]; right: string[]; pairs: Record<string, string> }
  | { kind: 'spell'; title: string; again?: boolean; prompt: string; answer: string; bank: string[]; say?: string; auto?: boolean; after?: string }
  | { kind: 'build'; title: string; again?: boolean; prompt: string; answer: string; bank: string[]; say?: string; auto?: boolean; after?: string }

export type App = {
  /** Course being studied: 'de'. Progress is kept per course. */
  lang: string
  screen: 'home' | 'intro' | 'play' | 'result' | 'words'
  level: Level
  unit: number
  /** 0 to 19 within the level; -1 is the placement quiz that unlocks `level`. */
  lesson: number
  ex: Exercise[]
  i: number
  picked: string | null
  used: number[]
  sel: string | null
  matched: string[]
  status: 'idle' | 'right' | 'wrong'
  slip: boolean
  note: string
  hearts: number
  sound: boolean
  combo: number
  best: number
  gain: number
  xp: number
  dayXp: number
  goalDay: number
  streak: number
  lastDay: number
  correct: number
  gained: number
  lastStars: number
  passed: boolean
  /** Best stars (1 to 3) per finished lesson, keyed "de:A1:0". */
  stars: Record<string, number>
  /** Levels opened by passing the placement quiz, keyed "de:B1". */
  tested: Record<string, boolean>
}

declare module 'claude-code' {
  interface PluginState {
    'language-learner': { app: App }
  }
}
