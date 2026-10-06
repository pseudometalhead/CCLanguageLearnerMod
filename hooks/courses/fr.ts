import type { Course } from '../course'
import { lesson as L } from '../course'

// Design notes for the article puzzle (the engine needs at least 3 options, so a plural 'les' decoy joins le/la): only "le/la + one word" counts as a noun. Nouns that start with a vowel or a
// mute h take l’ (l’eau, l’école) and plurals take les, so they are written as plain words: they teach the form
// but do not get the le/la puzzle, which keeps that puzzle unambiguous. Gap words are never glued to l’ or d’.
export const french: Course = {
  code: 'fr',
  name: 'French',
  flag: '🇫🇷',
  voices: ['Thomas', 'Amelie', 'Audrey', 'Microsoft Hortense Desktop', 'Microsoft Julie', 'Microsoft Paul'],
  voiceHint: 'a French system voice (macOS "Thomas" or "Amelie", Windows "Hortense" or "Julie")',
  article: { options: ['le', 'la', 'les'], noun: /^(le|la) \S+$/, strip: /^(le|la) / },
  capitalNouns: false,
  praise: ['Super !', 'Bravo !', 'Parfait !', 'Très bien !', 'Génial !', 'Excellent !', 'Formidable !'],
  oops: 'Pas tout à fait.',
  coach: {
    welcome: 'Bienvenue ! Tap the ▶️ to start your first lesson.',
    goal: 'Objectif du jour atteint ! Next up: {title}.',
    next: 'C’est parti : {title} !',
    done: 'Tout est terminé. Très bien !',
  },
  levels: {
  A1: [
    {
      title: 'Bonjour !', sub: 'Greetings & basics', emoji: '👋',
      tip: '“Je m’appelle …” means “My name is …”. Use tu with friends and family, and vous with strangers or to be polite.',
      lessons: [
        L('Greetings', [['bonjour', 'hello'], ['salut', 'hi (informal)'], ['merci', 'thank you'], ['s’il vous plaît', 'please'], ['au revoir', 'goodbye']], ['[Bonjour], je m’appelle Anna.', 'Hello, my name is Anna.'], ['Bonsoir, comment vas-tu ?', 'Good evening, how are you?']),
        L('About me', [['je', 'I'], ['tu', 'you (informal)'], ['le nom', 'name'], ['et', 'and'], ['mais', 'but']], ['Mon [nom] est Tom.', 'My name is Tom.'], ['Je viens d’Espagne et toi ?', 'I come from Spain and you?']),
        L('Yes and no', [['oui', 'yes'], ['non', 'no'], ['peut-être', 'maybe'], ['excusez-moi', 'excuse me'], ['bon', 'good']], ['Oui, c’est [bon].', 'Yes, it is good.'], ['Non, merci, peut-être plus tard.', 'No thank you, maybe later.']),
        L('Numbers 1 to 5', [['un', 'one'], ['deux', 'two'], ['trois', 'three'], ['quatre', 'four'], ['cinq', 'five']], ['J’ai [deux] frères.', 'I have two brothers.'], ['Le livre coûte cinq euros.', 'The book costs five euros.']),
      ],
    },
    {
      title: 'Manger et boire', sub: 'Food & drink', emoji: '🍽️',
      tip: 'French nouns are masculine (le) or feminine (la): learn every noun together with its article. Before a vowel both become l’ (l’eau), and the plural is les.',
      lessons: [
        L('Drinks', [['l’eau', 'water'], ['le café', 'coffee'], ['le thé', 'tea'], ['le lait', 'milk'], ['le jus', 'juice']], ['J’aime boire du [café].', 'I like drinking coffee.'], ['Tu veux du thé ou de l’eau ?', 'Would you like tea or water?']),
        L('Food', [['le pain', 'bread'], ['la pomme', 'apple'], ['le fromage', 'cheese'], ['l’œuf', 'egg'], ['la soupe', 'soup']], ['Le [pain] est frais.', 'The bread is fresh.'], ['La soupe est chaude.', 'The soup is hot.']),
        L('Restaurant', [['la carte', 'menu'], ['l’addition', 'bill'], ['le serveur', 'waiter'], ['commander', 'to order'], ['délicieux', 'delicious']], ['Le gâteau est très [délicieux].', 'The cake is very delicious.'], ['L’addition, s’il vous plaît !', 'The bill, please!']),
        L('Likes', [['manger', 'to eat'], ['boire', 'to drink'], ['aimer', 'to like'], ['volontiers', 'gladly'], ['cuisiner', 'to cook']], ['Ce soir, je [cuisine] du poulet.', 'This evening I am cooking chicken.'], ['Elle boit volontiers du thé, mais il aime le café.', 'She gladly drinks tea but he likes coffee.']),
      ],
    },
    {
      title: 'Famille et amis', sub: 'Family & friends', emoji: '👨‍👩‍👧',
      tip: 'Possessives agree with the noun: mon frère, ma sœur, mes parents. Before a vowel even feminine nouns take mon: mon amie.',
      lessons: [
        L('Family', [['la mère', 'mother'], ['le père', 'father'], ['le frère', 'brother'], ['la sœur', 'sister'], ['la famille', 'family']], ['Ma [mère] s’appelle Julie.', 'My mother is called Julie.'], ['J’ai un frère et une sœur.', 'I have a brother and a sister.']),
        L('People', [['le copain', 'friend (male)'], ['la copine', 'friend (female)'], ['l’enfant', 'child'], ['l’homme', 'man'], ['la femme', 'woman']], ['Voici ma [copine] Léa.', 'This is my friend Léa.'], ['La femme et l’enfant jouent dans le jardin.', 'The woman and the child play in the garden.']),
        L('Describing', [['grand', 'tall, big'], ['petit', 'small, short'], ['vieux', 'old'], ['jeune', 'young'], ['gentil', 'nice']], ['Mon frère est [grand].', 'My brother is tall.'], ['La vieille dame est très gentille.', 'The old lady is very nice.']),
        L('Home', [['la maison', 'house'], ['l’appartement', 'apartment'], ['la chambre', 'bedroom'], ['la cuisine', 'kitchen'], ['le jardin', 'garden']], ['Nous avons une [maison] avec un jardin.', 'We have a house with a garden.'], ['La cuisine est petite mais jolie.', 'The kitchen is small but pretty.']),
      ],
    },
    {
      title: 'Ma journée', sub: 'Daily life', emoji: '⏰',
      tip: 'Regular -er verbs: je -e, tu -es, il/elle -e, nous -ons, vous -ez, ils/elles -ent. Je parle, tu parles, nous parlons.',
      lessons: [
        L('Time words', [['aujourd’hui', 'today'], ['demain', 'tomorrow'], ['hier', 'yesterday'], ['maintenant', 'now'], ['tard', 'late']], ['[Aujourd’hui], il fait très chaud.', 'Today it is very warm.'], ['Demain, je n’ai pas le temps.', 'Tomorrow I have no time.']),
        L('Days', [['le lundi', 'Monday'], ['le vendredi', 'Friday'], ['le week-end', 'weekend'], ['la semaine', 'week'], ['le jour', 'day']], ['Le [vendredi], je vais au cinéma.', 'On Fridays I go to the cinema.'], ['Le week-end, je dors longtemps.', 'At the weekend I sleep in.']),
        L('Daily verbs', [['se lever', 'to get up'], ['travailler', 'to work'], ['dormir', 'to sleep'], ['aller', 'to go'], ['apprendre', 'to learn']], ['Je dois me [lever] tôt.', 'I have to get up early.'], ['Il travaille et elle apprend le français.', 'He works and she learns French.']),
        L('Places', [['l’école', 'school'], ['le cinéma', 'cinema'], ['le supermarché', 'supermarket'], ['la ville', 'city'], ['la gare', 'train station']], ['La [gare] est dans la ville.', 'The train station is in the city.'], ['Après l’école, nous allons au cinéma.', 'After school we go to the cinema.']),
      ],
    },
  ],
  A2: [
    {
      title: 'Faire les courses', sub: 'Shopping', emoji: '🛍️',
      tip: 'Partitive articles mean “some”: du (masculine), de la (feminine), de l’ (before a vowel). Je voudrais du pain et de la soupe.',
      lessons: [
        L('Shops', [['le magasin', 'shop'], ['le marché', 'market'], ['acheter', 'to buy'], ['vendre', 'to sell'], ['l’argent', 'money']], ['Je voudrais [acheter] du pain.', 'I would like to buy bread.'], ['Le marché ouvre à huit heures.', 'The market opens at eight o’clock.']),
        L('Prices', [['le prix', 'price'], ['cher', 'expensive'], ['bon marché', 'cheap'], ['la carte bancaire', 'bank card'], ['payer', 'to pay']], ['Le manteau est trop [cher].', 'The coat is too expensive.'], ['Puis-je payer par carte ?', 'Can I pay by card?']),
        L('Clothes', [['le pantalon', 'trousers'], ['la chemise', 'shirt'], ['la veste', 'jacket'], ['les chaussures', 'shoes'], ['porter', 'to wear']], ['J’ai besoin d’une nouvelle [veste].', 'I need a new jacket.'], ['Ces chaussures ne me vont pas.', 'These shoes do not fit me.']),
        L('Colours', [['rouge', 'red'], ['bleu', 'blue'], ['vert', 'green'], ['noir', 'black'], ['blanc', 'white']], ['La porte est [verte].', 'The door is green.'], ['Je voudrais la chemise bleue.', 'I would like the blue shirt.']),
      ],
    },
    {
      title: 'En voyage', sub: 'Getting around', emoji: '🚆',
      tip: 'Passé composé (spoken past): avoir or être + past participle. J’ai acheté du pain. Je suis allé à Paris.',
      lessons: [
        L('Transport', [['le train', 'train'], ['le bus', 'bus'], ['la voiture', 'car'], ['le vélo', 'bike'], ['l’avion', 'airplane']], ['Je vais à Lyon en [train].', 'I travel to Lyon by train.'], ['En ville, le vélo est plus rapide que la voiture.', 'In the city the bike is faster than the car.']),
        L('Station', [['l’aéroport', 'airport'], ['le billet', 'ticket'], ['la valise', 'suitcase'], ['le quai', 'platform'], ['le départ', 'departure']], ['Le train part du [quai] trois.', 'The train leaves from platform three.'], ['Où est ma valise ?', 'Where is my suitcase?']),
        L('Directions', [['à gauche', 'left'], ['à droite', 'right'], ['tout droit', 'straight ahead'], ['la rue', 'street'], ['le coin', 'corner']], ['Allez [tout droit], puis tournez à gauche.', 'Go straight ahead and then turn left.'], ['L’hôtel est au coin de la rue.', 'The hotel is on the corner of the street.']),
        L('Hotel', [['l’hôtel', 'hotel'], ['la réservation', 'reservation'], ['le petit-déjeuner', 'breakfast'], ['la clé', 'key'], ['rester', 'to stay']], ['Le [petit-déjeuner] est de sept à dix heures.', 'Breakfast is from seven to ten.'], ['Nous voudrions rester deux nuits.', 'We would like to stay two nights.']),
      ],
    },
    {
      title: 'Santé et loisirs', sub: 'Health & leisure', emoji: '🩺',
      tip: 'Modal verbs (pouvoir, devoir, vouloir) are followed by the infinitive: Je dois travailler aujourd’hui. To say something hurts, use J’ai mal à + body part.',
      lessons: [
        L('Body', [['la tête', 'head'], ['le bras', 'arm'], ['la jambe', 'leg'], ['le ventre', 'belly'], ['la main', 'hand']], ['J’ai mal à la [tête].', 'My head hurts.'], ['Il s’est blessé à la jambe.', 'He hurt his leg.']),
        L('At the doctor', [['le médecin', 'doctor'], ['malade', 'sick'], ['le médicament', 'medicine'], ['le rendez-vous', 'appointment'], ['la douleur', 'pain']], ['Je suis [malade] et je vais chez le médecin.', 'I am sick and am going to the doctor.'], ['J’ai besoin d’un rendez-vous pour demain.', 'I need an appointment for tomorrow.']),
        L('Weather', [['le temps', 'weather'], ['le soleil', 'sun'], ['la pluie', 'rain'], ['la neige', 'snow'], ['froid', 'cold']], ['Aujourd’hui, le [soleil] brille.', 'The sun is shining today.'], ['En hiver, il y a souvent de la neige.', 'In winter there is often snow.']),
        L('Hobbies', [['le loisir', 'hobby'], ['la musique', 'music'], ['nager', 'to swim'], ['lire', 'to read'], ['danser', 'to dance']], ['Mon [loisir] préféré, c’est la musique.', 'My favourite hobby is music.'], ['Le dimanche, j’aime nager dans le lac.', 'On Sundays I like swimming in the lake.']),
      ],
    },
    {
      title: 'Souvenirs et projets', sub: 'Past & plans', emoji: '🗓️',
      tip: 'Talk about the near future with aller + infinitive: L’année prochaine, je vais voyager en Italie.',
      lessons: [
        L('Looking back', [['la semaine dernière', 'last week'], ['déjà', 'already'], ['pas encore', 'not yet'], ['autrefois', 'back then'], ['il y a un an', 'a year ago']], ['J’ai [déjà] visité Berlin.', 'I have already visited Berlin.'], ['La semaine dernière, j’ai vu un film.', 'Last week I watched a film.']),
        L('Plans', [['prévoir', 'to plan'], ['visiter', 'to visit'], ['le voyage', 'trip'], ['les vacances', 'vacation'], ['espérer', 'to hope']], ['Nous [prévoyons] un voyage en Italie.', 'We are planning a trip to Italy.'], ['J’espère qu’il fera beau pendant les vacances.', 'I hope the weather will be nice during the vacation.']),
        L('Invitations', [['l’invitation', 'invitation'], ['inviter', 'to invite'], ['venir', 'to come'], ['malheureusement', 'unfortunately'], ['la fête', 'party']], ['Merci pour votre [invitation] !', 'Thanks for your invitation!'], ['Malheureusement, je n’ai pas le temps samedi.', 'Unfortunately I have no time on Saturday.']),
        L('Feelings', [['heureux', 'happy'], ['triste', 'sad'], ['fatigué', 'tired'], ['en colère', 'angry'], ['enthousiaste', 'enthusiastic']], ['Elle était [heureuse] parce qu’il avait téléphoné.', 'She was happy because he had called.'], ['Je suis très fatigué aujourd’hui.', 'I am very tired today.']),
      ],
    },
  ],
  B1: [
    {
      title: 'Opinions', sub: 'Opinions', emoji: '💬',
      tip: 'Parce que takes the indicative, but bien que takes the subjunctive: Bien qu’il soit fatigué, il travaille. Je pense que + indicative; Je ne pense pas que + subjunctive.',
      lessons: [
        L('Connectors', [['parce que', 'because'], ['bien que', 'although'], ['donc', 'therefore'], ['pourtant', 'nevertheless'], ['de plus', 'besides']], ['Je reste à la maison [parce que] je suis malade.', 'I am staying home because I am sick.'], ['Il est fatigué, pourtant il continue à travailler.', 'He is tired, nevertheless he keeps working.']),
        L('Agreeing', [['l’avis', 'opinion'], ['être d’accord', 'to agree'], ['contredire', 'to contradict'], ['convaincu', 'convinced'], ['douter', 'to doubt']], ['À mon [avis], c’est juste.', 'In my opinion this is right.'], ['Je ne suis pas convaincu que cela fonctionne.', 'I am not convinced that this will work.']),
        L('Probability', [['probablement', 'probably'], ['éventuellement', 'possibly'], ['certainement', 'definitely'], ['apparemment', 'apparently'], ['en fait', 'actually']], ['Il viendra [probablement] plus tard.', 'He will probably come later.'], ['En fait, je voulais venir plus tôt.', 'Actually I wanted to come earlier.']),
        L('Preferences', [['plutôt', 'rather'], ['surtout', 'above all'], ['préférer', 'to prefer'], ['la proposition', 'suggestion'], ['décider', 'to decide']], ['Je bois [plutôt] du thé que du café.', 'I drink tea rather than coffee.'], ['C’était difficile de se décider.', 'It was hard to decide.']),
      ],
    },
    {
      title: 'Le monde du travail', sub: 'Work life', emoji: '💼',
      tip: 'Relative pronouns: qui (subject), que (object), où (place). C’est le collègue qui travaille au bureau. After être, professions take no article: Elle est ingénieure.',
      lessons: [
        L('Professions', [['le métier', 'profession'], ['le professeur', 'teacher'], ['l’ingénieur', 'engineer'], ['l’infirmière', 'nurse'], ['l’employé', 'employee']], ['Mon [métier] me plaît beaucoup.', 'I like my profession a lot.'], ['Elle travaille comme ingénieure à Lyon.', 'She works as an engineer in Lyon.']),
        L('At the office', [['le bureau', 'office'], ['la réunion', 'meeting'], ['le collègue', 'colleague'], ['la tâche', 'task'], ['le délai', 'deadline']], ['J’ai une [réunion] à dix heures.', 'I have a meeting at ten o’clock.'], ['Le délai du projet se termine vendredi.', 'The project deadline ends on Friday.']),
        L('Applying', [['la candidature', 'application'], ['le CV', 'CV'], ['l’entretien', 'interview'], ['l’expérience', 'experience'], ['le poste', 'position']], ['J’écris une [candidature] pour le poste.', 'I am writing an application for the position.'], ['L’entretien s’est mieux passé que prévu.', 'The interview went better than expected.']),
        L('Pay & contracts', [['le salaire', 'salary'], ['la promotion', 'promotion'], ['les heures supplémentaires', 'overtime'], ['démissionner', 'to resign'], ['le contrat', 'contract']], ['J’ai signé mon [contrat].', 'I have signed my contract.'], ['Il a démissionné parce qu’il faisait trop d’heures supplémentaires.', 'He quit because he worked too much overtime.']),
      ],
    },
    {
      title: 'Médias et technologie', sub: 'Media & tech', emoji: '📱',
      tip: 'Passive voice: être + past participle. Le livre est lu par beaucoup de gens. French often prefers on instead: On parle français ici.',
      lessons: [
        L('Technology', [['l’ordinateur', 'computer'], ['le portable', 'mobile phone'], ['internet', 'internet'], ['le mot de passe', 'password'], ['télécharger', 'to download']], ['Mon [portable] n’a plus de batterie.', 'My phone has no battery left.'], ['J’ai téléchargé l’appli hier.', 'I downloaded the app yesterday.']),
        L('The news', [['les informations', 'news'], ['le journal', 'newspaper'], ['publier', 'to publish'], ['l’article', 'article'], ['la source', 'source']], ['Les [informations] commencent à huit heures.', 'The news begins at eight o’clock.'], ['L’article parle du climat.', 'The article is about the climate.']),
        L('Social media', [['la publication', 'post'], ['suivre', 'to follow'], ['partager', 'to share'], ['la vie privée', 'privacy'], ['accro', 'addicted']], ['J’ai [partagé] la publication avec des amis.', 'I shared the post with friends.'], ['Beaucoup d’adolescents sont accros à leur téléphone.', 'Many teenagers are addicted to their phones.']),
        L('Films & books', [['le film', 'film'], ['le roman', 'novel'], ['l’intrigue', 'plot'], ['l’acteur', 'actor'], ['recommander', 'to recommend']], ['Le film avait une [intrigue] passionnante.', 'The film had an exciting plot.'], ['Peux-tu me recommander un bon roman ?', 'Can you recommend a good novel to me?']),
      ],
    },
    {
      title: 'Voyages et culture', sub: 'Travel & culture', emoji: '🧳',
      tip: 'Polite requests use the conditional: Pourriez-vous m’aider ? Je voudrais un café. Vous is the safe choice with strangers.',
      lessons: [
        L('Delays', [['le retard', 'delay'], ['annuler', 'to cancel'], ['rater', 'to miss'], ['la correspondance', 'connection'], ['le contrôleur', 'ticket inspector']], ['Le train a dix minutes de [retard].', 'The train is ten minutes late.'], ['Malheureusement, j’ai raté ma correspondance.', 'Unfortunately I missed my connection.']),
        L('Complaints', [['se plaindre', 'to complain'], ['cassé', 'broken'], ['l’erreur', 'mistake'], ['le remboursement', 'refund'], ['remplacer', 'to replace']], ['La douche est [cassée].', 'The shower is broken.'], ['Je voudrais récupérer mon argent.', 'I would like to get my money back.']),
        L('Culture', [['la tradition', 'tradition'], ['le festival', 'festival'], ['la coutume', 'custom'], ['l’histoire', 'history, story'], ['la langue', 'language']], ['Chaque pays a sa propre [tradition].', 'Every country has its own tradition.'], ['Le festival a lieu chaque année en automne.', 'The festival takes place every year in autumn.']),
        L('Polite requests', [['pourriez-vous', 'could you'], ['je voudrais', 'I would like'], ['voudriez-vous', 'would you like'], ['je suis désolé', 'I am sorry'], ['merci beaucoup', 'many thanks']], ['[Pourriez-vous] m’aider, s’il vous plaît ?', 'Could you help me, please?'], ['Je suis désolé, je ne vous ai pas compris.', 'I am sorry, I did not understand you.']),
      ],
    },
  ],
  B2: [
    {
      title: 'Société', sub: 'Society', emoji: '🏛️',
      tip: 'The subjunctive follows expressions of necessity, will and emotion: Il faut que tu viennes. Je veux qu’il parte. Je suis content que vous soyez là.',
      lessons: [
        L('Society', [['la société', 'society'], ['le citoyen', 'citizen'], ['l’inégalité', 'inequality'], ['la communauté', 'community'], ['le droit', 'legal right']], ['Dans beaucoup de pays, les [inégalités] augmentent.', 'Inequalities are increasing in many countries.'], ['Tous les citoyens ont les mêmes droits.', 'All citizens have the same rights.']),
        L('Politics', [['le gouvernement', 'government'], ['l’élection', 'election'], ['la loi', 'law'], ['le parti', 'political party'], ['voter', 'to vote']], ['Le [gouvernement] a adopté une nouvelle loi.', 'The government has passed a new law.'], ['Tous les citoyens peuvent voter sur cette loi.', 'All citizens can vote on this law.']),
        L('Economy', [['l’économie', 'economy'], ['le chômage', 'unemployment'], ['l’inflation', 'inflation'], ['la croissance', 'growth'], ['l’impôt', 'tax']], ['Notre [économie] se redresse lentement.', 'Our economy is slowly recovering.'], ['Des impôts plus élevés freinent la croissance.', 'Higher taxes slow down growth.']),
        L('Education', [['l’éducation', 'education'], ['l’université', 'university'], ['les études', 'studies'], ['le diplôme', 'degree'], ['encourager', 'to promote']], ['Une bonne [éducation] ouvre beaucoup de portes.', 'Good education opens many doors.'], ['Après son diplôme, elle voudrait travailler à l’étranger.', 'After graduating she would like to work abroad.']),
      ],
    },
    {
      title: 'Environnement et avenir', sub: 'Environment & future', emoji: '🌍',
      tip: 'Unreal conditions: si + imparfait, then the conditional. Si j’avais le temps, je voyagerais plus. (If I had time, I would travel more.)',
      lessons: [
        L('Environment', [['l’environnement', 'environment'], ['le climat', 'climate'], ['les déchets', 'waste'], ['le recyclage', 'recycling'], ['la pollution', 'pollution']], ['Nous devons protéger notre [environnement].', 'We must protect our environment.'], ['La pollution des océans augmente.', 'The pollution of the oceans is increasing.']),
        L('Energy', [['l’énergie', 'energy'], ['renouvelable', 'renewable'], ['la consommation', 'consumption'], ['la centrale', 'power plant'], ['économiser', 'to save (energy)']], ['Nous devrions réduire notre [consommation].', 'We should reduce our consumption.'], ['Les énergies renouvelables remplacent peu à peu le charbon.', 'Renewable energies are slowly replacing coal.']),
        L('Science', [['la recherche', 'research'], ['la découverte', 'discovery'], ['l’étude', 'study'], ['prouver', 'to prove'], ['la théorie', 'theory']], ['La [recherche] montre de nouveaux résultats.', 'The research shows new results.'], ['L’étude prouve un lien clair.', 'The study proves a clear link.']),
        L('What if', [['si', 'if'], ['j’aurais', 'I would have'], ['je serais', 'I would be'], ['je pourrais', 'I could'], ['sinon', 'otherwise']], ['[Si] j’étais riche, je voyagerais.', 'If I were rich, I would travel.'], ['Sinon, le projet aurait échoué.', 'Otherwise the project would have failed.']),
      ],
    },
    {
      title: 'Argumenter', sub: 'Arguing a case', emoji: '⚖️',
      tip: 'Two-part connectors: à la fois … et (both … and), soit … soit (either … or), ni … ni (neither … nor).',
      lessons: [
        L('Contrasts', [['d’une part', 'on the one hand'], ['d’autre part', 'on the other hand'], ['cependant', 'however'], ['par conséquent', 'consequently'], ['au moins', 'at least']], ['[D’une part], c’est cher, d’autre part c’est pratique.', 'On the one hand it is expensive, on the other hand practical.'], ['Le résultat n’est cependant pas clair.', 'However, the result is not clear.']),
        L('Claims', [['affirmer', 'to claim'], ['nier', 'to deny'], ['étayer', 'to substantiate'], ['l’affirmation', 'assertion'], ['la preuve', 'proof']], ['Il [affirme] n’avoir rien su.', 'He claims to have known nothing.'], ['Cette thèse ne peut pas être étayée.', 'This thesis cannot be substantiated.']),
        L('Cause & effect', [['la cause', 'cause'], ['la conséquence', 'consequence'], ['provoquer', 'to cause'], ['entraîner', 'to bring about'], ['en raison de', 'due to']], ['La [cause] du problème n’est pas claire.', 'The cause of the problem is unclear.'], ['En raison de la tempête, le courant a été coupé.', 'Due to the storm the power was cut.']),
        L('Comparing', [['par rapport à', 'compared to'], ['semblable', 'similar'], ['différent', 'different'], ['au contraire', 'on the contrary'], ['alors que', 'whereas']], ['[Par rapport à] avant, c’est plus calme.', 'Compared to before it is quieter.'], ['Elle est sportive, alors que lui préfère lire.', 'She is sporty, whereas he prefers to read.']),
      ],
    },
    {
      title: 'Carrière et culture', sub: 'Career & culture', emoji: '🎭',
      tip: 'Formal French turns verbs into nouns: décider → la décision, négocier → la négociation. It is typical of written style.',
      lessons: [
        L('Leadership', [['la responsabilité', 'responsibility'], ['diriger', 'to lead'], ['le supérieur', 'supervisor'], ['la décision', 'decision'], ['la stratégie', 'strategy']], ['Elle porte la [responsabilité] de l’équipe.', 'She bears the responsibility for the team.'], ['La décision a été prise après une longue discussion.', 'The decision was made after a long discussion.']),
        L('Negotiating', [['négocier', 'to negotiate'], ['le compromis', 'compromise'], ['l’offre', 'offer'], ['rejeter', 'to reject'], ['fixer', 'to set (a date)']], ['Nous avons trouvé un [compromis].', 'We have found a compromise.'], ['L’offre a malheureusement été rejetée.', 'The offer was unfortunately rejected.']),
        L('The arts', [['l’art', 'art'], ['l’exposition', 'exhibition'], ['l’artiste', 'artist'], ['l’œuvre', 'work'], ['la critique', 'review']], ['La [critique] a salué l’œuvre de l’artiste.', 'The review praised the artist’s work.'], ['L’exposition ouvre la semaine prochaine.', 'The exhibition opens next week.']),
        L('Identity', [['l’origine', 'origin'], ['l’intégration', 'integration'], ['l’identité', 'identity'], ['émigrer', 'to emigrate'], ['varié', 'diverse']], ['Une bonne [intégration] demande du temps et de la patience.', 'Good integration takes time and patience.'], ['Paris est une ville très variée.', 'Paris is a very diverse city.']),
      ],
    },
  ],
  C1: [
    {
      title: 'Nuances', sub: 'Nuance', emoji: '🎯',
      tip: 'Discourse markers (justement, d’ailleurs, quand même, enfin) carry attitude rather than meaning. They rarely translate word for word, so learn them in sentences.',
      lessons: [
        L('Nuance words', [['la nuance', 'nuance'], ['indispensable', 'essential'], ['remarquable', 'remarkable'], ['peu à peu', 'gradually'], ['sans aucun doute', 'undoubtedly']], ['Il est [indispensable] de vérifier chaque détail.', 'It is essential to check every detail.'], ['Les résultats se sont améliorés peu à peu.', 'The results gradually improved.']),
        L('Discourse markers', [['justement', 'precisely'], ['d’ailleurs', 'by the way'], ['quand même', 'all the same'], ['enfin', 'well (correcting oneself)'], ['bref', 'in short']], ['C’est [justement] ce que je voulais dire.', 'That is precisely what I wanted to say.'], ['Viens quand même nous voir un de ces jours !', 'Do come and see us one of these days!']),
        L('Formal letters', [['Madame, Monsieur', 'dear Sir or Madam'], ['par la présente', 'hereby'], ['concernant', 'regarding'], ['ci-joint', 'enclosed'], ['cordialement', 'kind regards']], ['[Par la présente], je pose ma candidature au poste.', 'I hereby apply for the position.'], ['Ci-joint, vous trouverez mon CV.', 'Enclosed you will find my CV.']),
        L('Hedging', [['en quelque sorte', 'to a certain extent'], ['avoir tendance à', 'to tend to'], ['vraisemblablement', 'presumably'], ['approximativement', 'approximately'], ['présumé', 'presumed, suspected']], ['C’est [en quelque sorte] une exception.', 'That is to a certain extent an exception.'], ['Les prix ont tendance à continuer de monter.', 'Prices tend to keep rising.']),
      ],
    },
    {
      title: 'Langue académique', sub: 'Academic French', emoji: '🎓',
      tip: 'Academic style favours nouns and impersonal forms: Il convient de + infinitive, Il s’agit de + noun. Avoid je and on’s chatty feel in essays.',
      lessons: [
        L('Research', [['la thèse', 'thesis'], ['la méthode', 'method'], ['l’hypothèse', 'hypothesis'], ['le constat', 'finding'], ['la corrélation', 'correlation']], ['La [thèse] a été vérifiée de manière empirique.', 'The thesis was empirically tested.'], ['Ce constat change notre compréhension.', 'This finding changes our understanding.']),
        L('Analysis', [['analyser', 'to analyze'], ['remettre en question', 'to question'], ['examiner', 'to examine'], ['déduire', 'to deduce'], ['présupposer', 'to presuppose']], ['Il faut [analyser] chaque source de façon critique.', 'One should critically analyze every source.'], ['On peut en déduire une conclusion claire.', 'A clear conclusion can be deduced from this.']),
        L('Concessions', [['quoique', 'albeit'], ['entre-temps', 'meanwhile'], ['néanmoins', 'nonetheless'], ['dans la mesure où', 'insofar as'], ['malgré', 'despite']], ['[Quoique] le résultat surprenne, il est plausible.', 'Although the result is surprising, it is plausible.'], ['Malgré les critiques, elle a maintenu son plan.', 'Despite the criticism she stuck to her plan.']),
        L('Reported speech', [['selon', 'according to'], ['d’après', 'based on'], ['soi-disant', 'supposedly'], ['comme chacun sait', 'as is well known'], ['expliquer', 'to explain']], ['[Selon] le rapport, les prix augmentent.', 'According to the report prices are rising.'], ['Il a expliqué qu’il n’en avait rien su.', 'He explained that he had known nothing about it.']),
      ],
    },
    {
      title: 'Expressions idiomatiques', sub: 'Idioms', emoji: '🗣️',
      tip: 'Idioms are never translated word for word. “Poser un lapin” literally means “to put down a rabbit” and means to stand someone up.',
      lessons: [
        L('Body idioms', [['mettre les pieds dans le plat', 'to put your foot in it'], ['croiser les doigts', 'to keep your fingers crossed'], ['en avoir ras le bol', 'to be fed up'], ['avoir un poil dans la main', 'to be lazy'], ['avoir le cœur sur la main', 'to be generous']], ['Évite de [mettre les pieds dans le plat] encore une fois.', 'Avoid putting your foot in it once again.'], ['J’en ai ras le bol de ce bruit.', 'I am fed up with this noise.']),
        L('Animal idioms', [['poser un lapin', 'to stand someone up'], ['avoir un chat dans la gorge', 'to have a frog in your throat'], ['avoir le cafard', 'to feel down'], ['donner sa langue au chat', 'to give up guessing'], ['revenons à nos moutons', 'let’s get back to the point']], ['Il m’a [posé un lapin] hier soir.', 'He stood me up last night.'], ['Je donne ma langue au chat, dis-moi la réponse.', 'I give up, tell me the answer.']),
        L('Money & work', [['coûter les yeux de la tête', 'to cost an arm and a leg'], ['être fauché', 'to be broke'], ['se serrer la ceinture', 'to tighten your belt'], ['travailler d’arrache-pied', 'to work flat out'], ['donner un coup de main', 'to lend a hand']], ['Nous devons maintenant [nous serrer la ceinture].', 'We have to tighten our belts now.'], ['Ce sac coûte les yeux de la tête.', 'This bag costs an arm and a leg.']),
        L('Everyday idioms', [['ça m’est égal', 'I do not care'], ['taper sur les nerfs', 'to get on someone’s nerves'], ['tomber dans les pommes', 'to faint'], ['tuer le temps', 'to kill time'], ['filer à l’anglaise', 'to slip away']], ['Choisis ce que tu veux, ça m’est [égal].', 'Choose what you want, I do not care.'], ['Il me tape sur les nerfs avec ses questions.', 'He gets on my nerves with his questions.']),
      ],
    },
    {
      title: 'Style et rhétorique', sub: 'Style & rhetoric', emoji: '✒️',
      tip: 'The passé simple belongs to literary writing (il fut, elle dit, ils eurent). Spoken French and everyday writing use the passé composé instead.',
      lessons: [
        L('Rhetoric', [['convaincant', 'convincing'], ['concis', 'concise'], ['pertinent', 'relevant'], ['nuancé', 'nuanced'], ['cohérent', 'coherent']], ['Son argumentation était très [cohérente].', 'Her argumentation was very coherent.'], ['Il a formulé sa critique de façon concise et pertinente.', 'He formulated his criticism in a concise and relevant way.']),
        L('Abstract nouns', [['la portée', 'scope'], ['l’arbitraire', 'arbitrariness'], ['le paradoxe', 'paradox'], ['l’enjeu', 'what is at stake'], ['le préalable', 'prerequisite']], ['La [portée] de cette décision est énorme.', 'The scope of this decision is enormous.'], ['Le projet se situe entre l’éthique et le profit.', 'The project lies between ethics and profit.']),
        L('Precise verbs', [['nuire à', 'to harm'], ['illustrer', 'to illustrate'], ['surmonter', 'to overcome'], ['viser', 'to aim for'], ['négliger', 'to neglect']], ['Le bruit peut [nuire] à la concentration.', 'Noise can harm concentration.'], ['Ce graphique illustre clairement l’évolution.', 'This graph clearly illustrates the development.']),
        L('Ethics & change', [['la durabilité', 'sustainability'], ['le changement', 'change'], ['l’opportunité', 'opportunity'], ['le dilemme', 'dilemma'], ['peser', 'to weigh up']], ['Nous devons [peser] les opportunités et les risques.', 'We must weigh up opportunities and risks.'], ['La durabilité est la clé du changement.', 'Sustainability is the key to change.']),
      ],
    },
  ],
},
}
