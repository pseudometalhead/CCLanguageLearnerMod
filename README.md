# LinguaCC — a Duolingo-style German course for Claude Code

Type `/learn` in Claude Code. **German, A1 → C1**, 20 lessons per level (100 in all).

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
3. 5 hearts, combo bonus XP for streaks of correct answers, and the owl 🦉 cheers you on in German.
4. Reordering a sentence's words costs no heart, because word order is often free; you just see the model answer.

## Keyboard
With the pane focused: **1–4** pick an option, **1–9** tap a word chip, **1–5** and **q–t** match pairs, **c** check / continue,
**u** undo, **p** play the audio, **s** start, **x** practice, **w** words, **n** next lesson, **r** try again, **m** back to the map.

## Audio
German is spoken with the system speech synthesizer (voice **Anna**), so real playback needs **macOS** with that voice
(System Settings → Accessibility → Spoken Content → System Voice → Manage Voices). Elsewhere the mod shows the German text instead.
The 🔊/🔇 toggle mutes everything.

## Install (plug and play)

In Claude Code:

    /plugin marketplace add pseudometalhead/CCLanguageLearnerMod
    /plugin install language-learner@linguacc

or from a terminal:

    claude plugin marketplace add pseudometalhead/CCLanguageLearnerMod
    claude plugin install language-learner@linguacc

Then type `/learn`. Update later with `claude plugin marketplace update linguacc`.

## Run from a checkout and test
    claude --plugin-dir /path/to/this/repo
    claude plugin validate .
    claude plugin test .
