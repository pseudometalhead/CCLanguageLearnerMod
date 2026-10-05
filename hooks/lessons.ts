export type Pair = [target: string, english: string]
// Sentences mark the word to blank out in a cloze puzzle with [brackets].
export type Lesson = { title: string; words: Pair[]; sentences: [Pair, Pair] }
export type Course = Record<string, Lesson[]>

export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'] as const

export const LEVEL_INFO: Record<string, { name: string; color: string }> = {
  A1: { name: 'Beginner', color: 'green' },
  A2: { name: 'Elementary', color: 'cyan' },
  B1: { name: 'Intermediate', color: 'yellow' },
  B2: { name: 'Upper-Intermediate', color: 'magenta' },
  C1: { name: 'Advanced', color: 'red' },
}

export const COURSES: Record<string, Course> = {
  German: {
    A1: [
      { title: 'Greetings', words: [['hallo', 'hello'], ['tschüss', 'goodbye'], ['danke', 'thank you'], ['bitte', 'please'], ['guten Morgen', 'good morning']], sentences: [['[Hallo], ich heiße Anna.', 'Hello, my name is Anna.'], ['Guten Morgen, wie geht es dir?', 'Good morning, how are you?']] },
      { title: 'Food', words: [['Wasser', 'water'], ['Brot', 'bread'], ['Apfel', 'apple'], ['Milch', 'milk'], ['Käse', 'cheese']], sentences: [['Ich möchte ein Glas [Wasser].', 'I would like a glass of water.'], ['Ich mag Brot mit Käse.', 'I like bread with cheese.']] },
    ],
    A2: [
      { title: 'Daily life', words: [['arbeiten', 'to work'], ['kaufen', 'to buy'], ['Haus', 'house'], ['gestern', 'yesterday'], ['morgen', 'tomorrow']], sentences: [['Morgen muss ich zu Hause [arbeiten].', 'Tomorrow I have to work at home.'], ['Gestern habe ich Brot auf dem Markt gekauft.', 'Yesterday I bought bread at the market.']] },
      { title: 'Travel', words: [['Flughafen', 'airport'], ['Fahrkarte', 'ticket'], ['Koffer', 'suitcase'], ['Bahnhof', 'station'], ['Strand', 'beach']], sentences: [['Der [Flughafen] ist weit weg.', 'The airport is far away.'], ['Wo kann ich eine Fahrkarte kaufen?', 'Where can I buy a ticket?']] },
    ],
    B1: [
      { title: 'Opinions', words: [['trotzdem', 'nevertheless'], ['obwohl', 'although'], ['deshalb', "that's why"], ['einverstanden sein', 'to agree'], ['wahrscheinlich', 'probably']], sentences: [['[Obwohl] es regnet, gehen wir spazieren.', 'Although it is raining, we are going for a walk.'], ['Ich bin müde, trotzdem arbeite ich weiter.', 'I am tired, nevertheless I keep working.']] },
      { title: 'Work', words: [['Firma', 'company'], ['Besprechung', 'meeting'], ['Gehalt', 'salary'], ['Vorstellungsgespräch', 'interview'], ['Beförderung', 'promotion']], sentences: [['Ich habe um zehn Uhr eine [Besprechung].', 'I have a meeting at ten o\'clock.'], ['Ich hoffe auf eine Beförderung in diesem Jahr.', 'I hope for a promotion this year.']] },
    ],
    B2: [
      { title: 'Society', words: [['Entwicklung', 'development'], ['Bürger', 'citizen'], ['Ungleichheit', 'inequality'], ['Umwelt', 'environment'], ['Recht', 'right']], sentences: [['Die [Ungleichheit] wächst in vielen Ländern.', 'Inequality is growing in many countries.'], ['Alle Bürger haben die gleichen Rechte.', 'All citizens have the same rights.']] },
      { title: 'Abstract ideas', words: [['trotz', 'despite'], ['bezüglich', 'regarding'], ['gelingen', 'to succeed'], ['fördern', 'to promote'], ['berücksichtigen', 'to take into account']], sentences: [['Wir müssen das Recycling [fördern].', 'We must promote recycling.'], ['Trotz der Schwierigkeiten gelang ihm der Abschluss des Projekts.', 'Despite the difficulties he succeeded in completing the project.']] },
    ],
    C1: [
      { title: 'Nuance', words: [['Nuance', 'nuance'], ['unerlässlich', 'essential'], ['hervorzuheben ist', 'it is worth emphasizing'], ['allmählich', 'gradually'], ['Annahme', 'assumption']], sentences: [['Es ist [unerlässlich], jedes Detail zu prüfen.', 'It is essential to check every detail.'], ['Hervorzuheben ist, dass sich die Ergebnisse allmählich verbessert haben.', 'It is worth emphasizing that the results have gradually improved.']] },
      { title: 'Idioms', words: [['Tomaten auf den Augen haben', 'to be oblivious'], ['den Nagel auf den Kopf treffen', 'to hit the nail on the head'], ['ins Fettnäpfchen treten', 'to put your foot in it'], ['ein Brett vor dem Kopf haben', 'to be dense'], ['Daumen drücken', 'to keep your fingers crossed']], sentences: [['Du solltest nicht schon wieder [ins Fettnäpfchen treten].', "You shouldn't put your foot in it again."], ['Ich drücke dir morgen die Daumen.', "I'll keep my fingers crossed for you tomorrow."]] },
    ],
  },
}
