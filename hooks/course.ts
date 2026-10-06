import type { Level } from '../types'

/** One vocabulary pair: [word in the language being learned, English]. */
export type Pair = [target: string, english: string]
// A sentence marks the word to blank out in a cloze puzzle with [brackets].
export type Lesson = { title: string; words: Pair[]; sentences: [Pair, Pair] }
export type Unit = { title: string; sub: string; emoji: string; tip: string; lessons: Lesson[] }

/** The name the app shows. Change it here only. */
export const APP_NAME = 'Babel Learning'

export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'] as const

export const LEVEL_INFO: Record<string, { name: string; color: string; blurb: string }> = {
  A1: { name: 'Beginner', color: 'green', blurb: 'The first words and phrases' },
  A2: { name: 'Elementary', color: 'cyan', blurb: 'Everyday situations and the past' },
  B1: { name: 'Intermediate', color: 'yellow', blurb: 'Opinions, work and problems' },
  B2: { name: 'Upper-Intermediate', color: 'magenta', blurb: 'Abstract ideas and argument' },
  C1: { name: 'Advanced', color: 'red', blurb: 'Nuance, style and idioms' },
}

/**
 * Everything that is specific to one language. The engine and the UI know nothing else about it,
 * so adding a language means adding one file in `hooks/courses/` and listing it in `courses/index.ts`.
 */
export type Course = {
  /** Short stable id, used in saved progress: 'de', 'fr'. */
  code: string
  /** Shown to the learner: 'German'. */
  name: string
  flag: string
  /** System voices for `$.audio.speak`, best first: macOS `say` and Windows voice names. The platform default is the last resort. */
  voices: string[]
  /** How the voice is named in the "no audio" note. */
  voiceHint: string
  /** Gendered articles, if the language has them: the options of the article puzzle and how to spot a noun. */
  article?: {
    options: string[]
    /** Matches a vocabulary entry that is exactly "article + one word"; capture group 1 is the article. */
    noun: RegExp
    /** Removes the leading article. */
    strip: RegExp
  }
  /** True when nouns are capitalised (German), so capitalisation says something about a word's kind. */
  capitalNouns: boolean
  /** Short cheers in the language, shown when an answer is right and wrong. */
  praise: string[]
  oops: string
  /** One-liners for the map, in the language. `{title}` is replaced by the next lesson's title. */
  coach: { welcome: string; goal: string; next: string; done: string }
  /** CEFR level -> four units of four lessons each. */
  levels: Record<Level, Unit[]>
}

export const lesson = (title: string, words: Pair[], s0: Pair, s1: Pair): Lesson => ({ title, words, sentences: [s0, s1] })
