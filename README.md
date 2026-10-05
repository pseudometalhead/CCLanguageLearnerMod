# LinguaCC — German learning mod for Claude Code

A Duolingo-style language learning pane. Type `/learn` to open it.

- **German**, a full course that runs **CEFR A1 → C1** (greetings and food up to nuance and idioms)
- **Five puzzle types:** multiple choice, fill the gap, match the pairs, spell the word, build the sentence
- **Level map** with locked levels, ✅ lessons, progress bars, ⭐ ratings (1–3 stars by hearts left)
- XP, 5 hearts per lesson, daily streaks; progress is saved across sessions

## Run it

    claude --plugin-dir /path/to/this/repo

## Test it

    claude plugin validate .
    claude plugin test .

## Audio

German is spoken with the system speech synthesizer (`$.audio.speak`, voice **Anna**), so real playback needs **macOS** with the German "Anna" voice installed (System Settings → Accessibility → Spoken Content → System Voice → Manage Voices). Elsewhere the mod shows the German text instead of failing.

- 🎧 **Listening puzzles** autoplay a German word or sentence; pick its meaning. Two per lesson.
- 🔊 **Play** on "What does X mean?" puzzles; 🔁 press again to repeat.
- After you answer, the correct German word or sentence is read aloud.
- The 🔊/🔇 toggle in the header mutes everything, and is remembered.
