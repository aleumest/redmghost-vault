// Decides whether a prompt is simple enough for the cheaper model.
// Deliberately conservative: when in doubt, the prompt stays on the main model.

const EASY = [
  /\btypo(s)?\b/i,
  /\brenam(e|ing)\b/i,
  /\bformat(ting)?\b/i,
  /\btidy\b/i,
  /\bspelling\b/i,
  /\btranslate\b/i,
  /\bcomment(s)?\b/i,
  /\brefuso\b/i,
  /\brinomina\b/i,
  /\bformatta\b/i,
  /\bsistema (gli )?spazi\b/i,
  /\btraduci\b/i,
  /\bcorreggi (l'|la |il |gli |i )?(errore|errori) di battitura\b/i,
]

const HARD = [
  /\bplan\b/i,
  /\barchitect/i,
  /\bdesign\b/i,
  /\bdebug/i,
  /\brefactor/i,
  /\bwhy\b/i,
  /\bimplement/i,
  /\bmigrat/i,
  /\bsecurity\b/i,
  /\bpianifica/i,
  /\bprogetta/i,
  /\bperch[eé]\b/i,
  /\bimplementa/i,
  /\bbug\b/i,
]

const MAX_EASY_LENGTH = 300

export type Route = 'cheap' | 'main'

export function classify(text: string): Route {
  const t = text.trim()
  if (t === '' || t.length > MAX_EASY_LENGTH) return 'main'
  if (HARD.some(re => re.test(t))) return 'main'
  return EASY.some(re => re.test(t)) ? 'cheap' : 'main'
}
