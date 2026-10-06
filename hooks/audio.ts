/**
 * Recorded clips for places where the platform has no speech synthesizer (Windows). A clip is a file in
 * `audio/<course code>/` named after a hash of the words it says; `scripts/make-audio.ts` makes them.
 */

/** The text as spoken: case and punctuation do not change the recording, so "Hallo, Anna!" and "hallo Anna" share a clip. */
export const spoken = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()

/** Two 32-bit FNV-1a hashes (different seeds) of the spoken text, as 16 hex digits. */
export const clipKey = (text: string): string => {
  const s = spoken(text)
  let a = 0x811c9dc5
  let b = 0x01000193 ^ 0x9747b28c
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i)
    a = Math.imul(a ^ c, 0x01000193) >>> 0
    b = Math.imul(b ^ c, 0x85ebca6b) >>> 0
  }
  return a.toString(16).padStart(8, '0') + b.toString(16).padStart(8, '0')
}

/** The plugin-relative path of the clip for `text` in course `code`. */
export const clipAsset = (code: string, text: string) => `audio/${code}/${clipKey(text)}.mp3`
