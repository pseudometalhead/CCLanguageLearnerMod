// Prints the table of lessons for every course: `npx tsx scripts/lessons-md.ts > LESSONS.md`
import { LEVELS, LEVEL_INFO } from '../hooks/course'
import { COURSES } from '../hooks/courses'

let out = '# Table of lessons\n'
for (const c of Object.values(COURSES)) {
  out += `\n# ${c.flag} ${c.name}\n\n| Level | Unit | Lesson 1 | Lesson 2 | Lesson 3 | Lesson 4 | 5 |\n|---|---|---|---|---|---|---|\n`
  for (const lv of LEVELS) {
    c.levels[lv].forEach((u, i) => {
      out += `| ${lv} | ${i + 1}. ${u.emoji} ${u.title} (${u.sub}) | ${u.lessons.map(l => l.title).join(' | ')} | 🏆 Review |\n`
    })
  }
  out += `\n## Full contents\n`
  for (const lv of LEVELS) {
    out += `\n### ${lv} · ${LEVEL_INFO[lv].name}\n`
    c.levels[lv].forEach((u, i) => {
      out += `\n#### Unit ${i + 1} · ${u.title} (${u.sub})\n_${u.tip}_\n\n| # | Lesson | Words |\n|---|---|---|\n`
      u.lessons.forEach((l, j) => (out += `| ${i * 5 + j + 1} | ${l.title} | ${l.words.map(w => `${w[0]} = ${w[1]}`).join('; ')} |\n`))
      out += `| ${i * 5 + 5} | 🏆 Unit review | all the words and sentences of the unit |\n`
    })
  }
}
console.log(out)
