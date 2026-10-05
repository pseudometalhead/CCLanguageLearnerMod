export type Question = { prompt: string; answer: string; options: string[] }

export type App = {
  screen: 'home' | 'quiz' | 'result'
  lang: string
  lesson: number
  qIdx: number
  questions: Question[]
  picked: string | null
  hearts: number
  xp: number
  streak: number
  lastDay: number
  correct: number
  done: Record<string, number[]>
}

declare module 'claude-code' {
  interface PluginState {
    'language-learner': { app: App }
  }
}
