/**
 * Makes natural-sounding clips with Azure Speech neural voices (https://learn.microsoft.com/azure/ai-services/speech-service/).
 * One mp3 per distinct spoken text of every course, with the same file names as scripts/make-audio.ts, so the clips can replace
 * the espeak ones without touching the app.
 *
 *   npx tsx scripts/make-audio-azure.ts --dry [code]            count clips and characters, no network, no key needed
 *   npx tsx scripts/make-audio-azure.ts --limit 20 [code]       make the first 20 missing clips into audio-azure/<code>/ to listen to
 *   npx tsx scripts/make-audio-azure.ts [code]                  make every clip into audio-azure/<code>/
 *   npx tsx scripts/make-audio-azure.ts --out audio [code]      write straight into audio/<code>/ (overwrites nothing that exists;
 *                                                               delete audio/<code>/ first to replace a course)
 *
 * Needs an Azure Speech resource (the free F0 tier is enough: these clips are well under its monthly allowance). Put the key and
 * the region in the environment, never in the repo:
 *   $env:AZURE_SPEECH_KEY = '...'       $env:AZURE_SPEECH_REGION = 'westeurope'
 * Existing clips are kept, so an interrupted run can be repeated. Needs Node 18+ (global fetch).
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { COURSES } from '../hooks/courses'
import { LEVELS } from '../hooks/course'
import { clipAsset, spoken } from '../hooks/audio'
import { plain } from '../hooks/engine'

/** Neural voice per course code. One voice per language: do not switch voices part way through a course. */
const VOICE: Record<string, { name: string; lang: string }> = {
  de: { name: 'de-DE-KatjaNeural', lang: 'de-DE' },
  fr: { name: 'fr-FR-DeniseNeural', lang: 'fr-FR' },
}
/** A little slower than natural speech, for learners. */
const RATE = '-10%'
const FORMAT = 'audio-24khz-48kbitrate-mono-mp3'

const args = process.argv.slice(2)
const dry = args.includes('--dry')
const flag = (name: string) => {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : undefined
}
const limit = Number(flag('--limit') ?? Infinity)
const outRoot = flag('--out') ?? 'audio-azure'
const only = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--out' && args[i - 1] !== '--limit')

const key = process.env.AZURE_SPEECH_KEY
const region = process.env.AZURE_SPEECH_REGION
if (!dry && (!key || !region)) {
  console.error('Set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION first (see the header of this file), or use --dry.')
  process.exit(1)
}

const escapeXml = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

async function synth(text: string, voice: { name: string; lang: string }): Promise<Buffer> {
  const ssml = `<speak version="1.0" xml:lang="${voice.lang}"><voice name="${voice.name}"><prosody rate="${RATE}">${escapeXml(text)}</prosody></voice></speak>`
  for (let attempt = 1; attempt <= 5; attempt++) {
    const res = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': key as string,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': FORMAT,
        'User-Agent': 'babel-learning-clips',
      },
      body: ssml,
    })
    if (res.ok) return Buffer.from(await res.arrayBuffer())
    // Too many requests or a hiccup on their side: wait and try again. Anything else (a bad key, a wrong region) stops the run.
    if (res.status === 429 || res.status >= 500) {
      await sleep(1000 * attempt)
      continue
    }
    throw new Error(`Azure Speech answered ${res.status} ${res.statusText} for "${text}". Check the key and the region.`)
  }
  throw new Error(`Azure Speech kept failing for "${text}".`)
}

let chars = 0
let wanted = 0
let made = 0
let kept = 0
for (const course of Object.values(COURSES)) {
  if (only && course.code !== only) continue
  const voice = VOICE[course.code]
  if (!voice) {
    console.log(`${course.code}: no voice listed in VOICE, skipped`)
    continue
  }
  const texts = new Map<string, string>() // spoken -> text to say
  for (const lv of LEVELS)
    for (const u of course.levels[lv])
      for (const l of u.lessons) {
        for (const [t] of l.words) texts.set(spoken(t), plain(t))
        for (const [t] of l.sentences) texts.set(spoken(t), plain(t))
      }
  const dir = `${outRoot}/${course.code}`
  if (!dry) mkdirSync(dir, { recursive: true })
  for (const text of texts.values()) {
    wanted++
    const file = `${outRoot}/${clipAsset(course.code, text).replace(/^audio\//, '')}`
    if (existsSync(file)) {
      kept++
      continue
    }
    chars += text.length
    if (dry) continue
    if (made >= limit) continue
    writeFileSync(file, await synth(text, voice))
    made++
    if (made % 25 === 0) console.log(`${course.code}: ${made} clips so far`)
    await sleep(120) // stay well under the free tier's request rate
  }
  if (!dry) writeFileSync(`${dir}/README.txt`, `Generated by scripts/make-audio-azure.ts with Azure Speech (${voice.name}, rate ${RATE}). ${texts.size} clips.\n`)
}
if (dry) {
  console.log(`${wanted} clips wanted, ${kept} already made, about ${chars} characters still to synthesise (the free tier allows 500000 a month)`)
} else {
  console.log(`made ${made}, kept ${kept}, into ${outRoot}/`)
}
