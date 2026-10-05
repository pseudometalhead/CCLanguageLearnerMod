import { atom, read, update } from 'claude-code';
import { bar, buildLesson, heartsRow } from './engine';
import { COURSES, LEVELS, LEVEL_INFO } from './lessons';
const PANE = 'language-learner';
const STORE = 'app-v2';
const MAX_HEARTS = 5;
const DAY = 86_400_000;
const fresh = {
    picked: null,
    used: [],
    sel: null,
    matched: [],
    status: 'idle',
    slip: false,
    note: '',
};
const initial = {
    screen: 'home',
    lang: 'German',
    level: 'A1',
    lesson: 0,
    ex: [],
    i: 0,
    ...fresh,
    hearts: MAX_HEARTS,
    sound: true,
    xp: 0,
    streak: 0,
    lastDay: 0,
    correct: 0,
    gained: 0,
    done: {},
};
const app = atom({ plugin: 'language-learner', key: 'app' }, initial);
const doneIn = (a, level) => (a.done[`${a.lang}:${level}`] ?? []).length;
const isUnlocked = (a, level) => {
    const k = LEVELS.indexOf(level);
    return k <= 0 || doneIn(a, LEVELS[k - 1]) >= COURSES[a.lang][LEVELS[k - 1]].length;
};
export const register = on => {
    on('session.start', async ($, e, next) => {
        await $.command.register({ name: 'learn', description: 'Open the German learning pane (A1 to C1)' });
        const saved = (await $.store.get(STORE));
        if (saved) {
            const today = Math.floor((await $.clock.now()) / DAY);
            const streak = (saved.lastDay ?? 0) >= today - 1 ? (saved.streak ?? 0) : 0;
            await update($, app, () => ({
                ...initial,
                lang: saved.lang && COURSES[saved.lang] ? saved.lang : initial.lang,
                xp: saved.xp ?? 0,
                sound: saved.sound ?? true,
                lastDay: saved.lastDay ?? 0,
                done: saved.done ?? {},
                streak,
            }));
        }
        return next(e);
    });
    on('command.run', { command: 'learn' }, async ($) => {
        await $.ui.open({ id: PANE, title: 'LinguaCC' });
        return { text: 'LinguaCC opened. Pick a level.' };
    });
    on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
        const { Box, Text, Button } = $.ui.resolve(e);
        const s = await read($, app);
        const info = LEVEL_INFO[s.level];
        const x = s.ex[s.i];
        // ---- audio ------------------------------------------------------------
        const say = async (text) => {
            try {
                await $.audio.speak(text, { voice: 'Anna' });
            }
            catch {
                await update($, app, a => ({ ...a, note: `🔇 No audio here (needs macOS + German voice "Anna"). It says: “${text}”` }));
            }
        };
        // Speaks what the exercise now showing asks to hear when it opens.
        const opened = async () => {
            const a = await read($, app);
            const q = a.ex[a.i];
            if (a.sound && q && q.kind === 'choice' && q.auto && q.say)
                await say(q.say);
        };
        // Runs an answer; once it settles the exercise, speaks the German text it carries.
        const answered = async (run) => {
            const before = await read($, app);
            await run();
            const a = await read($, app);
            const q = a.ex[a.i];
            if (before.status === 'idle' && a.status !== 'idle' && a.sound && q && q.kind !== 'match' && q.after)
                await say(q.after);
        };
        // ---- actions ----------------------------------------------------------
        const start = async (level, idx) => {
            const seed = (await $.clock.now()) % 1_000_003;
            await update($, app, a => ({
                ...a,
                ...fresh,
                screen: 'play',
                level,
                lesson: idx,
                i: 0,
                correct: 0,
                gained: 0,
                hearts: MAX_HEARTS,
                ex: buildLesson(a.lang, level, idx, seed),
            }));
            await opened();
        };
        const right = (a) => ({
            ...a,
            status: 'right',
            correct: a.correct + (a.slip ? 0 : 1),
            xp: a.xp + (a.slip ? 0 : 2),
            gained: a.gained + (a.slip ? 0 : 2),
        });
        const wrong = (a) => ({ ...a, status: 'wrong', hearts: a.hearts - 1 });
        const pick = (opt) => answered(() => update($, app, a => {
            const q = a.ex[a.i];
            if (a.status !== 'idle' || q.kind !== 'choice')
                return a;
            return { ...(opt === q.answer ? right(a) : wrong(a)), picked: opt };
        }));
        const tapLeft = (t) => update($, app, a => (a.status === 'idle' && !a.matched.includes(t) ? { ...a, sel: t, note: '' } : a));
        const tapRight = (r) => answered(() => update($, app, a => {
            const q = a.ex[a.i];
            if (a.status !== 'idle' || q.kind !== 'match')
                return a;
            if (a.sel === null)
                return { ...a, note: 'Pick a word on the left first' };
            if (q.pairs[a.sel] === r) {
                const matched = [...a.matched, a.sel];
                const next = { ...a, matched, sel: null, note: '' };
                return matched.length === q.left.length ? right(next) : next;
            }
            const hit = { ...a, sel: null, slip: true, note: 'Not a match, try again', hearts: a.hearts - 1 };
            return hit.hearts <= 0 ? { ...hit, status: 'wrong' } : hit;
        }));
        const tapBank = (idx) => update($, app, a => (a.status === 'idle' && !a.used.includes(idx) ? { ...a, used: [...a.used, idx] } : a));
        const undo = () => update($, app, a => (a.status === 'idle' ? { ...a, used: a.used.slice(0, -1) } : a));
        const check = () => answered(() => update($, app, a => {
            const q = a.ex[a.i];
            if (a.status !== 'idle' || (q.kind !== 'spell' && q.kind !== 'build'))
                return a;
            const got = a.used.map(k => q.bank[k]).join(q.kind === 'spell' ? '' : ' ');
            return got === q.answer ? right(a) : wrong(a);
        }));
        const cont = async () => {
            const cur = await read($, app);
            if (cur.status === 'idle')
                return;
            if (cur.hearts > 0 && cur.i + 1 < cur.ex.length) {
                await update($, app, a => ({ ...a, ...fresh, i: a.i + 1 }));
                await opened();
                return;
            }
            const today = Math.floor((await $.clock.now()) / DAY);
            await update($, app, a => {
                const passed = a.hearts > 0;
                const key = `${a.lang}:${a.level}`;
                const prior = a.done[key] ?? [];
                const bonus = passed ? 10 + (a.hearts === MAX_HEARTS ? 5 : 0) : 0;
                const streak = passed && a.lastDay !== today ? (a.lastDay === today - 1 ? a.streak + 1 : 1) : a.streak;
                return {
                    ...a,
                    screen: 'result',
                    xp: a.xp + bonus,
                    gained: a.gained + bonus,
                    streak,
                    lastDay: passed ? today : a.lastDay,
                    done: passed && !prior.includes(a.lesson) ? { ...a.done, [key]: [...prior, a.lesson] } : a.done,
                };
            });
            const after = await read($, app);
            await $.store.set(STORE, { lang: after.lang, sound: after.sound, xp: after.xp, streak: after.streak, lastDay: after.lastDay, done: after.done });
            if (after.hearts > 0 && doneIn(after, after.level) >= COURSES[after.lang][after.level].length) {
                $.ui.toast(`🎉 ${after.level} ${LEVEL_INFO[after.level].name} complete!`);
            }
        };
        // ---- pieces -----------------------------------------------------------
        const header = (<Box borderStyle="round" borderColor="cyan" paddingX={1} flexDirection="column">
        <Text bold color="cyan">🌍 LinguaCC <Text dimColor>· {s.lang}</Text></Text>
        <Box>
          <Text>🔥 {s.streak}   ⭐ {s.xp} XP{s.screen === 'play' ? `   ${heartsRow(s.hearts, MAX_HEARTS)}` : ''}   </Text>
          <Button key="sound" label={s.sound ? '🔊 on' : '🔇 off'} onPress={() => update($, app, a => ({ ...a, sound: !a.sound }))}/>
        </Box>
      </Box>);
        // ---- home: the level map ---------------------------------------------
        if (s.screen === 'home') {
            return (<Box flexDirection="column">
          {header}
          {Object.keys(COURSES).length > 1 && <Box>
            {Object.keys(COURSES).map(l => (<Button key={`lang-${l}`} label={l === s.lang ? `● ${l} ` : `○ ${l} `} onPress={() => update($, app, a => ({ ...a, lang: l }))}/>))}
          </Box>}
          {LEVELS.map(lv => {
                    const lessons = COURSES[s.lang][lv];
                    const open = isUnlocked(s, lv);
                    const n = doneIn(s, lv);
                    const color = open ? LEVEL_INFO[lv].color : 'gray';
                    return (<Box key={`lv-${lv}`} borderStyle="round" borderColor={color} paddingX={1} flexDirection="column">
                <Text bold color={color}>
                  {open ? '' : '🔒 '}{lv} · {LEVEL_INFO[lv].name}  {bar(n, lessons.length, 8)} {n}/{lessons.length}
                </Text>
                {open ? (lessons.map((l, idx) => (<Button key={`les-${lv}-${idx}`} label={`${(s.done[`${s.lang}:${lv}`] ?? []).includes(idx) ? '✅' : '▶️'} ${l.title}`} onPress={() => start(lv, idx)}/>))) : (<Text dimColor>Finish the level above to unlock</Text>)}
              </Box>);
                })}
        </Box>);
        }
        // ---- result -----------------------------------------------------------
        if (s.screen === 'result') {
            const passed = s.hearts > 0;
            const stars = !passed ? 0 : s.hearts >= 5 ? 3 : s.hearts >= 3 ? 2 : 1;
            const total = COURSES[s.lang][s.level].length;
            const nextLesson = s.lesson + 1 < total ? [s.level, s.lesson + 1] : null;
            const nextLevel = LEVELS[LEVELS.indexOf(s.level) + 1];
            const go = passed ? nextLesson ?? (nextLevel && isUnlocked(s, nextLevel) ? [nextLevel, 0] : null) : null;
            return (<Box flexDirection="column">
          {header}
          <Box borderStyle="double" borderColor={passed ? 'green' : 'red'} paddingX={1} flexDirection="column">
            <Text bold color={passed ? 'green' : 'red'}>{passed ? '🏆 LESSON COMPLETE' : '💔 OUT OF HEARTS'}</Text>
            <Text>{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</Text>
            <Text>{s.correct}/{s.ex.length} first try · +{s.gained} XP</Text>
          </Box>
          {go && <Button key="next" label="Next lesson ▶" onPress={() => start(go[0], go[1])}/>}
          <Button key="retry" label="↻ Try again" onPress={() => start(s.level, s.lesson)}/>
          <Button key="map" label="🗺 Back to map" onPress={() => update($, app, a => ({ ...a, screen: 'home' }))}/>
        </Box>);
        }
        // ---- play -------------------------------------------------------------
        const badge = x.kind === 'choice' ? (x.auto ? '🎧 LISTEN' : x.context ? '✏️  FILL THE GAP' : '🎯 CHOOSE') : x.kind === 'match' ? '🧩 MATCH THE PAIRS' : x.kind === 'spell' ? '🔤 SPELL IT' : '🏗️  BUILD THE SENTENCE';
        const lesson = COURSES[s.lang][s.level][s.lesson];
        let body;
        if (x.kind === 'choice') {
            body = (<Box flexDirection="column">
          <Text bold>{x.prompt}</Text>
          {x.context && <Text color="yellow">{x.context}</Text>}
          {x.say && <Button key="play" label="🔊 Play" onPress={() => say(x.say)}/>}
          {x.options.map(o => {
                    const mark = s.picked === null ? '○' : o === x.answer ? '✅' : o === s.picked ? '❌' : '○';
                    return <Button key={`opt-${o}`} label={`${mark} ${o}`} onPress={() => pick(o)}/>;
                })}
        </Box>);
        }
        else if (x.kind === 'match') {
            const doneRight = s.matched.map(t => x.pairs[t]);
            body = (<Box flexDirection="column">
          <Text dimColor>Tap a word, then its meaning.</Text>
          <Box>
            <Box flexDirection="column" marginRight={2}>
              {x.left.map(t => (<Button key={`l-${t}`} label={s.matched.includes(t) ? `✅ ${t}` : s.sel === t ? `👉 ${t}` : `○ ${t}`} onPress={() => tapLeft(t)}/>))}
            </Box>
            <Box flexDirection="column">
              {x.right.map(r => (<Button key={`r-${r}`} label={doneRight.includes(r) ? `✅ ${r}` : `○ ${r}`} onPress={() => tapRight(r)}/>))}
            </Box>
          </Box>
          {s.note && <Text color="red">{s.note}</Text>}
        </Box>);
        }
        else {
            const sep = x.kind === 'spell' ? ' ' : ' ';
            const built = s.used.map(k => x.bank[k]);
            body = (<Box flexDirection="column">
          <Text bold>{x.prompt}</Text>
          <Box borderStyle="round" borderColor={s.status === 'right' ? 'green' : s.status === 'wrong' ? 'red' : 'gray'} paddingX={1}>
            <Text>{built.length ? built.join(sep) : x.kind === 'spell' ? '_ _ _' : '…'}</Text>
          </Box>
          <Box flexWrap="wrap">
            {x.bank.map((w, k) => (s.used.includes(k) ? null : <Button key={`b-${k}`} label={`[${w}] `} onPress={() => tapBank(k)}/>))}
          </Box>
          {s.status === 'idle' && (<Box>
              <Button key="undo" label="↩ Undo  " onPress={undo}/>
              {s.used.length === x.bank.length && <Button key="check" label="✔ Check" onPress={check}/>}
            </Box>)}
        </Box>);
        }
        const answerText = x.kind === 'choice' || x.kind === 'spell' || x.kind === 'build' ? x.answer : '';
        const isLast = s.i + 1 >= s.ex.length || s.hearts <= 0;
        return (<Box flexDirection="column">
        {header}
        <Text color={info.color}>
          {s.level} · {lesson.title}  {bar(s.i + (s.status === 'right' ? 1 : 0), s.ex.length, 14)}
        </Text>
        <Text bold color="magenta">{badge}</Text>
        {body}
        {s.note && x.kind !== 'match' && <Text color="red">{s.note}</Text>}
        {s.status !== 'idle' && (<Box borderStyle="round" borderColor={s.status === 'right' ? 'green' : 'red'} paddingX={1} flexDirection="column">
            <Text bold color={s.status === 'right' ? 'green' : 'red'}>
              {s.status === 'right' ? (s.slip ? '✅ Matched!' : '✅ Correct! +2 XP') : x.kind === 'match' ? '❌ Out of hearts' : `❌ Answer: ${answerText}`}
            </Text>
          </Box>)}
        {s.status !== 'idle' && <Button key="continue" label={isLast ? 'Finish ▶' : 'Continue ▶'} onPress={cont}/>}
      </Box>);
    });
};
