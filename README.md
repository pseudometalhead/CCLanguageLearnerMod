# Babel Learning — a Duolingo-style language course for Claude Code

Type `/babel-learning` in Claude Code (`/learn` also works). **German, A1 → C1**, 20 lessons per level (100 in all).

## The map
- Five levels (A1 Beginner … C1 Advanced), each with **4 units × 5 nodes**: four lessons and a 🏆 unit review.
- A winding path of nodes: ▶️ start, 🔒 locked, ⭐ done (1 to 3 stars by hearts left), 👑 reviewed unit.
- Know a level already? Take the **placement quiz** (12 questions on the level below, two mistakes allowed) to unlock it.
- **💪 Practice:** a 10-puzzle mix drawn from the lessons you have finished (flat 5 XP, no stars).
- **📖 Words:** the words of your finished lessons, unit by unit, with 🔊 on each.
- Streak 🔥, XP ⭐ and a daily goal 🎯 of 30 XP.

## A lesson
1. **Intro:** the five new words with 🔊, plus a 💡 grammar tip for the unit.
2. **11 to 14 puzzles**, ramping up as the unit goes on:
   select the meaning · how do you say it · tap the pairs · listen and choose · article (der/die/das) ·
   spell it / spell what you hear · fill the gap · translate (pick) · translate (word bank, with decoys) ·
   type what you hear · translate into English.
3. 5 hearts, combo bonus XP for streaks of correct answers, and the feedback banner cheers you on in German (Super! Prima! Genau!).
4. Reordering a sentence's words costs no heart, because word order is often free; you just see the model answer.

## Level check
New here? The map offers a **🎯 Level check** (hotkey **l**; it stays on the map for later). It asks 20 questions in five
stages, four per level from A1 up. Get 3 of 4 right to move to the next level; it stops when a level is too hard.
No hearts, no stars. You land on the level after the last one you cleared, with every level up to it opened (the ones
below stay open to browse). It can't be wrong for long: lessons and the per-level placement quiz still work as before.

## Keyboard
The pane opens focused. If the keys do nothing (you pressed Escape, or clicked back into the prompt), click the pane or press
**ctrl+x** then **tab** to give it the keyboard again. With the pane focused: **1–4** pick an option, **1–9** tap a word chip, **1–5** and **q–t** match pairs, **c** check / continue,
**Enter** acts on the highlighted button (Start, Check, Continue, Next); Tab or the arrows move the highlight. **u** undo, **p** play the audio, **s** start, **x** practice, **w** words, **l** level check, **n** next lesson, **r** try again, **m** back to the map.

## Audio
No sound? The map has a **🔧 Audio test** button (hotkey **a**): it tries speech and a short beep and shows the exact error. Claude Code's own docs only promise speech on macOS (`say`) and clip playback via `afplay`, so on Windows the app may have no speech at all.

German is spoken with the system speech synthesizer. The mod tries a German voice by name (macOS **Anna**; Windows
**Microsoft Hedda** / **Katja** / **Stefan**), then falls back to your system's default voice, which may speak German with
the wrong accent. Install a German voice for the best result (macOS: System Settings → Accessibility → Spoken Content →
System Voice → Manage Voices; Windows: Settings → Time & language → Speech → Add voices, and add German).
If no voice works at all, the mod shows the German text instead.
The 🔊/🔇 toggle mutes everything.

## Install (plug and play)

In Claude Code:

    /plugin marketplace add pseudometalhead/CCLanguageLearnerMod
    /plugin install language-learner@babel-learning

or from a terminal:

    claude plugin marketplace add pseudometalhead/CCLanguageLearnerMod
    claude plugin install language-learner@babel-learning

Then type `/babel-learning` (or `/learn`). Update later with `claude plugin marketplace update babel-learning`.

## Adding a language

The engine and the UI know nothing about German. Everything language-specific lives in one file per course:

1. Copy `hooks/courses/de.ts` to `hooks/courses/fr.ts` and fill in the `Course`: `code`, `name`, `flag`, the system `voices`
   for audio (macOS and Windows names, best first), the `article` rules (leave `article` out if the language has no gendered articles), `praise`, `coach`
   lines, and the 5 levels x 4 units x 4 lessons.
2. Register it in `hooks/courses/index.ts`.
3. `claude plugin test .` runs every content test against the new course automatically: no duplicate words,
   every gap sentence valid, every puzzle solvable, no leftover German wording.

Learners then get a language switcher on the map. Stars and unlocks are kept per course; XP, streak and the daily
goal are shared. `npx tsx scripts/lessons-md.ts > LESSONS.md` regenerates the table of lessons.

## Run from a checkout and test
    claude --plugin-dir /path/to/this/repo
    claude plugin validate .
    claude plugin test .
