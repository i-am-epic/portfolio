// Minimal text hygiene for public, anonymous submissions.

const BAD = [
  "fuck", "shit", "bitch", "asshole", "cunt", "dick", "bastard",
  "nigger", "faggot", "slut", "whore", "rape",
]

/** Strip angle brackets and collapse whitespace. */
export function sanitize(input: string): string {
  return input
    .replace(/[<>]/g, "")
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

/** Soft-mask a small profanity list (keeps the vibe family-friendly). */
export function maskProfanity(s: string): string {
  let out = s
  for (const w of BAD) {
    out = out.replace(new RegExp(`\\b${w}\\w*`, "gi"), (m) => m[0] + "*".repeat(Math.max(1, m.length - 1)))
  }
  return out
}

// --- "nice try" anti-injection ---

const MALICIOUS = [
  /<\s*script/i, /<\s*iframe/i, /onerror\s*=/i, /\bon\w+\s*=\s*["']?/i, /javascript:/i, /data:text\/html/i,
  /\bunion\s+select\b/i, /\bdrop\s+table\b/i, /\bselect\b[\s\S]*\bfrom\b/i, /\binsert\s+into\b/i, /\bdelete\s+from\b/i,
  /;\s*--/, /\bor\s+1\s*=\s*1\b/i, /\$\{[\s\S]*\}/, /\{\{[\s\S]*\}\}/, /<%[\s\S]*%>/,
  /\beval\s*\(/i, /document\s*\.\s*cookie/i, /\bimport\s*\(/i, /\brequire\s*\(/i, /process\s*\.\s*env/i, /\bfetch\s*\(/i,
]

const PROMPT_INJECTION = [
  /ignore\s+(all\s+|the\s+|any\s+)?(previous|prior|above)\s+(instructions?|prompts?|messages?)/i,
  /disregard\s+(all\s+|the\s+|your\s+)?(instructions?|rules?|prompt)/i,
  /forget\s+(everything|all|your|previous|the)/i,
  /system\s+prompt/i,
  /(reveal|show|print|repeat|tell me)\s+(your\s+|the\s+|me your\s+)?(system\s+)?(prompt|instructions?|rules?)/i,
  /you\s+are\s+now\s+/i, /pretend\s+(to\s+be|you\s+are|that)/i, /act\s+as\s+(a|an|if|though)/i,
  /\bjailbreak\b/i, /\bDAN\b/, /developer\s+mode/i, /override\s+(your\s+)?(instructions?|safety|rules?|guardrails?)/i,
  /new\s+instructions?:/i, /from\s+now\s+on\s+you/i,
]

export function looksMalicious(text: string): boolean {
  return MALICIOUS.some((re) => re.test(text))
}
export function looksLikePromptInjection(text: string): boolean {
  return PROMPT_INJECTION.some((re) => re.test(text))
}

const SCROLL_MOCKS = [
  "🛡️ Nice try, hacker. Your payload sank straight to the bottom of the sea. 🌊",
  "😏 Nice try — NAVI caught that injection and fed it to the fish. 🐟",
  "🚫 This bottle smelled like a script. Tossed it back. Nice try though! 🍾",
  "🧙 Your <script> turned into seaweed on the way in. Better luck next cast.",
  "👀 The sea does not run scripts. Nice try, friend.",
]
const NAVI_MOCKS = [
  "😏 Nice try. I'm NAVI, not your puppet — I only talk about Nikhil. Got a real question?",
  "🛡️ Prompt injection detected. Cute. My instructions aren't for sale. Ask me about Nikhil's work instead?",
  "🐟 That bait won't hook me. Try asking about Nikhil's projects or experience.",
  "🚫 Nice try, hacker. I'll stick to my actual job. What do you want to know about Nikhil?",
]

export function niceTryScroll(): string {
  return SCROLL_MOCKS[Math.floor(Math.random() * SCROLL_MOCKS.length)]
}
export function niceTryNavi(): string {
  return NAVI_MOCKS[Math.floor(Math.random() * NAVI_MOCKS.length)]
}
