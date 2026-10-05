export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1'

export type Exercise =
  | { kind: 'choice'; prompt: string; context?: string; answer: string; options: string[] }
  | { kind: 'match'; left: string[]; right: string[]; pairs: Record<string, string> }
  | { kind: 'spell'; prompt: string; answer: string; bank: string[] }
  | { kind: 'build'; prompt: string; answer: string; bank: string[] }

export type App = {
  screen: 'home' | 'play' | 'result'
  lang: string
  level: Level
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
  xp: number
  streak: number
  lastDay: number
  correct: number
  gained: number
  done: Record<string, number[]>
}

declare module 'claude-code' {
  interface PluginState {
    'language-learner': { app: App }
  }
}
