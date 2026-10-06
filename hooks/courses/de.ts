import type { Course } from '../course'
import { lesson as L } from '../course'

export const german: Course = {
  code: 'de',
  name: 'German',
  flag: '🇩🇪',
  voice: 'Anna',
  voiceHint: 'German voice "Anna"',
  article: { options: ['der', 'die', 'das'], noun: /^(der|die|das) \S+$/, strip: /^(der|die|das) / },
  capitalNouns: true,
  praise: ['Super!', 'Prima!', 'Genau!', 'Sehr gut!', 'Toll!', 'Perfekt!', 'Klasse!'],
  oops: 'Nicht ganz.',
  coach: {
    welcome: 'Willkommen! Tap the ▶️ to start your first lesson.',
    goal: 'Tagesziel erreicht! Next up: {title}.',
    next: 'Auf geht’s: {title}!',
    done: 'Alles geschafft. Sehr gut!',
  },
  levels: {
  A1: [
    {
      title: 'Hallo!', sub: 'Greetings & basics', emoji: '👋',
      tip: 'Nouns are always written with a capital letter. “Ich heiße …” means “My name is …”. Use du with friends and Sie with strangers.',
      lessons: [
        L('Greetings', [['hallo', 'hello'], ['tschüss', 'bye'], ['danke', 'thank you'], ['bitte', 'please'], ['guten Morgen', 'good morning']], ['[Hallo], ich heiße Anna.', 'Hello, my name is Anna.'], ['Guten Morgen, wie geht es dir?', 'Good morning, how are you?']),
        L('About me', [['ich', 'I'], ['du', 'you'], ['der Name', 'name'], ['aus', 'from'], ['und', 'and']], ['Mein [Name] ist Tom.', 'My name is Tom.'], ['Ich komme aus Spanien und du?', 'I come from Spain and you?']),
        L('Yes and no', [['ja', 'yes'], ['nein', 'no'], ['vielleicht', 'maybe'], ['Entschuldigung', 'excuse me'], ['gut', 'good']], ['Ja, das ist [gut].', 'Yes, that is good.'], ['Nein, danke, vielleicht später.', 'No thank you, maybe later.']),
        L('Numbers 1 to 5', [['eins', 'one'], ['zwei', 'two'], ['drei', 'three'], ['vier', 'four'], ['fünf', 'five']], ['Ich habe [zwei] Brüder.', 'I have two brothers.'], ['Das Buch kostet fünf Euro.', 'The book costs five euros.']),
      ],
    },
    {
      title: 'Essen & Trinken', sub: 'Food & drink', emoji: '🍽️',
      tip: 'German nouns have a gender: der (masculine), die (feminine), das (neuter). Learn every noun together with its article.',
      lessons: [
        L('Drinks', [['das Wasser', 'water'], ['der Kaffee', 'coffee'], ['der Tee', 'tea'], ['die Milch', 'milk'], ['der Saft', 'juice']], ['Ich trinke gern [Kaffee].', 'I like drinking coffee.'], ['Möchtest du Tee oder Wasser?', 'Would you like tea or water?']),
        L('Food', [['das Brot', 'bread'], ['der Apfel', 'apple'], ['der Käse', 'cheese'], ['das Ei', 'egg'], ['die Suppe', 'soup']], ['Das [Brot] ist frisch.', 'The bread is fresh.'], ['Die Suppe ist heiß.', 'The soup is hot.']),
        L('Restaurant', [['die Speisekarte', 'menu'], ['die Rechnung', 'bill'], ['der Kellner', 'waiter'], ['bestellen', 'to order'], ['lecker', 'delicious']], ['Die Suppe ist sehr [lecker].', 'The soup is very delicious.'], ['Die Rechnung, bitte!', 'The bill, please!']),
        L('Likes', [['essen', 'to eat'], ['trinken', 'to drink'], ['mögen', 'to like'], ['gern', 'gladly'], ['kochen', 'to cook']], ['Ich [koche] heute Abend Suppe.', 'I am cooking soup this evening.'], ['Sie trinkt gern Tee, aber er mag Kaffee.', 'She likes drinking tea but he likes coffee.']),
      ],
    },
    {
      title: 'Familie & Freunde', sub: 'Family & friends', emoji: '👨‍👩‍👧',
      tip: 'Possessives: mein (my) and dein (your) take endings like ein: mein Bruder, meine Schwester, mein Kind.',
      lessons: [
        L('Family', [['die Mutter', 'mother'], ['der Vater', 'father'], ['der Bruder', 'brother'], ['die Schwester', 'sister'], ['die Familie', 'family']], ['Meine [Mutter] heißt Julia.', 'My mother is called Julia.'], ['Ich habe einen Bruder und eine Schwester.', 'I have a brother and a sister.']),
        L('People', [['der Freund', 'friend (male)'], ['die Freundin', 'friend (female)'], ['das Kind', 'child'], ['der Mann', 'man'], ['die Frau', 'woman']], ['Das ist meine [Freundin] Lena.', 'This is my friend Lena.'], ['Die Frau und das Kind spielen im Garten.', 'The woman and the child play in the garden.']),
        L('Describing', [['groß', 'tall, big'], ['klein', 'small, short'], ['alt', 'old'], ['jung', 'young'], ['nett', 'nice']], ['Mein Bruder ist [groß].', 'My brother is tall.'], ['Die alte Frau ist sehr nett.', 'The old woman is very nice.']),
        L('Home', [['das Haus', 'house'], ['die Wohnung', 'apartment'], ['das Zimmer', 'room'], ['die Küche', 'kitchen'], ['der Garten', 'garden']], ['Wir haben ein [Haus] mit Garten.', 'We have a house with a garden.'], ['Die Küche ist klein, aber schön.', 'The kitchen is small but beautiful.']),
      ],
    },
    {
      title: 'Mein Alltag', sub: 'Daily life', emoji: '⏰',
      tip: 'Regular verbs: ich -e, du -st, er/sie/es -t, wir -en. The verb is always the second idea in a statement.',
      lessons: [
        L('Time words', [['heute', 'today'], ['morgen', 'tomorrow'], ['gestern', 'yesterday'], ['jetzt', 'now'], ['spät', 'late']], ['[Heute] ist es sehr warm.', 'Today it is very warm.'], ['Morgen habe ich keine Zeit.', 'Tomorrow I have no time.']),
        L('Days', [['der Montag', 'Monday'], ['der Freitag', 'Friday'], ['das Wochenende', 'weekend'], ['die Woche', 'week'], ['der Tag', 'day']], ['Am [Freitag] gehe ich ins Kino.', 'On Friday I go to the cinema.'], ['Am Wochenende schlafe ich lange.', 'At the weekend I sleep in.']),
        L('Daily verbs', [['aufstehen', 'to get up'], ['arbeiten', 'to work'], ['schlafen', 'to sleep'], ['gehen', 'to go'], ['lernen', 'to learn']], ['Ich muss früh [aufstehen].', 'I have to get up early.'], ['Er arbeitet und sie lernt Deutsch.', 'He works and she learns German.']),
        L('Places', [['die Schule', 'school'], ['das Kino', 'cinema'], ['der Supermarkt', 'supermarket'], ['die Stadt', 'city'], ['der Bahnhof', 'train station']], ['Der [Bahnhof] ist in der Stadt.', 'The train station is in the city.'], ['Wir gehen nach der Schule ins Kino.', 'We go to the cinema after school.']),
      ],
    },
  ],
  A2: [
    {
      title: 'Einkaufen', sub: 'Shopping', emoji: '🛍️',
      tip: 'Accusative case: only masculine changes. der Apfel becomes den Apfel after verbs like kaufen, haben, brauchen.',
      lessons: [
        L('Shops', [['der Laden', 'shop'], ['der Markt', 'market'], ['kaufen', 'to buy'], ['verkaufen', 'to sell'], ['das Geld', 'money']], ['Ich möchte Brot [kaufen].', 'I would like to buy bread.'], ['Der Markt öffnet um acht Uhr.', 'The market opens at eight o’clock.']),
        L('Prices', [['der Preis', 'price'], ['teuer', 'expensive'], ['billig', 'cheap'], ['die Karte', 'card'], ['bezahlen', 'to pay']], ['Der Mantel ist zu [teuer].', 'The coat is too expensive.'], ['Kann ich mit Karte bezahlen?', 'Can I pay by card?']),
        L('Clothes', [['die Hose', 'trousers'], ['das Hemd', 'shirt'], ['die Jacke', 'jacket'], ['die Schuhe', 'shoes'], ['tragen', 'to wear']], ['Ich brauche eine neue [Jacke].', 'I need a new jacket.'], ['Diese Schuhe passen mir nicht.', 'These shoes do not fit me.']),
        L('Colours', [['rot', 'red'], ['blau', 'blue'], ['grün', 'green'], ['schwarz', 'black'], ['weiß', 'white']], ['Die Tür ist [grün].', 'The door is green.'], ['Ich hätte gern das blaue Hemd.', 'I would like the blue shirt.']),
      ],
    },
    {
      title: 'Unterwegs', sub: 'Getting around', emoji: '🚆',
      tip: 'Perfekt (spoken past): haben or sein + Partizip II at the end. Ich habe Brot gekauft. Ich bin nach Wien gefahren.',
      lessons: [
        L('Transport', [['der Zug', 'train'], ['der Bus', 'bus'], ['das Auto', 'car'], ['das Fahrrad', 'bike'], ['das Flugzeug', 'airplane']], ['Ich fahre mit dem [Zug] nach Wien.', 'I travel to Vienna by train.'], ['Das Fahrrad ist in der Stadt schneller als das Auto.', 'The bike is faster than the car in the city.']),
        L('Station', [['der Flughafen', 'airport'], ['die Fahrkarte', 'ticket'], ['der Koffer', 'suitcase'], ['das Gleis', 'platform'], ['die Abfahrt', 'departure']], ['Der Zug fährt von [Gleis] drei ab.', 'The train leaves from platform three.'], ['Wo ist mein Koffer?', 'Where is my suitcase?']),
        L('Directions', [['links', 'left'], ['rechts', 'right'], ['geradeaus', 'straight ahead'], ['die Straße', 'street'], ['die Ecke', 'corner']], ['Gehen Sie [geradeaus] und dann links.', 'Go straight ahead and then left.'], ['Das Hotel ist an der Ecke.', 'The hotel is on the corner.']),
        L('Hotel', [['das Hotel', 'hotel'], ['die Reservierung', 'reservation'], ['das Frühstück', 'breakfast'], ['der Schlüssel', 'key'], ['bleiben', 'to stay']], ['Das [Frühstück] ist von sieben bis zehn.', 'Breakfast is from seven to ten.'], ['Wir möchten zwei Nächte bleiben.', 'We would like to stay two nights.']),
      ],
    },
    {
      title: 'Gesundheit & Freizeit', sub: 'Health & leisure', emoji: '🩺',
      tip: 'Modal verbs (können, müssen, wollen, dürfen) send the second verb to the end: Ich muss heute arbeiten.',
      lessons: [
        L('Body', [['der Kopf', 'head'], ['der Arm', 'arm'], ['das Bein', 'leg'], ['der Bauch', 'belly'], ['die Hand', 'hand']], ['Mein [Kopf] tut weh.', 'My head hurts.'], ['Er hat sich am Bein verletzt.', 'He hurt his leg.']),
        L('At the doctor', [['der Arzt', 'doctor'], ['krank', 'sick'], ['die Medizin', 'medicine'], ['der Termin', 'appointment'], ['die Schmerzen', 'pain']], ['Ich bin [krank] und gehe zum Arzt.', 'I am sick and am going to the doctor.'], ['Ich brauche einen Termin für morgen.', 'I need an appointment for tomorrow.']),
        L('Weather', [['das Wetter', 'weather'], ['die Sonne', 'sun'], ['der Regen', 'rain'], ['der Schnee', 'snow'], ['kalt', 'cold']], ['Heute scheint die [Sonne].', 'The sun is shining today.'], ['Im Winter gibt es oft Schnee.', 'In winter there is often snow.']),
        L('Hobbies', [['das Hobby', 'hobby'], ['die Musik', 'music'], ['schwimmen', 'to swim'], ['lesen', 'to read'], ['tanzen', 'to dance']], ['Mein [Hobby] ist Musik.', 'My hobby is music.'], ['Am Sonntag schwimme ich gern im See.', 'On Sunday I like swimming in the lake.']),
      ],
    },
    {
      title: 'Erinnern & Planen', sub: 'Past & plans', emoji: '🗓️',
      tip: 'Talk about the future with the present tense plus a time word: Nächstes Jahr fahre ich nach Italien.',
      lessons: [
        L('Looking back', [['letzte Woche', 'last week'], ['schon', 'already'], ['noch nicht', 'not yet'], ['damals', 'back then'], ['vor einem Jahr', 'a year ago']], ['Ich war [schon] in Berlin.', 'I have already been to Berlin.'], ['Letzte Woche habe ich einen Film gesehen.', 'Last week I watched a film.']),
        L('Plans', [['planen', 'to plan'], ['besuchen', 'to visit'], ['die Reise', 'trip'], ['der Urlaub', 'vacation'], ['hoffentlich', 'hopefully']], ['Wir [planen] eine Reise nach Italien.', 'We are planning a trip to Italy.'], ['Hoffentlich haben wir schönes Wetter im Urlaub.', 'Hopefully we will have nice weather on vacation.']),
        L('Invitations', [['die Einladung', 'invitation'], ['einladen', 'to invite'], ['mitkommen', 'to come along'], ['leider', 'unfortunately'], ['die Party', 'party']], ['Danke für die [Einladung]!', 'Thanks for the invitation!'], ['Leider habe ich am Samstag keine Zeit.', 'Unfortunately I have no time on Saturday.']),
        L('Feelings', [['glücklich', 'happy'], ['traurig', 'sad'], ['müde', 'tired'], ['wütend', 'angry'], ['aufgeregt', 'excited']], ['Ich bin heute sehr [müde].', 'I am very tired today.'], ['Sie war glücklich, weil er angerufen hat.', 'She was happy because he called.']),
      ],
    },
  ],
  B1: [
    {
      title: 'Meinungen', sub: 'Opinions', emoji: '💬',
      tip: 'After weil, obwohl and dass the conjugated verb goes to the very end: Ich bleibe zu Hause, weil ich krank bin.',
      lessons: [
        L('Connectors', [['weil', 'because'], ['obwohl', 'although'], ['deshalb', 'therefore'], ['trotzdem', 'nevertheless'], ['außerdem', 'besides']], ['Ich bleibe zu Hause, [weil] ich krank bin.', 'I am staying home because I am sick.'], ['Er ist müde, trotzdem arbeitet er weiter.', 'He is tired, nevertheless he keeps working.']),
        L('Agreeing', [['die Meinung', 'opinion'], ['zustimmen', 'to agree'], ['widersprechen', 'to contradict'], ['überzeugt', 'convinced'], ['bezweifeln', 'to doubt']], ['Meiner [Meinung] nach ist das richtig.', 'In my opinion this is right.'], ['Ich bin nicht überzeugt, dass das funktioniert.', 'I am not convinced that this will work.']),
        L('Probability', [['wahrscheinlich', 'probably'], ['möglicherweise', 'possibly'], ['bestimmt', 'definitely'], ['offenbar', 'apparently'], ['eigentlich', 'actually']], ['Er kommt [wahrscheinlich] später.', 'He is probably coming later.'], ['Eigentlich wollte ich früher kommen.', 'Actually I wanted to come earlier.']),
        L('Preferences', [['lieber', 'rather'], ['am liebsten', 'most of all'], ['bevorzugen', 'to prefer'], ['der Vorschlag', 'suggestion'], ['entscheiden', 'to decide']], ['Ich trinke [lieber] Tee als Kaffee.', 'I prefer drinking tea to coffee.'], ['Es war schwer, sich zu entscheiden.', 'It was hard to decide.']),
      ],
    },
    {
      title: 'Arbeitswelt', sub: 'Work life', emoji: '💼',
      tip: 'Relative clauses push the verb to the end too: Das ist der Kollege, der im Büro arbeitet.',
      lessons: [
        L('Professions', [['der Beruf', 'profession'], ['der Lehrer', 'teacher'], ['der Ingenieur', 'engineer'], ['die Ärztin', 'female doctor'], ['der Angestellte', 'employee']], ['Mein [Beruf] gefällt mir sehr.', 'I like my profession a lot.'], ['Sie arbeitet als Ingenieurin in München.', 'She works as an engineer in Munich.']),
        L('At the office', [['das Büro', 'office'], ['die Besprechung', 'meeting'], ['der Kollege', 'colleague'], ['die Aufgabe', 'task'], ['die Frist', 'deadline']], ['Ich habe um zehn Uhr eine [Besprechung].', 'I have a meeting at ten o’clock.'], ['Die Frist für das Projekt endet am Freitag.', 'The deadline for the project ends on Friday.']),
        L('Applying', [['die Bewerbung', 'application'], ['der Lebenslauf', 'CV'], ['das Vorstellungsgespräch', 'interview'], ['die Erfahrung', 'experience'], ['die Stelle', 'position']], ['Ich schreibe eine [Bewerbung] für die Stelle.', 'I am writing an application for the position.'], ['Das Vorstellungsgespräch war besser als erwartet.', 'The interview was better than expected.']),
        L('Pay & contracts', [['das Gehalt', 'salary'], ['die Beförderung', 'promotion'], ['die Überstunden', 'overtime'], ['kündigen', 'to resign, give notice'], ['der Vertrag', 'contract']], ['Ich habe meinen [Vertrag] unterschrieben.', 'I have signed my contract.'], ['Er hat gekündigt, weil er zu viele Überstunden machte.', 'He quit because he did too much overtime.']),
      ],
    },
    {
      title: 'Medien & Technik', sub: 'Media & tech', emoji: '📱',
      tip: 'Passive voice: werden + Partizip II. Das Buch wird gelesen (The book is being read).',
      lessons: [
        L('Technology', [['der Computer', 'computer'], ['das Handy', 'mobile phone'], ['das Internet', 'internet'], ['das Passwort', 'password'], ['herunterladen', 'to download']], ['Mein [Handy] hat keinen Akku mehr.', 'My phone has no battery left.'], ['Ich habe die App gestern heruntergeladen.', 'I downloaded the app yesterday.']),
        L('The news', [['die Nachrichten', 'news'], ['die Zeitung', 'newspaper'], ['berichten', 'to report'], ['der Artikel', 'article'], ['die Quelle', 'source']], ['Die [Nachrichten] beginnen um acht Uhr.', 'The news begins at eight o’clock.'], ['Der Artikel berichtet über das Klima.', 'The article reports on the climate.']),
        L('Social media', [['der Beitrag', 'post'], ['folgen', 'to follow'], ['teilen', 'to share'], ['die Privatsphäre', 'privacy'], ['süchtig', 'addicted']], ['Ich habe den [Beitrag] mit Freunden geteilt.', 'I shared the post with friends.'], ['Viele Jugendliche sind süchtig nach ihrem Handy.', 'Many teenagers are addicted to their phones.']),
        L('Films & books', [['der Film', 'film'], ['der Roman', 'novel'], ['die Handlung', 'plot'], ['der Schauspieler', 'actor'], ['empfehlen', 'to recommend']], ['Die [Handlung] des Films war spannend.', 'The plot of the film was exciting.'], ['Kannst du mir einen guten Roman empfehlen?', 'Can you recommend a good novel to me?']),
      ],
    },
    {
      title: 'Reisen & Kultur', sub: 'Travel & culture', emoji: '🧳',
      tip: 'Polite requests use Konjunktiv II: Könnten Sie mir helfen? Ich hätte gern einen Kaffee.',
      lessons: [
        L('Delays', [['die Verspätung', 'delay'], ['ausfallen', 'to be cancelled'], ['umsteigen', 'to change trains'], ['verpassen', 'to miss'], ['der Anschluss', 'connection']], ['Der Zug hat zehn Minuten [Verspätung].', 'The train is ten minutes late.'], ['Ich habe meinen Anschluss leider verpasst.', 'Unfortunately I missed my connection.']),
        L('Complaints', [['sich beschweren', 'to complain'], ['kaputt', 'broken'], ['der Fehler', 'mistake'], ['die Erstattung', 'refund'], ['ersetzen', 'to replace']], ['Die Dusche ist [kaputt].', 'The shower is broken.'], ['Ich möchte mein Geld zurückbekommen.', 'I would like to get my money back.']),
        L('Culture', [['die Tradition', 'tradition'], ['das Fest', 'festival'], ['der Brauch', 'custom'], ['die Geschichte', 'history, story'], ['die Sprache', 'language']], ['Jedes Land hat seine eigene [Tradition].', 'Every country has its own tradition.'], ['Das Fest findet jedes Jahr im Herbst statt.', 'The festival takes place every year in autumn.']),
        L('Polite requests', [['könnten Sie', 'could you'], ['ich hätte gern', 'I would like'], ['würden Sie', 'would you'], ['es tut mir leid', 'I am sorry'], ['vielen Dank', 'many thanks']], ['[Könnten] Sie mir bitte helfen?', 'Could you please help me?'], ['Es tut mir leid, ich habe Sie nicht verstanden.', 'I am sorry, I did not understand you.']),
      ],
    },
  ],
  B2: [
    {
      title: 'Gesellschaft', sub: 'Society', emoji: '🏛️',
      tip: 'The genitive shows possession: die Rechte der Bürger (the rights of the citizens). Feminine and plural use der, masculine and neuter use des plus -s.',
      lessons: [
        L('Society', [['die Gesellschaft', 'society'], ['der Bürger', 'citizen'], ['die Ungleichheit', 'inequality'], ['die Gemeinschaft', 'community'], ['das Recht', 'legal right']], ['Die [Ungleichheit] wächst in vielen Ländern.', 'Inequality is growing in many countries.'], ['Alle Bürger haben die gleichen Rechte.', 'All citizens have the same rights.']),
        L('Politics', [['die Regierung', 'government'], ['die Wahl', 'election'], ['das Gesetz', 'law'], ['die Partei', 'political party'], ['abstimmen', 'to vote']], ['Die [Regierung] hat ein neues Gesetz beschlossen.', 'The government has passed a new law.'], ['Über das Gesetz dürfen alle Bürger abstimmen.', 'All citizens may vote on the law.']),
        L('Economy', [['die Wirtschaft', 'economy'], ['die Arbeitslosigkeit', 'unemployment'], ['die Inflation', 'inflation'], ['das Wachstum', 'growth'], ['die Steuer', 'tax']], ['Die [Wirtschaft] erholt sich langsam.', 'The economy is slowly recovering.'], ['Höhere Steuern bremsen das Wachstum.', 'Higher taxes slow down growth.']),
        L('Education', [['die Bildung', 'education'], ['die Hochschule', 'university'], ['das Studium', 'studies'], ['der Abschluss', 'degree'], ['fördern', 'to promote']], ['Gute [Bildung] öffnet viele Türen.', 'Good education opens many doors.'], ['Nach dem Abschluss möchte sie im Ausland arbeiten.', 'After graduating she would like to work abroad.']),
      ],
    },
    {
      title: 'Umwelt & Zukunft', sub: 'Environment & future', emoji: '🌍',
      tip: 'Unreal conditions use Konjunktiv II: Wenn ich Zeit hätte, würde ich mehr reisen. (If I had time, I would travel more.)',
      lessons: [
        L('Environment', [['die Umwelt', 'environment'], ['das Klima', 'climate'], ['der Müll', 'waste'], ['das Recycling', 'recycling'], ['die Verschmutzung', 'pollution']], ['Wir müssen die [Umwelt] schützen.', 'We must protect the environment.'], ['Die Verschmutzung der Meere nimmt zu.', 'The pollution of the oceans is increasing.']),
        L('Energy', [['die Energie', 'energy'], ['erneuerbar', 'renewable'], ['der Verbrauch', 'consumption'], ['das Kraftwerk', 'power plant'], ['einsparen', 'to save (energy)']], ['Wir sollten unseren [Verbrauch] senken.', 'We should reduce our consumption.'], ['Erneuerbare Energien ersetzen langsam die Kohle.', 'Renewable energies are slowly replacing coal.']),
        L('Science', [['die Forschung', 'research'], ['die Entdeckung', 'discovery'], ['die Studie', 'study'], ['beweisen', 'to prove'], ['die Theorie', 'theory']], ['Die [Forschung] zeigt neue Ergebnisse.', 'The research shows new results.'], ['Die Studie beweist einen klaren Zusammenhang.', 'The study proves a clear connection.']),
        L('What if', [['wenn', 'if'], ['hätte', 'would have'], ['wäre', 'would be'], ['würde', 'would'], ['andernfalls', 'otherwise']], ['[Wenn] ich reich wäre, würde ich reisen.', 'If I were rich, I would travel.'], ['Andernfalls wäre das Projekt gescheitert.', 'Otherwise the project would have failed.']),
      ],
    },
    {
      title: 'Argumentieren', sub: 'Arguing a case', emoji: '⚖️',
      tip: 'Two-part connectors: sowohl … als auch (both … and), entweder … oder (either … or), weder … noch (neither … nor).',
      lessons: [
        L('Contrasts', [['einerseits', 'on the one hand'], ['andererseits', 'on the other hand'], ['jedoch', 'however'], ['folglich', 'consequently'], ['immerhin', 'at least']], ['[Einerseits] ist es teuer, andererseits praktisch.', 'On the one hand it is expensive, on the other hand practical.'], ['Das Ergebnis ist jedoch nicht eindeutig.', 'However, the result is not clear.']),
        L('Claims', [['behaupten', 'to claim'], ['bestreiten', 'to deny'], ['belegen', 'to substantiate'], ['die Behauptung', 'assertion'], ['der Beweis', 'proof']], ['Er [behauptet], nichts gewusst zu haben.', 'He claims to have known nothing.'], ['Diese These lässt sich nicht belegen.', 'This thesis cannot be substantiated.']),
        L('Cause & effect', [['die Ursache', 'cause'], ['die Folge', 'consequence'], ['verursachen', 'to cause'], ['bewirken', 'to bring about'], ['aufgrund', 'due to']], ['Die [Ursache] des Problems ist unklar.', 'The cause of the problem is unclear.'], ['Aufgrund des Sturms fiel der Strom aus.', 'Due to the storm the power failed.']),
        L('Comparing', [['im Vergleich zu', 'compared to'], ['ähnlich', 'similar'], ['unterschiedlich', 'different'], ['vielmehr', 'instead (correcting what was said)'], ['hingegen', 'whereas']], ['Im [Vergleich] zu früher ist es ruhiger.', 'Compared to before it is quieter.'], ['Sie ist sportlich, er hingegen liest lieber.', 'She is sporty, whereas he prefers to read.']),
      ],
    },
    {
      title: 'Beruf & Kultur', sub: 'Career & culture', emoji: '🎭',
      tip: 'Nominalisation turns verbs into nouns: entscheiden → die Entscheidung, verhandeln → die Verhandlung. It is typical for written German.',
      lessons: [
        L('Leadership', [['die Verantwortung', 'responsibility'], ['leiten', 'to lead'], ['der Vorgesetzte', 'supervisor'], ['die Entscheidung', 'decision'], ['die Strategie', 'strategy']], ['Sie trägt die [Verantwortung] für das Team.', 'She bears the responsibility for the team.'], ['Die Entscheidung fiel nach langer Diskussion.', 'The decision was made after long discussion.']),
        L('Negotiating', [['verhandeln', 'to negotiate'], ['der Kompromiss', 'compromise'], ['das Angebot', 'offer'], ['ablehnen', 'to reject'], ['vereinbaren', 'to arrange']], ['Wir haben einen [Kompromiss] gefunden.', 'We have found a compromise.'], ['Das Angebot wurde leider abgelehnt.', 'The offer was unfortunately rejected.']),
        L('The arts', [['die Kunst', 'art'], ['die Ausstellung', 'exhibition'], ['der Künstler', 'artist'], ['das Werk', 'work'], ['die Kritik', 'review']], ['Die [Ausstellung] eröffnet nächste Woche.', 'The exhibition opens next week.'], ['Die Kritik lobte das Werk des Künstlers.', 'The review praised the artist’s work.']),
        L('Identity', [['die Herkunft', 'origin'], ['die Integration', 'integration'], ['die Identität', 'identity'], ['auswandern', 'to emigrate'], ['vielfältig', 'diverse']], ['Die [Integration] braucht Zeit und Geduld.', 'Integration takes time and patience.'], ['Deutschland ist ein vielfältiges Einwanderungsland.', 'Germany is a diverse country of immigration.']),
      ],
    },
  ],
  C1: [
    {
      title: 'Feinheiten', sub: 'Nuance', emoji: '🎯',
      tip: 'Modal particles (eben, halt, doch, mal, wohl) carry attitude rather than meaning. They are impossible to translate word for word, so learn them in sentences.',
      lessons: [
        L('Nuance words', [['die Nuance', 'nuance'], ['unerlässlich', 'essential'], ['bemerkenswert', 'remarkable'], ['allmählich', 'gradually'], ['zweifellos', 'undoubtedly']], ['Es ist [unerlässlich], jedes Detail zu prüfen.', 'It is essential to check every detail.'], ['Die Ergebnisse verbesserten sich allmählich.', 'The results gradually improved.']),
        L('Modal particles', [['eben', 'simply (particle)'], ['halt', 'just (colloquial particle)'], ['doch', 'but surely (particle)'], ['mal', 'for a moment (particle)'], ['wohl', 'I suppose (particle)']], ['Das ist [eben] so.', 'That is just how it is.'], ['Komm doch mal vorbei!', 'Do drop by sometime!']),
        L('Formal letters', [['sehr geehrte', 'dear (formal)'], ['hiermit', 'hereby'], ['bezüglich', 'regarding'], ['anbei', 'enclosed'], ['mit freundlichen Grüßen', 'kind regards']], ['[Hiermit] bewerbe ich mich um die Stelle.', 'I hereby apply for the position.'], ['Anbei finden Sie meinen Lebenslauf.', 'Enclosed you will find my CV.']),
        L('Hedging', [['gewissermaßen', 'to a certain extent'], ['tendenziell', 'tends to'], ['vermutlich', 'presumably'], ['annähernd', 'approximately'], ['mutmaßlich', 'presumed, suspected']], ['Das ist [gewissermaßen] eine Ausnahme.', 'That is to a certain extent an exception.'], ['Die Preise steigen tendenziell weiter.', 'Prices tend to keep rising.']),
      ],
    },
    {
      title: 'Wissenschaftssprache', sub: 'Academic German', emoji: '🎓',
      tip: 'Academic style prefers nouns and the genitive: Wegen des Regens (because of the rain) instead of weil es regnet.',
      lessons: [
        L('Research', [['die These', 'thesis'], ['die Methode', 'method'], ['die Hypothese', 'hypothesis'], ['die Erkenntnis', 'insight'], ['der Zusammenhang', 'correlation, link']], ['Die [These] wurde empirisch überprüft.', 'The thesis was empirically tested.'], ['Diese Erkenntnis verändert unser Verständnis.', 'This insight changes our understanding.']),
        L('Analysis', [['analysieren', 'to analyze'], ['hinterfragen', 'to question'], ['erörtern', 'to discuss in depth'], ['ableiten', 'to derive'], ['voraussetzen', 'to presuppose']], ['Man sollte jede Quelle kritisch [hinterfragen].', 'One should critically question every source.'], ['Daraus lässt sich eine klare Schlussfolgerung ableiten.', 'A clear conclusion can be derived from this.']),
        L('Concessions', [['wenngleich', 'albeit'], ['indessen', 'meanwhile'], ['nichtsdestotrotz', 'nonetheless'], ['insofern', 'insofar'], ['ungeachtet', 'regardless of']], ['[Wenngleich] das Ergebnis überrascht, ist es plausibel.', 'Although the result is surprising, it is plausible.'], ['Ungeachtet der Kritik hielt sie am Plan fest.', 'Regardless of the criticism she stuck to the plan.']),
        L('Reported speech', [['laut', 'according to (before the noun)'], ['angeblich', 'supposedly'], ['zufolge', 'according to (after the noun)'], ['bekanntlich', 'as is well known'], ['erklären', 'to explain']], ['Dem Bericht [zufolge] steigen die Preise.', 'According to the report prices are rising.'], ['Er erklärte, er habe nichts davon gewusst.', 'He explained that he had known nothing about it.']),
      ],
    },
    {
      title: 'Redewendungen', sub: 'Idioms', emoji: '🗣️',
      tip: 'Idioms are never translated word for word. “Die Daumen drücken” literally means “to press the thumbs” and means to keep your fingers crossed.',
      lessons: [
        L('Body idioms', [['ins Fettnäpfchen treten', 'to put your foot in it'], ['jemandem die Daumen drücken', 'to keep your fingers crossed for someone'], ['ein Brett vor dem Kopf haben', 'to be dense'], ['auf dem Schlauch stehen', 'to be slow on the uptake'], ['die Nase voll haben', 'to be fed up']], ['Du solltest nicht schon wieder [ins Fettnäpfchen treten].', 'You should not put your foot in it again.'], ['Ich habe die Nase voll von dem Lärm.', 'I am fed up with the noise.']),
        L('Animal idioms', [['da liegt der Hund begraben', 'that is the crux of it'], ['die Katze im Sack kaufen', 'to buy a pig in a poke'], ['Schwein haben', 'to be lucky'], ['einen Vogel haben', 'to be crazy'], ['den Stier bei den Hörnern packen', 'to take the bull by the horns']], ['Hier liegt der [Hund begraben].', 'This is where the crux of it lies.'], ['Wir hatten wirklich Schwein mit dem Wetter.', 'We were really lucky with the weather.']),
        L('Money & work', [['Geld wie Heu haben', 'to be rolling in money'], ['auf großem Fuß leben', 'to live extravagantly'], ['den Gürtel enger schnallen', 'to tighten your belt'], ['in den sauren Apfel beißen', 'to bite the bullet'], ['Hand in Hand arbeiten', 'to work hand in hand']], ['Wir müssen jetzt den [Gürtel enger schnallen].', 'We have to tighten our belts now.'], ['Am Ende biss er in den sauren Apfel.', 'In the end he bit the bullet.']),
        L('Everyday idioms', [['Das ist mir Wurst', 'I do not care'], ['jemanden auf die Palme bringen', 'to drive someone up the wall'], ['mit der Tür ins Haus fallen', 'to blurt it out'], ['Zeit totschlagen', 'to kill time'], ['sich aus dem Staub machen', 'to slip away']], ['Das ist mir [Wurst].', 'I do not care.'], ['Er bringt mich mit seinen Fragen auf die Palme.', 'He drives me up the wall with his questions.']),
      ],
    },
    {
      title: 'Stil & Rhetorik', sub: 'Style & rhetoric', emoji: '✒️',
      tip: 'Konjunktiv I reports what someone said (Er sagte, er sei müde). Konjunktiv II expresses the unreal (Wenn er müde wäre …).',
      lessons: [
        L('Rhetoric', [['überzeugend', 'convincing'], ['prägnant', 'concise'], ['treffend', 'apt'], ['differenziert', 'nuanced'], ['schlüssig', 'coherent']], ['Ihre Argumentation war sehr [schlüssig].', 'Her argumentation was very coherent.'], ['Er formulierte seine Kritik prägnant und treffend.', 'He formulated his criticism concisely and aptly.']),
        L('Abstract nouns', [['die Tragweite', 'scope'], ['die Willkür', 'arbitrariness'], ['das Spannungsfeld', 'area of tension'], ['der Anspruch', 'entitlement'], ['die Voraussetzung', 'prerequisite']], ['Die [Tragweite] der Entscheidung ist enorm.', 'The scope of the decision is enormous.'], ['Das Projekt bewegt sich im Spannungsfeld von Ethik und Profit.', 'The project moves in the tension between ethics and profit.']),
        L('Precise verbs', [['beeinträchtigen', 'to impair'], ['veranschaulichen', 'to illustrate'], ['bewältigen', 'to cope with'], ['anstreben', 'to aim for'], ['vernachlässigen', 'to neglect']], ['Lärm kann die Konzentration [beeinträchtigen].', 'Noise can impair concentration.'], ['Diese Grafik veranschaulicht die Entwicklung.', 'This graph illustrates the development.']),
        L('Ethics & change', [['die Nachhaltigkeit', 'sustainability'], ['der Wandel', 'change'], ['die Chance', 'opportunity'], ['das Dilemma', 'dilemma'], ['abwägen', 'to weigh up']], ['Wir müssen Chancen und Risiken [abwägen].', 'We must weigh up opportunities and risks.'], ['Nachhaltigkeit ist der Schlüssel für den Wandel.', 'Sustainability is the key to change.']),
      ],
    },
  ],
},
}
