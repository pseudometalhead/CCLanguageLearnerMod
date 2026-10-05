export type Pair = [target: string, english: string]
export type Lesson = { title: string; words: Pair[] }

export const COURSES: Record<string, Lesson[]> = {
  Spanish: [
    { title: 'Basics', words: [['hola', 'hello'], ['adiós', 'goodbye'], ['gracias', 'thank you'], ['por favor', 'please'], ['sí', 'yes'], ['no', 'no']] },
    { title: 'Food', words: [['agua', 'water'], ['pan', 'bread'], ['manzana', 'apple'], ['leche', 'milk'], ['queso', 'cheese'], ['pollo', 'chicken']] },
    { title: 'Travel', words: [['aeropuerto', 'airport'], ['hotel', 'hotel'], ['billete', 'ticket'], ['calle', 'street'], ['playa', 'beach'], ['maleta', 'suitcase']] },
  ],
  French: [
    { title: 'Basics', words: [['bonjour', 'hello'], ['au revoir', 'goodbye'], ['merci', 'thank you'], ["s'il vous plaît", 'please'], ['oui', 'yes'], ['non', 'no']] },
    { title: 'Food', words: [['eau', 'water'], ['pain', 'bread'], ['pomme', 'apple'], ['lait', 'milk'], ['fromage', 'cheese'], ['poulet', 'chicken']] },
    { title: 'Travel', words: [['aéroport', 'airport'], ['hôtel', 'hotel'], ['billet', 'ticket'], ['rue', 'street'], ['plage', 'beach'], ['valise', 'suitcase']] },
  ],
  German: [
    { title: 'Basics', words: [['hallo', 'hello'], ['tschüss', 'goodbye'], ['danke', 'thank you'], ['bitte', 'please'], ['ja', 'yes'], ['nein', 'no']] },
    { title: 'Food', words: [['Wasser', 'water'], ['Brot', 'bread'], ['Apfel', 'apple'], ['Milch', 'milk'], ['Käse', 'cheese'], ['Hähnchen', 'chicken']] },
    { title: 'Travel', words: [['Flughafen', 'airport'], ['Hotel', 'hotel'], ['Fahrkarte', 'ticket'], ['Straße', 'street'], ['Strand', 'beach'], ['Koffer', 'suitcase']] },
  ],
  Italian: [
    { title: 'Basics', words: [['ciao', 'hello'], ['arrivederci', 'goodbye'], ['grazie', 'thank you'], ['per favore', 'please'], ['sì', 'yes'], ['no', 'no']] },
    { title: 'Food', words: [['acqua', 'water'], ['pane', 'bread'], ['mela', 'apple'], ['latte', 'milk'], ['formaggio', 'cheese'], ['pollo', 'chicken']] },
    { title: 'Travel', words: [['aeroporto', 'airport'], ['albergo', 'hotel'], ['biglietto', 'ticket'], ['strada', 'street'], ['spiaggia', 'beach'], ['valigia', 'suitcase']] },
  ],
  Japanese: [
    { title: 'Basics', words: [['konnichiwa', 'hello'], ['sayonara', 'goodbye'], ['arigatou', 'thank you'], ['onegaishimasu', 'please'], ['hai', 'yes'], ['iie', 'no']] },
    { title: 'Food', words: [['mizu', 'water'], ['pan', 'bread'], ['ringo', 'apple'], ['gyuunyuu', 'milk'], ['chiizu', 'cheese'], ['toriniku', 'chicken']] },
    { title: 'Travel', words: [['kuukou', 'airport'], ['hoteru', 'hotel'], ['kippu', 'ticket'], ['michi', 'street'], ['kaigan', 'beach'], ['sutsukeesu', 'suitcase']] },
  ],
}
