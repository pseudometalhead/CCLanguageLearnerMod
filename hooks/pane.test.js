import { expect, mock, test } from 'claude-code/testing';
import { buildLesson } from './engine';
const NOW = 1_700_000_000_000;
const SEED = NOW % 1_000_003;
const PANE = {
    plugin: 'language-learner',
    component: 'Pane',
    requestId: 'language-learner',
    props: { title: 'LinguaCC', isFocused: true, bodyColumns: 60, placement: 'dock', scroll: { offset: 0, bodyRows: 30 }, view: {} },
};
const solve = async (ui, x) => {
    if (x.kind === 'choice')
        await ui.press({ key: `opt-${x.answer}` });
    else if (x.kind === 'match') {
        for (const t of x.left) {
            await ui.press({ key: `l-${t}` });
            await ui.press({ key: `r-${x.pairs[t]}` });
        }
    }
    else {
        const want = x.kind === 'spell' ? [...x.answer] : x.answer.split(' ');
        const taken = new Set();
        for (const w of want) {
            const k = x.bank.findIndex((b, i) => b === w && !taken.has(i));
            taken.add(k);
            await ui.press({ key: `b-${k}` });
        }
        await ui.press({ key: 'check' });
    }
};
test('a perfect lesson earns XP and stars, and marks the lesson done', async ($, on) => {
    mock.clock(on, { now: NOW });
    mock.store(on);
    for (const surface of ['terminal', 'desktop']) {
        const ui = await $.ui.mount({ ...PANE, surface });
        expect(await ui.find({ text: /A1 · Beginner/ })).toBeDefined();
        expect(await ui.find({ text: /🔒 B1/ })).toBeDefined();
        await ui.press({ key: 'les-A1-0' });
        for (const x of buildLesson('German', 'A1', 0, SEED)) {
            await solve(ui, x);
            expect(await ui.find({ text: /Correct|Matched/ })).toBeDefined();
            await ui.press({ key: 'continue' });
        }
        expect(await ui.find({ text: /LESSON COMPLETE/ })).toBeDefined();
        expect(await ui.find({ text: /⭐⭐⭐/ })).toBeDefined();
        expect(await ui.find({ text: /7\/7 first try/ })).toBeDefined();
        await ui.press({ key: 'map' });
        expect(await ui.find({ text: /✅ Greetings/ })).toBeDefined();
        await ui.unmount();
    }
});
test('five wrong answers lose all hearts and fail the lesson', async ($, on) => {
    mock.clock(on, { now: NOW });
    mock.store(on);
    const ui = await $.ui.mount({ ...PANE, surface: 'terminal' });
    await ui.press({ key: 'les-A1-1' });
    const ex = buildLesson('German', 'A1', 1, SEED).filter(x => x.kind === 'choice' || x.kind === 'build' || x.kind === 'spell');
    expect(ex.length).toBeGreaterThanOrEqual(5);
    // exercise order is fixed: choice, match(skipped by mistakes below), spell, cloze, choice, build, spell
    const all = buildLesson('German', 'A1', 1, SEED);
    let lost = 0;
    for (const x of all) {
        if (lost === 5)
            break;
        if (x.kind === 'choice')
            await ui.press({ key: `opt-${x.options.find(o => o !== x.answer)}` });
        else if (x.kind === 'match') {
            for (let n = 0; n < 5 && lost < 5; n++, lost++) {
                await ui.press({ key: `l-${x.left[0]}` });
                await ui.press({ key: `r-${x.right.find(r => r !== x.pairs[x.left[0]])}` });
            }
            if (lost === 5)
                break;
            continue;
        }
        else {
            for (let k = 0; k < x.bank.length; k++)
                await ui.press({ key: `b-${k}` });
            await ui.press({ key: 'check' });
        }
        lost++;
        if (lost < 5)
            await ui.press({ key: 'continue' });
    }
    expect(await ui.find({ text: /Out of hearts|Answer:/ })).toBeDefined();
    await ui.press({ key: 'continue' });
    expect(await ui.find({ text: /OUT OF HEARTS/ })).toBeDefined();
    await ui.press({ key: 'retry' });
    expect(await ui.find({ text: /CHOOSE|FILL/ })).toBeDefined();
    await ui.unmount();
});
