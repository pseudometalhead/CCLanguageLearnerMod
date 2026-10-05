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
  Spanish: {
    A1: [
      { title: 'Greetings', words: [['hola', 'hello'], ['adiós', 'goodbye'], ['gracias', 'thank you'], ['por favor', 'please'], ['buenos días', 'good morning']], sentences: [['[Hola], me llamo Ana.', 'Hello, my name is Ana.'], ['Buenos días, ¿cómo estás?', 'Good morning, how are you?']] },
      { title: 'Food', words: [['agua', 'water'], ['pan', 'bread'], ['manzana', 'apple'], ['leche', 'milk'], ['queso', 'cheese']], sentences: [['Quiero un vaso de [agua].', 'I want a glass of water.'], ['Me gusta el pan con queso.', 'I like bread with cheese.']] },
    ],
    A2: [
      { title: 'Daily life', words: [['trabajar', 'to work'], ['comprar', 'to buy'], ['casa', 'house'], ['ayer', 'yesterday'], ['mañana', 'tomorrow']], sentences: [['Mañana voy a [trabajar] en casa.', 'Tomorrow I am going to work at home.'], ['Ayer compré pan en el mercado.', 'Yesterday I bought bread at the market.']] },
      { title: 'Travel', words: [['aeropuerto', 'airport'], ['billete', 'ticket'], ['maleta', 'suitcase'], ['estación', 'station'], ['playa', 'beach']], sentences: [['El [aeropuerto] está muy lejos.', 'The airport is very far.'], ['¿Dónde puedo comprar un billete de tren?', 'Where can I buy a train ticket?']] },
    ],
    B1: [
      { title: 'Opinions', words: [['sin embargo', 'however'], ['aunque', 'although'], ['por eso', "that's why"], ['estar de acuerdo', 'to agree'], ['probablemente', 'probably']], sentences: [['[Aunque] llueve, vamos a salir.', "Although it's raining, we are going out."], ['No estoy de acuerdo contigo, sin embargo te entiendo.', "I don't agree with you, however I understand you."]] },
      { title: 'Work', words: [['empresa', 'company'], ['reunión', 'meeting'], ['sueldo', 'salary'], ['entrevista', 'interview'], ['ascenso', 'promotion']], sentences: [['Tengo una [reunión] a las diez.', 'I have a meeting at ten.'], ['Espero conseguir un ascenso este año.', 'I hope to get a promotion this year.']] },
    ],
    B2: [
      { title: 'Society', words: [['desarrollo', 'development'], ['ciudadano', 'citizen'], ['desigualdad', 'inequality'], ['medio ambiente', 'environment'], ['derecho', 'right']], sentences: [['La [desigualdad] sigue creciendo en muchos países.', 'Inequality keeps growing in many countries.'], ['Todos los ciudadanos tienen los mismos derechos.', 'All citizens have the same rights.']] },
      { title: 'Abstract ideas', words: [['a pesar de', 'despite'], ['en cuanto a', 'regarding'], ['lograr', 'to achieve'], ['fomentar', 'to promote'], ['tener en cuenta', 'to take into account']], sentences: [['Hay que [fomentar] el reciclaje.', 'We must promote recycling.'], ['A pesar de las dificultades, logró terminar el proyecto.', 'Despite the difficulties, he managed to finish the project.']] },
    ],
    C1: [
      { title: 'Nuance', words: [['matiz', 'nuance'], ['imprescindible', 'essential'], ['cabe destacar', 'it is worth noting'], ['paulatinamente', 'gradually'], ['supuesto', 'assumption']], sentences: [['Es [imprescindible] revisar cada detalle.', 'It is essential to review every detail.'], ['Cabe destacar que los resultados mejoraron paulatinamente.', 'It is worth noting that the results improved gradually.']] },
      { title: 'Idioms', words: [['estar en las nubes', 'to have your head in the clouds'], ['dar en el clavo', 'to hit the nail on the head'], ['meter la pata', 'to put your foot in it'], ['costar un ojo de la cara', 'to cost an arm and a leg'], ['ponerse las pilas', 'to get your act together']], sentences: [['Tuvo que [ponerse las pilas] para aprobar.', 'He had to get his act together to pass.'], ['Ese coche me costó un ojo de la cara.', 'That car cost me an arm and a leg.']] },
    ],
  },
  French: {
    A1: [
      { title: 'Greetings', words: [['bonjour', 'hello'], ['au revoir', 'goodbye'], ['merci', 'thank you'], ["s'il vous plaît", 'please'], ['bonsoir', 'good evening']], sentences: [['[Bonjour], je m\'appelle Marc.', 'Hello, my name is Marc.'], ['Bonsoir, comment allez-vous ?', 'Good evening, how are you?']] },
      { title: 'Food', words: [['eau', 'water'], ['pain', 'bread'], ['pomme', 'apple'], ['lait', 'milk'], ['fromage', 'cheese']], sentences: [["Je voudrais un verre d'[eau].", 'I would like a glass of water.'], ["J'aime le pain avec du fromage.", 'I like bread with cheese.']] },
    ],
    A2: [
      { title: 'Daily life', words: [['travailler', 'to work'], ['acheter', 'to buy'], ['maison', 'house'], ['hier', 'yesterday'], ['demain', 'tomorrow']], sentences: [['Demain, je vais [travailler] à la maison.', 'Tomorrow I am going to work at home.'], ["Hier, j'ai acheté du pain au marché.", 'Yesterday I bought bread at the market.']] },
      { title: 'Travel', words: [['aéroport', 'airport'], ['billet', 'ticket'], ['valise', 'suitcase'], ['gare', 'station'], ['plage', 'beach']], sentences: [["L'[aéroport] est très loin.", 'The airport is very far.'], ['Où puis-je acheter un billet de train ?', 'Where can I buy a train ticket?']] },
    ],
    B1: [
      { title: 'Opinions', words: [['cependant', 'however'], ['bien que', 'although'], ["c'est pourquoi", "that's why"], ["être d'accord", 'to agree'], ['probablement', 'probably']], sentences: [['Je suis fatigué, [cependant] je continue.', 'I am tired, however I am carrying on.'], ['Je ne suis pas d\'accord avec toi, mais je te comprends.', "I don't agree with you, but I understand you."]] },
      { title: 'Work', words: [['entreprise', 'company'], ['réunion', 'meeting'], ['salaire', 'salary'], ['entretien', 'interview'], ['promotion', 'promotion']], sentences: [["J'ai une [réunion] à dix heures.", 'I have a meeting at ten.'], ["J'espère obtenir une promotion cette année.", 'I hope to get a promotion this year.']] },
    ],
    B2: [
      { title: 'Society', words: [['développement', 'development'], ['citoyen', 'citizen'], ['inégalité', 'inequality'], ['environnement', 'environment'], ['droit', 'right']], sentences: [["L'[inégalité] augmente dans de nombreux pays.", 'Inequality is growing in many countries.'], ['Tous les citoyens ont les mêmes droits.', 'All citizens have the same rights.']] },
      { title: 'Abstract ideas', words: [['malgré', 'despite'], ['quant à', 'as for'], ['parvenir à', 'to manage to'], ['encourager', 'to encourage'], ['tenir compte de', 'to take into account']], sentences: [['Il faut [encourager] le recyclage.', 'We must encourage recycling.'], ['Malgré les difficultés, il est parvenu à terminer le projet.', 'Despite the difficulties, he managed to finish the project.']] },
    ],
    C1: [
      { title: 'Nuance', words: [['nuance', 'nuance'], ['indispensable', 'essential'], ['il convient de souligner', 'it is worth stressing'], ['progressivement', 'gradually'], ['hypothèse', 'hypothesis']], sentences: [['Il est [indispensable] de vérifier chaque détail.', 'It is essential to check every detail.'], ["Il convient de souligner que les résultats se sont améliorés progressivement.", 'It is worth stressing that the results gradually improved.']] },
      { title: 'Idioms', words: [['avoir la tête dans les nuages', 'to have your head in the clouds'], ['coûter les yeux de la tête', 'to cost an arm and a leg'], ['mettre les pieds dans le plat', 'to put your foot in it'], ['tomber dans les pommes', 'to faint'], ['poser un lapin', 'to stand someone up']], sentences: [['Ce manteau va [coûter les yeux de la tête].', 'That coat is going to cost an arm and a leg.'], ["Il m'a posé un lapin hier soir.", 'He stood me up last night.']] },
    ],
  },
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
